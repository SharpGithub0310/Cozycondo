'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface BlockedDate {
  start_date: string;
  end_date: string;
  title?: string;
  source?: string;
}

interface DatePickerProps {
  propertySlug: string;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  label: string;
  isCheckOut?: boolean;
  checkInDate?: string;
}

// Format date as YYYY-MM-DD without timezone conversion
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Normalize date string to YYYY-MM-DD format (handles various input formats)
function normalizeDateStr(dateInput: string | Date): string {
  if (typeof dateInput === 'string') {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput;
    }
    // Parse and format
    const date = new Date(dateInput);
    return formatDateLocal(date);
  }
  return formatDateLocal(dateInput);
}

export default function DatePicker({
  propertySlug,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  label,
  isCheckOut = false,
  checkInDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch blocked dates for the property
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        setLoading(true);
        // Fetch 6 months of blocked dates
        const startDate = new Date();
        startDate.setDate(1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);

        const response = await fetch(
          `/api/calendar/events?propertyId=${propertySlug}&startDate=${formatDateLocal(startDate)}&endDate=${formatDateLocal(endDate)}`
        );

        if (response.ok) {
          const result = await response.json();
          setBlockedDates(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching blocked dates:', err);
      } finally {
        setLoading(false);
      }
    };

    if (propertySlug) {
      fetchBlockedDates();
    }
  }, [propertySlug]);

  // Check if a date is blocked (using string comparison for accuracy)
  const isDateBlocked = useCallback((dateStr: string): boolean => {
    const normalizedDate = normalizeDateStr(dateStr);

    for (const block of blockedDates) {
      const blockStart = normalizeDateStr(block.start_date);
      const blockEnd = normalizeDateStr(block.end_date);

      // For check-in: blocked if date >= start AND date < end (checkout day is available for check-in)
      // For check-out: blocked if date > start AND date < end
      if (isCheckOut) {
        // Check-out can be on checkout day but not during the stay
        if (normalizedDate > blockStart && normalizedDate < blockEnd) {
          return true;
        }
      } else {
        // Check-in cannot be on any day during the booking (including start, excluding end)
        // Checkout day (blockEnd) is AVAILABLE for new check-in
        if (normalizedDate >= blockStart && normalizedDate < blockEnd) {
          return true;
        }
      }
    }
    return false;
  }, [blockedDates, isCheckOut]);

  // Check if a date is a checkout day (end date of a booking) - these are AVAILABLE for new check-ins
  const isCheckoutDay = useCallback((dateStr: string): boolean => {
    const normalizedDate = normalizeDateStr(dateStr);

    for (const block of blockedDates) {
      const blockEnd = normalizeDateStr(block.end_date);
      if (normalizedDate === blockEnd) {
        return true;
      }
    }
    return false;
  }, [blockedDates]);

  // Check if a date is a check-in day (start date of a booking) - blocked
  const isCheckinDay = useCallback((dateStr: string): boolean => {
    const normalizedDate = normalizeDateStr(dateStr);

    for (const block of blockedDates) {
      const blockStart = normalizeDateStr(block.start_date);
      if (normalizedDate === blockStart) {
        return true;
      }
    }
    return false;
  }, [blockedDates]);

  // Check if a date range would overlap with blocked dates (using string comparison)
  const wouldOverlapBlocked = useCallback((checkIn: string, checkOut: string): boolean => {
    const startStr = normalizeDateStr(checkIn);
    const endStr = normalizeDateStr(checkOut);

    for (const block of blockedDates) {
      const blockStart = normalizeDateStr(block.start_date);
      const blockEnd = normalizeDateStr(block.end_date);

      // Check for overlap: start < blockEnd AND end > blockStart
      if (startStr < blockEnd && endStr > blockStart) {
        return true;
      }
    }
    return false;
  }, [blockedDates]);

  // Format date for display
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return 'Select date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date: formatDateLocal(date),
        day,
        isCurrentMonth: false,
      });
    }

    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date: formatDateLocal(date),
        day,
        isCurrentMonth: true,
      });
    }

    // Add days from next month to fill grid
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: formatDateLocal(date),
        day,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const today = formatDateLocal(new Date());

  // Check if date is selectable
  const isDateSelectable = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const todayDate = new Date(today);

    // Past dates not selectable
    if (date < todayDate) return false;

    // Check min/max constraints
    if (minDate && dateStr < minDate) return false;
    if (maxDate && dateStr > maxDate) return false;

    // Check if blocked
    if (isDateBlocked(dateStr)) return false;

    // For checkout, check if selecting this date would create an overlap
    if (isCheckOut && checkInDate) {
      if (wouldOverlapBlocked(checkInDate, dateStr)) return false;
    }

    return true;
  };

  // Handle date click
  const handleDateClick = (dateStr: string) => {
    if (isDateSelectable(dateStr)) {
      onDateSelect(dateStr);
      setIsOpen(false);
    }
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[#5f4a38] mb-1.5">
        {label}
      </label>

      {/* Date Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 rounded-lg border border-[#e8d4a8] bg-[#faf3e6]/50 text-[#5f4a38] text-left text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all"
      >
        {formatDateDisplay(selectedDate)}
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-xl border border-[#e8d4a8] shadow-xl p-4 w-[300px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-[#faf3e6] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#5f4a38]" />
            </button>
            <span className="font-medium text-[#5f4a38]">{monthYear}</span>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-[#faf3e6] rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[#5f4a38]" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-[#7d6349] py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, index) => {
              const isBlocked = isDateBlocked(dayInfo.date);
              const isCheckout = isCheckoutDay(dayInfo.date);
              const isCheckin = isCheckinDay(dayInfo.date);
              const isSelectable = isDateSelectable(dayInfo.date);
              const isSelected = dayInfo.date === selectedDate;
              const isToday = dayInfo.date === today;
              const isPast = dayInfo.date < today;
              const isInRange = checkInDate && isCheckOut && dayInfo.date > checkInDate && dayInfo.date <= selectedDate;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(dayInfo.date)}
                  disabled={!isSelectable}
                  className={`
                    relative aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                    ${!dayInfo.isCurrentMonth ? 'text-[#d4c4a8]' : ''}
                    ${isSelected ? 'bg-[#14b8a6] text-white font-medium' : ''}
                    ${isToday && !isSelected ? 'border-2 border-[#14b8a6]' : ''}
                    ${isBlocked && dayInfo.isCurrentMonth && !isCheckout ? 'bg-red-100 text-red-400 line-through cursor-not-allowed' : ''}
                    ${isCheckout && dayInfo.isCurrentMonth && !isSelected && !isPast ? 'bg-green-50 text-green-700 font-medium' : ''}
                    ${isPast && dayInfo.isCurrentMonth ? 'text-[#d4c4a8] cursor-not-allowed' : ''}
                    ${isSelectable && !isSelected && !isCheckout ? 'hover:bg-[#f0fdfb] cursor-pointer text-[#5f4a38]' : ''}
                    ${isSelectable && isCheckout && !isSelected ? 'hover:bg-green-100 cursor-pointer' : ''}
                    ${!isSelectable && !isBlocked && !isPast ? 'text-[#d4c4a8] cursor-not-allowed' : ''}
                    ${isInRange && !isSelected ? 'bg-[#f0fdfb]' : ''}
                  `}
                >
                  {dayInfo.day}
                  {/* Green dot for checkout days (available for check-in) */}
                  {isCheckout && dayInfo.isCurrentMonth && !isPast && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                  )}
                  {/* Red dot for blocked days */}
                  {isBlocked && !isCheckout && dayInfo.isCurrentMonth && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-[#e8d4a8] flex flex-wrap items-center gap-3 text-xs text-[#7d6349]">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-100 rounded border border-red-200" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-50 rounded border border-green-200" />
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-[#14b8a6] rounded" />
              <span>Selected</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1 hover:bg-[#faf3e6] rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-[#7d6349]" />
          </button>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
              <span className="text-sm text-[#7d6349]">Loading...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
