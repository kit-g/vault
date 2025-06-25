//	@title			Vault API
//	@version		1.0
//	@description	A simple Secrets storage API
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	Kit
//	@contact.url	https://github.com/kit-g

//	@license.name	MIT
//	@license.url	https://opensource.org/licenses/MIT

// @host		localhost:8080
// @BasePath	/
package main

import (
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"log"
	"os"
	"vault/internal/awsx"
	"vault/internal/config"
	"vault/internal/db"
	"vault/internal/firebasex"
	"vault/internal/httpx"
	"vault/internal/jwtx"
	"vault/internal/models"
)

var cfg *config.Config

func Init() {
	var err error
	cfg, err = config.ApiConfig()

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
		return
	}

	if cfg.FirebaseConfig.Credentials != "" {
		if err := firebasex.Init(cfg.FirebaseConfig.Credentials); err != nil {
			log.Fatal("Failed to initialize Firebase client:", err)
		}
	}

	jwtx.Init(cfg.JWTSecret, cfg.AuthTokenLifespan, cfg.RefreshTokenLifespan)

	if err := db.Connect(&cfg.DBConfig); err != nil {
		log.Fatal("Failed to connect to DB:", err)
		return
	}

	if err := awsx.InitS3(cfg.AttachmentBucket, cfg.AwsRegion); err != nil {
		log.Fatal("Failed to initialize S3 client:", err)
		return
	}

	_ = db.DB.AutoMigrate(
		&models.User{},
		&models.Note{},
		&models.NoteShare{},
		&models.Attachment{},
	)
}

func main() {
	Init()
	r := httpx.Router(cfg.CORSOrigins)

	if cfg.SentryDSN != "" {
		r.Use(httpx.InitSentry(cfg.SentryDSN))
		log.Println("Sentry initialized")
	} else {
		log.Println("Sentry not configured, skipping initialization")
	}

	mode := os.Getenv("MODE")

	if mode == "lambda" {
		// Route Gin router with the Lambda adapter
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
