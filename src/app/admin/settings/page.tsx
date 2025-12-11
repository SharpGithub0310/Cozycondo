'use client';

import { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Globe, Clock, Upload, Image, Trash2 } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    phone: '+63 977 887 0724',
    email: 'admin@cozycondo.net',
    address: 'Iloilo City, Philippines',
    website: 'https://cozycondo.net',
    timezone: 'Asia/Manila',
    checkinTime: '15:00',
    checkoutTime: '11:00',
    currency: 'PHP',
    logo: '',
    heroBackground: '',
    aboutImage: '',
    contactImage: '',
    footerLogo: '',
    favicon: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      // In production, save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Settings</h1>
        <p className="text-[#7d6349] mt-1">Manage your site settings and configuration.</p>
      </div>

      {/* Settings Form */}
      <div className="admin-card max-w-2xl">
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
                  value={settings.phone}
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
                  value={settings.email}
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
                  value={settings.address}
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
                  value={settings.website}
                  onChange={(e) => setSettings({...settings, website: e.target.value})}
                  className="form-input"
                  placeholder="https://your-website.com"
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
                  value={settings.checkinTime}
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
                  value={settings.checkoutTime}
                  onChange={(e) => setSettings({...settings, checkoutTime: e.target.value})}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
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
                  value={settings.currency}
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
                            setSettings({...settings, logo: imageUrl});
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
                    value={settings.logo}
                    onChange={(e) => setSettings({...settings, logo: e.target.value})}
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
                            setSettings({...settings, footerLogo: imageUrl});
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
                    value={settings.footerLogo}
                    onChange={(e) => setSettings({...settings, footerLogo: e.target.value})}
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
              <h4 className="font-medium text-[#5f4a38] mb-3">Background Images</h4>

              {/* Hero Background */}
              <div className="mb-6">
                <label className="form-label">Hero Section Background</label>
                <div className="border-2 border-dashed border-[#faf3e6] rounded-xl p-6 text-center hover:border-[#14b8a6] transition-colors mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageUrl = event.target?.result as string;
                          setSettings({...settings, heroBackground: imageUrl});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="hero-bg-upload"
                  />
                  <label htmlFor="hero-bg-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-[#9a7d5e]" />
                    <p className="text-[#5f4a38] font-medium mb-1">Upload Hero Background</p>
                    <p className="text-[#9a7d5e] text-sm">High resolution image for homepage hero</p>
                    <p className="text-[#9a7d5e] text-xs">Recommended: 1920x1080px</p>
                  </label>
                </div>
                <input
                  type="url"
                  value={settings.heroBackground}
                  onChange={(e) => setSettings({...settings, heroBackground: e.target.value})}
                  className="form-input"
                  placeholder="Or enter hero background URL"
                />
                {settings.heroBackground && (
                  <div className="mt-3 relative group">
                    <img
                      src={settings.heroBackground}
                      alt="Hero background preview"
                      className="w-full h-32 object-cover rounded-lg border border-[#faf3e6]"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYWNrZ3JvdW5kIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSettings({...settings, heroBackground: ''})}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
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
                            setSettings({...settings, aboutImage: imageUrl});
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
                    value={settings.aboutImage}
                    onChange={(e) => setSettings({...settings, aboutImage: e.target.value})}
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
                            setSettings({...settings, contactImage: imageUrl});
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
                    value={settings.contactImage}
                    onChange={(e) => setSettings({...settings, contactImage: e.target.value})}
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
                          setSettings({...settings, favicon: imageUrl});
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
                  value={settings.favicon}
                  onChange={(e) => setSettings({...settings, favicon: e.target.value})}
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
      </div>
    </div>
  );
}