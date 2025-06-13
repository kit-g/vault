package awsx

import (
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

var S3 *s3.S3
var Bucket string
var Region string
var cfg aws.Config

func InitS3(bucket string, awsRegion string) error {
	Bucket = bucket
	Region = awsRegion

	cfg = aws.Config{
		Region: aws.String(Region),
	}

	sess, err := session.NewSession(&cfg)
	if err != nil {
		return fmt.Errorf("failed to create AWS session: %w", err)
	}

	S3 = s3.New(sess)
	return nil
}

func GeneratePresignedPutURL(key string, contentType string) (string, error) {
	req, _ := S3.PutObjectRequest(&s3.PutObjectInput{
		Bucket:      aws.String(Bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	})
	urlStr, err := req.Presign(15 * time.Minute)
	if err != nil {
		return "", fmt.Errorf("failed to sign request: %w", err)
	}
	return urlStr, nil
}

func GeneratePresignedGetURL(key string) (string, error) {
	sess, err := session.NewSession(&cfg)
	svc := s3.New(sess)

	input := s3.GetObjectInput{
		Bucket: aws.String(Bucket),
		Key:    aws.String(key),
	}

	req, _ := svc.GetObjectRequest(&input)
	url, err := req.Presign(15 * time.Minute)

	if err != nil {
		log.Println("Failed to sign request", err)
	}

	return url, nil
}
