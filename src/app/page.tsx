'use client';

import Hero from '@/components/Hero';
import { Building2, Shield, Clock, Heart, MapPin, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { enhancedDatabaseService } from '@/lib/enhanced-database-service';
import type { PropertyData, WebsiteSettings } from '@/lib/enhanced-database-service';

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

// Property IDs to load
const propertyIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function HomePage() {
  const [aboutImage, setAboutImage] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load settings and properties from database
        const [loadedSettings, propertiesData] = await Promise.all([
          enhancedDatabaseService.getWebsiteSettings(),
          enhancedDatabaseService.getProperties()
        ]);

        console.log('Loaded settings from database:', loadedSettings);
        console.log('Loaded properties from database:', propertiesData);

        setSettings(loadedSettings);

        if (loadedSettings.aboutImage) {
          setAboutImage(loadedSettings.aboutImage);
        }

        // Convert properties object to array format for processing
        const propertiesArray = Object.values(propertiesData).map((property: any) => ({
          id: property.id,
          name: property.name || property.title,
          slug: property.slug || property.name?.toLowerCase().replace(/\s+/g, '-') || property.id,
          location: property.location || '',
          short_description: property.description || '',
          amenities: property.amenities || [],
          featured: property.featured ?? false,
          active: property.active ?? true,
          photos: property.photos || property.images || []
        }));

        console.log('Converted properties array:', propertiesArray);

        // Filter to show only active and featured properties
        let featured = propertiesArray.filter(p => p.active && p.featured);
        console.log('Filtered featured properties:', featured);

        // If no featured properties, show first 3 active properties
        if (featured.length === 0) {
          featured = propertiesArray.filter(p => p.active).slice(0, 3);
          console.log('No featured properties, using first 3 active:', featured);
        }

        setFeaturedProperties(featured);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
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

      {/* Properties Section */}
      <section id="properties" className="section bg-white">
        <div className="container-responsive">
          <div className="text-center mb-fluid-xl">
            <h2 className="section-title text-fluid-3xl">{settings?.featuredTitle || 'Featured Properties'}</h2>
            <p className="section-subtitle text-fluid-lg mx-auto">
              {settings?.featuredSubtitle || 'Handpicked condominiums offering the perfect balance of comfort, convenience, and style.'}
            </p>
            {loading && (
              <div className="text-sm text-gray-600 mt-2">
                Loading properties and settings...
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 mt-2">
                {error}
              </div>
            )}
            {!loading && !error && (
              <div className="text-sm text-gray-600 mt-2">
                Showing {featuredProperties.length} featured properties | Data source: Database
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid-responsive grid-responsive-md-2 grid-responsive-lg-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="card-image bg-gray-200"></div>
                  <div className="card-content">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 btn-primary"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid-responsive grid-responsive-md-2 grid-responsive-lg-3">
              {featuredProperties.map((property, index) => (
              <div
                key={property.id}
                className="card group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative card-image bg-gradient-to-br from-[#d4b896] to-[#b89b7a] overflow-hidden">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[property.featuredPhotoIndex || 0]}
                      alt={property.name}
                      className="card-image"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${property.photos && property.photos.length > 0 ? 'hidden' : ''}`}>
                    <div className="text-center text-white/80">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="font-display text-2xl font-bold">CC</span>
                      </div>
                      <p className="text-sm">Photo coming soon</p>
                    </div>
                  </div>
                  {property.featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#14b8a6] text-white text-xs font-medium rounded-full">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="card-content">
                  <h3 className="card-title group-hover:text-[#0d9488] transition-colors">
                    {property.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-[#9a7d5e] text-fluid-sm mb-fluid-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>

                  <p className="card-description">
                    {property.short_description}
                  </p>

                  <div className="flex flex-wrap mb-fluid-md">
                    {property.amenities.map((amenity: string, i: number) => (
                      <span
                        key={i}
                        className="amenity-tag"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 mb-fluid-sm">
                    ID: {property.id} | Featured: {property.featured ? 'Yes' : 'No'} | Active: {property.active ? 'Yes' : 'No'}
                  </div>
                  <Link
                    href={`/properties/${property.slug}`}
                    className="inline-flex items-center gap-1 text-[#0d9488] font-medium text-fluid-sm hover:gap-2 transition-all touch-target"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              ))}
            </div>
          )}

          <div className="text-center mt-fluid-xl">
            <Link href="/properties" className="btn-primary inline-flex items-center gap-2 touch-target">
              <span>View All Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section gradient-warm">
        <div className="container-responsive">
          <div className="text-center mb-fluid-xl">
            <h2 className="section-title text-fluid-3xl">Why Choose Cozy Condo?</h2>
            <p className="section-subtitle text-fluid-lg mx-auto">
              We go beyond just providing a place to stay. We create memorable experiences.
            </p>
          </div>

          <div className="grid-responsive grid-responsive-sm-2 grid-responsive-lg-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-fluid-lg rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-fluid-md rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="font-display text-fluid-lg font-semibold text-[#5f4a38] mb-fluid-sm">
                    {feature.title}
                  </h3>
                  <p className="text-[#7d6349] text-fluid-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-white">
        <div className="container-responsive">
          <div className="grid-responsive grid-responsive-md-2 items-center">
            {/* Image side */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl">
                {aboutImage ? (
                  <img
                    src={aboutImage}
                    alt="About Cozy Condo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`aspect-[4/3] bg-gradient-to-br from-[#0d9488] to-[#14b8a6] flex items-center justify-center ${aboutImage ? 'hidden' : ''}`}>
                  <div className="text-center text-white">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-fluid-md rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="font-display text-2xl sm:text-3xl font-bold">CC</span>
                    </div>
                    <p className="text-fluid-xl font-display font-semibold">Cozy Condo</p>
                    <p className="text-sm opacity-80">Iloilo City</p>
                  </div>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-16 h-16 sm:w-32 sm:h-32 bg-[#fb923c]/20 rounded-full blur-xl sm:blur-2xl" />
            </div>

            {/* Content side */}
            <div>
              <h2 className="section-title text-fluid-3xl">Welcome to Cozy Condo</h2>
              <p className="text-[#7d6349] text-fluid-lg mb-fluid-lg">
                Founded with a passion for hospitality, Cozy Condo has been providing exceptional short-term rental experiences in Iloilo City. Our carefully curated collection of condominiums combines modern comfort with warm Filipino hospitality.
              </p>
              <p className="text-[#7d6349] text-fluid-base mb-fluid-xl">
                Whether you&apos;re a business traveler, a vacationing family, or someone relocating to the city, we have the perfect space for you. Each of our 9+ properties is thoughtfully designed and maintained to ensure your stay is nothing short of cozy.
              </p>
              <div className="flex flex-col sm:flex-row gap-fluid-md">
                <Link href="/contact" className="btn-primary touch-target">
                  Get in Touch
                </Link>
                <Link href="/properties" className="btn-secondary touch-target">
                  Browse Properties
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
