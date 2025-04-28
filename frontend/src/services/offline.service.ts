import { Tour } from './tour.service';
import { Review } from './review.service';

interface OfflineFavorite {
  id?: number;
  tourId: string;
  action: 'add' | 'remove';
  timestamp: number;
}

interface OfflineReview {
  id?: number;
  data: any;
  timestamp: number;
}

interface OfflineDB {
  getAll: (storeName: string) => Promise<any[]>;
  get: (storeName: string, key: string | number) => Promise<any>;
  put: (storeName: string, value: any) => Promise<any>;
  delete: (storeName: string, key: string | number) => Promise<void>;
  clear: (storeName: string) => Promise<void>;
}

class OfflineService {
  private db: OfflineDB | null = null;
  private isOnline: boolean = navigator.onLine;
  private onlineListeners: Array<(online: boolean) => void> = [];

  constructor() {
    // Initialize online status listeners
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);
    
    // Initialize the database
    this.initDB();
  }

  /**
   * Initialize the IndexedDB database
   */
  private async initDB(): Promise<void> {
    try {
      this.db = await this.openDB();
      console.log('Offline database initialized');
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
    }
  }

  /**
   * Open the IndexedDB database
   */
  private openDB(): Promise<OfflineDB> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TourGuideOfflineDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        
        // Add helper methods to simplify database operations
        const offlineDB: OfflineDB = {
          getAll: (storeName: string) => {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.objectStore(storeName);
              const request = store.getAll();
              
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve(request.result);
            });
          },
          
          get: (storeName: string, key: string | number) => {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.objectStore(storeName);
              const request = store.get(key);
              
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve(request.result);
            });
          },
          
          put: (storeName: string, value: any) => {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(storeName, 'readwrite');
              const store = transaction.objectStore(storeName);
              const request = store.put(value);
              
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve(request.result);
            });
          },
          
          delete: (storeName: string, key: string | number) => {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(storeName, 'readwrite');
              const store = transaction.objectStore(storeName);
              const request = store.delete(key);
              
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve();
            });
          },
          
          clear: (storeName: string) => {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(storeName, 'readwrite');
              const store = transaction.objectStore(storeName);
              const request = store.clear();
              
              request.onerror = () => reject(request.error);
              request.onsuccess = () => resolve();
            });
          }
        };
        
        resolve(offlineDB);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('offlineFavorites')) {
          db.createObjectStore('offlineFavorites', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('offlineReviews')) {
          db.createObjectStore('offlineReviews', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('offlineTours')) {
          db.createObjectStore('offlineTours', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Handle online/offline status changes
   */
  private handleOnlineStatusChange = () => {
    const wasOnline = this.isOnline;
    this.isOnline = navigator.onLine;
    
    // If we just came back online, trigger sync
    if (!wasOnline && this.isOnline) {
      this.syncOfflineActions();
    }
    
    // Notify listeners of the status change
    this.onlineListeners.forEach(listener => listener(this.isOnline));
  };

  /**
   * Sync offline actions when back online
   */
  private async syncOfflineActions(): Promise<void> {
    if (!this.db) return;
    
    try {
      // Request background sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-favorites');
        await registration.sync.register('sync-reviews');
      } else {
        // Fall back to manual sync
        await this.syncFavorites();
        await this.syncReviews();
      }
    } catch (error) {
      console.error('Failed to sync offline actions:', error);
    }
  }

  /**
   * Manually sync favorites
   */
  private async syncFavorites(): Promise<void> {
    if (!this.db) return;
    
    try {
      const offlineFavorites = await this.db.getAll('offlineFavorites') as OfflineFavorite[];
      
      for (const item of offlineFavorites) {
        try {
          if (item.action === 'add') {
            await fetch(`/api/favorites/tours/${item.tourId}`, { method: 'POST' });
          } else if (item.action === 'remove') {
            await fetch(`/api/favorites/tours/${item.tourId}`, { method: 'DELETE' });
          }
          
          // Remove from offline store after successful sync
          if (item.id) {
            await this.db.delete('offlineFavorites', item.id);
          }
        } catch (error) {
          console.error('Failed to sync favorite:', error);
        }
      }
    } catch (error) {
      console.error('Failed to get offline favorites:', error);
    }
  }

  /**
   * Manually sync reviews
   */
  private async syncReviews(): Promise<void> {
    if (!this.db) return;
    
    try {
      const offlineReviews = await this.db.getAll('offlineReviews') as OfflineReview[];
      
      for (const review of offlineReviews) {
        try {
          await fetch('/api/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(review.data)
          });
          
          // Remove from offline store after successful sync
          if (review.id) {
            await this.db.delete('offlineReviews', review.id);
          }
        } catch (error) {
          console.error('Failed to sync review:', error);
        }
      }
    } catch (error) {
      console.error('Failed to get offline reviews:', error);
    }
  }

  /**
   * Check if the app is online
   */
  public isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Add a listener for online status changes
   */
  public addOnlineStatusListener(listener: (online: boolean) => void): void {
    this.onlineListeners.push(listener);
  }

  /**
   * Remove a listener for online status changes
   */
  public removeOnlineStatusListener(listener: (online: boolean) => void): void {
    this.onlineListeners = this.onlineListeners.filter(l => l !== listener);
  }

  /**
   * Save a tour for offline access
   */
  public async saveTourOffline(tour: Tour): Promise<void> {
    if (!this.db) return;
    
    try {
      await this.db.put('offlineTours', tour);
      console.log(`Tour ${tour.name} saved for offline access`);
    } catch (error) {
      console.error('Failed to save tour offline:', error);
    }
  }

  /**
   * Get a tour from offline storage
   */
  public async getOfflineTour(tourId: string): Promise<Tour | null> {
    if (!this.db) return null;
    
    try {
      const tour = await this.db.get('offlineTours', tourId);
      return tour || null;
    } catch (error) {
      console.error('Failed to get offline tour:', error);
      return null;
    }
  }

  /**
   * Get all offline tours
   */
  public async getAllOfflineTours(): Promise<Tour[]> {
    if (!this.db) return [];
    
    try {
      return await this.db.getAll('offlineTours');
    } catch (error) {
      console.error('Failed to get all offline tours:', error);
      return [];
    }
  }

  /**
   * Save a favorite action for offline sync
   */
  public async saveFavoriteAction(tourId: string, action: 'add' | 'remove'): Promise<void> {
    if (!this.db) return;
    
    try {
      await this.db.put('offlineFavorites', {
        tourId,
        action,
        timestamp: Date.now()
      });
      
      console.log(`Favorite action (${action}) for tour ${tourId} saved for offline sync`);
    } catch (error) {
      console.error('Failed to save favorite action offline:', error);
    }
  }

  /**
   * Save a review for offline sync
   */
  public async saveReviewOffline(reviewData: any): Promise<void> {
    if (!this.db) return;
    
    try {
      await this.db.put('offlineReviews', {
        data: reviewData,
        timestamp: Date.now()
      });
      
      console.log('Review saved for offline sync');
    } catch (error) {
      console.error('Failed to save review offline:', error);
    }
  }

  /**
   * Register the service worker
   */
  public static async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered with scope:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
}

// Create a singleton instance
const offlineService = new OfflineService();

export default offlineService;
