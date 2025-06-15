#!/bin/bash
# This script builds a React app and deploys it to an S3 bucket, then invalidates the CloudFront cache.
set -e

BUCKET_NAME="583168578067-vault-web"
DISTRIBUTION_ID="E2EKJGBU83AOIP"

echo "Deploying to bucket: $BUCKET_NAME"

echo "Building React app..."
npm run build

echo "Syncing files to S3..."
aws s3 sync ./dist s3://$BUCKET_NAME --delete --profile personal

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" --profile personal

echo "Deployment complete!"