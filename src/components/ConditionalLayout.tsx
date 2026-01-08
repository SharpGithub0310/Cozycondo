'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MessengerWidget from '@/components/MessengerWidget';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes: just render children without public site components
    return <main className="min-h-screen">{children}</main>;
  }

  // Public routes: render with navbar, footer, and messenger widget
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <MessengerWidget />
    </>
  );
}