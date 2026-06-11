'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  FolderGit, Award, Code, ExternalLink, Plus, Trash2,
  Save, Globe, CheckCircle, GraduationCap, Briefcase, X, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 transform [perspective:1000px] hover:[transform:rotateX(0.5deg)_rotateY(0.5deg)_translateY(-6px)]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-white via-white to-sky-50/20">
        <div className="p-2 bg-sky-50 border border-sky-100 rounded-xl shrink-0">
          <Icon className="h-4.5 w-4.5 text-sky-600" />
        </div>
        <h2 className="font-bold text-slate-900 text-base tracking-tight">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-400 focus:bg-white transition-colors placeholder:text-slate-400";
const textareaCls = `${inputCls} resize-none`;

export default function PortfolioEditor() {
  const { user, refreshUser } = useAuth();
  const [bio, setBio] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [dob, setDob] = useState('');
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaSuccess, setMetaSuccess] = useState(false);

  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);

  const [newSkill, setNewSkill] = useState('');
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTechs, setNewProjTechs] = useState('');
  const [newProjUrl, setNewProjUrl] = useState('');
  const [newProjGit, setNewProjGit] = useState('');
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');
  const [newCertCred, setNewCertCred] = useState('');
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpStartDate, setNewExpStartDate] = useState('');
  const [newExpEndDate, setNewExpEndDate] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [showProjForm, setShowProjForm] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/profile/${user.id}`).then(res => {
      const d = res.data;
      setBio(d.bio || '');
      setCollegeName(d.collegeName || '');
      setDegree(d.degree || '');
      setBranch(d.branch || '');
      setGraduationYear(d.graduationYear?.toString() || '');
      setPortfolioUrl(d.portfolioUrl || '');
      setDob(d.dob ? new Date(d.dob).toISOString().substring(0, 10) : '');
      setSkills(d.skills || []);
      setProjects(d.projects || []);
      setCertifications(d.certifications || []);
      setExperiences(d.experience || []);
    }).catch(console.error);
  }, [user]);

  const handleUpdateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setMetaSaving(true);
    try {
      await api.put('/profile', { bio, collegeName, degree, branch, graduationYear: Number(graduationYear), portfolioUrl, dob: dob || null });
      setMetaSuccess(true);
      await refreshUser();
      setTimeout(() => setMetaSuccess(false), 3000);
    } catch (err) { console.error(err); } finally { setMetaSaving(false); }
  };

  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const res = await api.post('/profile/skills', { name: newSkill.trim() });
    setSkills([...skills, res.data]);
    setNewSkill('');
    await refreshUser();
  };

  const delSkill = async (id: string) => {
    await api.delete(`/profile/skills/${id}`);
    setSkills(skills.filter(s => s.id !== id));
    await refreshUser();
  };

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    const techs = newProjTechs.split(',').map(t => t.trim()).filter(Boolean);
    const res = await api.post('/profile/projects', {
      title: newProjTitle.trim(), description: newProjDesc.trim(),
      technologies: techs, projectUrl: newProjUrl || null, githubUrl: newProjGit || null
    });
    setProjects([...projects, res.data]);
    setNewProjTitle(''); setNewProjDesc(''); setNewProjTechs(''); setNewProjUrl(''); setNewProjGit('');
    setShowProjForm(false);
    await refreshUser();
  };

  const delProject = async (id: string) => {
    await api.delete(`/profile/projects/${id}`);
    setProjects(projects.filter(p => p.id !== id));
    await refreshUser();
  };

  const addCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertName.trim()) return;
    const res = await api.post('/profile/certifications', {
      name: newCertName.trim(), issuer: newCertIssuer.trim(), issueDate: newCertDate, credentialId: newCertCred || null
    });
    setCertifications([...certifications, res.data]);
    setNewCertName(''); setNewCertIssuer(''); setNewCertDate(''); setNewCertCred('');
    setShowCertForm(false);
    await refreshUser();
  };

  const addExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpCompany.trim() || !newExpRole.trim()) return;
    const res = await api.post('/profile/experience', {
      company: newExpCompany.trim(), role: newExpRole.trim(),
      startDate: newExpStartDate, endDate: newExpEndDate || null, description: newExpDesc.trim()
    });
    setExperiences([...experiences, res.data]);
    setNewExpCompany(''); setNewExpRole(''); setNewExpStartDate(''); setNewExpEndDate(''); setNewExpDesc('');
    setShowExpForm(false);
    await refreshUser();
  };

  const delExperience = async (id: string) => {
    await api.delete(`/profile/experience/${id}`);
    setExperiences(experiences.filter(e => e.id !== id));
    await refreshUser();
  };

  const fmt = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Portfolio Workspace</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your skills, projects, experience and public portfolio</p>
        </div>
        {portfolioUrl && (
          <Link
            href={`/u/${portfolioUrl}`}
            target="_blank"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0"
          >
            <Globe className="h-4 w-4" />
            edworld.co.in/u/{portfolioUrl}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column (2/3) */}
        <div className="xl:col-span-2 space-y-6">

          {/* ── Academic & Bio ── */}
          <SectionCard icon={GraduationCap} title="Academic Overview & Bio">
            <form onSubmit={handleUpdateMeta} className="space-y-4">
              <FieldRow label="Short Bio / Summary">
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="A short paragraph about yourself, your interests, and what you're looking for..."
                  className={textareaCls}
                />
              </FieldRow>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldRow label="College / University">
                  <input type="text" value={collegeName} onChange={e => setCollegeName(e.target.value)} className={inputCls} placeholder="e.g. IIT Bombay" />
                </FieldRow>
                <FieldRow label="Degree">
                  <input type="text" value={degree} onChange={e => setDegree(e.target.value)} className={inputCls} placeholder="e.g. B.Tech" />
                </FieldRow>
                <FieldRow label="Major / Branch">
                  <input type="text" value={branch} onChange={e => setBranch(e.target.value)} className={inputCls} placeholder="e.g. Computer Science" />
                </FieldRow>
                <FieldRow label="Graduation Year">
                  <input type="number" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} className={inputCls} placeholder="2025" min="2000" max="2035" />
                </FieldRow>
                <FieldRow label="Date of Birth">
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputCls} />
                </FieldRow>
              </div>

              <FieldRow label="Public Portfolio URL">
                <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-sky-400 transition-colors">
                  <span className="bg-slate-100 text-slate-500 text-sm px-4 py-2.5 border-r border-slate-200 shrink-0 select-none">edworld.co.in/u/</span>
                  <input
                    type="text"
                    value={portfolioUrl}
                    onChange={e => setPortfolioUrl(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="your-username"
                    className="flex-1 bg-white text-sm text-slate-800 px-4 py-2.5 focus:outline-none"
                  />
                </div>
              </FieldRow>

              <div className="flex items-center gap-3 justify-end pt-2">
                {metaSuccess && (
                  <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" /> Saved!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={metaSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {metaSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* ── Projects ── */}
          <SectionCard icon={FolderGit} title="Development Projects">
            {projects.length === 0 && !showProjForm && (
              <div className="text-center py-8">
                <FolderGit className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No projects yet</p>
                <p className="text-slate-400 text-xs mt-1">Add a project to showcase your work to recruiters</p>
              </div>
            )}

            {projects.length > 0 && (
              <div className="space-y-3 mb-4">
                {projects.map(p => {
                  let techs: string[] = [];
                  try { techs = JSON.parse(p.technologies || '[]'); } catch {}
                  return (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-4 flex gap-4 items-start hover:border-slate-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900 text-sm">{p.title}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-700"><ExternalLink className="h-3.5 w-3.5" /></a>}
                          </div>
                        </div>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{p.description}</p>
                        {techs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {techs.map(t => <span key={t} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{t}</span>)}
                          </div>
                        )}
                      </div>
                      <button onClick={() => delProject(p.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {showProjForm ? (
              <div className="border border-sky-200 bg-sky-50/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 text-sm">Add New Project</p>
                  <button onClick={() => setShowProjForm(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={addProject} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" required placeholder="Project Title *" value={newProjTitle} onChange={e => setNewProjTitle(e.target.value)} className={inputCls} />
                    <input type="text" placeholder="Tech stack (React, Node, SQL)" value={newProjTechs} onChange={e => setNewProjTechs(e.target.value)} className={inputCls} />
                  </div>
                  <textarea rows={2} required placeholder="What did you build? What problem does it solve? *" value={newProjDesc} onChange={e => setNewProjDesc(e.target.value)} className={textareaCls} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="url" placeholder="Demo URL (optional)" value={newProjUrl} onChange={e => setNewProjUrl(e.target.value)} className={inputCls} />
                    <input type="url" placeholder="GitHub URL (optional)" value={newProjGit} onChange={e => setNewProjGit(e.target.value)} className={inputCls} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowProjForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      <Plus className="h-4 w-4" /> Add Project
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowProjForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 text-slate-500 hover:text-sky-600 text-sm font-semibold rounded-xl transition-all"
              >
                <Plus className="h-4 w-4" /> Add Project
              </button>
            )}
          </SectionCard>

          {/* ── Work Experience ── */}
          <SectionCard icon={Briefcase} title="Work Experience & Internships">
            {experiences.length === 0 && !showExpForm && (
              <div className="text-center py-8">
                <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No experience listed yet</p>
                <p className="text-slate-400 text-xs mt-1">Adding work history boosts your career readiness by 10 points</p>
              </div>
            )}

            {experiences.length > 0 && (
              <div className="space-y-3 mb-4">
                {experiences.map(exp => (
                  <div key={exp.id} className="border border-slate-200 rounded-xl p-4 flex gap-4 items-start hover:border-slate-300 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{exp.role}</p>
                      <p className="text-sky-600 text-xs font-semibold mt-0.5">{exp.company}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {fmt(exp.startDate)} – {exp.endDate ? fmt(exp.endDate) : 'Present'}
                      </p>
                      {exp.description && <p className="text-slate-500 text-xs mt-2 leading-relaxed">{exp.description}</p>}
                    </div>
                    <button onClick={() => delExperience(exp.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showExpForm ? (
              <div className="border border-sky-200 bg-sky-50/30 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 text-sm">Add Work Experience</p>
                  <button onClick={() => setShowExpForm(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={addExperience} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" required placeholder="Company Name *" value={newExpCompany} onChange={e => setNewExpCompany(e.target.value)} className={inputCls} />
                    <input type="text" required placeholder="Your Role / Title *" value={newExpRole} onChange={e => setNewExpRole(e.target.value)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date *</label>
                      <input type="date" required value={newExpStartDate} onChange={e => setNewExpStartDate(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date (blank = current)</label>
                      <input type="date" value={newExpEndDate} onChange={e => setNewExpEndDate(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <textarea rows={3} required placeholder="Key responsibilities and achievements *" value={newExpDesc} onChange={e => setNewExpDesc(e.target.value)} className={textareaCls} />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowExpForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      <Plus className="h-4 w-4" /> Add Experience
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowExpForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 text-slate-500 hover:text-sky-600 text-sm font-semibold rounded-xl transition-all"
              >
                <Plus className="h-4 w-4" /> Add Experience
              </button>
            )}
          </SectionCard>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">

          {/* ── Skills ── */}
          <SectionCard icon={Code} title="Technical Skills">
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map(s => (
                  <div key={s.id} className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <span>{s.name}</span>
                    <button onClick={() => delSkill(s.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-4 mb-3">No skills added yet</p>
            )}
            <form onSubmit={addSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. TypeScript, React..."
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-sky-400 focus:bg-white transition-colors"
              />
              <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Add
              </button>
            </form>
          </SectionCard>

          {/* ── Certifications ── */}
          <SectionCard icon={Award} title="Certifications">
            {certifications.length > 0 && (
              <div className="space-y-3 mb-4">
                {certifications.map(c => (
                  <div key={c.id} className="border border-slate-200 rounded-xl p-3.5">
                    <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{c.issuer}</p>
                    <p className="text-slate-400 text-xs mt-0.5">Issued {new Date(c.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                    {c.credentialId && <p className="text-slate-400 text-xs mt-1 font-mono">ID: {c.credentialId}</p>}
                  </div>
                ))}
              </div>
            )}

            {showCertForm ? (
              <div className="border border-sky-200 bg-sky-50/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900 text-sm">Add Certification</p>
                  <button onClick={() => setShowCertForm(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={addCert} className="space-y-3">
                  <input type="text" required placeholder="Certificate Name *" value={newCertName} onChange={e => setNewCertName(e.target.value)} className={inputCls} />
                  <input type="text" required placeholder="Issuer (AWS, Coursera, etc.) *" value={newCertIssuer} onChange={e => setNewCertIssuer(e.target.value)} className={inputCls} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Issue Date *</label>
                      <input type="date" required value={newCertDate} onChange={e => setNewCertDate(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Credential ID</label>
                      <input type="text" placeholder="Optional" value={newCertCred} onChange={e => setNewCertCred(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowCertForm(false)} className="flex-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      <Plus className="h-4 w-4" /> Save
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowCertForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 text-slate-500 hover:text-sky-600 text-sm font-semibold rounded-xl transition-all"
              >
                <Plus className="h-4 w-4" /> Add Certification
              </button>
            )}
          </SectionCard>

          {/* Tip */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Pro tip:</strong> A complete portfolio with skills, projects, experience and a resume can raise your career readiness score to 90%+, making you visible to top recruiters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
