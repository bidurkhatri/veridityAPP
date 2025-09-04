/**
 * Memory management and leak prevention utilities
 */

export class MemoryManager {
  private static timers = new Set<NodeJS.Timeout>();
  private static intervals = new Set<NodeJS.Timeout>();
  private static listeners = new Map<EventTarget, Array<{ event: string; handler: EventListener }>>();
  private static observers = new Set<IntersectionObserver | MutationObserver | ResizeObserver>();

  // Track and manage timers
  static setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  static setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  static clearTimeout(timer: NodeJS.Timeout) {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  static clearInterval(interval: NodeJS.Timeout) {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  // Track event listeners
  static addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) {
    target.addEventListener(event, handler, options);
    
    if (!this.listeners.has(target)) {
      this.listeners.set(target, []);
    }
    this.listeners.get(target)!.push({ event, handler });
  }

  static removeEventListener(target: EventTarget, event: string, handler: EventListener) {
    target.removeEventListener(event, handler);
    
    const listeners = this.listeners.get(target);
    if (listeners) {
      const index = listeners.findIndex(l => l.event === event && l.handler === handler);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Track observers
  static trackObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver) {
    this.observers.add(observer);
    return observer;
  }

  static untrackObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver) {
    observer.disconnect();
    this.observers.delete(observer);
  }

  // Clean up all resources
  static cleanup() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Remove all event listeners
    this.listeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler }) => {
        target.removeEventListener(event, handler);
      });
    });
    this.listeners.clear();

    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    // Force garbage collection if available (development only)
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc();
    }
  }

  // Memory monitoring
  static getMemoryStats() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timers: this.timers.size,
        intervals: this.intervals.size,
        listeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
        observers: this.observers.size
      };
    }
    return null;
  }

  // Log memory stats for debugging
  static logMemoryStats() {
    const stats = this.getMemoryStats();
    if (stats) {
      console.log('Memory Stats:', {
        'Used JS Heap': `${(stats.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Total JS Heap': `${(stats.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        'Heap Limit': `${(stats.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        'Active Timers': stats.timers,
        'Active Intervals': stats.intervals,
        'Event Listeners': stats.listeners,
        'Observers': stats.observers
      });
    }
  }
}

// Hooks for React components
export function useMemoryCleanup() {
  const cleanup = () => {
    MemoryManager.cleanup();
  };

  return { cleanup };
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    MemoryManager.cleanup();
  });

  // Monitor memory in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      MemoryManager.logMemoryStats();
    }, 30000); // Log every 30 seconds
  }
}