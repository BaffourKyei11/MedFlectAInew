import { Router, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import { db, checkDatabaseHealth } from '../db';
import logger from '../utils/logger';
import { catchAsync, createAppError } from '../middleware/errorHandler';

const router = Router();

// Simple health check endpoint
router.get('/', catchAsync(async (req: Request, res: Response) => {
  try {
    // Check database connection with timeout
    const dbHealth = await Promise.race([
      checkDatabaseHealth(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database health check timeout')), 5000)
      )
    ]) as Awaited<ReturnType<typeof checkDatabaseHealth>>;
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbHealth.status,
        latency: dbHealth.latency,
        details: dbHealth.details,
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };

    // Set appropriate status code based on health
    if (dbHealth.status === 'unhealthy') {
      res.status(503);
      healthStatus.status = 'degraded';
    } else if (dbHealth.status === 'degraded') {
      res.status(200);
      healthStatus.status = 'degraded';
    } else {
      res.status(200);
    }

    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    res.status(503).json({
      status: 'error',
      message: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      database: {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    });
  }
}));

// Detailed health check with validation
export const detailedHealthCheck = [
  check('detailed').optional().isBoolean().toBoolean(),
  check('timeout').optional().isInt({ min: 1000, max: 30000 }).toInt(),
  
  catchAsync(async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Invalid request parameters',
          errors: errors.array(),
          timestamp: new Date().toISOString(),
        });
      }

      const { detailed = false, timeout = 10000 } = req.query;
      const timeoutMs = Array.isArray(timeout) ? 10000 : (typeof timeout === 'string' ? parseInt(timeout, 10) : (typeof timeout === 'number' ? timeout : 10000));
      
      const startTime = Date.now();
      
      // Basic health metrics
      const health: any = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: {
          status: 'unknown',
          latency: 0,
        },
      };

      try {
        // Enhanced database health check with timeout
        const dbHealth = await Promise.race([
          checkDatabaseHealth(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database health check timeout')), timeoutMs)
          )
        ]) as Awaited<ReturnType<typeof checkDatabaseHealth>>;
        
        health.database = {
          status: dbHealth.status,
          latency: dbHealth.latency,
          details: dbHealth.details,
          error: dbHealth.error,
        };
        
        // Update overall status based on database health
        if (dbHealth.status === 'unhealthy') {
          health.status = 'degraded';
        } else if (dbHealth.status === 'degraded') {
          health.status = 'degraded';
        }
        
      } catch (dbError) {
        health.database = {
          status: 'unhealthy',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error',
          latency: Date.now() - startTime,
        };
        health.status = 'degraded';
      }

      // Additional detailed checks
      if (detailed) {
        try {
          // System information
          health.system = {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            pid: process.pid,
            title: process.title,
          };

          // Memory details
          health.memory = {
            ...process.memoryUsage(),
            external: (process.memoryUsage() as any).external || 0,
            arrayBuffers: (process.memoryUsage() as any).arrayBuffers || 0,
          };

          // CPU usage (if available)
          if (process.cpuUsage) {
            health.cpu = process.cpuUsage();
          }

          // Environment variables (sanitized)
          health.environment = {
            nodeEnv: process.env.NODE_ENV,
            port: process.env.PORT,
            databaseUrl: process.env.DATABASE_URL ? '***CONFIGURED***' : '***NOT_SET***',
            groqConfigured: !!(process.env.GROQ_BASE_URL && process.env.GROQ_API_KEY),
            fhirConfigured: !!process.env.FHIR_BASE_URL,
          };

          // Check external service dependencies
          health.externalServices = {
            groq: {
              configured: !!(process.env.GROQ_BASE_URL && process.env.GROQ_API_KEY),
              baseUrl: process.env.GROQ_BASE_URL ? '***CONFIGURED***' : '***NOT_SET***',
            },
            fhir: {
              configured: !!process.env.FHIR_BASE_URL,
              baseUrl: process.env.FHIR_BASE_URL ? '***CONFIGURED***' : '***NOT_SET***',
            },
          };

        } catch (detailError) {
          logger.warn('Failed to gather detailed health information', {
            error: detailError instanceof Error ? detailError.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          });
          
          health.detailedInfoError = detailError instanceof Error ? detailError.message : 'Unknown error';
        }
      }

      // Calculate total response time
      const totalTime = Date.now() - startTime;
      health.responseTime = totalTime;

      // Set appropriate status code
      if (health.status === 'degraded') {
        res.status(200); // Still operational but with issues
      } else if (health.status === 'error') {
        res.status(503);
      } else {
        res.status(200);
      }

      res.json(health);
      
    } catch (error) {
      logger.error('Detailed health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      res.status(503).json({
        status: 'error',
        message: 'Service Unavailable',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
      });
    }
  }),
];

// Mount the detailed health check at /api/health/detailed
router.get('/detailed', ...detailedHealthCheck);

// Database-specific health check
router.get('/database', catchAsync(async (req: Request, res: Response) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.status === 'unhealthy') {
      res.status(503);
    } else if (dbHealth.status === 'degraded') {
      res.status(200);
    } else {
      res.status(200);
    }

    res.json({
      status: dbHealth.status,
      timestamp: new Date().toISOString(),
      database: dbHealth,
    });
  } catch (error) {
    logger.error('Database health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    res.status(503).json({
      status: 'error',
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}));

// Memory health check
router.get('/memory', catchAsync(async (req: Request, res: Response) => {
  try {
    const memoryUsage = process.memoryUsage();
    const maxHeapSize = (process as any).maxOldGenerationSize || 0;
    
    // Calculate memory usage percentages
    const heapUsedPercent = maxHeapSize > 0 ? (memoryUsage.heapUsed / maxHeapSize) * 100 : 0;
    const rssPercent = memoryUsage.rss / (1024 * 1024 * 1024) * 100; // Convert to GB percentage
    
    const memoryHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      usage: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external || 0,
        rss: memoryUsage.rss,
        arrayBuffers: (memoryUsage as any).arrayBuffers || 0,
      },
      percentages: {
        heapUsed: heapUsedPercent,
        rss: rssPercent,
      },
      limits: {
        maxHeapSize,
        maxRss: 1024 * 1024 * 1024, // 1GB
      },
    };

    // Determine memory health status
    if (heapUsedPercent > 90 || rssPercent > 90) {
      memoryHealth.status = 'critical';
      res.status(200); // Still operational but critical
    } else if (heapUsedPercent > 75 || rssPercent > 75) {
      memoryHealth.status = 'warning';
      res.status(200);
    } else {
      memoryHealth.status = 'ok';
      res.status(200);
    }

    res.json(memoryHealth);
  } catch (error) {
    logger.error('Memory health check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      status: 'error',
      message: 'Memory health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router;
