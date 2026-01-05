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

  const heroBackground = settings?.heroBackground;

  if (!settings) {
    return null; // No content when settings unavailable
  }

  const stats = [
    { icon: Home, value: settings.statsUnits, label: settings.statsUnitsLabel },
    { icon: Star, value: settings.statsRating, label: settings.statsRatingLabel },
    { icon: MapPin, value: settings.statsLocation, label: settings.statsLocationLabel },
  ];

  return (
    <section className="hero">
      {/* Enhanced Background */}
      {heroBackground ? (
        <>
          <Image
            src={heroBackground}
            alt={`${settings.companyName || 'Company'} Hero Background`}
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />
        </>
      ) : (
        <>
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

          {/* Floating geometric shapes */}
          <div className="absolute top-1/4 right-1/5 w-3 h-3 bg-[var(--color-primary-500)] rounded-full animate-float opacity-60" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-[var(--color-accent-orange)] rounded-full animate-float opacity-70" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-[var(--color-warm-500)] rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
          <div className="absolute top-2/3 right-2/3 w-1.5 h-1.5 bg-[var(--color-primary-400)] rounded-full animate-float opacity-80" style={{ animationDelay: '0.5s' }} />
        </>
      )}

      <div className="container-xl">
        <div className="hero-content">
          {/* Enhanced Text content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Enhanced Badge */}
            {settings.heroBadgeText && (
              <div className="hero-badge mb-8">
                <div className="hero-badge-dot" />
                <span>{settings.heroBadgeText}</span>
              </div>
            )}

            <h1 className={`hero-title ${heroBackground ? 'text-white drop-shadow-lg' : 'text-[var(--color-warm-900)]'}`}>
              {settings.heroTitle}
            </h1>

            <p className={`hero-subtitle ${heroBackground ? 'text-white/90 drop-shadow-md' : 'text-[var(--color-warm-700)]'}`}>
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

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
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
                        <div className={`font-display text-2xl font-bold ${heroBackground ? 'text-white drop-shadow-md' : 'text-[var(--color-warm-900)]'}`}>
                          {stat.value}
                        </div>
                        <div className={`text-sm font-medium ${heroBackground ? 'text-white/90' : 'text-[var(--color-warm-600)]'}`}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Image composition */}
          <div
            className={`relative transition-all duration-1000 delay-300 order-first lg:order-last ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative">
              {/* Main image with enhanced styling */}
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

              {/* Enhanced floating rating card */}
              <div className="absolute -bottom-6 -left-6 lg:-bottom-8 lg:-left-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 lg:p-6 border border-white/30 ring-1 ring-black/5 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 lg:w-7 lg:h-7 text-white fill-white" />
                  </div>
                  <div>
                    <div className="font-display text-lg lg:text-xl font-bold text-[var(--color-warm-900)]">
                      {settings.highlyRatedTitle}
                    </div>
                    <div className="text-sm lg:text-base text-[var(--color-warm-600)] font-medium">
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

      {/* Enhanced scroll indicator */}
      <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2">
        <a
          href="#properties"
          className={`group flex flex-col items-center transition-all duration-300 hover:scale-110 ${
            heroBackground ? 'text-white/80 hover:text-white' : 'text-[var(--color-warm-600)] hover:text-[var(--color-primary-600)]'
          }`}
        >
          <span className="text-sm font-medium mb-3 hidden sm:block group-hover:mb-4 transition-all duration-300">
            {settings.heroScrollText || 'Scroll to explore'}
          </span>
          <div className="w-8 h-12 border-2 border-current rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-current rounded-full animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  );
}
