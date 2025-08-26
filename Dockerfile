# Stage 1: Base image with common setup
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Stage 2: Development environment
FROM base AS development

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Expose ports
EXPOSE 3000 9229

# Command to run the application
CMD ["pnpm", "run", "dev"]

# Stage 3: Frontend builder
FROM base AS frontend-builder

# Set working directory for client
WORKDIR /app/client

# Copy client files
COPY client/package.json ./

# Install dependencies and build
RUN pnpm install --frozen-lockfile
COPY client/ .
RUN pnpm run build

# Stage 4: Backend builder
FROM base AS backend-builder

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY server/package.json ./server/

# Install dependencies and build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build:server

# Stage 5: Production image
FROM base AS production

# Install production dependencies
COPY package.json pnpm-lock.yaml* ./
COPY server/package.json ./server/
RUN pnpm install --prod --frozen-lockfile

# Copy built backend
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/server/node_modules ./server/node_modules

# Copy built frontend to public directory
COPY --from=frontend-builder /app/client/dist ./dist/public

# Copy healthcheck script
COPY healthcheck.js .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["node", "dist/index.js"]
