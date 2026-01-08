'use client';

import { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Globe, Clock, Upload, Image, Trash2, Plus, HelpCircle } from 'lucide-react';
// Remove direct database service import - will use API endpoint instead
import type { WebsiteSettings, FAQ } from '@/lib/types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<WebsiteSettings>({
    logo: '',
    footerLogo: '',
    aboutImage: '',
    contactImage: '',
    favicon: '',
    heroBadgeText: '',
    heroTitle: 'Your Cozy Escape in Iloilo City',
    heroSubtitle: '',
    heroDescription: 'Experience the perfect blend of comfort and convenience. Our handpicked condominiums offer modern amenities, stunning views, and prime locations across Iloilo City.',
    heroScrollText: 'Scroll to explore',
    statsUnits: '9+',
    statsUnitsLabel: 'Premium Units',
    statsRating: '4.9',
    statsRatingLabel: 'Guest Rating',
    statsLocation: 'Iloilo',
    statsLocationLabel: 'City Center',
    highlyRatedTitle: 'Highly Rated',
    highlyRatedSubtitle: 'by our guests',
    highlyRatedImage: '',
    featuredTitle: 'Featured Properties',
    featuredSubtitle: 'Handpicked condominiums offering the perfect balance of comfort, convenience, and style.',
    updatedAt: '',
    faqs: [],
    companyName: 'Cozy Condo',
    siteName: '',
    siteTagline: '',
    companyDescription: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    facebookUrl: '',
    messengerUrl: '',
    checkinTime: '',
    checkoutTime: '',
    timezone: 'Asia/Manila',
    currency: 'PHP'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }

        const result = await response.json();
        const dbSettings = result.data;
        console.log('Admin Settings: Loaded from API:', dbSettings);

        // Enhanced logging for debugging
        console.log('Admin Settings: Data validation:', {
          hasContactFields: !!(dbSettings.phone && dbSettings.email),
          hasBookingFields: !!(dbSettings.checkinTime && dbSettings.timezone),
          hasHeroFields: !!(dbSettings.heroTitle && dbSettings.heroDescription),
          totalFields: Object.keys(dbSettings).length,
          sampleFields: {
            phone: dbSettings.phone,
            email: dbSettings.email,
            heroTitle: dbSettings.heroTitle
          }
        });

        setSettings(dbSettings);
      } catch (err) {
        console.error('Admin Settings: Error loading settings:', err);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const adminSession = localStorage.getItem('cozy_admin_session');

      if (!adminSession || adminSession !== 'authenticated') {
        throw new Error('Admin session not found');
      }

      // Save to database via API
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': 'authenticated',
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      setSaveMessage('Settings saved successfully! Changes will appear on the website immediately.');
      console.log('Admin Settings: Successfully saved via API');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Admin Settings: Error saving settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to save individual settings immediately (for image uploads)
  const saveIndividualSetting = async (key: keyof WebsiteSettings, value: string) => {
    try {
      const adminSession = localStorage.getItem('cozy_admin_session');

      if (!adminSession || adminSession !== 'authenticated') {
        throw new Error('Admin session not found');
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': 'authenticated',
        },
        body: JSON.stringify({
          key: key,
          value: value
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save setting');
      }

      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      console.log(`Admin Settings: Saved ${key} successfully`);
    } catch (error) {
      console.error(`Admin Settings: Error saving ${key}:`, error);
      setError('Failed to save setting. Please try again.');
    }
  };

  // FAQ Management functions
  const addFAQ = () => {
    const newFaq: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      order: settings.faqs?.length || 0
    };
    setSettings({
      ...settings,
      faqs: [...(settings.faqs || []), newFaq]
    });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = [...(settings.faqs || [])];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
    setSettings({ ...settings, faqs: updatedFaqs });
  };

  const deleteFAQ = (index: number) => {
    const updatedFaqs = (settings.faqs || []).filter((_, i) => i !== index);
    setSettings({ ...settings, faqs: updatedFaqs });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Settings</h1>
        <p className="text-[#7d6349] mt-1">Manage your site settings and configuration.</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="admin-card bg-red-50 border-red-200 max-w-2xl">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="admin-card max-w-2xl">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-32"></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  className="form-input"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({...settings, email: e.target.value})}
                  className="form-input"
                  placeholder="Email address"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="form-label flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  className="form-input"
                  placeholder="Business address"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="form-label flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website URL
                </label>
                <input
                  type="url"
                  value={settings.website || ''}
                  onChange={(e) => setSettings({...settings, website: e.target.value})}
                  className="form-input"
                  placeholder="https://your-website.com"
                />
              </div>

              <div>
                <label className="form-label">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={settings.facebookUrl || ''}
                  onChange={(e) => setSettings({...settings, facebookUrl: e.target.value})}
                  className="form-input"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="form-label">
                  Messenger URL
                </label>
                <input
                  type="url"
                  value={settings.messengerUrl || ''}
                  onChange={(e) => setSettings({...settings, messengerUrl: e.target.value})}
                  className="form-input"
                  placeholder="https://m.me/yourpage"
                />
              </div>
            </div>
          </div>

          {/* Booking Settings */}
          <div className="pt-6 border-t border-[#faf3e6]">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Booking Settings
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={settings.checkinTime || ''}
                  onChange={(e) => setSettings({...settings, checkinTime: e.target.value})}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={settings.checkoutTime || ''}
                  onChange={(e) => setSettings({...settings, checkoutTime: e.target.value})}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Timezone
                </label>
                <select
                  value={settings.timezone || 'Asia/Manila'}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="form-input"
                >
                  <option value="Asia/Manila">Asia/Manila (PHT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Currency
                </label>
                <select
                  value={settings.currency || 'PHP'}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="form-input"
                >
                  <option value="PHP">PHP - Philippine Peso</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>
          </div>

          {/* Homepage Content */}
          <div className="pt-6 border-t border-[#faf3e6]">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Homepage Content
            </h3>

            {/* Hero Section */}
            <div className="mb-6">
              <h4 className="font-medium text-[#5f4a38] mb-3">Hero Section</h4>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Badge Text (Optional)</label>
                  <input
                    type="text"
                    value={settings.heroBadgeText || ''}
                    onChange={(e) => setSettings({...settings, heroBadgeText: e.target.value})}
                    className="form-input"
                    placeholder="Leave empty to hide badge (removes 'Premium Short-Term Rentals')"
                  />
                  <p className="text-xs text-[#9a7d5e] mt-1">Leave empty to remove the badge entirely</p>
                </div>

                <div>
                  <label className="form-label">Main Title</label>
                  <input
                    type="text"
                    value={settings.heroTitle || ''}
                    onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
                    className="form-input"
                    placeholder="Your Cozy Escape in Iloilo City"
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={settings.heroDescription || ''}
                    onChange={(e) => setSettings({...settings, heroDescription: e.target.value})}
                    className="form-input min-h-[80px]"
                    placeholder="Experience the perfect blend of comfort and convenience..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-6">
              <h4 className="font-medium text-[#5f4a38] mb-3">Statistics Section</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="form-label">Units Count</label>
                  <input
                    type="text"
                    value={settings.statsUnits || ''}
                    onChange={(e) => setSettings({...settings, statsUnits: e.target.value})}
                    className="form-input"
                    placeholder="9+"
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Units Label</label>
                  <input
                    type="text"
                    value={settings.statsUnitsLabel || ''}
                    onChange={(e) => setSettings({...settings, statsUnitsLabel: e.target.value})}
                    className="form-input"
                    placeholder="Premium Units"
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Rating</label>
                  <input
                    type="text"
                    value={settings.statsRating || ''}
                    onChange={(e) => setSettings({...settings, statsRating: e.target.value})}
                    className="form-input"
                    placeholder="4.9"
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Rating Label</label>
                  <input
                    type="text"
                    value={settings.statsRatingLabel || ''}
                    onChange={(e) => setSettings({...settings, statsRatingLabel: e.target.value})}
                    className="form-input"
                    placeholder="Guest Rating"
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={settings.statsLocation || ''}
                    onChange={(e) => setSettings({...settings, statsLocation: e.target.value})}
                    className="form-input"
                    placeholder="Iloilo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label">Location Label</label>
                  <input
                    type="text"
                    value={settings.statsLocationLabel || ''}
                    onChange={(e) => setSettings({...settings, statsLocationLabel: e.target.value})}
                    className="form-input"
                    placeholder="City Center"
                  />
                </div>
              </div>
            </div>

            {/* Highly Rated Section */}
            <div className="mb-6">
              <h4 className="font-medium text-[#5f4a38] mb-3">"Highly Rated" Card</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    value={settings.highlyRatedTitle || ''}
                    onChange={(e) => setSettings({...settings, highlyRatedTitle: e.target.value})}
                    className="form-input"
                    placeholder="Highly Rated"
                  />
                </div>
                <div>
                  <label className="form-label">Subtitle</label>
                  <input
                    type="text"
                    value={settings.highlyRatedSubtitle || ''}
                    onChange={(e) => setSettings({...settings, highlyRatedSubtitle: e.target.value})}
                    className="form-input"
                    placeholder="by our guests"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label">Card Background Image (Optional)</label>
                <div className="border-2 border-dashed border-[#faf3e6] rounded-xl p-4 text-center hover:border-[#14b8a6] transition-colors mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageUrl = event.target?.result as string;
                          const updatedSettings = {...settings, highlyRatedImage: imageUrl};
                          setSettings(updatedSettings);
                          saveIndividualSetting('highlyRatedImage', imageUrl);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="highly-rated-img-upload"
                  />
                  <label htmlFor="highly-rated-img-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-[#9a7d5e]" />
                    <p className="text-[#5f4a38] text-sm font-medium">Upload Image</p>
                    <p className="text-[#9a7d5e] text-xs">Replaces "CC" placeholder</p>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.highlyRatedImage || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSettings({...settings, highlyRatedImage: newValue});
                    saveIndividualSetting('highlyRatedImage', newValue);
                  }}
                  className="form-input text-sm"
                  placeholder="Or enter image URL"
                />
                {settings.highlyRatedImage && (
                  <div className="mt-2 relative group">
                    <img
                      src={settings.highlyRatedImage}
                      alt="Highly rated card image preview"
                      className="w-24 h-24 object-cover rounded border border-[#faf3e6]"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({...settings, highlyRatedImage: ''})}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Properties Section */}
            <div className="mb-6">
              <h4 className="font-medium text-[#5f4a38] mb-3">Featured Properties Section</h4>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Section Title</label>
                  <input
                    type="text"
                    value={settings.featuredTitle || ''}
                    onChange={(e) => setSettings({...settings, featuredTitle: e.target.value})}
                    className="form-input"
                    placeholder="Featured Properties"
                  />
                </div>
                <div>
                  <label className="form-label">Section Description</label>
                  <textarea
                    value={settings.featuredSubtitle || ''}
                    onChange={(e) => setSettings({...settings, featuredSubtitle: e.target.value})}
                    className="form-input min-h-[60px]"
                    placeholder="Handpicked condominiums offering the perfect balance of comfort, convenience, and style."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Website Images */}
          <div className="pt-6 border-t border-[#faf3e6]">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Website Images
            </h3>

            {/* Logo Section */}
            <div className="mb-8">
              <h4 className="font-medium text-[#5f4a38] mb-3">Logo & Branding</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Main Logo */}
                <div>
                  <label className="form-label">Main Logo</label>
                  <div className="border-2 border-dashed border-[#faf3e6] rounded-xl p-4 text-center hover:border-[#14b8a6] transition-colors mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageUrl = event.target?.result as string;
                            const updatedSettings = {...settings, logo: imageUrl};
                            setSettings(updatedSettings);
                            saveIndividualSetting('logo', imageUrl);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-[#9a7d5e]" />
                      <p className="text-[#5f4a38] text-sm font-medium">Upload Logo</p>
                      <p className="text-[#9a7d5e] text-xs">PNG, SVG recommended</p>
                    </label>
                  </div>
                  <input
                    type="url"
                    value={settings.logo || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSettings({...settings, logo: newValue});
                      saveIndividualSetting('logo', newValue);
                    }}
                    className="form-input text-sm"
                    placeholder="Or enter logo URL"
                  />
                  {settings.logo && (
                    <div className="mt-2 relative group">
                      <img
                        src={settings.logo}
                        alt="Logo preview"
                        className="h-16 object-contain rounded border border-[#faf3e6] bg-white p-2"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmOWZhZmIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNmI3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9nbyBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({...settings, logo: ''})}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Logo */}
                <div>
                  <label className="form-label">Footer Logo (Optional)</label>
                  <div className="border-2 border-dashed border-[#faf3e6] rounded-xl p-4 text-center hover:border-[#14b8a6] transition-colors mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageUrl = event.target?.result as string;
                            const updatedSettings = {...settings, footerLogo: imageUrl};
                            setSettings(updatedSettings);
                            saveIndividualSetting('footerLogo', imageUrl);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="footer-logo-upload"
                    />
                    <label htmlFor="footer-logo-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-[#9a7d5e]" />
                      <p className="text-[#5f4a38] text-sm font-medium">Upload Footer Logo</p>
                      <p className="text-[#9a7d5e] text-xs">Usually lighter variant</p>
                    </label>
                  </div>
                  <input
                    type="url"
                    value={settings.footerLogo || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSettings({...settings, footerLogo: newValue});
                      saveIndividualSetting('footerLogo', newValue);
                    }}
                    className="form-input text-sm"
                    placeholder="Or enter footer logo URL"
                  />
                  {settings.footerLogo && (
                    <div className="mt-2 relative group">
                      <img
                        src={settings.footerLogo}
                        alt="Footer logo preview"
                        className="h-12 object-contain rounded border border-[#faf3e6] bg-gray-800 p-2"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIGZpbGw9IiMzNzQxNTEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IiNkMWQ1ZGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2dvIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({...settings, footerLogo: ''})}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Background Images */}
            <div className="mb-8">
            </div>

            {/* Section Images */}
            <div>
              <h4 className="font-medium text-[#5f4a38] mb-3">Section Images</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {/* About Section Image */}
                <div>
                  <label className="form-label">About Section Image</label>
                  <div className="border-2 border-dashed border-[#faf3e6] rounded-xl p-4 text-center hover:border-[#14b8a6] transition-colors mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageUrl = event.target?.result as string;
                            const updatedSettings = {...settings, aboutImage: imageUrl};
                            setSettings(updatedSettings);
                            saveIndividualSetting('aboutImage', imageUrl);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="about-img-upload"
                    />
                    <label htmlFor="about-img-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-[#9a7d5e]" />
                      <p className="text-[#5f4a38] text-sm font-medium">Upload About Image</p>
                      <p className="text-[#9a7d5e] text-xs">Image for about section</p>
                    </label>
                  </div>
                  <input
                    type="url"
                    value={settings.aboutImage || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSettings({...settings, aboutImage: newValue});
                      saveIndividualSetting('aboutImage', newValue);
                    }}
                    className="form-input text-sm"
                    placeholder="Or enter about image URL"
                  />
                  {settings.aboutImage && (
                    <div className="mt-2 relative group">
                      <img
                        src={settings.aboutImage}
                        alt="About image preview"
                        className="w-full h-24 object-cover rounded border border-[#faf3e6]"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({...settings, aboutImage: ''})}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Section Image */}
                <div>
                  <label className="form-label">Contact Section Image</label>
                  <div className="border-2 border-dashed border-[#faf3e6] rounded-xl p-4 text-center hover:border-[#14b8a6] transition-colors mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const imageUrl = event.target?.result as string;
                            const updatedSettings = {...settings, contactImage: imageUrl};
                            setSettings(updatedSettings);
                            saveIndividualSetting('contactImage', imageUrl);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="contact-img-upload"
                    />
                    <label htmlFor="contact-img-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-[#9a7d5e]" />
                      <p className="text-[#5f4a38] text-sm font-medium">Upload Contact Image</p>
                      <p className="text-[#9a7d5e] text-xs">Image for contact section</p>
                    </label>
                  </div>
                  <input
                    type="url"
                    value={settings.contactImage || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setSettings({...settings, contactImage: newValue});
                      saveIndividualSetting('contactImage', newValue);
                    }}
                    className="form-input text-sm"
                    placeholder="Or enter contact image URL"
                  />
                  {settings.contactImage && (
                    <div className="mt-2 relative group">
                      <img
                        src={settings.contactImage}
                        alt="Contact image preview"
                        className="w-full h-24 object-cover rounded border border-[#faf3e6]"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setSettings({...settings, contactImage: ''})}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div className="mt-8 pt-6 border-t border-[#faf3e6]">
              <h4 className="font-medium text-[#5f4a38] mb-3">Browser Icon</h4>
              <div className="max-w-md">
                <label className="form-label">Favicon</label>
                <div className="border-2 border-dashed border-[#faf3e6] rounded-xl p-4 text-center hover:border-[#14b8a6] transition-colors mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageUrl = event.target?.result as string;
                          const updatedSettings = {...settings, favicon: imageUrl};
                          setSettings(updatedSettings);
                          saveIndividualSetting('favicon', imageUrl);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label htmlFor="favicon-upload" className="cursor-pointer">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-[#9a7d5e]" />
                    <p className="text-[#5f4a38] text-sm font-medium">Upload Favicon</p>
                    <p className="text-[#9a7d5e] text-xs">32x32px PNG/ICO recommended</p>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.favicon || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSettings({...settings, favicon: newValue});
                    saveIndividualSetting('favicon', newValue);
                  }}
                  className="form-input text-sm"
                  placeholder="Or enter favicon URL"
                />
                {settings.favicon && (
                  <div className="mt-2 relative group inline-block">
                    <img
                      src={settings.favicon}
                      alt="Favicon preview"
                      className="w-8 h-8 object-contain rounded border border-[#faf3e6] bg-white p-1"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjlmYWZiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI4IiBmaWxsPSIjNmI3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Pz88L3RleHQ+PC9zdmc+';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({...settings, favicon: ''})}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2 h-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Management */}
          <div className="pt-6 border-t border-[#faf3e6]">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              FAQ Management
            </h3>
            <p className="text-[#7d6349] mb-6 text-sm">
              Manage frequently asked questions that appear on the contact page.
            </p>

            <div className="space-y-4 mb-6">
              {(settings.faqs || []).map((faq, index) => (
                <div key={faq.id || index} className="p-4 border border-[#faf3e6] rounded-lg bg-[#fefdfb]">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-[#5f4a38]">FAQ #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => deleteFAQ(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="form-label">Question</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                        className="form-input"
                        placeholder="Enter your question..."
                      />
                    </div>

                    <div>
                      <label className="form-label">Answer</label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                        className="form-input min-h-[80px]"
                        placeholder="Enter the answer..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {(settings.faqs || []).length === 0 && (
                <div className="text-center py-8 text-[#9a7d5e]">
                  <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No FAQs added yet. Click the button below to add your first FAQ.</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addFAQ}
              className="flex items-center gap-2 px-4 py-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </button>
          </div>

          {/* Company Information */}
          <div className="pt-6 border-t border-[#faf3e6]">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Company Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  className="form-input"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="form-label">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName || ''}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="form-input"
                  placeholder="Site name"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Site Tagline</label>
                <input
                  type="text"
                  value={settings.siteTagline || ''}
                  onChange={(e) => setSettings({...settings, siteTagline: e.target.value})}
                  className="form-input"
                  placeholder="Your site tagline"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Company Description</label>
                <textarea
                  value={settings.companyDescription || ''}
                  onChange={(e) => setSettings({...settings, companyDescription: e.target.value})}
                  className="form-input min-h-[80px]"
                  placeholder="Describe your company..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="pt-6 border-t border-[#faf3e6]">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Hero Content
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Hero Subtitle</label>
                <input
                  type="text"
                  value={settings.heroSubtitle || ''}
                  onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
                  className="form-input"
                  placeholder="Hero subtitle text"
                />
              </div>
              <div>
                <label className="form-label">Hero Scroll Text</label>
                <input
                  type="text"
                  value={settings.heroScrollText || ''}
                  onChange={(e) => setSettings({...settings, heroScrollText: e.target.value})}
                  className="form-input"
                  placeholder="Scroll to explore"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-6 border-t border-[#faf3e6]">
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes('successfully')
                ? 'text-green-600'
                : 'text-red-600'
              }`}>
                {saveMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary ml-auto flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
          </form>
        )}
      </div>
    </div>
  );
}