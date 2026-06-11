'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users, MessageSquare, UserPlus, Send, GraduationCap,
  RefreshCw, Check, Clock, X, ChevronLeft, Lock
} from 'lucide-react';
import { encryptHybrid, decryptHybrid, importPublicKey } from '@/lib/crypto';

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
      return `${Math.round(dist * 1000)} m away`;
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
    STUDENT: 'bg-sky-50 text-sky-700 border-sky-200',
    ALUMNI: 'bg-violet-50 text-violet-700 border-violet-200',
    MENTOR: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Connection Circle</h1>
        <p className="text-slate-500 text-sm mt-1">Connect with students, alumni, and mentors from your field</p>
      </div>

      {/* Geolocation Banner */}
      {!userLocation && (
        <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-indigo-500/10 border border-sky-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span>📍</span>
              <span>Find Nearby Connections</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Enable location permissions to prioritize connections nearest to you. Your coordinates will be securely saved to show local students, alumni, and mentors at the top of your feed.
            </p>
            {locationError && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">{locationError}</p>
            )}
          </div>
          <button
            onClick={requestLocationPermission}
            disabled={requestingLocation}
            className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 text-white disabled:text-slate-400 border border-sky-500 disabled:border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 select-none cursor-pointer"
          >
            {requestingLocation ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Requesting...</span>
              </>
            ) : (
              <span>Enable Location Access</span>
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Peers List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-wrap">
              <p className="font-semibold text-slate-700 text-sm">{peers.length} suggested connections</p>
              {userLocation && (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                  📍 Nearby sorted first
                </span>
              )}
            </div>
            <button
              onClick={fetchPeers}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-sky-600 font-medium transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loadingPeers ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loadingPeers ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-sky-500 border-t-transparent" />
            </div>
          ) : sortedPeers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
              <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold text-sm">No suggestions available</p>
              <p className="text-slate-400 text-xs mt-1">Check back later for peer recommendations</p>
            </div>
          ) : (
            sortedPeers.map(peer => (
              <div key={peer.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm hover:border-slate-300 transition-all">
                {/* Avatar */}
                {peer.avatarUrl ? (
                  <img
                    src={`http://localhost:5000${peer.avatarUrl}`}
                    alt={peer.fullName}
                    className="h-12 w-12 rounded-2xl object-cover shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                    {initials(peer.fullName)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 text-base">{peer.fullName}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${roleColors[peer.role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {peer.role}
                    </span>
                    {peer.memberId && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                        {peer.memberId}
                      </span>
                    )}
                    {peer.publicKey && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" /> E2EE
                      </span>
                    )}
                  </div>
                  {peer.collegeName && (
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                      <GraduationCap className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                      <span className="truncate">{peer.degree} in {peer.branch} · {peer.collegeName}</span>
                    </div>
                  )}
                  {peer.score > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>Compatibility: <span className="font-bold text-sky-600">{peer.score}%</span></span>
                      {peer.distance !== undefined && peer.distance !== null && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                            📍 {formatDistance(peer.distance)}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openChat(peer)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-600 rounded-xl text-xs font-semibold transition-colors"
                    title="Message"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Message</span>
                  </button>

                  {peer.status === 'CONNECTED' ? (
                    <span className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                      <Check className="h-3.5 w-3.5" /> Connected
                    </span>
                  ) : peer.status === 'PENDING' ? (
                    <span className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs font-semibold">
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </span>
                  ) : peer.status === 'RECEIVED' ? (
                    <button
                      onClick={() => acceptConnection(peer.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                    >
                      <Check className="h-3.5 w-3.5" /> Accept Request
                    </button>
                  ) : (
                    <button
                      onClick={() => connect(peer.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Connect
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* DM Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm shadow-slate-100/50" style={{ height: '520px' }}>
            {chatTarget ? (
              <>
                {/* Chat header */}
                <div className="h-14 border-b border-slate-100 flex items-center gap-3 px-4 shrink-0 bg-slate-50/20">
                  <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors lg:hidden">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {chatTarget.avatarUrl ? (
                    <img
                      src={`http://localhost:5000${chatTarget.avatarUrl}`}
                      alt={chatTarget.fullName}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {initials(chatTarget.fullName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 text-sm truncate">{chatTarget.fullName}</p>
                      {chatTarget.publicKey && (
                        <span title="End-to-End Encrypted Session">
                          <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0 animate-pulse" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1.5">
                      <span>{chatTarget.role.toLowerCase()}</span>
                      {chatTarget.publicKey && (
                        <span className="text-[9px] text-emerald-600 font-bold lowercase tracking-wider bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                          e2ee active
                        </span>
                      )}
                    </p>
                  </div>
                  <button onClick={() => { setChatTarget(null); setMessages([]); }} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent to-slate-50/10">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-8">
                      <MessageSquare className="h-8 w-8 text-slate-200" />
                      <p className="text-slate-400 text-sm font-semibold">Start the conversation!</p>
                      <p className="text-slate-300 text-xs px-4">Send a message to connect with {chatTarget.fullName.split(' ')[0]}</p>
                    </div>
                  ) : messages.map(m => {
                    const mine = m.senderId === user?.id;
                    const isEncrypted = !!(mine ? m.textForSender : m.textForReceiver);
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          mine ? 'bg-gradient-to-br from-sky-600 to-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200/50'
                        }`}>
                          <div className="flex items-end justify-between gap-3 flex-wrap">
                            <span className="break-words font-medium">{m.decryptedText || m.text}</span>
                            {isEncrypted && (
                              <span title="End-to-End Encrypted">
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
                      placeholder="Type a message..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-colors shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!msg.trim() || sending}
                      className="p-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl shadow-[0_3px_0_0_#0284c7] disabled:shadow-none active:translate-y-0.5 active:shadow-none transition-all shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 p-8 bg-gradient-to-b from-transparent to-slate-50/10">
                <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200/50 shadow-inner">
                  <MessageSquare className="h-7 w-7 text-slate-300" />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">Your Messages</p>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">Click "Message" on any peer card to start a secure conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
