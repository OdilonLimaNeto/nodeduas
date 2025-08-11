#!/bin/bash

# Database Seed Script
# Seeds the database with initial development data

echo "Seeding database with development data..."

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

# Run seed script inside container
echo "Running seed script..."
docker-compose exec api npm run prisma:seed

if [ $? -eq 0 ]; then
    echo "Database seeded successfully!"
else
    echo "Error seeding database!"
    exit 1
fi
