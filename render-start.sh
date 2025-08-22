#!/bin/sh
set -e

# Install dependencies
npm install

# Build the client
cd client
npm install
npm run build
cd ..

# Build the server
npm run build:server

# Create public directory if it doesn't exist
mkdir -p dist/public

# Copy client build to public directory
if [ -d "client/dist" ]; then
  cp -r client/dist/* dist/public/
fi

# Start the server
node dist/index.js
