# MedFlect AI - Healthcare Analytics Platform

A comprehensive healthcare analytics platform with AI-powered clinical summaries, FHIR integration, and predictive analytics.

## 🚀 Quick Start

### Deploy to Production
- **Frontend**: [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/your-username/medflect-ai/tree/main/frontend&env=VITE_API_BASE_URL&envDescription=Backend%20API%20URL&envLink=https://github.com/your-username/medflect-ai%23environment-variables)
- **Backend**: [Deploy to Render](https://render.com/deploy?repo=https://github.com/your-username/medflect-ai/tree/main/backend)

### Local Development
```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start development servers
npm run dev
```

## 📚 Documentation

All project documentation has been organized in the `docs/` directory for better maintainability:

### 📖 Main Documentation
- **[Project Overview](docs/README.md)** - Complete project documentation with setup, deployment, and troubleshooting
- **[Changelog](docs/CHANGELOG.md)** - Project history and version changes

### 🔒 Security Documentation
- **[Security Policy](docs/security/SECURITY.md)** - Responsible disclosure and security contact information
- **[Security Checklist](docs/security/SECURITY_CHECKLIST.md)** - Developer security checklist (pin in Cursor)
- **[Security Playbook](docs/security/SECURITY_PLAYBOOK.md)** - Comprehensive security guidelines and threat model
- **[PR Security Template](docs/security/PR_SECURITY_TEMPLATE.md)** - Security review checklist for pull requests

### 🚀 Deployment Documentation
- **[Deployment Guide](docs/deployment/DEPLOYMENT.md)** - Comprehensive deployment instructions
- **[Deployment Status](docs/deployment/DEPLOYMENT-STATUS.md)** - Current deployment readiness status
- **[Docker Setup](docs/deployment/DOCKER-README.md)** - Docker configuration and usage

### 🛠️ Development Documentation
- **[Acceptance Checklist](docs/development/ACCEPTANCE_CHECKLIST.md)** - Code quality and deployment preparation checklist
- **[PR Summary](docs/development/PR_SUMMARY.md)** - Pull request documentation and technical improvements
- **[Development Environment](docs/development/replit.md)** - Development environment setup and architecture

### 📁 Project Assets
- **[Assets](docs/assets/)** - Project assets and additional content

## 🏗️ Project Structure

```
├── client/              # React + Vite frontend
├── server/              # Express.js API server
├── docs/                # 📚 Organized documentation
│   ├── README.md        # Main project documentation
│   ├── CHANGELOG.md     # Project history
│   ├── security/        # Security documentation
│   ├── deployment/      # Deployment guides
│   ├── development/     # Development documentation
│   └── assets/          # Project assets
├── api/                 # API route handlers
├── shared/              # Shared utilities and schemas
└── tests/               # Test files
```

## 🔧 Quick Commands

```bash
# Development
npm run dev              # Start development servers
npm run build            # Build for production
npm run test:smoke       # Run smoke tests

# Docker
docker-compose up --build    # Start with Docker
docker-compose down          # Stop Docker services

# Security
npm audit                   # Check for vulnerabilities
npm run lint:check          # Check code quality
pre-commit run --all-files  # Run pre-commit hooks
```

## 🔐 Security Features

- **Comprehensive Security Playbook** - See [Security Documentation](docs/security/)
- **Automated Security Scanning** - Pre-commit hooks and CI security checks
- **Security Headers** - CSP, HSTS, X-Frame-Options, and other protective headers
- **Rate Limiting** - Protection against abuse and brute force attacks
- **Input Validation** - Zod schema validation throughout the application

## 📊 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **TanStack Query** for data fetching

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Zod** for schema validation
- **GROQ AI** for clinical summaries

## 🆘 Support

<<<<<<< HEAD
- **Deployment Issues**: Check [Deployment Guide](docs/deployment/DEPLOYMENT.md)
- **Security Issues**: See [Security Policy](docs/security/SECURITY.md)
- **Development Questions**: Review [Development Documentation](docs/development/)
=======
### Build Failures

**Frontend Build Issues**:
- Ensure all environment variables are set in Vercel
- Check that `VITE_API_BASE_URL` points to your deployed backend

**Backend Build Issues**:
- Verify Node.js version (18+)
- Check TypeScript compilation with `npm run build`

### CORS Issues

If frontend can't connect to backend:
1. Add your Vercel domain to `CORS_ORIGIN` (comma-separated allowed origins)
2. Ensure CORS middleware and CSP headers are configured (see `server/middleware/security.ts`)
3. Check that API calls use the correct base URL (`VITE_API_BASE_URL`)

### Database Issues

**Connection Problems**:
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Ensure database exists and is accessible
- Run `npm run db:push` to sync schema

**Migration Errors**:
- Never manually edit database schema
- Use `npm run db:push --force` if standard push fails
- Check that all required environment variables are set

### Missing Environment Variables

**Frontend**:
- All variables must start with `VITE_` prefix
- Set in Vercel dashboard under project settings
- Rebuild after adding new variables

**Backend**:
- Set in Render dashboard under environment tab
- App will restart automatically after changes

### Performance Issues

**Frontend**:
- Enable gzip compression in Vercel (automatic)
- Optimize images and assets
- Use React DevTools for performance profiling

**Backend**:
- Monitor memory usage in Render dashboard
- Optimize database queries
- Enable connection pooling for high traffic

## 📚 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **TanStack Query** - Data fetching
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit
- **PostgreSQL** - Database
- **Zod** - Schema validation

## 🔒 Security Features

- **CORS Protection** - Configured for production domains
- **Input Validation** - Zod schema validation
- **Environment Variables** - Secure credential management
- **Type Safety** - Full TypeScript coverage
- **Security Playbook** - Comprehensive security documentation and CI checks (see SECURITY_PLAYBOOK.md)
- **Automated Security Scanning** - Pre-commit hooks, CI security checks, and dependency monitoring
- **Security Headers** - CSP, HSTS, X-Frame-Options, and other protective headers
- **Rate Limiting** - Protection against abuse and brute force attacks

### Security Implementation

This project includes a comprehensive security playbook with:

- **SECURITY_PLAYBOOK.md** - Developer-first security guidelines and threat model
- **SECURITY_CHECKLIST.md** - One-page checklist for developers (pin in Cursor)
- **SECURITY.md** - Responsible disclosure policy and contact information
- **Pre-commit hooks** - Automated secret detection and code quality checks
- **CI Security Pipeline** - Automated security scanning in GitHub Actions
- **Dependabot** - Automated dependency updates and vulnerability monitoring
- **Security Middleware** - Environment-configurable security headers and rate limiting

### Quick Security Commands

```bash
# Run security checks locally
npm audit --audit-level=moderate
npm run lint:check
npm run check:ci

# Test pre-commit hooks
pre-commit run --all-files

# Test security headers
curl -I http://localhost:5000/api/health
```

### Environment Security Variables

```bash
# Security configuration
SECURE_HEADERS=true          # Enable security headers
ENABLE_RATE_LIMITING=true    # Enable rate limiting
CORS_ORIGIN=https://yourdomain.com  # Production CORS origins
NODE_ENV=production          # Production mode
```
>>>>>>> 25341415f4b83efaaa8570316b27f3444adce31c

## 📄 License

MIT License - see LICENSE file for details.

---

**Note**: All detailed documentation has been moved to the `docs/` directory for better organization and maintainability. Start with the [Main Documentation](docs/README.md) for comprehensive setup and usage instructions.