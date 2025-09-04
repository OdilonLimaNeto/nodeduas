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

# Validate migration name
if [[ ! "$MIGRATION_NAME" =~ ^[a-zA-Z0-9_]+$ ]]; then
    echo "Error: Migration name should only contain letters, numbers, and underscores"
    echo "Invalid name: $MIGRATION_NAME"
    exit 1
fi

# Check if API container is running
if ! docker-compose ps api | grep -q "Up"; then
    echo "API container is not running. Starting development environment..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d api
    
    # Wait for API to be ready
    echo "Waiting for API to be available..."
    until docker-compose exec api sh -c "curl -f http://localhost:3000/health" 2>/dev/null; do
        sleep 2
    done
fi

# Check Prisma directory permissions
echo "Checking Prisma directory permissions..."
docker-compose exec api sh -c "ls -la /app/prisma && ls -la /app/prisma/migrations 2>/dev/null || echo 'migrations directory does not exist'"

# Verify we can write to prisma directory
echo "Testing write permissions..."
if ! docker-compose exec api sh -c "touch /app/prisma/test_write && rm /app/prisma/test_write" 2>/dev/null; then
    echo "ERROR: Cannot write to prisma directory. Please check volume mounts in docker-compose.dev.yml"
    echo "Make sure ./prisma:/app/prisma is mounted without :ro flag"
    exit 1
fi

# Reset Prisma state if needed
echo "Checking Prisma state..."
docker-compose exec api npx prisma migrate status || {
    echo "Prisma state issues detected. Attempting to resolve..."
    docker-compose exec api npx prisma migrate resolve --applied "$(docker-compose exec api npx prisma migrate status 2>/dev/null | grep -o '[0-9]\{14\}_[a-zA-Z0-9_]*' | tail -1)" 2>/dev/null || true
}

# Execute migration inside container
echo "Executing migration inside container..."
docker-compose exec api npx prisma migrate dev --name "$MIGRATION_NAME" --skip-generate

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "Migration '$MIGRATION_NAME' executed successfully!"
    
    # Regenerate Prisma client
    echo "Regenerating Prisma client..."
    docker-compose exec api npx prisma generate
    
    echo "Process completed!"
else
    echo "Error executing migration!"
    echo "Attempting alternative migration approach..."
    
    # Try with force flag
    echo "Trying migration with --force-reset..."
    docker-compose exec api npx prisma migrate reset --force --skip-seed 2>/dev/null || true
    
    # Try migration again
    echo "Retrying migration..."
    docker-compose exec api npx prisma migrate dev --name "$MIGRATION_NAME" --skip-generate
    
    if [ $? -eq 0 ]; then
        echo "Migration '$MIGRATION_NAME' executed successfully on retry!"
        docker-compose exec api npx prisma generate
        echo "Process completed!"
    else
        echo "Migration failed even after reset. Please check your schema.prisma file."
        exit 1
    fi
fi
