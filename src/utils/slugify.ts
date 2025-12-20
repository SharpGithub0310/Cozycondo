/**
 * Utility functions for consistent slug generation
 */

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and spaces
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

export function generatePropertySlug(property: any): string {
  // Priority order: existing slug > name > id
  if (property.slug) {
    return property.slug;
  }

  if (property.name) {
    return createSlug(property.name);
  }

  if (property.title) {
    return createSlug(property.title);
  }

  // Fallback to ID if no name/title
  return property.id || 'property-' + Date.now();
}

export function normalizePropertyData(property: any) {
  return {
    ...property,
    slug: generatePropertySlug(property),
    name: property.name || property.title || 'Unnamed Property',
    description: property.description || property.short_description || '',
    short_description: property.short_description || property.description || '',
    photos: property.photos || property.images || [],
    amenities: property.amenities || [],
    featured: property.featured ?? false,
    active: property.active ?? true,
  };
}