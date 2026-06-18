'use client';

import React from 'react';

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.435 0-6.224-2.789-6.224-6.224s2.789-6.224 6.224-6.224c1.498 0 2.866.53 3.943 1.41l3.053-3.053C18.91 1.956 15.772 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.31 0 11.332-4.996 11.332-11.24 0-.768-.073-1.5-.205-2.203h-11.13Z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#24292F" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

interface OAuthButtonsProps {
  onOAuth: (provider: 'google' | 'github') => void;
  label?: string;
}

export default function OAuthButtons({ onOAuth, label = 'Or continue with' }: OAuthButtonsProps) {
  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-white px-2.5 text-slate-400 font-bold tracking-wider">{label}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <button onClick={() => onOAuth('google')} type="button" className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
          <GoogleIcon />
          <span>Google</span>
        </button>
        <button onClick={() => onOAuth('github')} type="button" className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
          <GitHubIcon />
          <span>GitHub</span>
        </button>
      </div>
    </>
  );
}
