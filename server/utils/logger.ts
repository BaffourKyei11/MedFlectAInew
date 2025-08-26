import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { createHash } from 'crypto';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Create a hash of the log message to avoid duplicates
const hashMessage = (message: string) => {
  return createHash('md5').update(message).digest('hex').substring(0, 8);
};

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const messageHash = hashMessage(JSON.stringify({ message, ...meta }));
  return `[${timestamp}] [${level}] [${messageHash}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'medflect-ai' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Write all logs with level `info` and below to `combined.log`
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'rejections.log') }),
  ],
});

// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), consoleFormat),
    })
  );
}

// Create a stream for morgan
logger.stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
