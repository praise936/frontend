// sw.js — Service Worker for PWA offline support

const CACHE_NAME = 'foodcourt-v1'

// Files to cache for offline use
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
]

// Install — cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    // Activate immediately without waiting
    self.skipWaiting()
})

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    )
    self.clients.claim()
})

// Fetch — serve from cache if offline, otherwise network first
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and API calls — those must always be live
    if (
        event.request.method !== 'GET' ||
        event.request.url.includes('/api/') ||
        event.request.url.includes('/media/')
    ) {
        return
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache a copy of the response
                const clone = response.clone()
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
                return response
            })
            .catch(() => {
                // If network fails, try serving from cache
                return caches.match(event.request)
            })
    )
})