import { describe, it, expect } from 'vitest';

describe('Health Check Smoke Tests', () => {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  it('should return 200 for health endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('features');
    expect(Array.isArray(data.features)).toBe(true);
  });

  it('should return valid JSON for health endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();
    
    expect(typeof data.status).toBe('string');
    expect(typeof data.timestamp).toBe('string');
    expect(typeof data.version).toBe('string');
    expect(Array.isArray(data.features)).toBe(true);
  });

  it('should include expected features in health response', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();
    
    const expectedFeatures = ['ai', 'fhir', 'blockchain', 'predictive-analytics', 'multi-tenant'];
    expectedFeatures.forEach(feature => {
      expect(data.features).toContain(feature);
    });
  });
});
