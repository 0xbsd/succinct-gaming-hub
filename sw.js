// Service Worker for ZK Gaming Hub
const CACHE_NAME = 'zk-gaming-hub-v1.2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/games.html',
    '/css/styles.css',
    '/js/zkapi-mock.js',
    // Add all your game HTML files and images as needed
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
