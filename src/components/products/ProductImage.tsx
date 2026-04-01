'use client';

import { useState, memo, useEffect } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  categoryName?: string;
}

/**
 * Product image component with bulletproof error handling.
 * Shows placeholder immediately, then swaps to external image when loaded.
 * Never shows a broken image icon!
 */
function ProductImageComponent({ src, alt, className = '', fill = false, categoryName }: ProductImageProps) {
  // For local images (starting with /), show directly without preloading
  const isLocal = src && src.startsWith('/');
  const [verifiedSrc, setVerifiedSrc] = useState<string | null>(isLocal ? src : null);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  const placeholderUrl = '/api/placeholder?text=' + encodeURIComponent(alt.length > 40 ? alt.slice(0, 40) + '...' : alt) + '&category=' + encodeURIComponent(categoryName || '') + '&w=600&h=600';

  useEffect(() => {
    if (!src || isLocal) return;
    const img = new Image();
    img.onload = () => setVerifiedSrc(src);
    img.onerror = () => setFallbackTriggered(true);
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isLocal]);

  // Show placeholder by default; use external only when verified
  const displaySrc = verifiedSrc || (fallbackTriggered ? placeholderUrl : (isLocal ? src : placeholderUrl));

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.src !== placeholderUrl) {
      el.src = placeholderUrl;
    }
  };

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      style={fill ? { position: 'absolute', inset: 0, zIndex: 1 } : undefined}
      loading="lazy"
      onError={handleImgError}
    />
  );
}

export const ProductImage = memo(ProductImageComponent);
