'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import {
  Bell, BellOff, BellRing, Check, X, Smartphone, Globe,
  MessageSquare, UserPlus, Megaphone, Sparkles, Shield,
  Send, Clock, RefreshCw, ChevronRight, CheckCheck, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface DeviceInfo {
  platform: string;
  userAgent: string;
  createdAt: string;
}

interface StatusData {
  subscribed: boolean;
  deviceCount: number;
  devices: DeviceInfo[];
}

export default function NotificationsPage() {
  const {
    permission,
    isSubscribed,
    history,
    unreadCount,
    requestPermission,
    unsubscribe,
    dismissAllToasts,
    markRead,
    refreshHistory,
    sendTestNotification
  } = useNotifications();

  const [status, setStatus] = useState<StatusData | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingPermission, setLoadingPermission] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    fetchStatus();
    refreshHistory();
  }, [isSubscribed]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/notifications/status');
      setStatus(res.data);
    } catch {
      // ignore
    }
  };

  const handleRequestPermission = async () => {
    setLoadingPermission(true);
    try {
      await requestPermission();
      await fetchStatus();
    } finally {
      setLoadingPermission(false);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
    await fetchStatus();
  };

  const handleTest = async () => {
    setLoadingTest(true);
    try {
      await sendTestNotification();
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } finally {
      setLoadingTest(false);
    }
  };

  const platformIcon = (platform: string) => {
    if (platform === 'ios') return '🍎';
    if (platform === 'android') return '🤖';
    return '🌐';
  };

  const notifTypeIcon: Record<string, string> = {
    direct_message: '💬',
    connection_request: '👋',
    connection_accepted: '🎉',
    test: '🚀',
    general: '🔔'
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Manage push alerts, device subscriptions, and notification history
        </p>
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 ${
          permission === 'granted' && isSubscribed
            ? 'bg-emerald-50 border-emerald-200/60'
            : permission === 'denied'
            ? 'bg-red-50 border-red-200/60'
            : 'bg-amber-50 border-amber-200/60'
        }`}
      >
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
          permission === 'granted' && isSubscribed
            ? 'bg-emerald-100'
            : permission === 'denied'
            ? 'bg-red-100'
            : 'bg-amber-100'
        }`}>
          {permission === 'granted' && isSubscribed ? (
            <BellRing className="h-6 w-6 text-emerald-600" />
          ) : permission === 'denied' ? (
            <BellOff className="h-6 w-6 text-red-500" />
          ) : (
            <Bell className="h-6 w-6 text-amber-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-extrabold text-sm ${
            permission === 'granted' && isSubscribed ? 'text-emerald-800' :
            permission === 'denied' ? 'text-red-800' : 'text-amber-800'
          }`}>
            {permission === 'granted' && isSubscribed
              ? '✅ Push notifications are active'
              : permission === 'denied'
              ? '🚫 Notifications blocked by browser'
              : '⚠️ Push notifications not enabled'}
          </p>
          <p className={`text-xs mt-0.5 font-medium ${
            permission === 'granted' && isSubscribed ? 'text-emerald-600' :
            permission === 'denied' ? 'text-red-500' : 'text-amber-600'
          }`}>
            {permission === 'granted' && isSubscribed
              ? `Receiving alerts on ${status?.deviceCount || 1} device${(status?.deviceCount || 1) > 1 ? 's' : ''} via Firebase Cloud Messaging`
              : permission === 'denied'
              ? 'Go to browser Site Settings → Notifications → Allow to re-enable'
              : 'Enable push to get alerts for messages, connections, and announcements'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {permission !== 'granted' && permission !== 'denied' && (
            <button
              onClick={handleRequestPermission}
              disabled={loadingPermission}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl text-xs font-black shadow-md transition-all"
            >
              {loadingPermission ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bell className="h-3.5 w-3.5" />
              )}
              Enable Now
            </button>
          )}
          {permission === 'granted' && isSubscribed && (
            <button
              onClick={handleTest}
              disabled={loadingTest || testSent}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-xs font-black shadow-md transition-all"
            >
              {testSent ? (
                <><Check className="h-3.5 w-3.5" /> Sent!</>
              ) : loadingTest ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <><Send className="h-3.5 w-3.5" /> Test Push</>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['overview', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'history' && unreadCount > 0
              ? `History (${unreadCount} new)`
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Notification Types */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="font-extrabold text-slate-800 text-sm">Notification Types</p>
                <p className="text-slate-400 text-xs mt-0.5">Push alerts are sent for these events</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { icon: '💬', title: 'Direct Messages', desc: 'When someone sends you a DM', channel: 'FCM + APNs' },
                  { icon: '👋', title: 'Connection Requests', desc: 'When a peer wants to connect', channel: 'FCM + APNs' },
                  { icon: '🎉', title: 'Connection Accepted', desc: 'When your request is accepted', channel: 'FCM + APNs' },
                  { icon: '📢', title: 'Community Posts', desc: 'New posts in topics you follow', channel: 'FCM + APNs' },
                  { icon: '✅', title: 'AI Coach Reports', desc: 'When your AI analysis is ready', channel: 'FCM + APNs' },
                  { icon: '⚠️', title: 'Subscription Alerts', desc: 'Plan expiry reminders', channel: 'FCM + APNs' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="text-xl w-8 text-center shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                      <p className="text-slate-400 text-xs">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                        {item.channel}
                      </span>
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        permission === 'granted' && isSubscribed ? 'bg-emerald-400' : 'bg-slate-200'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Support */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="font-extrabold text-slate-800 text-sm">Platform Support</p>
                <p className="text-slate-400 text-xs mt-0.5">How push notifications reach each platform</p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { icon: '🌐', name: 'Chrome / Edge', tech: 'Firebase Cloud Messaging (FCM)', status: 'Full Support' },
                  { icon: '🦊', name: 'Firefox', tech: 'Web Push (VAPID)', status: 'Full Support' },
                  { icon: '🍎', name: 'Safari macOS / iOS 16.4+', tech: 'Web Push via APNs', status: 'Full Support' },
                  { icon: '🤖', name: 'Android (Chrome)', tech: 'FCM — native', status: 'Full Support' },
                  { icon: '📱', name: 'iOS < 16.4', tech: 'Not supported by browser', status: 'Requires native app' },
                ].map((p, idx) => (
                  <div key={idx} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-xl w-8 text-center shrink-0">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                      <p className="text-slate-400 text-xs font-mono">{p.tech}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      p.status === 'Full Support'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-slate-500 bg-slate-50 border-slate-200'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registered Devices */}
            {status && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm">Registered Devices</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {status.subscribed ? `${status.deviceCount} device${status.deviceCount !== 1 ? 's' : ''} subscribed` : 'No devices registered'}
                    </p>
                  </div>
                  {status.subscribed && (
                    <button
                      onClick={handleUnsubscribe}
                      className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Unsubscribe
                    </button>
                  )}
                </div>
                {status.devices.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Smartphone className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-medium">No devices registered yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {status.devices.map((d, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-5 py-3">
                        <span className="text-xl shrink-0">{platformIcon(d.platform)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-700 text-xs capitalize">{d.platform} device</p>
                          <p className="text-slate-400 text-[10px] truncate">{d.userAgent}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex gap-3">
              <Shield className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-600">Privacy & Security: </span>
                Push notification tokens are encrypted in transit and stored securely in our Firestore database.
                Tokens are tied to your account and are automatically invalidated when you log out.
                We never share your token with third parties.
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* History header */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-600">
                {history.length > 0
                  ? `${history.length} notification${history.length !== 1 ? 's' : ''}`
                  : 'No notifications yet'}
              </p>
              {history.some(n => !n.read) && (
                <button
                  onClick={() => history.filter(n => !n.read).forEach(n => markRead(n.id))}
                  className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl py-16 px-6 text-center shadow-sm">
                <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-7 w-7 text-slate-300" />
                </div>
                <p className="font-bold text-slate-700 text-sm">No notifications yet</p>
                <p className="text-slate-400 text-xs mt-1.5 max-w-xs mx-auto">
                  When you receive push notifications they'll appear here. Enable notifications above and send a test!
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {history.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group ${
                      !notif.read ? 'bg-sky-50/30' : ''
                    }`}
                    onClick={() => !notif.read && markRead(notif.id)}
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 border border-sky-200/60 flex items-center justify-center text-base shrink-0">
                      {notifTypeIcon[notif.data?.type || 'general']}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${notif.read ? 'font-semibold text-slate-700' : 'font-extrabold text-slate-900'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-sky-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{notif.body}</p>
                      <p className="text-slate-400 text-[10px] mt-1.5 font-medium">
                        {new Date(notif.sentAt).toLocaleString()}
                      </p>
                    </div>
                    {notif.data?.url && (
                      <a
                        href={notif.data.url}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-all shrink-0 p-1 rounded-lg hover:bg-slate-100"
                        onClick={e => e.stopPropagation()}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
