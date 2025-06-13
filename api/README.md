# Vault API

A secure API for storing and managing sensitive information (notes and attachments) with user authentication.

## Overview

Vault API is a Go-based application that provides a secure way to store and manage notes and their attachments. It features user authentication, note sharing capabilities, and secure file storage using AWS S3.

The project consists of two main components:
1. **API Service**: Handles user authentication, note CRUD operations, and generates pre-signed URLs for file uploads
2. **Ingest Service**: Processes file uploads to S3 and creates attachment records in the database

## Features

- User registration and authentication with JWT
- Create, read, update, and delete notes
- Attach files to notes
- Share notes with other users
- Swagger documentation for API endpoints
- Deployable as a standalone server or AWS Lambda function

## Prerequisites

- Go 1.23+
- PostgreSQL database
- AWS account (for S3 storage and Lambda deployment)
- Docker (optional, for containerized deployment)

## Installation

### Local Development

1. Clone the repository
2. Navigate to the api directory
3. Install dependencies:
   ```
   go mod download
   ```
4. Set up environment variables or configuration file for:
   - Database connection
   - JWT secret
   - AWS credentials
   - S3 bucket name

### Using Docker

Build the Docker image:
```
docker build -t vault-api .
```

Run the container:
```
docker run -p 8080:8080 -e MODE=local vault-api
```

## API Endpoints

### Authentication

- `POST /register` - Register a new user
- `POST /login` - Login and get authentication tokens
- `POST /refresh` - Refresh authentication token
- `GET /me` - Get current user information (protected)

### Notes

- `GET /notes` - Get all notes for the authenticated user (protected)
- `POST /notes` - Create a new note (protected)
- `GET /notes/:noteId` - Get a specific note (protected)
- `PUT /notes/:noteId` - Update a note (protected)
- `DELETE /notes/:noteId` - Delete a note (protected)

### Attachments

- `POST /notes/:noteId/attachments` - Get a pre-signed URL for uploading an attachment (protected)

### Other

- `GET /health` - Health check endpoint
- `GET /swagger/*` - Swagger documentation

## Development

### Running Locally

Run the API service:
```
go run cmd/api/main.go
```

The API will be available at http://localhost:8080

### Testing

Run tests:
```
go test ./...
```

### Generating Swagger Documentation

The API uses Swagger for documentation. To regenerate the Swagger docs:
```
swag init -g cmd/api/main.go
```

Or use the provided script:
```
./scripts/docs.sh
```

## Deployment

### AWS Lambda Deployment

The application can be deployed as AWS Lambda functions:

1. Build the Lambda functions:
   ```
   make build-VaultApiFunction
   make build-VaultIngestFunction
   ```

2. Deploy using AWS SAM or directly to Lambda

### Infrastructure as Code

The `infrastructure` directory contains configuration files for deploying the application:
- `api.yaml` - AWS SAM template
- `api.toml` - Configuration file

For detailed deployment instructions, configuration options, and infrastructure information, please refer to the [Infrastructure README](../infrastructure/README.md).

## License

MIT
