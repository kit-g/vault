package auth

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"vault/internal/db"
	"vault/internal/errors"
	"vault/internal/jwtx"
	"vault/internal/models"
)

// Register godoc
// @Summary Register a new user
// @Description Register using email, password, and username
// @Tags auth
// @Accept json
// @Produce json
// @Param input body models.UserIn true "user info"
// @Success 201 {object} models.UserOut
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /register [post]
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
// @Summary      Log in a user
// @Description  Authenticates a user and returns a JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        credentials  body      models.Login  true  "Login credentials"
// @Success      200          {object}  models.LoginOut
// @Failure      400          {object}  models.ErrorResponse  "Bad request"
// @Failure      401          {object}  models.ErrorResponse  "Unauthorized"
// @Failure      500          {object}  models.ErrorResponse  "Server error"
// @Router       /login [post]
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
// @Summary      Refresh access token
// @Description  Refreshes JWT access token using a refresh token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        refreshToken  body      map[string]string  true  "Refresh token payload"
// @Success      200            {object}  models.Session
// @Failure      400            {object}  models.ErrorResponse  "Bad request"
// @Failure      401            {object}  models.ErrorResponse  "Unauthorized"
// @Failure      500            {object}  models.ErrorResponse  "Server error"
// @Router       /refresh [post]
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

	userIDFloat, ok := claims["sub"].(float64)
	if !ok {
		return nil, errors.NewServerError(fmt.Errorf("invalid user ID in token"))
	}
	userID := uint(userIDFloat)

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
// @Summary      Get current user
// @Description  Returns the currently authenticated user's information
// @Tags         auth
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  models.UserOut
// @Failure      401  {object}  models.ErrorResponse  "Unauthorized"
// @Failure      500  {object}  models.ErrorResponse  "Server error"
// @Router       /me [get]
func Me(c *gin.Context) (any, error) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		return nil, errors.NewUnauthorizedError("User ID not found in context", nil)
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		return nil, errors.NewServerError(fmt.Errorf("invalid user ID type"))
	}

	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		return nil, errors.NewServerError(err)
	}

	return models.NewUserOut(user), nil
}
