'use client';

import { useEffect, useState } from 'react';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';

export default function MobileTestPage() {
  const [settings, setSettings] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    // Get viewport and user agent info
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    setUserAgent(window.navigator.userAgent);

    // Load data
    const loadData = async () => {
      try {
        const [loadedSettings, loadedProperties] = await Promise.all([
          postMigrationDatabaseService.getWebsiteSettings(),
          postMigrationDatabaseService.getProperties({ active: true })
        ]);

        console.log('Mobile Test - Settings:', loadedSettings);
        console.log('Mobile Test - Properties:', loadedProperties);

        setSettings(loadedSettings);
        setProperties(Object.values(loadedProperties).slice(0, 3));
      } catch (error) {
        console.error('Mobile Test - Error loading data:', error);
      }
    };

    loadData();

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const isMobile = viewport.width < 768;
  const isTablet = viewport.width >= 768 && viewport.width < 1024;
  const isDesktop = viewport.width >= 1024;

  return (
    <div className="pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Device Info */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4 text-[#5f4a38]">Device Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Viewport:</strong> {viewport.width} x {viewport.height}px</p>
            <p><strong>Device Type:</strong> {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</p>
            <p><strong>User Agent:</strong> <span className="text-xs break-all">{userAgent}</span></p>
          </div>
        </div>

        {/* Logo Test */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4 text-[#5f4a38]">Logo Visibility Test</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Main Logo:</p>
              {settings?.logo ? (
                <div className="flex items-center gap-4">
                  <img
                    src={settings.logo}
                    alt="Main Logo"
                    className="h-16 w-auto object-contain bg-gray-100 rounded p-2"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden bg-red-100 text-red-600 p-2 rounded">
                    ❌ Logo failed to load
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-700 p-2 rounded">
                  ⚠️ No logo URL set
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Footer Logo:</p>
              {settings?.footerLogo ? (
                <div className="flex items-center gap-4">
                  <img
                    src={settings.footerLogo}
                    alt="Footer Logo"
                    className="h-16 w-auto object-contain bg-gray-100 rounded p-2"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden bg-red-100 text-red-600 p-2 rounded">
                    ❌ Footer logo failed to load
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-700 p-2 rounded">
                  ⚠️ No footer logo URL set
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Images Test */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4 text-[#5f4a38]">Hero Section Images Test</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Hero Background:</p>
              {settings?.heroBackground ? (
                <div>
                  <img
                    src={settings.heroBackground}
                    alt="Hero Background"
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden bg-red-100 text-red-600 p-2 rounded mt-2">
                    ❌ Hero background failed to load
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-700 p-2 rounded">
                  ⚠️ No hero background URL set
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Highly Rated Image:</p>
              {settings?.highlyRatedImage ? (
                <div>
                  <img
                    src={settings.highlyRatedImage}
                    alt="Highly Rated"
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden bg-red-100 text-red-600 p-2 rounded mt-2">
                    ❌ Highly rated image failed to load
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-100 text-yellow-700 p-2 rounded">
                  ⚠️ No highly rated image URL set
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Photos Test */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4 text-[#5f4a38]">Property Photos Test</h2>
          {properties.length > 0 ? (
            <div className="space-y-4">
              {properties.map((property, index) => (
                <div key={property.id} className="border-t pt-4">
                  <p className="font-semibold mb-2">{property.name || property.title}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.photos && property.photos.length > 0 ? (
                      property.photos.slice(0, 3).map((photo: string, photoIndex: number) => (
                        <div key={photoIndex}>
                          <img
                            src={photo}
                            alt={`${property.name} photo ${photoIndex + 1}`}
                            className="w-full h-24 object-cover rounded"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden bg-red-100 text-red-600 p-1 rounded text-xs mt-1">
                            ❌ Failed
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-yellow-100 text-yellow-700 p-2 rounded text-sm">
                        ⚠️ No photos for this property
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-100 text-yellow-700 p-2 rounded">
              ⚠️ No properties loaded
            </div>
          )}
        </div>

        {/* Mobile Grid Test */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4 text-[#5f4a38]">Mobile Grid Layout Test</h2>
          <p className="text-sm text-gray-600 mb-4">Testing responsive grid classes:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gradient-to-br from-[#0d9488] to-[#14b8a6] text-white p-4 rounded text-center">
                <div className="font-bold">Card {i}</div>
                <div className="text-sm opacity-80">
                  {isMobile ? 'Mobile (1 col)' : isTablet ? 'Tablet (2 cols)' : 'Desktop (3 cols)'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Touch Target Test */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4 text-[#5f4a38]">Touch Target Test</h2>
          <p className="text-sm text-gray-600 mb-4">All buttons should be at least 44x44px for mobile:</p>

          <div className="space-y-4">
            <button className="btn-primary touch-target">
              Primary Button (min 44px height)
            </button>

            <button className="btn-secondary touch-target">
              Secondary Button (min 44px height)
            </button>

            <div className="flex gap-2">
              <button className="p-2 bg-[#faf3e6] text-[#5f4a38] rounded touch-target">
                Icon Button
              </button>
              <button className="p-2 bg-[#faf3e6] text-[#5f4a38] rounded touch-target">
                Icon Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}