'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, MapPin, Star, Home } from 'lucide-react';
import Link from 'next/link';
import { enhancedDatabaseService } from '@/lib/enhanced-database-service';
import type { WebsiteSettings } from '@/lib/enhanced-database-service';

// Stats will be loaded from settings

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [heroBackground, setHeroBackground] = useState('');
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadedSettings = await enhancedDatabaseService.getWebsiteSettings();
        // console.log('Hero: Loaded settings from database:', loadedSettings);

        setSettings(loadedSettings);

        if (loadedSettings.heroBackground) {
          setHeroBackground(loadedSettings.heroBackground);
        }
      } catch (err) {
        console.error('Hero: Error loading settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fefdfb] via-[#fdf9f3] to-[#f5e6cc]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-8"></div>
              <div className="flex gap-4 mb-12">
                <div className="h-12 w-32 bg-gray-200 rounded"></div>
                <div className="h-12 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-8">
                <div className="h-16 w-24 bg-gray-200 rounded"></div>
                <div className="h-16 w-24 bg-gray-200 rounded"></div>
                <div className="h-16 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="aspect-[4/5] bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fefdfb] via-[#fdf9f3] to-[#f5e6cc]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-red-600 mb-4">
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!settings) return null;

  const stats = [
    { icon: Home, value: settings.statsUnits, label: settings.statsUnitsLabel },
    { icon: Star, value: settings.statsRating, label: settings.statsRatingLabel },
    { icon: MapPin, value: settings.statsLocation, label: settings.statsLocationLabel },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image or gradient */}
      {heroBackground ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
          <div className="absolute inset-0 bg-[#5f4a38]/40" />
        </>
      ) : (
        <>
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#fefdfb] via-[#fdf9f3] to-[#f5e6cc]" />

          {/* Decorative elements */}
          <div className="absolute top-20 right-0 w-96 h-96 bg-[#14b8a6]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-80 h-80 bg-[#fb923c]/10 rounded-full blur-3xl" />
        </>
      )}
      
      {/* Floating shapes */}
      <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-[#14b8a6] rounded-full animate-float opacity-60" />
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[#fb923c] rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/3 left-1/4 w-5 h-5 bg-[#d4b896] rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
          {/* Text content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Badge */}
            {settings.heroBadgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-[#faf3e6] mb-6">
                <span className="w-2 h-2 bg-[#14b8a6] rounded-full animate-pulse" />
                <span className="text-sm font-medium text-[#7d6349]">{settings.heroBadgeText}</span>
              </div>
            )}

            <h1 className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-4 sm:mb-6 ${heroBackground ? 'text-white' : 'text-[#5f4a38]'}`}>
              {settings.heroTitle}
            </h1>

            <p className={`text-base sm:text-lg mb-6 sm:mb-8 max-w-xl ${heroBackground ? 'text-white/90' : 'text-[#7d6349]'}`}>
              {settings.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
              <Link href="/properties" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] justify-center">
                Explore Properties
              </Link>
              <a
                href="https://m.me/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] justify-center"
              >
                Message Us
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`transition-all duration-700 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                    style={{ transitionDelay: `${(index + 2) * 150}ms` }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#14b8a6]" />
                      </div>
                      <div>
                        <div className={`font-display text-xl sm:text-2xl font-semibold ${heroBackground ? 'text-white' : 'text-[#5f4a38]'}`}>
                          {stat.value}
                        </div>
                        <div className={`text-sm ${heroBackground ? 'text-white/80' : 'text-[#9a7d5e]'}`}>{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image composition */}
          <div
            className={`relative transition-all duration-1000 delay-300 order-first lg:order-last ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative">
              {/* Main image */}
              <div className="relative aspect-[4/5] sm:aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl bg-gradient-to-br from-[#d4b896] to-[#b89b7a]">
                {settings.highlyRatedImage ? (
                  <img
                    src={settings.highlyRatedImage}
                    alt="Highly rated property"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${settings.highlyRatedImage ? 'hidden' : ''}`}>
                  <div className="text-center text-white/80">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-4 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="font-display text-2xl sm:text-4xl font-bold">CC</span>
                    </div>
                    <p className="text-base sm:text-lg font-medium">Cozy Condo</p>
                    <p className="text-sm opacity-80">Premium Living</p>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 border border-[#faf3e6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#14b8a6] flex items-center justify-center">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
                  </div>
                  <div>
                    <div className="font-display text-lg sm:text-xl font-semibold text-[#5f4a38]">
                      {settings.highlyRatedTitle}
                    </div>
                    <div className="text-xs sm:text-sm text-[#9a7d5e]">{settings.highlyRatedSubtitle}</div>
                  </div>
                </div>
              </div>

              {/* Decorative blob */}
              <div className="absolute -top-4 -right-4 sm:-top-8 sm:-right-8 w-16 h-16 sm:w-32 sm:h-32 bg-[#14b8a6]/20 rounded-full blur-xl sm:blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a href="#properties" className={`flex flex-col items-center transition-colors ${heroBackground ? 'text-white/80 hover:text-white' : 'text-[#9a7d5e] hover:text-[#0d9488]'}`}>
          <span className="text-xs sm:text-sm mb-1 sm:mb-2 hidden sm:block">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </a>
      </div>
    </section>
  );
}
