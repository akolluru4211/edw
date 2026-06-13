'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { user, login, loginWithOAuth, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('network error') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Connection Failed: Could not connect to the backend server. Please make sure the backend server is running on http://localhost:5000.');
      } else {
        setError(msg || 'Login failed. Please verify credentials.');
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
        setError('An account already exists with this email but was created using a different login method (e.g. Email/Password). Please sign in using your original method.');
      } else {
        setError(msg || `${provider} login failed.`);
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      
      {/* Left side: Premium branding context (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-sky-700 via-sky-600 to-blue-600 p-16 flex-col justify-between relative text-white">
        {/* Subtle dynamic background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Edworld Co. Logo" 
            className="h-10 w-10 object-contain shrink-0 rounded-xl bg-white p-1"
          />
          <span className="font-extrabold text-2xl tracking-tight">Edworld Co.</span>
        </div>

        <div className="space-y-6 max-w-md my-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-sky-300" />
            AI-Powered Career Engine
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Launch Your Career From Day One
          </h1>
          <p className="text-sky-100/90 text-sm leading-relaxed">
            Create an ATS-proof portfolio, schedule simulated technical interviews, get direct AI mentoring, and connect with global opportunities.
          </p>
        </div>

        <div className="text-xs text-sky-200/60 font-medium border-t border-white/10 pt-6">
          &copy; 2026 EdWorld Co. Empowering next-generation professionals.
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 p-8 md:p-10"
        >
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">
              Enter your credentials to access your professional workspace.
            </p>
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
                <input 
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-slate-600 font-semibold text-xs">Password</label>
                <Link href="/forgot-password" className="text-sky-600 hover:text-sky-700 text-xs font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input 
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-sky-100 hover:shadow-lg transition-all duration-200 mt-6 cursor-pointer"
            >
              <span>{loading ? 'Entering workspace...' : 'Sign In to Edworld Co.'}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2.5 text-slate-400 font-bold tracking-wider">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => handleOAuth('google')}
              type="button"
              className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.435 0-6.224-2.789-6.224-6.224s2.789-6.224 6.224-6.224c1.498 0 2.866.53 3.943 1.41l3.053-3.053C18.91 1.956 15.772 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.31 0 11.332-4.996 11.332-11.24 0-.768-.073-1.5-.205-2.203h-11.13Z"
                />
              </svg>
              <span>Google</span>
            </button>
            <button
              onClick={() => handleOAuth('github')}
              type="button"
              className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#24292F"
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-xs font-semibold">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
                Register Now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
