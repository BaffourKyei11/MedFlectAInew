import { apiRequest } from "@/lib/queryClient";
import { APIError, ValidationError, NetworkError } from "@/lib/queryClient";

export interface GenerateSummaryRequest {
  patientId: string;
  summaryType: "discharge" | "progress" | "handoff";
  additionalContext?: string;
  options?: {
    includeMetadata?: boolean;
    maxTokens?: number;
    temperature?: number;
  };
}

export interface GenerateSummaryResponse {
  id: string;
  content: string;
  generationTime: number;
  model: string;
  tokensUsed?: number;
  patient: {
    id: string;
    name: string;
    mrn: string;
  };
  summaryType: string;
  status: string;
  createdAt: string;
  metadata?: any;
}

export interface UpdateSummaryRequest {
  content: string;
  status?: "draft" | "finalized";
}

export interface AIStatusResponse {
  status: string;
  model: string;
  latency?: number;
  error?: string;
}

// Custom error types for AI service
export class AIServiceError extends Error {
  constructor(
    message: string,
    public errorCode: string,
    public statusCode?: number,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class AISummaryGenerationError extends AIServiceError {
  constructor(message: string, errorCode: string, statusCode?: number, context?: Record<string, any>) {
    super(message, errorCode, statusCode, context);
    this.name = 'AISummaryGenerationError';
  }
}

export class AIValidationError extends AIServiceError {
  constructor(message: string, field?: string, value?: any) {
    super(message, 'VALIDATION_ERROR', 400, { field, value });
    this.name = 'AIValidationError';
  }
}

export class AIServiceUnavailableError extends AIServiceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SERVICE_UNAVAILABLE', 503, context);
    this.name = 'AIServiceUnavailableError';
  }
}

export class AIRateLimitError extends AIServiceError {
  constructor(message: string, public retryAfter?: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'AIRateLimitError';
  }
}

export class AITimeoutError extends AIServiceError {
  constructor(message: string, public timeout: number) {
    super(message, 'TIMEOUT', 504, { timeout });
    this.name = 'AITimeoutError';
  }
}

export class AIService {
  private static async handleAIResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any;
      
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      // Map error codes to specific error types
      const errorCode = errorData.errorCode || 'UNKNOWN_ERROR';
      const message = errorData.message || `Request failed with status ${response.status}`;
      const context = errorData.details || {};

      switch (response.status) {
        case 400:
          if (errorCode === 'VALIDATION_ERROR') {
            throw new AIValidationError(message, context.field, context.value);
          }
          throw new AIServiceError(message, errorCode, response.status, context);
          
        case 401:
          throw new AIServiceError('Authentication required', 'UNAUTHORIZED', response.status, context);
          
        case 403:
          throw new AIServiceError('Access denied', 'FORBIDDEN', response.status, context);
          
        case 404:
          if (errorCode === 'PATIENT_NOT_FOUND') {
            throw new AIServiceError(`Patient not found: ${context.patientId}`, errorCode, response.status, context);
          }
          throw new AIServiceError(message, errorCode, response.status, context);
          
        case 429:
          throw new AIRateLimitError(message, context.retryAfter);
          
        case 503:
          if (errorCode === 'AI_SERVICE_NOT_CONFIGURED') {
            throw new AIServiceUnavailableError('AI service is not configured. Please contact your administrator.', context);
          }
          throw new AIServiceUnavailableError(message, context);
          
        case 504:
          throw new AITimeoutError(message, context.timeout || 30000);
          
        default:
          if (response.status >= 500) {
            throw new AIServiceError(message, errorCode, response.status, context);
          } else {
            throw new AIServiceError(message, errorCode, response.status, context);
          }
      }
    }

    return response.json();
  }

  static async generateSummary(request: GenerateSummaryRequest): Promise<GenerateSummaryResponse> {
    try {
      // Validate request data
      if (!request.patientId) {
        throw new AIValidationError('Patient ID is required');
      }
      
      if (!['discharge', 'progress', 'handoff'].includes(request.summaryType)) {
        throw new AIValidationError(
          'Invalid summary type. Must be one of: discharge, progress, handoff',
          'summaryType',
          request.summaryType
        );
      }

      if (request.additionalContext && request.additionalContext.length > 1000) {
        throw new AIValidationError(
          'Additional context must be less than 1000 characters',
          'additionalContext',
          request.additionalContext.length
        );
      }

      const response = await apiRequest("POST", "/api/ai/summarize", request, {
        retries: 3,
        retryDelay: 2000,
        timeout: 60000, // 60 seconds for AI generation
      });

      const result = await this.handleAIResponse<{ data: GenerateSummaryResponse }>(response);
      return result.data;
    } catch (error) {
      // Re-throw AI service errors as-is
      if (error instanceof AIServiceError) {
        throw error;
      }

      // Handle network and other errors
      if (error instanceof NetworkError) {
        throw new AIServiceError(
          'Network error while generating summary. Please check your connection and try again.',
          'NETWORK_ERROR',
          undefined,
          { originalError: error.message }
        );
      }

      if (error instanceof APIError) {
        throw new AIServiceError(
          error.message,
          'API_ERROR',
          error.status,
          { originalError: error }
        );
      }

      // Handle validation errors
      if (error instanceof ValidationError) {
        throw new AIValidationError(
          error.message,
          error.field,
          error.value
        );
      }

      // Handle unknown errors
      throw new AIServiceError(
        'An unexpected error occurred while generating the summary',
        'UNKNOWN_ERROR',
        undefined,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  static async updateSummary(id: string, request: UpdateSummaryRequest): Promise<any> {
    try {
      // Validate request data
      if (!request.content || request.content.trim().length === 0) {
        throw new AIValidationError('Summary content cannot be empty', 'content');
      }

      if (request.status && !['draft', 'finalized'].includes(request.status)) {
        throw new AIValidationError(
          'Invalid status. Must be one of: draft, finalized',
          'status',
          request.status
        );
      }

      const response = await apiRequest("PUT", `/api/summaries/${id}`, request, {
        retries: 2,
        retryDelay: 1000,
        timeout: 30000,
      });

      return await this.handleAIResponse(response);
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      throw new AIServiceError(
        'Failed to update summary',
        'UPDATE_FAILED',
        undefined,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  static async saveSummaryToFHIR(summaryId: string): Promise<any> {
    try {
      if (!summaryId) {
        throw new AIValidationError('Summary ID is required', 'summaryId');
      }

      const response = await apiRequest("POST", `/api/fhir/save-summary/${summaryId}`, undefined, {
        retries: 2,
        retryDelay: 1000,
        timeout: 30000,
      });

      return await this.handleAIResponse(response);
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      throw new AIServiceError(
        'Failed to save summary to FHIR',
        'FHIR_SAVE_FAILED',
        undefined,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  static async getStatus(): Promise<AIStatusResponse> {
    try {
      const response = await apiRequest("GET", "/api/ai/status", undefined, {
        retries: 2,
        retryDelay: 1000,
        timeout: 10000,
      });

      return await this.handleAIResponse<AIStatusResponse>(response);
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }

      throw new AIServiceError(
        'Failed to get AI service status',
        'STATUS_CHECK_FAILED',
        undefined,
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  // Utility method to check if an error is retryable
  static isRetryableError(error: Error): boolean {
    if (error instanceof AIServiceError) {
      // Don't retry validation errors or authentication errors
      if (['VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'PATIENT_NOT_FOUND'].includes(error.errorCode)) {
        return false;
      }
      
      // Retry server errors and rate limit errors
      if (error.statusCode && error.statusCode >= 500) {
        return true;
      }
      
      if (error instanceof AIRateLimitError) {
        return true;
      }
    }
    
    // Retry network errors
    if (error instanceof NetworkError) {
      return true;
    }
    
    return false;
  }

  // Utility method to get retry delay for an error
  static getRetryDelay(error: Error, attempt: number): number {
    if (error instanceof AIRateLimitError && error.retryAfter) {
      return error.retryAfter * 1000;
    }
    
    // Exponential backoff with jitter
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 0.1 * delay;
    
    return delay + jitter;
  }

  // Utility method to format error messages for user display
  static formatErrorMessage(error: Error): string {
    if (error instanceof AIServiceError) {
      return error.message;
    }
    
    if (error instanceof NetworkError) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error instanceof ValidationError) {
      return `Validation error: ${error.message}`;
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}
