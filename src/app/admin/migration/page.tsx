'use client';

import { useState, useEffect } from 'react';
import { enhancedDatabaseService } from '@/lib/enhanced-database-service';

interface MigrationResult {
  success: boolean;
  errors: string[];
  migratedCount?: number;
}

interface ValidationResult {
  propertiesMatch: boolean;
  settingsMatch: boolean;
  calendarMatch: boolean;
  details: string[];
}

interface DataSummary {
  database: {
    properties: number;
    settings: number;
    calendarBlocks: number;
  };
  localStorage: {
    properties: number;
    settings: number;
    calendarBlocks: number;
  };
  lastSync?: string;
}

export default function MigrationPage() {
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDataSummary();
  }, []);

  const loadDataSummary = async () => {
    try {
      const summary = await enhancedDatabaseService.getDataSummary();
      setDataSummary(summary);
    } catch (error) {
      console.error('Failed to load data summary:', error);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    setMigrationResult(null);

    try {
      const result = await enhancedDatabaseService.migrateFromLocalStorage();
      setMigrationResult(result);

      if (result.success) {
        enhancedDatabaseService.markSyncTime();
        await loadDataSummary();
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        errors: [`Migration failed: ${error}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromDatabase = async () => {
    setIsLoading(true);

    try {
      const result = await enhancedDatabaseService.syncFromDatabase();
      setMigrationResult(result);

      if (result.success) {
        enhancedDatabaseService.markSyncTime();
        await loadDataSummary();
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        errors: [`Sync failed: ${error}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidation = async () => {
    setIsLoading(true);
    setValidationResult(null);

    try {
      const result = await enhancedDatabaseService.validateDataSync();
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        propertiesMatch: false,
        settingsMatch: false,
        calendarMatch: false,
        details: [`Validation failed: ${error}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLocalStorage = async () => {
    if (confirm('Are you sure you want to clear all localStorage data? This cannot be undone.')) {
      await enhancedDatabaseService.clearLocalStorageData();
      await loadDataSummary();
      setMigrationResult(null);
      setValidationResult(null);
    }
  };

  const tabClass = (tabName: string) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      activeTab === tabName
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Database Migration & Sync
        </h1>
        <p className="text-gray-600">
          Manage data migration between localStorage and Supabase database.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <button onClick={() => setActiveTab('overview')} className={tabClass('overview')}>
          Overview
        </button>
        <button onClick={() => setActiveTab('migration')} className={tabClass('migration')}>
          Migration
        </button>
        <button onClick={() => setActiveTab('validation')} className={tabClass('validation')}>
          Validation
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h2>

            {dataSummary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium">Data Type</div>
                  <div className="font-medium">Database</div>
                  <div className="font-medium">localStorage</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm border-t pt-2">
                  <div>Properties</div>
                  <div className="font-mono">{dataSummary.database.properties}</div>
                  <div className="font-mono">{dataSummary.localStorage.properties}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Settings</div>
                  <div className="font-mono">{dataSummary.database.settings}</div>
                  <div className="font-mono">{dataSummary.localStorage.settings}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Calendar Blocks</div>
                  <div className="font-mono">{dataSummary.database.calendarBlocks}</div>
                  <div className="font-mono">{dataSummary.localStorage.calendarBlocks}</div>
                </div>

                {dataSummary.lastSync && (
                  <div className="text-sm text-gray-600 border-t pt-2">
                    Last sync: {new Date(dataSummary.lastSync).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Loading data summary...</div>
            )}

            <button
              onClick={loadDataSummary}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh Summary
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <button
                onClick={handleValidation}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Validating...' : 'Validate Data Sync'}
              </button>

              <button
                onClick={handleMigration}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Migrating...' : 'Migrate localStorage → Database'}
              </button>

              <button
                onClick={handleSyncFromDatabase}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Syncing...' : 'Sync Database → localStorage'}
              </button>

              <button
                onClick={handleClearLocalStorage}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Clear localStorage Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration Tab */}
      {activeTab === 'migration' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Migration Tools</h2>

          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Migration Process</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                <li>Data is read from localStorage (properties, settings, calendar blocks)</li>
                <li>Data is validated and converted to database format</li>
                <li>Database tables are updated with the new data</li>
                <li>Migration results are reported</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <button
                  onClick={handleMigration}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Migrating...' : 'Start Migration'}
                </button>
                <p className="text-xs text-gray-600">
                  Migrates all data from localStorage to the database
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSyncFromDatabase}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Syncing...' : 'Sync from Database'}
                </button>
                <p className="text-xs text-gray-600">
                  Overwrites localStorage with data from the database
                </p>
              </div>
            </div>

            {migrationResult && (
              <div className={`p-4 rounded-lg border ${
                migrationResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className={`font-medium mb-2 ${
                  migrationResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  Migration Result
                </h3>

                {migrationResult.success ? (
                  <div className="text-green-700">
                    <p>✅ Migration completed successfully!</p>
                    {migrationResult.migratedCount && (
                      <p>Migrated {migrationResult.migratedCount} items.</p>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700">
                    <p>❌ Migration failed with the following errors:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {migrationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Tab */}
      {activeTab === 'validation' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Validation</h2>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Validation Process</h3>
              <p className="text-sm text-blue-700">
                Compares data between localStorage and database to check for consistency.
                This helps identify if migration is needed or if data has become out of sync.
              </p>
            </div>

            <button
              onClick={handleValidation}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Validating...' : 'Run Validation'}
            </button>

            {validationResult && (
              <div className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">Validation Results</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={validationResult.propertiesMatch ? '✅' : '❌'}>
                      {validationResult.propertiesMatch ? '✅' : '❌'}
                    </span>
                    <span>Properties Match</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={validationResult.settingsMatch ? '✅' : '❌'}>
                      {validationResult.settingsMatch ? '✅' : '❌'}
                    </span>
                    <span>Settings Match</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={validationResult.calendarMatch ? '✅' : '❌'}>
                      {validationResult.calendarMatch ? '✅' : '❌'}
                    </span>
                    <span>Calendar Blocks Match</span>
                  </div>
                </div>

                {validationResult.details.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Details:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {validationResult.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}