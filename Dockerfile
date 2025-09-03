# Multi-stage Docker build for production
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Stage 1: Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile

# Stage 2: Build client
FROM base AS client-builder
WORKDIR /app/client
COPY client/package.json ./
RUN pnpm install --no-frozen-lockfile
COPY client/ .
RUN pnpm run build

# Stage 3: Build server
FROM base AS server-builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm run build:server

# Stage 4: Production
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S medflect -u 1001

# Install production dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --no-frozen-lockfile

# Copy built application
COPY --from=server-builder /app/dist ./dist
COPY --from=client-builder /app/client/dist ./dist/public

# Copy healthcheck
COPY healthcheck.js ./

# Set ownership
RUN chown -R medflect:nodejs /app
USER medflect

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/index.js"]
