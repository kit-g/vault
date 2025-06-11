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
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"log"
	"os"
	"vault/internal/config"
	"vault/internal/db"
	"vault/internal/httpx"
	"vault/internal/jwtx"
)

func Init() {
	cfg, err := config.Load()

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
		return
	}

	jwtx.Init(cfg.JWTSecret, cfg.AuthTokenLifespan, cfg.RefreshTokenLifespan)

	if err := db.Connect(cfg); err != nil {
		log.Fatal("Failed to connect to DB:", err)
		return
	}

	//_ = db.DB.AutoMigrate(
	//	&models.User{},
	//	&models.Note{},
	//	&models.NoteShare{},
	//	&models.Attachment{},
	//)
}

func main() {
	Init()
	r := httpx.Router()

	mode := os.Getenv("MODE")

	if mode == "lambda" {
		// Wrap Gin router with the Lambda adapter
		log.Println("Running in Lambda mode...")
		lambda.Start(ginadapter.New(r).ProxyWithContext)
	} else {
		// Default: local dev mode
		log.Println("Running in local mode on :8080...")
		if err := r.Run(":8080"); err != nil {
			log.Fatal("Server failed to start:", err)
		}
	}
}
