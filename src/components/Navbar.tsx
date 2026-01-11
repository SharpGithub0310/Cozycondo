'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Building2, BookOpen, Phone, MessageCircle } from 'lucide-react';
import type { WebsiteSettings, NavigationItem } from '@/lib/types';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';

const iconMap = {
  Home,
  Building2,
  BookOpen,
  Phone,
};

interface NavbarProps {
  settings?: WebsiteSettings | null;
}

export default function Navbar({ settings: propSettings }: NavbarProps = {}) {
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when clicking outside or on escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('nav')) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings | null>(propSettings || null);
  const [loading, setLoading] = useState(!propSettings);
  const lastScrollTime = useRef(0);
  const scrollRAF = useRef<number | null>(null);

  // Throttled scroll handler - updates at most every 100ms for better performance
  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      // Throttle: only update if 100ms has passed since last update
      if (now - lastScrollTime.current < 100) {
        // Schedule an update at the end of the throttle window if not already scheduled
        if (scrollRAF.current === null) {
          scrollRAF.current = requestAnimationFrame(() => {
            setScrolled(window.scrollY > 20);
            lastScrollTime.current = Date.now();
            scrollRAF.current = null;
          });
        }
        return;
      }
      lastScrollTime.current = now;
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRAF.current !== null) {
        cancelAnimationFrame(scrollRAF.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!propSettings) {
      const loadSettings = async () => {
        try {
          setLoading(true);
          const dbSettings = await postMigrationDatabaseService.getWebsiteSettings();
          setSettings(dbSettings);
        } catch (error) {
          console.error('Error loading settings:', error);
          setSettings(null);
        } finally {
          setLoading(false);
        }
      };

      loadSettings();
    }
  }, [propSettings]);

  // Get navigation items from settings or fallback to defaults
  const navigation = settings?.navigationItems || [
    { name: 'Home', href: '/', icon: 'Home', description: 'Welcome home' },
    { name: 'Properties', href: '/properties', icon: 'Building2', description: 'Browse properties' },
    { name: 'Blog', href: '/blog', icon: 'BookOpen', description: 'Read our blog' },
    { name: 'Contact', href: '/contact', icon: 'Phone', description: 'Get in touch' },
  ];

  if (!settings) {
    return null; // No content when settings unavailable
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 safe-area-top ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200'
          : 'bg-white/90 backdrop-blur-lg shadow-md border-b border-gray-100'
      }`}
    >
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center gap-3 group touch-target">
            <div className="flex-shrink-0 relative">
              {!loading && settings.logo ? (
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 bg-white ring-2 ring-white/20 group-hover:ring-[var(--color-primary-200)]">
                  <img
                    src={settings.logo}
                    alt={`${settings.companyName || 'Company'} Logo`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.log('Logo failed to load, showing fallback');
                      // Could set an error state here if needed
                    }}
                  />
                </div>
              ) : (
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-700)] flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-display text-base sm:text-xl font-bold">{settings.companyName?.substring(0, 2) || 'CC'}</span>
                </div>
              )}

              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm">
                <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Enhanced Text */}
            <div className="flex flex-col">
              <span className={`font-display text-base sm:text-xl font-bold leading-tight transition-colors duration-300 ${
                scrolled ? 'text-[var(--color-warm-900)]' : 'text-[var(--color-warm-900)]'
              }`}>
                {settings.siteName || settings.companyName || 'Company'}
              </span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigation.map((item) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Home;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 lg:px-5 py-2.5 rounded-xl font-medium transition-all duration-300 touch-target group ${
                    scrolled
                      ? 'text-[var(--color-warm-700)] hover:text-[var(--color-primary-600)] hover:bg-[var(--color-warm-50)]'
                      : 'text-[var(--color-warm-700)] hover:text-[var(--color-primary-600)] hover:bg-[var(--color-warm-50)]'
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </Link>
              );
            })}

            {/* Enhanced CTA Button - respects booking toggle */}
            {settings.bookingEnabled !== false ? (
              // Booking is ON - link to properties page for booking
              <Link
                href="/properties"
                className="ml-4 btn btn-primary btn-sm hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden lg:inline">Book Now</span>
                <span className="lg:hidden">Book</span>
              </Link>
            ) : (
              // Booking is OFF - link to contact page
              <Link
                href="/contact"
                className="ml-4 btn btn-primary btn-sm hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden lg:inline">Contact Us</span>
                <span className="lg:hidden">Contact</span>
              </Link>
            )}
          </div>

          {/* Enhanced Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden relative p-2.5 rounded-xl transition-all duration-300 touch-target group ${
              scrolled
                ? 'text-[var(--color-warm-700)] hover:bg-[var(--color-warm-100)]'
                : 'text-[var(--color-warm-700)] hover:bg-[var(--color-warm-100)]'
            }`}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <div className={`transition-all duration-300 ${isOpen ? 'rotate-90 scale-90' : 'rotate-0 scale-100'}`}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </div>

            {/* Notification dot */}
            {!isOpen && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--color-primary-500)] rounded-full border border-white">
                <div className="w-full h-full bg-[var(--color-primary-400)] rounded-full animate-pulse" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/98 backdrop-blur-2xl border-t border-[var(--color-warm-200)] shadow-2xl safe-area-bottom">
          <div className="px-6 py-6 space-y-2">
            {navigation.map((item, index) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Home;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 touch-target group hover:scale-[1.02] ${
                    index === 0 ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]' : 'text-[var(--color-warm-700)] hover:bg-[var(--color-warm-50)]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    index === 0
                      ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
                      : 'bg-[var(--color-warm-100)] text-[var(--color-warm-600)] group-hover:bg-[var(--color-primary-100)] group-hover:text-[var(--color-primary-600)]'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs text-[var(--color-warm-500)]">
                      {item.description || item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Enhanced mobile CTA - respects booking toggle */}
          <div className="px-6 pb-6">
            {settings.bookingEnabled !== false ? (
              // Booking is ON - link to properties page for booking
              <Link
                href="/properties"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 btn btn-primary w-full py-4 hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Book Your Stay Now</span>
              </Link>
            ) : (
              // Booking is OFF - link to contact page
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-3 btn btn-primary w-full py-4 hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                <Phone className="w-5 h-5" />
                <span className="font-semibold">Contact Us</span>
              </Link>
            )}

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[var(--color-warm-600)]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{settings.availabilityStatus || 'Available 24/7'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[var(--color-primary-500)] rounded-full"></div>
                <span>{settings.responseTimeStatus || 'Fast Response'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
