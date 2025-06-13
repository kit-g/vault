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
	r.POST("/register", Route(auth.Register))
	r.POST("/login", Route(auth.Login))
	r.POST("/refresh", Route(auth.Refresh))

	// Protected routes
	authGroup := r.Group("/")
	authGroup.Use(auth.AuthenticationMiddleware())
	authGroup.GET("/me", Authenticated(auth.Me))

	// notes
	vaultGroup := r.Group("/notes")
	vaultGroup.Use(auth.AuthenticationMiddleware())
	vaultGroup.GET("", Authenticated(notes.GetNotes))
	vaultGroup.POST("", Authenticated(notes.CreateNote))
	vaultGroup.GET("/:noteId", Authenticated(notes.GetNote))
	vaultGroup.PUT("/:noteId", Authenticated(notes.EditNote))
	vaultGroup.DELETE("/:noteId", Authenticated(notes.DeleteNote))
	// attachments
	vaultGroup.POST("/:noteId/attachments", Authenticated(notes.GetUploadURL))
	vaultGroup.GET("/:noteId/attachments/:attachmentId", Authenticated(notes.GetDownloadURL))
	vaultGroup.DELETE("/:noteId/attachments/:attachmentId", Authenticated(notes.DeleteAttachment))
	// share
	vaultGroup.POST("/:noteId/share", Authenticated(notes.ShareNoteToUser))

	return r
}
