import { Counter, Gauge, Histogram, collectDefaultMetrics, Registry } from 'prom-client';
import responseTime from 'response-time';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Create a registry to hold the metrics
const register = new Registry();

// Enable collection of default Node.js metrics
collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500],
});

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestErrorsTotal = new Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP requests resulting in errors',
  labelNames: ['method', 'route', 'status_code'],
});

const databaseQueriesTotal = new Counter({
  name: 'database_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table'],
});

const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_ms',
  help: 'Duration of database queries in ms',
  labelNames: ['operation', 'table'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Register all metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestErrorsTotal);
register.registerMetric(databaseQueriesTotal);
register.registerMetric(databaseQueryDuration);
register.registerMetric(activeConnections);

// Middleware to track HTTP request metrics
export const httpMetricsMiddleware = responseTime((req: Request, res: Response, time: number) => {
  const route = req.route ? req.route.path : req.path;
  const statusCode = res.statusCode;
  
  httpRequestDurationMicroseconds
    .labels(req.method, route, statusCode.toString())
    .observe(time);
    
  httpRequestsTotal.inc({
    method: req.method,
    route,
    status_code: statusCode,
  });

  if (statusCode >= 400) {
    httpRequestErrorsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });
    
    logger.warn(`HTTP Error: ${statusCode} - ${req.method} ${req.originalUrl}`, {
      status: statusCode,
      method: req.method,
      url: req.originalUrl,
      duration: time,
    });
  }
});

// Function to track database query metrics
export const trackQuery = async <T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const end = databaseQueryDuration.startTimer({ operation, table });
  
  try {
    databaseQueriesTotal.inc({ operation, table });
    activeConnections.inc(1);
    
    const result = await queryFn();
    
    return result;
  } catch (error) {
    logger.error('Database query failed', {
      operation,
      table,
      error: error.message,
      stack: error.stack,
    });
    
    throw error;
  } finally {
    end();
    activeConnections.dec(1);
  }
};

// Endpoint to expose metrics
export const metricsHandler = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Failed to collect metrics', { error });
    res.status(500).end('Failed to collect metrics');
  }
};

export default {
  register,
  httpMetricsMiddleware,
  trackQuery,
  metricsHandler,
  metrics: {
    httpRequestDurationMicroseconds,
    httpRequestsTotal,
    httpRequestErrorsTotal,
    databaseQueriesTotal,
    databaseQueryDuration,
    activeConnections,
  },
};
