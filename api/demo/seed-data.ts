import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create sample patients if none exist
    const existingPatients = await storage.getAllPatients();
    if (existingPatients.length === 0) {
      const samplePatients = [
        {
          mrn: "123456",
          name: "John Doe",
          dateOfBirth: new Date("1978-05-15"),
          gender: "male",
          contactInfo: {
            phone: "+233-20-123-4567",
            email: "john.doe@email.com"
          },
          fhirId: "Patient/123456"
        },
        {
          mrn: "789012",
          name: "Jane Smith",
          dateOfBirth: new Date("1985-11-22"),
          gender: "female",
          contactInfo: {
            phone: "+233-20-987-6543",
            email: "jane.smith@email.com"
          },
          fhirId: "Patient/789012"
        },
        {
          mrn: "345678",
          name: "Kwame Asante",
          dateOfBirth: new Date("1990-03-10"),
          gender: "male",
          contactInfo: {
            phone: "+233-20-456-7890",
            email: "kwame.asante@email.com",
            address: "Accra, Ghana"
          },
          fhirId: "Patient/345678"
        },
        {
          mrn: "456789",
          name: "Akosua Mensah",
          dateOfBirth: new Date("1982-07-22"),
          gender: "female",
          contactInfo: {
            phone: "+233-20-567-8901",
            email: "akosua.mensah@email.com",
            address: "Kumasi, Ghana"
          },
          fhirId: "Patient/456789"
        }
      ];

      for (const patientData of samplePatients) {
        await storage.createPatient(patientData);
      }
    }

    // Create sample hospital metrics
    await storage.createHospitalMetrics({
      activePatients: 2847,
      bedOccupancy: "85.3",
      criticalAlerts: 3,
      aiSummariesGenerated: 127,
      departmentLoads: {
        emergency: 85,
        icu: 67,
        surgery: 45
      }
    });

    res.json({ message: 'Demo data seeded successfully' });
  } catch (error) {
    console.error('Failed to seed demo data:', error);
    res.status(500).json({ message: 'Failed to seed demo data' });
  }
}