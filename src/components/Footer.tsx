'use client';

import Link from 'next/link';
import { Facebook, Phone, Mail, MapPin, MessageCircle, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStoredSettings } from '@/utils/settingsStorage';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [footerLogo, setFooterLogo] = useState('');

  useEffect(() => {
    const settings = getStoredSettings();
    if (settings.footerLogo) {
      setFooterLogo(settings.footerLogo);
    }
  }, []);

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
              {footerLogo ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/10">
                  <img
                    src={footerLogo}
                    alt="Cozy Condo Logo"
                    className="w-full h-full object-contain bg-white/10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                </div>
              ) : null}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-xl ring-2 ring-white/10 ${footerLogo ? 'hidden' : ''}`}>
                <span className="text-white font-display text-2xl font-bold">CC</span>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-white">Cozy Condo</span>
                <span className="block text-sm text-white/70 font-medium">Premium Stays • Iloilo City</span>
              </div>
            </div>

            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
              Your home away from home in the heart of Iloilo City. Experience comfort and convenience in our premium short-term rental condominiums with warm Filipino hospitality.
            </p>

            {/* Enhanced social links */}
            <div className="flex items-center gap-4 mb-8">
              <a
                href="https://www.facebook.com/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-[var(--color-primary-500)] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
              >
                <Facebook className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://m.me/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-[var(--color-primary-500)] flex items-center justify-center transition-all duration-300 hover:scale-110 group"
              >
                <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Available 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--color-primary-400)] rounded-full animate-pulse" />
                <span className="text-sm font-medium">Fast Response</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', href: '/', desc: 'Welcome to Cozy Condo' },
                { name: 'Properties', href: '/properties', desc: 'Browse our collection' },
                { name: 'Blog', href: '/blog', desc: 'Travel tips & guides' },
                { name: 'Contact', href: '/contact', desc: 'Get in touch' },
              ].map((link) => (
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
                      <div className="text-xs text-white/60">{link.desc}</div>
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
              <a
                href="tel:+639778870724"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--color-primary-400)]/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Call Us</div>
                  <div className="text-[var(--color-primary-300)] text-sm">+63 977 887 0724</div>
                  <div className="text-xs text-white/60">Available 8AM - 10PM</div>
                </div>
              </a>

              <a
                href="mailto:admin@cozycondo.net"
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--color-accent-orange)]/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-orange-dark)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Email Us</div>
                  <div className="text-[var(--color-accent-orange-light)] text-sm">admin@cozycondo.net</div>
                  <div className="text-xs text-white/60">For detailed inquiries</div>
                </div>
              </a>

              {/* Quick book CTA */}
              <a
                href="https://m.me/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-primary-800)] text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Book Your Stay Now</span>
              </a>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom bar */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-white/60">
              <p className="text-sm font-medium">
                © {currentYear} Cozy Condo Iloilo City. All rights reserved.
              </p>
              <div className="flex items-center gap-6 text-xs">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm text-white/60 flex items-center gap-2">
                Made with <Heart className="w-4 h-4 text-[var(--color-accent-orange)] animate-pulse" /> in Iloilo City
              </p>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2 text-xs text-white/50">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-white/40">
              Proudly serving travelers in Iloilo City since 2020 • Licensed and verified accommodation provider
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
