'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Building2, BookOpen, Phone, MessageCircle } from 'lucide-react';
import { getStoredSettings } from '@/utils/settingsStorage';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export default function Navbar() {
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
  const [logo, setLogo] = useState('');
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load logo from settings with better handling
    const loadLogo = async () => {
      try {
        setLogoLoading(true);
        // First check localStorage
        const settings = getStoredSettings();
        if (settings.logo) {
          setLogo(settings.logo);
        }

        // Also try to fetch from API/database
        if (typeof window !== 'undefined') {
          try {
            const response = await fetch('/api/settings');
            if (response.ok) {
              const data = await response.json();
              if (data.data?.logo) {
                setLogo(data.data.logo);
              }
            }
          } catch (apiError) {
            console.log('Using localStorage logo fallback');
          }
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      } finally {
        setLogoLoading(false);
      }
    };

    loadLogo();
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-area-top ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group touch-target">
            {/* Logo Image/Fallback - Always Show */}
            <div className="flex-shrink-0">
              {!logoLoading && logo ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg group-hover:shadow-xl transition-shadow bg-white">
                  <img
                    src={logo}
                    alt="Cozy Condo Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.log('Logo failed to load, showing fallback');
                      setLogo(''); // Reset logo state to show fallback
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0d9488] to-[#14b8a6] flex items-center justify-center shadow-md sm:shadow-lg group-hover:shadow-xl transition-all">
                  <span className="text-white font-display text-base sm:text-xl font-bold">CC</span>
                </div>
              )}
            </div>
            {/* Text - Responsive */}
            <div className="flex flex-col">
              <span className="font-display text-base sm:text-xl font-semibold text-[#5f4a38] leading-tight">
                Cozy Condo
              </span>
              <span className="text-xs text-[#9a7d5e] leading-tight">Iloilo City</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 lg:px-4 py-2 rounded-lg text-[#7d6349] hover:text-[#5f4a38] hover:bg-[#faf3e6] transition-all duration-200 font-medium touch-target"
              >
                {item.name}
              </Link>
            ))}
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 lg:ml-4 btn-primary flex items-center gap-2 touch-target"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Book Now</span>
              <span className="lg:hidden">Book</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-[#7d6349] hover:bg-[#faf3e6] transition-colors touch-target"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/98 backdrop-blur-md border-t border-[#faf3e6] px-4 py-4 space-y-1 safe-area-bottom">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#7d6349] hover:text-[#5f4a38] hover:bg-[#faf3e6] transition-all duration-200 touch-target"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-fluid-base">{item.name}</span>
              </Link>
            );
          })}
          <a
            href="https://m.me/cozycondoiloilocity"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 mt-4 btn-primary w-full touch-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Book Now</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
