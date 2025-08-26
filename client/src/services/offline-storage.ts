import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define a minimal schema to work around TypeScript issues
interface MedflectDB extends DBSchema {
  patients: {
    key: string;
    value: any;
  };
  summaries: {
    key: string;
    value: any;
    indexes: any;
  };
  metrics: {
    key: string;
    value: any;
  };
  riskAlerts: {
    key: string;
    value: any;
    indexes: any;
  };
}

class OfflineStorage {
  private db: IDBPDatabase<MedflectDB> | null = null;

  async init() {
    if (this.db) return this.db;

    this.db = await openDB<MedflectDB>('medflect-db', 1, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('summaries')) {
          const summariesStore = db.createObjectStore('summaries', { keyPath: 'id' });
          summariesStore.createIndex('by-patient', 'patientId', { unique: false });
        }
        if (!db.objectStoreNames.contains('metrics')) {
          db.createObjectStore('metrics', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('riskAlerts')) {
          const store = db.createObjectStore('riskAlerts', { keyPath: 'id' });
          store.createIndex('by-resolved', 'resolved');
          store.createIndex('by-patient', 'patientId');
        }
      },
    });

    return this.db;
  }

  async getPatients() {
    const db = await this.init();
    return db.getAll('patients');
  }

  async getPatient(id: string) {
    const db = await this.init();
    return db.get('patients', id);
  }

  async savePatient(patient: any) {
    const db = await this.init();
    return db.put('patients', { ...patient, updatedAt: new Date().toISOString() });
  }

  async getSummaries() {
    const db = await this.init();
    return db.getAll('summaries');
  }

  async getSummary(id: string) {
    const db = await this.init();
    return db.get('summaries', id);
  }

  async getSummariesByPatient(patientId: string) {
    const db = await this.init();
    return db.getAllFromIndex('summaries', 'by-patient', patientId);
  }

  async saveSummary(summary: any) {
    const db = await this.init();
    return db.put('summaries', { 
      ...summary, 
      updatedAt: new Date().toISOString() 
    });
  }

  async getMetrics() {
    const db = await this.init();
    const all = await db.getAll('metrics');
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }

  async saveMetrics(metrics: any) {
    const db = await this.init();
    return db.put('metrics', { ...metrics, date: new Date().toISOString() });
  }

  async getRiskAlerts() {
    const db = await this.init();
    return db.getAllFromIndex('riskAlerts', 'by-resolved', false);
  }

  async saveRiskAlert(alert: any) {
    const db = await this.init();
    return db.put('riskAlerts', { ...alert, createdAt: new Date().toISOString() });
  }

  async resolveRiskAlert(id: string) {
    const db = await this.init();
    const alert = await db.get('riskAlerts', id);
    if (alert) {
      alert.resolved = true;
      return db.put('riskAlerts', alert);
    }
    return false;
  }

  async clearAll() {
    const db = await this.init();
    const tx = db.transaction(['patients', 'summaries', 'metrics', 'riskAlerts'], 'readwrite');
    await Promise.all([
      tx.objectStore('patients').clear(),
      tx.objectStore('summaries').clear(),
      tx.objectStore('metrics').clear(),
      tx.objectStore('riskAlerts').clear(),
    ]);
  }
}

export const offlineStorage = new OfflineStorage();
