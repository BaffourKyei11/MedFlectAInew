import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from "zod";
import { storage } from '../../server/storage';
import { groqService, GroqServiceError, GroqConfigurationError, GroqRateLimitError, GroqTimeoutError } from '../../server/services/groq';
import { createAppError, createValidationError, createNotFoundError } from '../../server/middleware/errorHandler';

// Enhanced validation schema
const generateSummarySchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  summaryType: z.enum(["discharge", "progress", "handoff"], {
    errorMap: () => ({ message: "Summary type must be one of: discharge, progress, handoff" })
  }),
  additionalContext: z.string().optional().max(1000, "Additional context must be less than 1000 characters"),
  options: z.object({
    includeMetadata: z.boolean().optional().default(true),
    maxTokens: z.number().min(100).max(4096).optional().default(2048),
    temperature: z.number().min(0).max(2).optional().default(0.1),
  }).optional().default({
    includeMetadata: true,
    maxTokens: 2048,
    temperature: 0.1,
  }),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error',
      message: 'Method not allowed',
      allowedMethods: ['POST'],
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Validate request body
    let validatedData;
    try {
      validatedData = generateSummarySchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const fieldErrors = validationError.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errorCode: 'VALIDATION_ERROR',
          errors: fieldErrors,
          timestamp: new Date().toISOString(),
        });
      }
      throw validationError;
    }

    const { patientId, summaryType, additionalContext, options } = validatedData;

    // Get patient data with error handling
    let patient;
    try {
      patient = await storage.getPatient(patientId);
    } catch (dbError) {
      console.error('Database error while fetching patient:', dbError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch patient data',
        errorCode: 'DATABASE_ERROR',
        timestamp: new Date().toISOString(),
      });
    }

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: `Patient not found with ID: ${patientId}`,
        errorCode: 'PATIENT_NOT_FOUND',
        patientId,
        timestamp: new Date().toISOString(),
      });
    }

    // Prepare patient data for AI with validation
    const patientData = {
      name: patient.name,
      mrn: patient.mrn,
      age: patient.dateOfBirth ? Math.floor((Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
      gender: patient.gender || undefined,
      chiefComplaint: "Chest pain", // This would come from current encounter
    };

    // Validate patient data
    if (!patientData.name || !patientData.mrn) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient data is incomplete',
        errorCode: 'INCOMPLETE_PATIENT_DATA',
        patientData,
        timestamp: new Date().toISOString(),
      });
    }

    // Generate AI summary with comprehensive error handling
    let aiResponse;
    try {
      aiResponse = await groqService.generateClinicalSummary({
        patientData,
        summaryType,
        additionalContext,
      });
    } catch (aiError) {
      // Handle specific AI service errors
      if (aiError instanceof GroqConfigurationError) {
        return res.status(503).json({
          status: 'error',
          message: 'AI service is not configured',
          errorCode: 'AI_SERVICE_NOT_CONFIGURED',
          details: aiError.message,
          timestamp: new Date().toISOString(),
        });
      }

      if (aiError instanceof GroqRateLimitError) {
        return res.status(429).json({
          status: 'error',
          message: 'AI service rate limit exceeded',
          errorCode: 'AI_RATE_LIMIT_EXCEEDED',
          details: aiError.message,
          retryAfter: aiError.retryAfter,
          timestamp: new Date().toISOString(),
        });
      }

      if (aiError instanceof GroqTimeoutError) {
        return res.status(504).json({
          status: 'error',
          message: 'AI service request timed out',
          errorCode: 'AI_TIMEOUT',
          details: aiError.message,
          timeout: aiError.timeout,
          timestamp: new Date().toISOString(),
        });
      }

      if (aiError instanceof GroqServiceError) {
        // Map AI service errors to appropriate HTTP status codes
        const statusCode = aiError.statusCode >= 400 && aiError.statusCode < 600 ? aiError.statusCode : 500;
        
        return res.status(statusCode).json({
          status: 'error',
          message: aiError.message,
          errorCode: aiError.errorCode,
          details: aiError.context,
          timestamp: new Date().toISOString(),
        });
      }

      // Handle unknown AI errors
      console.error('Unknown AI service error:', aiError);
      return res.status(500).json({
        status: 'error',
        message: 'AI service encountered an unexpected error',
        errorCode: 'AI_UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate AI response
    if (!aiResponse?.content || aiResponse.content.trim().length === 0) {
      return res.status(500).json({
        status: 'error',
        message: 'AI service returned empty content',
        errorCode: 'AI_EMPTY_RESPONSE',
        timestamp: new Date().toISOString(),
      });
    }

    // Save to storage with error handling
    let summary;
    try {
      summary = await storage.createClinicalSummary({
        patientId,
        userId: "system", // In production, get from session
        type: summaryType,
        content: aiResponse.content,
        aiGenerated: true,
        groqModel: aiResponse.model,
        generationTime: aiResponse.generationTimeMs,
        status: "draft",
        metadata: options?.includeMetadata ? {
          additionalContext,
          options,
          generationTimestamp: new Date().toISOString(),
        } : undefined,
      });
    } catch (storageError) {
      console.error('Storage error while saving summary:', storageError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to save summary to storage',
        errorCode: 'STORAGE_ERROR',
        timestamp: new Date().toISOString(),
      });
    }

    // Create audit log with error handling
    try {
      await storage.createAuditLog({
        userId: "system",
        action: "ai_summary_generated",
        resource: "clinical_summary",
        resourceId: summary.id,
        details: {
          summaryType,
          patientId,
          generationTimeMs: aiResponse.generationTimeMs,
          model: aiResponse.model,
          tokensUsed: aiResponse.tokensUsed,
          additionalContext: additionalContext ? true : false,
        },
      });
    } catch (auditError) {
      // Log audit error but don't fail the request
      console.error('Failed to create audit log:', auditError);
    }

    // Return successful response
    const response = {
      id: summary.id,
      content: aiResponse.content,
      generationTime: aiResponse.generationTimeMs,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      patient: {
        id: patient.id,
        name: patient.name,
        mrn: patient.mrn,
      },
      summaryType,
      status: summary.status,
      createdAt: summary.createdAt,
      metadata: options?.includeMetadata ? {
        additionalContext,
        options,
        generationTimestamp: new Date().toISOString(),
      } : undefined,
    };

    res.status(200).json({
      status: 'success',
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    // Handle unexpected errors
    console.error("AI summary generation failed with unexpected error:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to generate AI summary',
      errorCode: 'UNEXPECTED_ERROR',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
    });
  }
}