'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldAlert, 
  Plus, 
  X 
} from 'lucide-react';

export default function Register() {
  const { user, registerUser, loginWithOAuth, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      await loginWithOAuth(provider);
    } catch (err: any) {
      setError(err.message || `${provider} registration failed.`);
    }
  };

  // Form Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  
  const [collegeName, setCollegeName] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('2027');

  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!email || !password || !fullName) {
        setError('Please fill in your name, email, and password.');
        return false;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^-])[A-Za-z\d@$!%*?&_#^-]{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return false;
      }
    } else if (step === 2) {
      if (!collegeName || !degree || !branch || !graduationYear) {
        setError('Please fill in all academic parameters.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = {
      email,
      password,
      fullName,
      phoneNumber,
      collegeName,
      degree,
      branch,
      graduationYear: Number(graduationYear),
      interests,
      goals,
      dob: dob || null
    };

    try {
      await registerUser(formData);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('network error') || msg.toLowerCase().includes('failed to fetch')) {
        setError('Connection Failed: Could not connect to the backend server. Please make sure the backend server is running on http://localhost:5000.');
      } else {
        setError(msg || 'Registration failed. Please check inputs.');
      }
    }
  };

  // Predefined Chip items
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
    if (interests.includes(val)) {
      setInterests(interests.filter(item => item !== val));
    } else {
      setInterests([...interests, val]);
    }
  };

  const toggleGoal = (val: string) => {
    if (goals.includes(val)) {
      setGoals(goals.filter(item => item !== val));
    } else {
      setGoals([...goals, val]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest && !interests.includes(customInterest)) {
      setInterests([...interests, customInterest]);
      setCustomInterest('');
    }
  };

  const addCustomGoal = () => {
    if (customGoal && !goals.includes(customGoal)) {
      setGoals([...goals, customGoal]);
      setCustomGoal('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img 
          src="/logo.png" 
          alt="Edworld Co. Logo" 
          className="inline-flex h-10 w-10 object-contain shrink-0 rounded-xl bg-white p-1 border border-slate-200 shadow-sm"
        />
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          Create your Edworld Co. Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 font-semibold">
          Join the SaaS portal for student development.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 border border-slate-200 shadow-xl rounded-3xl sm:px-10">
          
          {/* Stepper Progress bar */}
          <div className="relative mb-8">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 transform -translate-y-1/2 -z-10"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-sky-500 transform -translate-y-1/2 -z-10 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            <div className="flex justify-between">
              {[
                { s: 1, label: 'Profile', icon: User },
                { s: 2, label: 'Academic', icon: GraduationCap },
                { s: 3, label: 'Interests', icon: Target },
              ].map((item) => {
                const Icon = item.icon;
                const isCompleted = step > item.s;
                const isActive = step === item.s;
                
                return (
                  <div key={item.s} className="flex flex-col items-center gap-1.5">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                      isCompleted 
                        ? 'bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-100' 
                        : isActive 
                        ? 'bg-white border-sky-500 text-sky-600 shadow-sm shadow-sky-100 ring-2 ring-sky-100' 
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : item.s}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-sky-600' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3.5 rounded-2xl mb-6 flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Forms */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Profile Details */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-slate-600 font-semibold text-xs mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold text-xs mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold text-xs mb-2">Password (min 6 characters)</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold text-xs mb-2">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold text-xs mb-2">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2.5 text-slate-400 font-bold tracking-wider">Or register with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => handleOAuth('google')}
                    type="button"
                    className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.435 0-6.224-2.789-6.224-6.224s2.789-6.224 6.224-6.224c1.498 0 2.866.53 3.943 1.41l3.053-3.053C18.91 1.956 15.772 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.31 0 11.332-4.996 11.332-11.24 0-.768-.073-1.5-.205-2.203h-11.13Z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    onClick={() => handleOAuth('github')}
                    type="button"
                    className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#24292F"
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Academic Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-slate-600 font-semibold text-xs mb-2">College/University Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Stanford University"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-semibold text-xs mb-2">Degree</label>
                    <input
                      type="text"
                      required
                      placeholder="B.Tech, B.S., M.S."
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold text-xs mb-2">Major / Branch</label>
                    <input
                      type="text"
                      required
                      placeholder="Computer Science"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold text-xs mb-2">Graduation Year</label>
                  <select
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-3.5 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all duration-200"
                  >
                    {['2025', '2026', '2027', '2028', '2029', '2030'].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Interests & Goals */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-2.5">
                    What professional fields interest you?
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {popularInterests.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleInterest(item)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          interests.includes(item)
                            ? 'bg-sky-500 border-sky-500 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom field..."
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-2 border border-slate-200 focus:border-sky-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomInterest}
                      className="px-3.5 py-2 bg-sky-50 border border-sky-200 rounded-2xl text-sky-600 hover:bg-sky-100 font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-2.5">
                    What are your current career goals?
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {popularGoals.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleGoal(item)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          goals.includes(item)
                            ? 'bg-sky-500 border-sky-500 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom goal..."
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-2xl px-4 py-2 border border-slate-200 focus:border-sky-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addCustomGoal}
                      className="px-3.5 py-2 bg-sky-50 border border-sky-200 rounded-2xl text-sky-600 hover:bg-sky-100 font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Wizard Navigation */}
            <div className="flex justify-between pt-4 mt-6 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 font-bold text-xs rounded-xl bg-white transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div></div> // empty spacer
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-tr from-sky-600 to-blue-500 hover:from-sky-700 hover:to-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <span>{loading ? 'Creating Portfolio...' : 'Complete Register'}</span>
                  {!loading && <Check className="h-4 w-4" />}
                </button>
              )}
            </div>

          </form>

          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <p className="text-slate-500 text-xs font-semibold">
              Already have an account?{' '}
              <Link href="/login" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
