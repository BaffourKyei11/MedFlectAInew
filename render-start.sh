#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" >&2
}

# Check required environment variables
check_env_vars() {
    local required_vars=(
        "NODE_ENV"
        "PORT"
        "JWT_SECRET"
        "DATABASE_URL"
        "ENCRYPTION_KEY"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            error "Required environment variable $var is not set"
        fi
    done
}

# Build the application
build() {
    log "Starting build process..."
    
    # Install root dependencies
    log "Installing root dependencies..."
    npm ci --production=false || error "Failed to install root dependencies"
    
    # Build the client
    log "Building client..."
    cd client
    npm ci --production=false || error "Failed to install client dependencies"
    npm run build || error "Failed to build client"
    cd ..
    
    # Build the server
    log "Building server..."
    npm run build:server || error "Failed to build server"
    
    # Create public directory if it doesn't exist
    mkdir -p dist/public
    
    # Copy client build to public directory
    if [ -d "client/dist" ]; then
        log "Copying client build to dist/public..."
        cp -r client/dist/* dist/public/ || warn "Failed to copy client build to dist/public"
    else
        warn "Client build directory not found at client/dist/"
    fi
    
    log "Build completed successfully!"
}

# Start the application
start() {
    log "Starting application..."
    
    # Check environment variables
    check_env_vars
    
    # Run database migrations if needed
    log "Running database migrations..."
    npx drizzle-kit push:pg --config=drizzle.config.ts || warn "Failed to run database migrations"
    
    # Start the server
    log "Starting server..."
    exec node dist/index.js
}

# Handle command line arguments
case "${1:-}" in
    build)
        build
        ;;
    start)
        start
        ;;
    *)
        echo "Usage: $0 {build|start}"
        exit 1
        ;;
esac
