package httpx

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"vault/internal/errors"
	"vault/internal/models"
)

type Handler func(c *gin.Context) (any, error)
type AuthHandler func(c *gin.Context, userID uuid.UUID) (any, error)

func Route(handler Handler) gin.HandlerFunc {
	return func(c *gin.Context) {
		runHandler(
			c,
			func() (any, error) {
				return handler(c)
			},
		)
	}
}

func Authenticated(handler AuthHandler) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userID not found in context"})
			return
		}

		userID, ok := raw.(uuid.UUID)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "userID has invalid type"})
			return
		}

		runHandler(c,
			func() (any, error) {
				return handler(c, userID)
			},
		)
	}
}

func runHandler(c *gin.Context, handler func() (any, error)) {
	result, err := handler()

	if result == models.NoContent {
		c.Status(http.StatusNoContent)
		return
	}

	if err != nil {
		switch e := err.(type) {
		case errors.HTTPError:
			c.Data(e.Status(), "application/json", e.JSON())
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}
