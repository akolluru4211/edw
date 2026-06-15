/**
 * Push Notification Helper Library
 *
 * Handles:
 *  - Browser Notification API permission requests
 *  - FCM token registration (Chrome, Edge, Firefox, Android)
 *  - Web Push VAPID subscription (Safari 16.4+ / Firefox fallback)
 *  - Service Worker registration
 *  - Token registration with backend
 */

import { api } from './api';

// ── VAPID Public Key ────────────────────────────────────────────────────────
// Get this from: Firebase Console → Project Settings → Cloud Messaging
// → Web configuration → Generate key pair
// Replace this placeholder with your actual VAPID public key
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BEZ-1zq7QK9IOSOawrHCMrLgIi6SPrigjttU0_pb7_pgMsmD8P9FylabelhIAWkFoVzlUW8ldXuaqLX9X2G0_VI';


// ── Convert VAPID key to Uint8Array ────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── Permission state ────────────────────────────────────────────────────────
export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function getPermissionState(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
}

// ── Request browser notification permission ─────────────────────────────────
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

// ── Register Service Worker ─────────────────────────────────────────────────
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.error('[notifications] Service worker registration failed:', err);
    return null;
  }
}

// ── Get FCM Registration Token ──────────────────────────────────────────────
export async function getFCMToken(): Promise<string | null> {
  try {
    const { getFirebaseMessaging } = await import('./firebase');
    const { getToken } = await import('firebase/messaging');

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('[notifications] FCM not supported in this browser.');
      return null;
    }

    const swReg = await registerServiceWorker();
    if (!swReg) return null;

    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: swReg
    });

    return token || null;
  } catch (err: any) {
    console.error('[notifications] Failed to get FCM token:', err);
    if (err?.message?.includes('authentication credential') || err?.message?.includes('subscribe-failed') || err?.code?.includes('subscribe-failed')) {
      console.warn('[notifications] FCM Subscription Error: This error typically means that the Firebase API key in Google Cloud Console is restricted (needs "FCM Registration API" and "Firebase Cloud Messaging API" enabled) or the VAPID Public Key is mismatched with the project.');
    }
    return null;
  }

}

// ── Register token with backend ─────────────────────────────────────────────
export async function registerTokenWithBackend(token: string): Promise<void> {
  try {
    await api.post('/notifications/subscribe', {
      token,
      platform: getPlatform(),
      userAgent: navigator.userAgent.slice(0, 200)
    });
  } catch (err) {
    console.error('[notifications] Failed to register token with backend:', err);
  }
}

// ── Unregister token from backend ──────────────────────────────────────────
export async function unregisterTokenFromBackend(token: string): Promise<void> {
  try {
    await api.delete('/notifications/unsubscribe', { data: { token } });
  } catch (err) {
    console.error('[notifications] Failed to unregister token:', err);
  }
}

// ── Full setup: permission + FCM token + backend registration ───────────────
export async function setupPushNotifications(): Promise<{
  success: boolean;
  token: string | null;
  permission: NotificationPermission;
}> {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return { success: false, token: null, permission };
  }

  const token = await getFCMToken();
  if (token) {
    await registerTokenWithBackend(token);
    localStorage.setItem('edworld_fcm_token', token);
  }

  return { success: !!token, token, permission };
}

// ── Detect platform ─────────────────────────────────────────────────────────
function getPlatform(): string {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'web';
}

// ── Show an immediate local notification ────────────────────────────────────
export function showLocalNotification(title: string, body: string, url?: string): void {
  if (typeof window === 'undefined' || Notification.permission !== 'granted') return;
  try {
    const n = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/badge-96.png',
      tag: 'edworld-local',
      silent: false
    });
    if (url) {
      n.onclick = () => {
        window.focus();
        window.location.href = url;
        n.close();
      };
    }
  } catch {
    // Some browsers (Safari older) don't support Notification constructor
  }
}
