import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for preloading images with error handling
 */
export function useImagePreload(src: string): {
  loaded: boolean;
  error: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
} {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    setLoaded(false);
    setError(false);

    const img = new Image();

    img.onload = () => {
      setLoaded(true);
      setError(false);
    };

    img.onerror = () => {
      setLoaded(false);
      setError(true);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loaded, error, imageRef };
}

/**
 * Custom hook for lazy loading images with intersection observer
 */
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageRef, setImageRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver;

    if (imageRef && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(imageRef);
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...options,
        }
      );

      observer.observe(imageRef);
    } else {
      // Fallback for browsers without IntersectionObserver
      setImageSrc(src);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, options]);

  return { imageSrc, setImageRef };
}