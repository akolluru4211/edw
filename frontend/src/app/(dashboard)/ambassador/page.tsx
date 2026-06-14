'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Award, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Link2,
  BookOpen,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function AmbassadorPage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    whatsapp: '',
    linkedin: '',
    collegeName: '',
    course: '',
    year: '1',
    rollNumber: '',
    city: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await api.post('/ambassador/apply', formData);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to submit application. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl p-8 md:p-12 text-center space-y-6 flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Application Submitted Successfully!</h2>
            <p className="text-slate-400 text-xs font-semibold max-w-md mx-auto leading-relaxed">
              Thank you for applying to represent Edworld Co. at your college. We have dispatched a notification email to edworld.eden@gmail.com and our coordinators will review your details soon.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full text-left text-xs font-semibold text-slate-500 space-y-2">
            <p><strong>Next Steps:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Our team will audit your college registration and social media links.</li>
              <li>A verification email or WhatsApp notification will be sent to you.</li>
              <li>You will receive an onboarding package once approved.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-8">
      {/* Page Header */}
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
          Organize events, establish a developer tech community on your campus, and earn exclusive cash rewards, certificates, and premium membership vouchers!
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-4 rounded-2xl animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-md p-6 md:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Personal Info */}
          <div className="space-y-4">
            <h3 className="text-slate-700 font-extrabold text-sm tracking-tight pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-sky-600" />
              <span>Personal Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="name" 
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                    placeholder="Alice Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                    placeholder="alice@university.edu"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="tel" 
                    name="phone" 
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1.5">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="tel" 
                    name="whatsapp" 
                    required
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                    placeholder="+91 7993936047"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold text-xs mb-1.5">LinkedIn / GitHub Profile URL</label>
              <div className="relative">
                <Link2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="url" 
                  name="linkedin" 
                  required
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>

          {/* Section: Academic Info */}
          <div className="space-y-4 pt-4">
            <h3 className="text-slate-700 font-extrabold text-sm tracking-tight pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-sky-600" />
              <span>College Details</span>
            </h3>

            <div>
              <label className="block text-slate-600 font-bold text-xs mb-1.5">College / University Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  name="collegeName" 
                  required
                  value={formData.collegeName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                  placeholder="GITAM University"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1.5">Course / Major</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="course" 
                    required
                    value={formData.course}
                    onChange={handleChange}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                    placeholder="B.Tech Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1.5">Year of Study</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select 
                    name="year" 
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all appearance-none"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">Post-Graduate</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1.5">Student Roll Number / ID</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="rollNumber" 
                    required
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                    placeholder="1219030042"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold text-xs mb-1.5">College City / State</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="city" 
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl pl-11 pr-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                    placeholder="Visakhapatnam, AP"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-extrabold text-sm py-4.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Submitting application...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Ambassador Application</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
