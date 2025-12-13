'use client';

import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Info
} from 'lucide-react';
import { getStoredProperties, getDefaultPropertyData, saveProperty } from '@/utils/propertyStorage';

// Property IDs
const propertyIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Sample blocked dates
const sampleBlockedDates = [
  { id: '1', propertyId: '1', startDate: '2024-12-20', endDate: '2024-12-25', reason: 'Maintenance', source: 'manual' },
  { id: '2', propertyId: '1', startDate: '2024-12-28', endDate: '2025-01-02', reason: 'Booked - Airbnb', source: 'airbnb' },
];

export default function CalendarPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState(sampleBlockedDates);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIcalModal, setShowIcalModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [icalImportUrl, setIcalImportUrl] = useState('');

  useEffect(() => {
    // Load properties from storage
    const storedProperties = getStoredProperties();
    const loadedProperties = propertyIds.map(id => {
      const stored = storedProperties[id];
      const defaultData = getDefaultPropertyData(id);
      if (stored) {
        return {
          id: stored.id,
          name: stored.name,
          icalUrl: stored.icalUrl || ''
        };
      }
      return {
        id: defaultData.id,
        name: defaultData.name,
        icalUrl: ''
      };
    });
    setProperties(loadedProperties);
    if (loadedProperties.length > 0) {
      setSelectedProperty(loadedProperties[0]);
    }
  }, []);

  // Load iCal URL when selected property changes
  useEffect(() => {
    if (selectedProperty) {
      setIcalImportUrl(selectedProperty.icalUrl || '');
    }
  }, [selectedProperty]);

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    // Previous month padding
    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, date: null });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, date: dateStr });
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Check if date is blocked
  const isDateBlocked = (dateStr: string | null) => {
    if (!dateStr || !selectedProperty) return null;
    return blockedDates.find(b =>
      b.propertyId === selectedProperty.id &&
      dateStr >= b.startDate &&
      dateStr <= b.endDate
    );
  };

  // Generate iCal export URL
  const icalExportUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/ical/${selectedProperty?.id || 'unknown'}.ics`;

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(icalExportUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Save iCal URL
  const saveIcalUrl = () => {
    if (selectedProperty) {
      // Get full property data
      const storedProperty = getStoredProperties()[selectedProperty.id];
      const defaultProperty = getDefaultPropertyData(selectedProperty.id);
      const fullPropertyData = storedProperty || defaultProperty;

      // Save with updated iCal URL
      saveProperty(selectedProperty.id, {
        ...fullPropertyData,
        icalUrl: icalImportUrl
      });

      // Update local state
      setProperties(properties.map(p =>
        p.id === selectedProperty.id
          ? { ...p, icalUrl: icalImportUrl }
          : p
      ));

      setSelectedProperty({
        ...selectedProperty,
        icalUrl: icalImportUrl
      });
    }
  };

  // Parse iCal data from URL (using proxy to avoid CORS)
  const parseIcalData = async (url: string) => {
    try {
      // Use our proxy API to fetch the iCal data (avoids CORS issues)
      const response = await fetch('/api/ical/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch iCal data: ${response.status}`);
      }

      const result = await response.json();
      const icalText = result.data;

      // Simple parser for blocked dates (in production, use a proper iCal library)
      const events: any[] = [];
      const lines = icalText.split('\n');
      let currentEvent: any = null;

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === 'BEGIN:VEVENT') {
          currentEvent = {};
        } else if (trimmed === 'END:VEVENT' && currentEvent) {
          if (currentEvent.dtstart && currentEvent.dtend) {
            events.push({
              id: currentEvent.uid || `imported-${Date.now()}-${Math.random()}`,
              propertyId: selectedProperty?.id,
              startDate: currentEvent.dtstart,
              endDate: currentEvent.dtend,
              reason: currentEvent.summary || 'Airbnb Booking',
              source: 'airbnb'
            });
          }
          currentEvent = null;
        } else if (currentEvent) {
          const [key, ...valueParts] = trimmed.split(':');
          const value = valueParts.join(':');

          switch (key) {
            case 'UID':
              currentEvent.uid = value;
              break;
            case 'SUMMARY':
              currentEvent.summary = value;
              break;
            case 'DTSTART;VALUE=DATE':
            case 'DTSTART':
              // Parse date (simple format: YYYYMMDD or YYYYMMDDTHHMMSS)
              const startDateStr = value.replace(/T.*/, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
              currentEvent.dtstart = startDateStr;
              break;
            case 'DTEND;VALUE=DATE':
            case 'DTEND':
              const endDateStr = value.replace(/T.*/, '').replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
              currentEvent.dtend = endDateStr;
              break;
          }
        }
      }

      return events;
    } catch (error) {
      console.error('Error parsing iCal data:', error);
      throw error;
    }
  };

  // Sync with external calendars
  const handleSync = async () => {
    if (!selectedProperty?.icalUrl) {
      alert('No iCal URL configured for this property');
      return;
    }

    setIsSyncing(true);
    try {
      // Parse iCal data from the configured URL
      const importedEvents = await parseIcalData(selectedProperty.icalUrl);

      // Remove old Airbnb bookings for this property and add new ones
      const filteredBlockedDates = blockedDates.filter(
        b => !(b.propertyId === selectedProperty.id && b.source === 'airbnb')
      );

      const newBlockedDates = [...filteredBlockedDates, ...importedEvents];
      setBlockedDates(newBlockedDates);

      alert(`Successfully imported ${importedEvents.length} bookings from Airbnb!`);
    } catch (error) {
      console.error('Sync failed:', error);
      alert(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Show loading state if no properties are loaded yet
  if (properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#14b8a6] flex items-center justify-center animate-pulse">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-[#7d6349]">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Calendar</h1>
          <p className="text-[#7d6349] mt-1">Manage availability and sync with Airbnb</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowIcalModal(true)}
            className="btn-secondary text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            iCal Settings
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-primary text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Property Selector */}
      <div className="admin-card">
        <label className="form-label">Select Property</label>
        <select
          value={selectedProperty?.id || ''}
          onChange={(e) => setSelectedProperty(properties.find(p => p.id === e.target.value) || properties[0])}
          className="form-input max-w-md"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar Grid */}
      <div className="admin-card">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 rounded-lg hover:bg-[#faf3e6] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#7d6349]" />
          </button>
          <h2 className="font-display text-xl font-semibold text-[#5f4a38]">{monthYear}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 rounded-lg hover:bg-[#faf3e6] transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#7d6349]" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-[#9a7d5e] py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayData, index) => {
            const blocked = isDateBlocked(dayData.date);
            const isToday = dayData.date === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={index}
                className={`
                  aspect-square p-1 rounded-lg text-center relative
                  ${dayData.day === null ? 'bg-transparent' : 'bg-[#faf3e6]'}
                  ${isToday ? 'ring-2 ring-[#14b8a6]' : ''}
                  ${blocked ? 'cursor-pointer' : ''}
                `}
              >
                {dayData.day && (
                  <>
                    <span className={`text-sm ${isToday ? 'font-bold text-[#14b8a6]' : 'text-[#7d6349]'}`}>
                      {dayData.day}
                    </span>
                    {blocked && (
                      <div
                        className={`absolute inset-1 rounded ${
                          blocked.source === 'airbnb' 
                            ? 'bg-[#FF5A5F]/20 border border-[#FF5A5F]/40' 
                            : 'bg-[#fb923c]/20 border border-[#fb923c]/40'
                        }`}
                        title={blocked.reason}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-[#faf3e6]">
          <div className="flex items-center gap-2 text-sm text-[#7d6349]">
            <div className="w-4 h-4 rounded bg-[#FF5A5F]/20 border border-[#FF5A5F]/40" />
            <span>Airbnb Booking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#7d6349]">
            <div className="w-4 h-4 rounded bg-[#fb923c]/20 border border-[#fb923c]/40" />
            <span>Manual Block</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#7d6349]">
            <div className="w-4 h-4 rounded ring-2 ring-[#14b8a6]" />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Block Dates Section */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-[#5f4a38]">
            Blocked Dates for {selectedProperty?.name || 'No Property Selected'}
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Block Dates
          </button>
        </div>

        {/* Blocked dates list */}
        <div className="space-y-3">
          {blockedDates
            .filter(b => b.propertyId === selectedProperty?.id)
            .map((block) => (
              <div
                key={block.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#faf3e6]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    block.source === 'airbnb' ? 'bg-[#FF5A5F]' : 'bg-[#fb923c]'
                  }`} />
                  <div>
                    <p className="font-medium text-[#5f4a38]">{block.reason}</p>
                    <p className="text-sm text-[#9a7d5e]">
                      {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    block.source === 'airbnb' 
                      ? 'bg-[#FF5A5F]/10 text-[#FF5A5F]' 
                      : 'bg-[#fb923c]/10 text-[#fb923c]'
                  }`}>
                    {block.source === 'airbnb' ? 'Airbnb' : 'Manual'}
                  </span>
                  {block.source === 'manual' && (
                    <button
                      onClick={() => setBlockedDates(blockedDates.filter(b => b.id !== block.id))}
                      className="p-2 text-[#9a7d5e] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

          {blockedDates.filter(b => b.propertyId === selectedProperty?.id).length === 0 && (
            <p className="text-center text-[#9a7d5e] py-8">
              No blocked dates for this property.
            </p>
          )}
        </div>
      </div>

      {/* iCal Settings Modal */}
      {showIcalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[#faf3e6]">
              <h3 className="font-display text-xl font-semibold text-[#5f4a38]">
                iCal Settings for {selectedProperty?.name || 'No Property Selected'}
              </h3>
              <button
                onClick={() => setShowIcalModal(false)}
                className="p-2 hover:bg-[#faf3e6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#7d6349]" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Import from Airbnb */}
              <div>
                <label className="form-label flex items-center gap-2">
                  <span>Import iCal URL (from Airbnb)</span>
                  <span className="text-xs text-[#9a7d5e]">(Optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste Airbnb iCal URL here..."
                    value={icalImportUrl}
                    onChange={(e) => setIcalImportUrl(e.target.value)}
                    className="form-input flex-1"
                  />
                  <button
                    onClick={saveIcalUrl}
                    className="btn-secondary"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-[#9a7d5e] mt-2 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Find this in Airbnb &gt; Calendar &gt; Availability &gt; Export Calendar
                </p>
              </div>

              {/* Export to Airbnb */}
              <div>
                <label className="form-label">Export iCal URL (for Airbnb)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={icalExportUrl}
                    readOnly
                    className="form-input flex-1 bg-[#faf3e6]"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn-secondary"
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-[#9a7d5e] mt-2 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Add this URL in Airbnb &gt; Calendar &gt; Availability &gt; Import Calendar
                </p>
              </div>

              {/* How it works */}
              <div className="p-4 rounded-xl bg-[#f0fdfb] border border-[#14b8a6]/20">
                <h4 className="font-medium text-[#0f766e] mb-2">How Two-Way Sync Works</h4>
                <ul className="text-sm text-[#115e59] space-y-1">
                  <li>1. Import: Airbnb bookings appear on your calendar</li>
                  <li>2. Export: Manual blocks sync back to Airbnb</li>
                  <li>3. Click &quot;Sync Now&quot; to refresh data</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[#faf3e6]">
              <button
                onClick={() => setShowIcalModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-[#faf3e6]">
              <h3 className="font-display text-xl font-semibold text-[#5f4a38]">
                Block Dates
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#faf3e6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#7d6349]" />
              </button>
            </div>
            
            <form className="p-6 space-y-4">
              <div>
                <label className="form-label">Property</label>
                <input
                  type="text"
                  value={selectedProperty?.name || ''}
                  disabled
                  className="form-input bg-[#faf3e6]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Maintenance, Personal use"
                  className="form-input"
                />
              </div>
            </form>

            <div className="flex justify-end gap-3 p-6 border-t border-[#faf3e6]">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-primary"
              >
                Block Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
