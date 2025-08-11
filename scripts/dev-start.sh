#!/bin/bash

# Start Development Environment Script

echo "Starting development environment..."

# Check if .env.dev exists
if [ ! -f "./envs/.env.dev" ]; then
    echo "ERROR: .env.dev file not found."
    echo "Please run ./scripts/dev-setup.sh first"
    exit 1
fi

# Set NODE_ENV for development
export NODE_ENV=development

echo "Using NODE_ENV=$NODE_ENV"

# Start containers
echo "Starting containers..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done

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
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f api"
echo "  View database logs: docker-compose logs -f db"
echo "  Stop environment: ./scripts/dev-stop.sh"
echo "==================================="
