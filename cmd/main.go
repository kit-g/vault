package main

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"vault/internal/auth"
	"vault/internal/config"
	"vault/internal/db"
	"vault/internal/httpx"
	"vault/internal/models"
)

func main() {
	r := gin.Default()

	cfg, err := config.Load()

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
		return
	}

	if err := db.Connect(cfg); err != nil {
		log.Fatal("Failed to connect to DB:", err)
		return
	}

	_ = db.DB.AutoMigrate(&models.User{})

	r.GET(
		"/health",
		func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "up"})
		},
	)

	r.POST("/register", httpx.Wrap(auth.Register))
	r.POST("/login", httpx.Wrap(auth.Login))

	err1 := r.Run(":8080")
	if err1 != nil {
		return
	}
	// localhost:8080
}
