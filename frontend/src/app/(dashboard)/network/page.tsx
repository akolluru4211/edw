'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api, BACKEND_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users, MessageSquare, UserPlus, Send, GraduationCap,
  RefreshCw, Check, Clock, X, ChevronLeft, Lock, Sparkles, MapPin, Compass
} from 'lucide-react';
import { encryptHybrid, decryptHybrid, importPublicKey } from '@/lib/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Peer {
  id: string;
  fullName: string;
  role: string;
  collegeName: string;
  degree: string;
  branch: string;
  graduationYear: number;
  score: number;
  status: 'CONNECT' | 'PENDING' | 'RECEIVED' | 'CONNECTED';
  avatarUrl?: string | null;
  memberId?: string;
  publicKey?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number | null;
  portfolioUrl?: string | null;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  textForSender?: string | null;
  textForReceiver?: string | null;
  createdAt: string;
  decryptedText?: string;
}

// Haversine formula to calculate distance in km
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function PeerCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-pulse">
      <div className="h-12 w-12 rounded-2xl bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-4 w-28 bg-slate-100 rounded" />
          <div className="h-4.5 w-14 bg-slate-50 rounded-full" />
          <div className="h-4.5 w-16 bg-slate-50 rounded" />
        </div>
        <div className="h-3.5 w-3/4 bg-slate-100 rounded" />
        <div className="h-3 w-1/2 bg-slate-50 rounded" />
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
        <div className="h-9 w-20 bg-slate-100 rounded-xl" />
        <div className="h-9 w-24 bg-slate-50 rounded-xl" />
      </div>
    </div>
  );
}

export default function NetworkingHub() {
  const { user, decryptedPrivateKey } = useAuth();
  const [peers, setPeers] = useState<Peer[]>([]);
  const [chatTarget, setChatTarget] = useState<Peer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msg, setMsg] = useState('');
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Geolocation States
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize location from user profile if already saved
  useEffect(() => {
    if (user?.profile?.latitude != null && user?.profile?.longitude != null) {
      setUserLocation({
        latitude: user.profile.latitude,
        longitude: user.profile.longitude
      });
    }
  }, [user]);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setRequestingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setRequestingLocation(false);

        // Update profile in backend / supabase
        try {
          await api.put('/profile', { latitude, longitude });
        } catch (err) {
          console.error("Failed to save location coordinates:", err);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setRequestingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Permission denied. Enable location access in browser settings to view nearby peers.");
        } else {
          setLocationError("Failed to retrieve location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Sort peers by distance if location is available
  const sortedPeers = React.useMemo(() => {
    if (!userLocation) {
      return peers;
    }

    return [...peers]
      .map(peer => {
        let distance: number | null = null;
        if (peer.latitude != null && peer.longitude != null) {
          distance = calculateHaversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            peer.latitude,
            peer.longitude
          );
        }
        return { ...peer, distance };
      })
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return b.score - a.score;
      });
  }, [peers, userLocation]);

  const formatDistance = (dist: number) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m away`;
    }
    return `${dist.toFixed(1)} km away`;
  };

  const decryptMessages = async (rawMessages: any[], myPrivateKey: CryptoKey | null) => {
    return await Promise.all(
      rawMessages.map(async (m) => {
        const mine = m.senderId === user?.id;
        const cipher = mine ? m.textForSender : m.textForReceiver;
        if (cipher && myPrivateKey) {
          try {
            const plaintext = await decryptHybrid(cipher, myPrivateKey);
            return { ...m, decryptedText: plaintext };
          } catch (err) {
            console.error('Failed to decrypt message:', err);
            return { ...m, decryptedText: '[Decryption Error]' };
          }
        }
        return { ...m, decryptedText: m.text };
      })
    );
  };

  const fetchPeers = async () => {
    setLoadingPeers(true);
    try {
      const res = await api.get('/network/suggestions');
      setPeers(res.data);
    } catch (e) { console.error(e); } finally { setLoadingPeers(false); }
  };

  useEffect(() => { fetchPeers(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Re-decrypt messages if private key becomes available or changes
  useEffect(() => {
    if (messages.length > 0 && decryptedPrivateKey) {
      const reDecrypt = async () => {
        const decrypted = await decryptMessages(messages, decryptedPrivateKey);
        let changed = false;
        for (let i = 0; i < messages.length; i++) {
          if (messages[i].decryptedText !== decrypted[i].decryptedText) {
            changed = true;
            break;
          }
        }
        if (changed) {
          setMessages(decrypted);
        }
      };
      reDecrypt();
    }
  }, [decryptedPrivateKey]);

  const connect = async (peerId: string) => {
    setPeers(p => p.map(x => x.id === peerId ? { ...x, status: 'PENDING' } : x));
    try {
      await api.post(`/network/connect/${peerId}`);
      fetchPeers();
    } catch {
      fetchPeers();
    }
  };

  const acceptConnection = async (peerId: string) => {
    try {
      await api.post(`/network/accept/${peerId}`);
      fetchPeers();
      // If we are currently chatting with this user, update active chat target status
      if (chatTarget && chatTarget.id === peerId) {
        setChatTarget(prev => prev ? { ...prev, status: 'CONNECTED' } : null);
      }
    } catch (err) {
      console.error('Failed to accept connection:', err);
    }
  };

  const openChat = async (peer: Peer) => {
    setChatTarget(peer);
    setShowChat(true);
    try {
      const res = await api.get(`/network/messages/${peer.id}`);
      const decrypted = await decryptMessages(res.data, decryptedPrivateKey);
      setMessages(decrypted);
    } catch { setMessages([]); }
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || !chatTarget || sending) return;
    setSending(true);
    const text = msg.trim();
    setMsg('');
    try {
      const payload: any = { receiverId: chatTarget.id };

      // Encrypt message hybrid if keys are available
      if (chatTarget.publicKey && decryptedPrivateKey && user?.publicKey) {
        try {
          const peerPublicKeyCrypto = await importPublicKey(chatTarget.publicKey);
          const myPublicKeyCrypto = await importPublicKey(user.publicKey);

          const textForReceiver = await encryptHybrid(text, peerPublicKeyCrypto);
          const textForSender = await encryptHybrid(text, myPublicKeyCrypto);

          payload.textForReceiver = textForReceiver;
          payload.textForSender = textForSender;
          payload.text = '[Encrypted Message]';
        } catch (err) {
          console.error('Crypto encryption failed, falling back to plaintext:', err);
          payload.text = text;
        }
      } else {
        payload.text = text;
      }

      const res = await api.post('/network/messages', payload);
      const [decryptedSingle] = await decryptMessages([res.data], decryptedPrivateKey);
      setMessages(prev => [...prev, decryptedSingle]);
    } catch (e) { console.error(e); } finally { setSending(false); }
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const roleColors: Record<string, string> = {
    STUDENT: 'bg-sky-50 text-sky-700 border-sky-100 dark:border-sky-800/20',
    ALUMNI: 'bg-violet-50 text-violet-700 border-violet-100 dark:border-violet-800/20',
    MENTOR: 'bg-amber-50 text-amber-700 border-amber-100 dark:border-amber-800/20',
  };

  const matchScoreGradient = (score: number) => {
    if (score >= 85) return 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-100/50';
    if (score >= 65) return 'from-sky-500/10 to-blue-500/10 text-sky-700 border-sky-100/50';
    return 'from-slate-50 to-slate-100 text-slate-600 border-slate-200/50';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Connection Circle</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Connect and message securely with students, alumni, and mentors</p>
        </div>
        <button
          onClick={fetchPeers}
          className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-950 font-bold text-xs rounded-xl bg-white shadow-sm transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loadingPeers ? 'animate-spin' : ''}`} />
          Refresh suggestions
        </button>
      </div>

      {/* Geolocation Banner */}
      {!userLocation && (
        <div className="bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg shadow-sky-600/15 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                <Compass className="h-5 w-5 animate-pulse text-sky-200" />
                Find Proximity Connections
              </h3>
              <p className="text-xs text-sky-50 leading-relaxed max-w-xl font-medium">
                Prioritize peers nearest to your campus. Enable location permissions to calculate distances and automatically show local alumni and students at the top of your suggested feed.
              </p>
              {locationError && (
                <p className="text-[11px] text-amber-200 font-bold bg-white/10 px-3 py-1 rounded-lg w-fit mt-1">{locationError}</p>
              )}
            </div>
            <button
              onClick={requestLocationPermission}
              disabled={requestingLocation}
              className="bg-white hover:bg-sky-50 disabled:bg-white/40 text-sky-700 disabled:text-sky-900 border-none px-5 py-3 rounded-xl text-xs font-black tracking-tight transition-all shadow-md select-none shrink-0 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              {requestingLocation ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Share Campus Location</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Peers List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-700 text-sm">{peers.length} students suggested</span>
            {userLocation && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/60 px-2.5 py-0.5 rounded-full text-[10px]">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                📍 Nearby sorted first
              </span>
            )}
          </div>

          {loadingPeers ? (
            <div className="space-y-4">
              <PeerCardSkeleton />
              <PeerCardSkeleton />
              <PeerCardSkeleton />
            </div>
          ) : sortedPeers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl py-20 px-6 text-center shadow-sm">
              <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-slate-700 font-bold text-sm">Your Circle is Complete</p>
              <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto">There are no peer recommendations at this time. Check back later as more students register!</p>
            </div>
          ) : (
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedPeers.map(peer => (
                  <motion.div
                    key={peer.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md hover:border-slate-300 transition-all duration-300"
                  >
                    {/* Avatar */}
                    <Link href={`/u/${peer.portfolioUrl || peer.id}`} target="_blank" className="hover:opacity-85 transition-opacity shrink-0">
                      {peer.avatarUrl ? (
                        <img
                          src={peer.avatarUrl.startsWith('http') ? peer.avatarUrl : `${BACKEND_URL}${peer.avatarUrl}`}
                          alt={peer.fullName}
                          className="h-12 w-12 rounded-2xl object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-blue-600 text-white font-black text-base flex items-center justify-center shadow-sm shadow-blue-500/10">
                          {initials(peer.fullName)}
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/u/${peer.portfolioUrl || peer.id}`} target="_blank" className="hover:text-sky-600 transition-colors">
                          <p className="font-bold text-slate-900 text-base tracking-tight">{peer.fullName}</p>
                        </Link>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${roleColors[peer.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {peer.role}
                        </span>
                        {peer.memberId && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded">
                            {peer.memberId}
                          </span>
                        )}
                        {peer.publicKey && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="End-to-End Encrypted Messaging Enabled">
                            <Lock className="h-2.5 w-2.5" /> E2EE
                          </span>
                        )}
                      </div>
                      {peer.collegeName && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1 font-medium">
                          <GraduationCap className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                          <span className="truncate">{peer.degree} in {peer.branch} · {peer.collegeName}</span>
                        </div>
                      )}
                      
                      <div className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-2 flex-wrap font-medium">
                        <div className={`inline-flex items-center gap-1 bg-gradient-to-r ${matchScoreGradient(peer.score)} font-bold px-2 py-0.5 rounded-full border text-[10px]`}>
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span>{peer.score}% Match</span>
                        </div>
                        {peer.distance !== undefined && peer.distance !== null && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50/80 border border-emerald-100/50 px-2 py-0.5 rounded-full text-[10px] shadow-sm shadow-emerald-50/20">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                              </span>
                              <span>{formatDistance(peer.distance)}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 mt-3 sm:mt-0">
                      <button
                        onClick={() => openChat(peer)}
                        className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 border rounded-xl text-xs font-bold transition-all shadow-sm ${
                          chatTarget?.id === peer.id 
                            ? 'bg-slate-100 border-slate-300 text-slate-800' 
                            : 'bg-white border-slate-200 hover:border-sky-300 hover:text-sky-600 text-slate-600'
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Message</span>
                      </button>

                      {peer.status === 'CONNECTED' ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50/60 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                          <Check className="h-3.5 w-3.5 text-emerald-600" /> Connected
                        </span>
                      ) : peer.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      ) : peer.status === 'RECEIVED' ? (
                        <button
                          onClick={() => acceptConnection(peer.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md hover:shadow transition-all"
                        >
                          <Check className="h-3.5 w-3.5" /> Accept Request
                        </button>
                      ) : (
                        <button
                          onClick={() => connect(peer.id)}
                          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow transition-all cursor-pointer"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Connect
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* DM Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm" style={{ height: '540px' }}>
            <AnimatePresence mode="wait">
              {chatTarget ? (
                <motion.div
                  key={chatTarget.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  {/* Chat header */}
                  <div className="h-16 border-b border-slate-100 flex items-center gap-3 px-4 shrink-0 bg-slate-50/30">
                    <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors lg:hidden">
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>
                    {chatTarget.avatarUrl ? (
                      <img
                        src={chatTarget.avatarUrl.startsWith('http') ? chatTarget.avatarUrl : `${BACKEND_URL}${chatTarget.avatarUrl}`}
                        alt={chatTarget.fullName}
                        className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-150"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {initials(chatTarget.fullName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-800 text-sm truncate">{chatTarget.fullName}</p>
                        {chatTarget.publicKey && (
                          <span title="E2EE Security Lock Activated">
                            <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1.5 font-bold">
                        <span>{chatTarget.role.toLowerCase()}</span>
                        {chatTarget.publicKey && (
                          <span className="text-[8px] text-emerald-600 font-extrabold lowercase tracking-wider bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100/60 flex items-center gap-0.5">
                            <Check className="h-2 w-2" /> secure channel
                          </span>
                        )}
                      </p>
                    </div>
                    <button onClick={() => { setChatTarget(null); setMessages([]); }} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent to-slate-50/15">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-8">
                        <div className="h-12 w-12 bg-sky-50 border border-sky-100/60 rounded-xl flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-sky-500" />
                        </div>
                        <p className="text-slate-700 text-sm font-bold">Safe & Private Chat</p>
                        <p className="text-slate-400 text-xs px-6 leading-relaxed max-w-[240px]">Messages are encrypted. Send a hello to begin your conversation!</p>
                      </div>
                    ) : messages.map(m => {
                      const mine = m.senderId === user?.id;
                      const isEncrypted = !!(mine ? m.textForSender : m.textForReceiver);
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            mine 
                              ? 'bg-gradient-to-br from-sky-600 to-blue-600 text-white rounded-br-sm font-medium' 
                              : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200/50'
                          }`}>
                            <div className="flex items-end justify-between gap-3 flex-wrap">
                              <span className="break-words">{m.decryptedText || m.text}</span>
                              {isEncrypted && (
                                <span title="End-to-End Encrypted Security">
                                  <Lock className={`h-3 w-3 shrink-0 mb-0.5 ${mine ? 'text-sky-300' : 'text-slate-400'}`} />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={endRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/20">
                    <form onSubmit={sendMsg} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        placeholder={chatTarget.publicKey ? "Message securely (E2EE)..." : "Type a message..."}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!msg.trim() || sending}
                        className="p-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl shadow-[0_3px_0_0_#0284c7] disabled:shadow-none active:translate-y-0.5 active:shadow-none transition-all shrink-0 cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 p-8 bg-gradient-to-b from-transparent to-slate-50/20">
                  <div className="h-14 w-14 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center shadow-inner">
                    <MessageSquare className="h-6 w-6 text-slate-350" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-700 text-sm tracking-tight">Your secure workspace chat</p>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-[240px] mx-auto font-medium">Click "Message" on any card to start an end-to-end encrypted direct messaging channel.</p>
                  </div>
                  
                  {/* Quick Starter Tips */}
                  <div className="w-full mt-4 text-left border border-slate-100 bg-slate-50/40 rounded-xl p-3.5 space-y-2 max-w-[260px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Conversation Starters</span>
                    <ul className="text-[11px] font-medium text-slate-500 space-y-2 list-none p-0 m-0">
                      <li className="flex gap-1.5">
                        <span className="text-sky-500">👋</span>
                        <span>Ask peers about their branch focus or internships.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-emerald-500">🚀</span>
                        <span>Discuss campus projects, hackathons, or clubs.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-amber-500">💡</span>
                        <span>Collaborate on resume reviews or mock interviews.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
