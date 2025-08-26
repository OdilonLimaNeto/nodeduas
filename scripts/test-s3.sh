#!/bin/bash

# S3 Integration Test Script
# This script tests the LocalStack S3 integration

echo "Testing LocalStack S3 Integration..."
echo "===================================="

# Check if LocalStack is running
if ! curl -f http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo "ERROR: LocalStack is not running on port 4566"
    echo "Please run: ./scripts/dev-setup.sh"
    exit 1
fi

echo "? LocalStack is running"

# Test S3 service availability
echo ""
echo "Testing S3 service..."
if docker-compose exec localstack awslocal s3 ls > /dev/null 2>&1; then
    echo "? S3 service is available"
else
    echo "? S3 service is not available"
    exit 1
fi

# Test bucket existence
echo ""
echo "Testing bucket 'no-de-duas'..."
if docker-compose exec localstack awslocal s3 ls s3://no-de-duas > /dev/null 2>&1; then
    echo "? Bucket 'no-de-duas' exists"
    
    # List bucket contents
    echo ""
    echo "Bucket contents:"
    docker-compose exec localstack awslocal s3 ls s3://no-de-duas/ --recursive
else
    echo "? Bucket 'no-de-duas' does not exist"
    echo "Trying to create bucket..."
    
    if docker-compose exec localstack awslocal s3 mb s3://no-de-duas; then
        echo "? Bucket created successfully"
    else
        echo "? Failed to create bucket"
        exit 1
    fi
fi

# Test file upload
echo ""
echo "Testing file upload..."
echo "test content" > /tmp/test-file.txt

if docker-compose exec -T localstack awslocal s3 cp /dev/stdin s3://no-de-duas/test/test-file.txt < /tmp/test-file.txt; then
    echo "? File upload successful"
    
    # Test file download
    echo ""
    echo "Testing file download..."
    if docker-compose exec localstack awslocal s3 cp s3://no-de-duas/test/test-file.txt /tmp/downloaded-file.txt; then
        echo "? File download successful"
        
        # Clean up test file
        docker-compose exec localstack awslocal s3 rm s3://no-de-duas/test/test-file.txt
        echo "? Test file cleaned up"
    else
        echo "? File download failed"
    fi
else
    echo "? File upload failed"
    exit 1
fi

# Test presigned URL generation (via API if running)
echo ""
echo "Testing API S3 integration..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "? API is running"
    
    # Test health endpoint to verify S3 configuration
    echo "API health status:"
    curl -s http://localhost:3000/health | jq . || echo "Could not parse JSON response"
else
    echo "? API is not running, skipping API tests"
    echo "To test API integration, ensure the API is running with: ./scripts/dev-start.sh"
fi

# Clean up
rm -f /tmp/test-file.txt

echo ""
echo "===================================="
echo "S3 Integration Test Completed!"
echo "===================================="
echo ""
echo "LocalStack S3 Information:"
echo "Endpoint: http://localhost:4566"
echo "Bucket: no-de-duas"
echo "Region: us-east-1"
echo ""
echo "Useful debugging commands:"
echo "  List all buckets: docker-compose exec localstack awslocal s3 ls"
echo "  List bucket contents: docker-compose exec localstack awslocal s3 ls s3://no-de-duas/ --recursive"
echo "  View LocalStack logs: docker-compose logs localstack"
echo "  LocalStack health: curl http://localhost:4566/health"
echo "===================================="
