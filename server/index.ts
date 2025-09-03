import express, { type Request, Response } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { corsConfig, securityHeaders, apiLimiter, csrfProtection } from "./middleware/security";
import { globalErrorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";
import morgan from "morgan";

const app = express();

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security Middleware
app.use(corsConfig);
app.use(securityHeaders);
app.use(apiLimiter);
app.use(csrfProtection);

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      response: capturedJsonResponse
    };

    if (path.startsWith("/api")) {
      if (res.statusCode >= 400) {
        logger.error(`API Error: ${res.statusCode}`, logData);
      } else {
        logger.info(`API Request: ${req.method} ${path}`, logData);
      }
    }
  });

  next();
});

// Request logging is now handled by the morgan middleware and our custom logger

(async () => {
  const server = await registerRoutes(app);

  // Handle 404 - Must be after all other routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      status: 'error',
      message: `Can't find ${req.originalUrl} on this server!`
    });
  });

  // Global error handling middleware
  app.use(globalErrorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  });
})();