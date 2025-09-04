/**
 * Error tracking and monitoring system
 */

export interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: Date;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  breadcrumbs: Breadcrumb[];
  context: Record<string, any>;
}

export interface Breadcrumb {
  timestamp: Date;
  message: string;
  category: 'navigation' | 'interaction' | 'http' | 'error' | 'log';
  level: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

class ErrorTracker {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandling();
    this.setupUnhandledRejectionHandling();
    this.setupNetworkErrorTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      const error: ErrorEvent = {
        id: crypto.randomUUID(),
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        breadcrumbs: [...this.breadcrumbs],
        context: {
          url: window.location.href,
          referrer: document.referrer,
          timestamp: Date.now()
        }
      };

      this.reportError(error);
    });
  }

  private setupUnhandledRejectionHandling() {
    window.addEventListener('unhandledrejection', (event) => {
      const error: ErrorEvent = {
        id: crypto.randomUUID(),
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
        breadcrumbs: [...this.breadcrumbs],
        context: {
          type: 'unhandledrejection',
          reason: event.reason,
          url: window.location.href
        }
      };

      this.reportError(error);
    });
  }

  private setupNetworkErrorTracking() {
    // Intercept fetch requests to track network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.addBreadcrumb({
            message: `HTTP ${response.status} ${response.statusText}`,
            category: 'http',
            level: 'error',
            data: {
              url: args[0],
              status: response.status,
              statusText: response.statusText
            }
          });
        }
        
        return response;
      } catch (error) {
        this.addBreadcrumb({
          message: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`,
          category: 'http',
          level: 'error',
          data: {
            url: args[0],
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        
        throw error;
      }
    };
  }

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date()
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  async reportError(error: ErrorEvent) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🐛 Error Tracked');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.log('Breadcrumbs:', error.breadcrumbs);
      console.log('Context:', error.context);
      console.groupEnd();
    }

    // Send to error monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(error)
        });
      } catch (reportError) {
        console.error('Failed to report error:', reportError);
        
        // Store in localStorage as fallback
        this.storeErrorLocally(error);
      }
    }
  }

  private storeErrorLocally(error: ErrorEvent) {
    try {
      const stored = localStorage.getItem('veridity-stored-errors') || '[]';
      const errors = JSON.parse(stored);
      
      errors.push(error);
      
      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('veridity-stored-errors', JSON.stringify(errors));
    } catch (storageError) {
      console.error('Failed to store error locally:', storageError);
    }
  }

  getStoredErrors(): ErrorEvent[] {
    try {
      const stored = localStorage.getItem('veridity-stored-errors') || '[]';
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to retrieve stored errors:', error);
      return [];
    }
  }

  clearStoredErrors() {
    localStorage.removeItem('veridity-stored-errors');
  }

  // Manual error reporting
  captureError(error: Error, context?: Record<string, any>) {
    const errorEvent: ErrorEvent = {
      id: crypto.randomUUID(),
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
      breadcrumbs: [...this.breadcrumbs],
      context: context || {}
    };

    this.reportError(errorEvent);
  }

  // Track user interactions for debugging
  trackInteraction(element: string, action: string, data?: any) {
    this.addBreadcrumb({
      message: `${action} on ${element}`,
      category: 'interaction',
      level: 'info',
      data
    });
  }

  // Track navigation
  trackNavigation(from: string, to: string) {
    this.addBreadcrumb({
      message: `Navigated from ${from} to ${to}`,
      category: 'navigation',
      level: 'info',
      data: { from, to }
    });
  }
}

// Global error tracker
export const errorTracker = new ErrorTracker();

// React hook for error tracking
export function useErrorTracking() {
  return {
    captureError: errorTracker.captureError.bind(errorTracker),
    trackInteraction: errorTracker.trackInteraction.bind(errorTracker),
    trackNavigation: errorTracker.trackNavigation.bind(errorTracker),
    addBreadcrumb: errorTracker.addBreadcrumb.bind(errorTracker),
    getStoredErrors: errorTracker.getStoredErrors.bind(errorTracker),
    clearStoredErrors: errorTracker.clearStoredErrors.bind(errorTracker)
  };
}

// Error boundary integration
export function withErrorTracking<T extends {}>(
  Component: React.ComponentType<T>
) {
  return function TrackedComponent(props: T) {
    const { captureError } = useErrorTracking();

    const handleError = (error: Error, errorInfo: any) => {
      captureError(error, { componentStack: errorInfo.componentStack });
    };

    return (
      <ErrorBoundary onError={handleError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}