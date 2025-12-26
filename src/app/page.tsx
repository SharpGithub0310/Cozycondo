'use client';

import Hero from '@/components/Hero';
import { Building2, Shield, Clock, Heart, MapPin, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import type { PropertyData } from '@/lib/types';
import type { WebsiteSettings } from '@/lib/types';
import { normalizePropertyData } from '@/utils/slugify';

// Features section data
const features = [
  {
    icon: Building2,
    title: 'Prime Locations',
    description: 'All our properties are strategically located in Iloilo City, close to malls, restaurants, and business districts.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: '24/7 security, CCTV monitoring, and secure building access for your peace of mind.',
  },
  {
    icon: Clock,
    title: 'Flexible Stays',
    description: 'Whether you need a night or a month, we offer flexible booking options to suit your needs.',
  },
  {
    icon: Heart,
    title: 'Personal Touch',
    description: 'Experience warm Filipino hospitality with personalized service and local recommendations.',
  },
];

// Legacy property IDs - no longer used
// Properties are now loaded dynamically from database

export default function HomePage() {
  const [aboutImage, setAboutImage] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadMetrics, setLoadMetrics] = useState<{ duration: number; source: string } | null>(null);

  useEffect(() => {
    // Initialize admin logs if in admin mode
    if (typeof window !== 'undefined') {
      (window as any).adminLogs = (window as any).adminLogs || [];
    }

    const loadData = async () => {
      const startTime = performance.now();

      try {
        setLoading(true);
        setError(null);

        // Log start of data loading
        if (typeof window !== 'undefined' && (window as any).adminLogs) {
          (window as any).adminLogs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            service: 'HomePage',
            message: 'Starting data load for home page',
            data: { startTime }
          });
        }

        // Load settings and only active properties from database
        const [loadedSettings, propertiesData] = await Promise.all([
          postMigrationDatabaseService.getWebsiteSettings(),
          postMigrationDatabaseService.getProperties({ active: true })
        ]);

        const loadDuration = performance.now() - startTime;

        // Log successful data load
        if (typeof window !== 'undefined' && (window as any).adminLogs) {
          (window as any).adminLogs.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            service: 'HomePage',
            message: `Data loaded successfully in ${loadDuration.toFixed(2)}ms`,
            data: {
              settingsLoaded: !!loadedSettings,
              propertiesCount: Object.keys(propertiesData).length,
              duration: loadDuration
            }
          });
        }

        setSettings(loadedSettings);

        if (loadedSettings.aboutImage) {
          setAboutImage(loadedSettings.aboutImage);
        }

        // Convert properties object to array format for processing
        // Properties are already filtered to active only
        const propertiesArray = Object.values(propertiesData).map((property: any) =>
          normalizePropertyData(property)
        );

        // Filter to show featured properties (all are already active)
        let featured = propertiesArray.filter(p => p.featured);

        // If no featured properties, show first 3 properties
        if (featured.length === 0) {
          featured = propertiesArray.slice(0, 3);

          if (typeof window !== 'undefined' && (window as any).adminLogs) {
            (window as any).adminLogs.push({
              timestamp: new Date().toISOString(),
              level: 'warn',
              service: 'HomePage',
              message: 'No featured properties found, using first 3',
              data: { totalProperties: propertiesArray.length }
            });
          }
        }

        setFeaturedProperties(featured);
        setLoadMetrics({
          duration: loadDuration,
          source: propertiesArray.length > 0 ? 'database' : 'fallback'
        });
      } catch (err: any) {
        const loadDuration = performance.now() - startTime;

        // Log error to admin console
        if (typeof window !== 'undefined' && (window as any).adminLogs) {
          (window as any).adminLogs.push({
            timestamp: new Date().toISOString(),
            level: 'error',
            service: 'HomePage',
            message: 'Failed to load data',
            data: {
              error: err.message,
              stack: err.stack,
              duration: loadDuration
            }
          });
        }

        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
        setLoadMetrics({ duration: loadDuration, source: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Enhanced Properties Section */}
      <section id="properties" className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="section-title">{settings?.featuredTitle || 'Featured Properties'}</h2>
            <p className="section-subtitle mx-auto">
              {settings?.featuredSubtitle || 'Handpicked condominiums offering the perfect balance of comfort, convenience, and style.'}
            </p>
          </div>

          {loading ? (
            <div className="grid-auto-fit grid-gap-lg">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="card-image bg-[var(--color-warm-200)]"></div>
                  <div className="card-content">
                    <div className="h-6 bg-[var(--color-warm-200)] rounded mb-3"></div>
                    <div className="h-4 bg-[var(--color-warm-200)] rounded mb-3"></div>
                    <div className="h-16 bg-[var(--color-warm-200)] rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-[var(--color-warm-200)] rounded"></div>
                      <div className="h-6 w-20 bg-[var(--color-warm-200)] rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                <span>Try Again</span>
              </button>
            </div>
          ) : (
            <div className="grid-auto-fit grid-gap-lg">
              {featuredProperties.map((property, index) => (
              <article
                key={property.id}
                className="card card-elevated group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Enhanced Image with lazy loading */}
                <div className="card-image">
                  <div className="card-image-overlay" />

                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[property.featuredPhotoIndex || 0]}
                      alt={property.name}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={index === 0 ? "high" : "auto"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div className={`w-full h-full flex items-center justify-center ${property.photos && property.photos.length > 0 ? 'hidden' : ''}`}>
                    <div className="text-center text-[var(--color-warm-600)]">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-warm-200)] to-[var(--color-warm-300)] flex items-center justify-center shadow-lg">
                        <span className="font-display text-2xl font-bold text-[var(--color-warm-800)]">CC</span>
                      </div>
                      <p className="text-sm font-medium">Photo coming soon</p>
                    </div>
                  </div>

                  {property.featured && (
                    <div className="featured-badge">
                      Featured
                    </div>
                  )}

                  {/* Quick action overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
                    <Link
                      href={`/properties/${property.slug}`}
                      className="btn btn-primary btn-sm w-full hover:scale-105"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 icon-arrow" />
                    </Link>
                  </div>
                </div>

                {/* Enhanced Content */}
                <div className="card-content">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="card-title group-hover:text-[var(--color-primary-600)]">
                      {property.name}
                    </h3>
                  </div>

                  <div className="card-meta flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-[var(--color-primary-500)]" />
                    <span className="font-medium">{property.location}</span>
                  </div>

                  <p className="card-description line-clamp-2">
                    {property.short_description}
                  </p>

                  {/* Enhanced amenities */}
                  {property.amenities && (
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.slice(0, 3).map((amenity: string, i: number) => (
                        <span key={i} className="amenity-tag">
                          <span className="capitalize">{amenity}</span>
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="amenity-tag bg-[var(--color-primary-50)] border-[var(--color-primary-200)] text-[var(--color-primary-800)]">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              href="/properties"
              className="btn btn-primary btn-xl hover:scale-105 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-6 h-6 icon-arrow" />
            </Link>
            <p className="text-[var(--color-warm-600)] text-sm mt-4">
              Discover all our premium accommodations in Iloilo City
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="section bg-gradient-to-br from-[var(--color-warm-100)] to-[var(--color-warm-50)]">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="section-title">Why Choose Cozy Condo?</h2>
            <p className="section-subtitle mx-auto">
              We go beyond just providing a place to stay. We create memorable experiences with warm Filipino hospitality.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card card-flat text-center p-8 hover:card-elevated group transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="card-title text-center mb-3 group-hover:text-[var(--color-primary-600)]">
                    {feature.title}
                  </h3>
                  <p className="card-description text-center">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Enhanced Image side */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[var(--color-warm-300)] to-[var(--color-warm-500)] ring-1 ring-white/20">
                {/* Enhanced image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

                {aboutImage ? (
                  <img
                    src={aboutImage}
                    alt="About Cozy Condo"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}

                <div className={`w-full h-full flex items-center justify-center ${aboutImage ? 'hidden' : ''}`}>
                  <div className="text-center text-white/80">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="font-display text-3xl font-bold">CC</span>
                    </div>
                    <p className="text-2xl font-display font-bold">Cozy Condo</p>
                    <p className="text-sm opacity-80">Premium Stays • Iloilo City</p>
                  </div>
                </div>

                {/* Subtle pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10 z-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}
                />
              </div>

              {/* Enhanced decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 lg:w-40 lg:h-40 bg-gradient-to-br from-[var(--color-accent-orange)]/20 to-[var(--color-accent-orange-light)]/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-1/4 -left-4 w-3 h-3 bg-[var(--color-primary-400)] rounded-full animate-float opacity-70" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/4 -right-2 w-2 h-2 bg-[var(--color-accent-orange)] rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }} />
            </div>

            {/* Enhanced Content side */}
            <div className="order-1 lg:order-2">
              <div className="hero-badge mb-8">
                <div className="hero-badge-dot" />
                <span>Trusted by 1000+ Guests Since 2020</span>
              </div>

              <h2 className="section-title mb-6">Welcome to Cozy Condo</h2>
              <p className="text-[var(--color-warm-700)] text-lg mb-6 leading-relaxed">
                Founded with a passion for hospitality, Cozy Condo has been providing exceptional short-term rental experiences in Iloilo City. Our carefully curated collection of condominiums combines modern comfort with warm Filipino hospitality.
              </p>
              <p className="text-[var(--color-warm-600)] mb-8 leading-relaxed">
                Whether you're a business traveler, a vacationing family, or someone relocating to the city, we have the perfect space for you. Each of our premium properties is thoughtfully designed and maintained to ensure your stay is nothing short of exceptional.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { value: '1000+', label: 'Happy Guests' },
                  { value: '10+', label: 'Properties' },
                  { value: '4.9★', label: 'Average Rating' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-primary-600)] mb-1">{stat.value}</div>
                    <div className="text-xs text-[var(--color-warm-600)] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="btn btn-primary btn-lg hover:scale-105">
                  <span>Get in Touch</span>
                </Link>
                <Link href="/properties" className="btn btn-secondary btn-lg hover:scale-105">
                  <span>Browse Properties</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-[#5f4a38] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-[#14b8a6]/20 rounded-full blur-2xl sm:blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-80 sm:h-80 bg-[#fb923c]/20 rounded-full blur-2xl sm:blur-3xl" />

        <div className="relative container-responsive text-center max-w-4xl mx-auto">
          <h2 className="font-display text-fluid-3xl font-semibold mb-fluid-lg">
            Ready to Book Your Stay?
          </h2>
          <p className="text-[#d4b896] text-fluid-lg mb-fluid-xl max-w-2xl mx-auto">
            Contact us today and let us help you find the perfect condo for your needs. We&apos;re here to make your stay in Iloilo City unforgettable.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-fluid-md mb-fluid-2xl">
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-[#14b8a6] hover:bg-[#0d9488] rounded-lg transition-all duration-300 hover:shadow-lg touch-target"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message Us on Facebook</span>
            </a>
            <a
              href="tel:+639778870724"
              className="btn-secondary bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-300 touch-target"
            >
              <Phone className="w-5 h-5" />
              <span>Call +63 977 887 0724</span>
            </a>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row justify-center gap-fluid-md text-fluid-sm text-[#d4b896]">
            <a href="mailto:admin@cozycondo.net" className="flex items-center justify-center sm:justify-start gap-2 hover:text-white transition-colors touch-target">
              <Mail className="w-4 h-4" />
              <span>admin@cozycondo.net</span>
            </a>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <MapPin className="w-4 h-4" />
              <span>Iloilo City, Philippines</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
