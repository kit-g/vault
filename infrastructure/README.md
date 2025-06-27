# Vault Infrastructure

This directory contains the infrastructure as code (IaC) configuration for deploying the Vault application to AWS using the Serverless Application Model (SAM).

For a high-level overview of the entire project, please refer to the [main README](../README.md).

## Overview

The Vault application consists of two main components, each with its own infrastructure:

### API Infrastructure

The backend API is deployed as a serverless application on AWS with the following components:

1. **API Lambda Function**: Handles API requests through API Gateway
2. **Ingest Lambda Function**: Processes file uploads to S3 and creates attachment records
3. **S3 Bucket**: Stores file attachments
4. **API Gateway**: Provides HTTP endpoints for the API
5. **IAM Policies**: Manages permissions for the Lambda functions

### Web Infrastructure

The frontend web application is deployed with the following components:

1. **S3 Bucket**: Hosts the static web application files
2. **CloudFront Distribution**: Delivers content with low latency
3. **Origin Access Control**: Secures access to the S3 bucket
4. **Custom Error Responses**: Enables client-side routing for the SPA
5. **IAM Roles and Policies**: Allows GitHub Actions to deploy the application
6. **Optional Custom Domain**: Supports custom domain names with ACM certificates
7. **Firebase Authentication Integration**: Handles user authentication

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
- AWS account with appropriate permissions
- PostgreSQL database accessible from AWS Lambda

For details about the API application being deployed, please refer to the [API README](../api/README.md).

## Deployment

### API Deployment

#### API Configuration

Before deploying the API, you need to update the `api.toml` file with your specific configuration:

```toml
[dev.deploy.parameters]
stack_name = "vault"
s3_bucket = "<your-deployment-bucket>"
s3_prefix = "vault"
region = "<your-aws-region>"
profile = "<your-aws-profile>"
parameter_overrides = """
    Environment=\"dev\"
    DbHost=\"<your-db-host>\"
    DbPassword=\"<your-db-password>\"
    DbUser=\"<your-db-user>\"
"""
```

#### Deploy API Using SAM CLI

You can deploy the API using the AWS SAM CLI directly:

```bash
sam build -t infrastructure/api.yaml
sam deploy --confirm-changeset --config-env dev --config-file infrastructure/api.toml
```

#### Deploy API Using Provided Script

Alternatively, use the provided script:

```bash
./scripts/sam.sh dev infrastructure/api.yaml infrastructure/api.toml
```

### Web Deployment

#### Web Configuration

Before deploying the web application, update the `web.toml` file with your specific configuration:

```toml
[dev.deploy.parameters]
stack_name = "vault-web"
s3_bucket = "<your-deployment-bucket>"
s3_prefix = "vault-web"
region = "<your-aws-region>"
profile = "<your-aws-profile>"
parameter_overrides = """
    Environment=\"dev\"
    DomainName=\"<your-domain-name>\"
    AcmCertificateArn=\"<your-acm-certificate-arn>\"
    FileBucket=\"<your-file-bucket>\"
"""
```

#### Deploy Web Using SAM CLI

You can deploy the web application using the AWS SAM CLI directly:

```bash
sam build -t infrastructure/web.yaml
sam deploy --confirm-changeset --config-env dev --config-file infrastructure/web.toml
```

#### Deploy Web Using Provided Script

Alternatively, use the provided script:

```bash
./scripts/sam.sh dev infrastructure/web.yaml infrastructure/web.toml
```

## Resources Created

### API Resources

The API deployment creates the following AWS resources:

1. **S3 Bucket**: For storing file attachments
2. **IAM Managed Policy**: For S3 access permissions
3. **Lambda Functions**:
   - `vault-api`: Handles API requests
   - `vault-ingest`: Processes S3 events for new attachments
4. **API Gateway**:
   - REST API with proxy integration to the API Lambda function
   - Deployment and stage configuration

### Web Resources

The web deployment creates the following AWS resources:

1. **S3 Bucket**: For hosting the static web application files
2. **CloudFront Distribution**: For content delivery with low latency
3. **Origin Access Control**: For secure access to the S3 bucket
4. **S3 Bucket Policies**: For CloudFront access to S3 buckets
5. **GitHub OIDC Provider**: For GitHub Actions authentication
6. **IAM Role and Policies**: For GitHub Actions deployment permissions

