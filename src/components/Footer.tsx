import Link from 'next/link';
import { Facebook, MessageCircle } from 'lucide-react';
import type { WebsiteSettings } from '@/lib/types';

interface FooterProps {
  settings?: WebsiteSettings | null;
}

export default function Footer(_props: FooterProps = {}) {
  const fb = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || 'https://www.facebook.com/cozycondoiloilocity';
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || 'https://m.me/cozycondoiloilocity';

  return (
    <footer className="section-dark">
      <div className="container-xl py-14">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-stone-50 font-semibold text-[17px]">Cozy Condo</div>

          <ul className="flex gap-6 text-[13px] text-stone-400">
            <li><Link href="/properties" className="hover:text-stone-100">Properties</Link></li>
            <li><Link href="/blog"       className="hover:text-stone-100">Stories</Link></li>
            <li><Link href="/contact"    className="hover:text-stone-100">Contact</Link></li>
            <li><Link href="/privacy"    className="hover:text-stone-100">Privacy</Link></li>
          </ul>

          <div className="md:ml-auto flex gap-3">
            <a href={fb} target="_blank" rel="noopener noreferrer"
               aria-label="Facebook page"
               className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-50 hover:bg-stone-800">
              <Facebook className="w-4 h-4" />
            </a>
            <a href={messenger} target="_blank" rel="noopener noreferrer"
               aria-label="Messenger"
               className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-50 hover:bg-stone-800">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-800 text-[11px] text-stone-500">
          © {new Date().getFullYear()} Cozy Condo · Iloilo City, Philippines
        </div>
      </div>
    </footer>
  );
}
