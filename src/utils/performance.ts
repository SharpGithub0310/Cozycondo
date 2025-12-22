/**
 * Performance monitoring utilities for the Cozy Condo application
 */

interface PerformanceMetrics {
  timestamp: number;
  metric: string;
  value: number;
  url?: string;
  userAgent?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== 'undefined';

    if (this.isClient) {
      this.initializeWebVitals();
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitals() {
    if (!this.isClient) return;

    // Monitor Core Web Vitals
    this.observePerformance();

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.measurePageLoadMetrics();
      }, 0);
    });
  }

  /**
   * Observe performance entries
   */
  private observePerformance() {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FID', (entry as any).processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  /**
   * Measure page load metrics
   */
  private measurePageLoadMetrics() {
    if (!this.isClient || !performance.timing) return;

    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
      this.recordMetric('DOMContentLoaded', timing.domContentLoadedEventEnd - timing.navigationStart);
      this.recordMetric('LoadComplete', timing.loadEventEnd - timing.navigationStart);
    }

    // Measure resource loading
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);

    if (slowResources.length > 0) {
      this.recordMetric('SlowResources', slowResources.length);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: string, value: number) {
    const entry: PerformanceMetrics = {
      timestamp: Date.now(),
      metric,
      value,
      url: this.isClient ? window.location.href : undefined,
      userAgent: this.isClient ? navigator.userAgent : undefined,
    };

    this.metrics.push(entry);

    // Log significant performance issues
    if (this.isPerformanceIssue(metric, value)) {
      console.warn(`Performance issue detected: ${metric} = ${value}ms`);
    }

    // Keep only recent metrics (last 100 entries)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  /**
   * Check if metric indicates a performance issue
   */
  private isPerformanceIssue(metric: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      LCP: 2500, // Good LCP is under 2.5s
      FID: 100,  // Good FID is under 100ms
      CLS: 0.1,  // Good CLS is under 0.1
      TTFB: 800, // Good TTFB is under 800ms
    };

    return thresholds[metric] ? value > thresholds[metric] : false;
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, any> {
    const summary: Record<string, any> = {
      totalMetrics: this.metrics.length,
      timestamp: Date.now(),
    };

    // Group metrics by type
    const byMetric: Record<string, number[]> = {};
    this.metrics.forEach(({ metric, value }) => {
      if (!byMetric[metric]) byMetric[metric] = [];
      byMetric[metric].push(value);
    });

    // Calculate averages and identify issues
    Object.entries(byMetric).forEach(([metric, values]) => {
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      summary[metric] = {
        average: Math.round(avg * 100) / 100,
        max: Math.round(max * 100) / 100,
        min: Math.round(min * 100) / 100,
        count: values.length,
        hasIssues: this.isPerformanceIssue(metric, avg),
      };
    });

    return summary;
  }

  /**
   * Measure function execution time
   */
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    this.recordMetric(`Function_${name}`, end - start);

    return result;
  }

  /**
   * Measure async function execution time
   */
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    this.recordMetric(`AsyncFunction_${name}`, end - start);

    return result;
  }

  /**
   * Track API call performance
   */
  async trackApiCall<T>(endpoint: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const end = performance.now();

      this.recordMetric(`API_${endpoint}_Success`, end - start);

      return result;
    } catch (error) {
      const end = performance.now();

      this.recordMetric(`API_${endpoint}_Error`, end - start);

      throw error;
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load a module
 */
export function lazyLoadModule<T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> {
  return performanceMonitor.measureAsyncFunction('LazyLoad', async () => {
    const module = await importFn();
    return module.default;
  });
}

/**
 * Memory usage tracker
 */
export function getMemoryUsage(): Record<string, number> | null {
  if (typeof window === 'undefined' || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;

  return {
    usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100, // MB
    totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100, // MB
    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100, // MB
  };
}