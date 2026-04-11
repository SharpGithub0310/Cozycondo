import { MessageCircle, Facebook } from 'lucide-react';

export const metadata = {
  title: 'Contact — Cozy Condo',
  description: 'Reach out to us on Messenger or Facebook.',
};

export default function ContactPage() {
  const fb = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || '#';
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';

  return (
    <main className="pt-32 pb-24">
      <section className="container-xl max-w-2xl text-center mb-12">
        <div className="label-tiny mb-4">— GET IN TOUCH</div>
        <h1 className="text-[40px] md:text-[48px] font-medium tracking-[-1.2px] leading-[1.05] mb-4">
          Let&apos;s chat.
        </h1>
        <p className="text-[15px] text-stone-600 leading-[1.7]">
          We&apos;re a small team that responds personally to every message. Tap one of the options below and we&apos;ll get back to you within the hour during the day.
        </p>
      </section>

      <section className="container-xl max-w-3xl grid md:grid-cols-2 gap-4 mb-16">
        <a href={messenger} target="_blank" rel="noopener noreferrer"
           className="bg-white border border-stone-200 rounded-xl p-8 text-center hover:shadow-md transition">
          <div className="w-14 h-14 rounded-full bg-[#e7f0ff] flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-[#1877f2]" />
          </div>
          <h3 className="text-[17px] font-medium mb-1.5">Messenger</h3>
          <p className="text-[13px] text-stone-600 leading-[1.55] mb-5">
            Chat with us directly — fastest way to reach us.
          </p>
          <span className="inline-block bg-stone-900 text-stone-50 text-[12px] font-medium px-5 py-2.5 rounded-full">
            Open Messenger →
          </span>
        </a>

        <a href={fb} target="_blank" rel="noopener noreferrer"
           className="bg-white border border-stone-200 rounded-xl p-8 text-center hover:shadow-md transition">
          <div className="w-14 h-14 rounded-full bg-[#e7f0ff] flex items-center justify-center mx-auto mb-4">
            <Facebook className="w-6 h-6 text-[#1877f2]" />
          </div>
          <h3 className="text-[17px] font-medium mb-1.5">Facebook Page</h3>
          <p className="text-[13px] text-stone-600 leading-[1.55] mb-5">
            See our latest updates, photos, and guest stories.
          </p>
          <span className="inline-block bg-stone-900 text-stone-50 text-[12px] font-medium px-5 py-2.5 rounded-full">
            Visit Page →
          </span>
        </a>
      </section>

      <section className="container-xl max-w-2xl border-t border-stone-200 pt-10 text-center text-[13px] text-stone-600 leading-[1.8]">
        <div className="font-medium text-stone-900">Response hours</div>
        <div>Monday – Sunday · 8:00 AM – 9:00 PM (PHT)</div>
        <br />
        <div className="font-medium text-stone-900">Based in</div>
        <div>Iloilo City, Philippines</div>
      </section>
    </main>
  );
}
