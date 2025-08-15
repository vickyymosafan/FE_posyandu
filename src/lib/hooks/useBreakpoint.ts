import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointConfig {
  mobile: { min: number; max: number };
  tablet: { min: number; max: number };
  desktop: { min: number; max: number };
}

export const breakpointConfig: BreakpointConfig = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity }
};

export interface ScreenSize {
  width: number;
  height: number;
}

export interface ResponsiveState {
  currentBreakpoint: Breakpoint;
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
}

/**
 * Hook kustom untuk mendeteksi breakpoint dan ukuran layar
 * Mendukung deteksi real-time perubahan ukuran layar
 */
export function useBreakpoint(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Default state untuk SSR
    return {
      currentBreakpoint: 'desktop' as Breakpoint,
      screenSize: { width: 1024, height: 768 },
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape' as const,
      touchDevice: false
    };
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let currentBreakpoint: Breakpoint = 'desktop';
      
      if (width <= breakpointConfig.mobile.max) {
        currentBreakpoint = 'mobile';
      } else if (width <= breakpointConfig.tablet.max) {
        currentBreakpoint = 'tablet';
      }

      const orientation = width > height ? 'landscape' : 'portrait';
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setState({
        currentBreakpoint,
        screenSize: { width, height },
        isMobile: currentBreakpoint === 'mobile',
        isTablet: currentBreakpoint === 'tablet',
        isDesktop: currentBreakpoint === 'desktop',
        orientation,
        touchDevice
      });
    };

    // Set initial state
    updateBreakpoint();

    // Add event listener
    window.addEventListener('resize', updateBreakpoint);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return state;
}

/**
 * Hook untuk mendeteksi breakpoint spesifik
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    const updateMatch = () => setMatches(media.matches);
    updateMatch();
    
    media.addEventListener('change', updateMatch);
    return () => media.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
}

/**
 * Hook untuk mendeteksi orientasi perangkat
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  return orientation;
}