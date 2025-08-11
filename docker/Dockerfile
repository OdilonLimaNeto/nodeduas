# Multi-stage Dockerfile for NestJS application

# =============================================================================
# STAGE 1: Base - Common dependencies and setup
# =============================================================================
FROM node:18-alpine AS base

WORKDIR /app

# Install system dependencies including OpenSSL for Prisma
RUN apk add --no-cache \
  curl \
  postgresql-client \
  openssl \
  libc6-compat

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# =============================================================================
# STAGE 2: Development - For local development with hot reload
# =============================================================================
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port and debug port
EXPOSE 3000 9229

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start in development mode with hot reload
CMD ["npm", "run", "start:dev"]

# =============================================================================
# STAGE 3: Build - Compile TypeScript for production
# =============================================================================
FROM base AS build

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# =============================================================================
# STAGE 4: Production - Minimal production image
# =============================================================================
FROM node:18-alpine AS production

WORKDIR /app

# Install runtime dependencies for Prisma
RUN apk add --no-cache \
  openssl \
  libc6-compat

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001

# Copy built application and dependencies from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start production server
CMD ["npm", "run", "start:prod"]
