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
    // Fonts are now self-hosted via next/font - no external preloading needed
    // Only preload custom resources passed as props
    const defaultResources: PreloadResource[] = [...resources];

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

    // Preconnect to external domains (only Supabase now - fonts are self-hosted)
    const domains = [
      'https://api.supabase.co'
    ];

    domains.forEach((domain) => {
      const existingPreconnect = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (!existingPreconnect) {
        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = domain;
        document.head.appendChild(preconnectLink);
      }
    });

  }, [resources]);

  return null; // This component doesn't render anything
}