package httpx

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"net/http"
	_ "vault/docs"
	"vault/internal/auth"
	"vault/internal/notes"
)

func Router() *gin.Engine {
	r := gin.Default()

	r.GET(
		"/health",
		func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "up"})
		},
	)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Public routes
	r.POST("/register", Wrap(auth.Register))
	r.POST("/login", Wrap(auth.Login))
	r.POST("/refresh", Wrap(auth.Refresh))

	// Protected routes
	authGroup := r.Group("/")
	authGroup.Use(auth.AuthenticationMiddleware())
	authGroup.GET("/me", Wrap(auth.Me))

	vaultGroup := r.Group("/notes")
	vaultGroup.Use(auth.AuthenticationMiddleware())
	vaultGroup.GET("", Wrap(notes.GetNotes))
	vaultGroup.POST("", Wrap(notes.CreateNote))
	vaultGroup.GET("/:noteId", Wrap(notes.GetNote))
	vaultGroup.PUT("/:noteId", Wrap(notes.EditNote))
	vaultGroup.DELETE("/:noteId", Wrap(notes.DeleteNote))
	return r
}
