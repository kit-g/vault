package main

import (
	"log"
	"vault/internal/awsx"
	"vault/internal/config"
	"vault/internal/db"
	"vault/internal/httpx"
	"vault/internal/ingest"
)

func main() {

	log.Printf("Starting Vault Ingest - version: %s", httpx.String())

	cfg, err := config.NewIngestConfig()

	if err != nil {
		log.Fatalf("Configuration parsing failed: %v", err)
	}

	if err := db.Connect(&cfg.DBConfig); err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}

	if err := awsx.InitS3(cfg.AttachmentBucket, cfg.AwsRegion); err != nil {
		log.Fatal("Failed to initialize S3 client:", err)
		return
	}

	if err := ingest.Handle(); err != nil {
		log.Fatalf("Failed to handle S3 event: %v", err)
	}
}
