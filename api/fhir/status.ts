import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fhirService } from '../../server/services/fhir';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const [connectionStatus, syncStatus] = await Promise.all([
      fhirService.checkConnection(),
      fhirService.getSyncStatus(),
    ]);

    res.json({
      connection: connectionStatus,
      sync: syncStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check FHIR status' });
  }
}