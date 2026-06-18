'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Award, Send, CheckCircle2, Loader2, Building2, User, Phone, MapPin, Mail, Link2, BookOpen, GraduationCap, Sparkles, Clock, XCircle, PartyPopper, ArrowRight, ExternalLink } from 'lucide-react';

export default function AmbassadorPage() {
  const { user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.fullName || '', email: user?.email || '',
    phone: '', whatsapp: '', linkedin: '',
    collegeName: '', course: '', year: '1', rollNumber: '', city: ''
  });

  useEffect(() => {
    if (user) {
      api.get('/ambassador/admin').then(res => {
        const myApp = res.data.find((a: any) => a.userId === user.id || a.email === user.email);
        if (myApp) setApplication(myApp);
      }).catch(() => {}).finally(() => setLoadingStatus(false));
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/ambassador/apply', formData);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // APPROVED view
  if (application?.status === 'APPROVED' || success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl overflow-hidden">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]" />
            <div className="relative z-10">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                <PartyPopper className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Welcome to EdWorld Ambassador Program!</h1>
              <p className="text-emerald-100/90 text-sm font-medium">Congratulations! You are now an official Edworld Campus Ambassador.</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Confirmation Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-emerald-800">Application Approved</h3>
                  <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">
                    Your ambassador application has been reviewed and approved. We are excited to have you on board!
                  </p>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-sky-500" /> What Happens Next
              </h3>
              <div className="space-y-3">
                {[
                  { step: 1, title: 'Onboarding Call', desc: 'Our coordinator will connect with you within 24-48 hours via WhatsApp to welcome you and share the ambassador onboarding kit.', color: 'sky' },
                  { step: 2, title: 'Marketing Kit', desc: 'You will receive branded social media templates, campus posters, and digital assets to promote Edworld Co. at your college.', color: 'violet' },
                  { step: 3, title: 'Start Earning', desc: 'Refer students, organize campus events, and earn exclusive rewards, certificates, and premium membership vouchers.', color: 'amber' },
                ].map(item => (
                  <div key={item.step} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className={`h-8 w-8 rounded-lg bg-${item.color}-50 border border-${item.color}-100 flex items-center justify-center shrink-0`}>
                      <span className={`text-xs font-black text-${item.color}-600`}>{item.step}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 font-semibold">Need help? Reach out to us at</p>
              <a href="mailto:ambassadors@edworld.co.in" className="text-sky-600 text-xs font-bold hover:underline">ambassadors@edworld.co.in</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PENDING view
  if (application?.status === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-12 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Clock className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Application Under Review</h2>
            <p className="text-slate-400 text-xs font-semibold max-w-md mx-auto leading-relaxed">
              Thank you for applying to represent Edworld Co. at {application.collegeName || 'your college'}. Our team is reviewing your application and will get back to you within 48 hours.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full text-left text-xs font-semibold text-slate-500 space-y-2">
            <p className="text-slate-700 font-bold">Your Application Details:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <span className="text-slate-400">Name:</span><span>{application.name}</span>
              <span className="text-slate-400">College:</span><span>{application.collegeName}</span>
              <span className="text-slate-400">Status:</span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Clock className="h-3 w-3" /> Pending Review
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED view
  if (application?.status === 'REJECTED') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-12 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Application Not Selected</h2>
            <p className="text-slate-400 text-xs font-semibold max-w-md mx-auto leading-relaxed">
              Thank you for your interest in the Edworld Campus Ambassador Program. Unfortunately, we cannot move forward with your application at this time. We encourage you to keep building your profile and apply again in the next cohort.
            </p>
          </div>
          <button onClick={() => { setApplication(null); }} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all">
            Apply Again
          </button>
        </div>
      </div>
    );
  }

  // Success after submission
  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-12 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Application Submitted!</h2>
            <p className="text-slate-400 text-xs font-semibold max-w-md mx-auto leading-relaxed">
              Thank you for applying to represent Edworld Co. Our coordinators will review your details and get back to you within 48 hours.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full text-left text-xs font-semibold text-slate-500 space-y-2">
            <p className="text-slate-700 font-bold">Next Steps:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Our team will audit your college registration and social media links.</li>
              <li>A verification email will be sent to you.</li>
              <li>You will receive an onboarding package once approved.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Application Form
  const inputClass = "w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 text-[10px] font-black uppercase tracking-wider mx-auto">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>Campus Ambassador Program</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Award className="h-8 w-8 text-sky-600 shrink-0" />
          <span>Represent Edworld Co.</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium">
          Organize events, build a developer community on campus, and earn rewards, certificates, and premium membership vouchers!
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-4 rounded-2xl">{errorMsg}</div>
      )}

      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-md p-6 md:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-slate-700 font-extrabold text-sm tracking-tight pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-sky-600" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-slate-600 font-bold text-xs mb-1.5">Full Name</label>
                <div className="relative"><User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="Your full name" />
                </div>
              </div>
              <div><label className="block text-slate-600 font-bold text-xs mb-1.5">Email</label>
                <div className="relative"><Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="your@email.com" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-slate-600 font-bold text-xs mb-1.5">Phone</label>
                <div className="relative"><Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div><label className="block text-slate-600 font-bold text-xs mb-1.5">WhatsApp</label>
                <div className="relative"><Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="tel" name="whatsapp" required value={formData.whatsapp} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
            </div>
            <div><label className="block text-slate-600 font-bold text-xs mb-1.5">LinkedIn / GitHub URL</label>
              <div className="relative"><Link2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input type="url" name="linkedin" required value={formData.linkedin} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/in/username" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-slate-700 font-extrabold text-sm tracking-tight pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-sky-600" /> College Details
            </h3>
            <div><label className="block text-slate-600 font-bold text-xs mb-1.5">College / University</label>
              <div className="relative"><Building2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input type="text" name="collegeName" required value={formData.collegeName} onChange={handleChange} className={inputClass} placeholder="Your college name" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-slate-600 font-bold text-xs mb-1.5">Course</label>
                <div className="relative"><BookOpen className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="text" name="course" required value={formData.course} onChange={handleChange} className={inputClass} placeholder="B.Tech CSE" />
                </div>
              </div>
              <div><label className="block text-slate-600 font-bold text-xs mb-1.5">Year</label>
                <div className="relative"><GraduationCap className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select name="year" required value={formData.year} onChange={handleChange} className={inputClass + ' appearance-none'}>
                    <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option><option value="5">Post-Graduate</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-slate-600 font-bold text-xs mb-1.5">Roll Number</label>
                <div className="relative"><User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="text" name="rollNumber" required value={formData.rollNumber} onChange={handleChange} className={inputClass} placeholder="Your roll number" />
                </div>
              </div>
              <div><label className="block text-slate-600 font-bold text-xs mb-1.5">City</label>
                <div className="relative"><MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="text" name="city" required value={formData.city} onChange={handleChange} className={inputClass} placeholder="City, State" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> Submit Application</>}
          </button>
        </form>
      </div>
    </div>
  );
}
