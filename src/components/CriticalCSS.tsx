'use client';

export default function CriticalCSS() {
  return (
    <style jsx global>{`
      /* Critical CSS for above-the-fold content */
      .hero {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        overflow: hidden;
      }

      .hero-container {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 4rem 1rem;
      }

      @media (min-width: 640px) {
        .hero-container {
          padding: 6rem 1.5rem;
        }
      }

      @media (min-width: 1024px) {
        .hero-container {
          padding: 8rem 2rem;
        }
      }

      .hero-content {
        display: flex;
        flex-direction: column;
        gap: 3rem;
        align-items: center;
      }

      @media (min-width: 1024px) {
        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
      }

      /* Critical typography */
      .hero-title {
        font-family: var(--font-playfair, Georgia, serif);
        font-size: clamp(2.5rem, 5vw, 4rem);
        font-weight: 700;
        line-height: 1.1;
        margin-bottom: 1.5rem;
      }

      .hero-subtitle {
        font-size: clamp(1.125rem, 2.5vw, 1.25rem);
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      /* Button critical styles */
      .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 600;
        text-decoration: none;
        transition: transform 0.2s ease-out;
      }

      .btn-primary:hover {
        transform: translateY(-1px);
      }

      /* Card critical styles */
      .card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
      }

      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .card-image {
        position: relative;
        width: 100%;
        height: 16rem;
        border-radius: 0.75rem 0.75rem 0 0;
        overflow: hidden;
      }

      /* Performance optimizations */
      .animate-fade-in {
        animation: fadeIn 0.6s ease-out forwards;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Skeleton loading styles */
      .skeleton {
        background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }

      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}