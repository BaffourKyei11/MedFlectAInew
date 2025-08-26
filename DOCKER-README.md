# MedFlect AI - Docker Setup

This document provides instructions for setting up and running MedFlect AI using Docker.

## Prerequisites

- Docker Engine 20.10.0 or higher
- Docker Compose 2.0.0 or higher
- Node.js 18+ (for local development without Docker)
- pnpm 8.x

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Security
JWT_SECRET=your-secure-jwt-secret-key
ENCRYPTION_KEY=your-32-byte-encryption-key
CORS_ORIGIN=*

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=medflect_ai

# GROQ AI Service
GROQ_API_KEY=your-groq-api-key
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=groq/deepseek-r1-distill-llama-70b

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin
```

## Development with Docker

1. Start the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - pgAdmin: http://localhost:5050
     - Email: admin@example.com
     - Password: admin

3. To stop the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Production Deployment

1. Build and start the production stack:
   ```bash
   docker-compose -f docker-compose.yml up --build -d
   ```

2. Access the application:
   - Frontend: http://your-server-ip:3000
   - Backend API: http://your-server-ip:3000/api

3. To stop the production stack:
   ```bash
   docker-compose -f docker-compose.yml down
   ```

## Useful Commands

- View logs:
  ```bash
  docker-compose -f docker-compose.dev.yml logs -f
  ```

- Run database migrations:
  ```bash
  docker-compose -f docker-compose.dev.yml exec app pnpm run db:push
  ```

- Access database shell:
  ```bash
  docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d medflect_ai
  ```

## Volumes

- PostgreSQL data is persisted in a Docker volume named `medflectai_postgres_data`
- To completely remove all data (including database):
  ```bash
  docker-compose -f docker-compose.dev.yml down -v
  ```

## Troubleshooting

- If you encounter permission issues with volumes, try:
  ```bash
  sudo chown -R $USER:$USER .
  ```

- To rebuild a specific service:
  ```bash
  docker-compose -f docker-compose.dev.yml up --build --no-deps <service_name>
  ```

## Security Notes

- Never commit sensitive information to version control
- Use strong passwords in production
- Configure proper CORS settings for production
- Use HTTPS in production with a valid SSL certificate
