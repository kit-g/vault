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

func Router(origins string) *gin.Engine {
	r := gin.Default()

	r.Use(CORSMiddleware(origins))

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
	vaultGroup.GET("deleted", Authenticated(notes.GetDeletedNotes))
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

func CORSMiddleware(origins string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", origins)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
