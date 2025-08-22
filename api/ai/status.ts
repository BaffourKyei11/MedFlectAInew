import type { VercelRequest, VercelResponse } from '@vercel/node';
import { groqService } from '../../server/services/groq';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const status = await groqService.checkStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to check AI status",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}