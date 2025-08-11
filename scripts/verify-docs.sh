#!/bin/bash

# Documentation Verification Script
# Checks if all documentation is up to date and accessible

echo "Verifying project documentation..."

# Check if all documentation files exist
docs=(
    "README.md"
    "DEVELOPMENT.md" 
    "CHANGELOG.md"
    "DOCKER.md"
)

echo "1. Checking documentation files..."
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo "? $doc exists"
    else
        echo "? $doc missing"
        exit 1
    fi
done

echo ""
echo "2. Checking scripts mentioned in documentation..."
scripts=(
    "scripts/dev-setup.sh"
    "scripts/dev-start.sh"
    "scripts/dev-stop.sh"
    "scripts/dev-reset.sh"
    "scripts/migrate.sh"
    "scripts/seed-db.sh"
    "scripts/test-prisma.sh"
)

for script in "${scripts[@]}"; do
    if [ -f "$script" ] && [ -x "$script" ]; then
        echo "? $script exists and is executable"
    else
        echo "? $script missing or not executable"
        exit 1
    fi
done

echo ""
echo "3. Checking Docker configuration..."
docker_files=(
    "docker/Dockerfile"
    "docker-compose.yml"
    "docker-compose.dev.yml"
    "docker-compose.prod.yml"
)

for file in "${docker_files[@]}"; do
    if [ -f "$file" ]; then
        echo "? $file exists"
    else
        echo "? $file missing"
        exit 1
    fi
done

echo ""
echo "4. Checking environment configuration..."
env_files=(
    "envs/.env.example"
    "envs/.env.dev"
    "envs/.env.prod.example"
)

for file in "${env_files[@]}"; do
    if [ -f "$file" ]; then
        echo "? $file exists"
    else
        echo "? $file missing"
        exit 1
    fi
done

echo ""
echo "5. Checking Prisma configuration..."
if grep -q 'binaryTargets = \["native", "linux-musl"\]' prisma/schema.prisma; then
    echo "? Prisma binary targets correctly configured"
else
    echo "? Prisma binary targets not correctly configured"
    exit 1
fi

echo ""
echo "==========================================="
echo "? All documentation verification passed!"
echo "==========================================="
echo ""
echo "Available documentation:"
echo "  ?? README.md - Quick start guide"
echo "  ???  DEVELOPMENT.md - Detailed development guide"
echo "  ?? CHANGELOG.md - Project history and changes"
echo "  ?? DOCKER.md - Docker configuration details"
echo ""
echo "Next steps:"
echo "  ./scripts/dev-setup.sh - Setup development environment"
echo "  ./scripts/test-prisma.sh - Test Prisma configuration"
