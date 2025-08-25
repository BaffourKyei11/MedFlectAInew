import { z } from "zod";

const GROQ_BASE_URL = process.env.GROQ_BASE_URL;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const isGroqConfigured = GROQ_BASE_URL && GROQ_API_KEY;

const GROQ_MODEL = process.env.GROQ_MODEL || "groq/deepseek-r1-distill-llama-70b";

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
  private async makeRequest(messages: any[]): Promise<GroqResponse> {
    if (!isGroqConfigured) {
      // Return a mock response when GROQ is not configured
      return {
        choices: [{
          message: {
            content: "Clinical summary service is not available in development mode. Please configure GROQ API credentials to enable AI-powered summaries."
          }
        }],
        usage: {
          total_tokens: 0,
          completion_time: 100
        }
      };
    }

    const startTime = Date.now();
    
    try {
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
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Groq API request failed:', error);
      throw error;
    }
  }

  async generateClinicalSummary(request: AISummaryRequest): Promise<AISummaryResponse> {
    const startTime = Date.now();
    
    const systemPrompt = this.buildSystemPrompt(request.summaryType);
    const userPrompt = this.buildUserPrompt(request);

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const response = await this.makeRequest(messages);
    const generationTimeMs = Date.now() - startTime;

    return {
      content: response.choices[0]?.message?.content || "",
      generationTimeMs,
      model: GROQ_MODEL,
      tokensUsed: response.usage?.total_tokens,
    };
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

  async checkStatus(): Promise<{ status: string; model: string; latency?: number }> {
    if (!isGroqConfigured) {
      return {
        status: "not_configured",
        model: GROQ_MODEL,
      };
    }

    try {
      const startTime = Date.now();
      const response = await fetch(`${GROQ_BASE_URL}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
      });
      
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        return {
          status: "connected",
          model: GROQ_MODEL,
          latency,
        };
      } else {
        return {
          status: "error",
          model: GROQ_MODEL,
        };
      }
    } catch (error) {
      return {
        status: "disconnected",
        model: GROQ_MODEL,
      };
    }
  }
}

export const groqService = new GroqService();
