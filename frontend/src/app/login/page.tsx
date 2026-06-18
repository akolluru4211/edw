'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import OAuthButtons from '@/components/OAuthButtons';

export default function Login() {
  const { user, login, loginWithOAuth, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('network error') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Unable to connect. Please check your internet connection and try again.');
      } else if (msg.toLowerCase().includes('invalid email or password')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      await loginWithOAuth(provider);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('auth/account-exists-with-different-credential')) {
        setError('An account exists with this email using a different sign-in method. Please use that method to sign in.');
      } else if (msg.toLowerCase().includes('network error') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Unable to connect. Please check your internet connection and try again.');
      } else {
        setError(`${provider} sign-in failed. Please try again.`);
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left side: Premium branding context (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-sky-700 via-sky-600 to-blue-600 p-16 flex-col justify-between relative text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Edworld Co. Logo" className="h-10 w-10 object-contain shrink-0 rounded-xl bg-white p-1" />
          <span className="font-extrabold text-2xl tracking-tight">Edworld Co.</span>
        </div>
        <div className="space-y-6 max-w-md my-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-sky-300" />
            AI-Powered Career Engine
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Launch Your Career From Day One</h1>
          <p className="text-sky-100/90 text-sm leading-relaxed">
            Create an ATS-proof portfolio, schedule simulated technical interviews, get direct AI mentoring, and connect with global opportunities.
          </p>
        </div>
        <div className="text-xs text-sky-200/60 font-medium border-t border-white/10 pt-6">&copy; 2026 EdWorld Co. Empowering next-generation professionals.</div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 p-8 md:p-10">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">Enter your credentials to access your professional workspace.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-2xl mb-6 flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-600 font-semibold text-xs mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-slate-600 font-semibold text-xs">Password</label>
                <Link href="/forgot-password" className="text-sky-600 hover:text-sky-700 text-xs font-semibold">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-sky-100 hover:shadow-lg transition-all duration-200 mt-6 cursor-pointer">
              <span>{loading ? 'Entering workspace...' : 'Sign In to Edworld Co.'}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <OAuthButtons onOAuth={handleOAuth} />

          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-xs font-semibold">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">Register Now</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
