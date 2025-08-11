#!/bin/bash

# Stop Development Environment Script

echo "Stopping development environment..."

# Stop containers but keep data
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

echo "Development environment stopped."
echo "Data is preserved. Use ./scripts/dev-start.sh to start again."
echo "To completely reset the environment, use ./scripts/dev-reset.sh"
