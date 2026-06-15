'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { api, BACKEND_URL } from '@/lib/api';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  FolderGit, 
  Award, 
  Code, 
  Globe, 
  TrendingUp, 
  Sparkles,
  ChevronLeft,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface PublicPortfolioProps {
  params: Promise<{ username: string }>;
}

// 1. Real-time Cursor-Spotlight 3D Tilt Card Component (Light Mode)
function Interactive3DCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // max 8 degrees rotation for a natural feel
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative bg-white/70 backdrop-blur-xl border border-slate-200/80 hover:border-indigo-500/35 rounded-3xl p-6 md:p-8 transition-all duration-200 shadow-sm shadow-slate-100/50 hover:shadow-2xl hover:shadow-indigo-500/5 overflow-hidden ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Light mode cursor glow spotlight */}
      {isHovered && (
        <div 
          className="absolute pointer-events-none rounded-full blur-2xl opacity-50 transition-opacity duration-300"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            left: `${coords.x - 150}px`,
            top: `${coords.y - 150}px`,
          }}
        />
      )}
      <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </div>
  );
}

function PublicAvatar3DCard({ profile, initials }: { profile: any; initials: string }) {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -15; // 15 deg max
    const tiltY = (x / (rect.width / 2)) * 15; // 15 deg max
    
    setTiltStyle({
      transform: `perspective(300px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'transform 0.1s ease',
      boxShadow: `${-tiltY * 0.8}px ${tiltX * 0.8}px 25px rgba(14, 165, 233, 0.25)`
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(300px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      boxShadow: 'none'
    });
  };

  const avatarUrl = profile.avatarUrl || profile.user?.profile?.avatarUrl;
  const avatarSrc = avatarUrl
    ? (avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND_URL}${avatarUrl}`)
    : null;

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...tiltStyle, zIndex: 10 }}
      className="relative -mt-12 sm:-mt-16 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden select-none border-4 border-white cursor-default"
    >
      {avatarSrc ? (
        <img 
          src={avatarSrc} 
          alt="Avatar" 
          className="h-full w-full object-cover" 
          crossOrigin="anonymous"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// 2. Custom SVG Area Line Chart Component (Light Mode)
function CareerProgressionChart({ readinessScore }: { readinessScore: number }) {
  const points = [20, 42, 58, 72, readinessScore];
  const width = 500;
  const height = 150;
  const padding = 25;
  
  const coords = points.map((p, index) => {
    const x = padding + (index * (width - padding * 2)) / (points.length - 1);
    const y = height - padding - (p * (height - padding * 2)) / 100;
    return { x, y, value: p };
  });

  let dLine = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    dLine += ` L ${coords[i].x} ${coords[i].y}`;
  }

  const dArea = `${dLine} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
        <span>Career Readiness Growth</span>
        <span className="text-emerald-600 font-extrabold">+{readinessScore - 20}% Progress</span>
      </div>
      
      <div className="relative bg-slate-50/50 rounded-2xl p-4 border border-slate-200/60 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = height - padding - (level * (height - padding * 2)) / 100;
            return (
              <g key={level}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeDasharray="4 4" 
                  strokeWidth="1" 
                />
                <text 
                  x={padding - 5} 
                  y={y + 3} 
                  fill="#94a3b8" 
                  fontSize="8" 
                  textAnchor="end" 
                  className="font-mono font-bold"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={dArea} fill="url(#chartGrad)" />

          {/* Line */}
          <path 
            d={dLine} 
            fill="none" 
            stroke="url(#lineGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="drop-shadow-[0_2px_4px_rgba(99,102,241,0.15)]"
          />

          {/* Data Points */}
          {coords.map((c, i) => (
            <g key={i} className="group/point cursor-pointer">
              <circle 
                cx={c.x} 
                cy={c.y} 
                r="5.5" 
                fill="#ffffff" 
                stroke={i === coords.length - 1 ? '#ec4899' : '#6366f1'} 
                strokeWidth="3" 
              />
              <circle 
                cx={c.x} 
                cy={c.y} 
                r="11" 
                fill={i === coords.length - 1 ? '#ec4899' : '#6366f1'} 
                fillOpacity="0"
                className="hover:fill-opacity-10 transition-all duration-200"
              />
              {/* Tooltip on hover */}
              <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect 
                  x={c.x - 20} 
                  y={c.y - 28} 
                  width="40" 
                  height="18" 
                  rx="4" 
                  fill="#1e293b" 
                  stroke="#334155" 
                  strokeWidth="1" 
                />
                <text 
                  x={c.x} 
                  y={c.y - 16} 
                  fill="#f8fafc" 
                  fontSize="9" 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  className="font-mono"
                >
                  {c.value}%
                </text>
              </g>
            </g>
          ))}
        </svg>
        
        {/* X Axis Labels */}
        <div className="flex justify-between mt-2 px-[18px] text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider">
          <span>SignUp</span>
          <span>Scan</span>
          <span>Coach</span>
          <span>Apply</span>
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}

export default function PublicPortfolio({ params }: PublicPortfolioProps) {
  const { username } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const response = await api.get(`/profile/portfolio/${username}`);
        setProfile(response.data);
      } catch (err: any) {
        console.error(err);
        setError('The requested student portfolio could not be found or has been set to private.');
      } finally {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
      }
    }
    loadPortfolio();
  }, [username]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white relative overflow-hidden">
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-purple-100 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-sky-100 rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-sky-400 border-r-indigo-500 border-b-purple-500 border-l-transparent"></div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Loading creative portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden text-slate-800">
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-red-100/50 rounded-full blur-3xl" />
        
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-5 z-10 shadow-sm shadow-slate-100/60">
          <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto text-2xl font-black">
            !
          </div>
          <h2 className="font-black text-slate-800 text-xl tracking-tight">Portfolio Offline</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">{error || 'Portfolio not found'}</p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors pt-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Return to workspace login</span>
          </Link>
        </div>
      </div>
    );
  }

  const interestsList = profile.interests ? JSON.parse(profile.interests) : [];
  const goalsList = profile.goals ? JSON.parse(profile.goals) : [];

  return (
    <div className="min-h-screen bg-white text-slate-800 py-12 px-6 sm:px-8 relative overflow-hidden font-sans">
      
      {/* Background Matrix Grid (Light Mode) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50"></div>
      
      {/* Soft pastel blobs */}
      <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-purple-100 rounded-full blur-3xl pointer-events-none opacity-70" />
      <div className="absolute top-[40%] right-[5%] w-[400px] h-[400px] bg-sky-100 rounded-full blur-3xl pointer-events-none opacity-70" />
      <div className="absolute bottom-[5%] left-[20%] w-[300px] h-[300px] bg-pink-100 rounded-full blur-3xl pointer-events-none opacity-70" />

      {/* Floating 3D background particles */}
      <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-indigo-500/20 rounded-full animate-ping pointer-events-none" />
      <div className="absolute top-[60%] right-[25%] w-3.5 h-3.5 bg-purple-500/10 rounded-full animate-bounce pointer-events-none" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[30%] left-[45%] w-1.5 h-1.5 bg-pink-500/15 rounded-full animate-pulse pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation header */}
        <div className="flex justify-between items-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Edworld Co. Workspace</span>
          </Link>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            Verified Student Portfolio
          </span>
        </div>

        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm shadow-slate-100/40 flex flex-col">
          {/* Banner area */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-sky-400 to-blue-600 relative overflow-hidden shrink-0">
            {profile.bannerUrl ? (
              <img 
                src={profile.bannerUrl.startsWith('http') ? profile.bannerUrl : `${BACKEND_URL}${profile.bannerUrl}`} 
                alt="Profile Cover Banner" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full opacity-60 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
            )}
          </div>

          {/* Content area */}
          <div className="p-6 pt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left min-w-0">
              {/* Avatar block with 3D Hover tilt */}
              <PublicAvatar3DCard profile={profile} initials={profile.user?.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)} />
              
              <div className="min-w-0 flex-1 space-y-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-955 bg-clip-text text-transparent break-words">
                  {profile.user?.fullName}
                </h1>
                <p className="text-slate-600 text-xs font-semibold mt-2 flex items-center gap-1.5 justify-center sm:justify-start">
                  <GraduationCap className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="break-words text-left">{profile.degree} in {profile.branch}</span>
                </p>
                <p className="text-slate-500 text-[11px] font-semibold mt-1 break-words">
                  {profile.collegeName} · <span className="text-indigo-600 font-bold">Class of {profile.graduationYear}</span>
                </p>
                {profile.headline && (
                  <p className="text-xs text-slate-550 leading-relaxed font-semibold break-words mt-1">
                    {profile.headline}
                  </p>
                )}
              </div>
            </div>

            {/* Contact panel */}
            <div className="flex flex-col gap-2.5 text-xs text-slate-500 font-semibold border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 shrink-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 hover:text-slate-900 transition-colors cursor-pointer">
                <Mail className="h-4 w-4 text-sky-500" />
                <span className="break-all">{profile.user?.email}</span>
              </div>
              {profile.user?.phoneNumber && (
                <div className="flex items-center justify-center sm:justify-start gap-2 hover:text-slate-900 transition-colors cursor-pointer">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  <span className="break-all">{profile.user?.phoneNumber}</span>
                </div>
              )}
              {profile.user?.memberId && (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Member ID:</span>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                    {profile.user.memberId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Candidate + 3D Flipping Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* About Column */}
          <Interactive3DCard className="lg:col-span-2 space-y-4">
            <h2 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">About Candidate</h2>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line break-words">
              {profile.bio || 'This student has not written a summary statement yet.'}
            </p>

            {/* Interest/goal tags */}
            <div className="pt-4 flex flex-col gap-4">
              {interestsList.length > 0 && (
                <div>
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Interests & Specializations</span>
                  <div className="flex flex-wrap gap-2">
                    {interestsList.map((tag: string) => (
                      <span key={tag} className="text-[10px] font-extrabold bg-indigo-50 border border-indigo-200/60 hover:border-indigo-400/40 text-indigo-700 px-3 py-1 rounded-full transition-colors cursor-default hover:bg-indigo-100/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {goalsList.length > 0 && (
                <div>
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Career Targets & Objectives</span>
                  <div className="flex flex-wrap gap-2">
                    {goalsList.map((tag: string) => (
                      <span key={tag} className="text-[10px] font-extrabold bg-pink-50 border border-pink-200/60 hover:border-pink-400/40 text-pink-700 px-3 py-1 rounded-full transition-colors cursor-default hover:bg-pink-100/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Interactive3DCard>

          {/* 3D Flippable Career Card widget (Contrasting Dark Card) */}
          <div className="w-full max-w-[450px] aspect-[1.586/1] mx-auto cursor-pointer [perspective:1000px] group/flip">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover/flip:[transform:rotateY(180deg)] shadow-xl rounded-2xl">
              
              {/* Front Side Card (Premium Dark Glass) */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] -webkit-backface-visibility:hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-5 flex flex-col justify-between border border-slate-800 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-500/20 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                
                {/* Top header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 z-10 shrink-0">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-6 w-6 rounded-lg object-contain bg-white p-0.5" />
                    <span className="font-black text-xs tracking-tight bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
                      EDWORLD CO.
                    </span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                    verified member
                  </span>
                </div>

                {/* Body info */}
                <div className="flex-1 flex gap-4 items-center mt-3 z-10 min-w-0">
                  <div className="h-16 w-16 rounded-xl border border-white/20 bg-slate-800/80 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    {(() => {
                      const avatarUrl = profile.avatarUrl || profile.user?.profile?.avatarUrl;
                      const avatarSrc = avatarUrl
                        ? (avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND_URL}${avatarUrl}`)
                        : null;
                      return avatarSrc ? (
                        <img src={avatarSrc} alt="Avatar" className="h-full w-full object-cover" crossOrigin="anonymous" />
                      ) : (
                        <span className="font-black text-xl text-sky-400">
                          {profile.user?.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-black text-base tracking-tight truncate text-white">{profile.user?.fullName}</h3>
                    <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest truncate">{profile.user?.role}</p>
                    <p className="text-[9px] text-slate-300 leading-tight truncate">{profile.degree} · {profile.branch}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">
                      ID: EDW-{profile.user?.id?.slice(0, 8).toUpperCase() || 'MEMBER'}
                    </p>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-end justify-between border-t border-white/10 pt-3 mt-3 z-10 shrink-0">
                  <div>
                    <span className="block text-[7px] font-black uppercase text-slate-500">career readiness</span>
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {profile.readinessScore}% Score
                    </span>
                  </div>
                  <span className="text-[8px] font-extrabold text-indigo-400 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                    Hover to Flip ↺
                  </span>
                </div>
              </div>

              {/* Back Side Card */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] -webkit-backface-visibility:hidden [transform:rotateY(180deg)] bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-2xl p-5 flex flex-col justify-between border border-indigo-900/60 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-28 h-28 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />
                
                {/* Back header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 z-10 shrink-0">
                  <span className="text-[8px] font-extrabold uppercase text-indigo-400 tracking-wider">Public Portfolio Access</span>
                  <span className="text-[7px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">Secure Link</span>
                </div>

                {/* QR Code Section */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2 z-10 mt-2">
                  <div className="bg-white p-2 rounded-xl shadow-lg border border-white/10 hover:scale-105 transition-transform duration-300">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://edworld.co.in/u/${profile.portfolioUrl || profile.user?.id}`)}`} 
                      alt="QR Code" 
                      className="h-[75px] w-[75px] object-contain" 
                      crossOrigin="anonymous"
                    />
                  </div>
                  <p className="text-[9px] font-mono text-slate-300">edworld.co.in/u/{profile.portfolioUrl || profile.user?.id}</p>
                </div>

                {/* Back footer */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3 z-10 shrink-0">
                  <span className="text-[7px] font-mono text-slate-500">*{profile.user?.id?.slice(0, 4).toUpperCase()}*</span>
                  <span className="text-[8px] font-extrabold text-sky-400 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                    Back to Front ↺
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Line Chart + Readiness Widget Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Interactive3DCard className="lg:col-span-2">
            <CareerProgressionChart readinessScore={profile.readinessScore || 20} />
          </Interactive3DCard>

          <Interactive3DCard className="flex flex-col justify-between items-center text-center">
            <h2 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest mb-4">Readiness index</h2>
            
            <div className="relative flex items-center justify-center my-4">
              <svg height="120" width="120" className="transform -rotate-90">
                <circle stroke="#f1f5f9" fill="transparent" strokeWidth="8" r="46" cx="60" cy="60" />
                <circle
                  stroke="url(#readinessGrad)"
                  fill="transparent"
                  strokeWidth="8"
                  strokeDasharray={289}
                  style={{ strokeDashoffset: 289 - (profile.readinessScore / 100) * 289 }}
                  r="46"
                  cx="60"
                  cy="60"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-slate-900 drop-shadow-[0_2px_8px_rgba(99,102,241,0.1)]">{profile.readinessScore}%</span>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-sky-50 text-sky-600 border border-sky-200/50 rounded-full px-3.5 py-1 text-[10px] font-extrabold mt-2 shadow-[0_0_15px_rgba(14,165,233,0.02)]">
              <Sparkles className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
              <span>Verifiable Job Preparedness</span>
            </div>
          </Interactive3DCard>
        </div>

        {/* Lower section: Projects & Skills & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects & Experience */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Work Experience Timeline */}
            <Interactive3DCard className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                  <Briefcase className="h-5 w-5 text-indigo-500" />
                </div>
                <h2 className="text-slate-900 font-black text-base tracking-tight">Work History & Internships</h2>
              </div>

              {!profile.experience || profile.experience.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                  This student has not listed work experience yet.
                </p>
              ) : (
                <div className="space-y-6 relative pl-4 border-l border-slate-200 ml-3">
                  {profile.experience.map((exp: any) => (
                    <div key={exp.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-gradient-to-r from-pink-500 to-indigo-500 shadow-[0_0_8px_rgba(236,72,153,0.3)] transition-all group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(236,72,153,0.5)]"></div>
                      
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{exp.role}</h3>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                          </span>
                        </div>
                        <span className="block text-xs font-bold text-indigo-600 mt-0.5">{exp.company}</span>
                        <p className="text-slate-500 text-xs mt-2.5 leading-relaxed font-semibold">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Interactive3DCard>

            {/* Showcase / Media Gallery */}
            {(() => {
              let items: any[] = [];
              if (profile.mediaItems) {
                try {
                  items = typeof profile.mediaItems === 'string'
                    ? JSON.parse(profile.mediaItems)
                    : profile.mediaItems;
                } catch {
                  items = [];
                }
              }

              if (!Array.isArray(items) || items.length === 0) {
                return null;
              }

              return (
                <Interactive3DCard className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                      <Sparkles className="h-5 w-5 text-indigo-500" />
                    </div>
                    <h2 className="text-slate-900 font-black text-base tracking-tight">Showcase Gallery</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item: any) => (
                      <div key={item.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-between gap-3 relative">
                        <div className="space-y-2">
                          {item.type === 'image' && item.url && (
                            <img
                              src={item.url.startsWith('http') ? item.url : `${BACKEND_URL}${item.url}`}
                              alt={item.title}
                              className="w-full h-32 object-cover rounded-xl border border-slate-200"
                            />
                          )}
                          {item.type === 'video' && item.url && (
                            <video
                              src={item.url.startsWith('http') ? item.url : `${BACKEND_URL}${item.url}`}
                              controls
                              className="w-full h-32 object-cover rounded-xl border border-slate-200"
                            />
                          )}
                          <h4 className="font-bold text-sm text-slate-900 break-words">{item.title}</h4>
                          <p className="text-xs text-slate-550 leading-relaxed break-words">{item.description}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold self-start uppercase tracking-wider">
                          {item.type} · {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </Interactive3DCard>
              );
            })()}

            {/* Projects */}
            <Interactive3DCard className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                  <FolderGit className="h-5 w-5 text-indigo-500" />
                </div>
                <h2 className="text-slate-900 font-black text-base tracking-tight">Development Projects</h2>
              </div>

              {!profile.projects || profile.projects.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold bg-slate-55 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                  This student has not added development projects yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {profile.projects.map((p: any) => (
                    <div key={p.id} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0 relative group">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                        <div className="flex gap-3">
                          {p.githubUrl && (
                            <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="GitHub Code">
                              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                              </svg>
                            </a>
                          )}
                          {p.projectUrl && (
                            <a href={p.projectUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-600 transition-colors" title="Live Preview">
                              <Globe className="h-4.5 w-4.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-slate-500 text-xs mt-2 leading-relaxed font-semibold">
                        {p.description}
                      </p>

                      {p.technologies && (
                        <div className="flex flex-wrap gap-1.5 mt-3.5">
                          {JSON.parse(p.technologies).map((tech: string) => (
                            <span key={tech} className="text-[9px] font-extrabold bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full hover:border-slate-300 transition-colors cursor-default">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Interactive3DCard>
          </div>

          {/* Skills & Certs column */}
          <div className="space-y-6">
            
            {/* Skills */}
            <Interactive3DCard className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-55 bg-indigo-50 border border-indigo-100 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                  <Code className="h-5 w-5 text-indigo-500" />
                </div>
                <h2 className="text-slate-900 font-black text-sm tracking-tight">Technical Skills</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {!profile.skills || profile.skills.length === 0 ? (
                  <p className="text-xs text-slate-500 font-semibold">No skills listed.</p>
                ) : (
                  profile.skills.map((s: any) => (
                    <span 
                      key={s.id} 
                      className="text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-full px-3 py-1 transition-all hover:scale-105 hover:shadow-md hover:shadow-slate-500/5 cursor-default"
                    >
                      {s.name}
                    </span>
                  ))
                )}
              </div>
            </Interactive3DCard>

            {/* Certifications */}
            <Interactive3DCard className="space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-2xl shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                  <Award className="h-5 w-5 text-indigo-500" />
                </div>
                <h2 className="text-slate-900 font-black text-sm tracking-tight">Verified Badges</h2>
              </div>

              {!profile.certifications || profile.certifications.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold text-center py-4">No verified certificates listed.</p>
              ) : (
                <div className="space-y-4">
                  {profile.certifications.map((c: any) => (
                    <div key={c.id} className="text-xs font-semibold bg-slate-50/50 border border-slate-200 hover:border-slate-300 p-3.5 rounded-2xl transition-all hover:shadow-[0_2px_8px_rgba(99,102,241,0.02)]">
                      <span className="block text-slate-900 font-bold leading-snug">{c.name}</span>
                      <span className="block text-[10px] text-indigo-600 mt-1">{c.issuer}</span>
                      {c.credentialId && (
                        <span className="inline-block text-[9px] font-mono bg-white border border-slate-200 text-slate-400 px-2 py-0.5 rounded mt-2.5 select-all">
                          ID: {c.credentialId}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Interactive3DCard>
          </div>
        </div>

      </div>
    </div>
  );
}
