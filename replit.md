# MedFlect AI - Healthcare Analytics Platform

## Overview

MedFlect AI is a comprehensive healthcare analytics platform designed to address the critical healthcare workforce shortage in Ghana and across Africa. The system transforms hospital data into actionable clinical insights through AI-powered clinical summaries, FHIR integration, predictive analytics, and secure consent management. 

Built with offline-first architecture and standards-based interoperability, MedFlect aims to amplify clinicians, protect patient autonomy, and increase care quality while starting with 37 Military Hospital and scaling across Ghana/Africa.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern component-based UI with strict type safety
- **Vite Build System**: Fast development and optimized production builds with code splitting
- **Progressive Web App**: Service worker implementation for offline functionality and caching
- **Tailwind CSS + Shadcn/ui**: Utility-first styling with accessible component library
- **TanStack Query**: Server state management with caching and synchronization
- **Wouter Router**: Lightweight client-side routing solution

### Backend Architecture
- **Express.js + TypeScript**: RESTful API server with comprehensive type definitions
- **Drizzle ORM**: Type-safe database queries with PostgreSQL integration
- **Modular Service Layer**: Separated concerns for AI, FHIR, blockchain, and analytics services
- **Middleware Stack**: Security headers, CORS, rate limiting, CSRF protection, and structured logging
- **Health Check System**: Comprehensive monitoring endpoints for deployment readiness

### Data Architecture
- **PostgreSQL Database**: Primary data store with connection pooling and migration support
- **Drizzle Schema**: Type-safe database schema with validation using Zod
- **FHIR R4 Compliance**: Healthcare interoperability standard implementation
- **Multi-tenant Design**: Hospital management system supporting multiple facilities

### Security & Compliance
- **Environment-based Configuration**: Secure secrets management with validation
- **Security Headers**: Helmet.js implementation with CSP, HSTS, and frame options
- **Rate Limiting**: API protection against abuse and DoS attacks
- **Audit Logging**: Comprehensive tracking of data access and system events
- **Blockchain Consent**: Ethereum integration for tamper-proof consent management

### AI & Analytics Services
- **Groq Integration**: High-performance LLM API for clinical summary generation
- **Predictive Analytics**: Machine learning models for readmission risk and resource forecasting
- **Enhanced FHIR Service**: Advanced healthcare data processing and standardization
- **Clinical Decision Support**: Evidence-based recommendations and risk stratification

## External Dependencies

### Core Infrastructure
- **PostgreSQL**: Primary database with connection pooling via @neondatabase/serverless
- **Redis/Memory Cache**: Session management and temporary data storage (implied)
- **Docker**: Multi-stage containerization for production deployment

### AI & Machine Learning
- **Groq API**: High-performance language model inference for clinical summaries
- **Custom ML Models**: Predictive analytics for readmission risk and resource planning

### Healthcare Standards
- **HL7 FHIR R4**: Healthcare data interoperability standard
- **EHR Integration**: Support for major EHR systems through FHIR endpoints
- **Webhook Management**: Real-time data synchronization with hospital systems

### Development & Deployment
- **Vercel**: Frontend deployment platform with edge optimization
- **Render**: Backend deployment with auto-scaling and health monitoring
- **GitHub Actions**: CI/CD pipeline with security scanning and automated testing
- **Dependabot**: Automated dependency updates and vulnerability monitoring

### Security & Monitoring
- **Winston Logger**: Structured application logging with multiple transports
- **Pre-commit Hooks**: Code quality and security scanning automation
- **ESLint + Prettier**: Code quality enforcement with security rule sets
- **Vitest**: Testing framework with coverage reporting and smoke tests

### Third-party Services
- **Blockchain Network**: Ethereum integration for consent management and audit trails
- **Email/SMS Services**: Patient communication and notification systems
- **Monitoring Stack**: Prometheus/Grafana setup for application observability