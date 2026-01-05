/**
 * Post-Migration Database Service
 *
 * This module now simply exports the clean database service.
 * All fallback logic has been removed.
 */

import { databaseService } from './database-service';

// Export the clean database service as postMigrationDatabaseService
// This maintains compatibility with existing imports while using the clean service
export const postMigrationDatabaseService = databaseService;

// Re-export for convenience
export default postMigrationDatabaseService;