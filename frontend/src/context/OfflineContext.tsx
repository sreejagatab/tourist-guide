import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import offlineService from '../services/offline.service';
import { useAnalytics } from './AnalyticsContext';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineEnabled: boolean;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  saveForOffline: (tourId: string) => Promise<void>;
  removeFromOffline: (tourId: string) => Promise<void>;
  isAvailableOffline: (tourId: string) => Promise<boolean>;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isOfflineEnabled: false,
  enableOfflineMode: () => {},
  disableOfflineMode: () => {},
  saveForOffline: async () => {},
  removeFromOffline: async () => {},
  isAvailableOffline: async () => false,
});

export const useOffline = () => useContext(OfflineContext);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isOfflineEnabled, setIsOfflineEnabled] = useState<boolean>(
    localStorage.getItem('offlineEnabled') === 'true'
  );
  const { trackFeatureUsage } = useAnalytics();

  useEffect(() => {
    // Handle online/offline status changes
    const handleOnlineStatusChange = (online: boolean) => {
      setIsOnline(online);
      
      // Track analytics event
      trackFeatureUsage('Offline', online ? 'Back Online' : 'Went Offline');
      
      // Show notification when back online
      if (online && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('You are back online', {
          body: 'Your changes will now be synchronized.',
          icon: '/logo192.png'
        });
      }
    };
    
    // Add listener for online status changes
    offlineService.addOnlineStatusListener(handleOnlineStatusChange);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Register service worker
    offlineService.registerServiceWorker();
    
    return () => {
      // Remove listener when component unmounts
      offlineService.removeOnlineStatusListener(handleOnlineStatusChange);
    };
  }, [trackFeatureUsage]);

  // Enable offline mode
  const enableOfflineMode = () => {
    setIsOfflineEnabled(true);
    localStorage.setItem('offlineEnabled', 'true');
    trackFeatureUsage('Offline', 'Enable Offline Mode');
  };

  // Disable offline mode
  const disableOfflineMode = () => {
    setIsOfflineEnabled(false);
    localStorage.setItem('offlineEnabled', 'false');
    trackFeatureUsage('Offline', 'Disable Offline Mode');
  };

  // Save a tour for offline access
  const saveForOffline = async (tourId: string) => {
    try {
      // Fetch the tour data if online
      if (isOnline) {
        const response = await fetch(`/api/tours/${tourId}`);
        if (response.ok) {
          const tourData = await response.json();
          await offlineService.saveTourOffline(tourData.data.tour);
          trackFeatureUsage('Offline', 'Save Tour', { tourId });
        }
      }
    } catch (error) {
      console.error('Failed to save tour for offline access:', error);
    }
  };

  // Remove a tour from offline storage
  const removeFromOffline = async (tourId: string) => {
    try {
      // Remove from IndexedDB
      const db = await openDB();
      await db.delete('offlineTours', tourId);
      trackFeatureUsage('Offline', 'Remove Tour', { tourId });
    } catch (error) {
      console.error('Failed to remove tour from offline storage:', error);
    }
  };

  // Check if a tour is available offline
  const isAvailableOffline = async (tourId: string): Promise<boolean> => {
    try {
      const offlineTour = await offlineService.getOfflineTour(tourId);
      return !!offlineTour;
    } catch (error) {
      console.error('Failed to check if tour is available offline:', error);
      return false;
    }
  };

  // Helper function to open IndexedDB
  const openDB = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TourGuideOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        
        // Add helper methods
        db.delete = (storeName: string, key: string | number) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
          });
        };
        
        resolve(db);
      };
    });
  };

  const contextValue: OfflineContextType = {
    isOnline,
    isOfflineEnabled,
    enableOfflineMode,
    disableOfflineMode,
    saveForOffline,
    removeFromOffline,
    isAvailableOffline,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

export default OfflineProvider;
