import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import * as yup from 'yup';
import jwt from 'jsonwebtoken';

type ValidationError = yup.ValidationError;
type JsonWebTokenError = jwt.JsonWebTokenError;
type TokenExpiredError = jwt.TokenExpiredError;

// Enhanced error class with more context
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  errorCode?: string;
  context?: Record<string, any>;

  constructor(
    message: string, 
    statusCode: number, 
    errorCode?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errorCode = errorCode;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Database error handling
const handleDatabaseError = (err: any) => {
  // Handle connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return new AppError(
      'Database connection failed. Please try again later.',
      503,
      'DB_CONNECTION_ERROR',
      { originalError: err.message }
    );
  }

  // Handle constraint violations
  if (err.code === '23505') { // Unique constraint violation
    const field = err.detail?.match(/Key \((.+)\)=/)?.[1] || 'field';
    return new AppError(
      `${field} already exists. Please use a different value.`,
      409,
      'DUPLICATE_ENTRY',
      { field, value: err.detail }
    );
  }

  // Handle foreign key violations
  if (err.code === '23503') {
    return new AppError(
      'Referenced record does not exist.',
      400,
      'FOREIGN_KEY_VIOLATION',
      { constraint: err.constraint }
    );
  }

  // Handle data type errors
  if (err.code === '22P02') {
    return new AppError(
      'Invalid data format provided.',
      400,
      'INVALID_DATA_TYPE',
      { detail: err.detail }
    );
  }

  // Handle other database errors
  return new AppError(
    'Database operation failed. Please try again.',
    500,
    'DB_OPERATION_ERROR',
    { originalError: err.message }
  );
};

// JWT error handling
const handleJWTError = (err: JsonWebTokenError) => {
  return new AppError(
    'Invalid token. Please log in again!',
    401,
    'INVALID_JWT_TOKEN',
    { tokenError: err.message }
  );
};

const handleJWTExpiredError = (err: TokenExpiredError) => {
  return new AppError(
    'Your token has expired! Please log in again.',
    401,
    'JWT_TOKEN_EXPIRED',
    { expiredAt: err.expiredAt }
  );
};

// Validation error handling
const handleValidationError = (err: ValidationError) => {
  const errors = Object.values(err.errors).map(el => el);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(
    message,
    400,
    'VALIDATION_ERROR',
    { 
      validationErrors: errors,
      fields: err.inner?.map(e => e.path) || []
    }
  );
};

// Rate limiting error handling
const handleRateLimitError = (err: any) => {
  return new AppError(
    'Too many requests. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED',
    { 
      retryAfter: err.retryAfter,
      limit: err.limit,
      windowMs: err.windowMs
    }
  );
};

// File upload error handling
const handleFileUploadError = (err: any) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError(
      'File too large. Please upload a smaller file.',
      400,
      'FILE_TOO_LARGE',
      { maxSize: err.limit }
    );
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError(
      'Too many files. Please upload fewer files.',
      400,
      'TOO_MANY_FILES',
      { maxCount: err.limit }
    );
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError(
      'Unexpected file field. Please check your upload form.',
      400,
      'UNEXPECTED_FILE_FIELD',
      { field: err.field }
    );
  }

  return new AppError(
    'File upload failed. Please try again.',
    400,
    'FILE_UPLOAD_ERROR',
    { originalError: err.message }
  );
};

// Development error response
const sendErrorDev = (err: any, req: Request, res: Response) => {
  // Enhanced logging with more context
  logger.error(`${err.statusCode} - ${err.message}`, {
    errorCode: err.errorCode,
    context: err.context,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  });
  
  // API response
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: {
        message: err.message,
        errorCode: err.errorCode,
        statusCode: err.statusCode,
        context: err.context,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  // Rendered website response
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};

// Production error response
const sendErrorProd = (err: any, req: Request, res: Response) => {
  // API response
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errorCode: err.errorCode,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
    
    // Programming or other unknown error: don't leak error details
    // Log error with full details
    logger.error(`${err.statusCode} - ${err.message}`, {
      errorCode: err.errorCode,
      context: err.context,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
      stack: err.stack,
      isOperational: err.isOperational,
    });
    
    // Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      errorCode: 'INTERNAL_ERROR',
      errorId: (req as any).id || 'unknown',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  // Rendered website response
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  
  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

// Main error handler
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Add request context to error
  err.context = {
    ...err.context,
    requestId: (req as any).id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
  };

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error as JsonWebTokenError);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error as TokenExpiredError);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationError(error as unknown as ValidationError);
    }
    
    // Handle database errors
    if (error.code && (error.code.startsWith('23') || error.code.startsWith('22') || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
      error = handleDatabaseError(error);
    }
    
    // Handle rate limiting errors
    if (error.statusCode === 429) {
      error = handleRateLimitError(error);
    }
    
    // Handle file upload errors
    if (error.code && error.code.startsWith('LIMIT_')) {
      error = handleFileUploadError(error);
    }
    
    // Handle duplicate field values (MongoDB)
    if (error.code === 11000) {
      const value = error.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'field';
      const message = `Duplicate field value: ${value}. Please use another value!`;
      error = new AppError(message, 400, 'DUPLICATE_FIELD', { field: value });
    }
    
    // Handle invalid database IDs (MongoDB)
    if (error.kind === 'ObjectId') {
      const message = `Invalid ${error.path}: ${error.value}`;
      error = new AppError(message, 400, 'INVALID_ID', { path: error.path, value: error.value });
    }

    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error factory functions
export const createAppError = (
  message: string,
  statusCode: number,
  errorCode?: string,
  context?: Record<string, any>
) => {
  return new AppError(message, statusCode, errorCode, context);
};

export const createValidationError = (message: string, field?: string, value?: any) => {
  return new AppError(
    message,
    400,
    'VALIDATION_ERROR',
    { field, value }
  );
};

export const createNotFoundError = (resource: string, id?: string) => {
  return new AppError(
    `${resource} not found${id ? ` with id: ${id}` : ''}.`,
    404,
    'RESOURCE_NOT_FOUND',
    { resource, id }
  );
};

export const createUnauthorizedError = (message?: string) => {
  return new AppError(
    message || 'You are not authorized to perform this action.',
    401,
    'UNAUTHORIZED'
  );
};

export const createForbiddenError = (message?: string) => {
  return new AppError(
    message || 'Access denied. You do not have permission to perform this action.',
    403,
    'FORBIDDEN'
  );
};

export default AppError;
