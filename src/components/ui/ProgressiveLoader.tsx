'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  onLoad?: () => void;
  className?: string;
}

interface ConnectionInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/**
 * Progressive loader that adapts to network conditions and device capabilities
 */
export function ProgressiveLoader({
  children,
  fallback,
  priority = 'medium',
  delay = 0,
  onLoad,
  className = ''
}: ProgressiveLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const { currentBreakpoint, touchDevice } = useBreakpoint();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  // Get network information
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionInfo({
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false
      });

      const handleConnectionChange = () => {
        setConnectionInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100,
          saveData: connection.saveData || false
        });
      };

      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }
  }, []);

  // Calculate loading strategy based on device and network
  const getLoadingStrategy = () => {
    const strategies = {
      immediate: 0,
      fast: 100,
      normal: 300,
      slow: 800,
      verySlow: 1500
    };

    // High priority items load immediately
    if (priority === 'high') {
      return strategies.immediate;
    }

    // Consider network conditions
    if (connectionInfo) {
      if (connectionInfo.saveData) {
        return strategies.verySlow;
      }

      switch (connectionInfo.effectiveType) {
        case '4g':
          return priority === 'medium' ? strategies.fast : strategies.normal;
        case '3g':
          return priority === 'medium' ? strategies.normal : strategies.slow;
        case '2g':
        case 'slow-2g':
          return strategies.verySlow;
        default:
          return strategies.normal;
      }
    }

    // Consider device capabilities
    if (currentBreakpoint === 'mobile') {
      if (touchDevice) {
        return priority === 'medium' ? strategies.normal : strategies.slow;
      }
    }

    // Default strategy
    return priority === 'medium' ? strategies.fast : strategies.normal;
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!elementRef.current) return;

    const loadingDelay = Math.max(delay, getLoadingStrategy());

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Apply loading delay based on strategy
          const timer = setTimeout(() => {
            setShouldLoad(true);
            onLoad?.();
          }, loadingDelay);

          return () => clearTimeout(timer);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [delay, onLoad, getLoadingStrategy]);

  // Render loading state based on network conditions
  const renderFallback = () => {
    if (fallback) {
      return fallback;
    }

    // Adaptive loading skeleton based on connection
    const isSlowConnection = connectionInfo?.effectiveType === '2g' || 
                           connectionInfo?.effectiveType === 'slow-2g' ||
                           connectionInfo?.saveData;

    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32 w-full"></div>
        {!isSlowConnection && (
          <div className="mt-2 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        )}
        {isSlowConnection && (
          <div className="mt-2 text-center text-sm text-gray-500">
            Memuat konten...
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={elementRef} className={className}>
      {shouldLoad ? children : renderFallback()}
    </div>
  );
}

/**
 * Progressive image loader with WebP support and lazy loading
 */
interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  onLoad,
  onError
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { currentBreakpoint } = useBreakpoint();

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    const extension = baseSrc.split('.').pop();
    const baseName = baseSrc.replace(`.${extension}`, '');
    
    // Generate different sizes for responsive images
    const sizes = [320, 640, 768, 1024, 1280];
    return sizes
      .map(size => `${baseName}-${size}w.webp ${size}w`)
      .join(', ');
  };

  const getSizes = () => {
    switch (currentBreakpoint) {
      case 'mobile':
        return '(max-width: 767px) 100vw';
      case 'tablet':
        return '(max-width: 1023px) 50vw';
      default:
        return '33vw';
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (!shouldLoad) {
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Gagal memuat gambar</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={getSizes()}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

/**
 * Adaptive content loader based on device performance
 */
interface AdaptiveContentProps {
  children: React.ReactNode;
  mobileContent?: React.ReactNode;
  tabletContent?: React.ReactNode;
  desktopContent?: React.ReactNode;
  lowPerformanceContent?: React.ReactNode;
  className?: string;
}

export function AdaptiveContent({
  children,
  mobileContent,
  tabletContent,
  desktopContent,
  lowPerformanceContent,
  className = ''
}: AdaptiveContentProps) {
  const { currentBreakpoint } = useBreakpoint();
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // Detect low performance devices
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      // Check device memory (if available)
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory && deviceMemory <= 2) {
        setIsLowPerformance(true);
        return;
      }

      // Check hardware concurrency
      if (navigator.hardwareConcurrency <= 2) {
        setIsLowPerformance(true);
        return;
      }

      // Check connection type
      const connection = (navigator as any).connection;
      if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
        setIsLowPerformance(true);
        return;
      }
    }
  }, []);

  // Return appropriate content based on device capabilities
  if (isLowPerformance && lowPerformanceContent) {
    return <div className={className}>{lowPerformanceContent}</div>;
  }

  switch (currentBreakpoint) {
    case 'mobile':
      return <div className={className}>{mobileContent || children}</div>;
    case 'tablet':
      return <div className={className}>{tabletContent || children}</div>;
    case 'desktop':
      return <div className={className}>{desktopContent || children}</div>;
    default:
      return <div className={className}>{children}</div>;
  }
}

/**
 * Network-aware component loader
 */
interface NetworkAwareLoaderProps {
  children: React.ReactNode;
  fastNetworkContent?: React.ReactNode;
  slowNetworkContent?: React.ReactNode;
  offlineContent?: React.ReactNode;
  className?: string;
}

export function NetworkAwareLoader({
  children,
  fastNetworkContent,
  slowNetworkContent,
  offlineContent,
  className = ''
}: NetworkAwareLoaderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [networkSpeed, setNetworkSpeed] = useState<'fast' | 'slow'>('fast');

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor network speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateNetworkSpeed = () => {
        const effectiveType = connection.effectiveType;
        setNetworkSpeed(
          effectiveType === '4g' || effectiveType === '3g' ? 'fast' : 'slow'
        );
      };

      updateNetworkSpeed();
      connection.addEventListener('change', updateNetworkSpeed);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', updateNetworkSpeed);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline && offlineContent) {
    return <div className={className}>{offlineContent}</div>;
  }

  if (networkSpeed === 'slow' && slowNetworkContent) {
    return <div className={className}>{slowNetworkContent}</div>;
  }

  if (networkSpeed === 'fast' && fastNetworkContent) {
    return <div className={className}>{fastNetworkContent}</div>;
  }

  return <div className={className}>{children}</div>;
}