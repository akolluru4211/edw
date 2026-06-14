'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api, BACKEND_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  UserCircle, FileText, Briefcase, GraduationCap,
  TrendingUp, ArrowRight, Code, Award, Edit3,
  Camera, Globe, X, Check, Eye, Loader2, Sparkles,
  Download, Mail
} from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas-pro';

export default function ProfileHub() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<'overview' | 'resumes' | 'applications'>('overview');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingCard, setDownloadingCard] = useState(false);

  const downloadIDCard = async () => {
    const cardElement = document.getElementById('edworld-career-card');
    if (!cardElement) return;

    setDownloadingCard(true);
    try {
      const canvas = await html2canvas(cardElement, {
        useCORS: true,
        backgroundColor: null,
        scale: 3,
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Edworld-ID-${user?.fullName?.replace(/\s+/g, '-') || 'Card'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download ID card:', err);
    } finally {
      setDownloadingCard(false);
    }
  };

  // Avatar Photo Upload States
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Profile Edit Modal States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    collegeName: '',
    degree: '',
    branch: '',
    graduationYear: '',
    headline: '',
    dob: ''
  });

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/profile/${user.id}`);
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const openEditModal = () => {
    let dobVal = '';
    if (profileData?.dob) {
      try {
        dobVal = new Date(profileData.dob).toISOString().substring(0, 10);
      } catch (err) {
        console.warn('Failed to parse dob for form initialization:', err);
      }
    }
    setEditForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      bio: profileData?.bio || '',
      collegeName: profileData?.collegeName || '',
      degree: profileData?.degree || '',
      branch: profileData?.branch || '',
      graduationYear: String(profileData?.graduationYear || ''),
      headline: profileData?.headline || '',
      dob: dobVal
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Update profile & user table fields
      await api.put('/profile', {
        fullName: editForm.fullName,
        email: editForm.email,
        phoneNumber: editForm.phoneNumber,
        collegeName: editForm.collegeName,
        degree: editForm.degree,
        branch: editForm.branch,
        graduationYear: Number(editForm.graduationYear),
        bio: editForm.bio,
        headline: editForm.headline,
        dob: editForm.dob || null
      });

      await refreshUser();
      await fetchProfileData();
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to save profile details:', err);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshUser();
      await fetchProfileData();
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      setAvatarError(err.response?.data?.error || 'Failed to upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  const skills = profileData?.skills || [];
  const projects = profileData?.projects || [];
  const certs = profileData?.certifications || [];
  const exp = profileData?.experience || [];
  const resumes = profileData?.resumes || profileData?.user?.resumes || [];
  const applications = profileData?.user?.applications || [];

  const initials = user?.fullName?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserCircle },
    { id: 'resumes', label: 'Resumes', icon: FileText, count: resumes.length },
    { id: 'applications', label: 'Applications', icon: Briefcase, count: applications.length },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden file input for avatar upload */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarSelect}
        className="hidden"
      />

      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar block with upload trigger */}
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0 cursor-pointer overflow-hidden group select-none"
              title="Click to change profile photo"
            >
              {user?.profile?.avatarUrl ? (
                <img 
                  src={`${BACKEND_URL}${user.profile.avatarUrl}`} 
                  alt="Avatar" 
                  className="h-full w-full object-cover" 
                  crossOrigin="anonymous"
                />
              ) : (
                <span>{initials}</span>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[10px] font-bold text-white gap-1">
                <Camera className="h-4 w-4" />
                <span>Upload</span>
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{user?.fullName}</h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {profileData?.headline || 'Add a professional headline to stand out'}
              </p>
              {user?.profile?.collegeName && (
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  <span>{user.profile.degree} in {user.profile.branch} · {user.profile.collegeName}</span>
                </div>
              )}
              {user?.email && (
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
                  <Mail className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  <span>{user.email}</span>
                </div>
              )}
              {user?.phoneNumber && (
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
                  <span className="text-sm shrink-0">📞</span>
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-block text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full uppercase">
                  {user?.role}
                </span>
                {user?.memberId && (
                  <span className="inline-block text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    ID: {user.memberId}
                  </span>
                )}
                {profileData?.dob && (
                  <span className="inline-block text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                    🎂 DOB: {new Date(profileData.dob).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                {profileData?.readinessScore !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    {profileData.readinessScore}% Ready
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <Edit3 className="h-4 w-4 text-slate-500" />
              Edit Profile
            </button>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Configure Portfolio
            </Link>
          </div>
        </div>
        {avatarError && (
          <p className="text-xs text-red-600 mt-2 font-medium">{avatarError}</p>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-600'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* About bio */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-bold text-slate-900 text-base mb-3">About Summary</h2>
              {profileData?.bio ? (
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{profileData.bio}</p>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-400 text-sm">No bio summary written yet.</p>
                  <button onClick={openEditModal} className="text-sky-600 text-sm font-semibold hover:underline">Add one →</button>
                </div>
              )}

              {/* Technical Skills */}
              {skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="h-4 w-4 text-slate-500" />
                    <h3 className="font-semibold text-slate-700 text-sm">Technical Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s: any) => (
                      <span key={s.id} className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5 text-slate-500" />
                  <h2 className="font-bold text-slate-900 text-base">Work Experience</h2>
                </div>
                <Link href="/portfolio" className="text-xs text-sky-600 font-semibold hover:underline flex items-center gap-1">
                  Configure <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              {exp.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                  <Briefcase className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No professional experience listed yet</p>
                  <Link href="/portfolio" className="inline-flex items-center gap-1 text-sky-600 text-xs font-semibold mt-2 hover:underline">
                    Add experience → 
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {exp.map((e: any) => (
                    <div key={e.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                        <Briefcase className="h-4 w-4 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{e.role}</p>
                        <p className="text-sky-600 text-xs font-semibold mt-0.5">{e.company}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{fmt(e.startDate)} – {e.endDate ? fmt(e.endDate) : 'Present'}</p>
                        {e.description && <p className="text-slate-500 text-xs mt-2 leading-relaxed">{e.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            {projects.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-4.5 w-4.5 text-slate-500" />
                  <h2 className="font-bold text-slate-900 text-base">Projects ({projects.length})</h2>
                </div>
                <div className="space-y-3">
                  {projects.map((p: any) => {
                    let techs: string[] = [];
                    try { techs = JSON.parse(p.technologies || '[]'); } catch {}
                    return (
                      <div key={p.id} className="border border-slate-200 rounded-xl p-4">
                        <p className="font-semibold text-slate-900 text-sm">{p.title}</p>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{p.description}</p>
                        {techs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {techs.map(t => <span key={t} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column: ID Card + Stats */}
          <div className="space-y-6">
            
            {/* 🪪 interactive Edworld Co. ID Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 text-base">Edworld Career Card</h2>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                  <Check className="h-3 w-3" /> Active
                </span>
              </div>
              
              {/* ID Card Wrapper */}
              <div id="edworld-career-card" className="relative w-full max-w-[450px] sm:aspect-[1.586/1] min-h-[220px] sm:min-h-0 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-xl border border-slate-800 mx-auto">
                {/* Visual Glassmorphic glow circles */}
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-500/20 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                
                {/* Top header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 z-10 shrink-0">
                  <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-6 w-6 rounded-lg object-contain bg-white p-0.5" />
                    <span className="font-black text-xs tracking-tight bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent">
                      EDWORLD CO.
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      verified member
                    </span>
                    <span className="text-[7.5px] font-mono text-sky-400 font-bold tracking-wider mt-1 uppercase">
                      ID: {user?.memberId || `EDW-${user?.id?.slice(0, 8).toUpperCase() || 'MEMBER'}`}
                    </span>
                  </div>
                </div>

                {/* Body info */}
                <div className="flex-1 flex gap-3.5 items-center mt-3.5 z-10 min-w-0">
                  {/* Photo area */}
                  <div className="h-16 w-16 rounded-xl border border-white/20 bg-slate-800/80 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    {user?.profile?.avatarUrl ? (
                      <img src={`${BACKEND_URL}${user.profile.avatarUrl}`} alt="Avatar" className="h-full w-full object-cover" crossOrigin="anonymous" />
                    ) : (
                      <span className="font-black text-xl text-sky-400">{initials}</span>
                    )}
                  </div>
                  {/* Info text */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="font-black text-sm tracking-tight truncate">{user?.fullName}</h3>
                    <span className="inline-block text-[8px] font-black tracking-widest text-sky-400 uppercase border border-sky-500/20 bg-sky-500/5 px-1.5 py-0.5 rounded-md">
                      {user?.role}
                    </span>
                    <p className="text-[9.5px] text-slate-300 leading-tight truncate mt-1">
                      {profileData?.collegeName ? `${profileData.degree} · ${profileData.collegeName}` : 'Stanford University'}
                    </p>
                    <p className="text-[8.5px] text-slate-400 truncate leading-tight mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-end justify-between border-t border-white/10 pt-2.5 mt-2.5 z-10 shrink-0">
                  {/* Readiness metric */}
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-slate-400">career readiness</span>
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {profileData?.readinessScore || 20}% Score
                    </span>
                  </div>
                  {/* QR Code instead of Barcode */}
                  <div className="flex flex-col items-end gap-1 select-none shrink-0">
                    <div className="bg-white p-1 rounded-lg">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://edworld.co.in/u/${profileData?.portfolioUrl || user?.profile?.portfolioUrl || user?.id}`)}`} 
                        alt="QR Code" 
                        className="h-[36px] w-[36px] object-contain" 
                        crossOrigin="anonymous"
                      />
                    </div>
                    <span className="text-[6.5px] font-mono text-slate-400">SCAN PORTFOLIO</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={downloadIDCard}
                  disabled={downloadingCard}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-100 cursor-pointer"
                >
                  <Download className="h-4 w-4" /> 
                  {downloadingCard ? 'Downloading...' : 'Download PNG'}
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer"
                >
                  <span className="text-sm">🖨️</span> Print Card
                </button>
              </div>

            </div>

            {/* Profile Stats */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-bold text-slate-900 text-base mb-4">Profile Stats</h2>
              <div className="space-y-3">
                {[
                  { label: 'Work Experience', val: exp.length, icon: Briefcase },
                  { label: 'Projects', val: projects.length, icon: GraduationCap },
                  { label: 'Technical Skills', val: skills.length, icon: Code },
                  { label: 'Certifications', val: certs.length, icon: Award },
                ].map(({ label, val, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{label}</span>
                    </div>
                    <span className={`font-bold text-sm ${val > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Career Readiness</span>
                  <span className="font-black text-sky-600">{profileData?.readinessScore || 20}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${profileData?.readinessScore || 20}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Certifications */}
            {certs.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4.5 w-4.5 text-amber-500" />
                  <h2 className="font-bold text-slate-900 text-base">Certifications</h2>
                </div>
                <div className="space-y-3">
                  {certs.map((c: any) => (
                    <div key={c.id} className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{c.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Resumes Tab ── */}
      {tab === 'resumes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900 text-base">My Resumes</h2>
            <Link href="/resume" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <FileText className="h-4 w-4" /> Upload Resume
            </Link>
          </div>
          {resumes.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
              <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium text-sm">No resumes uploaded yet</p>
              <Link href="/resume" className="inline-flex items-center gap-1 mt-3 text-sky-600 text-sm font-semibold hover:underline">
                Upload your first resume →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resumes.map((r: any) => (
                <div key={r.id} className="border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-sky-50 rounded-xl shrink-0">
                    <FileText className="h-5 w-5 text-sky-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm truncate">{r.fileName}</p>
                    <p className="text-slate-400 text-xs mt-0.5">ATS Score: <span className="font-bold text-emerald-600">{r.atsScore}%</span></p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">Analyzed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Applications Tab ── */}
      {tab === 'applications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900 text-base">Job Applications</h2>
            <Link href="/jobs" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <Briefcase className="h-4 w-4" /> Browse Jobs
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
              <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium text-sm">No applications submitted yet</p>
              <Link href="/jobs" className="inline-flex items-center gap-1 mt-3 text-sky-600 text-sm font-semibold hover:underline">
                Browse job listings →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((a: any) => {
                const statusColors: Record<string, string> = {
                  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
                  SHORTLISTED: 'bg-sky-50 text-sky-700 border-sky-200',
                  INTERVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
                  OFFER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  REJECTED: 'bg-red-50 text-red-700 border-red-200',
                };
                return (
                  <div key={a.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{a.opportunity?.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{a.opportunity?.companyName}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{new Date(a.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${statusColors[a.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ✍️ Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-sky-500" />
                <h3 className="font-black text-slate-900 text-sm">Edit Profile Information</h3>
              </div>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-150 mb-1 select-none">
                <div className="relative h-14 w-14 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
                  {user?.profile?.avatarUrl ? (
                    <img 
                      src={`${BACKEND_URL}${user.profile.avatarUrl}`} 
                      alt="Avatar" 
                      className="h-full w-full object-cover" 
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span className="font-bold text-base text-slate-500">{initials}</span>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Profile Picture</h4>
                  <p className="text-[10px] text-slate-450 mt-0.5">Change your public profile picture</p>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="mt-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1.5 focus:outline-none"
                  >
                    <Camera className="h-3.5 w-3.5" /> Upload New Photo
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Career Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Aspiring Full Stack Engineer | React & Node.js"
                    value={editForm.headline}
                    onChange={e => setEditForm({ ...editForm, headline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">College / University</label>
                  <input
                    type="text"
                    required
                    value={editForm.collegeName}
                    onChange={e => setEditForm({ ...editForm, collegeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Degree</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech, M.S., Ph.D."
                    value={editForm.degree}
                    onChange={e => setEditForm({ ...editForm, degree: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Major / Branch</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={editForm.branch}
                    onChange={e => setEditForm({ ...editForm, branch: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Graduation Year</label>
                  <input
                    type="number"
                    required
                    value={editForm.graduationYear}
                    onChange={e => setEditForm({ ...editForm, graduationYear: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={e => setEditForm({ ...editForm, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Short Bio / Summary</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell recruiters about yourself..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center gap-3 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
