'use client';

import { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performance';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Performance monitoring component that shows performance alerts to users
 */
export default function PerformanceMonitor() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    // Listen for storage errors
    const handleStorageError = (event: any) => {
      const notification = {
        id: Date.now().toString(),
        type: 'warning' as const,
        message: event.detail?.error || 'Storage limit reached. Some data may not be saved locally.',
        timestamp: Date.now(),
      };

      setNotifications(prev => [...prev.slice(-2), notification]); // Keep only last 3 notifications

      // Auto-remove after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    };

    // Listen for performance issues
    const handlePerformanceIssue = () => {
      const summary = performanceMonitor.getSummary();

      // Check for performance issues
      const issues: string[] = [];
      Object.entries(summary).forEach(([metric, data]: [string, any]) => {
        if (data?.hasIssues) {
          switch (metric) {
            case 'LCP':
              issues.push('Page loading is slower than expected');
              break;
            case 'FID':
              issues.push('Page responsiveness could be improved');
              break;
            case 'CLS':
              issues.push('Page layout is shifting during load');
              break;
            default:
              if (metric.startsWith('API_')) {
                issues.push('Some features may be loading slowly');
              }
          }
        }
      });

      if (issues.length > 0) {
        const notification = {
          id: Date.now().toString(),
          type: 'info' as const,
          message: issues[0], // Show only the first issue
          timestamp: Date.now(),
        };

        setNotifications(prev => {
          // Don't show duplicate performance notifications
          const hasPerformanceNotification = prev.some(n => n.message.includes('loading') || n.message.includes('responsiveness'));
          if (hasPerformanceNotification) return prev;

          return [...prev.slice(-2), notification];
        });

        // Auto-remove after 8 seconds for performance notifications
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 8000);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cozy-storage-error', handleStorageError);

      // Check performance every 30 seconds
      const performanceCheckInterval = setInterval(handlePerformanceIssue, 30000);

      return () => {
        window.removeEventListener('cozy-storage-error', handleStorageError);
        clearInterval(performanceCheckInterval);
      };
    }
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg shadow-lg border transition-all duration-300
            ${notification.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
            }
          `}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                notification.type === 'warning'
                  ? 'text-yellow-600'
                  : notification.type === 'error'
                  ? 'text-red-600'
                  : 'text-blue-600'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {notification.message}
              </p>
              {notification.type === 'warning' && (
                <p className="text-xs mt-1 opacity-75">
                  Try refreshing the page if issues persist.
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`
                p-1 rounded-full transition-colors
                ${notification.type === 'warning'
                  ? 'hover:bg-yellow-200'
                  : notification.type === 'error'
                  ? 'hover:bg-red-200'
                  : 'hover:bg-blue-200'
                }
              `}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}