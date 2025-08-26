import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import { db } from '../db';
import logger from '../utils/logger';

const router = Router();

// Simple health check endpoint
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      status: 'error',
      message: 'Service Unavailable',
      database: 'disconnected',
    });
  }
});

// Detailed health check with validation
export const detailedHealthCheck = [
  // Add any additional validation if needed
  check('detailed').optional().isBoolean().toBoolean(),
  
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error',
          errors: errors.array() 
        });
      }

      const { detailed } = req.query;
      const health: any = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected',
      };

      if (detailed) {
        health.env = process.env.NODE_ENV;
        health.nodeVersion = process.version;
        health.platform = process.platform;
        
        try {
          // Additional checks for external services can be added here
          const dbStatus = await db.query('SELECT version()');
          health.database = {
            status: 'connected',
            version: dbStatus.rows[0]?.version,
          };
        } catch (error) {
          health.database = {
            status: 'error',
            message: error.message,
          };
          throw new Error('Database connection failed');
        }
      }

      res.status(200).json(health);
    } catch (error) {
      logger.error('Detailed health check failed', { error });
      res.status(503).json({
        status: 'error',
        message: 'Service Unavailable',
        error: error.message,
      });
    }
  },
];

// Mount the detailed health check at /api/health/detailed
router.get('/detailed', ...detailedHealthCheck);

export default router;
