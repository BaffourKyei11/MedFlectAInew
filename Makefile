.PHONY: help install build dev test lint format clean docker-build docker-run docker-dev

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install
	cd client && npm install

build: ## Build the application
	npm run build

dev: ## Start development servers
	npm run dev

test: ## Run tests
	npm run test

test:smoke: ## Run smoke tests
	npm run test:smoke

lint: ## Run linting
	npm run lint

format: ## Format code
	npm run format

check: ## Run all checks (lint, type-check, test)
	npm run check

clean: ## Clean build artifacts
	npm run clean

docker-build: ## Build Docker image
	docker build -t medflect-ai .

docker-run: ## Run Docker container
	docker run -p 3000:3000 --env-file .env medflect-ai

docker-dev: ## Run development environment with Docker Compose
	docker-compose -f docker-compose.dev.yml up --build

docker-prod: ## Run production environment with Docker Compose
	docker-compose up --build

logs: ## Show application logs
	docker-compose logs -f

db:push: ## Push database schema
	npm run db:push

db:studio: ## Open database studio
	npm run db:studio

health: ## Check application health
	curl -f http://localhost:3000/api/health || exit 1

start:prod: ## Start production server
	npm run start:prod
