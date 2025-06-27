package httpx

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"net/http"
	"strings"
	_ "vault/docs"
	"vault/internal/handlers"
	"vault/internal/middleware"
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
	r.POST("/refresh", Route(handlers.Refresh))
	r.POST("/firebase", Route(handlers.SignInWithFirebase))

	// Protected routes
	authGroup := r.Group("/")
	authGroup.Use(middleware.AuthenticationMiddleware())
	authGroup.GET("/me", Authenticated(handlers.Me))

	// notes
	vaultGroup := r.Group("/notes")
	vaultGroup.Use(middleware.AuthenticationMiddleware())
	vaultGroup.GET("", Authenticated(handlers.GetNotes))
	vaultGroup.POST("", Authenticated(handlers.CreateNote))
	vaultGroup.GET("deleted", Authenticated(handlers.GetDeletedNotes))
	vaultGroup.GET("/:noteId", Authenticated(handlers.GetNote))
	vaultGroup.PUT("/:noteId", Authenticated(handlers.EditNote))
	vaultGroup.DELETE("/:noteId", Authenticated(handlers.DeleteNote))
	vaultGroup.POST("/:noteId/restore", Authenticated(handlers.RestoreNote))
	vaultGroup.GET("/shared-with-me", Authenticated(handlers.SharedWithMe))
	// attachments
	vaultGroup.POST("/:noteId/attachments", Authenticated(handlers.GetUploadURL))
	vaultGroup.GET("/:noteId/attachments/:attachmentId", Authenticated(handlers.GetDownloadURL))
	vaultGroup.DELETE("/:noteId/attachments/:attachmentId", Authenticated(handlers.DeleteAttachment))
	vaultGroup.GET("/attachments", Authenticated(handlers.GetAttachments))
	// share
	vaultGroup.POST("/:noteId/share", Authenticated(handlers.ShareNoteToUser))
	vaultGroup.GET("/:noteId/share", Authenticated(handlers.GetNoteShares))
	vaultGroup.DELETE("/:noteId/shares/:userId", Authenticated(handlers.RevokeNoteShare))

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
