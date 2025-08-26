import { apiRequest } from "@/lib/queryClient";

export class FHIRService {
  static async getStatus(): Promise<any> {
    const response = await apiRequest("GET", "/api/fhir/status");
    return response.json();
  }
}
