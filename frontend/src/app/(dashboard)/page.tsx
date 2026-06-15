'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  TrendingUp, Briefcase, Users, BookOpen, Sparkles,
  ArrowRight, CheckCircle2, ChevronRight, Award, FileText,
  Zap, Target, Star, User, ArrowLeft, Check, Plus, X, Globe, Mail, ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [score, setScore] = useState(20);
  const [loadingScore, setLoadingScore] = useState(true);
  const [stats, setStats] = useState({ connections: 0, applications: 0, certifications: 0 });
  const [tips, setTips] = useState<string[]>([]);
  const [hasResumes, setHasResumes] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);
  const [hasExp, setHasExp] = useState(false);
  const [birthdays, setBirthdays] = useState<any[]>([]);

  // Onboarding Wizard States
  const [onboardStep, setOnboardStep] = useState(1);
  const [onboardCollegeName, setOnboardCollegeName] = useState('');
  const [onboardDegree, setOnboardDegree] = useState('');
  const [onboardBranch, setOnboardBranch] = useState('');
  const [onboardGraduationYear, setOnboardGraduationYear] = useState('2027');
  const [onboardInterests, setOnboardInterests] = useState<string[]>([]);
  const [onboardCustomInterest, setOnboardCustomInterest] = useState('');
  const [onboardGoals, setOnboardGoals] = useState<string[]>([]);
  const [onboardCustomGoal, setOnboardCustomGoal] = useState('');
  const [onboardBio, setOnboardBio] = useState('');
  const [onboardHeadline, setOnboardHeadline] = useState('');
  const [onboardFullName, setOnboardFullName] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardSaving, setOnboardSaving] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setOnboardFullName(user.fullName || '');
      setOnboardEmail(user.email || '');
      setOnboardCollegeName(user.profile?.collegeName === 'GITAM University' ? '' : user.profile?.collegeName || '');
      setOnboardDegree(user.profile?.degree === 'Bachelor of Technology' || user.profile?.degree === 'B.Tech' ? '' : user.profile?.degree || '');
      setOnboardBranch(user.profile?.branch === 'Computer Science and Engineering' || user.profile?.branch === 'CSE' ? '' : user.profile?.branch || '');
      setOnboardGraduationYear(user.profile?.graduationYear?.toString() || '2027');
      setOnboardBio(user.profile?.bio || '');
      setOnboardHeadline(user.profile?.headline || '');
      
      if (user.profile?.interests) {
        try {
          const parsed = JSON.parse(user.profile.interests);
          if (Array.isArray(parsed) && parsed.length > 0) setOnboardInterests(parsed);
        } catch (e) {}
      }
      if (user.profile?.goals) {
        try {
          const parsed = JSON.parse(user.profile.goals);
          if (Array.isArray(parsed) && parsed.length > 0) setOnboardGoals(parsed);
        } catch (e) {}
      }
    }
  }, [user]);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);
    
    if (!onboardFullName || !onboardEmail || !onboardCollegeName || !onboardDegree || !onboardBranch || !onboardGraduationYear) {
      setOnboardError('Please fill in all academic and account details.');
      return;
    }
    
    setOnboardSaving(true);
    try {
      await api.put('/profile', {
        fullName: onboardFullName,
        email: onboardEmail,
        collegeName: onboardCollegeName,
        degree: onboardDegree,
        branch: onboardBranch,
        graduationYear: Number(onboardGraduationYear),
        interests: onboardInterests,
        goals: onboardGoals,
        bio: onboardBio,
        headline: onboardHeadline || 'Student Developer',
        isOnboarded: true
      });
      
      await refreshUser();
    } catch (err: any) {
      console.error(err);
      setOnboardError(err.response?.data?.error || err.message || 'Onboarding failed to save.');
    } finally {
      setOnboardSaving(false);
    }
  };

  const popularInterests = [
    'Software Development', 'Machine Learning', 'Data Science', 
    'UI/UX Design', 'Product Management', 'Cyber Security', 
    'Web Development', 'Mobile Dev'
  ];

  const popularGoals = [
    'Internship', 'Placement', 'Startup Launch', 
    'Hackathons', 'Research Fellowship', 'M.Tech / Higher Studies'
  ];

  const toggleInterest = (val: string) => {
    if (onboardInterests.includes(val)) {
      setOnboardInterests(onboardInterests.filter(item => item !== val));
    } else {
      setOnboardInterests([...onboardInterests, val]);
    }
  };

  const toggleGoal = (val: string) => {
    if (onboardGoals.includes(val)) {
      setOnboardGoals(onboardGoals.filter(item => item !== val));
    } else {
      setOnboardGoals([...onboardGoals, val]);
    }
  };

  const addCustomInterest = () => {
    if (onboardCustomInterest && !onboardInterests.includes(onboardCustomInterest)) {
      setOnboardInterests([...onboardInterests, onboardCustomInterest]);
      setOnboardCustomInterest('');
    }
  };

  const addCustomGoal = () => {
    if (onboardCustomGoal && !onboardGoals.includes(onboardCustomGoal)) {
      setOnboardGoals([...onboardGoals, onboardCustomGoal]);
      setOnboardCustomGoal('');
    }
  };

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

      {/* Onboarding Wizard Modal */}
      {user && user.profile && user.profile.isOnboarded === false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white/95 border border-slate-200/80 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden p-6 md:p-8 space-y-6">
            
            {/* Stepper indicators */}
            <div className="relative mb-6">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 transform -translate-y-1/2 -z-10"></div>
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-sky-500 transform -translate-y-1/2 -z-10 transition-all duration-300"
                style={{ width: `${((onboardStep - 1) / 2) * 100}%` }}
              ></div>
              <div className="flex justify-between relative z-10">
                {[
                  { s: 1, label: 'Academic', icon: GraduationCap },
                  { s: 2, label: 'Interests', icon: Target },
                  { s: 3, label: 'Summary', icon: User },
                ].map((item) => {
                  const Icon = item.icon;
                  const isCompleted = onboardStep > item.s;
                  const isActive = onboardStep === item.s;
                  return (
                    <div key={item.s} className="flex flex-col items-center gap-1">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                        isCompleted 
                          ? 'bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-100' 
                          : isActive 
                          ? 'bg-white border-sky-500 text-sky-600 shadow-sm shadow-sky-100 ring-2 ring-sky-100' 
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}>
                        {isCompleted ? <Check className="h-4 w-4" /> : item.s}
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isActive ? 'text-sky-600' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {onboardError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-2xl flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{onboardError}</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              {/* Step 1: Academic Info */}
              {onboardStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Academic Overview</h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Let us know where you are studying so we can customize your dashboard recommendations.</p>
                  
                  <div>
                    <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alice Chen"
                      value={onboardFullName}
                      onChange={(e) => setOnboardFullName(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alice@gmail.com"
                      value={onboardEmail}
                      onChange={(e) => setOnboardEmail(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">College / University</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GITAM University"
                      value={onboardCollegeName}
                      onChange={(e) => setOnboardCollegeName(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Degree</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. B.Tech"
                        value={onboardDegree}
                        onChange={(e) => setOnboardDegree(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Branch / Field</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Computer Science"
                        value={onboardBranch}
                        onChange={(e) => setOnboardBranch(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Graduation Year</label>
                    <input
                      type="number"
                      required
                      placeholder="2027"
                      value={onboardGraduationYear}
                      onChange={(e) => setOnboardGraduationYear(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!onboardFullName || !onboardCollegeName || !onboardDegree || !onboardBranch || !onboardGraduationYear) {
                          setOnboardError('Please fill in all details.');
                        } else {
                          setOnboardError(null);
                          setOnboardStep(2);
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-sm transition-all"
                    >
                      Next Step <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Interests & Goals */}
              {onboardStep === 2 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Interests & Targets</h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Choose areas you are interested in and career targets so our RAG engine feeds relevant opportunities.</p>
                  
                  <div>
                    <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Interests</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {popularInterests.map((interest) => {
                        const active = onboardInterests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                              active 
                                ? 'bg-sky-500 border-sky-500 text-white shadow-sm' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add custom interest..."
                        value={onboardCustomInterest}
                        onChange={(e) => setOnboardCustomInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomInterest();
                          }
                        }}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={addCustomInterest}
                        className="bg-slate-800 text-white p-2 rounded-xl hover:bg-slate-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Career Goals</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {popularGoals.map((goal) => {
                        const active = onboardGoals.includes(goal);
                        return (
                          <button
                            type="button"
                            key={goal}
                            onClick={() => toggleGoal(goal)}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                              active 
                                ? 'bg-pink-500 border-pink-500 text-white shadow-sm' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add custom goal..."
                        value={onboardCustomGoal}
                        onChange={(e) => setOnboardCustomGoal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomGoal();
                          }
                        }}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={addCustomGoal}
                        className="bg-slate-800 text-white p-2 rounded-xl hover:bg-slate-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setOnboardStep(1)}
                      className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs px-5 py-3 rounded-2xl shadow-sm transition-all"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onboardInterests.length === 0 || onboardGoals.length === 0) {
                          setOnboardError('Please choose at least 1 interest and 1 goal.');
                        } else {
                          setOnboardError(null);
                          setOnboardStep(3);
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs px-5 py-3 rounded-2xl shadow-sm transition-all"
                    >
                      Next Step <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Biography */}
              {onboardStep === 3 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-slate-800 tracking-tight">Biography & Professional Title</h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Finish configuring your public digital card by introducing yourself.</p>
                  
                  <div>
                    <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Python Developer & CSE Student"
                      value={onboardHeadline}
                      onChange={(e) => setOnboardHeadline(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold text-[10px] uppercase tracking-wider mb-2">Biography (About You)</label>
                    <textarea
                      placeholder="Tell the community about your goals, interests, and background..."
                      value={onboardBio}
                      onChange={(e) => setOnboardBio(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200 h-28 resize-none"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      disabled={onboardSaving}
                      onClick={() => setOnboardStep(2)}
                      className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs px-5 py-3 rounded-2xl shadow-sm transition-all disabled:opacity-50"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={onboardSaving}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition-all disabled:opacity-70"
                    >
                      {onboardSaving ? 'Saving...' : 'Complete Profile'} <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
