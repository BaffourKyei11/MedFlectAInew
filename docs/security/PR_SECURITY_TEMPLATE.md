# PR Security Checklist

## Pre-Merge Security Review

### Code Security
- [ ] **No secrets in code**: No API keys, passwords, tokens, or sensitive data
- [ ] **Input validation**: All user inputs are validated and sanitized
- [ ] **SQL injection prevention**: Using parameterized queries or ORM
- [ ] **XSS prevention**: Output is properly escaped, CSP headers configured
- [ ] **CSRF protection**: CSRF tokens or JWT validation implemented
- [ ] **Authentication/Authorization**: Proper auth checks on protected routes
- [ ] **Rate limiting**: Applied to public and auth endpoints
- [ ] **Error handling**: No sensitive information leaked in error messages

### Dependencies & Configuration
- [ ] **Dependencies updated**: No known vulnerabilities in dependencies
- [ ] **Environment variables**: Sensitive config moved to environment variables
- [ ] **Security headers**: CSP, HSTS, X-Frame-Options, etc. configured
- [ ] **CORS configuration**: Properly configured for production
- [ ] **Database security**: Connections encrypted, credentials secure

### Testing & Validation
- [ ] **Security tests**: Tests cover security-critical functionality
- [ ] **Penetration testing**: Manual security testing completed (if applicable)
- [ ] **Dependency audit**: `npm audit` passes with no high/critical issues
- [ ] **Static analysis**: ESLint security rules pass
- [ ] **Type checking**: TypeScript compilation successful

### Deployment & Monitoring
- [ ] **HTTPS enabled**: SSL/TLS properly configured
- [ ] **Logging configured**: Security events logged, PII redacted
- [ ] **Monitoring active**: Alerts configured for security events
- [ ] **Backup tested**: Recovery procedures tested
- [ ] **Access controls**: Proper RBAC implemented

## Security Review Questions

### For the Reviewer:
1. **Does this change introduce new attack vectors?**
2. **Are there any hardcoded secrets or credentials?**
3. **Is user input properly validated and sanitized?**
4. **Are authentication and authorization checks in place?**
5. **Does this change affect security headers or CORS?**
6. **Are there any new dependencies with known vulnerabilities?**
7. **Is error handling secure (no information disclosure)?**
8. **Does this change require security testing?**

### For the Author:
1. **Have you run security scans locally?**
2. **Are all environment variables documented?**
3. **Have you tested the security controls?**
4. **Is this change covered by security tests?**
5. **Have you considered the security impact of this change?**

## Security Commands

```bash
# Run security checks locally
npm audit --audit-level=moderate
npm run lint:check
npm run check:ci

# Test security headers
curl -I http://localhost:5000/api/health

# Check for secrets
pre-commit run detect-secrets --all-files
```

## Emergency Contacts

- **Security issues**: See SECURITY.md
- **Infrastructure**: [Team contact]
- **Escalation**: [Manager contact]

---

**Reviewer Signature**: _________________  
**Date**: _________________  
**Security Level**: [ ] Low [ ] Medium [ ] High [ ] Critical
