import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const metrics = await storage.getLatestHospitalMetrics();
    res.json(metrics || {
      activePatients: 0,
      bedOccupancy: "0",
      criticalAlerts: 0,
      aiSummariesGenerated: 0,
      departmentLoads: { emergency: 0, icu: 0, surgery: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch metrics' });
  }
}