# Changelog

All notable changes to this project will be documented in this file.

## [2025-08-10] - Prisma Alpine Linux Compatibility Fix

### Fixed

- **Prisma Build Issues**: Resolved "Unknown binaryTarget linux-musl-openssl-1.1.x" error
- **OpenSSL Compatibility**: Fixed OpenSSL detection issues in Alpine Linux containers
- **Schema Engine**: Resolved "Could not parse schema engine response" errors
- **Docker Build**: Fixed Docker build failures related to Prisma client generation

### Changed

- **Prisma Schema**: Updated `binaryTargets` to use only `["native", "linux-musl"]`
- **Dockerfile**: Removed problematic environment variables (`PRISMA_CLI_BINARY_TARGETS`, `OPENSSL_ROOT_DIR`)
- **Dependencies**: Simplified OpenSSL dependencies (removed `openssl-dev` from runtime)
- **Logging**: Improved error logging in setup scripts with Prisma-specific diagnostics

### Added

- **Test Script**: New `./scripts/test-prisma.sh` for comprehensive Prisma testing
- **Diagnostics**: Enhanced error reporting in `dev-setup.sh` with Prisma version checks
- **Documentation**: Updated troubleshooting guide with Prisma-specific solutions

### Technical Details

- Prisma binary targets simplified from `["native", "linux-musl", "linux-musl-openssl-1.1.x"]` to `["native", "linux-musl"]`
- Removed Alpine OpenSSL development packages from production containers
- Environment variables cleanup for better Alpine Linux compatibility
- Enhanced script logging for better debugging experience

### Breaking Changes

None. All changes are backward compatible.

### Migration Guide

If you have an existing development environment:

1. Reset your environment to apply the fixes:

   ```bash
   ./scripts/dev-reset.sh
   ```

2. If you encounter issues, run the diagnostic script:
   ```bash
   ./scripts/test-prisma.sh
   ```

---

## [Previous] - Initial Setup

### Added

- Multi-stage Docker build for NestJS application
- Environment variable validation with Joi
- Automatic environment detection (development/production)
- Development scripts for easy onboarding
- PostgreSQL integration with Prisma ORM
- JWT authentication system
- AWS S3 integration for file uploads
- Comprehensive documentation
