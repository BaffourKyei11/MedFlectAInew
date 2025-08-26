import { 
  type User, 
  type InsertUser,
  type Patient,
  type InsertPatient,
  type ClinicalSummary,
  type InsertClinicalSummary,
  type HospitalMetrics,
  type RiskAlert,
  type InsertRiskAlert,
  type AuditLog,
  type InsertAuditLog,
  type ConsentRecord,
  type InsertConsentRecord,
  type Hospital,
  type InsertHospital,
  type Prediction,
  type InsertPrediction,
  type ImplementationCall,
  type InsertImplementationCall,
  type PilotApplication,
  type InsertPilotApplication,
  type EhrConnection,
  type InsertEhrConnection,
  type EhrMapping,
  type InsertEhrMapping,
  type WebhookEvent,
  type InsertWebhookEvent,
  type EhrAuditLog,
  type InsertEhrAuditLog,
  users,
  patients,
  clinicalSummaries,
  hospitalMetrics,
  riskAlerts,
  auditLogs,
  consentRecords,
  hospitals,
  predictions,
  implementationCalls,
  pilotApplications,
  ehrConnections,
  ehrMappings,
  webhookEvents,
  ehrAuditLogs
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patients
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByMrn(mrn: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | undefined>;
  
  // Clinical Summaries
  getClinicalSummary(id: string): Promise<ClinicalSummary | undefined>;
  getClinicalSummariesByPatient(patientId: string): Promise<ClinicalSummary[]>;
  createClinicalSummary(summary: InsertClinicalSummary): Promise<ClinicalSummary>;
  updateClinicalSummary(id: string, updates: Partial<ClinicalSummary>): Promise<ClinicalSummary | undefined>;
  
  // Hospital Metrics
  getLatestHospitalMetrics(): Promise<HospitalMetrics | undefined>;
  createHospitalMetrics(metrics: Omit<HospitalMetrics, 'id' | 'date'>): Promise<HospitalMetrics>;
  
  // Risk Alerts
  getActiveRiskAlerts(): Promise<RiskAlert[]>;
  getRiskAlertsByPatient(patientId: string): Promise<RiskAlert[]>;
  createRiskAlert(alert: InsertRiskAlert): Promise<RiskAlert>;
  resolveRiskAlert(id: string): Promise<boolean>;
  
  // Audit Logs
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  // Consent Records
  getConsentRecord(id: string): Promise<ConsentRecord | undefined>;
  getConsentRecordsByPatient(patientId: string): Promise<ConsentRecord[]>;
  createConsentRecord(consent: InsertConsentRecord): Promise<ConsentRecord>;
  updateConsentRecord(id: string, updates: Partial<ConsentRecord>): Promise<ConsentRecord | undefined>;
  
  // Hospitals
  getHospital(id: string): Promise<Hospital | undefined>;
  getHospitals(): Promise<Hospital[]>;
  createHospital(hospital: InsertHospital): Promise<Hospital>;
  updateHospital(id: string, updates: Partial<Hospital>): Promise<Hospital | undefined>;
  
  // Predictions
  getPrediction(id: string): Promise<Prediction | undefined>;
  getPredictionsByPatient(patientId: string): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: string, updates: Partial<Prediction>): Promise<Prediction | undefined>;
  
  // Implementation Calls
  getImplementationCall(id: string): Promise<ImplementationCall | undefined>;
  getImplementationCallsByUser(userId: string): Promise<ImplementationCall[]>;
  createImplementationCall(call: InsertImplementationCall): Promise<ImplementationCall>;
  updateImplementationCall(id: string, updates: Partial<ImplementationCall>): Promise<ImplementationCall | undefined>;
  
  // Pilot Applications
  getPilotApplication(id: string): Promise<PilotApplication | undefined>;
  getPilotApplicationsByUser(userId: string): Promise<PilotApplication[]>;
  createPilotApplication(application: InsertPilotApplication): Promise<PilotApplication>;
  updatePilotApplication(id: string, updates: Partial<PilotApplication>): Promise<PilotApplication | undefined>;

  // EHR Connections
  getEhrConnection(id: string): Promise<EhrConnection | undefined>;
  getEhrConnectionsByHospital(hospitalId: string): Promise<EhrConnection[]>;
  createEhrConnection(connection: InsertEhrConnection): Promise<EhrConnection>;
  updateEhrConnection(id: string, updates: Partial<EhrConnection>): Promise<EhrConnection | undefined>;
  deleteEhrConnection(id: string): Promise<boolean>;

  // EHR Mappings
  getEhrMapping(id: string): Promise<EhrMapping | undefined>;
  getEhrMappingsByConnection(connectionId: string): Promise<EhrMapping[]>;
  createEhrMapping(mapping: InsertEhrMapping): Promise<EhrMapping>;
  updateEhrMapping(id: string, updates: Partial<EhrMapping>): Promise<EhrMapping | undefined>;
  deleteEhrMapping(id: string): Promise<boolean>;

  // Webhook Events
  getWebhookEvent(id: string): Promise<WebhookEvent | undefined>;
  getWebhookEventsByConnection(connectionId: string): Promise<WebhookEvent[]>;
  createWebhookEvent(event: InsertWebhookEvent): Promise<WebhookEvent>;
  updateWebhookEvent(id: string, updates: Partial<WebhookEvent>): Promise<WebhookEvent | undefined>;

  // EHR Audit Logs
  getEhrAuditLogs(connectionId?: string, limit?: number): Promise<EhrAuditLog[]>;
  createEhrAuditLog(log: InsertEhrAuditLog): Promise<EhrAuditLog>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private patients: Map<string, Patient> = new Map();
  private clinicalSummaries: Map<string, ClinicalSummary> = new Map();
  private hospitalMetrics: Map<string, HospitalMetrics> = new Map();
  private riskAlerts: Map<string, RiskAlert> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private hospitals: Map<string, Hospital> = new Map();
  private predictions: Map<string, Prediction> = new Map();
  private implementationCalls: Map<string, ImplementationCall> = new Map();
  private pilotApplications: Map<string, PilotApplication> = new Map();
  private ehrConnections: Map<string, EhrConnection> = new Map();
  private ehrMappings: Map<string, EhrMapping> = new Map();
  private webhookEvents: Map<string, WebhookEvent> = new Map();
  private ehrAuditLogs: Map<string, EhrAuditLog> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const sampleUsers: User[] = [
      {
        id: randomUUID(),
        username: "dr.asante",
        password: "$2b$10$hash", // In production, this would be properly hashed
        role: "clinician",
        name: "Dr. Kwame Asante",
        department: "Emergency Medicine",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        username: "admin",
        password: "$2b$10$hash",
        role: "admin",
        name: "System Administrator",
        department: "IT",
        createdAt: new Date(),
      }
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));

    // Create sample patients
    const samplePatients: Patient[] = [
      {
        id: randomUUID(),
        mrn: "123456",
        name: "John Doe",
        dateOfBirth: new Date("1978-05-15"),
        gender: "male",
        contactInfo: {
          phone: "+233-20-123-4567",
          email: "john.doe@email.com"
        },
        fhirId: "Patient/123456",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        mrn: "789012",
        name: "Jane Smith",
        dateOfBirth: new Date("1985-11-22"),
        gender: "female",
        contactInfo: {
          phone: "+233-20-987-6543",
          email: "jane.smith@email.com"
        },
        fhirId: "Patient/789012",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    samplePatients.forEach(patient => this.patients.set(patient.id, patient));

    // Create additional sample patients for comprehensive demo
    const additionalPatients: Patient[] = [
      {
        id: randomUUID(),
        mrn: "345678",
        name: "Kwame Asante",
        dateOfBirth: new Date("1990-03-10"),
        gender: "male",
        contactInfo: {
          phone: "+233-20-456-7890",
          email: "kwame.asante@email.com",
          address: "Accra, Ghana"
        },
        fhirId: "Patient/345678",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        mrn: "456789",
        name: "Akosua Mensah",
        dateOfBirth: new Date("1982-07-22"),
        gender: "female",
        contactInfo: {
          phone: "+233-20-567-8901",
          email: "akosua.mensah@email.com",
          address: "Kumasi, Ghana"
        },
        fhirId: "Patient/456789",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        mrn: "567890",
        name: "Yaw Opoku",
        dateOfBirth: new Date("1975-12-05"),
        gender: "male",
        contactInfo: {
          phone: "+233-20-678-9012",
          email: "yaw.opoku@email.com",
          address: "Tamale, Ghana"
        },
        fhirId: "Patient/567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    additionalPatients.forEach(patient => this.patients.set(patient.id, patient));

    // Create sample hospital metrics
    const currentMetrics: HospitalMetrics = {
      id: randomUUID(),
      date: new Date(),
      activePatients: 2847,
      bedOccupancy: "85.3",
      criticalAlerts: 3,
      aiSummariesGenerated: 127,
      departmentLoads: {
        emergency: 85,
        icu: 67,
        surgery: 45
      }
    };

    this.hospitalMetrics.set(currentMetrics.id, currentMetrics);

    // Create sample risk alerts
    const sampleAlerts: RiskAlert[] = [
      {
        id: randomUUID(),
        patientId: samplePatients[0].id,
        type: "readmission",
        severity: "high",
        message: "High readmission risk (89%)",
        riskScore: "89",
        resolved: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: randomUUID(),
        patientId: samplePatients[1].id,
        type: "medication",
        severity: "medium",
        message: "Medication interaction alert",
        riskScore: "65",
        resolved: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      }
    ];

    sampleAlerts.forEach(alert => this.riskAlerts.set(alert.id, alert));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      role: insertUser.role || 'clinician',
      department: insertUser.department || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Patient methods
  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByMrn(mrn: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(patient => patient.mrn === mrn);
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const patient: Patient = {
      ...insertPatient,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      dateOfBirth: insertPatient.dateOfBirth || null,
      gender: insertPatient.gender || null,
      contactInfo: insertPatient.contactInfo || null,
      fhirId: insertPatient.fhirId || null,
    };
    this.patients.set(patient.id, patient);
    return patient;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (patient) {
      const updated = { ...patient, ...updates, updatedAt: new Date() };
      this.patients.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Clinical Summary methods
  async getClinicalSummary(id: string): Promise<ClinicalSummary | undefined> {
    return this.clinicalSummaries.get(id);
  }

  async getClinicalSummariesByPatient(patientId: string): Promise<ClinicalSummary[]> {
    return Array.from(this.clinicalSummaries.values()).filter(
      summary => summary.patientId === patientId
    );
  }

  async createClinicalSummary(insertSummary: InsertClinicalSummary): Promise<ClinicalSummary> {
    const summary: ClinicalSummary = {
      ...insertSummary,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertSummary.status || 'draft',
      patientId: insertSummary.patientId || null,
      userId: insertSummary.userId || null,
      aiGenerated: insertSummary.aiGenerated ?? true,
      groqModel: insertSummary.groqModel || null,
      generationTime: insertSummary.generationTime || null,
      fhirResourceId: insertSummary.fhirResourceId || null,
    };
    this.clinicalSummaries.set(summary.id, summary);
    return summary;
  }

  async updateClinicalSummary(id: string, updates: Partial<ClinicalSummary>): Promise<ClinicalSummary | undefined> {
    const summary = this.clinicalSummaries.get(id);
    if (summary) {
      const updated = { ...summary, ...updates, updatedAt: new Date() };
      this.clinicalSummaries.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Hospital Metrics methods
  async getLatestHospitalMetrics(): Promise<HospitalMetrics | undefined> {
    const metrics = Array.from(this.hospitalMetrics.values());
    return metrics.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))[0];
  }

  async createHospitalMetrics(metricsData: Omit<HospitalMetrics, 'id' | 'date'>): Promise<HospitalMetrics> {
    const metrics: HospitalMetrics = {
      ...metricsData,
      id: randomUUID(),
      date: new Date(),
    };
    this.hospitalMetrics.set(metrics.id, metrics);
    return metrics;
  }

  // Risk Alert methods
  async getActiveRiskAlerts(): Promise<RiskAlert[]> {
    return Array.from(this.riskAlerts.values())
      .filter(alert => !alert.resolved)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getRiskAlertsByPatient(patientId: string): Promise<RiskAlert[]> {
    return Array.from(this.riskAlerts.values()).filter(
      alert => alert.patientId === patientId
    );
  }

  async createRiskAlert(insertAlert: InsertRiskAlert): Promise<RiskAlert> {
    const alert: RiskAlert = {
      ...insertAlert,
      id: randomUUID(),
      createdAt: new Date(),
      patientId: insertAlert.patientId || null,
      resolved: insertAlert.resolved ?? false,
      riskScore: insertAlert.riskScore || null,
    };
    this.riskAlerts.set(alert.id, alert);
    return alert;
  }

  async resolveRiskAlert(id: string): Promise<boolean> {
    const alert = this.riskAlerts.get(id);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  // Audit Log methods
  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const log: AuditLog = {
      ...insertLog,
      id: randomUUID(),
      timestamp: new Date(),
      userId: insertLog.userId || null,
      verified: insertLog.verified ?? false,
      blockchainHash: insertLog.blockchainHash || null,
      resourceId: insertLog.resourceId || null,
      transactionHash: insertLog.transactionHash || null,
      blockNumber: insertLog.blockNumber || null,
      details: insertLog.details || {},
    };
    this.auditLogs.set(log.id, log);
    return log;
  }

  // Consent Record methods
  async getConsentRecord(id: string): Promise<ConsentRecord | undefined> {
    return this.consentRecords.get(id);
  }

  async getConsentRecordsByPatient(patientId: string): Promise<ConsentRecord[]> {
    return Array.from(this.consentRecords.values()).filter(
      consent => consent.patientId === patientId
    );
  }

  async createConsentRecord(insertConsent: InsertConsentRecord): Promise<ConsentRecord> {
    const consent: ConsentRecord = {
      ...insertConsent,
      id: randomUUID(),
      consentDate: new Date(),
      status: insertConsent.status || 'active',
      expiryDate: insertConsent.expiryDate || null,
      revokedDate: insertConsent.revokedDate || null,
      metadata: insertConsent.metadata || {},
      transactionHash: insertConsent.transactionHash || null,
      blockNumber: insertConsent.blockNumber || null,
      blockchainVerified: insertConsent.blockchainVerified ?? false,
    };
    this.consentRecords.set(consent.id, consent);
    return consent;
  }

  async updateConsentRecord(id: string, updates: Partial<ConsentRecord>): Promise<ConsentRecord | undefined> {
    const consent = this.consentRecords.get(id);
    if (consent) {
      const updated = { ...consent, ...updates };
      this.consentRecords.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Hospital methods
  async getHospital(id: string): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }

  async getHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const hospital: Hospital = {
      ...insertHospital,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertHospital.status || 'active',
      address: insertHospital.address || null,
      city: insertHospital.city || null,
      region: insertHospital.region || null,
      country: insertHospital.country || null,
      contactEmail: insertHospital.contactEmail || null,
      contactPhone: insertHospital.contactPhone || null,
      fhirEndpoint: insertHospital.fhirEndpoint || null,
      fhirApiKey: insertHospital.fhirApiKey || null,
      blockchainAddress: insertHospital.blockchainAddress || null,
    };
    this.hospitals.set(hospital.id, hospital);
    return hospital;
  }

  async updateHospital(id: string, updates: Partial<Hospital>): Promise<Hospital | undefined> {
    const hospital = this.hospitals.get(id);
    if (hospital) {
      const updated = { ...hospital, ...updates, updatedAt: new Date() };
      this.hospitals.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Prediction methods
  async getPrediction(id: string): Promise<Prediction | undefined> {
    return this.predictions.get(id);
  }

  async getPredictionsByPatient(patientId: string): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(
      prediction => prediction.patientId === patientId
    );
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const prediction: Prediction = {
      ...insertPrediction,
      id: randomUUID(),
      predictionDate: new Date(),
      predictedValue: insertPrediction.predictedValue || null,
      confidence: insertPrediction.confidence || null,
      features: insertPrediction.features || {},
      outcome: insertPrediction.outcome || null,
      validUntil: insertPrediction.validUntil || null,
      reviewed: insertPrediction.reviewed ?? false,
      reviewedBy: insertPrediction.reviewedBy || null,
      reviewDate: insertPrediction.reviewDate || null,
      actionTaken: insertPrediction.actionTaken || null,
    };
    this.predictions.set(prediction.id, prediction);
    return prediction;
  }

  async updatePrediction(id: string, updates: Partial<Prediction>): Promise<Prediction | undefined> {
    const prediction = this.predictions.get(id);
    if (prediction) {
      const updated = { ...prediction, ...updates };
      this.predictions.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Implementation Call methods
  async getImplementationCall(id: string): Promise<ImplementationCall | undefined> {
    return this.implementationCalls.get(id);
  }

  async getImplementationCallsByUser(userId: string): Promise<ImplementationCall[]> {
    return Array.from(this.implementationCalls.values()).filter(
      call => call.userId === userId
    );
  }

  async createImplementationCall(insertCall: InsertImplementationCall): Promise<ImplementationCall> {
    const call: ImplementationCall = {
      ...insertCall,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertCall.status || 'scheduled',
      hospitalId: insertCall.hospitalId || null,
      contactPhone: insertCall.contactPhone || null,
      preferredDate: insertCall.preferredDate || null,
      preferredTime: insertCall.preferredTime || null,
      timezone: insertCall.timezone || 'GMT',
      notes: insertCall.notes || null,
      meetingLink: insertCall.meetingLink || null,
      authToken: insertCall.authToken || null,
    };
    this.implementationCalls.set(call.id, call);
    return call;
  }

  async updateImplementationCall(id: string, updates: Partial<ImplementationCall>): Promise<ImplementationCall | undefined> {
    const call = this.implementationCalls.get(id);
    if (call) {
      const updated = { ...call, ...updates, updatedAt: new Date() };
      this.implementationCalls.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Pilot Application methods
  async getPilotApplication(id: string): Promise<PilotApplication | undefined> {
    return this.pilotApplications.get(id);
  }

  async getPilotApplicationsByUser(userId: string): Promise<PilotApplication[]> {
    return Array.from(this.pilotApplications.values()).filter(
      app => app.userId === userId
    );
  }

  async createPilotApplication(insertApp: InsertPilotApplication): Promise<PilotApplication> {
    const application: PilotApplication = {
      ...insertApp,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertApp.status || 'pending',
      numberOfBeds: insertApp.numberOfBeds || null,
      contactPhone: insertApp.contactPhone || null,
      ehrEndpoint: insertApp.ehrEndpoint || null,
      fhirBaseUrl: insertApp.fhirBaseUrl || null,
      reviewNotes: insertApp.reviewNotes || null,
      approvedAt: insertApp.approvedAt || null,
    };
    this.pilotApplications.set(application.id, application);
    return application;
  }

  async updatePilotApplication(id: string, updates: Partial<PilotApplication>): Promise<PilotApplication | undefined> {
    const app = this.pilotApplications.get(id);
    if (app) {
      const updated = { ...app, ...updates, updatedAt: new Date() };
      this.pilotApplications.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // EHR Connection methods
  async getEhrConnection(id: string): Promise<EhrConnection | undefined> {
    return this.ehrConnections.get(id);
  }

  async getEhrConnectionsByHospital(hospitalId: string): Promise<EhrConnection[]> {
    return Array.from(this.ehrConnections.values()).filter(
      connection => connection.hospitalId === hospitalId
    );
  }

  async createEhrConnection(insertConnection: InsertEhrConnection): Promise<EhrConnection> {
    const connection: EhrConnection = {
      ...insertConnection,
      id: randomUUID(),
      status: insertConnection.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      clientSecret: insertConnection.clientSecret || null,
      webhookEndpoint: insertConnection.webhookEndpoint || null,
      testPatientId: insertConnection.testPatientId || null,
      ehrVersion: insertConnection.ehrVersion || null,
      authorizationUrl: insertConnection.authorizationUrl || null,
      jwksUrl: insertConnection.jwksUrl || null,
      validationResults: insertConnection.validationResults || null,
      lastValidated: insertConnection.lastValidated || null,
    };
    this.ehrConnections.set(connection.id, connection);
    return connection;
  }

  async updateEhrConnection(id: string, updates: Partial<EhrConnection>): Promise<EhrConnection | undefined> {
    const connection = this.ehrConnections.get(id);
    if (connection) {
      const updated = { ...connection, ...updates, updatedAt: new Date() };
      this.ehrConnections.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteEhrConnection(id: string): Promise<boolean> {
    return this.ehrConnections.delete(id);
  }

  // EHR Mapping methods
  async getEhrMapping(id: string): Promise<EhrMapping | undefined> {
    return this.ehrMappings.get(id);
  }

  async getEhrMappingsByConnection(connectionId: string): Promise<EhrMapping[]> {
    return Array.from(this.ehrMappings.values()).filter(
      mapping => mapping.connectionId === connectionId
    );
  }

  async createEhrMapping(insertMapping: InsertEhrMapping): Promise<EhrMapping> {
    const mapping: EhrMapping = {
      ...insertMapping,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: insertMapping.isActive ?? true,
      codeSystem: insertMapping.codeSystem || null,
      transformationRules: insertMapping.transformationRules || {},
    };
    this.ehrMappings.set(mapping.id, mapping);
    return mapping;
  }

  async updateEhrMapping(id: string, updates: Partial<EhrMapping>): Promise<EhrMapping | undefined> {
    const mapping = this.ehrMappings.get(id);
    if (mapping) {
      const updated = { ...mapping, ...updates, updatedAt: new Date() };
      this.ehrMappings.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteEhrMapping(id: string): Promise<boolean> {
    return this.ehrMappings.delete(id);
  }

  // Webhook Event methods
  async getWebhookEvent(id: string): Promise<WebhookEvent | undefined> {
    return this.webhookEvents.get(id);
  }

  async getWebhookEventsByConnection(connectionId: string): Promise<WebhookEvent[]> {
    return Array.from(this.webhookEvents.values()).filter(
      event => event.connectionId === connectionId
    );
  }

  async createWebhookEvent(insertEvent: InsertWebhookEvent): Promise<WebhookEvent> {
    const event: WebhookEvent = {
      ...insertEvent,
      id: randomUUID(),
      receivedAt: new Date(),
      verified: insertEvent.verified ?? false,
      resourceId: insertEvent.resourceId || null,
      resourceType: insertEvent.resourceType || null,
      errorMessage: insertEvent.errorMessage || null,
      signature: insertEvent.signature || null,
      processed: insertEvent.processed ?? false,
      processedAt: insertEvent.processedAt || null,
      retryCount: insertEvent.retryCount || 0,
    };
    this.webhookEvents.set(event.id, event);
    return event;
  }

  async updateWebhookEvent(id: string, updates: Partial<WebhookEvent>): Promise<WebhookEvent | undefined> {
    const event = this.webhookEvents.get(id);
    if (event) {
      const updated = { ...event, ...updates };
      this.webhookEvents.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // EHR Audit Log methods
  async getEhrAuditLogs(connectionId?: string, limit: number = 100): Promise<EhrAuditLog[]> {
    let query = db.select().from(ehrAuditLogs);
    
    if (connectionId) {
      query = query.where(eq(ehrAuditLogs.connectionId, connectionId)) as any;
    }
    
    return await query
      .orderBy(desc(ehrAuditLogs.timestamp))
      .limit(limit);
  }

  async createEhrAuditLog(insertLog: InsertEhrAuditLog): Promise<EhrAuditLog> {
    const log: EhrAuditLog = {
      ...insertLog,
      id: randomUUID(),
      timestamp: new Date(),
      details: insertLog.details || {},
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
    };
    this.ehrAuditLogs.set(log.id, log);
    return log;
  }
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userWithId = {
      ...insertUser,
      id: randomUUID(),
      role: insertUser.role || 'patient',
      createdAt: new Date()
    };
    
    const [user] = await db
      .insert(users)
      .values(userWithId)
      .returning();
    return user;
  }

  // Patient methods
  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByMrn(mrn: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.mrn, mrn));
    return patient || undefined;
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const patientWithId = {
      ...insertPatient,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [patient] = await db
      .insert(patients)
      .values(patientWithId)
      .returning();
    return patient;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  // Clinical Summary methods
  async getClinicalSummary(id: string): Promise<ClinicalSummary | undefined> {
    const [summary] = await db.select().from(clinicalSummaries).where(eq(clinicalSummaries.id, id));
    return summary || undefined;
  }

  async getClinicalSummariesByPatient(patientId: string): Promise<ClinicalSummary[]> {
    return await db.select().from(clinicalSummaries).where(eq(clinicalSummaries.patientId, patientId));
  }

  async createClinicalSummary(insertSummary: InsertClinicalSummary): Promise<ClinicalSummary> {
    const summaryWithId = {
      ...insertSummary,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [summary] = await db
      .insert(clinicalSummaries)
      .values(summaryWithId)
      .returning();
    return summary;
  }

  async updateClinicalSummary(id: string, updates: Partial<ClinicalSummary>): Promise<ClinicalSummary | undefined> {
    const [summary] = await db
      .update(clinicalSummaries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(clinicalSummaries.id, id))
      .returning();
    return summary || undefined;
  }

  // Hospital Metrics methods
  async getLatestHospitalMetrics(): Promise<HospitalMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(hospitalMetrics)
      .orderBy(desc(hospitalMetrics.date))
      .limit(1);
    return metrics || undefined;
  }

  async createHospitalMetrics(metricsData: Omit<HospitalMetrics, 'id' | 'date'>): Promise<HospitalMetrics> {
    const metricsWithId = {
      ...metricsData,
      id: randomUUID(),
      date: new Date()
    };
    
    const [metrics] = await db
      .insert(hospitalMetrics)
      .values(metricsWithId)
      .returning();
    return metrics;
  }

  // Risk Alert methods
  async getActiveRiskAlerts(): Promise<RiskAlert[]> {
    return await db
      .select()
      .from(riskAlerts)
      .where(eq(riskAlerts.resolved, false))
      .orderBy(desc(riskAlerts.createdAt));
  }

  async getRiskAlertsByPatient(patientId: string): Promise<RiskAlert[]> {
    return await db.select().from(riskAlerts).where(eq(riskAlerts.patientId, patientId));
  }

  async createRiskAlert(insertAlert: InsertRiskAlert): Promise<RiskAlert> {
    const alertWithId = {
      ...insertAlert,
      id: randomUUID(),
      createdAt: new Date()
    };
    
    const [alert] = await db
      .insert(riskAlerts)
      .values(alertWithId)
      .returning();
    return alert;
  }

  async resolveRiskAlert(id: string): Promise<boolean> {
    const [alert] = await db
      .update(riskAlerts)
      .set({ resolved: true })
      .where(eq(riskAlerts.id, id))
      .returning();
    return !!alert;
  }

  // Audit Log methods
  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const logWithId = {
      ...insertLog,
      details: insertLog.details || {},
      id: randomUUID(),
      timestamp: new Date()
    };
    
    const [log] = await db
      .insert(auditLogs)
      .values(logWithId)
      .returning();
    return log;
  }

  // Consent Record methods
  async getConsentRecord(id: string): Promise<ConsentRecord | undefined> {
    const [consent] = await db.select().from(consentRecords).where(eq(consentRecords.id, id));
    return consent || undefined;
  }

  async getConsentRecordsByPatient(patientId: string): Promise<ConsentRecord[]> {
    return await db.select().from(consentRecords).where(eq(consentRecords.patientId, patientId));
  }

  async createConsentRecord(insertConsent: InsertConsentRecord): Promise<ConsentRecord> {
    const consentWithId = {
      ...insertConsent,
      metadata: insertConsent.metadata || {},
      id: randomUUID(),
      consentDate: new Date()
    };
    
    const [consent] = await db
      .insert(consentRecords)
      .values(consentWithId)
      .returning();
    return consent;
  }

  async updateConsentRecord(id: string, updates: Partial<ConsentRecord>): Promise<ConsentRecord | undefined> {
    const [consent] = await db
      .update(consentRecords)
      .set(updates)
      .where(eq(consentRecords.id, id))
      .returning();
    return consent || undefined;
  }

  // Hospital methods
  async getHospital(id: string): Promise<Hospital | undefined> {
    const [hospital] = await db.select().from(hospitals).where(eq(hospitals.id, id));
    return hospital || undefined;
  }

  async getHospitals(): Promise<Hospital[]> {
    return await db.select().from(hospitals);
  }

  async createHospital(insertHospital: InsertHospital): Promise<Hospital> {
    const hospitalWithId = {
      ...insertHospital,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [hospital] = await db
      .insert(hospitals)
      .values(hospitalWithId)
      .returning();
    return hospital;
  }

  async updateHospital(id: string, updates: Partial<Hospital>): Promise<Hospital | undefined> {
    const [hospital] = await db
      .update(hospitals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hospitals.id, id))
      .returning();
    return hospital || undefined;
  }

  // Prediction methods
  async getPrediction(id: string): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions).where(eq(predictions.id, id));
    return prediction || undefined;
  }

  async getPredictionsByPatient(patientId: string): Promise<Prediction[]> {
    return await db.select().from(predictions).where(eq(predictions.patientId, patientId));
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const predictionWithId = {
      ...insertPrediction,
      features: insertPrediction.features || {},
      id: randomUUID(),
      predictionDate: new Date()
    };
    
    const [prediction] = await db
      .insert(predictions)
      .values(predictionWithId)
      .returning();
    return prediction;
  }

  async updatePrediction(id: string, updates: Partial<Prediction>): Promise<Prediction | undefined> {
    const [prediction] = await db
      .update(predictions)
      .set(updates)
      .where(eq(predictions.id, id))
      .returning();
    return prediction || undefined;
  }

  // Implementation Call methods
  async getImplementationCall(id: string): Promise<ImplementationCall | undefined> {
    const [call] = await db.select().from(implementationCalls).where(eq(implementationCalls.id, id));
    return call || undefined;
  }

  async getImplementationCallsByUser(userId: string): Promise<ImplementationCall[]> {
    return await db.select().from(implementationCalls).where(eq(implementationCalls.userId, userId));
  }

  async createImplementationCall(insertCall: InsertImplementationCall): Promise<ImplementationCall> {
    const callWithId = {
      ...insertCall,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertCall.status || 'scheduled',
      hospitalId: insertCall.hospitalId || null,
      contactPhone: insertCall.contactPhone || null,
      preferredDate: insertCall.preferredDate || null,
      preferredTime: insertCall.preferredTime || null,
      timezone: insertCall.timezone || 'GMT',
      notes: insertCall.notes || null,
      meetingLink: insertCall.meetingLink || null,
      authToken: insertCall.authToken || null,
    };
    
    const [call] = await db
      .insert(implementationCalls)
      .values(callWithId)
      .returning();
    return call;
  }

  async updateImplementationCall(id: string, updates: Partial<ImplementationCall>): Promise<ImplementationCall | undefined> {
    const [call] = await db
      .update(implementationCalls)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(implementationCalls.id, id))
      .returning();
    return call || undefined;
  }

  // Pilot Application methods
  async getPilotApplication(id: string): Promise<PilotApplication | undefined> {
    const [app] = await db.select().from(pilotApplications).where(eq(pilotApplications.id, id));
    return app || undefined;
  }

  async getPilotApplicationsByUser(userId: string): Promise<PilotApplication[]> {
    return await db.select().from(pilotApplications).where(eq(pilotApplications.userId, userId));
  }

  async createPilotApplication(insertApp: InsertPilotApplication): Promise<PilotApplication> {
    const appWithId = {
      ...insertApp,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [application] = await db
      .insert(pilotApplications)
      .values(appWithId)
      .returning();
    return application;
  }

  async updatePilotApplication(id: string, updates: Partial<PilotApplication>): Promise<PilotApplication | undefined> {
    const [app] = await db
      .update(pilotApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pilotApplications.id, id))
      .returning();
    return app || undefined;
  }

  // EHR Connection methods
  async getEhrConnection(id: string): Promise<EhrConnection | undefined> {
    const [connection] = await db.select().from(ehrConnections).where(eq(ehrConnections.id, id));
    return connection || undefined;
  }

  async getEhrConnectionsByHospital(hospitalId: string): Promise<EhrConnection[]> {
    return await db.select().from(ehrConnections).where(eq(ehrConnections.hospitalId, hospitalId));
  }

  async createEhrConnection(insertConnection: InsertEhrConnection): Promise<EhrConnection> {
    const connectionWithId = {
      ...insertConnection,
      id: randomUUID(),
      status: insertConnection.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      clientSecret: insertConnection.clientSecret || null,
      webhookEndpoint: insertConnection.webhookEndpoint || null,
      testPatientId: insertConnection.testPatientId || null,
      ehrVersion: insertConnection.ehrVersion || null,
      authorizationUrl: insertConnection.authorizationUrl || null,
      jwksUrl: insertConnection.jwksUrl || null,
      validationResults: insertConnection.validationResults || null,
      lastValidated: insertConnection.lastValidated || null,
    };
    
    const [connection] = await db
      .insert(ehrConnections)
      .values(connectionWithId)
      .returning();
    return connection;
  }

  async updateEhrConnection(id: string, updates: Partial<EhrConnection>): Promise<EhrConnection | undefined> {
    const [connection] = await db
      .update(ehrConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ehrConnections.id, id))
      .returning();
    return connection || undefined;
  }

  async deleteEhrConnection(id: string): Promise<boolean> {
    const result = await db.delete(ehrConnections).where(eq(ehrConnections.id, id));
    return result.rowCount! > 0;
  }

  // EHR Mapping methods
  async getEhrMapping(id: string): Promise<EhrMapping | undefined> {
    const [mapping] = await db.select().from(ehrMappings).where(eq(ehrMappings.id, id));
    return mapping || undefined;
  }

  async getEhrMappingsByConnection(connectionId: string): Promise<EhrMapping[]> {
    return await db.select().from(ehrMappings).where(eq(ehrMappings.connectionId, connectionId));
  }

  async createEhrMapping(insertMapping: InsertEhrMapping): Promise<EhrMapping> {
    const mappingWithId = {
      ...insertMapping,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const [mapping] = await db
      .insert(ehrMappings)
      .values(mappingWithId)
      .returning();
    return mapping;
  }

  async updateEhrMapping(id: string, updates: Partial<EhrMapping>): Promise<EhrMapping | undefined> {
    const [mapping] = await db
      .update(ehrMappings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(ehrMappings.id, id))
      .returning();
    return mapping || undefined;
  }

  async deleteEhrMapping(id: string): Promise<boolean> {
    const result = await db.delete(ehrMappings).where(eq(ehrMappings.id, id));
    return result.rowCount! > 0;
  }

  // Webhook Event methods
  async getWebhookEvent(id: string): Promise<WebhookEvent | undefined> {
    const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, id));
    return event || undefined;
  }

  async getWebhookEventsByConnection(connectionId: string): Promise<WebhookEvent[]> {
    return await db.select().from(webhookEvents).where(eq(webhookEvents.connectionId, connectionId));
  }

  async createWebhookEvent(insertEvent: InsertWebhookEvent): Promise<WebhookEvent> {
    const eventWithId = {
      ...insertEvent,
      id: randomUUID(),
      receivedAt: new Date(),
      verified: insertEvent.verified ?? false,
      resourceId: insertEvent.resourceId || null,
      resourceType: insertEvent.resourceType || null,
      errorMessage: insertEvent.errorMessage || null,
      signature: insertEvent.signature || null,
      processed: insertEvent.processed ?? false,
      processedAt: insertEvent.processedAt || null,
      retryCount: insertEvent.retryCount || 0,
    };
    
    const [event] = await db
      .insert(webhookEvents)
      .values(eventWithId)
      .returning();
    return event;
  }

  async updateWebhookEvent(id: string, updates: Partial<WebhookEvent>): Promise<WebhookEvent | undefined> {
    const [event] = await db
      .update(webhookEvents)
      .set({ ...updates })
      .where(eq(webhookEvents.id, id))
      .returning();
    return event || undefined;
  }

  // EHR Audit Log methods
  async getEhrAuditLogs(connectionId?: string, limit: number = 100): Promise<EhrAuditLog[]> {
    let query = db.select().from(ehrAuditLogs);
    
    if (connectionId) {
      query = query.where(eq(ehrAuditLogs.connectionId, connectionId)) as any;
    }
    
    return await query
      .orderBy(desc(ehrAuditLogs.timestamp))
      .limit(limit);
  }

  async createEhrAuditLog(insertLog: InsertEhrAuditLog): Promise<EhrAuditLog> {
    const logWithId = {
      ...insertLog,
      id: randomUUID(),
      timestamp: new Date(),
      details: insertLog.details || {},
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
    };
    
    const [log] = await db
      .insert(ehrAuditLogs)
      .values(logWithId)
      .returning();
    return log;
  }
}

// Use DatabaseStorage for production, MemStorage for development
export const storage = process.env.NODE_ENV === 'production' ? new DatabaseStorage() : new MemStorage();
