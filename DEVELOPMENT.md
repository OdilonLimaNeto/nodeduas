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
??? localstack/                # LocalStack configuration
?   ??? init-scripts/          # Auto-initialization scripts
?   ?   ??? 01-setup-s3.sh     # S3 bucket setup
?   ??? logs/                  # LocalStack logs
??? scripts/
?   ??? dev-setup.sh           # Initial setup script
?   ??? dev-start.sh           # Start development environment
?   ??? dev-stop.sh            # Stop development environment
?   ??? dev-reset.sh           # Reset everything
?   ??? migrate.sh             # Run database migrations
?   ??? seed-db.sh             # Seed database
?   ??? test-prisma.sh         # Test Prisma setup
?   ??? test-s3.sh             # Test S3 integration (New)
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

## ??? LocalStack S3 Integration

The development environment includes **LocalStack** to provide a local AWS S3-compatible service for file storage testing, eliminating the need for real AWS credentials during development.

### ?? LocalStack Configuration

LocalStack is automatically configured with:

- **Service**: S3 (Amazon Simple Storage Service)
- **Endpoint**: http://localhost:4566
- **Region**: us-east-1
- **Bucket**: no-de-duas (auto-created)
- **Credentials**: test/test (for LocalStack compatibility)

### ?? Environment Variables for LocalStack

The development environment (`envs/.env.dev`) includes:

```bash
# LocalStack S3 Configuration
USE_LOCALSTACK=true
LOCALSTACK_ENDPOINT="http://localstack:4566"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
AWS_S3_BUCKET_NAME="no-de-duas"
```

### ?? Automatic Initialization

When LocalStack starts, it automatically:

1. **Creates the bucket** `no-de-duas`
2. **Sets bucket policy** for public read access (development only)
3. **Configures CORS** for web access
4. **Creates folder structure**:
   - `products/` - for product images
   - `users/` - for user avatars
   - `materials/` - for material files
   - `uploads/temp/` - for temporary uploads

### ?? Testing S3 Integration

Use the dedicated test script to verify S3 functionality:

```bash
./scripts/test-s3.sh
```

This script tests:
- LocalStack availability
- S3 service functionality
- Bucket existence and contents
- File upload/download operations
- API integration (if running)

### ?? Manual S3 Operations

Interact with LocalStack S3 directly:

```bash
# List all buckets
docker-compose exec localstack awslocal s3 ls

# List bucket contents
docker-compose exec localstack awslocal s3 ls s3://no-de-duas/ --recursive

# Upload a test file
echo "test" | docker-compose exec -T localstack awslocal s3 cp /dev/stdin s3://no-de-duas/test.txt

# Download a file
docker-compose exec localstack awslocal s3 cp s3://no-de-duas/test.txt /tmp/downloaded.txt

# Delete a file
docker-compose exec localstack awslocal s3 rm s3://no-de-duas/test.txt
```

### ?? LocalStack Debugging

#### Check LocalStack Status

```bash
# Check if LocalStack is running
curl http://localhost:4566/health

# View LocalStack logs
docker-compose logs localstack

# Check LocalStack services
curl http://localhost:4566/_localstack/health
```

#### Common LocalStack Issues

1. **Bucket not found**: Run initialization script manually
   ```bash
   docker-compose exec localstack /etc/localstack/init/ready.d/01-setup-s3.sh
   ```

2. **Connection refused**: Ensure LocalStack is running
   ```bash
   docker-compose restart localstack
   ```

3. **Permission denied**: Check if bucket policy is applied
   ```bash
   docker-compose exec localstack awslocal s3api get-bucket-policy --bucket no-de-duas
   ```

### ?? Production vs Development

| Aspect | Development (LocalStack) | Production (AWS S3) |
|--------|-------------------------|-------------------|
| Endpoint | http://localhost:4566 | AWS S3 regional endpoint |
| Credentials | test/test | Real AWS credentials |
| Bucket Policy | Public read (insecure) | Secure, restricted access |
| Data Persistence | Docker volume | AWS S3 durability |
| Cost | Free | AWS S3 pricing |

### ?? LocalStack File Structure

```
localstack/
??? init-scripts/
?   ??? 01-setup-s3.sh     # Automatic S3 setup script
??? logs/                  # LocalStack execution logs
    ??? .gitkeep
```

The init script runs automatically when LocalStack becomes ready and sets up the complete S3 environment.

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
