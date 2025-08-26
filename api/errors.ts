import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const errorLogSchema = z.object({
  errorId: z.string(),
  message: z.string().optional(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  context: z.string().optional(),
  timestamp: z.string(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error',
      message: 'Method not allowed' 
    });
  }

  try {
    // Validate request body
    const validatedData = errorLogSchema.parse(req.body);
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error Logged:', {
        errorId: validatedData.errorId,
        message: validatedData.message,
        context: validatedData.context,
        url: validatedData.url,
        timestamp: validatedData.timestamp,
      });
    }

    // In production, you would log to an external service like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging service
    
    // For now, we'll just acknowledge receipt
    // In production, implement proper error logging:
    /*
    await logErrorToService({
      ...validatedData,
      environment: process.env.NODE_ENV,
      serverTimestamp: new Date().toISOString(),
    });
    */

    res.status(200).json({
      status: 'success',
      message: 'Error logged successfully',
      errorId: validatedData.errorId,
    });
  } catch (error) {
    console.error('Failed to log client error:', error);
    
    // Don't fail the error logging request itself
    res.status(200).json({
      status: 'success',
      message: 'Error logged successfully',
      errorId: req.body?.errorId || 'unknown',
    });
  }
}
