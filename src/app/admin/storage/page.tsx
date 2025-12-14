'use client';

import { useState, useEffect } from 'react';
import { Database, Trash2, AlertTriangle, HardDrive } from 'lucide-react';
import { getStorageInfo } from '@/utils/imageCompression';
import { clearBlogPosts } from '@/utils/blogStorage';
import { clearStoredProperties } from '@/utils/propertyStorage';
import { clearStoredSettings } from '@/utils/settingsStorage';

export default function StorageManagementPage() {
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    updateStorageInfo();
  }, []);

  const updateStorageInfo = () => {
    setStorageInfo(getStorageInfo());
  };

  const clearBlogData = () => {
    if (confirm('This will delete ALL blog posts. Are you sure?')) {
      clearBlogPosts();
      updateStorageInfo();
      alert('Blog posts cleared successfully!');
    }
  };

  const clearPropertyData = () => {
    if (confirm('This will delete ALL property data. Are you sure?')) {
      clearStoredProperties();
      updateStorageInfo();
      alert('Property data cleared successfully!');
    }
  };

  const clearSettingsData = () => {
    if (confirm('This will reset ALL settings. Are you sure?')) {
      clearStoredSettings();
      updateStorageInfo();
      alert('Settings cleared successfully!');
    }
  };

  const clearAllData = () => {
    if (confirm('This will delete ALL data including blog posts, properties, and settings. Are you sure?')) {
      if (confirm('This action cannot be undone. Please confirm again.')) {
        localStorage.clear();
        updateStorageInfo();
        alert('All data cleared successfully!');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Storage Management</h1>
        <p className="text-[#7d6349] mt-1">Manage your browser's local storage</p>
      </div>

      {/* Storage Status */}
      {storageInfo && (
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="w-6 h-6 text-[#14b8a6]" />
            <h2 className="font-display text-lg font-semibold text-[#5f4a38]">Storage Usage</h2>
          </div>

          <div className="space-y-4">
            {/* Storage Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#7d6349]">Used Space</span>
                <span className="text-[#5f4a38] font-medium">
                  {storageInfo.megabytes} MB / ~5 MB
                </span>
              </div>
              <div className="w-full bg-[#faf3e6] rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    storageInfo.percentage > 80 ? 'bg-red-500' :
                    storageInfo.percentage > 60 ? 'bg-[#fb923c]' : 'bg-[#14b8a6]'
                  }`}
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#9a7d5e] mt-1">
                {storageInfo.percentage}% of estimated browser limit
              </p>
            </div>

            {/* Warning */}
            {storageInfo.percentage > 80 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Storage Nearly Full</p>
                  <p className="text-xs text-red-600 mt-1">
                    Clear some data to prevent storage errors. Images take up the most space.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Blog Data */}
        <div className="admin-card">
          <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">Blog Data</h3>
          <p className="text-sm text-[#7d6349] mb-4">
            Clear all blog posts and their images from storage.
          </p>
          <button
            onClick={clearBlogData}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear Blog Posts
          </button>
        </div>

        {/* Property Data */}
        <div className="admin-card">
          <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">Property Data</h3>
          <p className="text-sm text-[#7d6349] mb-4">
            Clear all property listings and their images from storage.
          </p>
          <button
            onClick={clearPropertyData}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear Properties
          </button>
        </div>

        {/* Settings Data */}
        <div className="admin-card">
          <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">Settings</h3>
          <p className="text-sm text-[#7d6349] mb-4">
            Reset all settings including logos and background images.
          </p>
          <button
            onClick={clearSettingsData}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear Settings
          </button>
        </div>

        {/* Clear All */}
        <div className="admin-card border-red-200 bg-red-50">
          <h3 className="font-display text-lg font-semibold text-red-800 mb-4">Clear Everything</h3>
          <p className="text-sm text-red-600 mb-4">
            Delete ALL data including blog posts, properties, settings, and bookings.
          </p>
          <button
            onClick={clearAllData}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="admin-card bg-[#f0fdfb] border-[#14b8a6]/20">
        <h3 className="font-medium text-[#0f766e] mb-2">Storage Tips</h3>
        <ul className="text-sm text-[#115e59] space-y-1">
          <li>• Images take up the most storage space</li>
          <li>• Use image URLs instead of uploading when possible</li>
          <li>• Keep images under 1MB for best performance</li>
          <li>• Browser typically limits localStorage to 5-10MB</li>
          <li>• Clear old data regularly to prevent storage errors</li>
        </ul>
      </div>
    </div>
  );
}