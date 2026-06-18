'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase, MapPin, DollarSign, Sparkles, Search,
  ArrowRight, CheckCircle, TrendingUp, RefreshCw, Filter, Clock,
  Building2, ChevronDown, ChevronUp
} from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  companyName: string;
  companyType: 'STARTUP' | 'ENTERPRISE';
  location: string;
  salary?: string;
  remote: boolean;
  type: 'JOB' | 'INTERNSHIP' | 'HACKATHON' | 'SCHOLARSHIP';
  skillsRequired: string[];
  description: string;
  matchScore: number;
  matchExplanation: string;
}

interface Application {
  id: string;
  opportunityId: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  appliedAt: string;
  opportunity: Opportunity;
}

const TYPE_COLORS: Record<string, string> = {
  JOB: 'bg-blue-50 text-blue-700 border-blue-200',
  INTERNSHIP: 'bg-sky-50 text-sky-700 border-sky-200',
  HACKATHON: 'bg-violet-50 text-violet-700 border-violet-200',
  SCHOLARSHIP: 'bg-amber-50 text-amber-700 border-amber-200',
};

const COMPANY_TYPE_COLORS: Record<string, string> = {
  STARTUP: 'bg-purple-50 text-purple-700 border-purple-200',
  ENTERPRISE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED'];

export default function OpportunitiesHub() {
  const { refreshUser } = useAuth();
  const [ops, setOps] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [tab, setTab] = useState<'browse' | 'pipeline'>('browse');
  const [typeFilter, setTypeFilter] = useState('');
  const [companyTypeFilter, setCompanyTypeFilter] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [expandedReason, setExpandedReason] = useState<Record<string, boolean>>({});

  const fetchOps = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (typeFilter) q.set('type', typeFilter);
      if (companyTypeFilter) q.set('companyType', companyTypeFilter);
      if (remoteOnly) q.set('remote', 'true');
      const res = await api.get(`/opportunities?${q}`);
      setOps(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchApps = async () => {
    try {
      const res = await api.get('/opportunities/applications');
      setApplications(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchOps(); fetchApps(); }, [search, typeFilter, companyTypeFilter, remoteOnly]);

  const handleApply = async (opId: string) => {
    setApplyingId(opId);
    try {
      await api.post(`/opportunities/apply/${opId}`);
      fetchOps(); fetchApps();
      await refreshUser();
    } catch (e: any) {
      setApplyError('Could not apply. Please try again.');
      setTimeout(() => setApplyError(null), 4000);
    } finally { setApplyingId(null); }
  };

  const advanceStatus = async (appId: string, status: string) => {
    await api.put(`/opportunities/applications/${appId}/status`, { status });
    fetchApps();
  };

  const toggleReason = (id: string) => {
    setExpandedReason(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isApplied = (id: string) => applications.some(a => a.opportunityId === id);

  const formatBoldText = (text: string) => {
    if (!text) return '';
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="space-y-6">
      {applyError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-xl">{applyError}</div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Opportunities Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Ingesting live job & internship openings from startups and big tech enterprises</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setTab('browse')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'browse' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'pipeline' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            My Applications {applications.length > 0 && <span className="ml-1.5 text-[11px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">{applications.length}</span>}
          </button>
        </div>
      </div>

      {tab === 'browse' ? (
        <div className="space-y-5">
          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col xl:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by role, company, or required skill..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-colors placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto justify-end">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-sm text-slate-700 font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-400 transition-colors"
              >
                <option value="">All Formats</option>
                <option value="JOB">Jobs</option>
                <option value="INTERNSHIP">Internships</option>
              </select>

              <select
                value={companyTypeFilter}
                onChange={e => setCompanyTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-sm text-slate-700 font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-400 transition-colors"
              >
                <option value="">All Scales</option>
                <option value="STARTUP">Startups</option>
                <option value="ENTERPRISE">Enterprise / Big Tech</option>
              </select>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer select-none">
                <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} className="rounded text-sky-600 focus:ring-sky-400" />
                Remote Only
              </label>
              <button onClick={fetchOps} className="p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl transition-colors" title="Refresh">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {ops.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
              <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No opportunities matched</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your scale, formatting, or keyword searches</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ops.map(op => {
                let opSkills: string[] = [];
                try {
                  opSkills = typeof op.skillsRequired === 'string' ? JSON.parse(op.skillsRequired) : op.skillsRequired || [];
                } catch {
                  opSkills = op.skillsRequired || [];
                }
                const applied = isApplied(op.id);
                const applying = applyingId === op.id;
                const isExpanded = !!expandedReason[op.id];
                
                return (
                  <div
                    key={op.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div>
                      {/* Top Badging Row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${TYPE_COLORS[op.type] || 'bg-slate-50 text-slate-600'}`}>
                            {op.type}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${COMPANY_TYPE_COLORS[op.companyType] || 'bg-slate-50 text-slate-600'}`}>
                            {op.companyType === 'STARTUP' ? 'Startup' : 'Enterprise'}
                          </span>
                        </div>

                        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black shrink-0 ${
                          op.matchScore >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/5' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                          {op.matchScore}% Match
                        </div>
                      </div>

                      {/* Header details */}
                      <div className="mb-3">
                        <h3 className="font-bold text-slate-900 text-base leading-tight">{op.title}</h3>
                        <p className="text-slate-500 text-sm font-semibold mt-0.5 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {op.companyName}
                        </p>
                      </div>

                      {/* Meta location & salary */}
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" />{op.location}{op.remote ? ' · Remote' : ''}</span>
                        {op.salary && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-slate-400" />{op.salary}</span>}
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed mb-3">{op.description}</p>

                      {/* Required skills */}
                      {opSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {opSkills.map(s => (
                            <span key={s} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-150">{s}</span>
                          ))}
                        </div>
                      )}

                      {/* RAG Reasoning Accordion */}
                      {op.matchExplanation && (
                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={() => toggleReason(op.id)}
                            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{isExpanded ? 'Hide AI Compatibility Match' : 'Reveal AI Compatibility Match'}</span>
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-2.5 p-4 bg-gradient-to-br from-indigo-50/30 via-sky-50/15 to-transparent border border-indigo-100/50 rounded-xl text-xs text-slate-700 leading-relaxed shadow-inner">
                              <p dangerouslySetInnerHTML={{ __html: formatBoldText(op.matchExplanation) }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Apply Trigger */}
                    <button
                      onClick={() => !applied && handleApply(op.id)}
                      disabled={applied || applying}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        applied
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default'
                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                      }`}
                    >
                      {applied ? (
                        <><CheckCircle className="h-4 w-4" /> Applied</>
                      ) : applying ? (
                        'Submitting...'
                      ) : (
                        <>Apply Now <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Application tracker pipeline */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <TrendingUp className="h-5 w-5 text-sky-600" />
            <h2 className="font-bold text-slate-900 text-base">Application Tracker</h2>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl">
              <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold text-sm">No applications yet</p>
              <p className="text-slate-400 text-xs mt-1">Browse listings and hit Apply to track them here</p>
              <button onClick={() => setTab('browse')} className="mt-4 inline-flex items-center gap-1 text-sky-600 text-sm font-semibold hover:underline">
                Browse opportunities →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.id} className="border border-slate-200 rounded-xl p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm">{app.opportunity.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{app.opportunity.companyName} · {app.opportunity.location}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Progress tracking steps */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {STATUSES.map(st => {
                        const idx = STATUSES.indexOf(app.status);
                        const stIdx = STATUSES.indexOf(st);
                        const isActive = app.status === st;
                        const isPast = stIdx <= idx;
                        return (
                          <span
                            key={st}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                              isActive
                                ? st === 'REJECTED' ? 'bg-red-500 border-red-500 text-white' : 'bg-sky-600 border-sky-600 text-white'
                                : isPast && st !== 'REJECTED'
                                ? 'bg-sky-50 border-sky-200 text-sky-600'
                                : 'bg-white border-slate-200 text-slate-300'
                            }`}
                          >
                            {st.charAt(0) + st.slice(1).toLowerCase()}
                          </span>
                        );
                      })}
                    </div>

                    {/* Advance pipeline */}
                    <select
                      value={app.status}
                      onChange={e => advanceStatus(app.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-400 shrink-0"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
