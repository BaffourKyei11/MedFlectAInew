// Demo API service for connecting to backend endpoints

// Simple fetch wrapper for demo API calls
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export class DemoApiService {
  // AI Services
  static async generateClinicalSummary(patientId: string, summaryType: 'discharge' | 'progress' | 'handoff') {
    return apiRequest(`/api/ai/summarize`, {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        summaryType,
        additionalContext: 'Demo-generated clinical summary'
      })
    });
  }

  static async getAIStatus() {
    return apiRequest('/api/ai/status');
  }

  // Patient Services
  static async getPatients() {
    return apiRequest('/api/patients');
  }

  static async getPatient(id: string) {
    return apiRequest(`/api/patients/${id}`);
  }

  // Metrics Services
  static async getHospitalMetrics() {
    return apiRequest('/api/metrics');
  }

  // Risk Alert Services
  static async getRiskAlerts() {
    return apiRequest('/api/risk-alerts');
  }

  static async resolveRiskAlert(id: string) {
    return apiRequest(`/api/risk-alerts/${id}/resolve`, {
      method: 'PUT'
    });
  }

  // FHIR Services
  static async getFHIRStatus() {
    return apiRequest('/api/fhir/status');
  }

  static async testFHIRConnection(endpoint: string, apiKey?: string) {
    return apiRequest('/api/fhir/test-connection', {
      method: 'POST',
      body: JSON.stringify({ endpoint, apiKey })
    });
  }

  static async saveSummaryToFHIR(summaryId: string) {
    return apiRequest(`/api/fhir/save-summary/${summaryId}`, {
      method: 'POST'
    });
  }

  // Blockchain Services
  static async getBlockchainStatus() {
    return apiRequest('/api/blockchain/status');
  }

  static async recordConsent(consentData: any) {
    return apiRequest('/api/consent/record', {
      method: 'POST',
      body: JSON.stringify(consentData)
    });
  }

  static async verifyConsent(patientId: string) {
    return apiRequest(`/api/consent/verify/${patientId}`);
  }

  // Predictive Analytics Services
  static async predictReadmissionRisk(patientId: string, admissionData: any) {
    return apiRequest('/api/analytics/predict/readmission', {
      method: 'POST',
      body: JSON.stringify({ patientId, admissionData })
    });
  }

  static async predictResourceNeeds(hospitalId: string, timeframe: any) {
    return apiRequest('/api/analytics/predict/resources', {
      method: 'POST',
      body: JSON.stringify({ hospitalId, timeframe })
    });
  }

  static async getHospitalInsights(hospitalId: string, period: any) {
    const params = new URLSearchParams({
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString(),
      granularity: period.granularity
    });
    return apiRequest(`/api/analytics/insights/${hospitalId}?${params}`);
  }

  // Audit Services
  static async getAuditLogs(limit = 50) {
    return apiRequest(`/api/audit-logs?limit=${limit}`);
  }

  // Hospital Management
  static async getHospitals() {
    return apiRequest('/api/hospitals');
  }

  static async createHospital(hospitalData: any) {
    return apiRequest('/api/hospitals', {
      method: 'POST',
      body: JSON.stringify(hospitalData)
    });
  }

  // Authentication & Pilot Programs
  static async submitPilotApplication(applicationData: any) {
    return apiRequest('/api/auth/pilot-program', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  static async scheduleImplementationCall(callData: any) {
    return apiRequest('/api/auth/implementation-call', {
      method: 'POST',
      body: JSON.stringify(callData)
    });
  }

  static async verifyEHR(ehrData: any) {
    return apiRequest('/api/auth/verify-ehr', {
      method: 'POST',
      body: JSON.stringify(ehrData)
    });
  }

  static async verifyFHIR(fhirData: any) {
    return apiRequest('/api/auth/verify-fhir', {
      method: 'POST',
      body: JSON.stringify(fhirData)
    });
  }
}