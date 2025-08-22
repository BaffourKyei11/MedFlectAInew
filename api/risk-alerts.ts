import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const alerts = await storage.getActiveRiskAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch risk alerts' });
  }
}