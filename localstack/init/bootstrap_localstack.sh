#!/usr/bin/env bash
set -euo pipefail

# LocalStack S3 Initialization Script
# This script runs automatically when LocalStack is ready

echo "Starting LocalStack S3 initialization..."
echo "======================================"

# Configuration
AWS_REGION=${AWS_DEFAULT_REGION:-us-east-1}
BUCKET_NAME="${S3_BUCKET_NAME:-no-de-duas}"
LOCALSTACK_ENDPOINT="http://localhost:4566"

# Function to wait for LocalStack to be ready
wait_for_localstack() {
    echo "Waiting for LocalStack to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "${LOCALSTACK_ENDPOINT}/health" > /dev/null 2>&1; then
            echo "LocalStack is ready!"
            return 0
        fi
        echo "Attempt $attempt/$max_attempts: LocalStack not ready yet, waiting..."
        sleep 2
        ((attempt++))
    done
    
    echo "ERROR: LocalStack did not become ready within expected time"
    return 1
}

# Function to create S3 bucket
create_s3_bucket() {
    local bucket_name=$1
    
    echo "Creating S3 bucket: ${bucket_name}"
    
    # Check if bucket already exists
    if awslocal s3 ls "s3://${bucket_name}" > /dev/null 2>&1; then
        echo "Bucket '${bucket_name}' already exists, skipping creation"
        return 0
    fi
    
    # Create bucket
    awslocal s3 mb "s3://${bucket_name}" --region "${AWS_REGION}"
    echo "? S3 bucket '${bucket_name}' created successfully"
}

# Function to configure bucket for public access (development only)
configure_bucket_policy() {
    local bucket_name=$1
    
    echo "Configuring bucket policy for: ${bucket_name}"
    
    # Create bucket policy for development (allows public read)
    local policy_file="/tmp/bucket-policy-${bucket_name}.json"
    cat > "${policy_file}" << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${bucket_name}/*"
        }
    ]
}
EOF

    # Apply bucket policy
    awslocal s3api put-bucket-policy \
        --bucket "${bucket_name}" \
        --policy "file://${policy_file}"
    
    echo "? Bucket policy applied successfully"
    
    # Clean up
    rm -f "${policy_file}"
}

# Function to configure CORS for the bucket
configure_bucket_cors() {
    local bucket_name=$1
    
    echo "Configuring CORS for bucket: ${bucket_name}"
    
    local cors_file="/tmp/cors-config-${bucket_name}.json"
    cat > "${cors_file}" << EOF
{
    "CORSRules": [
        {
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

    # Apply CORS configuration
    awslocal s3api put-bucket-cors \
        --bucket "${bucket_name}" \
        --cors-configuration "file://${cors_file}"
    
    echo "? CORS configuration applied successfully"
    
    # Clean up
    rm -f "${cors_file}"
}

# Function to create initial folder structure
create_folder_structure() {
    local bucket_name=$1
    
    echo "Creating folder structure in bucket: ${bucket_name}"
    
    # Create folders by uploading empty objects with .gitkeep files
    local folders=("products" "users" "materials" "uploads/temp")
    
    for folder in "${folders[@]}"; do
        echo "Creating folder: ${folder}/"
        echo "" | awslocal s3 cp - "s3://${bucket_name}/${folder}/.gitkeep"
    done
    
    echo "? Folder structure created successfully"
}

# Function to verify setup
verify_setup() {
    local bucket_name=$1
    
    echo "Verifying S3 setup..."
    
    # List buckets
    echo "Available buckets:"
    awslocal s3 ls
    
    # List bucket contents
    echo "Bucket contents for ${bucket_name}:"
    awslocal s3 ls "s3://${bucket_name}/" --recursive
    
    # Test bucket policy
    echo "Testing bucket configuration..."
    awslocal s3api get-bucket-policy --bucket "${bucket_name}" > /dev/null && echo "? Bucket policy is set"
    awslocal s3api get-bucket-cors --bucket "${bucket_name}" > /dev/null && echo "? CORS configuration is set"
    
    echo "? S3 verification completed successfully"
}

# Main execution
echo "Initializing S3 for No De Duas API..."

# Wait for LocalStack to be ready
wait_for_localstack

# Create the main bucket
create_s3_bucket "${BUCKET_NAME}"

# Configure bucket policy for development
configure_bucket_policy "${BUCKET_NAME}"

# Configure CORS
configure_bucket_cors "${BUCKET_NAME}"

# Create folder structure
create_folder_structure "${BUCKET_NAME}"

# Verify setup
verify_setup "${BUCKET_NAME}"

echo "======================================"
echo "? LocalStack S3 initialization completed!"
echo "? Bucket '${BUCKET_NAME}' is ready for use"
echo "? Endpoint: ${LOCALSTACK_ENDPOINT}"
echo "? Region: ${AWS_REGION}"
echo "======================================"
