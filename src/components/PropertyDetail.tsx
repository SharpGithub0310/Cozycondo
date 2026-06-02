'use client';

import { useState, useMemo } from 'react';
import { MessageCircle, Star } from 'lucide-react';
import PhotoLightbox from './PhotoLightbox';
import Testimonials from './Testimonials';
import MobileContactBar from './MobileContactBar';
import type { Testimonial } from '@/lib/types';

interface Props {
  property: any;
  testimonials?: Testimonial[];
}

type NormPhoto = { id: string; url: string; alt_text?: string | null };

function normalizePhotos(raw: any): NormPhoto[] {
  const arr = raw?.photos || [];
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.map((p: any, i: number) => {
    if (typeof p === 'string') return { id: `p${i}`, url: p, alt_text: null };
    return {
      id: p.id || `p${i}`,
      url: p.url || '',
      alt_text: p.alt_text ?? null,
    };
  }).filter((p: NormPhoto) => !!p.url);
}

export default function PropertyDetail({ property, testimonials = [] }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const photos = useMemo(() => normalizePhotos(property), [property]);
  const firstFive = photos.slice(0, 5);

  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || 'https://m.me/cozycondoiloilocity';
  const fbPage    = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || 'https://www.facebook.com/cozycondoiloilocity';
  const price     = property.pricePerNight;

  return (
    <main className="pt-24 pb-24">
      {/* Header */}
      <header className="container-xl mb-10">
        <div className="label-tiny mb-3">
          PROPERTIES <span className="text-stone-300 mx-1">/</span> {(property.title || property.name || '').toUpperCase()}
        </div>
        <h1 className="text-[36px] md:text-[46px] font-medium tracking-[-1.2px] leading-[1.05] mb-3">
          {property.title || property.name}
        </h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-stone-600">
          {property.location && <span>{property.location}</span>}
          {property.propertyType && <><span className="text-stone-300">·</span><span>{property.propertyType}</span></>}
        </div>
      </header>

      {/* Gallery grid */}
      <section className="container-xl mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-2.5 md:h-[520px]">
          {firstFive.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setLightboxOpen(true)}
              className={`relative rounded-lg overflow-hidden ${
                i === 0 ? 'md:row-span-2 h-64 md:h-auto' : 'h-32 md:h-auto'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center hover:opacity-90 transition-opacity bg-stone-200"
                style={{ backgroundImage: `url('${p.url}')` }}
              />
              {i === 4 && photos.length > 5 && (
                <span className="absolute bottom-3 right-3 bg-white/90 text-stone-900 text-[11px] font-medium px-3 py-1.5 rounded-full">
                  View all {photos.length} photos →
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Body: 2 columns */}
      <section className="container-xl grid md:grid-cols-[1.6fr_1fr] gap-16">
        {/* Left column */}
        <div>
          {/* Specs */}
          <div className="grid grid-cols-4 gap-5 py-6 border-y border-stone-200 mb-10">
            <div><div className="text-[22px] font-medium">{property.maxGuests || '—'}</div><div className="text-[11px] text-stone-500 tracking-wider uppercase">Guests</div></div>
            <div><div className="text-[22px] font-medium">{property.bedrooms || '—'}</div><div className="text-[11px] text-stone-500 tracking-wider uppercase">Bedroom{property.bedrooms === 1 ? '' : 's'}</div></div>
            <div><div className="text-[22px] font-medium">{property.bathrooms || '—'}</div><div className="text-[11px] text-stone-500 tracking-wider uppercase">Bathroom{property.bathrooms === 1 ? '' : 's'}</div></div>
            <div><div className="text-[22px] font-medium">{property.size || '—'}</div><div className="text-[11px] text-stone-500 tracking-wider uppercase">Sqm</div></div>
          </div>

          {/* About */}
          <section className="mb-12">
            <h3 className="text-[22px] font-medium mb-3">About this unit</h3>
            <p className="text-[15px] leading-[1.75] text-stone-700 whitespace-pre-line">
              {property.description || ''}
            </p>
          </section>

          {/* Amenities */}
          {Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <section className="mb-12 pt-10 border-t border-stone-200">
              <h3 className="text-[22px] font-medium mb-4">What&apos;s included</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-7 text-[14px] text-stone-700">
                {property.amenities.map((a: string) => (
                  <div key={a} className="flex items-start gap-2">
                    <span className="text-stone-400">·</span> {a}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column: sticky contact card */}
        <aside>
          <div className="sticky top-28 bg-white border border-stone-200 rounded-xl p-7">
            {price && (
              <>
                <div className="text-[11px] text-stone-500 uppercase tracking-wider">From</div>
                <div>
                  <span className="text-[30px] font-medium tracking-tight">
                    ₱{Number(price).toLocaleString()}
                  </span>
                  <span className="text-[13px] text-stone-500"> / night</span>
                </div>
              </>
            )}
            <div className="text-[12px] text-stone-500 mt-1">
              <Star className="inline w-3.5 h-3.5 text-amber-400 mr-0.5" /> Ask us about current availability
            </div>

            <hr className="border-stone-200 my-5" />

            <h4 className="text-[14px] font-medium mb-2">Interested in this unit?</h4>
            <p className="text-[12px] text-stone-600 leading-[1.6] mb-5">
              Send us a message on Facebook and we&apos;ll get back to you within the hour during the day. No forms, no booking fees — just a quick chat.
            </p>

            <a href={messenger} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 bg-[#1877f2] text-white rounded-lg py-3.5 text-[14px] font-medium mb-2.5">
              <MessageCircle className="w-4 h-4" /> Message us on Facebook
            </a>
            <a href={fbPage} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center bg-white text-stone-900 border border-stone-300 rounded-lg py-3.5 text-[14px] font-medium">
              Visit our Facebook Page
            </a>
            <div className="text-[11px] text-stone-500 text-center mt-4 tracking-wide">
              — Typically replies within 1 hour —
            </div>
          </div>
        </aside>
      </section>

      {/* Per-unit testimonials */}
      {testimonials.length > 0 && (
        <div className="mt-24">
          <Testimonials
            testimonials={testimonials}
            label={`STAYS AT ${(property.title || property.name || '').toUpperCase()}`}
            title="What guests said about this unit"
            variant="dark"
          />
        </div>
      )}

      <PhotoLightbox photos={photos} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
      <MobileContactBar />
    </main>
  );
}
