'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Cpu, 
  Lock, 
  ChevronRight, 
  Calendar, 
  UserCheck, 
  Volume2, 
  Award, 
  Compass, 
  Star,
  FileText
} from 'lucide-react';

export default function PracticeInterview() {
  const [level, setLevel] = useState<'ENTRY' | 'MID' | 'SENIOR'>('ENTRY');

  const interviewTypes = [
    {
      id: 'coding',
      title: 'Technical Coding Simulation',
      desc: 'Real-time Javascript, Python, and system algorithm coding tests with a live sandbox compile workspace.',
      questions: 150,
      duration: '45 mins',
      stars: 5,
      gradient: 'from-sky-500/10 via-sky-500/5 to-blue-600/10',
      icon: Cpu,
      iconColor: 'text-sky-500'
    },
    {
      id: 'sysdesign',
      title: 'System Design Evaluator',
      desc: 'Architecture blueprint diagrams, API design, database scaling, and distributed network simulations.',
      questions: 80,
      duration: '60 mins',
      stars: 5,
      gradient: 'from-violet-500/10 via-violet-500/5 to-purple-600/10',
      icon: Compass,
      iconColor: 'text-violet-500'
    },
    {
      id: 'behavioral',
      title: 'Behavioral & Leadership',
      desc: 'STAR method response scanner evaluating culture fit, leadership capabilities, and communication styles.',
      questions: 45,
      duration: '30 mins',
      stars: 4,
      gradient: 'from-amber-500/10 via-amber-500/5 to-orange-500/10',
      icon: UserCheck,
      iconColor: 'text-amber-500'
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-8rem)] p-1 space-y-8 select-none">
      
      {/* ─── Hero Panel with Premium Gradient ─── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.08),transparent)] pointer-events-none" />
        
        <div className="space-y-3 max-w-xl z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-100 rounded-full px-3 py-1 text-xs font-semibold text-sky-600">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> AI Practice Simulator
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
            Interactive AI Mock Interviews
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            Simulate real-time voice, coding, and whiteboard interviews with customized feedback reports, salary expectations, and ATS score calibrations.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 shrink-0 z-10 w-full sm:w-auto shadow-inner">
          <Calendar className="h-6 w-6 text-sky-500 animate-bounce" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Target Launch</p>
          <p className="text-lg font-black text-sky-600">Q3 2026</p>
          <span className="bg-sky-500/10 border border-sky-500/20 text-sky-700 rounded-lg px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase">
            Beta Registration
          </span>
        </div>
      </div>

      {/* ─── Level Selection Row ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Choose Career Level</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Adjust questions and rubric severity</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 self-start">
          {(['ENTRY', 'MID', 'SENIOR'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 ${
                level === lvl
                  ? 'bg-white text-sky-600 shadow-sm shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Interactive Mock Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        
        {/* Coming Soon Glass Overlay */}
        <div className="absolute inset-0 z-20 bg-slate-50/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center border border-slate-200/30 shadow-inner">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 md:p-8 max-w-sm text-center space-y-4 shadow-2xl animate-scale-in">
            <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner text-amber-500 animate-pulse">
              <Lock className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">AI Practice Module Coming Soon</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our speech-to-text live evaluators and real-time coding compilers are in active deployment sandbox validation. Sign up for early access notifications below.
              </p>
            </div>
            <button 
              onClick={() => alert("You've been added to the early access queue!")}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Join Early Access Queue
            </button>
          </div>
        </div>

        {interviewTypes.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className={`relative rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-6 shadow-sm overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} pointer-events-none`} />
              
              <div className="space-y-4 z-10">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-2xl bg-white border border-slate-100 ${item.iconColor} shadow-sm shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: item.stars }).map((_, idx) => (
                      <Star key={idx} className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-black text-sm text-slate-800 group-hover:text-sky-700 transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between z-10 shrink-0">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider space-y-0.5">
                  <p>Duration: <span className="text-slate-600 font-black">{item.duration}</span></p>
                  <p>Bank: <span className="text-slate-600 font-black">{item.questions} questions</span></p>
                </div>
                <div className="flex items-center gap-1 text-slate-400 font-bold text-xs uppercase tracking-wider group-hover:text-sky-500 transition-colors">
                  Locked <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Premium Perks Showcase ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        {[
          { title: 'Voice Assessment', desc: 'Analyzes speech clarity, tone, and pacing.', icon: Volume2, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { title: 'Rubric Compliance', desc: 'Measures responses against industry hiring criteria.', icon: Award, color: 'text-rose-500', bg: 'bg-rose-50' },
          { title: 'ATS Synergy Log', desc: 'Syncs interview results to elevate your readiness score.', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' }
        ].map((perk, idx) => {
          const Icon = perk.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-inner bg-slate-50/20">
              <div className={`${perk.bg} ${perk.color} p-2 rounded-xl shrink-0`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800">{perk.title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{perk.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
