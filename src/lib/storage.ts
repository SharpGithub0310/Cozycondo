/**
 * Photo storage helpers.
 *
 * The admin forms upload images as base64 data-URIs (FileReader.readAsDataURL).
 * If those are written straight into property_photos.url they bloat every
 * /api/properties payload (see 2026-06 incident: 7.7MB list response). These
 * helpers upload any base64 photo to Supabase Storage on save and persist the
 * resulting public URL instead. Existing http(s) URLs pass through untouched.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'property-images';

/** Upload a single base64 data-URI to Storage and return its public URL. */
async function uploadDataUri(client: SupabaseClient, dataUri: string): Promise<string> {
  const match = dataUri.match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i);
  if (!match) return dataUri; // not a recognizable image data-URI; leave as-is

  const contentType = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext = (contentType.split('/')[1] || 'jpg').replace('+xml', '').replace('jpeg', 'jpg');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

  const { error } = await client.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType, cacheControl: '3600', upsert: false });

  if (error) throw error;

  return client.storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
}

/**
 * Convert any base64 photos in the list to hosted Storage URLs, preserving order.
 * Existing URLs pass through. If an upload fails, the original value is kept so a
 * single bad photo never blocks the whole property save (the failure is logged).
 */
export async function persistPhotoUrls(
  client: SupabaseClient,
  urls: unknown[],
): Promise<string[]> {
  const out: string[] = [];
  for (const url of urls) {
    if (typeof url !== 'string') continue;
    if (url.startsWith('data:image')) {
      try {
        out.push(await uploadDataUri(client, url));
      } catch (err) {
        console.error('persistPhotoUrls: upload failed, keeping original photo', err);
        out.push(url);
      }
    } else {
      out.push(url);
    }
  }
  return out;
}
