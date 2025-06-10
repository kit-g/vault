package auth

import (
	"fmt"
	"vault/internal/db"
	"vault/internal/errors"
	"vault/internal/models"
	"vault/jwtx"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

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

	return gin.H{
		"token": token,
		"user": models.UserOut{
			ID:       user.ID,
			Email:    user.Email,
			Username: user.Username,
		},
	}, nil
}

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

	return models.UserOut{
		ID:       user.ID,
		Email:    user.Email,
		Username: user.Username,
	}, nil
}
