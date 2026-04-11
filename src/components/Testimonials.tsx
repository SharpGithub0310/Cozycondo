import type { Testimonial } from '@/lib/types';

interface Props {
  testimonials: Testimonial[];
  title?: string;
  label?: string;
  variant?: 'dark' | 'light';
}

export default function Testimonials({ testimonials, title, label, variant = 'dark' }: Props) {
  if (!testimonials.length) return null;

  const dark = variant === 'dark';
  return (
    <section className={`section ${dark ? 'section-dark' : ''}`}>
      <div className="container-xl text-center">
        {label && <div className="label-tiny mb-4">— {label}</div>}
        {title && (
          <h2 className={`section-title mb-12 ${dark ? 'text-stone-50' : ''}`}>{title}</h2>
        )}
        <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <article key={t.id} className={dark ? 'px-2' : ''}>
              <div className="text-amber-400 mb-3 text-sm tracking-widest">
                {'★'.repeat(t.rating)}
              </div>
              <p className={`text-[14px] leading-relaxed mb-4 ${dark ? 'text-stone-200' : 'text-stone-700'}`}>
                &ldquo;{t.reviewText}&rdquo;
              </p>
              <div className="text-[11px] tracking-wide">
                <span className={`font-medium ${dark ? 'text-stone-50' : 'text-stone-900'}`}>
                  {t.guestName}
                </span>
                <span className={dark ? 'text-stone-400' : 'text-stone-500'}>
                  {t.stayMonth ? ` · ${t.stayMonth}` : ''} · via {t.source}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
