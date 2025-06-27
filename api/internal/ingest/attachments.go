package ingest

import (
	"context"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/google/uuid"
	"log"
	"net/url"
	"strings"
	"vault/internal/awsx"
	"vault/internal/config"
	"vault/internal/db"
	"vault/internal/models"
)

const maxUploadSize = 10 * 1024 * 1024 // 10 MB

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
	cfg, err := config.NewIngestConfig()
	if err != nil {
		errors("Failed to load ingest config: %v", err)
		return err // fatal
	}

	distribution := cfg.DistributionAlias

	for _, record := range s3Event.Records {
		key := record.S3.Object.Key
		bucket := record.S3.Bucket.Name

		log.Printf("New S3 object: %s (bucket: %s)", key, bucket)

		decoded, err := url.QueryUnescape(key)
		if err != nil {
			errors("Failed to decode S3 key %s: %v", key, err)
			continue
		}

		// Key parts determine the upload type.
		// Attachments: "attachments/{noteId}/{filename}" (3 parts)
		// Avatars: "avatars/{userId}" (2 parts)
		parts := strings.Split(decoded, "/")

		if len(parts) < 2 { // Must have at least a prefix and an ID
			skips("Skipping invalid key format: %s", decoded)
			continue
		}

		uploadType := parts[0]

		input := &s3.HeadObjectInput{
			Bucket: aws.String(bucket),
			Key:    aws.String(decoded),
		}
		head, err := awsx.S3.HeadObject(input)
		if err != nil {
			skips("Failed to fetch metadata for %s: %v", decoded, err)
			continue
		}

		size := int64(0)
		if head.ContentLength != nil {
			size = *head.ContentLength
		}

		if size > maxUploadSize {
			log.Printf("File %s exceeds size limit (%d > %d). Deleting.", decoded, size, maxUploadSize)
			request := &s3.DeleteObjectInput{Bucket: aws.String(bucket), Key: aws.String(decoded)}
			if _, err := awsx.S3.DeleteObject(request); err != nil {
				errors("Failed to delete oversized file %s: %v", decoded, err)
			} else {
				log.Printf("Successfully deleted oversized file: %s", decoded)
			}
			continue
		}

		switch uploadType {
		case "attachments":
			if len(parts) != 3 {
				skips("Skipping invalid attachment key (expected 3 parts): %s", decoded)
				continue
			}
			handleAttachmentUpload(parts, decoded, head)
		case "avatars":
			if len(parts) != 2 {
				skips("Skipping invalid avatar key (expected 2 parts): %s", decoded)
				continue
			}
			handleAvatarUpload(parts, decoded, distribution)
		default:
			skips("Skipping unrecognized upload type for key: %s", decoded)
		}
	}

	return nil
}

// handleAttachmentUpload contains the original logic for note attachments
func handleAttachmentUpload(parts []string, key string, head *s3.HeadObjectOutput) {
	noteID, err := uuid.Parse(parts[1])
	if err != nil {
		errors("Incorrect note ID format in key %s: %v", key, err)
		return
	}

	filename := parts[2]
	mimeType := aws.StringValue(head.ContentType)
	size := aws.Int64Value(head.ContentLength)

	attachment := models.NewAttachment(noteID, filename, mimeType, size)

	if err := db.DB.Create(&attachment).Error; err != nil {
		errors("Failed to save attachment for key %s: %v", key, err)
	} else {
		log.Printf("Successfully saved attachment: %s", key)
	}
}

func handleAvatarUpload(parts []string, key string, distributionAlias string) {
	userID, err := uuid.Parse(parts[1])
	if err != nil {
		errors("Incorrect user ID format in key %s: %v", key, err)
		return
	}

	// full public URL using the CloudFront distribution
	finalURL := fmt.Sprintf("https://%s/%s", distributionAlias, key)

	result := db.DB.Model(&models.User{}).Where("id = ?", userID).Update("avatar_url", finalURL)

	if result.Error != nil {
		errors("Failed to update avatar URL for user %s: %v", userID, result.Error)
		return
	}

	if result.RowsAffected == 0 {
		errors("Attempted to update avatar for user %s, but user was not found.", userID)
		return
	}

	log.Printf("Successfully updated avatar for user %s. New URL: %s", userID, finalURL)
}
