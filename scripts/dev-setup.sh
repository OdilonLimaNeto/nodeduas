#!/bin/bash

# Development Environment Setup Script
# This script sets up the complete development environment

echo "Setting up development environment..."

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "ERROR: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env.dev if it doesn't exist
if [ ! -f "./envs/.env.dev" ]; then
    echo "Creating .env.dev file..."
    cp ./envs/.env.example ./envs/.env.dev
    echo "IMPORTANT: Review and update ./envs/.env.dev with your specific configuration"
else
    echo ".env.dev already exists, skipping creation"
fi

# Set NODE_ENV for setup
export NODE_ENV=development

echo "Using NODE_ENV=$NODE_ENV for setup"

# Build development images
echo "Building Docker images for development..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

# Start the containers
echo "Starting development containers..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done

# Run Prisma migrations
echo "Running Prisma migrations..."
echo "Note: This may show OpenSSL warnings, but they are usually harmless"
if ! docker-compose exec api npx prisma migrate deploy; then
    echo "ERROR: Prisma migrations failed!"
    echo "Checking Prisma client status..."
    docker-compose exec api npx prisma version
    echo "Checking container logs..."
    docker-compose logs api
    exit 1
fi

# Generate Prisma client
echo "Generating Prisma client..."
if ! docker-compose exec api npx prisma generate; then
    echo "ERROR: Prisma client generation failed!"
    echo "Checking Prisma status..."
    docker-compose exec api npx prisma version
    echo "Checking container logs..."
    docker-compose logs api
    exit 1
fi

# Run database seed
echo "Seeding database with initial data..."
echo "Note: This may show OpenSSL warnings, but they are usually harmless"
if ! docker-compose exec api npm run prisma:seed; then
    echo "ERROR: Database seeding failed!"
    echo "Checking database connection..."
    docker-compose exec api npx prisma db execute --command "SELECT 1;"
    echo "Checking container logs..."
    docker-compose logs api
    exit 1
fi

# Wait for API to be ready
echo "Waiting for API to be ready..."
until curl -f http://localhost:3000/health > /dev/null 2>&1; do
    sleep 2
done

echo ""
echo "==================================="
echo "Development environment is ready!"
echo "==================================="
echo "API is available at: http://localhost:3000"
echo "Database is available at: localhost:5432"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f api"
echo "  Stop environment: ./scripts/dev-stop.sh"
echo "  Reset environment: ./scripts/dev-reset.sh"
echo "==================================="
