/**
 * Usage analytics and user behavior tracking
 */

export interface AnalyticsEvent {
  event: string;
  timestamp: Date;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
}

export interface UserSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  interactions: number;
  proofTypes: string[];
  language: 'en' | 'ne';
  deviceInfo: {
    isMobile: boolean;
    userAgent: string;
    screen: { width: number; height: number };
    connection?: string;
  };
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private session: UserSession;
  private isEnabled: boolean = false;

  constructor() {
    this.session = this.createSession();
    this.setupSessionTracking();
    this.enableIfConsented();
  }

  private createSession(): UserSession {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      pageViews: 0,
      interactions: 0,
      proofTypes: [],
      language: (localStorage.getItem('veridity-language') as 'en' | 'ne') || 'en',
      deviceInfo: {
        isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
        userAgent: navigator.userAgent,
        screen: {
          width: window.screen.width,
          height: window.screen.height
        },
        connection: (navigator as any).connection?.effectiveType
      }
    };
  }

  private setupSessionTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden');
      } else {
        this.track('page_visible');
      }
    });

    // Track session end
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track page views
    this.trackPageView(window.location.pathname);
  }

  private enableIfConsented() {
    // Check for analytics consent
    const consent = localStorage.getItem('veridity-analytics-consent');
    this.isEnabled = consent === 'true';
    
    // In development, always enable for testing
    if (process.env.NODE_ENV === 'development') {
      this.isEnabled = true;
    }
  }

  enable() {
    this.isEnabled = true;
    localStorage.setItem('veridity-analytics-consent', 'true');
    this.track('analytics_enabled');
  }

  disable() {
    this.isEnabled = false;
    localStorage.setItem('veridity-analytics-consent', 'false');
    this.clearData();
  }

  track(event: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: new Date(),
      properties: {
        ...properties,
        page: window.location.pathname,
        referrer: document.referrer,
        language: this.session.language,
        deviceType: this.session.deviceInfo.isMobile ? 'mobile' : 'desktop'
      },
      sessionId: this.session.id
    };

    this.events.push(analyticsEvent);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics:', event, properties);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendEvent(analyticsEvent);
    }

    // Store locally for offline support
    this.storeEventLocally(analyticsEvent);
  }

  // Track specific app events
  trackProofGeneration(proofType: string, success: boolean, duration?: number) {
    this.track('proof_generated', {
      proof_type: proofType,
      success,
      duration_ms: duration
    });

    if (success && !this.session.proofTypes.includes(proofType)) {
      this.session.proofTypes.push(proofType);
    }
  }

  trackProofVerification(proofType: string, organizationId: string, success: boolean) {
    this.track('proof_verified', {
      proof_type: proofType,
      organization_id: organizationId,
      success
    });
  }

  trackPageView(path: string) {
    this.session.pageViews++;
    this.track('page_view', { path });
  }

  trackUserInteraction(element: string, action: string, data?: any) {
    this.session.interactions++;
    this.track('user_interaction', {
      element,
      action,
      ...data
    });
  }

  trackVoiceCommand(command: string, language: 'en' | 'ne', success: boolean) {
    this.track('voice_command', {
      command,
      language,
      success
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  private async sendEvent(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  private storeEventLocally(event: AnalyticsEvent) {
    try {
      const stored = localStorage.getItem('veridity-analytics-events') || '[]';
      const events = JSON.parse(stored);
      
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('veridity-analytics-events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  private endSession() {
    this.session.endTime = new Date();
    this.track('session_end', {
      duration_ms: this.session.endTime.getTime() - this.session.startTime.getTime(),
      page_views: this.session.pageViews,
      interactions: this.session.interactions,
      proof_types_used: this.session.proofTypes
    });

    // Send session data
    if (this.isEnabled) {
      this.sendSessionData();
    }
  }

  private async sendSessionData() {
    try {
      await fetch('/api/analytics/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.session)
      });
    } catch (error) {
      console.error('Failed to send session data:', error);
    }
  }

  getSessionData(): UserSession {
    return { ...this.session };
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearData() {
    this.events = [];
    localStorage.removeItem('veridity-analytics-events');
  }

  isTrackingEnabled(): boolean {
    return this.isEnabled;
  }
}

// Global analytics service
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackProofGeneration: analytics.trackProofGeneration.bind(analytics),
    trackProofVerification: analytics.trackProofVerification.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserInteraction: analytics.trackUserInteraction.bind(analytics),
    trackVoiceCommand: analytics.trackVoiceCommand.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    isEnabled: analytics.isTrackingEnabled.bind(analytics),
    enable: analytics.enable.bind(analytics),
    disable: analytics.disable.bind(analytics),
    getSessionData: analytics.getSessionData.bind(analytics)
  };
}