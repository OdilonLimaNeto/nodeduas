#!/bin/bash

# Reset Development Environment Script
# WARNING: This will delete all data and containers

echo "WARNING: This will completely reset your development environment."
echo "All data in the database will be lost."
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Reset cancelled."
    exit 0
fi

echo "Resetting development environment..."

# Stop and remove containers, networks, and volumes
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Remove development images
echo "Removing development images..."
docker image prune -f

# Rebuild everything
echo "Rebuilding development environment..."
./scripts/dev-setup.sh

echo "Development environment has been completely reset."
