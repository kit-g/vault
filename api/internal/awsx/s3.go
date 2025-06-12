package awsx

import (
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

var S3 *s3.S3
var Bucket string

func InitS3(bucket string, awsRegion string) error {
	Bucket = bucket
	region := awsRegion

	config := aws.Config{
		Region: aws.String(region),
	}

	sess, err := session.NewSession(&config)
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
