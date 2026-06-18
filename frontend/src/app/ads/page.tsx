'use client';

import React, { useState, useEffect } from 'react';
import { api, BACKEND_URL } from '@/lib/api';
import { motion } from 'framer-motion';
import { Upload, DollarSign, Eye, MousePointerClick, CheckCircle, AlertCircle, Sparkles, Image, Video, Link2, Building2, Mail, Phone, FileText } from 'lucide-react';

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'active'>('submit');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAds, setActiveAds] = useState<any[]>([]);

  const [form, setForm] = useState({
    businessName: '', contactEmail: '', contactPhone: '',
    title: '', description: '', imageUrl: '', videoUrl: '', linkUrl: '',
    costPerDay: 100, costPer100Views: 100, totalBudget: 1000
  });

  useEffect(() => {
    fetchActiveAds();
  }, []);

  const fetchActiveAds = async () => {
    try {
      const res = await api.get('/admin/ads/public');
      setActiveAds(res.data);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/admin/ads', form);
      setSuccess(true);
      setForm({ businessName: '', contactEmail: '', contactPhone: '', title: '', description: '', imageUrl: '', videoUrl: '', linkUrl: '', costPerDay: 100, costPer100Views: 100, totalBudget: 1000 });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const inputClass = "w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200";

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-10">
          <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Ad Submitted!</h1>
          <p className="text-slate-500 text-sm mb-8">Your ad has been submitted for review. Our team will review it and activate it within 24 hours.</p>
          <button onClick={() => setSuccess(false)} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all">Submit Another Ad</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Advertising Platform
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Reach Thousands of Students & Professionals</h1>
          <p className="text-sky-100/90 text-sm max-w-xl mx-auto">Promote your brand, products, or services to our community of career-focused students and alumni. Simple pricing, measurable results.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 pb-16">
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Eye, title: 'Per Day', price: '₹100', desc: 'Pay only for the days your ad runs', color: 'sky' },
            { icon: MousePointerClick, title: 'Per 100 Views', price: '₹100', desc: 'Cost-efficient impression-based pricing', color: 'violet' },
            { icon: DollarSign, title: 'Min Budget', price: '₹1,000', desc: 'Start with a flexible daily budget', color: 'amber' }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-xl bg-${item.color}-50 border border-${item.color}-100 flex items-center justify-center mb-3`}>
                <item.icon className={`h-5 w-5 text-${item.color}-500`} />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.title}</p>
              <p className="text-2xl font-black text-slate-900">{item.price}</p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-6">
          <button onClick={() => setActiveTab('submit')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'submit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Submit Ad</button>
          <button onClick={() => setActiveTab('active')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Active Ads ({activeAds.length})</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-2xl mb-6 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        {activeTab === 'submit' ? (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-black text-slate-900">Business Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-slate-600 font-semibold text-xs mb-2">Business Name *</label><input type="text" required placeholder="Acme Corp" value={form.businessName} onChange={e => update('businessName', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-slate-600 font-semibold text-xs mb-2">Contact Email *</label><input type="email" required placeholder="ads@company.com" value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)} className={inputClass} /></div>
              <div><label className="block text-slate-600 font-semibold text-xs mb-2">Phone (Optional)</label><input type="tel" placeholder="+91 98765 43210" value={form.contactPhone} onChange={e => update('contactPhone', e.target.value)} className={inputClass} /></div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-sky-500" />
                <h2 className="text-lg font-black text-slate-900">Ad Content</h2>
              </div>

              <div className="space-y-4">
                <div><label className="block text-slate-600 font-semibold text-xs mb-2">Ad Title *</label><input type="text" required placeholder="Summer Internship Program 2026" value={form.title} onChange={e => update('title', e.target.value)} className={inputClass} /></div>
                <div><label className="block text-slate-600 font-semibold text-xs mb-2">Description *</label><textarea required rows={3} placeholder="Describe your offer, product, or service..." value={form.description} onChange={e => update('description', e.target.value)} className={inputClass + ' resize-none'} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-slate-600 font-semibold text-xs mb-2"><Image className="inline h-3.5 w-3.5 mr-1" />Image URL</label><input type="url" placeholder="https://..." value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} className={inputClass} /></div>
                  <div><label className="block text-slate-600 font-semibold text-xs mb-2"><Video className="inline h-3.5 w-3.5 mr-1" />Video URL</label><input type="url" placeholder="https://..." value={form.videoUrl} onChange={e => update('videoUrl', e.target.value)} className={inputClass} /></div>
                  <div><label className="block text-slate-600 font-semibold text-xs mb-2"><Link2 className="inline h-3.5 w-3.5 mr-1" />Landing URL</label><input type="url" placeholder="https://..." value={form.linkUrl} onChange={e => update('linkUrl', e.target.value)} className={inputClass} /></div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-sky-500" />
                <h2 className="text-lg font-black text-slate-900">Budget & Pricing</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-slate-600 font-semibold text-xs mb-2">Cost Per Day (₹)</label><input type="number" min={100} step={10} value={form.costPerDay} onChange={e => update('costPerDay', Number(e.target.value))} className={inputClass} /></div>
                <div><label className="block text-slate-600 font-semibold text-xs mb-2">Cost Per 100 Views (₹)</label><input type="number" min={100} step={10} value={form.costPer100Views} onChange={e => update('costPer100Views', Number(e.target.value))} className={inputClass} /></div>
                <div><label className="block text-slate-600 font-semibold text-xs mb-2">Total Budget (₹)</label><input type="number" min={1000} step={100} value={form.totalBudget} onChange={e => update('totalBudget', Number(e.target.value))} className={inputClass} /></div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md transition-all disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Ad for Review'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {activeAds.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <Eye className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No active ads at the moment.</p>
              </div>
            ) : activeAds.map(ad => (
              <div key={ad.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="w-full sm:w-40 h-28 object-cover rounded-xl border border-slate-100" />}
                  {ad.videoUrl && !ad.imageUrl && <video src={ad.videoUrl} className="w-full sm:w-40 h-28 object-cover rounded-xl border border-slate-100" muted />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-slate-900">{ad.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ad.description}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-semibold">by {ad.businessName}</p>
                  </div>
                  {ad.linkUrl && (
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="self-center px-4 py-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold rounded-xl hover:bg-sky-100 transition-colors shrink-0">
                      Learn More
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
