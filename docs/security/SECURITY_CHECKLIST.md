# Security Checklist — Pin in Cursor

## Pre-Work (Before Starting)
- [ ] `git pull` latest changes
- [ ] Check for security advisories: `npm audit`
- [ ] Review recent security updates
- [ ] Ensure `.env` files are in `.gitignore`

## Per-PR Security Checks
- [ ] No secrets in code (API keys, passwords, tokens)
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (escape output, CSP headers)
- [ ] CSRF protection where needed
- [ ] Authentication/authorization checks
- [ ] Rate limiting on public endpoints
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies are up to date
- [ ] No hardcoded URLs or configs

## Production Deployment
- [ ] Environment variables set correctly
- [ ] HTTPS enabled with valid certificates
- [ ] Security headers configured
- [ ] Database connections encrypted
- [ ] Logging configured (no PII)
- [ ] Monitoring and alerting active
- [ ] Backup and recovery tested
- [ ] Access controls reviewed

## Incident Response Basics
- [ ] Know who to contact (see SECURITY.md)
- [ ] Have access to logs and monitoring
- [ ] Know how to rotate credentials
- [ ] Understand rollback procedures
- [ ] Document incident timeline

## Useful Commands

### Pre-commit
```bash
pre-commit run --all-files
```

### Security Scanning
```bash
# Dependency audit
npm audit --audit-level=moderate

# ESLint security rules
npm run lint:check

# Type checking
npm run check:ci
```

### Local Testing
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run security checks
npm run check
```

### Environment Setup
```bash
# Copy environment template
cp env.example .env

# Set security flags
export SECURE_HEADERS=true
export NODE_ENV=development
```

## Quick Security Fixes
- **Secrets in code**: Move to environment variables
- **Missing validation**: Add input sanitization
- **Weak passwords**: Enforce strong password policy
- **Missing HTTPS**: Enable SSL/TLS
- **Outdated deps**: Run `npm update` and test

## Emergency Contacts
- Security issues: See SECURITY.md
- Infrastructure: Check team contacts
- Escalation: Follow incident response plan

---
*Last updated: $(date)*
*Pin this in Cursor for quick reference*
