import { Metadata } from 'next';
import Link from 'next/link';
import { 
  MapPin, 
  ArrowLeft, 
  ExternalLink, 
  MessageCircle, 
  Phone,
  Wifi,
  Wind,
  Car,
  Tv,
  UtensilsCrossed,
  Building2,
  Shield,
  Dumbbell,
  Coffee,
  WashingMachine,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { notFound } from 'next/navigation';

// Amenity icons mapping
const amenityIcons: Record<string, React.ReactNode> = {
  'wifi': <Wifi className="w-5 h-5" />,
  'air-conditioning': <Wind className="w-5 h-5" />,
  'parking': <Car className="w-5 h-5" />,
  'smart tv': <Tv className="w-5 h-5" />,
  'kitchen': <UtensilsCrossed className="w-5 h-5" />,
  'city view': <Building2 className="w-5 h-5" />,
  '24/7 security': <Shield className="w-5 h-5" />,
  'gym access': <Dumbbell className="w-5 h-5" />,
  'workspace': <Coffee className="w-5 h-5" />,
  'washer': <WashingMachine className="w-5 h-5" />,
};

// Sample properties data (will be replaced with Supabase)
const properties = [
  {
    id: '1',
    name: 'Cityscape Studio',
    slug: 'cityscape-studio',
    location: 'Iloilo Business Park',
    address: 'Megaworld Boulevard, Iloilo Business Park, Mandurriao, Iloilo City',
    description: `Experience modern city living at its finest in this beautifully designed studio unit located in the heart of Iloilo Business Park.

This contemporary space features floor-to-ceiling windows offering panoramic views of the bustling cityscape below. The open-plan layout maximizes every square foot, creating a sense of spaciousness perfect for solo travelers or couples.

The fully equipped kitchenette includes a refrigerator, microwave, and electric cooktop, allowing you to prepare your own meals. The comfortable queen-size bed ensures restful nights, while the dedicated workspace is ideal for business travelers who need to stay connected.

Located within walking distance to restaurants, cafes, and the Festive Walk Mall, you'll have everything you need right at your doorstep.`,
    short_description: 'Modern studio with stunning city views. Perfect for business travelers and couples seeking a contemporary urban retreat.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'Smart TV', 'Workspace', 'City View', '24/7 Security', 'Gym Access'],
    featured: true,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=Iloilo+Business+Park',
  },
  {
    id: '2',
    name: 'Garden View Suite',
    slug: 'garden-view-suite',
    location: 'Smallville Complex',
    address: 'Smallville Complex, Diversion Road, Mandurriao, Iloilo City',
    description: `Escape to this serene garden-view suite nestled in the popular Smallville Complex. This spacious 1-bedroom unit offers the perfect blend of comfort and convenience.

Wake up to views of lush tropical gardens from your private balcony. The separate bedroom features a plush king-size bed, while the living area provides ample space for relaxation with a comfortable sofa and entertainment system.

The full kitchen is equipped with everything you need for extended stays, including a full-size refrigerator, stove, and all essential cookware. A dedicated dining area seats four comfortably.

Smallville offers an array of dining and entertainment options just steps from your door, while still providing a peaceful retreat from the city bustle.`,
    short_description: 'Spacious 1-bedroom suite overlooking lush gardens. Ideal for extended stays with full kitchen and living area.',
    amenities: ['WiFi', 'Air-conditioning', 'Parking', 'Kitchen', 'Balcony', 'Smart TV', 'Washer'],
    featured: true,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=Smallville+Complex+Iloilo',
  },
  {
    id: '3',
    name: 'Downtown Retreat',
    slug: 'downtown-retreat',
    location: 'City Proper',
    address: 'J.M. Basa Street, City Proper, Iloilo City',
    description: `Discover the charm of old Iloilo in this cozy downtown retreat. Located in the historic city center, this unit puts you within walking distance of Iloilo's most iconic landmarks and attractions.

This thoughtfully designed space combines modern amenities with classic Filipino hospitality. The unit features a comfortable bedroom area, a compact but fully functional kitchen, and a cozy living space perfect for unwinding after a day of exploration.

Step outside and you're immediately surrounded by Iloilo's rich heritage - colonial-era buildings, traditional markets, and authentic local eateries await. SM City Iloilo is just a short walk away for all your shopping needs.

Perfect for travelers who want to immerse themselves in the authentic Iloilo experience.`,
    short_description: 'Cozy unit in the heart of downtown. Walking distance to SM City Iloilo and local attractions.',
    amenities: ['WiFi', 'Air-conditioning', 'Smart TV', 'Kitchen', '24/7 Security'],
    featured: true,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=SM+City+Iloilo',
  },
  {
    id: '4',
    name: 'Sunset Bay Unit',
    slug: 'sunset-bay-unit',
    location: 'Jaro District',
    address: 'Jaro District, Iloilo City',
    description: `Experience breathtaking sunset views from this beautifully appointed unit in the peaceful Jaro district. This spacious accommodation offers the perfect blend of tranquility and convenience.

The unit features large windows that flood the space with natural light during the day and offer spectacular sunset vistas each evening. The open-plan living area is perfect for relaxation, while the well-equipped kitchen makes meal preparation a pleasure.

Located in the culturally rich Jaro district, you'll be steps away from the famous Jaro Cathedral and the historic Nelly Garden. Despite the peaceful setting, the city center is easily accessible via public transportation.

This unit is ideal for travelers seeking a more authentic Iloilo experience away from the bustling commercial areas while still enjoying modern comforts.`,
    short_description: 'Serene unit with stunning sunset views in historic Jaro district. Perfect for peaceful stays.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'Smart TV', 'Balcony', 'Parking'],
    featured: true,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=Jaro+Cathedral+Iloilo',
  },
  {
    id: '5',
    name: 'Executive Suite',
    slug: 'executive-suite',
    location: 'Ayala Mall Area',
    address: 'Near Ayala Malls Capitol Central, Iloilo City',
    description: `Indulge in luxury and convenience at this premium executive suite located near Ayala Malls Capitol Central. Designed with the discerning business traveler in mind, this suite offers unparalleled comfort and sophistication.

The suite features a separate living area and bedroom, providing ample space to work and relax. The elegant furnishings and modern amenities create an environment conducive to both productivity and comfort.

A dedicated workspace with high-speed internet ensures you can stay connected and productive, while the premium bedding guarantees restful nights. The fully equipped kitchen allows for convenient in-room dining.

Located within walking distance of Capitol Central, you'll have easy access to upscale dining, shopping, and entertainment options.`,
    short_description: 'Premium executive suite near Ayala Mall with separate living area. Ideal for business travelers.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'Smart TV', 'Workspace', 'Premium Bedding', '24/7 Security', 'Gym Access'],
    featured: true,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=Ayala+Malls+Capitol+Central+Iloilo',
  },
  {
    id: '6',
    name: 'Family Haven',
    slug: 'family-haven',
    location: 'Villa Beach',
    address: 'Villa Beach, Iloilo City',
    description: `Create lasting memories at this spacious family-friendly unit located in the charming Villa Beach area. Designed with families in mind, this accommodation provides comfort, safety, and convenience for guests of all ages.

The unit features multiple bedrooms, a large living area, and a fully equipped kitchen perfect for preparing family meals. Child-friendly amenities and safety features ensure peace of mind for parents traveling with little ones.

The Villa Beach location offers a quieter alternative to the city center while still providing easy access to Iloilo's attractions. The nearby beach area is perfect for morning walks or evening family outings.

With ample space for families to spread out and relax, this unit serves as the perfect base for exploring Iloilo together while having a comfortable home away from home.`,
    short_description: 'Spacious family-friendly unit in peaceful Villa Beach. Multiple bedrooms and family amenities.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'Smart TV', 'Family-friendly', 'Multiple Bedrooms', 'Beach Access'],
    featured: false,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=Villa+Beach+Iloilo',
  },
];

// Generate static params for all properties
export async function generateStaticParams() {
  return properties.map((property) => ({
    slug: property.slug,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = properties.find(p => p.slug === slug);
  
  if (!property) {
    return {
      title: 'Property Not Found',
    };
  }

  return {
    title: property.name,
    description: property.short_description,
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = properties.find(p => p.slug === slug);

  if (!property) {
    notFound();
  }

  return (
    <div className="pt-20">
      {/* Back navigation */}
      <div className="bg-[#faf3e6] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-[#7d6349] hover:text-[#0d9488] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Link>
        </div>
      </div>

      {/* Property Header */}
      <section className="bg-gradient-to-br from-[#fefdfb] to-[#fdf9f3] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {property.featured && (
                <span className="inline-block px-3 py-1 bg-[#14b8a6] text-white text-xs font-medium rounded-full mb-3">
                  Featured
                </span>
              )}
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#5f4a38] mb-2">
                {property.name}
              </h1>
              <div className="flex items-center gap-2 text-[#7d6349]">
                <MapPin className="w-5 h-5 text-[#14b8a6]" />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {property.airbnb_url && (
                <a
                  href={property.airbnb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Airbnb</span>
                </a>
              )}
              <a
                href="https://m.me/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Book Now</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Placeholder */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main photo */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#d4b896] to-[#b89b7a]">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white/80">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="font-display text-3xl font-bold">CC</span>
                  </div>
                  <p className="text-lg font-medium">Photos Coming Soon</p>
                  <p className="text-sm opacity-80">High-quality images will be added</p>
                </div>
              </div>
            </div>
            
            {/* Thumbnail grid */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-[#e8d4a8] to-[#d4b896]"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <span className="font-display text-lg font-bold text-white/60">CC</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-semibold text-[#5f4a38] mb-6">
                About This Property
              </h2>
              <div className="prose prose-lg text-[#7d6349] max-w-none">
                {property.description.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>

              {/* Amenities */}
              <div className="mt-12">
                <h2 className="font-display text-2xl font-semibold text-[#5f4a38] mb-6">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.amenities.map((amenity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl bg-[#faf3e6]"
                    >
                      <div className="text-[#14b8a6]">
                        {amenityIcons[amenity.toLowerCase()] || <Building2 className="w-5 h-5" />}
                      </div>
                      <span className="text-[#5f4a38] font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mt-12">
                <h2 className="font-display text-2xl font-semibold text-[#5f4a38] mb-6">
                  Location
                </h2>
                <div className="p-6 rounded-2xl bg-[#faf3e6]">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-[#5f4a38] font-medium">{property.location}</p>
                      <p className="text-[#7d6349] text-sm">{property.address}</p>
                    </div>
                  </div>
                  {property.map_url && (
                    <a
                      href={property.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#0d9488] font-medium text-sm hover:underline"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Booking Card */}
                <div className="p-6 rounded-2xl bg-white border border-[#faf3e6] shadow-lg">
                  <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-4">
                    Ready to Book?
                  </h3>
                  <p className="text-[#7d6349] text-sm mb-6">
                    Contact us to check availability and make your reservation.
                  </p>
                  
                  <div className="space-y-3">
                    {property.airbnb_url && (
                      <a
                        href={property.airbnb_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full btn-secondary justify-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Book on Airbnb
                      </a>
                    )}
                    <a
                      href="https://m.me/cozycondoiloilocity"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-primary justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Us
                    </a>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="p-6 rounded-2xl bg-[#faf3e6]">
                  <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
                    Questions?
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+639778870724"
                      className="flex items-center gap-3 text-[#7d6349] hover:text-[#0d9488] transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>+63 977 887 0724</span>
                    </a>
                    <a
                      href="mailto:admin@cozycondo.net"
                      className="flex items-center gap-3 text-[#7d6349] hover:text-[#0d9488] transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>admin@cozycondo.net</span>
                    </a>
                  </div>
                </div>

                {/* Availability Note */}
                <div className="p-6 rounded-2xl border border-[#14b8a6]/20 bg-[#f0fdfb]">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-[#0f766e] mb-1">Check Availability</h4>
                      <p className="text-sm text-[#115e59]">
                        Message us to get real-time availability and special rates for extended stays.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
