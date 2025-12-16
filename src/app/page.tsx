'use client';

import Hero from '@/components/Hero';
import { Building2, Shield, Clock, Heart, MapPin, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStoredSettings } from '@/utils/settingsStorage';
import { getStoredProperties, getDefaultPropertyData } from '@/utils/propertyStorage';

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

  useEffect(() => {
    // Load settings
    const settings = getStoredSettings();
    if (settings.aboutImage) {
      setAboutImage(settings.aboutImage);
    }

    // Load properties
    const storedProperties = getStoredProperties();
    const loadedProperties = propertyIds.map(id => {
      const stored = storedProperties[id];
      const defaultData = getDefaultPropertyData(id);

      if (stored) {
        return {
          id: stored.id,
          name: stored.name,
          slug: stored.name.toLowerCase().replace(/\s+/g, '-'),
          location: stored.location,
          short_description: stored.description,
          amenities: stored.amenities,
          featured: stored.featured,
          active: stored.active,
          photos: stored.photos || []
        };
      }

      return {
        id: defaultData.id,
        name: defaultData.name,
        slug: defaultData.name.toLowerCase().replace(/\s+/g, '-'),
        location: defaultData.location,
        short_description: defaultData.description,
        amenities: defaultData.amenities,
        featured: defaultData.featured,
        active: defaultData.active,
        photos: defaultData.photos || []
      };
    });

    // Filter to show only active and featured properties
    let featured = loadedProperties.filter(p => p.active && p.featured);

    // If no featured properties, show first 3 active properties
    if (featured.length === 0) {
      featured = loadedProperties.filter(p => p.active).slice(0, 3);
    }

    setFeaturedProperties(featured);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Properties Section */}
      <section id="properties" className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Featured Properties</h2>
            <p className="section-subtitle mx-auto">
              Handpicked condominiums offering the perfect balance of comfort, convenience, and style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property, index) => (
              <div
                key={property.id}
                className="card group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[#d4b896] to-[#b89b7a] overflow-hidden">
                  {property.photos && property.photos.length > 0 ? (
                    <img
                      src={property.photos[property.featuredPhotoIndex || 0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
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
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-2 group-hover:text-[#0d9488] transition-colors">
                    {property.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-[#9a7d5e] text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>

                  <p className="text-[#7d6349] text-sm mb-4">
                    {property.short_description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#faf3e6] text-[#7d6349] text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/properties/${property.slug}`}
                    className="inline-flex items-center gap-1 text-[#0d9488] font-medium text-sm hover:gap-2 transition-all"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/properties" className="btn-primary inline-flex items-center gap-2">
              <span>View All Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose Cozy Condo?</h2>
            <p className="section-subtitle mx-auto">
              We go beyond just providing a place to stay. We create memorable experiences.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center shadow-lg">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#7d6349] text-sm">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image side */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
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
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="font-display text-3xl font-bold">CC</span>
                    </div>
                    <p className="text-xl font-display font-semibold">Cozy Condo</p>
                    <p className="text-sm opacity-80">Iloilo City</p>
                  </div>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#fb923c]/20 rounded-full blur-2xl" />
            </div>

            {/* Content side */}
            <div>
              <h2 className="section-title">Welcome to Cozy Condo</h2>
              <p className="text-[#7d6349] text-lg mb-6">
                Founded with a passion for hospitality, Cozy Condo has been providing exceptional short-term rental experiences in Iloilo City. Our carefully curated collection of condominiums combines modern comfort with warm Filipino hospitality.
              </p>
              <p className="text-[#7d6349] mb-8">
                Whether you&apos;re a business traveler, a vacationing family, or someone relocating to the city, we have the perfect space for you. Each of our 9+ properties is thoughtfully designed and maintained to ensure your stay is nothing short of cozy.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary">
                  Get in Touch
                </Link>
                <Link href="/properties" className="btn-secondary">
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
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#14b8a6]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#fb923c]/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-6">
            Ready to Book Your Stay?
          </h2>
          <p className="text-[#d4b896] text-lg mb-8 max-w-2xl mx-auto">
            Contact us today and let us help you find the perfect condo for your needs. We&apos;re here to make your stay in Iloilo City unforgettable.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message Us on Facebook</span>
            </a>
            <a
              href="tel:+639778870724"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 transition-all duration-300"
            >
              <Phone className="w-5 h-5" />
              <span>Call +63 977 887 0724</span>
            </a>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-[#d4b896]">
            <a href="mailto:admin@cozycondo.net" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              <span>admin@cozycondo.net</span>
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Iloilo City, Philippines</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
