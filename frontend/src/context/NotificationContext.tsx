'use client';

import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode
} from 'react';
import { useAuth } from './AuthContext';
import {
  setupPushNotifications,
  getFCMToken,
  unregisterTokenFromBackend,
  getPermissionState,
  showLocalNotification,
  type NotificationPermissionState
} from '@/lib/notifications';
import { api } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  type?: string;
  url?: string;
  timestamp: number;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sentAt: string;
  read: boolean;
}

interface NotificationContextType {
  permission: NotificationPermissionState;
  isSubscribed: boolean;
  toasts: ToastNotification[];
  history: NotificationHistoryItem[];
  unreadCount: number;
  requestPermission: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
  markRead: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const fcmListenerRef = useRef<(() => void) | null>(null);

  const unreadCount = history.filter(n => !n.read).length;

  // ── Update permission state on mount ──────────────────────────────────
  useEffect(() => {
    setPermission(getPermissionState());
  }, []);

  // ── Auto-setup FCM when user logs in ──────────────────────────────────
  useEffect(() => {
    if (!user) {
      // Cleanup foreground listener on logout
      if (fcmListenerRef.current) {
        fcmListenerRef.current();
        fcmListenerRef.current = null;
      }
      setIsSubscribed(false);
      return;
    }

    const autoSetup = async () => {
      // Skip if already denied by user
      const currentPerm = getPermissionState();
      setPermission(currentPerm);
      if (currentPerm === 'denied' || currentPerm === 'unsupported') return;

      // If previously granted, silently resubscribe
      if (currentPerm === 'granted') {
        const token = await getFCMToken();
        if (token) {
          const { registerTokenWithBackend } = await import('@/lib/notifications');
          await registerTokenWithBackend(token);
          localStorage.setItem('edworld_fcm_token', token);
          setIsSubscribed(true);
          setupForegroundListener();
        }
      }
    };

    autoSetup();
    refreshHistory();
  }, [user?.id]);

  // ── Foreground FCM message listener ───────────────────────────────────
  const setupForegroundListener = useCallback(async () => {
    try {
      const { getFirebaseMessaging } = await import('@/lib/firebase');
      const { onMessage } = await import('firebase/messaging');

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      // Cleanup previous listener
      if (fcmListenerRef.current) fcmListenerRef.current();

      const unsubscribeFn = onMessage(messaging, (payload) => {
        console.log('[NotificationContext] Foreground FCM message:', payload);

        const title = payload.notification?.title || 'Edworld Co.';
        const body = payload.notification?.body || '';
        const type = payload.data?.type || 'general';
        const url = payload.data?.url;

        // Add to toast queue
        const toast: ToastNotification = {
          id: `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          title,
          body,
          type,
          url,
          timestamp: Date.now()
        };
        setToasts(prev => [toast, ...prev].slice(0, 5)); // max 5 toasts

        // Also refresh history
        refreshHistory();

        // Auto-dismiss after 6s
        setTimeout(() => dismissToast(toast.id), 6000);
      });

      fcmListenerRef.current = unsubscribeFn;
    } catch (err) {
      console.error('[NotificationContext] Failed to set up foreground listener:', err);
    }
  }, []);

  // ── Request Permission ─────────────────────────────────────────────────
  const requestPermission = async () => {
    const result = await setupPushNotifications();
    setPermission(result.permission as NotificationPermissionState);
    setIsSubscribed(result.success);
    if (result.success) {
      setupForegroundListener();
    } else if (result.permission === 'granted') {
      const errorToast: ToastNotification = {
        id: `toast_fcm_error_${Date.now()}`,
        title: 'Push Subscription Mismatch',
        body: 'Browser permission was granted, but FCM subscription failed. Please verify that your API key restrictions and VAPID certificates match the Firebase Console settings.',
        type: 'general',
        timestamp: Date.now()
      };
      setToasts(prev => [errorToast, ...prev]);
      setTimeout(() => dismissToast(errorToast.id), 8000);
    }
  };


  // ── Unsubscribe ────────────────────────────────────────────────────────
  const unsubscribe = async () => {
    const token = localStorage.getItem('edworld_fcm_token');
    if (token) {
      await unregisterTokenFromBackend(token);
      localStorage.removeItem('edworld_fcm_token');
    }
    if (fcmListenerRef.current) {
      fcmListenerRef.current();
      fcmListenerRef.current = null;
    }
    setIsSubscribed(false);
  };

  // ── Toast management ───────────────────────────────────────────────────
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // ── History ────────────────────────────────────────────────────────────
  const refreshHistory = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/history');
      setHistory(res.data);
    } catch {
      // Silently fail — user may not have any notifications yet
    }
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/history/${id}/read`);
      setHistory(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      console.error('Failed to mark notification as read');
    }
  }, []);

  // ── Test notification ──────────────────────────────────────────────────
  const sendTestNotification = async () => {
    try {
      await api.post('/notifications/test');
      // Also show a local one immediately for quick feedback
      showLocalNotification(
        '🚀 Test Push Sent!',
        'If you see this, your push notifications are fully working.',
        '/notifications'
      );
    } catch {
      console.error('Failed to send test notification');
    }
  };

  return (
    <NotificationContext.Provider value={{
      permission,
      isSubscribed,
      toasts,
      history,
      unreadCount,
      requestPermission,
      unsubscribe,
      dismissToast,
      dismissAllToasts,
      markRead,
      refreshHistory,
      sendTestNotification
    }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  );
}

// ── Toast UI Component ─────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss
}: {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  const typeIcon: Record<string, string> = {
    direct_message: '💬',
    connection_request: '👋',
    connection_accepted: '🎉',
    test: '🚀',
    general: '🔔'
  };

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 bg-white border border-slate-200 shadow-xl shadow-slate-200/60 rounded-2xl p-4 min-w-[300px] max-w-[360px] animate-slide-in"
          style={{ animation: 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-base shrink-0">
            {typeIcon[toast.type || 'general']}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm leading-snug">{toast.title}</p>
            <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{toast.body}</p>
            {toast.url && (
              <a
                href={toast.url}
                className="text-sky-600 text-xs font-semibold mt-1 hover:underline block"
              >
                View →
              </a>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 ml-1 shrink-0 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)  scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
