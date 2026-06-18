'use client';

import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-500 text-sm mb-8">An unexpected error occurred. Please try again.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-all">
            Try Again
          </button>
          <Link href="/" className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl transition-all">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
