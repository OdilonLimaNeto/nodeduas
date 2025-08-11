#!/bin/bash

# Test Prisma Setup Script
# This script tests if Prisma is working correctly in the container

echo "Testing Prisma setup..."

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "ERROR: Containers are not running. Please run ./scripts/dev-start.sh first"
    exit 1
fi

echo "1. Checking Prisma version and binary targets..."
docker-compose exec api npx prisma version

echo ""
echo "2. Testing Prisma client generation..."
docker-compose exec api npx prisma generate

echo ""
echo "3. Testing database connection..."
if docker-compose exec api npx prisma db execute --command "SELECT 1;"; then
    echo "? Database connection successful"
else
    echo "? Database connection failed"
fi

echo ""
echo "4. Testing Prisma schema validation..."
if docker-compose exec api npx prisma validate; then
    echo "? Schema validation successful"
else
    echo "? Schema validation failed"
fi

echo ""
echo "5. Checking OpenSSL compatibility..."
docker-compose exec api sh -c "openssl version && ldd /app/node_modules/.prisma/client/libquery_engine-*.so.node | head -10"

echo ""
echo "6. Testing seed script..."
if docker-compose exec api npm run prisma:seed; then
    echo "? Seed script successful"
else
    echo "? Seed script failed"
fi

echo ""
echo "Prisma setup test completed!"
