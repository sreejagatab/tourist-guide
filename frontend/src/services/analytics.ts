/**
 * Analytics Service
 * 
 * This service provides methods for tracking user behavior and interactions.
 * It can be extended to integrate with third-party analytics providers like
 * Google Analytics, Mixpanel, or custom backend analytics.
 */

// Types for analytics events
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  [key: string]: any; // Additional custom properties
}

export interface PageViewEvent {
  path: string;
  title?: string;
  referrer?: string;
  [key: string]: any; // Additional custom properties
}

export interface UserEvent {
  userId: string;
  event: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private isInitialized: boolean = false;
  private userId: string | null = null;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private debugMode: boolean = false;

  constructor() {
    // Generate a session ID
    this.sessionId = this.generateSessionId();
    
    // Check if we're in development mode
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  /**
   * Initialize the analytics service
   */
  public init(): void {
    if (this.isInitialized) {
      return;
    }

    // Set up event listeners
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    
    // Mark as initialized
    this.isInitialized = true;
    
    if (this.debugMode) {
      console.log('Analytics service initialized');
    }
  }

  /**
   * Set the current user ID for user tracking
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    
    if (this.debugMode) {
      console.log(`Analytics: User ID set to ${userId}`);
    }
  }

  /**
   * Clear the current user ID (e.g., on logout)
   */
  public clearUserId(): void {
    this.userId = null;
    
    if (this.debugMode) {
      console.log('Analytics: User ID cleared');
    }
  }

  /**
   * Track a page view
   */
  public trackPageView(event: PageViewEvent): void {
    const { path, title, ...rest } = event;
    
    const pageViewData = {
      path,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      ...rest
    };
    
    // In a real implementation, send this to your analytics backend
    this.sendToAnalyticsBackend('pageview', pageViewData);
    
    if (this.debugMode) {
      console.log('Analytics: Page View', pageViewData);
    }
  }

  /**
   * Track a user event
   */
  public trackEvent(event: AnalyticsEvent): void {
    const eventData = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId
    };
    
    // Add to queue for batch processing
    this.eventQueue.push(eventData);
    
    // In a real implementation, you might want to batch events
    // For now, we'll send immediately
    this.sendToAnalyticsBackend('event', eventData);
    
    if (this.debugMode) {
      console.log('Analytics: Event', eventData);
    }
  }

  /**
   * Track user interaction with a specific feature
   */
  public trackFeatureUsage(featureName: string, action: string, properties?: Record<string, any>): void {
    this.trackEvent({
      category: 'Feature',
      action,
      label: featureName,
      ...properties
    });
  }

  /**
   * Track errors that occur in the application
   */
  public trackError(errorType: string, errorMessage: string, stackTrace?: string): void {
    this.trackEvent({
      category: 'Error',
      action: 'Error Occurred',
      label: errorType,
      errorMessage,
      stackTrace
    });
  }

  /**
   * Send queued events to the backend
   */
  private flushEvents(): void {
    if (this.eventQueue.length === 0) {
      return;
    }
    
    // In a real implementation, send the batch to your analytics backend
    // this.sendToAnalyticsBackend('batch', this.eventQueue);
    
    // Clear the queue
    this.eventQueue = [];
    
    if (this.debugMode) {
      console.log('Analytics: Flushed event queue');
    }
  }

  /**
   * Handle the beforeunload event to send any queued events
   */
  private handleBeforeUnload = (): void => {
    this.flushEvents();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Send data to the analytics backend
   * This is a placeholder for the actual implementation
   */
  private sendToAnalyticsBackend(type: string, data: any): void {
    // In a real implementation, this would send data to your analytics backend
    // For now, we'll just log it in debug mode
    if (this.debugMode) {
      console.log(`Analytics: Sending ${type} to backend`, data);
    }
    
    // Example implementation with fetch:
    /*
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data
      }),
    }).catch(error => {
      console.error('Failed to send analytics data:', error);
    });
    */
  }
}

// Create a singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
