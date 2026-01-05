'use client';

import Link from 'next/link';
import { Facebook, Phone, Mail, MapPin, MessageCircle, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { WebsiteSettings } from '@/lib/types';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';

interface FooterProps {
  settings?: WebsiteSettings | null;
}

export default function Footer({ settings: propSettings }: FooterProps = {}) {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<WebsiteSettings | null>(propSettings || null);
  const [loading, setLoading] = useState(!propSettings);

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

  if (!settings) {
    return null; // No content when settings unavailable
  }

  return (
    <footer className="bg-gradient-to-br from-[var(--color-warm-900)] via-[var(--color-warm-800)] to-[var(--color-warm-950)] text-[var(--color-warm-50)] relative overflow-hidden">
      {/* Enhanced Wave decoration */}
      <div className="h-20 bg-[var(--color-warm-50)] relative">
        <svg
          viewBox="0 0 1440 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-warm-900)" />
              <stop offset="50%" stopColor="var(--color-warm-800)" />
              <stop offset="100%" stopColor="var(--color-warm-950)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradient)"
            d="M0,40 C320,100 420,0 740,50 C1060,100 1200,20 1440,60 L1440,100 L0,100 Z"
          />
        </svg>

        {/* Floating elements */}
        <div className="absolute top-0 left-1/4 w-4 h-4 bg-[var(--color-primary-400)] rounded-full opacity-20 animate-float" />
        <div className="absolute top-4 right-1/3 w-3 h-3 bg-[var(--color-accent-orange)] rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--color-primary-400)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[var(--color-accent-orange)]/5 rounded-full blur-3xl" />

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative container-xl py-16 lg:py-24">
        <div className="grid lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Enhanced Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              {!loading && settings.footerLogo ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/10">
                  <img
                    src={settings.footerLogo}
                    alt={`${settings.companyName || 'Company'} Logo`}
                    className="w-full h-full object-contain bg-white/10"
                    onError={(e) => {
                      console.log('Footer logo failed to load');
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-xl ring-2 ring-white/10">
                  <span className="text-white font-display text-2xl font-bold">{settings.companyName?.substring(0, 2) || 'CC'}</span>
                </div>
              )}
              <div>
                <span className="font-display text-2xl font-bold text-white">{settings.companyName || 'Company'}</span>
                <span className="block text-sm text-white/70 font-medium">{settings.siteTagline || 'Premium Stays'}</span>
              </div>
            </div>

            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
              {settings.footerDescription || settings.companyDescription || 'Premium accommodations for your perfect stay.'}
            </p>

            {/* Enhanced social links */}
            <div className="flex items-center gap-4 mb-8">
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-[var(--color-primary-500)] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Facebook className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </a>
              )}
              {settings.socialMessenger && (
                <a
                  href={settings.socialMessenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-[var(--color-primary-500)] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </a>
              )}
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">{settings.availabilityStatus || 'Available 24/7'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--color-primary-400)] rounded-full animate-pulse" />
                <span className="text-sm font-medium">{settings.responseTimeStatus || 'Fast Response'}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {(settings.navigationItems || [
                { name: 'Home', href: '/', description: 'Welcome home' },
                { name: 'Properties', href: '/properties', description: 'Browse properties' },
                { name: 'Blog', href: '/blog', description: 'Read our blog' },
                { name: 'Contact', href: '/contact', description: 'Get in touch' },
              ]).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="w-2 h-2 bg-[var(--color-primary-400)] rounded-full mt-2 group-hover:scale-150 transition-transform" />
                    <div>
                      <div className="text-white font-medium group-hover:text-[var(--color-primary-300)] transition-colors">
                        {link.name}
                      </div>
                      <div className="text-xs text-white/60">{link.description || link.name}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enhanced Contact Info */}
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-6">Get In Touch</h3>
            <div className="space-y-6">
              {settings.contactPhone && (
                <a
                  href={`tel:${settings.contactPhone}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--color-primary-400)]/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Call Us</div>
                    <div className="text-[var(--color-primary-300)] text-sm">{settings.contactPhoneDisplay || settings.contactPhone}</div>
                    <div className="text-xs text-white/60">{settings.availabilityStatus || 'Available 8AM - 10PM'}</div>
                  </div>
                </a>
              )}

              {settings.contactEmail && (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--color-accent-orange)]/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-orange-dark)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Email Us</div>
                    <div className="text-[var(--color-accent-orange-light)] text-sm">{settings.contactEmailDisplay || settings.contactEmail}</div>
                    <div className="text-xs text-white/60">For detailed inquiries</div>
                  </div>
                </a>
              )}

              {settings.socialMessenger && (
                <a
                  href={settings.socialMessenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-primary-800)] text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Book Your Stay Now</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Bottom bar */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-white/60">
              <p className="text-sm font-medium">
                © {currentYear} {settings.footerCopyrightText || `${settings.companyName || 'Company'}. All rights reserved.`}
              </p>
              <div className="flex items-center gap-6 text-xs">
                <Link href={settings.privacyPolicyUrl || '/privacy'} className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href={settings.termsOfServiceUrl || '/terms'} className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href={settings.sitemapUrl || '/sitemap'} className="hover:text-white transition-colors">Sitemap</Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-white/60 flex items-center gap-2">
                Made with <Heart className="w-4 h-4 text-[var(--color-accent-orange)] animate-pulse" /> in {settings.address?.split(',')[0] || 'Philippines'}
              </p>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2 text-xs text-white/50">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{settings.systemStatus || 'All systems operational'}</span>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-white/40">
              Proudly serving travelers in {settings.address?.split(',')[0] || 'the Philippines'} • Licensed and verified accommodation provider
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}