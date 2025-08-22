#!/bin/bash
set -e

# Build the server
npm run build:server

# Start the server
node dist/index.js
