package ingest

import (
	"context"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"log"
	"strings"
	"vault/internal/awsx"
	"vault/internal/db"
	"vault/internal/models"
)

func Handle() error {
	lambda.Start(handler)
	return nil
}

func skips(message string, v ...any) {
	log.Printf("[INGEST][SKIP]: "+message, v...)
}

func errors(message string, v ...any) {
	log.Fatalf("[INGEST][ERROR]: "+message, v...)

}

func handler(_ context.Context, s3Event events.S3Event) error {
	for _, record := range s3Event.Records {
		key := record.S3.Object.Key
		bucket := record.S3.Bucket.Name

		log.Printf("New S3 object: %s (bucket: %s)", key, bucket)

		// Only handle keys like: attachments/{noteId}/{filename}
		parts := strings.SplitN(key, "/", 3)
		if len(parts) != 3 {
			skips("Skipping invalid key: %s", key)
			continue
		}

		noteID, err := uuid.Parse(parts[1])
		if err != nil {
			errors("Incorrect note ID format %s: %v", noteID, err)
		}

		input := &s3.HeadObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(key),
		}
		head, err := awsx.S3.HeadObject(input)
		if err != nil {
			skips("Failed to fetch metadata for %s: %v", key, err)
			continue
		}

		filename := parts[2]
		mimeType := ""
		if head.ContentType != nil {
			mimeType = *head.ContentType
		}

		size := int64(0)
		if head.ContentLength != nil {
			size = *head.ContentLength
		}

		attachment := models.NewAttachment(noteID, filename, mimeType, size)

		if err := db.DB.Create(&attachment).Error; err != nil {
			errors("Failed to save attachment for key %s: %v", key, err)
		} else {
			log.Printf("Saved attachment: %s", key)
		}
	}

	return nil
}
