'use client';

import { useState, useEffect } from 'react';
import { databaseService } from '@/lib/database-service';

/**
 * Debug component to test admin settings data loading
 * This component helps identify issues with data flow from API to frontend
 */
export default function AdminSettingsDebug() {
  const [debugData, setDebugData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const debugDataLoading = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('=== ADMIN SETTINGS DEBUG START ===');

        // Test 1: Direct API call
        console.log('1. Testing direct API call...');
        const apiResponse = await fetch('/api/settings');
        const apiData = await apiResponse.json();
        console.log('Direct API response:', apiData);

        // Test 2: Enhanced database service
        console.log('2. Testing clean database service...');
        const cleanData = await databaseService.getWebsiteSettings();
        console.log('Clean database service response:', cleanData);

        // Test 3: Post-migration database service
        console.log('3. Validating database service response...');
        const validationData = await databaseService.getWebsiteSettings();
        console.log('Database service validation response:', validationData);

        // Test 4: Check individual field values
        console.log('4. Individual field analysis:');
        const fieldsToCheck = [
          'phone', 'email', 'address', 'website', 'facebookUrl', 'messengerUrl',
          'heroTitle', 'heroDescription', 'heroBadgeText',
          'checkinTime', 'checkoutTime', 'timezone', 'currency',
          'statsUnits', 'statsRating', 'statsLocation',
          'logo', 'heroBackground', 'favicon'
        ];

        fieldsToCheck.forEach(field => {
          console.log(`  ${field}:`, {
            api: apiData?.data?.[field as keyof typeof apiData.data] || 'NOT FOUND',
            clean: cleanData?.[field as keyof typeof cleanData] || 'NOT FOUND',
            validation: validationData?.[field as keyof typeof validationData] || 'NOT FOUND',
          });
        });

        // Test 5: Check for data structure issues
        console.log('5. Data structure analysis:');
        console.log('API response structure:', Object.keys(apiData || {}));
        console.log('API data structure:', Object.keys(apiData?.data || {}));
        console.log('Clean service structure:', Object.keys(cleanData || {}));
        console.log('Validation structure:', Object.keys(validationData || {}));

        // Set debug data for display
        setDebugData({
          apiResponse: apiData,
          cleanData,
          validationData,
          timestamp: new Date().toISOString()
        });

        console.log('=== ADMIN SETTINGS DEBUG END ===');

      } catch (err) {
        console.error('Debug error:', err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    debugDataLoading();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Admin Settings Debug - Loading...</h2>
        <p>Testing data loading from all sources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-4">Debug Error</h2>
        <pre className="text-sm bg-red-100 p-4 rounded overflow-auto">{error}</pre>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-blue-700">Admin Settings Debug Results</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">1. Direct API Response (/api/settings)</h2>
        <div className="bg-white p-4 rounded border">
          <p><strong>Success:</strong> {debugData.apiResponse?.success ? 'Yes' : 'No'}</p>
          <p><strong>Message:</strong> {debugData.apiResponse?.message || 'None'}</p>
          <p><strong>Data Object Keys:</strong> {Object.keys(debugData.apiResponse?.data || {}).length} fields</p>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Key Contact Fields:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>phone:</strong> {debugData.apiResponse?.data?.phone || 'MISSING'}</li>
              <li><strong>email:</strong> {debugData.apiResponse?.data?.email || 'MISSING'}</li>
              <li><strong>address:</strong> {debugData.apiResponse?.data?.address || 'MISSING'}</li>
              <li><strong>heroTitle:</strong> {debugData.apiResponse?.data?.heroTitle || 'MISSING'}</li>
              <li><strong>timezone:</strong> {debugData.apiResponse?.data?.timezone || 'MISSING'}</li>
              <li><strong>currency:</strong> {debugData.apiResponse?.data?.currency || 'MISSING'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">2. Enhanced Database Service</h2>
        <div className="bg-white p-4 rounded border">
          <p><strong>Data Object Keys:</strong> {Object.keys(debugData.enhancedData || {}).length} fields</p>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Key Contact Fields:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>phone:</strong> {debugData.enhancedData?.phone || 'MISSING'}</li>
              <li><strong>email:</strong> {debugData.enhancedData?.email || 'MISSING'}</li>
              <li><strong>address:</strong> {debugData.enhancedData?.address || 'MISSING'}</li>
              <li><strong>heroTitle:</strong> {debugData.enhancedData?.heroTitle || 'MISSING'}</li>
              <li><strong>timezone:</strong> {debugData.enhancedData?.timezone || 'MISSING'}</li>
              <li><strong>currency:</strong> {debugData.enhancedData?.currency || 'MISSING'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">3. Post-Migration Database Service (Used by Component)</h2>
        <div className="bg-white p-4 rounded border">
          <p><strong>Data Object Keys:</strong> {Object.keys(debugData.postMigrationData || {}).length} fields</p>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Key Contact Fields:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>phone:</strong> {debugData.postMigrationData?.phone || 'MISSING'}</li>
              <li><strong>email:</strong> {debugData.postMigrationData?.email || 'MISSING'}</li>
              <li><strong>address:</strong> {debugData.postMigrationData?.address || 'MISSING'}</li>
              <li><strong>heroTitle:</strong> {debugData.postMigrationData?.heroTitle || 'MISSING'}</li>
              <li><strong>timezone:</strong> {debugData.postMigrationData?.timezone || 'MISSING'}</li>
              <li><strong>currency:</strong> {debugData.postMigrationData?.currency || 'MISSING'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Raw Data (JSON)</h2>
        <details className="cursor-pointer">
          <summary className="font-semibold mb-2">Click to view raw JSON data</summary>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </details>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Diagnosis & Recommendations</h2>
        <div className="space-y-2 text-sm">
          {debugData.apiResponse?.success && Object.keys(debugData.apiResponse.data || {}).length > 0 ? (
            <p className="text-green-700">✅ API is returning data successfully</p>
          ) : (
            <p className="text-red-700">❌ API is not returning data properly</p>
          )}

          {Object.keys(debugData.enhancedData || {}).length > 0 ? (
            <p className="text-green-700">✅ Enhanced database service is working</p>
          ) : (
            <p className="text-red-700">❌ Enhanced database service has issues</p>
          )}

          {Object.keys(debugData.postMigrationData || {}).length > 0 ? (
            <p className="text-green-700">✅ Post-migration service is working</p>
          ) : (
            <p className="text-red-700">❌ Post-migration service has issues</p>
          )}

          {debugData.postMigrationData?.phone ? (
            <p className="text-green-700">✅ Contact fields are populated</p>
          ) : (
            <p className="text-orange-700">⚠️ Contact fields are missing or empty</p>
          )}
        </div>
      </div>
    </div>
  );
}