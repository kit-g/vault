# Vault Infrastructure

This directory contains the infrastructure as code (IaC) configuration for deploying the Vault application to AWS using the Serverless Application Model (SAM).

## Overview

The Vault application is deployed as a serverless application on AWS with the following components:

1. **API Lambda Function**: Handles API requests through API Gateway
2. **Ingest Lambda Function**: Processes file uploads to S3 and creates attachment records
3. **S3 Bucket**: Stores file attachments
4. **API Gateway**: Provides HTTP endpoints for the API
5. **IAM Policies**: Manages permissions for the Lambda functions

## Files

- `api.yaml`: AWS SAM template that defines all infrastructure resources
- `api.toml`: Configuration file for deployment parameters

## Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
- AWS account with appropriate permissions
- PostgreSQL database accessible from AWS Lambda

## Deployment

### Configuration

Before deploying, you need to update the `api.toml` file with your specific configuration:

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

### Deploy Using SAM CLI

You can deploy the application using the AWS SAM CLI directly:

```bash
sam build -t infrastructure/api.yaml
sam deploy --confirm-changeset --config-env dev --config-file infrastructure/api.toml
```

### Deploy Using Provided Script

Alternatively, use the provided script:

```bash
./scripts/sam.sh dev infrastructure/api.yaml infrastructure/api.toml
```

## Resources Created

The deployment creates the following AWS resources:

1. **S3 Bucket**: For storing file attachments
2. **IAM Managed Policy**: For S3 access permissions
3. **Lambda Functions**:
   - `vault-api`: Handles API requests
   - `vault-ingest`: Processes S3 events for new attachments
4. **API Gateway**:
   - REST API with proxy integration to the API Lambda function
   - Deployment and stage configuration

## Outputs

After deployment, the following outputs are available:

- **VaultApiUrl**: The URL of the deployed API
- **AttachmentBucket**: The name of the S3 bucket for attachments

You can view these outputs in the AWS CloudFormation console or by running:

```bash
aws cloudformation describe-stacks --stack-name vault --query "Stacks[0].Outputs"
```

## Security Considerations

- The template uses parameters for database credentials to avoid hardcoding sensitive information
- IAM policies follow the principle of least privilege
- API Gateway can be configured with additional authentication methods if needed

## Customization

To customize the deployment:

1. Modify `api.yaml` to add or change AWS resources
2. Update `api.toml` with different parameter values
3. For different environments, create additional configuration sections in `api.toml`

## Troubleshooting

If you encounter issues during deployment:

1. Check CloudFormation events in the AWS console
2. Verify that your AWS credentials have sufficient permissions
3. Ensure your database is accessible from Lambda functions
4. Check Lambda function logs in CloudWatch