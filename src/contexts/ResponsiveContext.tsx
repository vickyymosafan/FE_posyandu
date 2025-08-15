'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useBreakpoint, type ResponsiveState } from '../lib/hooks/useBreakpoint';

interface ResponsiveContextType extends ResponsiveState {
  // Additional context methods can be added here if needed
  toggleSidebar?: () => void;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

interface ResponsiveProviderProps {
  children: ReactNode;
}

/**
 * Provider untuk responsive context
 * Menyediakan informasi breakpoint dan ukuran layar ke seluruh aplikasi
 */
export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const responsiveState = useBreakpoint();

  return (
    <ResponsiveContext.Provider value={responsiveState}>
      {children}
    </ResponsiveContext.Provider>
  );
}

/**
 * Hook untuk menggunakan responsive context
 */
export function useResponsive(): ResponsiveContextType {
  const context = useContext(ResponsiveContext);
  
  if (context === undefined) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  
  return context;
}

/**
 * HOC untuk komponen yang membutuhkan responsive behavior
 */
export function withResponsive<P extends object>(
  Component: React.ComponentType<P & ResponsiveContextType>
) {
  return function ResponsiveComponent(props: P) {
    const responsiveState = useResponsive();
    
    return <Component {...props} {...responsiveState} />;
  };
}