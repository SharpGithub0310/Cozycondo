'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  alt_text?: string | null;
}

interface Props {
  photos: Photo[];
  open: boolean;
  onClose: () => void;
}

export default function PhotoLightbox({ photos, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-stone-950/95 overflow-y-auto">
      <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-stone-950/80 backdrop-blur z-10 border-b border-stone-800">
        <span className="text-stone-50 text-sm font-medium">{photos.length} photos</span>
        <button
          onClick={onClose}
          className="text-stone-50 flex items-center gap-2 text-sm hover:opacity-80"
        >
          <X className="w-5 h-5" /> Close
        </button>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {photos.map((p) => (
          <img
            key={p.id}
            src={p.url}
            alt={p.alt_text || ''}
            className="w-full rounded-lg"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
