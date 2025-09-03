import { beforeAll, afterAll, beforeEach } from 'vitest';
import { neon } from '@neondatabase/serverless';

// Test database setup
const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/medflect_test';

let testDb: any;

beforeAll(async () => {
  // Setup test database connection
  testDb = neon(testDbUrl);
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = testDbUrl;
  process.env.LOG_LEVEL = 'error'; // Reduce log noise in tests
});

afterAll(async () => {
  // Cleanup test database connection
  // Neon client doesn't need explicit cleanup
});

beforeEach(async () => {
  // Reset any test state if needed
});
