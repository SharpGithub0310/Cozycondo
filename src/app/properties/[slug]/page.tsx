import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PropertyDetail from '@/components/PropertyDetail';

// Import database service for server-side data fetching
import { enhancedDatabaseService } from '@/lib/enhanced-database-service';

// Generate static params for all properties
export async function generateStaticParams() {
  try {
    // Try to fetch properties from database
    const properties = await enhancedDatabaseService.getProperties();
    return Object.values(properties).map((property: any) => ({
      slug: property.slug || property.id,
    }));
  } catch (error) {
    console.error('Error generating static params for properties:', error);
    // Return empty array if database is not available during build
    return [];
  }
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Try to fetch property from database
    const property = await enhancedDatabaseService.getProperty(slug);

    if (property) {
      return {
        title: property.name || property.title || 'Cozy Condo Property',
        description: property.short_description || property.description || 'Premium short-term rental in Iloilo City',
      };
    }
  } catch (error) {
    console.error('Error generating metadata for property:', error);
  }

  return {
    title: 'Property Not Found',
    description: 'The requested property could not be found.',
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    // Try to fetch property from database
    const property = await enhancedDatabaseService.getProperty(slug);

    if (!property) {
      notFound();
    }

    return <PropertyDetail slug={slug} defaultProperty={property} />;
  } catch (error) {
    console.error('Error fetching property:', error);
    // If database is not available, show not found
    notFound();
  }
}
