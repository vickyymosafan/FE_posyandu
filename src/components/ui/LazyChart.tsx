'use client';

import React, { Suspense, lazy } from 'react';
import { Card } from '@/components/ui/card';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { getResponsiveValue } from '@/lib/utils/responsive';

// Lazy load chart components
const ResponsiveChart = lazy(() => import('./ResponsiveChart'));
const ResponsiveBarChart = lazy(() => import('./ResponsiveBarChart'));
const ResponsiveDashboardChart = lazy(() => import('../dashboard/ResponsiveDashboardChart'));

// Loading skeleton component
interface ChartSkeletonProps {
  height?: number;
  title?: string;
}

function ChartSkeleton({ height = 200, title }: ChartSkeletonProps) {
  const { currentBreakpoint } = useBreakpoint();
  
  const skeletonHeight = getResponsiveValue(
    {
      mobile: height * 0.8,
      tablet: height * 0.9,
      desktop: height
    },
    currentBreakpoint,
    height
  );

  return (
    <Card className="p-4 animate-pulse">
      {title && (
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      )}
      <div 
        className="bg-gray-200 rounded" 
        style={{ height: skeletonHeight }}
      ></div>
      <div className="mt-3 flex gap-2">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </Card>
  );
}

// Lazy chart wrapper components
export interface LazyResponsiveChartProps {
  data: any[];
  title: string;
  metric: string;
  primaryColor?: string;
  secondaryColor?: string;
  showSecondaryLine?: boolean;
  formatValue?: (value: number) => string;
  formatDate?: (date: string) => string;
  className?: string;
  onDataPointClick?: (dataPoint: any, index: number) => void;
  showTooltip?: boolean;
  showLegend?: boolean;
  showLatestValue?: boolean;
  height?: number;
  fontSize?: { title: string; axis: string; tooltip: string; legend?: string };
  touchTargetSize?: number;
  padding?: number;
}

export function LazyResponsiveChart(props: LazyResponsiveChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height} title={props.title} />}>
      <ResponsiveChart {...props} />
    </Suspense>
  );
}

export interface LazyResponsiveBarChartProps {
  data: any[];
  title: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
  showPercentages?: boolean;
  formatValue?: (value: number) => string;
  onBarClick?: (dataPoint: any, index: number) => void;
  height?: number;
  fontSize?: { title: string; axis: string; tooltip: string; legend?: string };
  touchTargetSize?: number;
  padding?: number;
}

export function LazyResponsiveBarChart(props: LazyResponsiveBarChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height} title={props.title} />}>
      <ResponsiveBarChart {...props} />
    </Suspense>
  );
}

export interface LazyResponsiveDashboardChartProps {
  data: any[];
  title: string;
  metric: string;
  color?: string;
  className?: string;
  showTrend?: boolean;
  trendPeriod?: number;
  height?: number;
  fontSize?: { title: string; axis: string; tooltip: string; legend?: string };
  touchTargetSize?: number;
  padding?: number;
}

export function LazyResponsiveDashboardChart(props: LazyResponsiveDashboardChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton height={props.height} title={props.title} />}>
      <ResponsiveDashboardChart {...props} />
    </Suspense>
  );
}

// Progressive loading wrapper with intersection observer
interface ProgressiveChartProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function ProgressiveChart({ 
  children, 
  fallback, 
  rootMargin = '50px',
  threshold = 0.1 
}: ProgressiveChartProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={ref}>
      {isVisible ? children : (fallback || <ChartSkeleton />)}
    </div>
  );
}

// Performance monitoring hook for charts
export function useChartPerformance(chartId: string) {
  const [metrics, setMetrics] = React.useState({
    renderTime: 0,
    dataProcessingTime: 0,
    interactionLatency: 0
  });

  const startRender = React.useCallback(() => {
    return performance.now();
  }, []);

  const endRender = React.useCallback((startTime: number) => {
    const renderTime = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, renderTime }));
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Chart ${chartId} render time: ${renderTime.toFixed(2)}ms`);
    }
  }, [chartId]);

  const measureDataProcessing = React.useCallback((fn: () => void) => {
    const startTime = performance.now();
    fn();
    const processingTime = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, dataProcessingTime: processingTime }));
  }, []);

  const measureInteraction = React.useCallback((fn: () => void) => {
    const startTime = performance.now();
    fn();
    const latency = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, interactionLatency: latency }));
  }, []);

  return {
    metrics,
    startRender,
    endRender,
    measureDataProcessing,
    measureInteraction
  };
}