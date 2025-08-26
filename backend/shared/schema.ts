import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer, decimal, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("clinician"), // clinician, admin, patient
  name: text("name").notNull(),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mrn: text("mrn").notNull().unique(), // Medical Record Number
  name: text("name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  contactInfo: jsonb("contact_info").$type<{
    phone?: string;
    email?: string;
    address?: string;
  }>(),
  fhirId: text("fhir_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clinicalSummaries = pgTable("clinical_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // discharge, progress, handoff
  content: text("content").notNull(),
  aiGenerated: boolean("ai_generated").default(true),
  groqModel: text("groq_model"),
  generationTime: integer("generation_time"), // milliseconds
  status: text("status").default("draft"), // draft, finalized
  fhirResourceId: text("fhir_resource_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hospitalMetrics = pgTable("hospital_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").defaultNow(),
  activePatients: integer("active_patients").default(0),
  bedOccupancy: decimal("bed_occupancy", { precision: 5, scale: 2 }),
  criticalAlerts: integer("critical_alerts").default(0),
  aiSummariesGenerated: integer("ai_summaries_generated").default(0),
  departmentLoads: jsonb("department_loads").$type<{
    emergency: number;
    icu: number;
    surgery: number;
  }>(),
});

export const riskAlerts = pgTable("risk_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  type: text("type").notNull(), // readmission, medication, critical
  severity: text("severity").notNull(), // low, medium, high, critical
  message: text("message").notNull(),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  blockchainHash: text("blockchain_hash"),
  transactionHash: text("transaction_hash"),
  blockNumber: integer("block_number"),
  verified: boolean("verified").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Blockchain-based consent management
export const consentRecords = pgTable("consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  purpose: text("purpose").notNull(),
  dataTypes: text("data_types").array().notNull(),
  granularity: text("granularity").notNull(),
  status: text("status").notNull().default("active"),
  consentDate: timestamp("consent_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"),
  revokedDate: timestamp("revoked_date"),
  clinicianId: varchar("clinician_id").references(() => users.id).notNull(),
  hospitalId: varchar("hospital_id").notNull(),
  consentHash: text("consent_hash").notNull(),
  transactionHash: text("transaction_hash"),
  blockNumber: integer("block_number"),
  blockchainVerified: boolean("blockchain_verified").default(false),
  metadata: jsonb("metadata"),
});

// Multi-tenant hospital management
export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  address: text("address"),
  city: text("city"),
  region: text("region"),
  country: text("country").default("Ghana"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  fhirEndpoint: text("fhir_endpoint"),
  fhirApiKey: text("fhir_api_key"),
  blockchainAddress: text("blockchain_address"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// FHIR data synchronization tracking
export const fhirSyncLogs = pgTable("fhir_sync_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").references(() => hospitals.id).notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  syncType: text("sync_type").notNull(),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  recordsProcessed: integer("records_processed").default(0),
  lastSyncTime: timestamp("last_sync_time").defaultNow().notNull(),
  nextSyncTime: timestamp("next_sync_time"),
  fhirVersion: text("fhir_version").default("R4"),
});

// Predictive analytics models and results
export const predictiveModels = pgTable("predictive_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  version: text("version").notNull(),
  algorithm: text("algorithm").notNull(),
  accuracy: real("accuracy"),
  precision: real("precision"),
  recall: real("recall"),
  f1Score: real("f1_score"),
  trainingDataSize: integer("training_data_size"),
  lastTrainingDate: timestamp("last_training_date"),
  status: text("status").notNull().default("active"),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  metadata: jsonb("metadata"),
});

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelId: varchar("model_id").references(() => predictiveModels.id).notNull(),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  predictionType: text("prediction_type").notNull(),
  predictedValue: real("predicted_value"),
  confidence: real("confidence"),
  features: jsonb("features"),
  outcome: text("outcome"),
  predictionDate: timestamp("prediction_date").defaultNow().notNull(),
  validUntil: timestamp("valid_until"),
  reviewed: boolean("reviewed").default(false),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewDate: timestamp("review_date"),
  actionTaken: text("action_taken"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClinicalSummarySchema = createInsertSchema(clinicalSummaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskAlertSchema = createInsertSchema(riskAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertConsentRecordSchema = createInsertSchema(consentRecords).omit({
  id: true,
  consentDate: true,
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFhirSyncLogSchema = createInsertSchema(fhirSyncLogs).omit({
  id: true,
  lastSyncTime: true,
});

export const insertPredictiveModelSchema = createInsertSchema(predictiveModels);

export const insertPredictionSchema = createInsertSchema(predictions);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type ClinicalSummary = typeof clinicalSummaries.$inferSelect;
export type InsertClinicalSummary = z.infer<typeof insertClinicalSummarySchema>;
export type HospitalMetrics = typeof hospitalMetrics.$inferSelect;
export type RiskAlert = typeof riskAlerts.$inferSelect;
export type InsertRiskAlert = z.infer<typeof insertRiskAlertSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type FhirSyncLog = typeof fhirSyncLogs.$inferSelect;
export type InsertFhirSyncLog = z.infer<typeof insertFhirSyncLogSchema>;
export type PredictiveModel = typeof predictiveModels.$inferSelect;
export type InsertPredictiveModel = z.infer<typeof insertPredictiveModelSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;

// Additional tables for authentication flow and pilot programs
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Implementation calls scheduling for pilot programs
export const implementationCalls = pgTable("implementation_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  callType: text("call_type").notNull(), // pilot_program, implementation_call
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  preferredDate: timestamp("preferred_date"),
  preferredTime: text("preferred_time"),
  timezone: text("timezone").default("GMT"),
  notes: text("notes"),
  status: text("status").default("scheduled"), // scheduled, completed, cancelled
  meetingLink: text("meeting_link"),
  authToken: text("auth_token"), // Replit auth token
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hospital pilot program applications
export const pilotApplications = pgTable("pilot_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  hospitalName: text("hospital_name").notNull(),
  location: text("location").notNull(),
  ehrSystem: text("ehr_system").notNull(),
  numberOfBeds: integer("number_of_beds"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  ehrEndpoint: text("ehr_endpoint"),
  fhirBaseUrl: text("fhir_base_url"),
  status: text("status").default("pending"), // pending, approved, rejected, active
  reviewNotes: text("review_notes"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertImplementationCallSchema = createInsertSchema(implementationCalls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPilotApplicationSchema = createInsertSchema(pilotApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ImplementationCall = typeof implementationCalls.$inferSelect;
export type InsertImplementationCall = z.infer<typeof insertImplementationCallSchema>;
export type PilotApplication = typeof pilotApplications.$inferSelect;
export type InsertPilotApplication = z.infer<typeof insertPilotApplicationSchema>;
