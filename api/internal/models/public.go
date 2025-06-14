package models

import "github.com/google/uuid"

type PresignUploadRequest struct {
	Filename    string `json:"filename" binding:"required" example:"example.txt"`
	ContentType string `json:"content_type" binding:"required" example:"text/plain"`
} // @name PresignUploadRequest

type PresignUploadResponse struct {
	URL string `json:"url" example:"https://s3.com/upload?key=example.txt"`
	Key string `json:"key" example:"attachments/123e4567-e89b-12d3-a456-426614174000/example.txt"`
} //@name PresignUploadResponse

type PresignDownloadResponse struct {
	URL string `json:"url"`
} //@name PresignDownloadResponse

type ShareToUserRequest struct {
	SharedWith uuid.UUID `json:"shared_with" binding:"required" example:"123e4567-e89b-12d3-a456-426614174000"`
	Permission string    `json:"permission" binding:"required" example:"read"` // "read" or "write"
} // @name ShareToUserRequest
