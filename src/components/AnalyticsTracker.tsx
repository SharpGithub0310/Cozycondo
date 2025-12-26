'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SimpleAnalytics } from '@/lib/analytics';

/**
 * Global analytics tracking component
 * Tracks page views and visitor sessions across the site
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics on first load
    SimpleAnalytics.initialize();
  }, []);

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      SimpleAnalytics.trackPageView(pathname);
    }
  }, [pathname]);

  // This component doesn't render anything
  return null;
}