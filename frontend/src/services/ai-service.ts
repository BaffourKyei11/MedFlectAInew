import { apiRequest } from "@/lib/queryClient";

export interface GenerateSummaryRequest {
  patientId: string;
  summaryType: "discharge" | "progress" | "handoff";
  additionalContext?: string;
}

export interface GenerateSummaryResponse {
  id: string;
  content: string;
  generationTime: number;
  model: string;
  tokensUsed?: number;
}

export interface UpdateSummaryRequest {
  content: string;
  status?: "draft" | "finalized";
}

export class AIService {
  static async generateSummary(request: GenerateSummaryRequest): Promise<GenerateSummaryResponse> {
    const response = await apiRequest("POST", "/api/ai/summarize", request);
    return response.json();
  }

  static async updateSummary(id: string, request: UpdateSummaryRequest): Promise<any> {
    const response = await apiRequest("PUT", `/api/summaries/${id}`, request);
    return response.json();
  }

  static async saveSummaryToFHIR(summaryId: string): Promise<any> {
    const response = await apiRequest("POST", `/api/fhir/save-summary/${summaryId}`);
    return response.json();
  }

  static async getStatus(): Promise<any> {
    const response = await apiRequest("GET", "/api/ai/status");
    return response.json();
  }
}
