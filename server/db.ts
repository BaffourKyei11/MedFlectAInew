// Re-export everything from the database configuration
// This maintains backward compatibility with existing imports
export * from './config/database';

// Default export for backward compatibility
import { db } from './config/database';
export default db;
