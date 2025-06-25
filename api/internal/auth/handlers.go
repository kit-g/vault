package auth

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"vault/internal/db"
	"vault/internal/errors"
	"vault/internal/firebasex"
	"vault/internal/jwtx"
	"vault/internal/models"
)

// Register godoc
//
//	@Summary		Register a new u
//	@Summary		Register a new user
//	@Description	Register using email, password, and username
//	@Tags			auth
//	@ID			    register
//	@Accept			json
//	@Produce		json
//	@Param			input	body		UserIn	true	"user info"
//	@Success		201		{object}	UserOut
//	@Failure		400		{object}	map[string]string
//	@Failure		409		{object}	map[string]string
//	@Router			/register [post]
func Register(c *gin.Context) (any, error) {
	var input models.UserIn

	if err := c.ShouldBindJSON(&input); err != nil {
		return nil, errors.NewValidationError(err)
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	if err != nil {
		return nil, errors.NewServerError(err)
	}

	user := &models.User{
		Email:    input.Email,
		Username: input.Username,
		Password: string(hashed),
	}

	if err := db.DB.Create(user).Error; err != nil {
		return nil, errors.NewConflictError("Email or username already in use", err)
	}

	response := &models.UserOut{
		ID:       user.ID,
		Email:    user.Email,
		Username: user.Username,
	}

	return response, nil
}

// Login godoc
//
//	@Summary		Log in a user
//	@Description	Authenticates a user and returns a JWT token
//	@Tags			auth
//	@ID			    login
//	@Accept			json
//	@Produce		json
//	@Param			credentials	body		Login	true	"Login credentials"
//	@Success		200			{object}	LoginOut
//	@Failure		400			{object}	ErrorResponse	"Bad request"
//	@Failure		401			{object}	ErrorResponse	"Unauthorized"
//	@Failure		500			{object}	ErrorResponse	"Server error"
//	@Router			/login [post]
func Login(c *gin.Context) (any, error) {
	var input models.Login

	if err := c.ShouldBindJSON(&input); err != nil {
		return nil, errors.NewValidationError(err)
	}

	var user models.User
	if err := db.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return nil, errors.NewUnauthorizedError("Invalid email or password", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, errors.NewUnauthorizedError("Invalid email or password", err)
	}

	token, err := jwtx.Generate(user.ID)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	refreshToken, err := jwtx.GenerateRefresh(user.ID)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewLoginOut(token, refreshToken, user), nil
}

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

	accessToken, err := jwtx.Generate(userID)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	refreshToken, err := jwtx.GenerateRefresh(userID)
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

	var user models.User
	result := db.DB.Where("firebase_uid = ?", firebaseToken.UID).First(&user)

	if result.Error != nil { // User does not exist, so create them
		newUser := models.User{
			Username:    firebaseToken.Claims["name"].(string),
			Email:       firebaseToken.Claims["email"].(string),
			FirebaseUID: firebaseToken.UID,
		}

		if createResult := db.DB.Create(&newUser); createResult.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
			return nil, err
		}
		user = newUser
	}

	token, err := jwtx.Generate(user.ID)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	refreshToken, err := jwtx.GenerateRefresh(user.ID)
	if err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewLoginOut(token, refreshToken, user), nil
}
