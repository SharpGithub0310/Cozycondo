import { MessageCircle } from 'lucide-react';

export default function MobileContactBar() {
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || 'https://m.me/cozycondoiloilocity';

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-stone-200 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <a
        href={messenger}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#1877f2] text-white py-3 rounded-lg text-sm font-medium"
      >
        <MessageCircle className="w-4 h-4" /> Message us on Facebook
      </a>
    </div>
  );
}
