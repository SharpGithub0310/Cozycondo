import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';
import type { WebsiteSettings } from '@/lib/types';

interface Props {
  settings: WebsiteSettings | null;
  heroPhotoUrl?: string;
}

export default function Hero({ settings, heroPhotoUrl = '' }: Props) {
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || 'https://m.me/cozycondoiloilocity';
  const title = settings?.heroTitle || 'Stay well in the heart of Iloilo.';
  const description = settings?.heroDescription ||
    'Thoughtfully furnished condominiums for travelers who want more than a hotel room. Each unit is lived-in, cared for, and ready for your stay.';

  return (
    <section className="relative h-[620px] md:h-[720px] overflow-hidden">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-stone-200"
        style={heroPhotoUrl ? { backgroundImage: `url('${heroPhotoUrl}')` } : undefined}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/70" />

      {/* Text */}
      <div className="relative h-full container-xl flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-xl text-white">
          <div className="label-tiny text-white/85 mb-4">— ILOILO CITY · PHILIPPINES</div>
          <h1 className="text-[40px] md:text-[56px] font-medium leading-[1.05] tracking-[-1.2px] mb-4">
            {title}
          </h1>
          <p className="text-[15px] leading-[1.6] max-w-md opacity-90 mb-8">
            {description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/properties" className="btn btn-on-dark">
              View properties <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={messenger} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-on-dark">
              <MessageCircle className="w-4 h-4" /> Message us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
