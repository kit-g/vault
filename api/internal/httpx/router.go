package httpx

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"net/http"
	"strings"
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

	r.GET(
		"/version",
		func(c *gin.Context) {
			c.JSON(http.StatusOK, Info())
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
	vaultGroup.POST("/:noteId/restore", Authenticated(notes.RestoreNote))
	// attachments
	vaultGroup.POST("/:noteId/attachments", Authenticated(notes.GetUploadURL))
	vaultGroup.GET("/:noteId/attachments/:attachmentId", Authenticated(notes.GetDownloadURL))
	vaultGroup.DELETE("/:noteId/attachments/:attachmentId", Authenticated(notes.DeleteAttachment))
	vaultGroup.GET("/attachments", Authenticated(notes.GetAttachments))
	// share
	vaultGroup.POST("/:noteId/share", Authenticated(notes.ShareNoteToUser))
	vaultGroup.GET("/:noteId/share", Authenticated(notes.GetNoteShares))
	vaultGroup.DELETE("/:noteId/share/:userId", Authenticated(notes.RevokeNoteShare))

	return r
}

// CORSMiddleware returns a Gin middleware that handles CORS requests.
func CORSMiddleware(origins string) gin.HandlerFunc {
	parsed := allowedOrigins(origins)
	originSet := make(map[string]struct{}, len(parsed))
	for _, o := range parsed {
		originSet[o] = struct{}{}
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if _, ok := originSet[origin]; ok {
			corsHeaders(c, origin)
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func allowedOrigins(origins string) []string {
	var result []string
	for _, o := range strings.Split(origins, ",") {
		trimmed := strings.TrimSpace(o)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func corsHeaders(c *gin.Context, origin string) {
	c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
	c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
}
