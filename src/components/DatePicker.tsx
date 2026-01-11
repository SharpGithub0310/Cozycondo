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
          `/api/calendar/events?propertyId=${propertySlug}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`
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

  // Check if a date is blocked
  const isDateBlocked = useCallback((dateStr: string): boolean => {
    const date = new Date(dateStr);

    for (const block of blockedDates) {
      const blockStart = new Date(block.start_date);
      const blockEnd = new Date(block.end_date);

      // For check-in: blocked if date >= start AND date < end (checkout day is available for check-in)
      // For check-out: blocked if date > start AND date <= end
      if (isCheckOut) {
        // Check-out can be on checkout day but not during the stay
        if (date > blockStart && date < blockEnd) {
          return true;
        }
      } else {
        // Check-in cannot be on any day during the booking (including start, excluding end)
        if (date >= blockStart && date < blockEnd) {
          return true;
        }
      }
    }
    return false;
  }, [blockedDates, isCheckOut]);

  // Check if a date range would overlap with blocked dates
  const wouldOverlapBlocked = useCallback((checkIn: string, checkOut: string): boolean => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    for (const block of blockedDates) {
      const blockStart = new Date(block.start_date);
      const blockEnd = new Date(block.end_date);

      // Check for overlap: start < blockEnd AND end > blockStart
      if (start < blockEnd && end > blockStart) {
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
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
      });
    }

    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: true,
      });
    }

    // Add days from next month to fill grid
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const today = new Date().toISOString().split('T')[0];

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
                    ${isBlocked && dayInfo.isCurrentMonth ? 'bg-red-100 text-red-400 line-through cursor-not-allowed' : ''}
                    ${isPast && dayInfo.isCurrentMonth ? 'text-[#d4c4a8] cursor-not-allowed' : ''}
                    ${isSelectable && !isSelected ? 'hover:bg-[#f0fdfb] cursor-pointer text-[#5f4a38]' : ''}
                    ${!isSelectable && !isBlocked && !isPast ? 'text-[#d4c4a8] cursor-not-allowed' : ''}
                    ${isInRange && !isSelected ? 'bg-[#f0fdfb]' : ''}
                  `}
                >
                  {dayInfo.day}
                  {isBlocked && dayInfo.isCurrentMonth && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-[#e8d4a8] flex items-center gap-4 text-xs text-[#7d6349]">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-100 rounded border border-red-200" />
              <span>Unavailable</span>
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
