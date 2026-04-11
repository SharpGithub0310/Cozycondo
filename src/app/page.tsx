import Hero from '@/components/Hero';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { databaseService } from '@/lib/database-service';
import { normalizePropertyData } from '@/utils/slugify';
import Testimonials from '@/components/Testimonials';
import { getTestimonialsServer } from '@/lib/testimonials-server';
import type { Metadata } from 'next';
import type { PropertyData, WebsiteSettings, Testimonial } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cozy Condo — Short-term rentals in Iloilo City',
  description: 'A small collection of thoughtfully furnished condominium rentals in Iloilo City, Philippines.',
};

function coverPhotoUrl(p: any): string {
  if (p?.coverPhotoUrl) return p.coverPhotoUrl;
  if (p?.photos && p.photos.length) {
    const byId = p.coverPhotoId
      ? p.photos.find((ph: any) => ph.id === p.coverPhotoId)
      : null;
    if (byId?.url) return byId.url;
    const first = p.photos[0];
    return typeof first === 'string' ? first : (first?.url || '');
  }
  return '';
}

export default async function HomePage() {
  let settings: WebsiteSettings | null = null;
  let featured: PropertyData[] = [];
  let testimonials: Testimonial[] = [];

  try {
    const [loadedSettings, propertiesData] = await Promise.all([
      databaseService.getWebsiteSettings(),
      databaseService.getProperties({ active: true }),
    ]);
    settings = loadedSettings;

    const all = Object.values(propertiesData).map((p: any) => normalizePropertyData(p));
    featured = all.filter((p: any) => p.featured).slice(0, 5);
    if (featured.length === 0) featured = all.slice(0, 5);

    // Fetch general testimonials (property_id IS NULL)
    testimonials = await getTestimonialsServer({ propertyId: null, limit: 3 });
  } catch (err) {
    console.error('HomePage load error:', err);
  }

  const heroPhoto = settings?.heroPhotoUrl || (featured[0] ? coverPhotoUrl(featured[0]) : '');
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';
  const introTitle = settings?.introTitle ||
    'Cozy Condo is a small family-run collection of rentals across Iloilo City.';
  const introBody = settings?.introBody ||
    'We handpick every unit, furnish it ourselves, and respond to every guest message personally — because hospitality, to us, means being reachable.';

  return (
    <>
      <Hero settings={settings} heroPhotoUrl={heroPhoto} />

      {/* Intro */}
      <section className="section">
        <div className="container-xl max-w-3xl text-center">
          <div className="label-tiny mb-4">— OUR STORY IN ONE PARAGRAPH</div>
          <h2 className="section-title mb-5">{introTitle}</h2>
          <p className="section-subtitle">{introBody}</p>
        </div>
      </section>

      {/* Featured properties grid */}
      <section className="pb-24">
        <div className="container-xl">
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-[24px] font-medium tracking-tight">Featured properties</h3>
            <Link href="/properties" className="text-[12px] text-stone-700 border-b border-stone-700 pb-0.5">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-3 md:h-[540px]">
            {featured.map((p: any, i: number) => {
              const isBig = i === 0;
              return (
                <Link
                  key={p.id || p.slug}
                  href={`/properties/${p.slug}`}
                  className={`relative rounded-lg overflow-hidden group ${
                    isBig ? 'md:row-span-2 h-64 md:h-auto' : 'h-48 md:h-auto'
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03] bg-stone-200"
                    style={{ backgroundImage: `url('${coverPhotoUrl(p)}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className={`font-semibold ${isBig ? 'text-[22px]' : 'text-[16px]'}`}>
                      {p.title || p.name}
                    </div>
                    <div className="text-[11px] opacity-85 mt-0.5">
                      {p.location || ''}{p.pricePerNight ? ` · From ₱${Number(p.pricePerNight).toLocaleString()}/night` : ''}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials
        testimonials={testimonials}
        title="What our guests are saying"
        label="REAL GUESTS · REAL STAYS"
        variant="dark"
      />

      {/* CTA */}
      <section className="section text-center">
        <div className="container-xl max-w-2xl">
          <h3 className="text-[32px] md:text-[40px] font-medium tracking-tight leading-[1.1] mb-4">
            Planning a stay in Iloilo? Send us a message.
          </h3>
          <p className="text-[15px] text-stone-600 mb-8">
            We reply within the hour during the day. No booking engine, no forms — just a real person on Messenger.
          </p>
          <a href={messenger} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <MessageCircle className="w-4 h-4" /> Message us on Facebook <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </>
  );
}
