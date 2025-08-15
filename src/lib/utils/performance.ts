/**
 * Performance monitoring utilities for responsive components
 */

export interface PerformanceMetrics {
  renderTime: number;
  dataProcessingTime: number;
  interactionLatency: number;
  memoryUsage?: number;
  bundleSize?: number;
}

export interface ComponentPerformanceData {
  componentName: string;
  breakpoint: string;
  metrics: PerformanceMetrics;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, ComponentPerformanceData[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  /**
   * Start monitoring a component's performance
   */
  startMonitoring(componentName: string, breakpoint: string): string {
    const sessionId = `${componentName}-${breakpoint}-${Date.now()}`;
    
    // Initialize metrics array if not exists
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }

    return sessionId;
  }

  /**
   * Record performance metrics for a component
   */
  recordMetrics(
    componentName: string, 
    breakpoint: string, 
    metrics: PerformanceMetrics
  ): void {
    const data: ComponentPerformanceData = {
      componentName,
      breakpoint,
      metrics,
      timestamp: Date.now()
    };

    const componentMetrics = this.metrics.get(componentName) || [];
    componentMetrics.push(data);
    
    // Keep only last 50 entries per component
    if (componentMetrics.length > 50) {
      componentMetrics.shift();
    }
    
    this.metrics.set(componentName, componentMetrics);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance [${componentName}@${breakpoint}]:`, metrics);
    }

    // Send to analytics in production (if configured)
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      this.sendToAnalytics(data);
    }
  }

  /**
   * Get performance metrics for a component
   */
  getMetrics(componentName: string): ComponentPerformanceData[] {
    return this.metrics.get(componentName) || [];
  }

  /**
   * Get average metrics for a component across all breakpoints
   */
  getAverageMetrics(componentName: string): PerformanceMetrics | null {
    const componentMetrics = this.metrics.get(componentName);
    if (!componentMetrics || componentMetrics.length === 0) {
      return null;
    }

    const totals = componentMetrics.reduce(
      (acc, data) => ({
        renderTime: acc.renderTime + data.metrics.renderTime,
        dataProcessingTime: acc.dataProcessingTime + data.metrics.dataProcessingTime,
        interactionLatency: acc.interactionLatency + data.metrics.interactionLatency,
        memoryUsage: acc.memoryUsage + (data.metrics.memoryUsage || 0),
        bundleSize: acc.bundleSize + (data.metrics.bundleSize || 0)
      }),
      { renderTime: 0, dataProcessingTime: 0, interactionLatency: 0, memoryUsage: 0, bundleSize: 0 }
    );

    const count = componentMetrics.length;
    return {
      renderTime: totals.renderTime / count,
      dataProcessingTime: totals.dataProcessingTime / count,
      interactionLatency: totals.interactionLatency / count,
      memoryUsage: totals.memoryUsage / count,
      bundleSize: totals.bundleSize / count
    };
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Monitor LCP (Largest Contentful Paint)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lcp = entries[entries.length - 1];
      this.recordWebVital('LCP', lcp.startTime);
    });

    // Monitor FID (First Input Delay)
    this.observePerformanceEntry('first-input', (entries) => {
      const event = entries[0] as PerformanceEventTiming | undefined;
      if (event && typeof (event as any).processingStart === 'number') {
        this.recordWebVital('FID', (event as PerformanceEventTiming).processingStart - event.startTime);
      }
    });

    // Monitor CLS (Cumulative Layout Shift)
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entries) => {
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordWebVital('CLS', clsValue);
    });
  }

  /**
   * Monitor memory usage
   */
  getMemoryUsage(): number | undefined {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return undefined;
  }

  /**
   * Monitor bundle size impact
   */
  async getBundleSize(componentName: string): Promise<number | undefined> {
    if (typeof window === 'undefined') return undefined;

    try {
      // Use Navigation API to get resource timing
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const navigation = entries[0] as PerformanceNavigationTiming;
        return navigation.transferSize || undefined;
      }
    } catch (error) {
      console.warn('Bundle size monitoring not available:', error);
    }
    
    return undefined;
  }

  /**
   * Clear metrics for a component
   */
  clearMetrics(componentName?: string): void {
    if (componentName) {
      this.metrics.delete(componentName);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): Record<string, ComponentPerformanceData[]> {
    const exported: Record<string, ComponentPerformanceData[]> = {};
    this.metrics.forEach((data, componentName) => {
      exported[componentName] = [...data];
    });
    return exported;
  }

  private observePerformanceEntry(
    entryType: string, 
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: [entryType] });
      this.observers.set(entryType, observer);
    } catch (error) {
      console.warn(`Performance observer for ${entryType} not supported:`, error);
    }
  }

  private recordWebVital(name: string, value: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital [${name}]:`, value);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendWebVitalToAnalytics(name, value);
    }
  }

  private sendToAnalytics(data: ComponentPerformanceData): void {
    // Implement analytics sending logic here
    // This could be Google Analytics, custom analytics, etc.
    try {
      // Example: Send to Google Analytics 4
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'component_performance', {
          component_name: data.componentName,
          breakpoint: data.breakpoint,
          render_time: data.metrics.renderTime,
          processing_time: data.metrics.dataProcessingTime,
          interaction_latency: data.metrics.interactionLatency
        });
      }
    } catch (error) {
      console.warn('Failed to send performance data to analytics:', error);
    }
  }

  private sendWebVitalToAnalytics(name: string, value: number): void {
    try {
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', name, {
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          event_category: 'Web Vitals'
        });
      }
    } catch (error) {
      console.warn('Failed to send web vital to analytics:', error);
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for monitoring component performance
 */
export function usePerformanceMonitoring(componentName: string, breakpoint: string) {
  const startTime = React.useRef<number>(0);

  const startMeasurement = React.useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endMeasurement = React.useCallback((
    type: 'render' | 'processing' | 'interaction' = 'render'
  ) => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;

    const metrics: PerformanceMetrics = {
      renderTime: type === 'render' ? duration : 0,
      dataProcessingTime: type === 'processing' ? duration : 0,
      interactionLatency: type === 'interaction' ? duration : 0,
      memoryUsage: performanceMonitor.getMemoryUsage()
    };

    performanceMonitor.recordMetrics(componentName, breakpoint, metrics);
    
    return duration;
  }, [componentName, breakpoint]);

  const measureAsync = React.useCallback(async <T>(
    fn: () => Promise<T>,
    type: 'render' | 'processing' | 'interaction' = 'processing'
  ): Promise<T> => {
    startMeasurement();
    try {
      const result = await fn();
      endMeasurement(type);
      return result;
    } catch (error) {
      endMeasurement(type);
      throw error;
    }
  }, [startMeasurement, endMeasurement]);

  return {
    startMeasurement,
    endMeasurement,
    measureAsync,
    getMetrics: () => performanceMonitor.getMetrics(componentName),
    getAverageMetrics: () => performanceMonitor.getAverageMetrics(componentName)
  };
}

/**
 * Performance thresholds for different breakpoints
 */
export const performanceThresholds = {
  mobile: {
    renderTime: 100, // ms
    dataProcessingTime: 50, // ms
    interactionLatency: 100, // ms
    LCP: 2500, // ms
    FID: 100, // ms
    CLS: 0.1 // score
  },
  tablet: {
    renderTime: 80,
    dataProcessingTime: 40,
    interactionLatency: 80,
    LCP: 2000,
    FID: 80,
    CLS: 0.1
  },
  desktop: {
    renderTime: 60,
    dataProcessingTime: 30,
    interactionLatency: 50,
    LCP: 1500,
    FID: 50,
    CLS: 0.1
  }
} as const;

/**
 * Check if performance metrics meet thresholds
 */
export function checkPerformanceThresholds(
  metrics: PerformanceMetrics,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): { passed: boolean; issues: string[] } {
  const thresholds = performanceThresholds[breakpoint];
  const issues: string[] = [];

  if (metrics.renderTime > thresholds.renderTime) {
    issues.push(`Render time (${metrics.renderTime.toFixed(1)}ms) exceeds threshold (${thresholds.renderTime}ms)`);
  }

  if (metrics.dataProcessingTime > thresholds.dataProcessingTime) {
    issues.push(`Data processing time (${metrics.dataProcessingTime.toFixed(1)}ms) exceeds threshold (${thresholds.dataProcessingTime}ms)`);
  }

  if (metrics.interactionLatency > thresholds.interactionLatency) {
    issues.push(`Interaction latency (${metrics.interactionLatency.toFixed(1)}ms) exceeds threshold (${thresholds.interactionLatency}ms)`);
  }

  return {
    passed: issues.length === 0,
    issues
  };
}

// Initialize web vitals monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.monitorWebVitals();
}

// Add React import for hooks
import React from 'react';