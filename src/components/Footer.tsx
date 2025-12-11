import Link from 'next/link';
import { Facebook, Phone, Mail, MapPin, MessageCircle, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#5f4a38] text-[#fdf9f3]">
      {/* Wave decoration */}
      <div className="h-16 bg-[#fefdfb]">
        <svg
          viewBox="0 0 1440 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fill="#5f4a38"
            d="M0,40 C320,100 420,0 740,50 C1060,100 1200,20 1440,60 L1440,100 L0,100 Z"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">CC</span>
              </div>
              <div>
                <span className="font-display text-xl font-semibold">Cozy Condo</span>
                <span className="block text-xs text-[#d4b896]">Iloilo City</span>
              </div>
            </div>
            <p className="text-[#d4b896] text-sm leading-relaxed">
              Your home away from home in the heart of Iloilo City. Experience comfort and convenience in our premium short-term rental condominiums.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Properties', href: '/properties' },
                { name: 'Blog', href: '/blog' },
                { name: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#d4b896] hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:+639778870724"
                  className="flex items-center gap-3 text-[#d4b896] hover:text-white transition-colors duration-200"
                >
                  <Phone className="w-5 h-5 text-[#14b8a6]" />
                  <span>+63 977 887 0724</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:admin@cozycondo.net"
                  className="flex items-center gap-3 text-[#d4b896] hover:text-white transition-colors duration-200"
                >
                  <Mail className="w-5 h-5 text-[#14b8a6]" />
                  <span>admin@cozycondo.net</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-[#d4b896]">
                  <MapPin className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <span>Iloilo City, Philippines</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Social & CTA */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Connect With Us</h3>
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.facebook.com/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#7d6349] hover:bg-[#14b8a6] flex items-center justify-center transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://m.me/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#7d6349] hover:bg-[#14b8a6] flex items-center justify-center transition-colors duration-200"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-medium rounded-lg transition-colors duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message Us</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[#7d6349]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#b89b7a]">
              © {currentYear} Cozy Condo Iloilo City. All rights reserved.
            </p>
            <p className="text-sm text-[#b89b7a] flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-[#fb923c]" /> in Iloilo City
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
