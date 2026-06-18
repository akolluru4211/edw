'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { api, BACKEND_URL } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import GlobalChatbot from '@/components/GlobalChatbot';
import { getImageUrl } from '@/lib/image';
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  FileText, 
  Briefcase, 
  Users, 
  GraduationCap, 
  Code2, 
  MessagesSquare, 
  UserCircle, 
  ShieldCheck, 
  LogOut, 
  Menu,
  X, 
  Bell, 
  TrendingUp,
  FolderGit,
  ChevronRight,
  Coins,
  Award,
  Sparkles
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, desc: 'Your career snapshot' },
      { name: 'My Profile', href: '/profile', icon: UserCircle, desc: 'Overview & documents' },
      { name: 'Portfolio', href: '/portfolio', icon: FolderGit, desc: 'Edit your portfolio' },
      { name: 'ATS Resume', href: '/resume', icon: FileText, desc: 'Scan & optimize' },
      { name: 'Ed Points', href: '/points', icon: Coins, desc: 'Redeem points' },
      { name: 'Pricing & Plans', href: '/pricing', icon: Sparkles, desc: 'Upgrade your workspace' },
    ]
  },
  {
    title: 'AI Development',
    items: [
      { name: 'AI Coach', href: '/ai-coach', icon: MessageSquareCode, desc: 'Career guidance' },
    ]
  },
  {
    title: 'Network',
    items: [
      { name: 'Jobs & Internships', href: '/jobs', icon: Briefcase, desc: 'Apply to roles' },
      { name: 'Connections', href: '/network', icon: Users, desc: 'Grow your network' },
      { name: 'Community', href: '/community', icon: MessagesSquare, desc: 'Q&A and posts' },
      { name: 'Notifications', href: '/notifications', icon: Bell, desc: 'Push alerts & history' },
      { name: 'Ambassador', href: '/ambassador', icon: Award, desc: 'Apply to represent us' },
    ]
  }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, logout, refreshUser } = useAuth();
  const { unreadCount, history, markRead } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Splash Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'ADMIN' && pathname !== '/admin') {
        router.replace('/admin');
      }
    }
  }, [user, loading, pathname, router]);

  // Handle Splash Screen Timer (dismiss immediately when auth loading ends)
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setFadeSplash(true);
        const removeTimer = setTimeout(() => {
          setShowSplash(false);
        }, 400);
        return () => clearTimeout(removeTimer);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Close notif popover on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Splash Screen Display
  if (showSplash || loading) {
    return (
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${fadeSplash && !loading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-6 text-center select-none group cursor-pointer">
          <div className="relative p-1">
            <div className="absolute inset-0 bg-sky-100 rounded-2xl blur-md scale-110 group-hover:scale-125 transition-transform duration-500 opacity-60 animate-pulse" />
            <img 
              src="/logo.png" 
              alt="Edworld Co. Logo" 
              className="relative h-20 w-20 rounded-2xl object-contain shadow-md scale-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" 
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent tracking-tight group-hover:tracking-wide transition-all duration-500">
              Edworld Co.
            </h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">
              Loading workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }


  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const allGroups = isAdmin
    ? [{ title: 'Admin', items: [{ name: 'Admin Console', href: '/admin', icon: ShieldCheck, desc: 'Manage platform' }] }]
    : navGroups;

  const userInitials = user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarSrc = getImageUrl(user.profile?.avatarUrl, BACKEND_URL) || null;

  return (
    <div className="flex h-screen w-screen min-h-0 overflow-hidden bg-slate-50">

      {/* ─── Sidebar Backdrop (mobile) ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden block"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64 shadow-2xl translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16 md:overflow-hidden'}
          md:overflow-visible`}
      >
        {/* Brand */}
        <div className={`flex items-end border-b border-slate-100 shrink-0 transition-all duration-300 pb-3.5 
          pt-[calc(0.75rem+env(safe-area-inset-top,0px))] h-[calc(4rem+env(safe-area-inset-top,0px))]
          ${sidebarOpen ? 'px-4 gap-3 justify-between' : 'justify-center px-2'}`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <img src="/logo.png" alt="Edworld Co." className="h-8 w-8 rounded-xl object-contain shrink-0" />
                <span className="font-black text-sm bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent tracking-tight truncate">
                  Edworld Co.
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-700 shrink-0 p-1 rounded-lg hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <img src="/logo.png" alt="Edworld Co." className="h-8 w-8 rounded-xl object-contain" />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {allGroups.map((group) => (
            <div key={group.title} className={`${sidebarOpen ? 'px-3' : 'px-2'} pb-2`}>
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!sidebarOpen ? item.name : undefined}
                    className={`group flex items-center rounded-xl transition-all duration-150 relative
                      ${sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-3 mb-0.5'}
                      ${active
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                  >
                    {active && !sidebarOpen && (
                      <span className="absolute left-0 inset-y-2 w-0.5 bg-sky-500 rounded-r-full" />
                    )}
                    <Icon className={`shrink-0 transition-colors ${sidebarOpen ? 'h-4.5 w-4.5' : 'h-5 w-5'} ${active ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {sidebarOpen && (
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold leading-tight ${active ? 'text-sky-700' : 'text-slate-700'}`}>{item.name}</p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{item.desc}</p>
                      </div>
                    )}
                    {active && sidebarOpen && (
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0" />
                    )}
                    {/* Tooltip on collapsed */}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-3 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                        {item.name}
                        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Readiness mini card */}
        {sidebarOpen && user.profile && !isAdmin && (
          <div className="mx-3 mb-3 p-3.5 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Career Readiness</span>
              <span className="text-xs font-black text-sky-600">{user.profile.readinessScore || 20}%</span>
            </div>
            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${user.profile.readinessScore || 20}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Add projects & resume to boost score.</p>
          </div>
        )}

        {/* User footer */}
        <div className={`border-t border-slate-100 ${sidebarOpen ? 'p-3' : 'p-2'} pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="h-8 w-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {userInitials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.fullName}</p>
                  {user.plan && user.plan !== 'FREE' && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase shrink-0 ${
                      user.plan === 'PREMIUM'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm'
                        : 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sm'
                    }`}>
                      {user.plan}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</p>
              </div>
              <button onClick={logout} title="Sign Out" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={logout} title="Sign Out" className="w-full flex justify-center p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

        {/* ─── Top Header ─── */}
        <header className="h-[calc(4rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo & Edworld Co. Header Branding */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Edworld Co." className="h-7 w-7 rounded-lg object-contain shrink-0" />
              <span className="font-black text-sm bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent tracking-tight hidden xs:block shrink-0">
                Edworld Co.
              </span>
              <span className="text-slate-300 text-xs hidden xs:block">|</span>
              <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                {allGroups.flatMap(g => g.items).find(i => i.href === pathname)?.name ?? 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Luxury Ed Points Pill */}
            {!isAdmin && (
              <Link 
                href="/points" 
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.08)] hover:shadow-[0_0_18px_rgba(245,158,11,0.2)] transition-all duration-300 rounded-full px-3 py-1.5 text-xs font-semibold select-none group cursor-pointer"
              >
                <Coins className="h-3.5 w-3.5 text-amber-500 animate-pulse group-hover:scale-110 transition-transform duration-300" />
                <span className="text-slate-700 group-hover:text-slate-900 transition-colors hidden sm:inline">Ed Points:</span>
                <span className="text-amber-700 font-black tracking-tight">{user.edPoints ?? 50} Pts</span>
                <span className="bg-amber-600/10 border border-amber-500/20 text-amber-700 rounded px-1 py-0.5 text-[9px] font-black tracking-wider whitespace-nowrap uppercase">
                  10 Pts = ₹1
                </span>
              </Link>
            )}

            {/* Readiness pill */}
            {!isAdmin && user.profile && (
              <div className="hidden md:flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-full px-3 py-1.5 text-xs font-semibold">
                <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
                <span className="text-slate-600">Readiness:</span>
                <span className="text-sky-600 font-bold">{user.profile.readinessScore || 20}%</span>
              </div>
            )}

            {/* Notifications */}
            {!isAdmin && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex items-center justify-center h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-800">Notifications</span>
                      {unreadCount > 0 && <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {history.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-7 w-7 text-slate-200 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-medium">No notifications yet</p>
                        </div>
                      ) : history.slice(0, 5).map(n => (
                        <div
                           key={n.id}
                           className={`px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-sky-50/30' : ''}`}
                           onClick={() => { markRead(n.id); setNotifOpen(false); }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className={`text-xs text-slate-800 ${!n.read ? 'font-bold' : 'font-semibold'}`}>{n.title}</p>
                            {!n.read && <div className="h-1.5 w-1.5 bg-sky-500 rounded-full shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(n.sentAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="block text-center text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Avatar */}
            <Link href={isAdmin ? "/admin" : "/profile"} className="flex items-center gap-2 pl-1 pr-3 py-1 border border-slate-200 hover:border-slate-300 rounded-full bg-white transition-colors">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="h-7 w-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {userInitials}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[90px] truncate">
                {user.fullName.split(' ')[0]}
              </span>
              {user.plan && user.plan !== 'FREE' && (
                <span className={`hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase shrink-0 ${
                  user.plan === 'PREMIUM'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                    : 'bg-gradient-to-r from-sky-500 to-blue-500 text-white'
                }`}>
                  {user.plan}
                </span>
              )}
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </Link>
          </div>
        </header>

        {/* ─── Page Content ─── */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* ─── Mobile Bottom Navigation Bar ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around md:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        {[
          { name: 'Home', href: '/', icon: LayoutDashboard },
          { name: 'AI Coach', href: '/ai-coach', icon: MessageSquareCode },
          { name: 'Jobs', href: '/jobs', icon: Briefcase },
          { name: 'Network', href: '/network', icon: Users },
          { name: 'Menu', href: '#menu', icon: Menu, isMenuToggle: true }
        ].map(item => {
          const Icon = item.icon;
          const active = item.isMenuToggle ? sidebarOpen : pathname === item.href;
          
          if (item.isMenuToggle) {
            return (
              <button
                key={item.name}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 select-none ${
                  active ? 'text-sky-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-700 font-medium'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] tracking-tight">{item.name}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 select-none ${
                active ? 'text-sky-600 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>


      {/* ─── Floating Global Chatbot ─── */}
      <GlobalChatbot />
    </div>
  );
}
