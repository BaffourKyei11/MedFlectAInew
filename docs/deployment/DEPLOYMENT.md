# MedFlect AI - Deployment Guide

This document provides comprehensive instructions for deploying the MedFlect AI application in different environments.

## Prerequisites

- Docker 20.10.0+
- Docker Compose 1.29.0+
- Node.js 18.0.0+
- pnpm 8.0.0+
- PostgreSQL 14.0+

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=medflect

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=15*60*1000
RATE_LIMIT_MAX=100

# Monitoring
PROMETHEUS_METRICS_ENABLED=true
PROMETHEUS_METRICS_PATH=/metrics

# Optional: External Services
GROQ_API_KEY=your_groq_api_key
```

## Local Development

### 1. Start the database

```bash
docker-compose -f docker-compose.db.yml up -d
```

### 2. Install dependencies

```bash
pnpm install
cd client && pnpm install && cd ..
```

### 3. Run database migrations

```bash
pnpm run db:push
```

### 4. Start the development servers

In separate terminal windows:

```bash
# Backend
pnpm run dev:server

# Frontend (in a new terminal)
cd client && pnpm run dev
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- pgAdmin: http://localhost:5050

## Production Deployment

### 1. Build the application

```bash
pnpm run build
```

### 2. Start the services

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 3. Run database migrations

```bash
docker-compose exec app pnpm run db:push
```

The application will be available at:
- Frontend: http://your-domain.com
- Backend API: http://your-domain.com/api

## Monitoring Stack

To start the monitoring stack (Prometheus + Grafana + Node Exporter):

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Access the monitoring tools at:
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090

## Database Backups

To create a database backup:

```bash
./scripts/backup-db.sh
```

Backups are stored in the `./backups` directory and are automatically compressed with gzip.

## Environment Variables Reference

### Application
- `NODE_ENV`: Application environment (development, production, test)
- `PORT`: Port the application will run on
- `LOG_LEVEL`: Logging level (error, warn, info, debug, trace)

### Database
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

### Security
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time
- `CORS_ORIGIN`: Allowed CORS origins (comma-separated)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds
- `RATE_LIMIT_MAX`: Maximum number of requests per window

### Monitoring
- `PROMETHEUS_METRICS_ENABLED`: Enable/disable Prometheus metrics
- `PROMETHEUS_METRICS_PATH`: Path for Prometheus metrics endpoint

## Troubleshooting

### Common Issues

1. **Database connection issues**:
   - Verify the database is running: `docker ps | grep postgres`
   - Check database logs: `docker logs medflect-db`
   - Verify credentials in `.env` match those in `docker-compose.db.yml`

2. **Port conflicts**:
   - Check if ports are already in use: `lsof -i :<PORT>`
   - Update the port in `.env` and restart the services

3. **Missing dependencies**:
   - Run `pnpm install` in both root and client directories
   - Clear pnpm store: `pnpm store prune`

### Viewing Logs

```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f db

# All services
docker-compose logs -f
```

## Upgrading

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart the services:
   ```bash
   docker-compose up -d --build
   ```

3. Run any new migrations:
   ```bash
   docker-compose exec app pnpm run db:push
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
