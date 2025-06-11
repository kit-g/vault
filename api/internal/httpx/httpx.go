package httpx

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"vault/internal/errors"
	"vault/internal/models"
)

type Handler func(c *gin.Context) (any, error)

func Wrap(handler Handler) gin.HandlerFunc {
	return func(c *gin.Context) {
		result, err := handler(c)

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
}
