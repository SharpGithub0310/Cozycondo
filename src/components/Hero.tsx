'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, Star, Home, ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { WebsiteSettings } from '@/lib/types';

interface HeroProps {
  settings?: WebsiteSettings | null;
}

export default function Hero({ settings }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!settings) {
    return null; // No content when settings unavailable
  }

  const stats = [
    { icon: Home, value: settings.statsUnits, label: settings.statsUnitsLabel },
    { icon: Star, value: settings.statsRating, label: settings.statsRatingLabel },
    { icon: MapPin, value: settings.statsLocation, label: settings.statsLocationLabel },
  ];

  return (
    <section className="hero mt-20">
      {/* Enhanced Background */}
      {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm-50)] via-[var(--color-warm-100)] to-[var(--color-warm-200)]" />

        {/* Mesh gradient overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 200% 100% at 50% 0%, var(--color-primary-100) 0%, transparent 50%),
              radial-gradient(ellipse 200% 100% at 80% 100%, var(--color-accent-orange-light) 0%, transparent 50%),
              radial-gradient(ellipse 150% 100% at 20% 100%, var(--color-primary-200) 0%, transparent 50%)
            `
          }}
        />

        {/* Enhanced decorative elements */}
        <div className="hidden lg:block absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-[var(--color-primary-300)]/20 to-[var(--color-primary-500)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="hidden lg:block absolute bottom-32 left-16 w-96 h-96 bg-gradient-to-tr from-[var(--color-accent-orange)]/15 to-[var(--color-warm-400)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />


      <div className="container-xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
          {/* Enhanced Text content - Left half centered */}
          <div
            className={`flex flex-col justify-center transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Enhanced Badge */}
            {settings.heroBadgeText && (
              <div className="hero-badge mb-8 mt-12">
                <div className="hero-badge-dot" />
                <span>{settings.heroBadgeText}</span>
              </div>
            )}

            <h1 className="hero-title text-[var(--color-warm-900)]">
              {settings.heroTitle}
            </h1>

            <p className="hero-subtitle text-[var(--color-warm-700)]">
              {settings.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/properties" className="btn btn-primary btn-lg">
                <span>Explore Properties</span>
                <ArrowRight className="w-5 h-5 icon-arrow" />
              </Link>
              {settings.messengerUrl && (
                <a
                  href={settings.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Message Us</span>
                </a>
              )}
            </div>

            {/* Enhanced Stats - Under buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`group transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                    style={{ transitionDelay: `${(index + 2) * 150}ms` }}
                  >
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-display text-2xl font-bold text-[var(--color-warm-900)]">
                          {stat.value}
                        </div>
                        <div className="text-sm font-medium text-[var(--color-warm-600)]">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Image composition - Right half centered */}
          <div
            className={`relative flex justify-center items-center transition-all duration-1000 delay-300 order-first lg:order-last ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative w-full max-w-md">
              {/* Main image with enhanced styling - 3/4 size */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[var(--color-warm-300)] to-[var(--color-warm-500)] ring-1 ring-white/20">
                {/* Enhanced image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

                {settings.highlyRatedImage ? (
                  <>
                    <img
                      src={settings.highlyRatedImage}
                      alt="Highly rated property"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="eager"
                      onLoad={(e) => {
                        console.log('Hero image loaded successfully');
                      }}
                      onError={(e) => {
                        console.log('Hero image failed to load, showing fallback', e);
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center hidden">
                      <div className="text-center text-white/80">
                        <div className="w-20 h-20 lg:w-28 lg:h-28 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="font-display text-3xl lg:text-5xl font-bold">{settings.companyName?.substring(0, 2) || 'CC'}</span>
                        </div>
                        <p className="text-xl font-medium">{settings.companyName || 'Company'}</p>
                        <p className="text-sm opacity-80">{settings.siteTagline || 'Premium Living'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/80">
                      <div className="w-20 h-20 lg:w-28 lg:h-28 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="font-display text-3xl lg:text-5xl font-bold">{settings.companyName?.substring(0, 2) || 'CC'}</span>
                      </div>
                      <p className="text-xl font-medium">{settings.companyName || 'Company'}</p>
                      <p className="text-sm opacity-80">{settings.siteTagline || 'Premium Living'}</p>
                    </div>
                  </div>
                )}

                {/* Subtle pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10 z-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}
                />
              </div>

              {/* Enhanced floating rating card - 1/5 size, bottom left of hero photo */}
              <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl p-2 border border-white/30 ring-1 ring-black/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center shadow-lg">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                  <div>
                    <div className="font-display text-xs font-bold text-[var(--color-warm-900)]">
                      {settings.highlyRatedTitle}
                    </div>
                    <div className="text-[10px] text-[var(--color-warm-600)] font-medium">
                      {settings.highlyRatedSubtitle}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 lg:w-40 lg:h-40 bg-gradient-to-br from-[var(--color-primary-400)]/30 to-[var(--color-primary-600)]/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute top-1/4 -right-4 w-3 h-3 bg-[var(--color-accent-orange)] rounded-full animate-float opacity-70" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-1/4 -left-2 w-2 h-2 bg-[var(--color-primary-400)] rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
