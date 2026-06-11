'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Plus, Trash2, MessageSquare,
  TrendingUp, FileCheck2, Video, Bot, Clock, ChevronRight
} from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Session {
  id: string;
  title: string;
  messages: Msg[];
  createdAt: string;
}

// 1. Interactive 3D Tilt Preset Card
function Preset3DCard({ label, prompt, icon: Icon, onClick }: { label: string; prompt: string; icon: any; onClick: () => void }) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <button
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="relative p-5 bg-white border border-slate-200 hover:border-indigo-400/50 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 overflow-hidden"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {isHovered && (
        <div 
          className="absolute pointer-events-none rounded-full blur-xl opacity-40 transition-opacity duration-300"
          style={{
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            left: `${coords.x - 90}px`,
            top: `${coords.y - 90}px`,
          }}
        />
      )}
      <div className="relative z-10" style={{ transform: 'translateZ(15px)' }}>
        <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3 text-indigo-600 shadow-inner">
          <Icon className="h-5 w-5" />
        </div>
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed line-clamp-2">{prompt}</p>
      </div>
    </button>
  );
}

// 2. Futuristic Pulsing 3D Avatar for AI Coach
function AlexAvatar() {
  return (
    <div className="relative h-10 w-10 flex items-center justify-center shrink-0">
      <span className="absolute inset-0 rounded-2xl bg-indigo-400/20 animate-ping" />
      <div className="relative h-9 w-9 bg-gradient-to-br from-indigo-500 via-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 border border-white/20">
        <Bot className="h-5 w-5 text-white animate-pulse" />
      </div>
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
    </div>
  );
}

export default function AICoach() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai-coach/history');
      setSessions(res.data);
      if (res.data.length > 0 && !activeId) {
        setActiveId(res.data[0].id);
        setMessages(res.data[0].messages);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectChat = (id: string) => {
    const s = sessions.find(s => s.id === id);
    if (s) { setActiveId(id); setMessages(s.messages); }
  };

  const newChat = () => { setActiveId(null); setMessages([]); };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.delete(`/ai-coach/history/${id}`);
    setSessions(sessions.filter(s => s.id !== id));
    if (activeId === id) newChat();
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const prev = [...messages];
    setMessages([...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai-coach/chat', { chatId: activeId, message: text });
      setMessages(res.data.messages);
      if (!activeId) {
        setActiveId(res.data.chatId);
        fetchHistory();
      } else {
        setSessions(s => s.map(x => x.id === activeId ? { ...x, messages: res.data.messages } : x));
      }
    } catch { setMessages(prev); } finally { setLoading(false); }
  };

  const presets = [
    { label: 'Career Roadmap', icon: TrendingUp, prompt: 'Create a 3-month career development roadmap for a software engineer' },
    { label: 'Resume Review', icon: FileCheck2, prompt: 'Review my resume keywords for software engineering roles and suggest improvements' },
    { label: 'Mock Interview', icon: Video, prompt: 'Conduct a behavioral mock interview with STAR-format questions' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] space-y-4">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">AI Career Coach</h1>
        <p className="text-slate-500 text-sm mt-1">Get personalized career advice, resume tips, and interview practice</p>
      </div>

      <div className="flex-1 flex gap-5 min-h-0 overflow-hidden">
        {/* History Sidebar */}
        <div className="w-64 shrink-0 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="p-4 border-b border-slate-100">
            <button
              onClick={newChat}
              className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_0_0_#0284c7] active:translate-y-1 active:shadow-none"
            >
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1">History</p>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No previous chats</p>
            ) : sessions.map(s => (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => selectChat(s.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectChat(s.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-left cursor-pointer transition-all group focus:outline-none ${
                  activeId === s.id
                    ? 'bg-gradient-to-r from-sky-50 to-indigo-50/50 border border-sky-100 text-sky-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pointer-events-none">
                  <MessageSquare className={`h-4 w-4 shrink-0 ${activeId === s.id ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span className="text-xs truncate">{s.title}</span>
                </div>
                <button
                  type="button"
                  onClick={e => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all focus:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Workspace */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-100/50 min-w-0">
          {/* Header */}
          <div className="h-16 border-b border-slate-100 flex items-center gap-3.5 px-6 shrink-0 bg-slate-50/30">
            <AlexAvatar />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-slate-900 text-sm">Alex</p>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-md">Career Mentor</span>
              </div>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> online
              </p>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-transparent to-slate-50/20">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="h-full flex flex-col items-center justify-center gap-8 text-center max-w-xl mx-auto py-8"
                >
                  <div className="relative p-5 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-3xl shadow-lg shadow-indigo-500/10">
                    <Sparkles className="h-8 w-8 text-white animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Let's design your career path</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                      Ask me anything about resume parsing audits, behavioural interview questions, or personalized career milestones.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                    {presets.map(p => (
                      <Preset3DCard
                        key={p.label}
                        label={p.label}
                        prompt={p.prompt}
                        icon={p.icon}
                        onClick={() => send(p.prompt)}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  {messages.map((m, i) => {
                    const isUser = m.role === 'user';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : ''} max-w-[85%] ${isUser ? 'ml-auto' : ''}`}
                      >
                        {isUser ? (
                          <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-sky-500/10 shrink-0 border border-sky-400/20">
                            Me
                          </div>
                        ) : (
                          <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/10 shrink-0 border border-indigo-400/20">
                            AI
                          </div>
                        )}
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? 'bg-gradient-to-br from-sky-600 to-blue-600 text-white rounded-tr-sm shadow-sm shadow-sky-600/10'
                              : 'bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/80 text-slate-800 rounded-tl-sm shadow-sm'
                          }`}
                        >
                          {m.content}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3.5 max-w-xs"
              >
                <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-400/20">
                  AI
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-1.5 shadow-sm">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="h-2.5 w-2.5 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>

          {/* Form Control */}
          <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/30">
            <form
              onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex items-center gap-3 bg-white border border-slate-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/5 rounded-2xl p-2 transition-all shadow-inner"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your question about resumes, code, or interviews..."
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all shadow-[0_3px_0_0_#0284c7] disabled:shadow-none active:translate-y-0.5 active:shadow-none shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-slate-400">
              <Clock className="h-3 w-3" />
              <span>Responses are generated in real-time. Verify critical roadmap decisions.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
