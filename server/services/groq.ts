import { z } from "zod";
import logger from '../utils/logger';

const GROQ_BASE_URL = process.env.GROQ_BASE_URL;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const isGroqConfigured = GROQ_BASE_URL && GROQ_API_KEY;

const GROQ_MODEL = process.env.GROQ_MODEL || "groq/deepseek-r1-distill-llama-70b";

// Custom error types for Groq service
export class GroqServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'GroqServiceError';
  }
}

export class GroqConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GroqConfigurationError';
  }
}

export class GroqRateLimitError extends Error {
  constructor(message: string, public retryAfter?: number) {
    super(message);
    this.name = 'GroqRateLimitError';
  }
}

export class GroqTimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'GroqTimeoutError';
  }
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
    completion_time?: number;
  };
}

export interface AISummaryRequest {
  patientData: {
    name: string;
    mrn: string;
    age?: number;
    gender?: string;
    chiefComplaint?: string;
    vitals?: any;
    medications?: any[];
    labResults?: any[];
  };
  summaryType: "discharge" | "progress" | "handoff";
  additionalContext?: string;
}

export interface AISummaryResponse {
  content: string;
  generationTimeMs: number;
  model: string;
  tokensUsed?: number;
}

export class GroqService {
  private maxRetries = 3;
  private retryDelay = 1000;
  private requestTimeout = 30000;

  private async makeRequest(messages: any[], retryCount = 0): Promise<GroqResponse> {
    if (!isGroqConfigured) {
      throw new GroqConfigurationError(
        "GROQ service is not configured. Please set GROQ_BASE_URL and GROQ_API_KEY environment variables."
      );
    }

    const startTime = Date.now();
    
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      const response = await fetch(`${GROQ_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: 0.1,
          max_tokens: 2048,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new GroqServiceError(
            'Invalid GROQ API key. Please check your configuration.',
            401,
            'INVALID_API_KEY',
            { responseStatus: response.status, errorData }
          );
        } else if (response.status === 403) {
          throw new GroqServiceError(
            'Access denied to GROQ API. Please check your API key permissions.',
            403,
            'ACCESS_DENIED',
            { responseStatus: response.status, errorData }
          );
        } else if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;
          
          throw new GroqRateLimitError(
            'GROQ API rate limit exceeded. Please try again later.',
            retryAfterSeconds
          );
        } else if (response.status >= 500) {
          throw new GroqServiceError(
            'GROQ API server error. Please try again later.',
            response.status,
            'SERVER_ERROR',
            { responseStatus: response.status, errorData }
          );
        } else {
          throw new GroqServiceError(
            `GROQ API error: ${response.status} - ${errorData.message || errorText}`,
            response.status,
            'API_ERROR',
            { responseStatus: response.status, errorData }
          );
        }
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new GroqServiceError(
          'Invalid response format from GROQ API',
          500,
          'INVALID_RESPONSE_FORMAT',
          { responseData: data }
        );
      }

      return data;
    } catch (error) {
      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new GroqTimeoutError(
          `GROQ API request timed out after ${this.requestTimeout}ms`,
          this.requestTimeout
        );
      }

      // Handle rate limit errors with retry logic
      if (error instanceof GroqRateLimitError && retryCount < this.maxRetries) {
        const delay = error.retryAfter ? error.retryAfter * 1000 : this.retryDelay * Math.pow(2, retryCount);
        
        logger.warn('GROQ API rate limited, retrying...', {
          retryCount: retryCount + 1,
          maxRetries: this.maxRetries,
          delay,
          retryAfter: error.retryAfter,
          timestamp: new Date().toISOString(),
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(messages, retryCount + 1);
      }

      // Handle server errors with retry logic
      if (error instanceof GroqServiceError && error.statusCode >= 500 && retryCount < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryCount);
        
        logger.warn('GROQ API server error, retrying...', {
          retryCount: retryCount + 1,
          maxRetries: this.maxRetries,
          delay,
          statusCode: error.statusCode,
          errorCode: error.errorCode,
          timestamp: new Date().toISOString(),
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(messages, retryCount + 1);
      }

      // Log the error with context
      logger.error('GROQ API request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name,
        retryCount,
        maxRetries: this.maxRetries,
        requestTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        context: error instanceof GroqServiceError ? error.context : undefined,
      });

      throw error;
    }
  }

  async generateClinicalSummary(request: AISummaryRequest): Promise<AISummaryResponse> {
    const startTime = Date.now();
    
    try {
      // Validate request data
      if (!request.patientData?.name || !request.patientData?.mrn) {
        throw new GroqServiceError(
          'Patient name and MRN are required for summary generation',
          400,
          'INVALID_REQUEST_DATA',
          { patientData: request.patientData }
        );
      }

      if (!['discharge', 'progress', 'handoff'].includes(request.summaryType)) {
        throw new GroqServiceError(
          'Invalid summary type. Must be one of: discharge, progress, handoff',
          400,
          'INVALID_SUMMARY_TYPE',
          { summaryType: request.summaryType }
        );
      }

      const systemPrompt = this.buildSystemPrompt(request.summaryType);
      const userPrompt = this.buildUserPrompt(request);

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      logger.info('Generating clinical summary', {
        patientId: request.patientData.mrn,
        summaryType: request.summaryType,
        timestamp: new Date().toISOString(),
      });

      const response = await this.makeRequest(messages);
      const generationTimeMs = Date.now() - startTime;

      // Validate response content
      const content = response.choices[0]?.message?.content;
      if (!content || content.trim().length === 0) {
        throw new GroqServiceError(
          'Generated summary is empty or invalid',
          500,
          'EMPTY_SUMMARY',
          { response, generationTimeMs }
        );
      }

      logger.info('Clinical summary generated successfully', {
        patientId: request.patientData.mrn,
        summaryType: request.summaryType,
        generationTimeMs,
        tokensUsed: response.usage?.total_tokens,
        contentLength: content.length,
        timestamp: new Date().toISOString(),
      });

      return {
        content: content.trim(),
        generationTimeMs,
        model: GROQ_MODEL,
        tokensUsed: response.usage?.total_tokens,
      };
    } catch (error) {
      const generationTimeMs = Date.now() - startTime;
      
      logger.error('Failed to generate clinical summary', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name,
        patientId: request.patientData?.mrn,
        summaryType: request.summaryType,
        generationTimeMs,
        timestamp: new Date().toISOString(),
        context: error instanceof GroqServiceError ? error.context : undefined,
      });

      throw error;
    }
  }

  private buildSystemPrompt(summaryType: string): string {
    const basePrompt = `You are an expert clinical AI assistant trained in medical documentation and FHIR standards. Generate accurate, professional clinical summaries that follow medical best practices.`;
    
    switch (summaryType) {
      case "discharge":
        return `${basePrompt} Create a comprehensive discharge summary including: hospital course, assessment and plan, medications, follow-up instructions, and patient education. Use clear, professional medical language.`;
      
      case "progress":
        return `${basePrompt} Create a concise progress note including: subjective findings, objective data, assessment, and plan (SOAP format). Focus on current clinical status and immediate care needs.`;
      
      case "handoff":
        return `${basePrompt} Create a structured handoff report including: current clinical status, active issues, pending tasks, and critical information for continuity of care. Be concise but comprehensive.`;
      
      default:
        return basePrompt;
    }
  }

  private buildUserPrompt(request: AISummaryRequest): string {
    const { patientData, additionalContext } = request;
    
    let prompt = `Patient Information:
- Name: ${patientData.name}
- MRN: ${patientData.mrn}`;
    
    if (patientData.age) prompt += `\n- Age: ${patientData.age}`;
    if (patientData.gender) prompt += `\n- Gender: ${patientData.gender}`;
    if (patientData.chiefComplaint) prompt += `\n- Chief Complaint: ${patientData.chiefComplaint}`;
    
    if (patientData.vitals) {
      prompt += `\n\nVital Signs: ${JSON.stringify(patientData.vitals)}`;
    }
    
    if (patientData.medications && patientData.medications.length > 0) {
      prompt += `\n\nMedications: ${patientData.medications.map(med => typeof med === 'string' ? med : JSON.stringify(med)).join(', ')}`;
    }
    
    if (patientData.labResults && patientData.labResults.length > 0) {
      prompt += `\n\nLab Results: ${patientData.labResults.map(lab => typeof lab === 'string' ? lab : JSON.stringify(lab)).join(', ')}`;
    }
    
    if (additionalContext) {
      prompt += `\n\nAdditional Context: ${additionalContext}`;
    }
    
    prompt += `\n\nPlease generate a professional clinical summary based on this information.`;
    
    return prompt;
  }

  async checkStatus(): Promise<{ status: string; model: string; latency?: number; error?: string }> {
    if (!isGroqConfigured) {
      return {
        status: "not_configured",
        model: GROQ_MODEL,
        error: "GROQ_BASE_URL and GROQ_API_KEY environment variables are not set",
      };
    }

    try {
      const startTime = Date.now();
      const response = await fetch(`${GROQ_BASE_URL}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        logger.info('GROQ API status check successful', {
          latency,
          timestamp: new Date().toISOString(),
        });

        return {
          status: "connected",
          model: GROQ_MODEL,
          latency,
        };
      } else {
        const errorText = await response.text();
        logger.warn('GROQ API status check failed', {
          status: response.status,
          error: errorText,
          latency,
          timestamp: new Date().toISOString(),
        });

        return {
          status: "error",
          model: GROQ_MODEL,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }
    } catch (error) {
      logger.error('GROQ API status check failed with exception', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name,
        timestamp: new Date().toISOString(),
      });

      return {
        status: "disconnected",
        model: GROQ_MODEL,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Method to update configuration
  updateConfiguration(baseUrl?: string, apiKey?: string, model?: string) {
    if (baseUrl) {
      process.env.GROQ_BASE_URL = baseUrl;
    }
    if (apiKey) {
      process.env.GROQ_API_KEY = apiKey;
    }
    if (model) {
      process.env.GROQ_MODEL = model;
    }
    
    // Update local variables
    Object.assign(this, {
      GROQ_BASE_URL: process.env.GROQ_BASE_URL,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      GROQ_MODEL: process.env.GROQ_MODEL || "groq/deepseek-r1-distill-llama-70b",
    });

    logger.info('GROQ service configuration updated', {
      baseUrl: baseUrl ? '***UPDATED***' : 'unchanged',
      apiKey: apiKey ? '***UPDATED***' : 'unchanged',
      model: model || 'unchanged',
      timestamp: new Date().toISOString(),
    });
  }

  // Method to get current configuration (without sensitive data)
  getConfiguration() {
    return {
      baseUrl: GROQ_BASE_URL ? '***CONFIGURED***' : '***NOT_SET***',
      model: GROQ_MODEL,
      isConfigured: isGroqConfigured,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      requestTimeout: this.requestTimeout,
    };
  }
}

export const groqService = new GroqService();
