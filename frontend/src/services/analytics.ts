/**
 * Analytics Service
 *
 * This service provides methods for tracking user behavior and interactions.
 * It connects to the backend analytics API to store and process analytics data.
 */

import api from './api';

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

    // Send batch to analytics backend
    api.post('/analytics/track-batch', {
      events: this.eventQueue.map(event => ({
        type: 'event',
        data: event
      }))
    }).catch(error => {
      console.error('Failed to send batch analytics data:', error);

      // Store failed events for retry later
      this.eventQueue.forEach(event => {
        this.storeFailedEvent('event', event);
      });
    });

    // Clear the queue
    this.eventQueue = [];

    if (this.debugMode) {
      console.log('Analytics: Flushed event queue');
    }

    // Also try to send any previously failed events
    this.retryFailedEvents();
  }

  /**
   * Retry sending failed events from localStorage
   */
  private retryFailedEvents(): void {
    try {
      const failedEventsStr = localStorage.getItem('failedAnalyticsEvents');
      if (!failedEventsStr) return;

      const failedEvents = JSON.parse(failedEventsStr);
      if (failedEvents.length === 0) return;

      // Only retry events that are less than 24 hours old
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);

      const recentEvents = failedEvents.filter(event =>
        new Date(event.timestamp) > cutoff
      );

      if (recentEvents.length === 0) {
        localStorage.removeItem('failedAnalyticsEvents');
        return;
      }

      // Send batch of failed events
      api.post('/analytics/track-batch', {
        events: recentEvents
      }).then(() => {
        // Clear successfully sent events
        localStorage.removeItem('failedAnalyticsEvents');

        if (this.debugMode) {
          console.log(`Analytics: Successfully retried ${recentEvents.length} failed events`);
        }
      }).catch(() => {
        // Keep events in localStorage for next retry
        if (this.debugMode) {
          console.log(`Analytics: Failed to retry ${recentEvents.length} events`);
        }
      });
    } catch (error) {
      console.error('Error retrying failed analytics events:', error);
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
   */
  private sendToAnalyticsBackend(type: string, data: any): void {
    if (this.debugMode) {
      console.log(`Analytics: Sending ${type} to backend`, data);
    }

    // Send to backend API
    api.post('/analytics/track', {
      type,
      data
    }).catch(error => {
      console.error('Failed to send analytics data:', error);

      // Store failed events in localStorage for retry later
      this.storeFailedEvent(type, data);
    });
  }

  /**
   * Store failed events in localStorage for retry later
   */
  private storeFailedEvent(type: string, data: any): void {
    try {
      // Get existing failed events
      const failedEventsStr = localStorage.getItem('failedAnalyticsEvents');
      const failedEvents = failedEventsStr ? JSON.parse(failedEventsStr) : [];

      // Add new failed event
      failedEvents.push({
        type,
        data,
        timestamp: new Date().toISOString()
      });

      // Store back in localStorage (limit to 100 events to prevent overflow)
      localStorage.setItem(
        'failedAnalyticsEvents',
        JSON.stringify(failedEvents.slice(-100))
      );
    } catch (error) {
      console.error('Failed to store analytics event in localStorage:', error);
    }
  }
}

// Create a singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
