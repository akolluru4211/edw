'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-black text-sky-500">404</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 text-sm mb-8">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-all">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
