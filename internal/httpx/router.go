package httpx

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"vault/internal/auth"
)

func Router() *gin.Engine {
	r := gin.Default()

	r.GET(
		"/health",
		func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "up"})
		},
	)
	// Public routes
	r.POST("/register", Wrap(auth.Register))
	r.POST("/login", Wrap(auth.Login))

	// Protected routes
	authGroup := r.Group("/")
	authGroup.Use(auth.AuthenticationMiddleware())
	authGroup.GET("/me", Wrap(auth.Me))
	return r
}
