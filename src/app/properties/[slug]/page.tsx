import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PropertyDetail from '@/components/PropertyDetail';

// This component has been moved to @/components/PropertyDetail

// Sample properties data (will be replaced with Supabase)
const properties = [
  {
    id: '1',
    name: 'Artist Loft',
    slug: 'artist-loft',
    location: 'Arts District',
    address: 'Arts District, Iloilo City',
    description: `Step into creative inspiration at this unique artist loft in Iloilo's vibrant Arts District. This spacious, light-filled space combines industrial charm with artistic flair, making it perfect for creative professionals, artists, or anyone seeking a unique accommodation experience.

The loft features high ceilings, exposed brick walls, and large windows that flood the space with natural light. The open-plan design provides flexibility for both living and creative work, while maintaining a comfortable residential feel.

Located in the heart of the Arts District, you'll be surrounded by galleries, studios, and creative spaces. The area offers a bohemian atmosphere while still being close to the city center and main attractions.

This space is ideal for digital nomads, artists, photographers, or anyone who appreciates unique architecture and creative environments.`,
    short_description: 'Unique artist loft with high ceilings and natural light. Perfect for creative professionals and art lovers.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'Smart TV', 'High Ceilings', 'Natural Light', 'Workspace', 'Art Supplies'],
    featured: true,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=Arts+District+Iloilo',
  },
  {
    id: '2',
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
  {
    id: '7',
    name: 'Metro Central',
    slug: 'metro-central',
    location: 'City Proper',
    address: 'City Proper, Iloilo City',
    description: `Experience the heart of Iloilo City at Metro Central, a modern accommodation situated in the bustling City Proper district. This strategically located unit provides easy access to shopping centers, restaurants, government offices, and transportation hubs.

The contemporary design features clean lines and efficient use of space, creating a comfortable urban retreat. Large windows provide natural light while modern amenities ensure a convenient stay for business travelers and tourists alike.

Located within walking distance of major landmarks including the Iloilo Provincial Capitol, SM City Iloilo, and the historic Calle Real. The central location makes it easy to explore the city's attractions without the need for extensive transportation.

Perfect for guests who want to be in the center of all the action while enjoying modern comfort and convenience.`,
    short_description: 'Modern unit in the heart of City Proper. Walking distance to major attractions and business centers.',
    amenities: ['WiFi', 'Air-conditioning', 'Smart TV', 'Kitchen', '24/7 Security', 'Central Location'],
    featured: false,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=City+Proper+Iloilo',
  },
  {
    id: '8',
    name: 'Riverside Studio',
    slug: 'riverside-studio',
    location: 'Jaro District',
    address: 'Jaro District, Iloilo City',
    description: `Discover tranquility at Riverside Studio, a peaceful retreat nestled along the scenic Jaro River. This charming studio combines the serenity of waterfront living with easy access to the historic Jaro district's cultural attractions.

The studio features large windows overlooking the river, creating a calming atmosphere perfect for relaxation. The space is thoughtfully designed to maximize comfort while maintaining connection with the natural surroundings through the riverside location.

Jaro district offers rich cultural heritage with the famous Jaro Cathedral, historic mansions, and traditional Filipino architecture. Despite the peaceful setting, the city center is easily accessible via public transportation or private vehicle.

Ideal for travelers seeking a unique experience away from the typical urban accommodations while still being connected to Iloilo's attractions and amenities.`,
    short_description: 'Peaceful riverside studio in historic Jaro district. Perfect for those seeking tranquility with cultural access.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'River View', 'Peaceful Setting', 'Historic Area'],
    featured: false,
    active: true,
    airbnb_url: 'https://airbnb.com',
    map_url: 'https://maps.google.com/?q=Jaro+District+Iloilo',
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

  return <PropertyDetail slug={slug} defaultProperty={property} />;
}
