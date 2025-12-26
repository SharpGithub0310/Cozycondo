'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  loadTime: number | null;
}

export default function PerformanceDisplay() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    loadTime: null
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or for admin users
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = window.location.pathname.includes('/admin');
    setIsVisible(isDev || isAdmin);

    if (!isVisible) return;

    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
            break;
          case 'first-input':
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({
                ...prev,
                cls: (prev.cls || 0) + (entry as any).value
              }));
            }
            break;
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Calculate load time
    window.addEventListener('load', () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    });

    return () => observer.disconnect();
  }, [isVisible]);

  if (!isVisible) return null;

  const getStatus = (metric: number | null, thresholds: [number, number]) => {
    if (metric === null) return 'loading';
    if (metric <= thresholds[0]) return 'good';
    if (metric <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs font-mono z-50 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-blue-500" />
        <span className="font-semibold text-gray-900">Performance</span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span>LCP:</span>
          <span className={getStatusColor(getStatus(metrics.lcp, [2500, 4000]))}>
            {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '...'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>FID:</span>
          <span className={getStatusColor(getStatus(metrics.fid, [100, 300]))}>
            {metrics.fid ? `${Math.round(metrics.fid)}ms` : '...'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>CLS:</span>
          <span className={getStatusColor(getStatus(metrics.cls, [0.1, 0.25]))}>
            {metrics.cls ? metrics.cls.toFixed(3) : '...'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Load:</span>
          <span className={getStatusColor(getStatus(metrics.loadTime, [3000, 5000]))}>
            {metrics.loadTime ? `${Math.round(metrics.loadTime)}ms` : '...'}
          </span>
        </div>
      </div>

      {(metrics.lcp && metrics.lcp > 4000) && (
        <div className="mt-3 p-2 bg-red-50 rounded text-red-700 text-[10px]">
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          LCP is poor. Consider optimizing images.
        </div>
      )}
    </div>
  );
}