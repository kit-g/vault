package auth

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"vault/internal/db"
	"vault/internal/errors"
	"vault/internal/firebasex"
	"vault/internal/jwtx"
	"vault/internal/models"
)

// Refresh godoc
//
//	@Summary		Refresh access token
//	@Description	Refreshes JWT access token using a refresh token
//	@Tags			auth
//	@ID			    refresh
//	@Accept			json
//	@Produce		json
//	@Param			refreshToken	body		map[string]string	true	"Refresh token payload"
//	@Success		200				{object}	Session
//	@Failure		400				{object}	ErrorResponse	"Bad request"
//	@Failure		401				{object}	ErrorResponse	"Unauthorized"
//	@Failure		500				{object}	ErrorResponse	"Server error"
//	@Router			/refresh [post]
func Refresh(c *gin.Context) (any, error) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		return nil, errors.NewValidationError(err)
	}

	claims, err := jwtx.Parse(input.RefreshToken)
	if err != nil || claims["type"] != "refresh" {
		return nil, errors.NewUnauthorizedError("Invalid refresh token", err)
	}

	userID, ok := claims["sub"].(uuid.UUID)
	if !ok {
		return nil, errors.NewServerError(fmt.Errorf("invalid user ID in token"))
	}

	accessToken, err := jwtx.Generate(userID, true)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	refreshToken, err := jwtx.GenerateRefresh(userID, true)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewSession(accessToken, refreshToken), nil
}

// Me godoc
//
//	@Summary		Get current user
//	@Description	Returns the currently authenticated user's information
//	@Tags			auth
//	@ID			    me
//	@Security		BearerAuth
//	@Produce		json
//	@Success		200	{object}	UserOut
//	@Failure		401	{object}	ErrorResponse	"Unauthorized"
//	@Failure		500	{object}	ErrorResponse	"Server error"
//	@Router			/me [get]
func Me(_ *gin.Context, userID uuid.UUID) (any, error) {
	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewUserOut(user), nil
}

// SignInWithFirebase godoc
//
//	@Summary		Sign in with Firebase
//	@Description	Authenticates a user using Firebase ID token and returns JWT tokens
//	@Tags			auth
//	@ID			    firebase-signin
//	@Accept			json
//	@Produce		json
//	@Param			input	body		FirebaseSignInRequest	true	"Firebase ID token"
//	@Success		200		{object}	LoginOut
//	@Failure		400		{object}	ErrorResponse	"Bad request"
//	@Failure		401		{object}	ErrorResponse	"Unauthorized"
//	@Failure		500		{object}	ErrorResponse	"Server error"
//	@Router			/firebase [post]
func SignInWithFirebase(c *gin.Context) (any, error) {
	var req models.FirebaseSignInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		return nil, errors.NewValidationError(err)
	}

	firebaseToken, err := firebasex.VerifyIDToken(req.IDToken)
	if err != nil {
		return nil, errors.NewValidationError(err)
	}

	emailVerified, ok := firebaseToken.Claims["email_verified"].(bool)

	if !ok {
		return nil, errors.NewForbiddenError("Invalid email verification status in token", nil)
	}

	var user models.User
	result := db.DB.Where("firebase_uid = ?", firebaseToken.UID).First(&user)

	if result.Error != nil { // User does not exist, so create them
		newUser := models.User{
			Username:    req.Username,
			Email:       firebaseToken.Claims["email"].(string),
			FirebaseUID: firebaseToken.UID,
		}

		if createResult := db.DB.Create(&newUser); createResult.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
			return nil, err
		}
		user = newUser
	}

	token, err := jwtx.Generate(user.ID, emailVerified)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	refreshToken, err := jwtx.GenerateRefresh(user.ID, emailVerified)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewLoginOut(token, refreshToken, user), nil
}
