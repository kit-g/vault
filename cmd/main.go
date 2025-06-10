// @title Vault API
// @version 1.0
// @description A simple Secrets storage API
// @termsOfService http://swagger.io/terms/

// @contact.name Kit
// @contact.url https://github.com/kit-g

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /
package main

import (
	"log"
	"vault/internal/config"
	"vault/internal/db"
	"vault/internal/httpx"
	"vault/internal/jwtx"
	"vault/internal/models"
)

func main() {

	cfg, err := config.Load()

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
		return
	}

	jwtx.Init(cfg.JWTSecret)

	if err := db.Connect(cfg); err != nil {
		log.Fatal("Failed to connect to DB:", err)
		return
	}

	_ = db.DB.AutoMigrate(&models.User{})

	r := httpx.Router()

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
