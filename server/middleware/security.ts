import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

// Environment-based security configuration
const isProduction = process.env.NODE_ENV === 'production';
const enableSecurityHeaders = process.env.SECURE_HEADERS === 'true' || isProduction;
const enableRateLimiting = process.env.ENABLE_RATE_LIMITING === 'true' || isProduction;

// CORS Configuration
export const corsConfig = cors({
  origin: process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || (isProduction ? false : '*'),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
});

// General API Rate Limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: enableRateLimiting ? 100 : 1000, // More lenient in development
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    status: 'error',
    message: 'Too many requests, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes for auth
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true
});

// Security Headers
export const securityHeaders = [
  // Helmet security headers with environment-based configuration
  helmet({
    contentSecurityPolicy: enableSecurityHeaders ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Note: Consider removing unsafe-inline/eval in production
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.groq.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    } : false,
    hsts: isProduction ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    } : false,
    noSniff: true,
    xssFilter: true,
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }),
  
  // Additional security headers
  (req: Request, res: Response, next: NextFunction) => {
    if (!enableSecurityHeaders) {
      return next();
    }
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (replaces Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );
    
    // HSTS (only in production with HTTPS)
    if (isProduction && req.secure) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
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
