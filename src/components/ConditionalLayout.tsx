'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MessengerWidget from '@/components/MessengerWidget';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import type { WebsiteSettings } from '@/lib/types';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  // Consolidate settings fetching - fetch once for all components (performance optimization)
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    // Only fetch settings for public routes
    if (!isAdminRoute) {
      const loadSettings = async () => {
        try {
          const dbSettings = await postMigrationDatabaseService.getWebsiteSettings();
          setSettings(dbSettings);
        } catch (error) {
          console.error('Error loading settings:', error);
          setSettings(null);
        }
      };
      loadSettings();
    }
  }, [isAdminRoute]);

  if (isAdminRoute) {
    // Admin routes: just render children without public site components
    return <main className="min-h-screen">{children}</main>;
  }

  // Public routes: render with navbar, footer, and messenger widget
  // Pass settings to Navbar and Footer to avoid duplicate fetches
  return (
    <>
      <Navbar settings={settings} />
      <main>{children}</main>
      <Footer settings={settings} />
      <MessengerWidget />
    </>
  );
}