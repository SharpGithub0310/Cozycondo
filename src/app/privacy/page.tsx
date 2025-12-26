import { Metadata } from 'next';
import Link from 'next/link';
import { Lock, Eye, Shield, Database, Mail, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Cozy Condo',
  description: 'Privacy policy for Cozy Condo - How we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: Database,
      items: [
        'Name and contact information (email, phone number)',
        'Government-issued ID for verification',
        'Booking and payment information',
        'Communication history with our team',
        'Website usage data through cookies',
      ],
    },
    {
      title: 'How We Use Your Information',
      icon: Eye,
      items: [
        'Process bookings and reservations',
        'Communicate about your stay',
        'Send booking confirmations and updates',
        'Improve our services and website',
        'Comply with legal requirements',
      ],
    },
    {
      title: 'Data Protection',
      icon: Shield,
      content: 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and restricted access to personal information.',
    },
    {
      title: 'Information Sharing',
      icon: Globe,
      content: 'We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website and conducting our business, as long as they agree to keep this information confidential.',
    },
    {
      title: 'Your Rights',
      icon: Lock,
      items: [
        'Access your personal data we hold',
        'Request correction of inaccurate data',
        'Request deletion of your data',
        'Opt-out of marketing communications',
        'Request data portability',
      ],
    },
    {
      title: 'Cookies and Analytics',
      icon: Database,
      content: 'We use cookies and similar tracking technologies to enhance your browsing experience and analyze website traffic. You can control cookie preferences through your browser settings.',
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
                  <Lock className="w-6 h-6 text-[var(--color-primary-600)]" />
                </div>
                <h1 className="section-title">Privacy Policy</h1>
              </div>
              <p className="text-lg text-[var(--color-warm-600)]">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="card card-flat p-6 mb-8">
              <p className="text-[var(--color-warm-700)] leading-relaxed">
                At Cozy Condo, we are committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and book our properties.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div key={index} className="card card-flat p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[var(--color-primary-600)]" />
                      </div>
                      <h2 className="text-xl font-semibold text-[var(--color-warm-900)]">
                        {section.title}
                      </h2>
                    </div>

                    {section.content && (
                      <p className="text-[var(--color-warm-700)] leading-relaxed">
                        {section.content}
                      </p>
                    )}

                    {section.items && (
                      <ul className="space-y-2 mt-3">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-[var(--color-primary-400)] mt-2 flex-shrink-0" />
                            <span className="text-[var(--color-warm-700)]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 space-y-6">
              <div className="card card-flat p-6">
                <h3 className="text-lg font-semibold text-[var(--color-warm-900)] mb-3">
                  Data Retention
                </h3>
                <p className="text-[var(--color-warm-700)]">
                  We retain your personal information only for as long as necessary to provide our services and fulfill the purposes outlined in this policy,
                  unless a longer retention period is required by law.
                </p>
              </div>

              <div className="card card-flat p-6">
                <h3 className="text-lg font-semibold text-[var(--color-warm-900)] mb-3">
                  Children's Privacy
                </h3>
                <p className="text-[var(--color-warm-700)]">
                  Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
                </p>
              </div>

              <div className="card card-flat p-6">
                <h3 className="text-lg font-semibold text-[var(--color-warm-900)] mb-3">
                  Updates to This Policy
                </h3>
                <p className="text-[var(--color-warm-700)]">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
                  and updating the "Last updated" date.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-[var(--color-warm-100)] rounded-2xl">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[var(--color-warm-600)] mt-1" />
                <div>
                  <h3 className="font-semibold text-[var(--color-warm-900)] mb-2">
                    Contact Us About Privacy
                  </h3>
                  <p className="text-[var(--color-warm-700)] mb-4">
                    If you have any questions or concerns about this Privacy Policy or how we handle your personal information, please contact us.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-[var(--color-warm-600)]">
                      Email: admin@cozycondo.net
                    </p>
                    <p className="text-sm text-[var(--color-warm-600)]">
                      Phone: +63 977 887 0724
                    </p>
                  </div>
                  <Link href="/contact" className="btn btn-primary">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--color-warm-600)]">
                © {new Date().getFullYear()} Cozy Condo. All rights reserved. |
                <Link href="/terms" className="ml-1 text-[var(--color-primary-600)] hover:underline">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}