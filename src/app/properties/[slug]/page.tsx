import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PropertyDetail from '@/components/PropertyDetail';

// Import database service for server-side data fetching
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import { getProductionFallbackProperties } from '@/lib/production-fallback-service';

// Generate static params for all properties with multiple slug variations
export async function generateStaticParams() {
  const generateSlugVariations = (property: any) => {
    const slugs = new Set<string>();

    // Add primary slug
    if (property.slug) slugs.add(property.slug);
    if (property.id) slugs.add(property.id);

    // Add name-based slugs
    if (property.name) {
      const nameSlug = property.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      if (nameSlug) slugs.add(nameSlug);
    }

    // Add title-based slugs (legacy)
    if (property.title) {
      const titleSlug = property.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      if (titleSlug) slugs.add(titleSlug);
    }

    return Array.from(slugs).filter(s => s && s.length > 0);
  };

  try {
    // Try to fetch properties from database
    const properties = await postMigrationDatabaseService.getProperties();
    const allSlugs: string[] = [];

    Object.values(properties).forEach((property: any) => {
      const slugVariations = generateSlugVariations(property);
      allSlugs.push(...slugVariations);
    });

    const params = allSlugs.map(slug => ({ slug }));
    console.log('Generated static params from database:', params.map(p => p.slug));
    return params;
  } catch (error) {
    console.error('Error generating static params for properties:', error);
    // Use fallback properties if database is not available during build
    try {
      const fallbackProperties = getProductionFallbackProperties();
      const allSlugs: string[] = [];

      Object.values(fallbackProperties).forEach((property: any) => {
        const slugVariations = generateSlugVariations(property);
        allSlugs.push(...slugVariations);
      });

      const params = allSlugs.map(slug => ({ slug }));
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

  // Helper function to match property by various slug strategies
  const findPropertyBySlug = (properties: any[], searchSlug: string) => {
    // Strategy 1: Direct slug match
    let property = properties.find((p: any) =>
      (p.slug || p.id) === searchSlug
    );

    if (property) {
      console.log('PropertyPage: Found by direct slug match');
      return property;
    }

    // Strategy 2: Name-to-slug conversion
    property = properties.find((p: any) => {
      if (!p.name) return false;
      const generatedSlug = p.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens
        .trim();
      return generatedSlug === searchSlug;
    });

    if (property) {
      console.log('PropertyPage: Found by name-to-slug conversion');
      return property;
    }

    // Strategy 3: Title-to-slug conversion (for legacy compatibility)
    property = properties.find((p: any) => {
      if (!p.title) return false;
      const generatedSlug = p.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      return generatedSlug === searchSlug;
    });

    if (property) {
      console.log('PropertyPage: Found by title-to-slug conversion');
      return property;
    }

    // Strategy 4: Direct ID match
    property = properties.find((p: any) => p.id === searchSlug);

    if (property) {
      console.log('PropertyPage: Found by direct ID match');
      return property;
    }

    // Strategy 5: Case-insensitive search
    property = properties.find((p: any) =>
      (p.slug || p.id || '').toLowerCase() === searchSlug.toLowerCase()
    );

    if (property) {
      console.log('PropertyPage: Found by case-insensitive match');
      return property;
    }

    return null;
  };

  try {
    // Try to fetch property from database with fallback
    const allProperties = await postMigrationDatabaseService.getProperties();
    const propertiesArray = Object.values(allProperties);

    const property = findPropertyBySlug(propertiesArray, slug);

    if (property) {
      console.log('PropertyPage: Found property in database:', property.name || (property as any).title);
      return <PropertyDetail slug={slug} defaultProperty={property} />;
    }
  } catch (error) {
    console.error('PropertyPage: Error fetching property from database:', error);
  }

  // Try fallback properties if database fails
  try {
    const fallbackProperties = getProductionFallbackProperties();
    const fallbackArray = Object.values(fallbackProperties);

    console.log('PropertyPage: Available fallback properties:', fallbackArray.map((p: any) => ({ id: p.id, name: p.name, slug: p.slug })));

    const property = findPropertyBySlug(fallbackArray, slug);

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
