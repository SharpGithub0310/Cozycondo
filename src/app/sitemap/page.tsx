import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home, Building2, Newspaper, Phone, Shield, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sitemap | Cozy Condo',
  description: 'Navigate through all pages and sections of Cozy Condo Iloilo City website.',
};

export default function SitemapPage() {
  const sections = [
    {
      title: 'Main Pages',
      icon: Home,
      links: [
        { name: 'Home', href: '/' },
        { name: 'Properties', href: '/properties' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Properties',
      icon: Building2,
      links: [
        { name: 'All Properties', href: '/properties' },
        { name: 'Featured Properties', href: '/properties#featured' },
      ],
    },
    {
      title: 'Resources',
      icon: Newspaper,
      links: [
        { name: 'Blog', href: '/blog' },
        { name: 'Travel Guides', href: '/blog?category=travel' },
        { name: 'Local Tips', href: '/blog?category=tips' },
      ],
    },
    {
      title: 'Legal',
      icon: Shield,
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ],
    },
    {
      title: 'Contact',
      icon: Phone,
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Facebook', href: 'https://facebook.com/cozycondoiloilocity', external: true },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-warm-50)] to-white">
      <section className="section">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className="section-title mb-4">Sitemap</h1>
              <p className="text-lg text-[var(--color-warm-600)]">
                Find your way around Cozy Condo website with our complete page directory.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div key={index} className="card card-flat p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-100)] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[var(--color-primary-600)]" />
                      </div>
                      <h2 className="text-xl font-semibold text-[var(--color-warm-900)]">
                        {section.title}
                      </h2>
                    </div>
                    <ul className="space-y-2 ml-13">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          {link.external ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[var(--color-warm-700)] hover:text-[var(--color-primary-600)] transition-colors group"
                            >
                              <ChevronRight className="w-4 h-4 text-[var(--color-warm-400)] group-hover:text-[var(--color-primary-500)]" />
                              <span>{link.name}</span>
                              <FileText className="w-3 h-3 opacity-50" />
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="flex items-center gap-2 text-[var(--color-warm-700)] hover:text-[var(--color-primary-600)] transition-colors group"
                            >
                              <ChevronRight className="w-4 h-4 text-[var(--color-warm-400)] group-hover:text-[var(--color-primary-500)]" />
                              <span>{link.name}</span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 bg-[var(--color-warm-100)] rounded-2xl">
              <h3 className="font-semibold text-[var(--color-warm-900)] mb-2">
                Can't find what you're looking for?
              </h3>
              <p className="text-[var(--color-warm-700)] mb-4">
                Contact us directly and we'll be happy to help you navigate our site or answer any questions.
              </p>
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}