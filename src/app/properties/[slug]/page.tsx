import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PropertyDetail from '@/components/PropertyDetail';
import { databaseService } from '@/lib/database-service';
import { getTestimonialsServer } from '@/lib/testimonials-server';
import type { Testimonial } from '@/lib/types';

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
    const properties = await databaseService.getProperties();
    const allSlugs: string[] = [];

    Object.values(properties).forEach((property: any) => {
      const slugVariations = generateSlugVariations(property);
      allSlugs.push(...slugVariations);
    });

    return allSlugs.map(slug => ({ slug }));
  } catch (error) {
    console.error('Error generating static params for properties:', error);
    return [];
  }
}

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const property = await databaseService.getProperty(slug);

    if (property) {
      return {
        title: property.name || (property as any).title || 'Cozy Condo Property',
        description: (property as any).short_description || property.description || 'Premium short-term rental in Iloilo City',
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

  const findPropertyBySlug = (properties: any[], searchSlug: string) => {
    let property = properties.find((p: any) => (p.slug || p.id) === searchSlug);
    if (property) return property;

    property = properties.find((p: any) => {
      if (!p.name) return false;
      const generatedSlug = p.name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      return generatedSlug === searchSlug;
    });
    if (property) return property;

    property = properties.find((p: any) => {
      if (!p.title) return false;
      const generatedSlug = p.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      return generatedSlug === searchSlug;
    });
    if (property) return property;

    property = properties.find((p: any) => p.id === searchSlug);
    if (property) return property;

    return properties.find((p: any) =>
      (p.slug || p.id || '').toLowerCase() === searchSlug.toLowerCase()
    ) || null;
  };

  try {
    const allProperties = await databaseService.getProperties();
    const propertiesArray = Object.values(allProperties);
    const property = findPropertyBySlug(propertiesArray, slug);

    if (property) {
      const testimonials: Testimonial[] = await getTestimonialsServer({
        propertyId: property.id,
      });
      return <PropertyDetail property={property} testimonials={testimonials} />;
    }
  } catch (error) {
    console.error('PropertyPage: Error fetching property from database:', error);
  }

  notFound();
}
