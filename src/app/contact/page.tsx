'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, MessageCircle, Facebook, Clock, Send, ArrowRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { enhancedDatabaseService } from '@/lib/enhanced-database-service';

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
  const [settings, setSettings] = useState<any>(null);
  const [dynamicFaqs, setDynamicFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load settings from database
      const dbSettings = await enhancedDatabaseService.getWebsiteSettings();
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
      <section className="hero">
        {/* Enhanced Background */}
        {contactImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${contactImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm-900)]/60 via-[var(--color-warm-800)]/40 to-[var(--color-warm-950)]/80" />
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}
            />
          </>
        ) : (
          <>
            {/* Premium gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm-50)] via-[var(--color-warm-100)] to-[var(--color-warm-200)]" />

            {/* Mesh gradient overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `
                  radial-gradient(ellipse 200% 100% at 50% 0%, var(--color-primary-100) 0%, transparent 50%),
                  radial-gradient(ellipse 200% 100% at 80% 100%, var(--color-accent-orange-light) 0%, transparent 50%),
                  radial-gradient(ellipse 150% 100% at 20% 100%, var(--color-primary-200) 0%, transparent 50%)
                `
              }}
            />

            {/* Decorative elements */}
            <div className="hidden lg:block absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-[var(--color-primary-300)]/20 to-[var(--color-primary-500)]/10 rounded-full blur-3xl animate-float" />
            <div className="hidden lg:block absolute bottom-32 left-16 w-96 h-96 bg-gradient-to-tr from-[var(--color-accent-orange)]/15 to-[var(--color-warm-400)]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          </>
        )}

        <div className="relative container-xl hero-content text-center">
          <div className="hero-badge mb-8">
            <div className="hero-badge-dot" />
            <span>24/7 Customer Support Available</span>
          </div>

          <h1 className={`hero-title mb-6 ${contactImage ? 'text-white drop-shadow-lg' : 'text-[var(--color-warm-900)]'}`}>
            Get in Touch
          </h1>
          <p className={`hero-subtitle mx-auto ${contactImage ? 'text-white/90 drop-shadow-md' : 'text-[var(--color-warm-700)]'}`}>
            Have questions about our properties or need help with a booking? We're here to assist you every step of the way with personalized service.
          </p>

          {/* Quick action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto mb-12">
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message Us Now</span>
            </a>
            <a
              href="tel:+639778870724"
              className="btn btn-secondary btn-lg hover:scale-105"
            >
              <Phone className="w-5 h-5" />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Methods */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="section-title">Choose Your Preferred Way to Connect</h2>
            <p className="section-subtitle mx-auto">
              We offer multiple ways to get in touch. Pick the one that works best for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <a
                  key={index}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="card card-flat group hover:card-elevated text-center p-8 transition-all duration-300 hover:scale-105"
                >
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${method.color.replace('bg-', 'from-')} to-opacity-80 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="card-title text-center mb-2 group-hover:text-[var(--color-primary-600)]">
                    {method.title}
                  </h3>
                  <p className="card-meta text-center mb-4">{method.description}</p>
                  <p className="text-[var(--color-primary-600)] font-semibold group-hover:underline">
                    {method.value}
                  </p>

                  {/* Response time indicator */}
                  {method.title === 'Facebook Messenger' && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Usually responds instantly
                    </div>
                  )}
                  {method.title === 'Phone' && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      Available 8AM - 10PM
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Location & Hours */}
      <section className="section bg-gradient-to-br from-[var(--color-warm-100)] to-[var(--color-warm-50)]">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Enhanced Map */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] shadow-2xl ring-1 ring-white/20">
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* Background pattern */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                      backgroundSize: '30px 30px'
                    }}
                  />

                  <div className="text-center text-white relative z-10">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <MapPin className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-2">Iloilo City</h3>
                    <p className="text-white/80 mb-6">Philippines</p>
                    <a
                      href="https://maps.google.com/?q=Iloilo+City+Philippines"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30"
                    >
                      <span>View on Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Floating info cards */}
              <div className="absolute -bottom-6 -right-6 lg:-bottom-8 lg:-right-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 lg:p-6 border border-white/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-warm-900)]">Quick Response</div>
                    <div className="text-sm text-[var(--color-warm-600)]">Usually within minutes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Info */}
            <div>
              <h2 className="section-title mb-8">Our Service Area</h2>

              <div className="space-y-8">
                <div className="card card-flat p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="card-title mb-2">Prime Locations</h3>
                      <p className="card-description mb-3">
                        Multiple premium properties across Iloilo City's best neighborhoods
                      </p>
                      <ul className="text-sm text-[var(--color-warm-600)] space-y-1">
                        <li>• Iloilo Business Park</li>
                        <li>• Smallville Complex</li>
                        <li>• City Proper</li>
                        <li>• Mandurriao District</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="card card-flat p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-orange-dark)] flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="card-title mb-2">Response Hours</h3>
                      <p className="card-description mb-3">
                        We're available to assist you daily with quick response times
                      </p>
                      <div className="text-sm text-[var(--color-warm-600)]">
                        <strong>8:00 AM - 10:00 PM</strong> Philippine Time (GMT+8)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-[var(--color-primary-50)] border-[var(--color-primary-200)] p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--color-primary-800)] mb-2">💡 Pro Tip</h3>
                      <p className="text-[var(--color-primary-700)]">
                        For the fastest response, message us on Facebook Messenger. We typically reply within minutes during business hours!
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
      <section className="section bg-white">
        <div className="container-md">
          <div className="text-center mb-16">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle mx-auto">
              Find quick answers to common questions about booking and staying with us. Can't find what you're looking for? Just ask us directly!
            </p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {(dynamicFaqs.length > 0 ? dynamicFaqs : faqs).map((faq, index) => (
                <div
                  key={index}
                  className="card p-8 hover:card-elevated transition-all duration-300"
                >
                  <h3 className="card-title text-[var(--color-primary-600)] mb-4">
                    {faq.question}
                  </h3>
                  <p className="card-description text-[var(--color-warm-800)] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="card bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] border-[var(--color-primary-200)] p-8">
              <h3 className="section-title text-[var(--color-primary-800)] mb-4">
                Still Have Questions?
              </h3>
              <p className="text-[var(--color-primary-700)] text-lg mb-8">
                We're happy to help! Our friendly team is standing by to answer any questions and help you find the perfect accommodation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://m.me/cozycondoiloilocity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg hover:scale-105"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat with Us</span>
                </a>
                <a
                  href="tel:+639778870724"
                  className="btn btn-outline btn-lg border-[var(--color-primary-600)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-600)] hover:text-white hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA Section */}
      <section className="section bg-gradient-to-br from-[var(--color-warm-900)] via-[var(--color-warm-800)] to-[var(--color-warm-950)] text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary-400)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--color-accent-orange)]/10 rounded-full blur-3xl" />

        <div className="relative container-xl text-center">
          <h2 className="section-title-lg text-white mb-6">
            Ready to Experience Cozy Condo?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Book your stay today and discover why guests love our properties. Experience premium comfort with warm Filipino hospitality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto mb-16">
            <Link
              href="/properties"
              className="btn btn-lg bg-white text-[var(--color-warm-900)] hover:bg-[var(--color-warm-50)] hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <span>Browse Properties</span>
              <ArrowRight className="w-5 h-5 icon-arrow" />
            </Link>
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message Us</span>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/70 border-t border-white/20 pt-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Fast Response</div>
              <div className="text-sm">Within minutes</div>
            </div>
            <div className="w-px h-12 bg-white/20 hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Premium Service</div>
              <div className="text-sm">5-star experience</div>
            </div>
            <div className="w-px h-12 bg-white/20 hidden sm:block" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">Local Expertise</div>
              <div className="text-sm">Iloilo specialists</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
