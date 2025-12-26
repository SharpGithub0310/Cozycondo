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
        display: grid;
        grid-template-columns: 1fr;
        gap: 3rem;
        align-items: center;
      }

      @media (min-width: 1024px) {
        .hero-content {
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
        }
      }

      .hero-left {
        text-align: center;
      }

      @media (min-width: 1024px) {
        .hero-left {
          text-align: left;
        }
      }

      .hero-right {
        display: flex;
        flex-direction: column;
        align-items: center;
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
        transition: transform 0.2s;
      }

      .btn-primary:hover {
        transform: translateY(-1px);
      }

      /* Card critical styles */
      .card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .card-image {
        position: relative;
        width: 100%;
        height: 16rem;
        border-radius: 0.75rem 0.75rem 0 0;
        overflow: hidden;
      }
    `}</style>
  );
}