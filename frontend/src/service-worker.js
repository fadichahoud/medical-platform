import { Workbox } from 'workbox-window';

const CACHE_NAME = 'medical-cache-v2';
const OFFLINE_URL = '/offline.html';
const API_CACHE = 'api-cache-v1';

const precacheResources = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  OFFLINE_URL
];

// Registrar el service worker
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');
    
    wb.addEventListener('activated', event => {
      if (!event.isUpdate) {
        console.log('Service Worker activado por primera vez!');
      }
    });
    
    wb.addEventListener('waiting', event => {
      if (confirm("¡Nueva versión disponible! ¿Actualizar ahora?")) {
        wb.addEventListener('controlling', () => {
          window.location.reload();
        });
        wb.messageSkipWaiting();
      }
    });
    
    wb.register();
  }
};

// Código del service worker
if (typeof self !== 'undefined') {
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(precacheResources))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME && cache !== API_CACHE) {
              return caches.delete(cache);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    // Priorizar API para datos médicos
    if (event.request.url.includes('/api/medical')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(event.request, clone));
            return response;
          })
          .catch(() => caches.match(event.request))
      );
      return;
    }
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200) return response;
              
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone));
              
              return response;
            })
            .catch(() => {
              if (event.request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
              }
              return new Response('Offline', { status: 503 });
            });
        })
    );
  });
}