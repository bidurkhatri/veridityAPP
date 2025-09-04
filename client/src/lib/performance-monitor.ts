/**
 * Client-side performance monitoring
 */

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.collectMetrics();
  }

  private collectMetrics() {
    // Wait for page load to complete
    if (document.readyState === 'loading') {
      window.addEventListener('load', () => this.gatherMetrics());
    } else {
      // Page already loaded
      setTimeout(() => this.gatherMetrics(), 0);
    }
  }

  private gatherMetrics() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.metrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timeToInteractive: 0
      };

      // Collect paint metrics
      this.collectPaintMetrics();
      
      // Collect Web Vitals
      this.collectWebVitals();
      
      // Log results
      this.logPerformanceResults();
      
    } catch (error) {
      console.error('Performance metrics collection failed:', error);
    }
  }

  private collectPaintMetrics() {
    try {
      const paintEntries = performance.getEntriesByType('paint');
      
      for (const entry of paintEntries) {
        if (entry.name === 'first-paint') {
          this.metrics!.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics!.firstContentfulPaint = entry.startTime;
        }
      }
    } catch (error) {
      console.warn('Paint metrics not available:', error);
    }
  }

  private collectWebVitals() {
    // Largest Contentful Paint
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics!.largestContentfulPaint = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP not supported:', error);
    }

    // First Input Delay
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          this.metrics!.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID not supported:', error);
    }

    // Cumulative Layout Shift
    try {
      const observer = new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        this.metrics!.cumulativeLayoutShift = cls;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS not supported:', error);
    }
  }

  private logPerformanceResults() {
    if (!this.metrics) return;

    console.group('🚀 Performance Metrics');
    console.log(`Page Load: ${this.metrics.pageLoadTime.toFixed(2)}ms`);
    console.log(`DOM Content Loaded: ${this.metrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`First Paint: ${this.metrics.firstPaint.toFixed(2)}ms`);
    console.log(`First Contentful Paint: ${this.metrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log(`Largest Contentful Paint: ${this.metrics.largestContentfulPaint.toFixed(2)}ms`);
    console.log(`Cumulative Layout Shift: ${this.metrics.cumulativeLayoutShift.toFixed(4)}`);
    console.log(`First Input Delay: ${this.metrics.firstInputDelay.toFixed(2)}ms`);
    console.groupEnd();

    // Performance budget checks
    this.checkPerformanceBudgets();
  }

  private checkPerformanceBudgets() {
    if (!this.metrics) return;

    const budgets = {
      pageLoadTime: 3000,     // 3 seconds
      firstPaint: 1000,       // 1 second
      firstContentfulPaint: 1500, // 1.5 seconds
      largestContentfulPaint: 2500, // 2.5 seconds
      cumulativeLayoutShift: 0.1,   // Web Vitals threshold
      firstInputDelay: 100          // 100ms
    };

    const violations: string[] = [];

    Object.entries(budgets).forEach(([metric, budget]) => {
      const value = this.metrics![metric as keyof PerformanceMetrics];
      if (typeof value === 'number' && value > budget) {
        violations.push(`${metric}: ${value.toFixed(2)} > ${budget}`);
      }
    });

    if (violations.length > 0) {
      console.warn('⚠️ Performance Budget Violations:');
      violations.forEach(violation => console.warn(`  ${violation}`));
    } else {
      console.log('✅ All performance budgets met');
    }
  }

  getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  getWebVitalsScore(): number {
    if (!this.metrics) return 0;

    let score = 100;

    // Deduct points for poor metrics
    if (this.metrics.largestContentfulPaint > 2500) score -= 20;
    if (this.metrics.firstInputDelay > 100) score -= 20;
    if (this.metrics.cumulativeLayoutShift > 0.1) score -= 20;
    if (this.metrics.firstContentfulPaint > 1500) score -= 20;
    if (this.metrics.pageLoadTime > 3000) score -= 20;

    return Math.max(0, score);
  }

  // Clean up observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Make available for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).performanceMonitor = performanceMonitor;
}