import Link from 'next/link';

interface Photo {
  id: string;
  url: string;
  alt_text?: string | null;
}

interface Props {
  property: any; // PropertyData / Property — use existing shape
}

function coverUrl(p: any): string {
  if (!p?.photos?.length) return '';
  const first = p.photos[0];
  // photos array may be either {id,url}[] or string[]
  if (typeof first === 'string') {
    return first;
  }
  if (p.coverPhotoId) {
    const found = p.photos.find((ph: Photo) => ph.id === p.coverPhotoId);
    if (found) return found.url;
  }
  return first.url || '';
}

function metaLine(p: any): string {
  const parts: string[] = [];
  if (p.location)   parts.push(String(p.location).toUpperCase());
  if (p.bedrooms)   parts.push(`${p.bedrooms}BR`);
  if (p.maxGuests)  parts.push(`${p.maxGuests} GUESTS`);
  return parts.join(' · ');
}

export default function PropertyCard({ property }: Props) {
  const url   = `/properties/${property.slug}`;
  const photo = coverUrl(property);
  const price = property.pricePerNight;

  return (
    <Link href={url} className="block group">
      <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-stone-100">
        {photo && (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url('${photo}')` }}
          />
        )}
      </div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[16px] font-medium">{property.title || property.name}</div>
        {price && (
          <div className="text-[13px] text-stone-600">From ₱{Number(price).toLocaleString()}</div>
        )}
      </div>
      <div className="text-[11px] tracking-wide text-stone-500">
        {metaLine(property)}
      </div>
    </Link>
  );
}
