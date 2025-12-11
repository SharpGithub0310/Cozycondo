'use client';

import { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Globe, Clock } from 'lucide-react';

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