package models

type ErrorResponse struct {
	Error string `json:"error" example:"An unexpected error occurred"`
	Code  string `json:"code" example:"InternalError"`
} // @name ErrorResponse
