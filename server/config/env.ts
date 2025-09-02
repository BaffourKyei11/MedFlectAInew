import { z } from 'zod';
import { config } from 'dotenv';
import logger from '../utils/logger';

// Load environment variables from .env file
config({ path: '../../.env' });

// Define the schema for our environment variables
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
    
  // Server Configuration
  PORT: z
    .string()
    .default('3000')
    .transform(Number)
    .refine((port) => port > 0 && port < 65536, {
      message: 'PORT must be between 1 and 65535',
    }),
    
  // Database Configuration
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid database connection URL'),
    
  // Session Configuration
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters'),
    
  // JWT Configuration
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z
    .string()
    .default('1h')
    .describe('JWT expiration time (e.g., 1h, 7d)'),
    
  // CORS Configuration
  CORS_ORIGIN: z
    .string()
    .default('*')
    .transform((origin) => origin.split(',')),
    
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000') // 15 minutes
    .transform(Number),
  RATE_LIMIT_MAX: z
    .string()
    .default('100')
    .transform(Number),
    
  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
});

// Parse the environment variables
const envVars = envSchema.safeParse(process.env);

// If validation fails, log the errors and exit the process
if (!envVars.success) {
  const errorMessage = `Invalid environment variables:\n${
    envVars.error.errors
      .map((err) => `- ${err.path.join('.')}: ${err.message}`)
      .join('\n')
  }`;
  
  logger.error(errorMessage);
  process.exit(1);
}

// Export the validated environment variables
export const env = envVars.data;

// Log the current environment
logger.info(`Environment: ${env.NODE_ENV}`);

// Export the schema for testing purposes
export const envSchemaForTesting = envSchema;
