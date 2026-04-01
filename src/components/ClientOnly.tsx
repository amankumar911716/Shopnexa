'use client';

import { useState, useEffect, type ReactNode } from 'react';

/**
 * Renders children only on the client side after mount.
 * Prevents hydration mismatches from DOM-dependent libraries
 * (e.g., embla-carousel, framer-motion) that modify attributes
 * during initialization.
 */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!mounted) return fallback;
  return <>{children}</>;
}
