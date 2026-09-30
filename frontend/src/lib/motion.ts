// Durations
export const duration = { fast: 0.15, base: 0.3, slow: 0.6, xslow: 1.2 };

// Easings
export const easing = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
};

// Spring configs
export const spring = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  snappy: { type: 'spring', stiffness: 260, damping: 24 },
  bouncy: { type: 'spring', stiffness: 400, damping: 20 },
};

// Stagger
export const stagger = { fast: 0.04, base: 0.06, slow: 0.1 };

// Common animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Container variant with stagger children
export const staggerContainer = (staggerTime: number = stagger.base) => ({
  initial: {},
  animate: { transition: { staggerChildren: staggerTime } },
  exit: { transition: { staggerChildren: staggerTime / 2, staggerDirection: -1 } },
});

// Reduced motion check hook
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  
  return prefersReduced;
}

// Safe motion - returns simple fades when reduced motion is preferred
export function useSafeVariants(variants: any): any {
  const reduced = useReducedMotion();
  if (reduced) return fadeIn;
  return variants;
}
