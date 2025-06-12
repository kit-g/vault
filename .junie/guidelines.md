# Vault API Development Guidelines

This document provides essential information for developers working on the Vault API project.

## Build and Configuration Instructions

### Local Development

1. **Environment Setup**:
   - Go 1.23.0 or later is required
   - PostgreSQL database
   - AWS credentials with S3 access

2. **Environment Variables**:
   The application is configured through environment variables:
   ```
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=vault
   DB_SSLMODE=disable
   
   # JWT
   JWT_SECRET=your_secret_key
   AUTH_TOKEN_LIFESPAN=180  # 3 hours in minutes
   REFRESH_TOKEN_LIFESPAN=100800  # 10 weeks in minutes
   
   # AWS
   REGION=us-west-2
   ATTACHMENT_BUCKET=your-s3-bucket
   
   # Application
   APP_NAME=vault-api
   MODE=local  # Use 'lambda' for AWS Lambda deployment
   ```

3. **Running Locally**:
   ```bash
   cd api
   go run cmd/main.go
   ```
   The API will be available at http://localhost:8080

4. **Building for AWS Lambda**:
   ```bash
   cd api
   GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bootstrap ./cmd/main.go
   ```

### Docker Deployment

1. **Building the Docker Image**:
   ```bash
   cd api
   docker build -t vault-api .
   ```

2. **Running with Docker**:
   ```bash
   docker run -p 8080:8080 --env-file .env vault-api
   ```

## Testing Information

### Running Tests

1. **Running All Tests**:
   ```bash
   cd api
   go test ./...
   ```

2. **Running Tests for a Specific Package**:
   ```bash
   cd api
   go test ./internal/jwtx -v
   ```

3. **Running Tests with Coverage**:
   ```bash
   cd api
   go test ./... -cover
   ```

### Writing Tests

1. **Test File Naming**:
   - Test files should be named `*_test.go` and placed in the same package as the code being tested.

2. **Test Function Naming**:
   - Test functions should be named `Test<FunctionName>` for unit tests.
   - Use `TestIntegration<Feature>` for integration tests.

3. **Example Test**:
   Here's an example test for the JWT package:

   ```go
   package jwtx

   import (
       "testing"
       "time"
   )

   func TestJWTGenerateAndParse(t *testing.T) {
       // Initialize with test values
       testSecret := "test-secret-key"
       testAuthLifespan := 60 // 60 minutes
       testRefreshLifespan := 1440 // 24 hours
       
       Init(testSecret, testAuthLifespan, testRefreshLifespan)
       
       // Test user ID
       var userID uint = 123
       
       // Generate a token
       token, err := Generate(userID)
       if err != nil {
           t.Fatalf("Failed to generate token: %v", err)
       }
       
       // Parse the token
       claims, err := Parse(token)
       if err != nil {
           t.Fatalf("Failed to parse token: %v", err)
       }
       
       // Verify the claims
       if claims["sub"] != float64(userID) {
           t.Errorf("Expected user ID %v, got %v", userID, claims["sub"])
       }
   }
   ```

## Development Guidelines

### Code Structure

1. **Package Organization**:
   - The project follows a domain-driven design approach
   - Core packages:
     - `auth`: Authentication and authorization
     - `notes`: Note management
     - `models`: Data models
     - `httpx`: HTTP utilities
     - `jwtx`: JWT utilities
     - `db`: Database connection
     - `awsx`: AWS utilities
     - `config`: Configuration loading

2. **Handler Pattern**:
   - API handlers use a custom pattern with the `httpx.Wrap` function
   - Handlers return a result and an error, rather than directly writing to the response
   - Example:
     ```go
     func MyHandler(c *gin.Context) (any, error) {
         // Business logic here
         return result, nil
     }
     
     // In router:
     r.GET("/path", httpx.Wrap(MyHandler))
     ```

3. **Error Handling**:
   - Use the `errors.HTTPError` interface for HTTP-specific errors
   - The `httpx.Wrap` function handles error responses automatically

### API Documentation

1. **Swagger**:
   - API documentation is generated using Swagger
   - Access the Swagger UI at http://localhost:8080/swagger/index.html
   - Update documentation by modifying the Swagger annotations in the code

2. **Generating Swagger Docs**:
   ```bash
   cd api
   ../scripts/docs.sh
   ```

### Deployment

1. **AWS Lambda**:
   - The application is designed to run on AWS Lambda
   - Set `MODE=lambda` environment variable for Lambda deployment
   - Use the SAM CLI for local testing of Lambda functions:
     ```bash
     ../scripts/sam.sh
     ```

2. **Infrastructure**:
   - Infrastructure configuration is in the `infrastructure` directory
   - `api.yaml` contains the AWS SAM template
   - `api.toml` contains additional configuration