import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PropertyDetail from '@/components/PropertyDetail';

// Import database service for server-side data fetching
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import { getProductionFallbackProperties } from '@/lib/production-fallback-service';

// Use dynamic routing instead of static generation to avoid 404 issues
// Generate static params for all properties
export async function generateStaticParams() {
  try {
    // Try to fetch properties from database with fallback
    const properties = await postMigrationDatabaseService.getProperties();
    const params = Object.values(properties).map((property: any) => ({
      slug: property.slug || property.id,
    }));
    console.log('Generated static params:', params.map(p => p.slug));
    return params;
  } catch (error) {
    console.error('Error generating static params for properties:', error);
    // Use fallback properties if database is not available during build
    try {
      const fallbackProperties = getProductionFallbackProperties();
      const params = Object.values(fallbackProperties).map((property: any) => ({
        slug: property.slug || property.id,
      }));
      console.log('Generated fallback static params:', params.map(p => p.slug));
      return params;
    } catch (fallbackError) {
      console.error('Error with fallback properties:', fallbackError);
      return [];
    }
  }
}

// Enable dynamic rendering for paths not in generateStaticParams
export const dynamicParams = true;

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Try to fetch property from database with fallback
    const property = await postMigrationDatabaseService.getProperty(slug);

    if (property) {
      return {
        title: property.name || (property as any).title || 'Cozy Condo Property',
        description: (property as any).short_description || property.description || 'Premium short-term rental in Iloilo City',
      };
    }
  } catch (error) {
    console.error('Error generating metadata for property:', error);
  }

  // Try fallback properties
  try {
    const fallbackProperties = getProductionFallbackProperties();
    const property = Object.values(fallbackProperties).find((p: any) =>
      (p.slug || p.id) === slug
    ) as any;

    if (property) {
      return {
        title: property.name || (property as any).title || 'Cozy Condo Property',
        description: (property as any).short_description || property.description || 'Premium short-term rental in Iloilo City',
      };
    }
  } catch (fallbackError) {
    console.error('Error with fallback metadata:', fallbackError);
  }

  return {
    title: 'Property Not Found',
    description: 'The requested property could not be found.',
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  console.log('PropertyPage: Looking for property with slug:', slug);

  try {
    // Try to fetch property from database with fallback
    const property = await postMigrationDatabaseService.getProperty(slug);

    if (property) {
      console.log('PropertyPage: Found property in database:', property.name || property.title);
      return <PropertyDetail slug={slug} defaultProperty={property} />;
    }
  } catch (error) {
    console.error('PropertyPage: Error fetching property from database:', error);
  }

  // Try fallback properties if database fails
  try {
    const fallbackProperties = getProductionFallbackProperties();
    console.log('PropertyPage: Available fallback property slugs:', Object.values(fallbackProperties).map((p: any) => p.slug || p.id));

    // Try different matching strategies
    let property = Object.values(fallbackProperties).find((p: any) =>
      (p.slug || p.id) === slug
    ) as any;

    // If not found by slug, try by name-to-slug conversion
    if (!property) {
      property = Object.values(fallbackProperties).find((p: any) => {
        const generatedSlug = p.name?.toLowerCase().replace(/\s+/g, '-') || p.id;
        return generatedSlug === slug;
      }) as any;
    }

    // If not found by name conversion, try by id
    if (!property) {
      property = Object.values(fallbackProperties).find((p: any) => p.id === slug) as any;
    }

    if (property) {
      console.log('PropertyPage: Found property in fallback:', property.name);
      return <PropertyDetail slug={slug} defaultProperty={property} />;
    }
  } catch (fallbackError) {
    console.error('PropertyPage: Error with fallback properties:', fallbackError);
  }

  console.log('PropertyPage: No property found for slug:', slug);
  // If no property found in database or fallback, show not found
  notFound();
}
