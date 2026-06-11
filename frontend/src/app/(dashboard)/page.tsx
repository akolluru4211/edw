'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  TrendingUp, Briefcase, Users, BookOpen, Sparkles,
  ArrowRight, CheckCircle2, ChevronRight, Award, FileText,
  Zap, Target, Star
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [score, setScore] = useState(20);
  const [loadingScore, setLoadingScore] = useState(true);
  const [stats, setStats] = useState({ connections: 0, applications: 0, certifications: 0 });
  const [tips, setTips] = useState<string[]>([]);
  const [hasResumes, setHasResumes] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);
  const [hasExp, setHasExp] = useState(false);
  const [birthdays, setBirthdays] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const [scoreRes, profileRes, resumeRes] = await Promise.all([
          api.get('/profile/readiness'),
          api.get(`/profile/${user.id}`),
          api.get('/resume').catch(() => ({ data: [] }))
        ]);
        const s = scoreRes.data.readinessScore || 20;
        setScore(s);
        const d = profileRes.data;
        const resumeList = resumeRes.data;
        setHasResumes(resumeList.length > 0);
        setHasProjects(d.projects?.length > 0);
        setHasExp(d.experience?.length > 0);
        setStats({
          connections: d.user?.connections?.length || 0,
          applications: d.user?.applications?.length || 0,
          certifications: d.certifications?.length || 0
        });

        const t: string[] = [];
        if (!resumeList.length) t.push('Upload your resume to get an ATS score and keyword analysis');
        if (!d.skills?.length) t.push('Add technical skills so AI can match you to relevant opportunities');
        if (!d.experience?.length) t.push('Add internships or work experience to boost your readiness score by 10 points');
        if (!d.projects?.length) t.push('Showcase a project to demonstrate your abilities to recruiters');
        if (t.length === 0) {
          t.push('Great progress! Try a mock interview in Interview Prep to sharpen your skills');
          t.push('Connect with alumni from your university to expand your network');
        }
        setTips(t);
        
        // Fetch birthdays
        const birthdaysRes = await api.get('/profile/birthdays').catch(() => ({ data: [] }));
        setBirthdays(birthdaysRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingScore(false);
      }
    })();
  }, [user]);

  const checklist = [
    { label: 'Create your account', done: true, href: '#' },
    { label: 'Fill academic details', done: !!user?.profile?.collegeName, href: '/portfolio' },
    { label: 'Add technical skills', done: !!(user?.profile?.interests), href: '/portfolio' },
    { label: 'Upload a resume', done: hasResumes, href: '/resume' },
    { label: 'Add work experience', done: hasExp, href: '/portfolio' },
    { label: 'Add a portfolio project', done: hasProjects, href: '/portfolio' },
  ];
  const doneCount = checklist.filter(c => c.done).length;
  const completePct = Math.round((doneCount / checklist.length) * 100);

  const radius = 42, stroke = 6;
  const circ = (radius - stroke) * 2 * Math.PI;
  const dash = circ - (score / 100) * circ;

  const statCards = [
    { label: 'Network Connections', val: stats.connections, icon: Users, color: 'bg-blue-50 text-blue-600', href: '/network' },
    { label: 'Applications', val: stats.applications, icon: Briefcase, color: 'bg-sky-50 text-sky-600', href: '/jobs' },
    { label: 'Certifications', val: stats.certifications, icon: Award, color: 'bg-amber-50 text-amber-600', href: '/portfolio' },
    { label: 'ATS Resumes', val: hasResumes ? '1 Uploaded' : 'Not Uploaded', icon: FileText, color: 'bg-emerald-50 text-emerald-600', href: '/resume' },
  ];

  const quickLinks = [
    { label: 'AI Career Advice', desc: 'Ask about your career path', href: '/ai-coach', icon: Sparkles, accent: 'from-sky-500 to-blue-600' },
    { label: 'Scan My Resume', desc: 'ATS keyword analysis', href: '/resume', icon: FileText, accent: 'from-violet-500 to-purple-600' },
    { label: 'Practice Interview', desc: 'Mock coding questions', href: '/interview-prep', icon: Zap, accent: 'from-amber-500 to-orange-500' },
    { label: 'Browse Jobs', desc: 'Skill-matched opportunities', href: '/jobs', icon: Target, accent: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Birthdays Celebrations */}
      {birthdays.length > 0 && (
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 border border-pink-100 rounded-2xl p-5 text-white flex items-center justify-between gap-4 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden animate-fade-in group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <div className="flex items-center gap-4 z-10">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl animate-bounce">
              🎉
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">Today's Celebrations! 🎂</h3>
              <p className="text-xs text-pink-50/90 font-medium mt-1 leading-relaxed">
                Happy Birthday to {birthdays.map((b, idx) => (
                  <span key={b.userId} className="font-bold underline decoration-white/50">
                    {b.fullName}{idx < birthdays.length - 1 ? ', ' : ''}
                  </span>
                ))}! Wishing you a fantastic day and great success ahead! ✨🚀
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 z-10 shrink-0 text-2xl select-none animate-pulse">
            🎈🎁🎈
          </div>
        </div>
      )}
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here's your career progress today — keep building!
          </p>
        </div>
        <Link
          href="/ai-coach"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:from-sky-700 hover:to-blue-700 transition-all shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI Coach
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div className={`${s.color} p-2.5 rounded-xl shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-black text-slate-900">{s.val}</p>
                <p className="text-xs text-slate-500 truncate">{s.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Readiness + Checklist */}
        <div className="lg:col-span-2 space-y-6">

          {/* Readiness + Setup in one card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
            {/* Score ring */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Readiness</p>
              <div className="relative">
                <svg height={radius * 2} width={radius * 2} className="-rotate-90">
                  <circle stroke="#f1f5f9" fill="transparent" strokeWidth={stroke} r={radius - stroke} cx={radius} cy={radius} />
                  <circle
                    stroke="url(#grad)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={`${circ} ${circ}`}
                    style={{ strokeDashoffset: loadingScore ? circ : dash, transition: 'stroke-dashoffset 1s ease' }}
                    r={radius - stroke}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900">{loadingScore ? '—' : score}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Score</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full
                ${score < 40 ? 'bg-red-50 text-red-600' : score < 75 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {score < 40 ? 'Novice' : score < 75 ? 'Progressing' : 'Job Ready ✓'}
              </span>
            </div>

            {/* Checklist */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-slate-900 text-sm">Profile Setup</p>
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">{completePct}% done</span>
              </div>
              <div className="space-y-2.5">
                {checklist.map((item) => (
                  <Link key={item.label} href={item.href} className="flex items-center gap-3 group">
                    <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 transition-colors ${item.done ? 'text-sky-500' : 'text-slate-200 group-hover:text-slate-300'}`} />
                    <span className={`text-sm ${item.done ? 'text-slate-700 line-through decoration-slate-300' : 'text-slate-500 group-hover:text-slate-700'} transition-colors`}>
                      {item.label}
                    </span>
                    {!item.done && <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto group-hover:text-sky-500 transition-colors" />}
                  </Link>
                ))}
              </div>
              <Link
                href="/portfolio"
                className="mt-4 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-sky-700 transition-all"
              >
                Complete Portfolio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* AI Tips */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-sky-50 rounded-xl">
                <Sparkles className="h-4.5 w-4.5 text-sky-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">AI Recommendations</p>
                <p className="text-xs text-slate-500">Based on your current profile state</p>
              </div>
            </div>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-6 w-6 rounded-full bg-sky-100 text-sky-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="font-bold text-slate-900 text-sm mb-4">Quick Actions</p>
            <div className="space-y-3">
              {quickLinks.map((q) => {
                const Icon = q.icon;
                return (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="flex items-center gap-3.5 p-3.5 border border-slate-100 hover:border-sky-100 rounded-xl hover:bg-sky-50/30 transition-all group"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${q.accent} text-white shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-700 transition-colors">{q.label}</p>
                      <p className="text-xs text-slate-400">{q.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Achievement badge */}
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white text-center relative overflow-hidden">
            <div className="absolute -top-6 -right-6 h-24 w-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 bg-white/10 rounded-full" />
            <div className="relative">
              <div className="inline-flex items-center justify-center h-12 w-12 bg-white/20 rounded-xl mb-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              <p className="font-black text-base">
                {score < 40 ? 'Novice Builder' : score < 75 ? 'Career Competitor' : 'Hiring Ready 💎'}
              </p>
              <p className="text-sky-100 text-xs mt-1.5 leading-relaxed">
                {score < 40 ? 'Add skills and projects to level up.' : score < 75 ? 'Upload resume and add experience!' : 'Your profile is highly competitive.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
