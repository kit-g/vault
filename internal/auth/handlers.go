package auth

import (
	"vault/internal/db"
	"vault/internal/errors"
	"vault/internal/models"

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

	token := "fake-jwt-token" // e.g. jwt.Generate(user.ID)

	return gin.H{
		"token": token,
		"user": models.UserOut{
			ID:       user.ID,
			Email:    user.Email,
			Username: user.Username,
		},
	}, nil
}
