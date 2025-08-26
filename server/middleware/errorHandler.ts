import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import * as yup from 'yup';
import jwt from 'jsonwebtoken';

type ValidationError = yup.ValidationError;
type JsonWebTokenError = jwt.JsonWebTokenError;
type TokenExpiredError = jwt.TokenExpiredError;

class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleJWTError = (err: JsonWebTokenError) => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = (err: TokenExpiredError) => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

const handleValidationError = (err: ValidationError) => {
  const errors = Object.values(err.errors).map(el => el);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: any, req: Request, res: Response) => {
  // Log the error
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err: any, req: Request, res: Response) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      errorId: (req as any).id || 'unknown'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'JsonWebTokenError') error = handleJWTError(error as JsonWebTokenError);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error as TokenExpiredError);
    if (error.name === 'ValidationError') error = handleValidationError(error as unknown as ValidationError);
    
    // Handle duplicate field values
    if (error.code === 11000) {
      const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
      const message = `Duplicate field value: ${value}. Please use another value!`;
      error = new AppError(message, 400);
    }
    
    // Handle invalid database IDs
    if (error.kind === 'ObjectId') {
      const message = `Invalid ${error.path}: ${error.value}`;
      error = new AppError(message, 400);
    }
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      const message = 'Invalid token. Please log in again!';
      error = new AppError(message, 401);
    }
    
    // Handle token expired error
    if (error.name === 'TokenExpiredError') {
      const message = 'Your token has expired! Please log in again.';
      error = new AppError(message, 401);
    }

    sendErrorProd(error, req, res);
  }
};

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default AppError;
