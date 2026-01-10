'use client';

import { useState } from 'react';
import { MessageCircle, X, Phone, Mail } from 'lucide-react';

export default function MessengerWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="messenger-widget">
      {/* Contact panel */}
      <div
        className={`absolute bottom-20 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-[#faf3e6] overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d9488] to-[#14b8a6] p-4 text-white">
          <h3 className="font-display text-lg font-semibold">Chat with us!</h3>
          <p className="text-sm text-white/80">We typically reply within minutes</p>
        </div>

        {/* Contact options */}
        <div className="p-4 space-y-3">
          <a
            href="https://m.me/cozycondoiloilocity"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-[#faf3e6] hover:bg-[#f5e6cc] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-medium text-[#5f4a38] group-hover:text-[#0d9488] transition-colors">
                Messenger
              </span>
              <span className="block text-xs text-[#9a7d5e]">Chat now</span>
            </div>
          </a>

          <a
            href="tel:+639778870724"
            className="flex items-center gap-3 p-3 rounded-xl bg-[#faf3e6] hover:bg-[#f5e6cc] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#14b8a6] flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-medium text-[#5f4a38] group-hover:text-[#0d9488] transition-colors">
                Call Us
              </span>
              <span className="block text-xs text-[#9a7d5e]">+63 977 887 0724</span>
            </div>
          </a>

          <a
            href="mailto:admin@cozycondo.net"
            className="flex items-center gap-3 p-3 rounded-xl bg-[#faf3e6] hover:bg-[#f5e6cc] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-[#fb923c] flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-medium text-[#5f4a38] group-hover:text-[#0d9488] transition-colors">
                Email
              </span>
              <span className="block text-xs text-[#9a7d5e]">admin@cozycondo.net</span>
            </div>
          </a>
        </div>
      </div>

      {/* Main button - animation only on initial render, stops on hover/interaction */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-[#5f4a38] rotate-0'
            : 'bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:shadow-xl'
        }`}
        aria-label={isOpen ? 'Close contact panel' : 'Open contact panel'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
