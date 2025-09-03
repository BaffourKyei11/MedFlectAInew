import { describe, it, expect } from 'vitest';

describe('API Smoke Tests', () => {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  it('should return 404 for non-existent endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/non-existent`);
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'error');
    expect(data).toHaveProperty('message');
  });

  it('should return 404 for unsupported method on health endpoint', async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    expect(response.status).toBe(404);
  });

  it('should handle CORS preflight requests', async () => {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    // Should not return an error for OPTIONS requests
    expect(response.status).not.toBe(500);
  });
});
