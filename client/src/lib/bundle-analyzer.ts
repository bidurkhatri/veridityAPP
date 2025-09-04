/**
 * Bundle size monitoring and performance budgets
 */

interface BundleMetrics {
  totalSize: number;
  gzipSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzipSize?: number;
  }>;
  loadTime: number;
  timestamp: Date;
}

class BundleAnalyzer {
  private metrics: BundleMetrics[] = [];
  private budgets = {
    totalBundle: 500 * 1024, // 500KB total
    mainChunk: 200 * 1024,   // 200KB main chunk
    vendorChunk: 300 * 1024, // 300KB vendor chunk
    loadTime: 3000,          // 3 seconds load time
  };

  constructor() {
    this.trackLoadTime();
    this.trackBundleSize();
  }

  private trackLoadTime() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      
      console.log(`Bundle load time: ${loadTime}ms`);
      
      if (loadTime > this.budgets.loadTime) {
        console.warn(`⚠️ Bundle load time (${loadTime}ms) exceeds budget (${this.budgets.loadTime}ms)`);
      }
    });
  }

  private trackBundleSize() {
    // Track chunk sizes using performance API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      console.log('Connection type:', connection.effectiveType);
      console.log('Downlink:', connection.downlink + ' Mbps');
    }

    // Estimate bundle size from loaded resources
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      
      let totalSize = 0;
      const chunks: BundleMetrics['chunks'] = [];

      jsResources.forEach(resource => {
        const size = resource.transferSize || resource.decodedBodySize || 0;
        totalSize += size;
        
        chunks.push({
          name: resource.name.split('/').pop() || 'unknown',
          size: size
        });
      });

      this.checkBudget(totalSize, chunks);
    });
  }

  private checkBudget(totalSize: number, chunks: BundleMetrics['chunks']) {
    console.log(`Total bundle size: ${this.formatBytes(totalSize)}`);

    // Check total bundle budget
    if (totalSize > this.budgets.totalBundle) {
      console.warn(
        `⚠️ Total bundle size (${this.formatBytes(totalSize)}) ` +
        `exceeds budget (${this.formatBytes(this.budgets.totalBundle)})`
      );
    }

    // Check individual chunk budgets
    chunks.forEach(chunk => {
      if (chunk.name.includes('vendor') && chunk.size > this.budgets.vendorChunk) {
        console.warn(
          `⚠️ Vendor chunk (${this.formatBytes(chunk.size)}) ` +
          `exceeds budget (${this.formatBytes(this.budgets.vendorChunk)})`
        );
      } else if (chunk.name.includes('index') && chunk.size > this.budgets.mainChunk) {
        console.warn(
          `⚠️ Main chunk (${this.formatBytes(chunk.size)}) ` +
          `exceeds budget (${this.formatBytes(this.budgets.mainChunk)})`
        );
      }
    });

    // Store metrics
    this.metrics.push({
      totalSize,
      gzipSize: totalSize * 0.7, // Estimate gzip savings
      chunks,
      loadTime: performance.now(),
      timestamp: new Date()
    });

    // Keep only last 10 metrics
    if (this.metrics.length > 10) {
      this.metrics = this.metrics.slice(-10);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Public API
  setBudget(key: keyof typeof this.budgets, value: number) {
    this.budgets[key] = value;
  }

  getBudgets() {
    return { ...this.budgets };
  }

  getMetrics() {
    return [...this.metrics];
  }

  getLatestMetrics() {
    return this.metrics[this.metrics.length - 1];
  }

  // Performance recommendations
  getRecommendations(): string[] {
    const latest = this.getLatestMetrics();
    const recommendations: string[] = [];

    if (!latest) return recommendations;

    if (latest.totalSize > this.budgets.totalBundle) {
      recommendations.push('Consider code splitting or tree shaking to reduce bundle size');
    }

    if (latest.loadTime > this.budgets.loadTime) {
      recommendations.push('Optimize images and enable lazy loading');
      recommendations.push('Use service worker for caching');
      recommendations.push('Consider using a CDN');
    }

    const largeChunks = latest.chunks.filter(c => c.size > 100 * 1024);
    if (largeChunks.length > 0) {
      recommendations.push('Consider splitting large chunks: ' + largeChunks.map(c => c.name).join(', '));
    }

    return recommendations;
  }
}

// Initialize bundle analyzer in development
export const bundleAnalyzer = process.env.NODE_ENV === 'development' 
  ? new BundleAnalyzer() 
  : null;

// Export for manual inspection
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).bundleAnalyzer = bundleAnalyzer;
}