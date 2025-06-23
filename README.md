# Vault - Secure Note Storage System

Vault is a secure application for storing and managing sensitive information (notes and attachments) with user
authentication. It's built with Go and deployed as a serverless application on AWS. Check it
out [here](https://vault.awry.me).

## Project Overview

Vault allows users to:

- Create an account and securely authenticate
- Store and manage private notes
- Attach files to notes
- Share notes with other users
- Access their data through a secure API

The application is designed to be secure, scalable, and easy to deploy using infrastructure as code.

## Repository Structure

This repository is organized into the following directories:

- **[api/](api/)**: Contains the Go application code for the API and ingest services
- **[infrastructure/](infrastructure/)**: Contains AWS SAM templates and configuration for deploying to AWS
- **[scripts/](scripts/)**: Contains utility scripts for development and deployment

## Architecture

Vault uses a serverless architecture on AWS with the following components:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ API Gateway │────▶│ API Lambda  │────▶│  PostgreSQL │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │
                          ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  S3 Bucket  │────▶│Ingest Lambda│
                    └─────────────┘     └─────────────┘
```

- **API Gateway**: Provides HTTP endpoints for the API
- **API Lambda**: Handles API requests, user authentication, and note operations
- **S3 Bucket**: Stores file attachments
- **Ingest Lambda**: Processes file uploads to S3 and creates attachment records
- **PostgreSQL**: Stores user data, notes, and metadata

## Getting Started for Newcomers

### Prerequisites

- Basic knowledge of Go programming (for API development)
- Basic understanding of AWS services (for deployment)
- Go 1.23+ (for local development)
- AWS account (for deployment)
- PostgreSQL database

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/kit-g/vault.git
   cd vault
   ```

2. **Local Development**

   To run the API locally:
   ```bash
   cd api
   go mod download
   go run cmd/api/main.go
   ```

   The API will be available at http://localhost:8080

3. **Deployment to AWS**

   Configure your AWS credentials:
   ```bash
   aws configure
   ```

   Update the deployment configuration in `infrastructure/api.toml`

   Deploy using the provided script:
   ```bash
   ./scripts/sam.sh dev infrastructure/api.yaml infrastructure/api.toml
   ```

## Component Documentation

For more detailed information about specific components:

- **[API Documentation](api/README.md)**: Details about the API service, endpoints, and local development
- **[Infrastructure Documentation](infrastructure/README.md)**: Details about AWS deployment and infrastructure
  configuration

## For New Developers

If you're new to Go or AWS infrastructure:

1. **Learning Go**: The API code follows standard Go practices. Check out [Go by Example](https://gobyexample.com/) or
   the [official Go tour](https://tour.golang.org/) to learn more about Go.

2. **Understanding AWS SAM**: The infrastructure uses AWS Serverless Application Model (SAM). Check out
   the [AWS SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
   to learn more.

3. **Local Testing**: Start by running the API locally before attempting deployment to AWS.

## License

MIT