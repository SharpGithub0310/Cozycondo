'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, MessageCircle, Facebook, Clock, Send, ArrowRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'Facebook Messenger',
    description: 'Fastest way to reach us',
    value: 'Message Us',
    href: 'https://m.me/cozycondoiloilocity',
    color: 'bg-gradient-to-br from-[#1877F2] to-[#0866FF]',
    hoverColor: 'group-hover:from-[#0866FF] group-hover:to-[#1877F2]',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Call or text us',
    value: '+63 977 887 0724',
    href: 'tel:+639778870724',
    color: 'bg-gradient-to-br from-[#14b8a6] to-[#0d9488]',
    hoverColor: 'group-hover:from-[#0d9488] group-hover:to-[#14b8a6]',
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'For detailed inquiries',
    value: 'admin@cozycondo.net',
    href: 'mailto:admin@cozycondo.net',
    color: 'bg-gradient-to-br from-[#fb923c] to-[#ea580c]',
    hoverColor: 'group-hover:from-[#ea580c] group-hover:to-[#fb923c]',
  },
  {
    icon: Facebook,
    title: 'Facebook Page',
    description: 'Follow us for updates',
    value: 'Cozy Condo Iloilo City',
    href: 'https://www.facebook.com/cozycondoiloilocity',
    color: 'bg-gradient-to-br from-[#1877F2] to-[#0866FF]',
    hoverColor: 'group-hover:from-[#0866FF] group-hover:to-[#1877F2]',
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
  const [settings, setSettings] = useState<any>(null);
  const [dynamicFaqs, setDynamicFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load settings from database
      const dbSettings = await postMigrationDatabaseService.getWebsiteSettings();
      setSettings(dbSettings);

      if (dbSettings.contactImage) {
        setContactImage(dbSettings.contactImage);
      }

      // Load FAQs from database if available
      if (dbSettings.faqs) {
        setDynamicFaqs(dbSettings.faqs);
      }
    } catch (error) {
      console.error('Contact: Error loading settings:', error);
      // Fallback to using default faqs
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="pt-20">
      {/* Enhanced Hero Section */}
      <section className="hero relative overflow-hidden">
        {/* Enhanced Background */}
        {contactImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
              style={{ backgroundImage: `url(${contactImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm-900)]/70 via-[var(--color-warm-800)]/50 to-[var(--color-warm-950)]/85" />
            {/* Animated pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.08] animate-float"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                backgroundSize: '40px 40px',
                animationDuration: '8s'
              }}
            />
            {/* Subtle noise texture */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay'
              }}
            />
          </>
        ) : (
          <>
            {/* Premium gradient background with enhanced depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm-25)] via-[var(--color-warm-50)] to-[var(--color-warm-100)]" />

            {/* Refined mesh gradient overlay */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: `
                  radial-gradient(ellipse 180% 120% at 50% -10%, var(--color-primary-100) 0%, transparent 60%),
                  radial-gradient(ellipse 150% 80% at 85% 100%, var(--color-accent-orange-light) 0%, transparent 50%),
                  radial-gradient(ellipse 120% 100% at 15% 90%, var(--color-primary-200) 0%, transparent 45%),
                  radial-gradient(ellipse 200% 150% at 70% 20%, var(--color-warm-200) 0%, transparent 50%)
                `
              }}
            />

            {/* Enhanced decorative elements with staggered animations */}
            <div className="hidden lg:block absolute top-16 right-12 w-80 h-80 bg-gradient-to-br from-[var(--color-primary-300)]/25 to-[var(--color-primary-500)]/15 rounded-full blur-3xl animate-float opacity-70" />
            <div className="hidden lg:block absolute bottom-28 left-20 w-96 h-96 bg-gradient-to-tr from-[var(--color-accent-orange)]/20 to-[var(--color-warm-400)]/15 rounded-full blur-3xl animate-float opacity-80" style={{ animationDelay: '1.5s', animationDuration: '7s' }} />
            <div className="hidden xl:block absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-bl from-[var(--color-primary-400)]/10 to-transparent rounded-full blur-2xl animate-float" style={{ animationDelay: '3s', animationDuration: '9s' }} />
          </>
        )}

        <div className="relative container-xl hero-content text-center z-10">
          <div className="hero-badge mb-8 transform hover:scale-105 transition-transform duration-300">
            <div className="hero-badge-dot" />
            <span className="font-medium tracking-wide">24/7 Customer Support Available</span>
          </div>

          <h1 className={`hero-title mb-6 transform transition-all duration-700 ${contactImage ? 'text-white drop-shadow-xl' : 'text-[var(--color-warm-900)]'} animate-fade-in`} style={{ animationDelay: '0.2s' }}>
            Get in Touch
          </h1>
          <p className={`hero-subtitle mx-auto transform transition-all duration-700 ${contactImage ? 'text-white/90 drop-shadow-lg' : 'text-[var(--color-warm-700)]'} animate-slide-up max-w-3xl leading-relaxed`} style={{ animationDelay: '0.4s' }}>
            Have questions about our properties or need help with a booking? We're here to assist you every step of the way with personalized service and local expertise.
          </p>

          {/* Enhanced quick action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg hover:scale-105 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">Message Us Now</span>
            </a>
            <a
              href="tel:+639778870724"
              className="btn btn-secondary btn-lg hover:scale-105 hover:shadow-lg transition-all duration-300 group"
            >
              <Phone className="w-5 h-5 group-hover:animate-pulse" />
              <span className="font-semibold">Call Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Methods */}
      <section className="section bg-gradient-to-b from-white via-[var(--color-warm-25)] to-[var(--color-warm-50)] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, var(--color-primary-500) 1px, transparent 1px), radial-gradient(circle at 80% 80%, var(--color-accent-orange) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="container-xl relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-50)] to-[var(--color-primary-100)] text-[var(--color-primary-800)] text-sm font-semibold rounded-full mb-8 shadow-sm border border-[var(--color-primary-200)] hover:shadow-md transition-shadow duration-300">
              <div className="w-2 h-2 bg-[var(--color-primary-500)] rounded-full animate-pulse" />
              <span className="tracking-wide">Multiple Contact Options Available</span>
            </div>
            <h2 className="section-title mb-6 max-w-4xl mx-auto">Choose Your Preferred Way to Connect</h2>
            <p className="section-subtitle mx-auto max-w-3xl text-lg leading-relaxed">
              We offer multiple convenient ways to get in touch. Pick the one that works best for you, and we'll respond quickly with personalized assistance and local expertise.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-20">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <a
                  key={index}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="card group hover:card-elevated text-center p-8 transition-all duration-500 hover:scale-[1.08] hover:-rotate-1 relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-200)] focus:ring-offset-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Enhanced background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] via-[var(--color-primary-25)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl ${method.color} ${method.hoverColor} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative overflow-hidden`}>
                      {/* Icon shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <Icon className="w-12 h-12 text-white drop-shadow-md relative z-10" />
                    </div>
                    <h3 className="card-title text-center mb-3 group-hover:text-[var(--color-primary-600)] transition-all duration-300">
                      {method.title}
                    </h3>
                    <p className="card-meta text-center mb-4 text-sm font-medium text-[var(--color-warm-600)]">{method.description}</p>
                    <p className="text-[var(--color-primary-600)] font-semibold group-hover:underline transition-all duration-300 text-base">
                      {method.value}
                    </p>

                    {/* Enhanced response time indicators with improved styling */}
                    {method.title === 'Facebook Messenger' && (
                      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-50 via-green-100 to-green-50 text-green-800 text-xs font-semibold rounded-full border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="tracking-wide">Usually responds instantly</span>
                      </div>
                    )}
                    {method.title === 'Phone' && (
                      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 text-blue-800 text-xs font-semibold rounded-full border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="tracking-wide">Available 8AM - 10PM</span>
                      </div>
                    )}
                    {method.title === 'Email' && (
                      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 text-orange-800 text-xs font-semibold rounded-full border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="tracking-wide">Detailed responses</span>
                      </div>
                    )}
                    {method.title === 'Facebook Page' && (
                      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 text-blue-800 text-xs font-semibold rounded-full border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="tracking-wide">Stay updated</span>
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>

          {/* Enhanced Contact Tips Section */}
          <div className="bg-gradient-to-br from-[var(--color-primary-50)] via-[var(--color-primary-75)] to-[var(--color-primary-100)] rounded-3xl p-10 border border-[var(--color-primary-200)] shadow-lg hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
            {/* Subtle animated background pattern */}
            <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-500" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, var(--color-primary-500) 1px, transparent 1px), radial-gradient(circle at 75% 75%, var(--color-primary-600) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }} />

            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold text-[var(--color-primary-800)] mb-6">Quick Contact Tips</h3>
              <div className="grid md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto">
                <div className="space-y-6">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-primary-200)] hover:bg-white/70 transition-colors duration-300">
                    <p className="text-[var(--color-primary-700)] text-sm leading-relaxed">
                      <strong className="text-[var(--color-primary-800)] font-semibold">For Immediate Help:</strong> Use Facebook Messenger for the fastest response - we typically reply within minutes during business hours.
                    </p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-primary-200)] hover:bg-white/70 transition-colors duration-300">
                    <p className="text-[var(--color-primary-700)] text-sm leading-relaxed">
                      <strong className="text-[var(--color-primary-800)] font-semibold">For Booking Questions:</strong> Call us directly at +63 977 887 0724 to speak with our team and get immediate assistance.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-primary-200)] hover:bg-white/70 transition-colors duration-300">
                    <p className="text-[var(--color-primary-700)] text-sm leading-relaxed">
                      <strong className="text-[var(--color-primary-800)] font-semibold">For Detailed Inquiries:</strong> Send us an email with your questions and we'll provide comprehensive answers within a few hours.
                    </p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[var(--color-primary-200)] hover:bg-white/70 transition-colors duration-300">
                    <p className="text-[var(--color-primary-700)] text-sm leading-relaxed">
                      <strong className="text-[var(--color-primary-800)] font-semibold">Stay Connected:</strong> Follow our Facebook page for the latest updates, special offers, and local Iloilo recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Location & Hours */}
      <section className="section bg-gradient-to-br from-[var(--color-warm-75)] via-[var(--color-warm-50)] to-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[var(--color-primary-100)]/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[var(--color-accent-orange)]/20 to-transparent rounded-full blur-2xl" />

        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Enhanced Interactive Map Card */}
            <div className="relative group">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--color-primary-500)] via-[var(--color-primary-600)] to-[var(--color-primary-700)] shadow-2xl ring-1 ring-white/30 group-hover:shadow-3xl transition-all duration-500">
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* Enhanced animated background pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.15] group-hover:opacity-20 transition-opacity duration-500"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                      backgroundSize: '30px 30px',
                      animation: 'float 8s ease-in-out infinite'
                    }}
                  />

                  {/* Subtle noise texture overlay */}
                  <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.35'/%3E%3C/svg%3E")`
                  }} />

                  <div className="text-center text-white relative z-10 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <MapPin className="w-12 h-12 drop-shadow-lg" />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-3 drop-shadow-lg">Iloilo City</h3>
                    <p className="text-white/90 mb-8 text-lg font-medium drop-shadow-md">Philippines</p>
                    <a
                      href="https://maps.google.com/?q=Iloilo+City+Philippines"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <span className="font-semibold">View on Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Enhanced floating info card */}
              <div className="absolute -bottom-6 -right-6 lg:-bottom-10 lg:-right-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/40 hover:shadow-3xl hover:scale-105 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-warm-900)] text-lg">Quick Response</div>
                    <div className="text-sm text-[var(--color-warm-600)] font-medium">Usually within minutes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Info Section */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h2 className="section-title mb-6">Our Service Area</h2>
                <p className="text-lg text-[var(--color-warm-600)] leading-relaxed mb-8">
                  Strategically located across Iloilo City's most vibrant and convenient neighborhoods, offering you the perfect base for your stay.
                </p>
              </div>

              <div className="space-y-6">
                <div className="card card-flat p-8 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title mb-3">Prime Locations</h3>
                      <p className="card-description mb-4 text-base leading-relaxed">
                        Multiple premium properties across Iloilo City's best neighborhoods, each carefully selected for accessibility and convenience.
                      </p>
                      <ul className="text-[var(--color-warm-600)] space-y-2 font-medium">
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--color-primary-500)] rounded-full"></span> Iloilo Business Park</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--color-primary-500)] rounded-full"></span> Smallville Complex</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--color-primary-500)] rounded-full"></span> City Proper</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--color-primary-500)] rounded-full"></span> Mandurriao District</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card card-flat p-8 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-orange-dark)] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title mb-3">Response Hours</h3>
                      <p className="card-description mb-4 text-base leading-relaxed">
                        We're available to assist you daily with consistently quick response times across all communication channels.
                      </p>
                      <div className="bg-gradient-to-r from-[var(--color-accent-orange)]/10 to-[var(--color-accent-orange)]/5 rounded-xl p-4 border border-[var(--color-accent-orange)]/20">
                        <div className="text-lg font-bold text-[var(--color-warm-900)]">8:00 AM - 10:00 PM</div>
                        <div className="text-sm text-[var(--color-warm-600)] font-medium">Philippine Time (GMT+8)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-75)] border-[var(--color-primary-200)] p-8 shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-300" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 20%, var(--color-primary-500) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }} />
                  <div className="flex items-start gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold text-[var(--color-primary-800)] mb-3">Pro Tip</h3>
                      <p className="text-[var(--color-primary-700)] text-base leading-relaxed">
                        For the fastest response, message us on Facebook Messenger. We typically reply within minutes during business hours and can provide instant assistance!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="section bg-white relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-[var(--color-primary-100)]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[var(--color-warm-100)]/30 to-transparent rounded-full blur-2xl" />

        <div className="container-md relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[var(--color-warm-100)] to-[var(--color-warm-50)] text-[var(--color-warm-800)] text-sm font-semibold rounded-full mb-8 shadow-sm border border-[var(--color-warm-200)] hover:shadow-md transition-shadow duration-300">
              <span className="tracking-wide">Frequently Asked Questions</span>
            </div>
            <h2 className="section-title mb-6">Everything You Need to Know</h2>
            <p className="section-subtitle mx-auto max-w-3xl text-lg leading-relaxed">
              Find quick answers to common questions about booking and staying with us. Can't find what you're looking for? Just ask us directly!
            </p>
          </div>

          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card p-8 animate-pulse">
                  <div className="h-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg mb-6 animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {(dynamicFaqs.length > 0 ? dynamicFaqs : faqs).map((faq, index) => (
                <div
                  key={index}
                  className="card p-10 hover:card-elevated transition-all duration-500 group relative overflow-hidden focus-within:ring-4 focus-within:ring-[var(--color-primary-200)] focus-within:ring-offset-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-25)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <h3 className="card-title text-[var(--color-primary-600)] mb-5 group-hover:text-[var(--color-primary-700)] transition-colors duration-300">
                      {faq.question}
                    </h3>
                    <p className="text-[var(--color-warm-800)] leading-relaxed text-base font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-20 text-center">
            <div className="card bg-gradient-to-br from-[var(--color-primary-50)] via-[var(--color-primary-75)] to-[var(--color-primary-100)] border-[var(--color-primary-200)] p-12 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-500" style={{
                backgroundImage: 'radial-gradient(circle at 30% 30%, var(--color-primary-500) 1px, transparent 1px), radial-gradient(circle at 70% 70%, var(--color-primary-600) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />

              <div className="relative z-10">
                <h3 className="section-title text-[var(--color-primary-800)] mb-6 font-display">
                  Still Have Questions?
                </h3>
                <p className="text-[var(--color-primary-700)] text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                  We're happy to help! Our friendly team is standing by to answer any questions and help you find the perfect accommodation for your stay in Iloilo.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <a
                    href="https://m.me/cozycondoiloilocity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg hover:scale-105 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-semibold">Chat with Us</span>
                  </a>
                  <a
                    href="tel:+639778870724"
                    className="btn btn-outline btn-lg border-[var(--color-primary-600)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-600)] hover:text-white hover:scale-105 transition-all duration-300 group"
                  >
                    <Phone className="w-5 h-5 group-hover:animate-pulse" />
                    <span className="font-semibold">Call Now</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA Section */}
      <section className="section bg-gradient-to-br from-[var(--color-warm-900)] via-[var(--color-warm-800)] to-[var(--color-warm-950)] text-white relative overflow-hidden">
        {/* Enhanced background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primary-400)]/15 to-[var(--color-primary-600)]/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[var(--color-accent-orange)]/15 to-[var(--color-accent-orange-light)]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-bl from-[var(--color-primary-500)]/10 to-transparent rounded-full blur-2xl animate-float" style={{ animationDelay: '4s', animationDuration: '10s' }} />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`
        }} />

        <div className="relative container-xl text-center z-10">
          <h2 className="section-title-lg text-white mb-8 drop-shadow-lg animate-fade-in">
            Ready to Experience Cozy Condo?
          </h2>
          <p className="text-xl text-white/95 mb-16 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Book your stay today and discover why guests love our properties. Experience premium comfort with warm Filipino hospitality in the heart of Iloilo City.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto mb-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/properties"
              className="btn btn-lg bg-white text-[var(--color-warm-900)] hover:bg-[var(--color-warm-50)] hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl group relative overflow-hidden"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="font-semibold">Browse Properties</span>
              <ArrowRight className="w-5 h-5 icon-arrow group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg btn-outline border-white/40 text-white hover:bg-white/15 hover:border-white/60 hover:scale-105 transition-all duration-300 backdrop-blur-sm group"
            >
              <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-semibold">Message Us</span>
            </a>
          </div>

          {/* Enhanced Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 text-white/80 border-t border-white/20 pt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-white mb-2 font-display group-hover:text-white/95 transition-colors duration-300">Fast Response</div>
              <div className="text-sm font-medium tracking-wide">Within minutes</div>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent hidden sm:block" />
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-white mb-2 font-display group-hover:text-white/95 transition-colors duration-300">Premium Service</div>
              <div className="text-sm font-medium tracking-wide">5-star experience</div>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent hidden sm:block" />
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl font-bold text-white mb-2 font-display group-hover:text-white/95 transition-colors duration-300">Local Expertise</div>
              <div className="text-sm font-medium tracking-wide">Iloilo specialists</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
