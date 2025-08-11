#!/bin/bash

# Prisma Migration Script
# Usage: ./scripts/migrate.sh <migration_name>

MIGRATION_NAME=$1

if [ -z "$MIGRATION_NAME" ]; then
    echo "Usage: ./scripts/migrate.sh <migration_name>"
    echo "Example: ./scripts/migrate.sh add_product_category"
    exit 1
fi

echo "Starting migration: $MIGRATION_NAME"

# Check if API container is running
if ! docker-compose ps api | grep -q "Up"; then
    echo "API container is not running. Starting development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d api
    
    # Wait for API to be ready
    echo "Waiting for API to be available..."
    until docker-compose exec api curl -f http://localhost:3000/health 2>/dev/null; do
        sleep 2
    done
fi

# Execute migration inside container
echo "Executing migration inside container..."
docker-compose exec api npx prisma migrate dev --name "$MIGRATION_NAME"

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "Migration '$MIGRATION_NAME' executed successfully!"
    
    # Regenerate Prisma client
    echo "Regenerating Prisma client..."
    docker-compose exec api npx prisma generate
    
    echo "Process completed!"
else
    echo "Error executing migration!"
    exit 1
fi
