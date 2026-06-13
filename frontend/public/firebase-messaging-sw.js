// Firebase Cloud Messaging Service Worker
// This file MUST be at /public/firebase-messaging-sw.js for FCM to work.
// It handles background push messages when the app tab is not focused.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Firebase config — must match frontend/src/lib/firebase.ts
firebase.initializeApp({
  apiKey: "AIzaSyC5MncM9ZFvQTHG-yYLwBmFfipB2hf3B7o",
  authDomain: "edworld-career-os-2026.firebaseapp.com",
  projectId: "edworld-career-os-2026",
  storageBucket: "edworld-career-os-2026.firebasestorage.app",
  messagingSenderId: "850137062639",
  appId: "1:850137062639:web:a23718e64df90a4e944f1a"
});

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Edworld Co.';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification.',
    icon: payload.notification?.icon || '/icon-192.png',
    badge: '/badge-96.png',
    image: payload.notification?.image,
    data: payload.data || {},
    tag: payload.data?.type || 'edworld-notification',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: '📖 Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  const fullUrl = self.location.origin + url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if already open
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.navigate(fullUrl);
          return client.focus();
        }
      }
      // Open new tab
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Service worker install + activate
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
