// Service Worker for TourGuide App
const CACHE_NAME = 'tourguide-cache-v1';
const RUNTIME_CACHE = 'tourguide-runtime-v1';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/static/images/offline-map.jpg',
  '/static/images/offline-placeholder.jpg'
];

// Install event - precache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    // API requests - use network first, then cache
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(event.request)
            .then(response => {
              // If valid response, clone and cache it
              if (response && response.status === 200) {
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // If network fails, try to serve from cache
              return cache.match(event.request)
                .then(cachedResponse => {
                  if (cachedResponse) {
                    return cachedResponse;
                  }
                  
                  // For tour API requests, return a default offline response
                  if (event.request.url.includes('/api/tours')) {
                    return cache.match('/api/offline-tours');
                  }
                  
                  // For other API requests, return a generic offline response
                  return new Response(JSON.stringify({ 
                    error: 'You are offline',
                    offline: true 
                  }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                });
            });
        })
      );
    } 
    // HTML requests - use network first, then cache, then offline page
    else if (event.request.mode === 'navigate' || 
             (event.request.method === 'GET' && 
              event.request.headers.get('accept').includes('text/html'))) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Cache the latest version
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(event.request, response.clone());
            });
            return response;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                // If not in cache, serve the offline page
                return caches.match('/offline.html');
              });
          })
      );
    }
    // Images - use cache first, then network
    else if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            return fetch(event.request)
              .then(response => {
                // Cache the fetched image
                caches.open(RUNTIME_CACHE).then(cache => {
                  cache.put(event.request, response.clone());
                });
                return response;
              })
              .catch(() => {
                // If image can't be fetched, return placeholder
                if (event.request.url.includes('map')) {
                  return caches.match('/static/images/offline-map.jpg');
                }
                return caches.match('/static/images/offline-placeholder.jpg');
              });
          })
      );
    }
    // Other assets - use cache first, then network
    else {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            return fetch(event.request)
              .then(response => {
                // Cache the fetched resource
                if (response && response.status === 200) {
                  caches.open(RUNTIME_CACHE).then(cache => {
                    cache.put(event.request, response.clone());
                  });
                }
                return response;
              });
          })
      );
    }
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  } else if (event.tag === 'sync-reviews') {
    event.waitUntil(syncReviews());
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Sync favorites when back online
async function syncFavorites() {
  const db = await openDB();
  const offlineFavorites = await db.getAll('offlineFavorites');
  
  for (const item of offlineFavorites) {
    try {
      if (item.action === 'add') {
        await fetch(`/api/favorites/tours/${item.tourId}`, { method: 'POST' });
      } else if (item.action === 'remove') {
        await fetch(`/api/favorites/tours/${item.tourId}`, { method: 'DELETE' });
      }
      
      // Remove from offline store after successful sync
      await db.delete('offlineFavorites', item.id);
    } catch (error) {
      console.error('Failed to sync favorite:', error);
    }
  }
}

// Sync reviews when back online
async function syncReviews() {
  const db = await openDB();
  const offlineReviews = await db.getAll('offlineReviews');
  
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
      await db.delete('offlineReviews', review.id);
    } catch (error) {
      console.error('Failed to sync review:', error);
    }
  }
}

// Simple IndexedDB wrapper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TourGuideOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      
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
