# ?? No De Duas API - Development Setup

This project uses a containerized development environment with Docker and Docker Compose for consistent development across different machines.

## ?? Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git**

### Installing Prerequisites

#### Ubuntu/Debian:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Add your user to docker group (logout and login after this)
sudo usermod -aG docker $USER
```

#### macOS:

```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# Docker Compose is included with Docker Desktop
```

#### Windows:

```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop/

# Docker Compose is included with Docker Desktop
```

## ?? Quick Start (New Developer Onboarding)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd no-de-duas-api
```

### 2. Run the Setup Script

```bash
./scripts/dev-setup.sh
```

This script will:

- Check if Docker is installed and running
- Create environment configuration files
- Build Docker images
- Start all containers
- Run database migrations
- Seed the database with initial data
- Verify everything is working

### 3. Verify Installation

After setup completes, you should see:

```
API is available at: http://localhost:3000
Database is available at: localhost:5432
```

Test the API:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-08-10T12:00:00.000Z",
  "service": "no-de-duas-api"
}
```

## ??? Daily Development Workflow

### Starting Your Development Day

```bash
./scripts/dev-start.sh
```

### Stopping Development Environment

```bash
./scripts/dev-stop.sh
```

### Viewing Logs

```bash
# API logs
docker-compose logs -f api

# Database logs
docker-compose logs -f db

# All logs
docker-compose logs -f
```

### Making Database Changes

#### Creating a New Migration

```bash
# 1. Edit your schema in prisma/schema.prisma
# 2. Run migration script
./scripts/migrate.sh "describe_your_change"

# Examples:
./scripts/migrate.sh "add_user_profile"
./scripts/migrate.sh "update_product_fields"
```

#### Seeding Database with Fresh Data

```bash
./scripts/seed-db.sh
```

### Resetting Everything (Clean Slate)

```bash
./scripts/dev-reset.sh
```

**Warning**: This deletes all data and containers!

## ?? Project Structure

```
no-de-duas-api/
??? docker/
?   ??? Dockerfile              # Multi-stage Docker build
??? envs/
?   ??? .env.example           # Template for environment variables
?   ??? .env.dev               # Development environment (auto-created)
?   ??? .env.prod.example      # Production template
??? scripts/
?   ??? dev-setup.sh           # Initial setup script
?   ??? dev-start.sh           # Start development environment
?   ??? dev-stop.sh            # Stop development environment
?   ??? dev-reset.sh           # Reset everything
?   ??? migrate.sh             # Run database migrations
?   ??? seed-db.sh             # Seed database
?   ??? test-prisma.sh         # Test Prisma setup (New)
??? src/                       # Application source code
??? prisma/                    # Database schema and migrations
??? docker-compose.yml         # Base Docker Compose configuration
??? docker-compose.dev.yml     # Development overrides
??? docker-compose.prod.yml    # Production overrides
```

## ?? Environment Configuration

The application uses **automatic environment detection** with **Joi validation** to ensure all required configuration is present and valid.

### Environment File Loading

The application automatically loads the appropriate environment file based on `NODE_ENV`:

- **Development**: `envs/.env.dev` (or `envs/.env.development` if it exists)
- **Production**: `envs/.env.production` (required, fails if missing)
- **Fallback**: `envs/.env.dev` for development if specific file not found

### Environment Validation

All environment variables are validated on startup using Joi schema:

- **Required variables**: Must be present (DATABASE_URL, JWT secrets, AWS config)
- **Type validation**: Numbers, strings, enums are enforced
- **Security validation**: JWT secrets must be at least 32 characters
- **Range validation**: File sizes, image limits have min/max values
- **Format validation**: File types must be comma-separated extensions

### Development Environment (envs/.env.dev)

This file is automatically created during setup and contains development-specific configurations:

- Database connection to Docker container
- Longer JWT expiration times for convenience
- Debug logging enabled
- Development AWS credentials (mocked)
- **JWT secrets are 32+ characters** for validation compliance

### Production Environment (envs/.env.production)

Create this file based on `envs/.env.prod.example` for production deployment:

- Real database connection string
- **Secure JWT secrets (32+ characters)**
- Production AWS credentials
- Optimized logging levels
- **Never commit this file** - it's in .gitignore

### Validation Examples

```bash
# Startup with valid config
[CONFIG] Loading environment from: envs/.env.development
? Environment validation passed

# Startup with invalid config
? Environment validation failed:
  - "JWT_SECRET" length must be at least 32 characters long for security
  - "MAX_IMAGES_PER_PRODUCT" must be at least 1
  - "DATABASE_URL" is required
```

## ?? Troubleshooting

### Common Issues

#### 1. "Docker is not running"

```bash
# Check Docker status
docker info

# Start Docker (Linux)
sudo systemctl start docker

# Or restart Docker Desktop (Mac/Windows)
```

#### 2. "Port 3000 is already in use"

```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in envs/.env.dev
PORT=3001
```

#### 3. "Database connection failed"

```bash
# Check if database container is healthy
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

#### 4. "Hot reload not working"

This usually happens on Windows. Ensure:

- Docker Desktop has file sharing enabled for your project directory
- Windows Subsystem for Linux (WSL2) is being used

#### 5. "Permission denied" on scripts

```bash
# Make scripts executable
chmod +x scripts/*.sh
```

#### 6. Prisma Issues (Updated - Fixed in Current Version)

**Common Prisma errors and solutions:**

**"Unknown binaryTarget" or "Could not parse schema engine response":**

```bash
# This has been fixed in the current Docker setup
# If you encounter this, try rebuilding:
./scripts/dev-reset.sh
```

**"Prisma failed to detect libssl/openssl version":**

```bash
# These warnings are usually harmless in our Alpine setup
# The application will still work correctly
# To verify Prisma is working:
./scripts/test-prisma.sh
```

**"libquery_engine not found":**

```bash
# Regenerate Prisma client
docker-compose exec api npx prisma generate

# Check binary targets
docker-compose exec api npx prisma version
```

**Database seeding fails:**

```bash
# Check database connection first
docker-compose exec api npx prisma db execute --command "SELECT 1;"

# Regenerate and try again
docker-compose exec api npx prisma generate
./scripts/seed-db.sh
```

#### 7. Build Issues

**"Docker build fails":**

```bash
# Clean build with no cache
docker-compose build --no-cache

# Or reset everything
./scripts/dev-reset.sh
```

### Getting Help

1. **Check container status**: `docker-compose ps`
2. **View logs**: `docker-compose logs -f api`
3. **Restart everything**: `./scripts/dev-reset.sh`
4. **Check disk space**: Docker images can take significant space

## ?? Production Deployment

For production deployment:

1. Copy `envs/.env.prod.example` to `envs/.env.prod`
2. Fill in real production values
3. Use: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

The production setup includes:

- Resource limits and reservations
- Proper logging configuration
- Security optimizations
- Health checks

## ?? Development Tips

### Hot Reload

Your code changes are automatically reflected without restarting containers. The following directories are mounted:

- `./src` ? Hot reload for application code
- `./prisma` ? Database schema changes

### Database Access

Connect to the database directly using:

- **Host**: localhost
- **Port**: 5432
- **Database**: nodeduasapi
- **User**: postgres
- **Password**: password

### Debugging

The development container exposes port 9229 for Node.js debugging. Connect your IDE debugger to `localhost:9229`.

### Testing

Run tests inside the container:

```bash
docker-compose exec api npm test
```

### Prisma Testing (New)

Test Prisma setup and compatibility:

```bash
./scripts/test-prisma.sh
```

This script will:

- Check Prisma version and binary targets
- Test client generation
- Validate database connection
- Check OpenSSL compatibility
- Test schema validation
- Run seed script

## ?? Security Notes

- Never commit `.env.prod` files
- Development credentials are intentionally weak
- Production setup uses non-root user in containers
- Always use secrets management in production (AWS Secrets Manager, etc.)

---

**Need help?** Check the troubleshooting section above or contact the development team.
