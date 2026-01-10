import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Check, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Cozy Condo',
  description: 'Terms and conditions for using Cozy Condo short-term rental services in Iloilo City.',
};

export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using our website or booking our properties, you accept and agree to be bound by the terms and provision of this agreement.',
    },
    {
      title: 'Booking and Reservations',
      items: [
        'All bookings are subject to availability',
        'Valid government-issued ID is required for all guests',
        'Booking confirmation will be sent via email or SMS',
        'Cancellation policies vary by property and booking platform',
      ],
    },
    {
      title: 'Property Use',
      items: [
        'Maximum occupancy limits must be strictly observed',
        'No smoking in all indoor areas',
        'No illegal activities on the premises',
        'Respect quiet hours from 10 PM to 7 AM',
        'Pets are not allowed unless specifically stated',
      ],
    },
    {
      title: 'Guest Responsibilities',
      items: [
        'Maintain cleanliness and order during your stay',
        'Report any damages immediately',
        'Secure the property when leaving',
        'Follow all building rules and regulations',
        'Respect other residents and neighbors',
      ],
    },
    {
      title: 'Payment Terms',
      content: 'Payment is required in full upon booking confirmation. We accept various payment methods including bank transfer, GCash, and credit/debit cards through secure payment platforms.',
    },
    {
      title: 'Damages and Security',
      content: 'Guests are responsible for any damages to the property during their stay. A security deposit may be required and will be refunded after inspection, less any deductions for damages or extra cleaning if necessary.',
    },
    {
      title: 'Privacy and Data Protection',
      content: 'We respect your privacy and protect your personal information in accordance with applicable data protection laws. Please refer to our Privacy Policy for more details.',
    },
    {
      title: 'Limitation of Liability',
      content: 'Cozy Condo shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or properties.',
    },
    {
      title: 'Modifications to Terms',
      content: 'We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-warm-50)] to-white">
      <section className="section">
        <div className="container-xl">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-100)] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[var(--color-primary-600)]" />
                </div>
                <h1 className="section-title">Terms of Service</h1>
              </div>
              <p className="text-lg text-[var(--color-warm-600)]">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index} className="card card-flat p-6">
                  <h2 className="font-display text-xl font-semibold text-[var(--color-warm-900)] mb-4">
                    {index + 1}. {section.title}
                  </h2>

                  {section.content && (
                    <p className="text-[var(--color-warm-700)] leading-relaxed">
                      {section.content}
                    </p>
                  )}

                  {section.items && (
                    <ul className="space-y-2 mt-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-[var(--color-primary-500)] mt-0.5 flex-shrink-0" />
                          <span className="text-[var(--color-warm-700)]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-[var(--color-warm-100)] rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--color-warm-600)] mt-1" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-[var(--color-warm-900)] mb-2">
                    Questions About Our Terms?
                  </h3>
                  <p className="text-[var(--color-warm-700)] mb-4">
                    If you have any questions about these Terms of Service, please contact us.
                  </p>
                  <Link href="/contact" className="btn btn-primary">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--color-warm-600)]">
                © {new Date().getFullYear()} Cozy Condo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}