import { useState, useCallback } from 'react';
import { useLazyImage } from '@/hooks/useImagePreload';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  quality?: number;
  priority?: boolean;
}

/**
 * Optimized image component with lazy loading and error handling
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5Y2EzYWYiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError,
  lazy = true,
  quality = 80,
  priority = false
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { imageSrc, setImageRef } = useLazyImage(lazy ? src : '', {
    rootMargin: '50px',
    threshold: 0.1
  });

  const currentSrc = lazy ? imageSrc : src;

  const handleLoad = useCallback(() => {
    setLoaded(true);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(false);
    onError?.();
  }, [onError]);

  // Create optimized image URL with quality parameter
  const optimizeSrc = (originalSrc: string) => {
    if (!originalSrc) return placeholder;
    return originalSrc;
  };

  if (error) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}
        ref={lazy ? setImageRef : undefined}
      >
        <div className="text-center text-gray-500">
          <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-400 opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
          <p className="text-xs">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      ref={lazy ? setImageRef : undefined}
    >
      {!loaded && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          aria-hidden="true"
        />
      )}

      {currentSrc && (
        <img
          src={optimizeSrc(currentSrc)}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Loading overlay */}
      {!loaded && !error && currentSrc && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}