'use client';

import { useEffect } from 'react';

interface PreloadResource {
  href: string;
  as: 'image' | 'font' | 'script' | 'style';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

interface ResourcePreloaderProps {
  resources?: PreloadResource[];
}

export default function ResourcePreloader({ resources = [] }: ResourcePreloaderProps) {
  useEffect(() => {
    // Default critical resources to preload
    const defaultResources: PreloadResource[] = [
      // Critical fonts (already handled in layout, but adding fallback)
      {
        href: 'https://fonts.gstatic.com/s/outfit/v11/QGYsz_wNahGiLawhBCJUJkMqgUUrbjJrG3Q.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
      },
      {
        href: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXBYf9lWEe50PGUw.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
      },
      // Add any other critical resources
      ...resources
    ];

    // Preload resources
    defaultResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;

      if (resource.type) {
        link.type = resource.type;
      }

      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }

      // Add high priority for critical resources
      if (resource.as === 'image') {
        (link as any).fetchPriority = 'high';
      }

      // Check if link already exists to avoid duplicates
      const existingLink = document.querySelector(`link[href="${resource.href}"]`);
      if (!existingLink) {
        document.head.appendChild(link);
      }
    });

    // Preconnect to external domains
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.supabase.co'
    ];

    domains.forEach((domain) => {
      const existingPreconnect = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (!existingPreconnect) {
        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = domain;
        if (domain.includes('fonts.gstatic.com')) {
          preconnectLink.crossOrigin = 'anonymous';
        }
        document.head.appendChild(preconnectLink);
      }
    });

  }, [resources]);

  return null; // This component doesn't render anything
}