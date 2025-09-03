# MedFlect AI - Healthcare Analytics Platform

A comprehensive healthcare analytics platform with AI-powered clinical summaries, FHIR integration, and predictive analytics.

## 🚀 Quick Deploy

### Frontend (Vercel)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/medflect-ai/tree/main/frontend&env=VITE_API_BASE_URL&envDescription=Backend%20API%20URL&envLink=https://github.com/your-username/medflect-ai%23environment-variables)

### Backend (Render)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/medflect-ai/tree/main/backend)

## 📁 Project Structure

```
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── backend/           # Express.js API server
│   ├── services/
│   ├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── render.yaml
└── README.md
```

## 🔧 Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```
Runs on http://localhost:3000

## 🌐 Production Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**: Fork this repo and connect it to Vercel
2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `frontend`

3. **Environment Variables** (in Vercel Dashboard):
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com/api
   ```

4. **Custom Domain** (Optional): Add your domain in Vercel settings

### Backend Deployment (Render)

1. **Connect Repository**: Connect your GitHub repo to Render
2. **Service Configuration**:
   - Type: Web Service
   - Runtime: Node.js
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Root Directory: `backend`

3. **Environment Variables** (in Render Dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your_postgres_connection_string
   GROQ_BASE_URL=https://api.groq.com
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=groq/deepseek-r1-distill-llama-70b
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **Database**: Render will provision PostgreSQL automatically

## 🔐 Environment Variables

### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000/api  # Development
VITE_API_BASE_URL=https://your-backend.onrender.com/api  # Production
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/medflect

# AI Service (Optional - will use mock responses if not configured)
GROQ_BASE_URL=https://api.groq.com
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=groq/deepseek-r1-distill-llama-70b

# CORS
FRONTEND_URL=http://localhost:5173,https://your-frontend.vercel.app

# Server
PORT=3000  # Development
PORT=10000  # Production (Render requirement)
NODE_ENV=development
```

## 🔑 Required API Keys

### GROQ AI (Optional - for AI summaries)
1. Sign up at [Groq](https://console.groq.com/)
2. Create an API key
3. Add to backend environment variables:
   - `GROQ_BASE_URL=https://api.groq.com`
   - `GROQ_API_KEY=your_key_here`

**Note**: AI features will show placeholder content if GROQ is not configured.

## 🏗️ Build Commands

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm start        # Serve production build
```

### Backend
```bash
npm run dev      # Development with hot reload
npm run build    # TypeScript compilation
npm start        # Production server
npm run db:push  # Push database schema
```

## 🛠️ Troubleshooting

### Build Failures

**Frontend Build Issues**:
- Ensure all environment variables are set in Vercel
- Check that `VITE_API_BASE_URL` points to your deployed backend

**Backend Build Issues**:
- Verify Node.js version (18+)
- Check TypeScript compilation with `npm run build`

### CORS Issues

If frontend can't connect to backend:
1. Add your Vercel domain to `FRONTEND_URL` in backend env vars
2. Ensure CORS middleware is properly configured
3. Check that API calls use correct base URL

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
- **Security Playbook** - Comprehensive security documentation and CI checks (see [Security Playbook](security/SECURITY_PLAYBOOK.md))
- **Automated Security Scanning** - Pre-commit hooks, CI security checks, and dependency monitoring
- **Security Headers** - CSP, HSTS, X-Frame-Options, and other protective headers
- **Rate Limiting** - Protection against abuse and brute force attacks

### Security Implementation

This project includes a comprehensive security playbook with:

- **[Security Playbook](security/SECURITY_PLAYBOOK.md)** - Developer-first security guidelines and threat model
- **[Security Checklist](security/SECURITY_CHECKLIST.md)** - One-page checklist for developers (pin in Cursor)
- **[Security Policy](security/SECURITY.md)** - Responsible disclosure policy and contact information
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

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For deployment issues:
- Check the troubleshooting section above
- Review environment variable configuration
- Ensure all required services are running

For development questions:
- Review the local development setup
- Check console logs for errors
- Verify API connectivity between frontend and backend
