# Multi-stage Docker build for production
FROM node:24-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Set working directory
WORKDIR /app

# Stage 1: Dependencies (cacheable by lockfile)
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Stage 2: Build (server + client)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Uses root scripts: builds client and server
RUN npm run build

FROM base AS production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S medflect -u 1001

# Install production dependencies
COPY --from=builder /app/dist/package.json ./package.json
COPY pnpm-lock.yaml* ./
RUN pnpm deploy --prod .

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./dist/public

# Copy healthcheck
COPY healthcheck.js ./

# Set ownership
RUN chown -R medflect:nodejs /app
# Run as non-root user
USER medflect

ENV NODE_ENV=production

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/index.js"]
