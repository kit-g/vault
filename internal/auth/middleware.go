package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"vault/jwtx"
)

func AuthenticationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid token"})
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		claims, err := jwtx.Parse(tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		c.Set("userID", uint(claims["sub"].(float64))) // Save user ID to context
		c.Next()
	}
}
