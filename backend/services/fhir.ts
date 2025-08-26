export interface FHIRPatient {
  resourceType: "Patient";
  id: string;
  identifier: Array<{
    use: string;
    value: string;
    system?: string;
  }>;
  name: Array<{
    use: string;
    family: string;
    given: string[];
  }>;
  gender: "male" | "female" | "other" | "unknown";
  birthDate: string;
  telecom?: Array<{
    system: string;
    value: string;
    use?: string;
  }>;
}

export interface FHIRObservation {
  resourceType: "Observation";
  id: string;
  status: "registered" | "preliminary" | "final" | "amended";
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  effectiveDateTime: string;
}

export interface FHIREncounter {
  resourceType: "Encounter";
  id: string;
  status: "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled";
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: {
    reference: string;
  };
  period: {
    start: string;
    end?: string;
  };
}

export interface FHIRSyncStatus {
  patients: {
    total: number;
    synced: number;
    pending: number;
  };
  observations: {
    total: number;
    synced: number;
    pending: number;
  };
  encounters: {
    total: number;
    synced: number;
    pending: number;
  };
  lastSync: string;
}

export class FHIRService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.FHIR_BASE_URL || "https://fhir-server.example.com/fhir";
  }

  async getPatient(id: string): Promise<FHIRPatient | null> {
    try {
      const response = await fetch(`${this.baseUrl}/Patient/${id}`, {
        headers: {
          'Accept': 'application/fhir+json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch FHIR patient:', error);
      return null;
    }
  }

  async getObservationsForPatient(patientId: string): Promise<FHIRObservation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/Observation?subject=Patient/${patientId}`, {
        headers: {
          'Accept': 'application/fhir+json',
        },
      });

      if (response.ok) {
        const bundle = await response.json();
        return bundle.entry?.map((entry: any) => entry.resource) || [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch FHIR observations:', error);
      return [];
    }
  }

  async createDocumentReference(patientId: string, content: string, type: string): Promise<string | null> {
    try {
      const documentReference = {
        resourceType: "DocumentReference",
        status: "current",
        type: {
          coding: [{
            system: "http://loinc.org",
            code: type === "discharge" ? "18842-5" : "11506-3",
            display: type === "discharge" ? "Discharge summary" : "Progress note"
          }]
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        date: new Date().toISOString(),
        content: [{
          attachment: {
            contentType: "text/plain",
            data: Buffer.from(content).toString('base64')
          }
        }]
      };

      const response = await fetch(`${this.baseUrl}/DocumentReference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          'Accept': 'application/fhir+json',
        },
        body: JSON.stringify(documentReference),
      });

      if (response.ok) {
        const created = await response.json();
        return created.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to create FHIR document reference:', error);
      return null;
    }
  }

  async getSyncStatus(): Promise<FHIRSyncStatus> {
    // In a real implementation, this would query the FHIR server for resource counts
    // For now, return mock data that represents typical hospital volumes
    return {
      patients: {
        total: 2847,
        synced: 2847,
        pending: 0,
      },
      observations: {
        total: 12439,
        synced: 12439,
        pending: 0,
      },
      encounters: {
        total: 324,
        synced: 277,
        pending: 47,
      },
      lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
    };
  }

  async checkConnection(): Promise<{ connected: boolean; latency?: number }> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.baseUrl}/metadata`, {
        headers: {
          'Accept': 'application/fhir+json',
        },
      });
      
      const latency = Date.now() - startTime;
      
      return {
        connected: response.ok,
        latency: response.ok ? latency : undefined,
      };
    } catch (error) {
      return { connected: false };
    }
  }
}

export const fhirService = new FHIRService();
