import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService, { AnalyticsEvent } from '../services/analytics';
import { useAuth } from './AuthContext';

// Define the context type
interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void;
  trackFeatureUsage: (featureName: string, action: string, properties?: Record<string, any>) => void;
  trackError: (errorType: string, errorMessage: string, stackTrace?: string) => void;
}

// Create the context with default values
const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  trackFeatureUsage: () => {},
  trackError: () => {},
});

// Hook to use the analytics context
export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Initialize analytics service
  useEffect(() => {
    analyticsService.init();
  }, []);

  // Set user ID when user changes
  useEffect(() => {
    if (user && user._id) {
      analyticsService.setUserId(user._id);
    } else {
      analyticsService.clearUserId();
    }
  }, [user]);

  // Track page views when location changes
  useEffect(() => {
    analyticsService.trackPageView({
      path: location.pathname,
      search: location.search,
    });
  }, [location]);

  // Define the context value
  const contextValue: AnalyticsContextType = {
    trackEvent: (event: AnalyticsEvent) => {
      analyticsService.trackEvent(event);
    },
    trackFeatureUsage: (featureName: string, action: string, properties?: Record<string, any>) => {
      analyticsService.trackFeatureUsage(featureName, action, properties);
    },
    trackError: (errorType: string, errorMessage: string, stackTrace?: string) => {
      analyticsService.trackError(errorType, errorMessage, stackTrace);
    },
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;
