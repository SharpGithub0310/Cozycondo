'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { WebsiteSettings } from '@/lib/types';

const NAV_ITEMS = [
  { href: '/',           label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/blog',       label: 'Stories' },
  { href: '/contact',    label: 'Contact' },
];

interface NavbarProps {
  settings?: WebsiteSettings | null;
}

export default function Navbar(_props: NavbarProps = {}) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const messengerUrl = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = pathname === '/';
  const transparentOnHome = isHome && !scrolled;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        transparentOnHome
          ? 'bg-transparent text-white'
          : 'bg-white/95 backdrop-blur border-b border-stone-200 text-stone-900'
      }`}
    >
      <div className="container-xl flex items-center h-16">
        <Link href="/" className="font-semibold text-[17px] tracking-tight">
          Cozy Condo
        </Link>

        <ul className="hidden md:flex gap-8 mx-auto text-[13px]">
          {NAV_ITEMS.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className={`transition-opacity hover:opacity-70 ${
                  pathname === n.href ? 'font-medium' : 'opacity-80'
                }`}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium transition ${
            transparentOnHome
              ? 'bg-white text-stone-900'
              : 'bg-stone-900 text-stone-50'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Message us on Facebook
        </a>

        <button
          className="md:hidden ml-auto"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-stone-200 text-stone-900">
          <ul className="flex flex-col px-6 py-4 gap-4 text-[14px]">
            {NAV_ITEMS.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>
              </li>
            ))}
            <li>
              <a href={messengerUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 bg-stone-900 text-stone-50 px-4 py-2 rounded-full text-[12px] font-medium">
                <MessageCircle className="w-3.5 h-3.5" /> Message us on Facebook
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
