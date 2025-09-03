import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// CORS Configuration
export const corsConfig = cors({
  origin: process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
});

// Rate Limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    status: 'error',
    message: 'Too many requests, please try again later.'
  }
});

// Security Headers
export const securityHeaders = [
  // Helmet security headers
  helmet(),
  
  // Additional security headers
  (_req: Request, res: Response, next: NextFunction) => {
    const isDev = process.env.NODE_ENV === 'development';
    const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()).filter(Boolean) || [];
    const connectSrc = [
      "'self'",
      'https://api.groq.com',
      ...corsOrigins,
      ...(isDev ? ['http://localhost:3000', 'http://localhost:5173', 'ws://localhost:5173'] : [])
    ].join(' ');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data:; " +
      "font-src 'self'; " +
      `connect-src ${connectSrc};`
    );
    
    // Feature Policy
    res.setHeader(
      'Feature-Policy',
      "geolocation 'none'; microphone 'none'; camera 'none'"
    );
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );
    
    // HSTS (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    next();
  }
];

// CSRF Protection (if not using JWT)
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for API routes if using JWT
  if (req.path.startsWith('/api') && req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }
  
  // Implement CSRF protection here if needed
  next();
};
