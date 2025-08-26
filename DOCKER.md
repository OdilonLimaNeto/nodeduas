# Docker Configuration

## Multi-Stage Build Strategy

This project uses a multi-stage Docker build optimized for NestJS applications with Prisma ORM.

### Build Stages

#### 1. Base Stage

- **Base Image**: `node:18-alpine`
- **Purpose**: Common dependencies and setup
- **Dependencies**:
  - `curl` - Health checks
  - `postgresql-client` - Database utilities
  - `openssl` - Prisma compatibility
  - `libc6-compat` - Alpine Linux compatibility

#### 2. Development Stage

- **Purpose**: Local development with hot reload
- **Features**:
  - All dependencies (including dev dependencies)
  - Source code volume mounting
  - Debug port exposure (9229)
  - Hot reload enabled

#### 3. Build Stage

- **Purpose**: Compile TypeScript for production
- **Optimizations**:
  - Production dependencies only
  - Source code compilation
  - Prisma client generation

#### 4. Production Stage

- **Purpose**: Minimal production runtime
- **Security**: Non-root user (`nestjs`)
- **Optimizations**: Minimal dependencies, compiled assets only

## Prisma Configuration

### Binary Targets

The Prisma client is configured with the following binary targets:

```prisma
binaryTargets = ["native", "linux-musl"]
```

**Why these targets?**

- `native`: For local development on host machine
- `linux-musl`: For Alpine Linux containers

### Alpine Linux Compatibility

Special considerations for Prisma on Alpine Linux:

1. **OpenSSL**: Alpine uses LibreSSL by default, but Prisma needs OpenSSL
2. **Binary Compatibility**: `linux-musl` target is required for Alpine
3. **Runtime Dependencies**: `libc6-compat` ensures compatibility

### Previous Issues (Fixed)

- ? `linux-musl-openssl-1.1.x` (invalid binary target)
- ? `PRISMA_CLI_BINARY_TARGETS` environment variable conflicts
- ? `openssl-dev` in production containers

## Environment Variables

### Development

- `NODE_ENV=development`
- Database connection to Docker container
- Debug logging enabled

### Production

- `NODE_ENV=production`
- Optimized resource limits
- Security hardening

## Build Commands

### Development Build

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
```

### Production Build

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### Clean Build (Force Rebuild)

```bash
docker-compose build --no-cache
```

## Troubleshooting

### Build Failures

1. Clean Docker cache: `docker system prune -f`
2. Rebuild without cache: `docker-compose build --no-cache`
3. Check logs: `docker-compose logs`

### Prisma Issues

1. Test Prisma setup: `./scripts/test-prisma.sh`
2. Regenerate client: `docker-compose exec api npx prisma generate`
3. Check binary targets: `docker-compose exec api npx prisma version`

## Performance Optimizations

### Image Size Reduction

- Multi-stage builds eliminate dev dependencies from production
- Alpine Linux base (~5MB vs ~100MB+ for full Ubuntu)
- Layer caching for faster rebuilds

### Build Speed

- Package files copied before source code (better layer caching)
- Production dependencies installed separately
- Prisma client generation optimized for target platform

## Security Considerations

### Production Hardening

- Non-root user in production containers
- Minimal attack surface (only required packages)
- Resource limits configured
- Secrets management ready for AWS deployment

## LocalStack Integration

### Development Service Architecture

The development environment includes **LocalStack** to provide local AWS services simulation:

#### LocalStack Container Configuration

```yaml
localstack:
  image: localstack/localstack:3
  container_name: no-de-duas-localstack
  ports:
    - "4566:4566"      # Main LocalStack endpoint
    - "4510-4559:4510-4559"  # Additional service ports
  environment:
    - SERVICES=s3      # Only S3 service enabled
    - DEBUG=1          # Enhanced logging
    - PERSISTENCE=1    # Data persistence across restarts
  volumes:
    - "./localstack/init-scripts:/etc/localstack/init/ready.d"
    - "localstack_data:/var/lib/localstack"
    - "./localstack/logs:/var/log/localstack"
```

#### Automatic S3 Initialization

LocalStack automatically runs initialization scripts from `/etc/localstack/init/ready.d`:

- **Script**: `01-setup-s3.sh`
- **Functions**:
  - Creates S3 bucket `no-de-duas`
  - Configures bucket policy for development
  - Sets up CORS configuration
  - Creates initial folder structure

#### Service Dependencies

```yaml
api:
  depends_on:
    db:
      condition: service_healthy
    localstack:
      condition: service_healthy  # API waits for LocalStack
```

#### Health Checks

LocalStack includes health check monitoring:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4566/health"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 10s
```

#### Resource Management

LocalStack is configured with appropriate resource limits:

```yaml
deploy:
  resources:
    limits:
      memory: 1G      # Maximum memory usage
    reservations:
      memory: 512M    # Reserved memory
```

### Development vs Production

| Component | Development | Production |
|-----------|------------|------------|
| S3 Service | LocalStack (local) | AWS S3 (cloud) |
| Endpoint | http://localhost:4566 | AWS regional endpoint |
| Credentials | test/test | AWS IAM credentials |
| Data Persistence | Docker volume | AWS S3 durability |
| Initialization | Automatic via scripts | Manual/Terraform |

### LocalStack File Structure

```
localstack/
??? init-scripts/           # Auto-run when LocalStack ready
?   ??? 01-setup-s3.sh     # S3 bucket and policy setup
??? logs/                  # LocalStack execution logs
    ??? .gitkeep          # Placeholder for log files
```

### Debugging LocalStack

```bash
# Check LocalStack health
curl http://localhost:4566/health

# View LocalStack logs
docker-compose logs localstack

# List S3 buckets
docker-compose exec localstack awslocal s3 ls

# Manual bucket operations
docker-compose exec localstack awslocal s3 ls s3://no-de-duas/
```
