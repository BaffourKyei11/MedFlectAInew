import { Express } from 'express';
import healthRouter from './health';
import { apiLimiter } from '../middleware/security';

// Import other route modules here
// import authRouter from './auth';
// import apiRouter from './api';

export const registerRoutes = async (app: Express) => {
  // Health check routes (no rate limiting)
  app.use('/api/health', healthRouter);

  // Apply rate limiting to all API routes
  // app.use('/api', apiLimiter);

  // Register other routes
  // app.use('/api/auth', authRouter);
  // app.use('/api/v1', apiRouter);

  // Return the Express app for chaining
  return app;
};

export default registerRoutes;
