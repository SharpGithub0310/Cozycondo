'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Home,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  slug: string;
  airbnbIcalUrl?: string;
  icalLastSync?: string;
}

interface CalendarEvent {
  id: string;
  property_id: string;
  title: string;
  start_date: string;
  end_date: string;
  source: 'airbnb' | 'manual' | 'booking';
  booking_id?: string;
  synced_at?: string;
}

export default function AdminCalendarPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockEndDate, setBlockEndDate] = useState<string>('');
  const [blockTitle, setBlockTitle] = useState('Blocked');
  const [savingBlock, setSavingBlock] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (response.ok) {
          const data = await response.json();
          const props = Object.values(data.data || {}) as Property[];
          setProperties(props);
          if (props.length > 0 && !selectedProperty) {
            setSelectedProperty(props[0].slug);
          }
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Fetch events when property or month changes
  useEffect(() => {
    if (!selectedProperty) return;

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      try {
        const response = await fetch(
          `/api/calendar/events?propertyId=${selectedProperty}&startDate=${startDate}&endDate=${endDate}`
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || []);
        } else {
          setError('Failed to load calendar events');
        }
      } catch (err) {
        setError('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedProperty, currentDate]);

  // Update last sync when property changes
  useEffect(() => {
    const property = properties.find(p => p.slug === selectedProperty);
    if (property?.icalLastSync) {
      setLastSync(property.icalLastSync);
    } else {
      setLastSync(null);
    }
  }, [selectedProperty, properties]);

  const handleSync = async () => {
    if (!selectedProperty) return;

    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': 'authenticated',
        },
        body: JSON.stringify({ propertyId: selectedProperty }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLastSync(new Date().toISOString());
        // Refresh events
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const eventsResponse = await fetch(
          `/api/calendar/events?propertyId=${selectedProperty}&startDate=${startDate}&endDate=${endDate}`
        );
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.data || []);
        }
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync calendar');
    } finally {
      setSyncing(false);
    }
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setBlockEndDate(dateStr);
    setBlockTitle('Blocked');
    setShowBlockModal(true);
  };

  const handleCreateBlock = async () => {
    if (!selectedProperty || !selectedDate || !blockEndDate) return;

    setSavingBlock(true);
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': 'authenticated',
        },
        body: JSON.stringify({
          propertyId: selectedProperty,
          startDate: selectedDate,
          endDate: blockEndDate,
          title: blockTitle,
        }),
      });

      if (response.ok) {
        // Refresh events
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const eventsResponse = await fetch(
          `/api/calendar/events?propertyId=${selectedProperty}&startDate=${startDate}&endDate=${endDate}`
        );
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.data || []);
        }
        setShowBlockModal(false);
      } else {
        setError('Failed to create block');
      }
    } catch (err) {
      setError('Failed to create block');
    } finally {
      setSavingBlock(false);
    }
  };

  const handleDeleteBlock = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/events?id=${eventId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-session': 'authenticated',
        },
      });

      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId));
      }
    } catch (err) {
      setError('Failed to delete block');
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Helper to format date as YYYY-MM-DD without timezone issues
  const formatDateString = (year: number, month: number, day: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Get today's date in Philippine timezone (Asia/Manila)
  const getTodayPH = (): string => {
    const now = new Date();
    const phDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    return formatDateString(phDate.getFullYear(), phDate.getMonth(), phDate.getDate());
  };

  // Format date for display in Philippine timezone
  const formatDateForDisplay = (dateStr: string): string => {
    // dateStr is YYYY-MM-DD, parse it directly to avoid timezone shift
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Manila'
    });
  };

  // Get the last blocked night (end_date is checkout day, so subtract 1)
  const getLastBlockedNight = (endDateStr: string): string => {
    const [year, month, day] = endDateStr.split('-').map(Number);
    // Subtract 1 day to get last blocked night
    const lastNight = new Date(year, month - 1, day - 1);
    return formatDateString(lastNight.getFullYear(), lastNight.getMonth(), lastNight.getDate());
  };

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthNum = month === 0 ? 11 : month - 1;
    for (let i = startPadding - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        date: formatDateString(prevMonthYear, prevMonthNum, day),
        day,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let day = 1; day <= totalDays; day++) {
      days.push({
        date: formatDateString(year, month, day),
        day,
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remaining = 42 - days.length; // 6 weeks
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthNum = month === 11 ? 0 : month + 1;
    for (let day = 1; day <= remaining; day++) {
      days.push({
        date: formatDateString(nextMonthYear, nextMonthNum, day),
        day,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Determine what type of event day this is
  type DayType = 'checkin' | 'middle' | 'checkout' | 'single' | null;

  const getEventInfo = (dateStr: string): { event: CalendarEvent | null; dayType: DayType } => {
    // Check if this is a checkout day (end_date of any event)
    const checkoutEvent = events.find(event => event.end_date === dateStr);
    if (checkoutEvent) {
      return { event: checkoutEvent, dayType: 'checkout' };
    }

    // Check if this date falls within an event
    const activeEvent = events.find(event => {
      return dateStr >= event.start_date && dateStr < event.end_date;
    });

    if (!activeEvent) {
      return { event: null, dayType: null };
    }

    // Check if it's a single night (start_date + 1 day = end_date)
    const startParts = activeEvent.start_date.split('-').map(Number);
    const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = formatDateString(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());

    if (nextDayStr === activeEvent.end_date) {
      // Single night booking
      return { event: activeEvent, dayType: 'single' };
    }

    // Check if it's check-in day
    if (dateStr === activeEvent.start_date) {
      return { event: activeEvent, dayType: 'checkin' };
    }

    // It's a middle day
    return { event: activeEvent, dayType: 'middle' };
  };

  const getEventForDate = (dateStr: string): CalendarEvent | null => {
    return events.find(event => {
      const start = event.start_date;
      const end = event.end_date;
      return dateStr >= start && dateStr < end;
    }) || null;
  };

  const getEventColor = (source: string): string => {
    switch (source) {
      case 'booking':
        return 'bg-green-500';
      case 'airbnb':
        return 'bg-blue-500';
      case 'manual':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = generateCalendarDays();
  const selectedPropertyData = properties.find(p => p.slug === selectedProperty);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">
            Calendar Management
          </h1>
          <p className="text-[#7d6349] mt-1">
            Manage property availability and sync with Airbnb
          </p>
        </div>
      </div>

      {/* Property Selector & Sync */}
      <div className="admin-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-[#7d6349]" />
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="form-input min-w-[200px]"
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.slug} value={property.slug}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {lastSync && (
              <span className="text-sm text-[#9a7d5e]">
                Last synced: {new Date(lastSync).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
              </span>
            )}
          </div>

          <button
            onClick={handleSync}
            disabled={syncing || !selectedProperty || !selectedPropertyData?.airbnbIcalUrl}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
            title={!selectedPropertyData?.airbnbIcalUrl ? 'No Airbnb iCal URL configured' : ''}
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sync from Airbnb
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="admin-card">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-[#faf3e6] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#5f4a38]" />
          </button>

          <h2 className="font-display text-xl font-semibold text-[#5f4a38]">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-[#faf3e6] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#5f4a38]" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-[#7d6349]">Booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-[#7d6349]">Airbnb</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500"></div>
            <span className="text-[#7d6349]">Manual Block</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: 'linear-gradient(135deg, transparent 50%, #3b82f6 50%)' }}
            ></div>
            <span className="text-[#7d6349]">Check-in</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: 'linear-gradient(135deg, #3b82f6 50%, transparent 50%)' }}
            ></div>
            <span className="text-[#7d6349]">Check-out</span>
          </div>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#14b8a6]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-[#7d6349] py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayInfo, index) => {
                  const { event, dayType } = getEventInfo(dayInfo.date);
                  const todayPH = getTodayPH();
                  const isToday = dayInfo.date === todayPH;
                  const isPast = dayInfo.date < todayPH;

                  // Determine if day is available (checkout day is available for new booking)
                  const isAvailable = !event || dayType === 'checkout';

                  // Get the base color for the event
                  const getColorHex = (source: string): string => {
                    switch (source) {
                      case 'booking': return '#22c55e'; // green-500
                      case 'airbnb': return '#3b82f6';  // blue-500
                      case 'manual': return '#6b7280';  // gray-500
                      default: return '#9ca3af';        // gray-400
                    }
                  };

                  // Get background style based on day type
                  const getBackgroundStyle = (): React.CSSProperties | undefined => {
                    if (!event || !dayType) return undefined;

                    const color = getColorHex(event.source);

                    switch (dayType) {
                      case 'checkin':
                        // Bottom-right filled (guest arrives)
                        return { background: `linear-gradient(135deg, transparent 50%, ${color} 50%)` };
                      case 'checkout':
                        // Top-left filled (guest leaves, day available)
                        return { background: `linear-gradient(135deg, ${color} 50%, transparent 50%)` };
                      case 'middle':
                        // Fully filled
                        return { backgroundColor: color };
                      case 'single':
                        // Single night - show both diagonals
                        return { backgroundColor: color };
                      default:
                        return undefined;
                    }
                  };

                  const bgStyle = getBackgroundStyle();

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (dayInfo.isCurrentMonth && !isPast && isAvailable) {
                          handleDateClick(dayInfo.date);
                        }
                      }}
                      className={`
                        relative aspect-square p-1 border rounded-lg overflow-hidden
                        ${dayInfo.isCurrentMonth ? '' : 'bg-gray-50'}
                        ${isToday ? 'border-[#14b8a6] border-2' : 'border-[#faf3e6]'}
                        ${dayInfo.isCurrentMonth && !isPast && isAvailable ? 'cursor-pointer hover:bg-[#faf3e6]' : ''}
                        ${isPast ? 'opacity-50' : ''}
                      `}
                      style={bgStyle}
                    >
                      {/* White background layer for days without events or partial days */}
                      {dayInfo.isCurrentMonth && (!bgStyle || dayType === 'checkin' || dayType === 'checkout') && (
                        <div className="absolute inset-0 bg-white -z-10" />
                      )}

                      <span
                        className={`
                          relative z-10 text-sm
                          ${dayInfo.isCurrentMonth ? 'text-[#5f4a38]' : 'text-[#9a7d5e]'}
                          ${isToday ? 'font-bold' : ''}
                          ${dayType === 'middle' || dayType === 'single' ? 'text-white' : ''}
                        `}
                      >
                        {dayInfo.day}
                      </span>

                      {event && (
                        <div
                          className="absolute bottom-0 left-0 right-0 text-[8px] truncate px-0.5 text-center"
                          style={{
                            color: dayType === 'middle' || dayType === 'single' ? 'white' : getColorHex(event.source)
                          }}
                          title={`${event.title} (${event.source})`}
                        >
                          {dayType === 'checkin' ? 'IN' : dayType === 'checkout' ? 'OUT' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      {events.length > 0 && (
        <div className="admin-card">
          <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
            Blocked Dates This Month
          </h3>
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-[#fefdfb] rounded-lg border border-[#faf3e6]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded ${getEventColor(event.source)}`} />
                  <div>
                    <p className="text-[#5f4a38] font-medium">{event.title}</p>
                    <p className="text-sm text-[#7d6349]">
                      {formatDateForDisplay(event.start_date)} - {formatDateForDisplay(getLastBlockedNight(event.end_date))}
                    </p>
                  </div>
                </div>
                {event.source === 'manual' && (
                  <button
                    onClick={() => handleDeleteBlock(event.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete block"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Block Dates
            </h3>

            <div className="space-y-4">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={blockEndDate}
                  onChange={(e) => setBlockEndDate(e.target.value)}
                  min={selectedDate || ''}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Reason (optional)</label>
                <input
                  type="text"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Maintenance, Personal use"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBlockModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBlock}
                disabled={savingBlock || !selectedDate || !blockEndDate}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {savingBlock ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Block Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
