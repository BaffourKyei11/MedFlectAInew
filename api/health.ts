import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    features: ["ai", "fhir", "blockchain", "predictive-analytics", "multi-tenant"]
  });
}