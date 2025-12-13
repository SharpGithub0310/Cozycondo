'use client';

import { MapPin, Phone, Mail, MessageCircle, Facebook, Clock, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStoredSettings } from '@/utils/settingsStorage';

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'Facebook Messenger',
    description: 'Fastest way to reach us',
    value: 'Message Us',
    href: 'https://m.me/cozycondoiloilocity',
    color: 'bg-[#1877F2]',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Call or text us',
    value: '+63 977 887 0724',
    href: 'tel:+639778870724',
    color: 'bg-[#14b8a6]',
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'For detailed inquiries',
    value: 'admin@cozycondo.net',
    href: 'mailto:admin@cozycondo.net',
    color: 'bg-[#fb923c]',
  },
  {
    icon: Facebook,
    title: 'Facebook Page',
    description: 'Follow us for updates',
    value: 'Cozy Condo Iloilo City',
    href: 'https://www.facebook.com/cozycondoiloilocity',
    color: 'bg-[#1877F2]',
  },
];

const faqs = [
  {
    question: 'How do I book a property?',
    answer: 'You can book through our Airbnb listings or contact us directly via Facebook Messenger for direct bookings. We\'ll help you find the perfect unit for your needs.',
  },
  {
    question: 'What is the check-in and check-out time?',
    answer: 'Standard check-in is at 2:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be arranged subject to availability.',
  },
  {
    question: 'Do you offer monthly rates?',
    answer: 'Yes! We offer special discounted rates for stays of one month or longer. Contact us for a customized quote.',
  },
  {
    question: 'Is parking available?',
    answer: 'Parking availability varies by property. Some units include parking while others have nearby parking options. Check the specific property details or ask us.',
  },
  {
    question: 'Are pets allowed?',
    answer: 'Pet policies vary by property and building rules. Please contact us to discuss your specific situation.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfers, GCash, Maya, and credit card payments through Airbnb. For direct bookings, we\'ll provide payment details.',
  },
];

export default function ContactPage() {
  const [contactImage, setContactImage] = useState('');

  useEffect(() => {
    const settings = getStoredSettings();
    if (settings.contactImage) {
      setContactImage(settings.contactImage);
    }
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background image or gradient */}
        {contactImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${contactImage})` }}
            />
            <div className="absolute inset-0 bg-[#5f4a38]/70" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#fefdfb] via-[#fdf9f3] to-[#f5e6cc]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#14b8a6]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#fb923c]/10 rounded-full blur-3xl" />
          </>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`font-display text-4xl md:text-5xl font-semibold mb-4 ${contactImage ? 'text-white' : 'text-[#5f4a38]'}`}>
            Get in Touch
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${contactImage ? 'text-white/90' : 'text-[#7d6349]'}`}>
            Have questions about our properties or need help with a booking? We&apos;re here to assist you every step of the way.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <a
                  key={index}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group p-6 rounded-2xl bg-white border border-[#faf3e6] hover:border-[#14b8a6]/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-1">
                    {method.title}
                  </h3>
                  <p className="text-sm text-[#9a7d5e] mb-2">{method.description}</p>
                  <p className="text-[#0d9488] font-medium group-hover:underline">
                    {method.value}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="section bg-[#faf3e6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Map placeholder */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d9488] to-[#14b8a6] shadow-xl">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <p className="text-xl font-display font-semibold">Iloilo City</p>
                  <p className="text-sm opacity-80">Philippines</p>
                  <a
                    href="https://maps.google.com/?q=Iloilo+City+Philippines"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                  >
                    <span>View on Google Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Info */}
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#5f4a38] mb-6">
                Our Location
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#14b8a6] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#5f4a38] mb-1">Address</h3>
                    <p className="text-[#7d6349]">
                      Various locations across Iloilo City, Philippines
                    </p>
                    <p className="text-sm text-[#9a7d5e] mt-1">
                      Properties in Iloilo Business Park, Smallville, and City Proper
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#fb923c] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#5f4a38] mb-1">Response Hours</h3>
                    <p className="text-[#7d6349]">We respond to inquiries daily</p>
                    <p className="text-sm text-[#9a7d5e] mt-1">
                      8:00 AM - 10:00 PM Philippine Time (GMT+8)
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/50">
                  <p className="text-sm text-[#7d6349]">
                    <strong className="text-[#5f4a38]">Pro tip:</strong> For the fastest response, message us on Facebook Messenger. We typically reply within minutes during business hours!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto">
              Find quick answers to common questions about booking and staying with us.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-[#faf3e6] hover:bg-[#f5e6cc] transition-colors"
              >
                <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-2">
                  {faq.question}
                </h3>
                <p className="text-[#7d6349]">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#7d6349] mb-4">
              Still have questions? We&apos;re happy to help!
            </p>
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat with Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-[#5f4a38] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-6">
            Ready to Experience Cozy Condo?
          </h2>
          <p className="text-[#d4b896] text-lg mb-8">
            Book your stay today and discover why guests love our properties.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-medium rounded-lg transition-colors"
            >
              <span>Browse Properties</span>
            </a>
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
