'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Bot, Plus, X, MessageSquare, Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MSG: ChatMessage = {
  role: 'assistant',
  content: "Hello! I am Alex, your career mentor. Ask me anything about building career study roadmaps, optimizing resumes, or preparing for mock interviews."
};

export default function GlobalChatbot() {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.get('/ai-coach/history')
        .then(res => {
          if (res.data?.length > 0) {
            const latest = res.data[0];
            setSessionId(latest.id);
            if (latest.messages?.length > 0) setMessages(latest.messages);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);

    try {
      const res = await api.post('/ai-coach/chat', { chatId: sessionId || undefined, message: msg });
      setSessionId(res.data.chatId);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role === 'ADMIN') return null;

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-4 md:right-[calc(1.5rem+env(safe-area-inset-right,0px))] z-40 flex flex-col items-end">
      {chatOpen && (
        <div className="mb-4 w-[320px] xs:w-96 max-w-[calc(100vw-2rem)] h-[400px] xs:h-[460px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          <div className="bg-sky-600 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <p className="font-bold text-xs">Alex, Career Coach</p>
                <p className="text-[10px] text-sky-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setSessionId(null); setMessages([WELCOME_MSG]); }} title="Reset" className="p-1 hover:bg-sky-700 text-sky-100 hover:text-white rounded-lg transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-sky-700 text-sky-100 hover:text-white rounded-lg transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse ml-auto' : ''}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 select-none ${m.role === 'user' ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700'}`}>
                  {m.role === 'user' ? 'Me' : 'AI'}
                </div>
                <div className={`p-2.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 max-w-xs">
                <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center">AI</div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 bg-white shrink-0 flex items-center gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask Alex for guidance..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sky-500 focus:bg-white" />
            <button type="submit" disabled={loading || !input.trim()} className="p-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition-colors shrink-0">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setChatOpen(!chatOpen)} title="Career Coach Chat" className="h-10 w-10 xs:h-12 xs:w-12 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 group focus:outline-none focus:ring-2 focus:ring-sky-500/20">
        {chatOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5 animate-pulse" />}
      </button>
    </div>
  );
}
