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
  type InsertPilotApplication
} from "@shared/schema";
import { randomUUID } from "crypto";

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

    // Create sample hospital metrics
    const currentMetrics: HospitalMetrics = {
      id: randomUUID(),
      date: new Date(),
      activePatients: 247,
      bedOccupancy: "87",
      criticalAlerts: 3,
      aiSummariesGenerated: 89,
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
}

export const storage = new MemStorage();
