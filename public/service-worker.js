// Service Worker for Not a Label PWA
const CACHE_NAME = 'not-a-label-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/music',
  '/dashboard/analytics',
  '/manifest.json',
  '/offline.html'
];

// Music cache for offline playback
const MUSIC_CACHE = 'music-cache-v1';
const MAX_MUSIC_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

// Install event - cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== MUSIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Return cached data when offline
          return caches.match(request);
        })
    );
    return;
  }

  // Handle music files
  if (url.pathname.startsWith('/music/') || url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(MUSIC_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            return response;
          }
          
          return fetch(request).then(response => {
            // Only cache successful responses
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Background sync for uploading music
self.addEventListener('sync', event => {
  if (event.tag === 'upload-music') {
    event.waitUntil(uploadPendingMusic());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Not a Label',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Not a Label', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard/notifications')
    );
  }
});

// Message handler for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_MUSIC') {
    cacheMusic(event.data.url);
  }
  
  if (event.data && event.data.type === 'CLEAR_MUSIC_CACHE') {
    clearMusicCache();
  }
});

// Helper functions
async function uploadPendingMusic() {
  const cache = await caches.open('pending-uploads');
  const requests = await cache.keys();
  
  return Promise.all(
    requests.map(async request => {
      const response = await cache.match(request);
      const data = await response.json();
      
      try {
        const uploadResponse = await fetch('/api/music/upload', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (uploadResponse.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('Failed to upload:', error);
      }
    })
  );
}

async function cacheMusic(url) {
  const cache = await caches.open(MUSIC_CACHE);
  try {
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response);
    }
  } catch (error) {
    console.error('Failed to cache music:', error);
  }
}

async function clearMusicCache() {
  await caches.delete(MUSIC_CACHE);
}