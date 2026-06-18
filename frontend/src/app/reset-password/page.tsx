'use client';

import React, { useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, ShieldAlert, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !code) {
      setError('Invalid recovery link. Please request a new one.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^-])[A-Za-z\d@$!%*?&_#^-]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { email, code, newPassword });
      setSuccess(response.data.message || 'Password reset successfully! Redirecting...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.error || '';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setError('This reset link has expired or is invalid. Please request a new one.');
      } else if (msg.toLowerCase().includes('password')) {
        setError('Password does not meet requirements. Please use a stronger password.');
      } else {
        setError('Password reset failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLinkInvalid = !email || !code;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 p-8 md:p-10"
    >
      <div className="mb-8 flex items-center gap-2">
        <Link 
          href="/login" 
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">New Password</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Configure secure new credentials for your account.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-2xl mb-6 flex items-start gap-2.5 animate-pulse">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold p-3.5 rounded-2xl mb-6 flex items-start gap-2.5">
          <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {isLinkInvalid ? (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-2">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Invalid Reset Link</h3>
          <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
            This password reset link is invalid, incomplete, or has expired. Please request a new recovery link.
          </p>
          <div className="pt-4">
            <Link 
              href="/forgot-password" 
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all duration-200"
            >
              <span>Request New Link</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-slate-600 font-semibold text-xs mb-2">Email Address</label>
            <div className="relative opacity-60">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input 
                type="email"
                disabled
                value={email}
                className="w-full bg-slate-100 text-xs text-slate-600 rounded-2xl pl-11 pr-4 py-3.5 border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold text-xs mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input 
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold text-xs mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input 
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl pl-11 pr-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !!success}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-sky-100 hover:shadow-lg transition-all duration-200 mt-6 cursor-pointer"
          >
            <span>{loading ? 'Resetting password...' : 'Update Password'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      <div className="text-center mt-8 pt-6 border-t border-slate-100">
        <p className="text-slate-500 text-xs font-semibold">
          Remembered your credentials?{' '}
          <Link href="/login" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function ResetPassword() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left side: Premium branding context (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-sky-700 via-sky-600 to-blue-600 p-16 flex-col justify-between relative text-white">
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
            Security & Identity
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Reset Your Password
          </h1>
          <p className="text-sky-100/90 text-sm leading-relaxed">
            Please enter your new password below. Ensure it is strong and secure to safeguard your professional profile.
          </p>
        </div>

        <div className="text-xs text-sky-200/60 font-medium border-t border-white/10 pt-6">
          &copy; 2026 EdWorld Co. Secure account recovery portal.
        </div>
      </div>

      {/* Right side: Reset Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <Suspense fallback={
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center text-slate-500 text-xs">
            Loading recovery session...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
