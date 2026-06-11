'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Coins,
  Sparkles,
  Gift,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  HelpCircle,
  Activity
} from 'lucide-react';

interface Transaction {
  id: string;
  points: number;
  description: string;
  createdAt: string;
}

export default function PointsHub() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPointsData = async () => {
    try {
      const res = await api.get('/profile/points/status');
      setTransactions(res.data.transactions || []);
    } catch (e) {
      console.error('Failed to fetch points transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPointsData();
  }, []);

  const handleRedeem = async () => {
    setRedeeming(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await api.post('/profile/points/redeem');
      setSuccessMsg(res.data.message || 'Successfully redeemed 200 points for ₹20!');
      await refreshUser();
      await fetchPointsData();
    } catch (e: any) {
      setErrorMsg(e.response?.data?.error || 'Failed to redeem points. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const currentPoints = user?.edPoints ?? 50;
  const rupeeValue = (currentPoints / 10).toFixed(2);
  const nextRedeemThreshold = 200;
  const pointsToNextRedemption = nextRedeemThreshold - (currentPoints % nextRedeemThreshold);
  const progressPercent = Math.min(((currentPoints % nextRedeemThreshold) / nextRedeemThreshold) * 100, 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Coins className="h-7 w-7 text-amber-500" />
          Ed Points Hub
        </h1>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Earn rewards while building your career, and convert them to real cash.
        </p>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm animate-scale-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Redemption Successful!</p>
            <p className="text-xs text-emerald-600/90 mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm animate-scale-in">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Redemption Failed</p>
            <p className="text-xs text-red-600/90 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Stats and Redemption Portal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Luxury Points Wallet Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-6 border border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px] group">
          {/* Glassmorphic glowing circles */}
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition-colors duration-500" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-yellow-500/5 blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 animate-spin" />
                Ed Points Wallet
              </span>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                10 Pts = ₹1
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 tracking-tight">
                  {currentPoints}
                </span>
                <span className="text-xl font-bold text-amber-300">Points</span>
              </div>
              <p className="text-sm font-medium text-slate-400 flex items-center gap-1">
                Equivalent Value: 
                <span className="text-white font-bold text-base bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 rounded-lg ml-1">
                  ₹{rupeeValue}
                </span>
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-2 mt-6">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Next Redemption Milestone</span>
              <span className="text-amber-400 font-bold">
                {currentPoints % nextRedeemThreshold} / {nextRedeemThreshold} Pts
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-white/5 border border-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            <p className="text-[10px] text-slate-400">
              {currentPoints >= nextRedeemThreshold 
                ? "You have unlocked a reward! You can redeem points now."
                : `Earn ${pointsToNextRedemption} more points to unlock your next ₹20 cash redemption.`
              }
            </p>
          </div>
        </div>

        {/* Premium Action Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[260px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Redeem Points</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Convert to cash</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              We reward your regular commitment! Every <span className="font-bold text-slate-700">200 points</span> you earn can be instantly redeemed for <span className="font-bold text-emerald-600">₹20</span> sent to your account wallet.
            </p>

            {currentPoints < nextRedeemThreshold && (
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Redemption requires a minimum of <span className="font-bold">200 points</span>. Complete daily tasks or log in daily to hit your next target.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleRedeem}
            disabled={currentPoints < nextRedeemThreshold || redeeming}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm
              ${currentPoints >= nextRedeemThreshold
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 hover:from-amber-700 hover:to-amber-800 hover:shadow-md active:scale-98'
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {redeeming ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-300 border-t-amber-600 rounded-full animate-spin" />
                Processing Redemption...
              </>
            ) : (
              <>
                Redeem 200 Points (₹20)
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guidelines and Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <HelpCircle className="h-4 w-4 text-sky-500" />
            Earning Guidelines
          </h3>
          <ul className="space-y-3.5 text-xs text-slate-600">
            <li className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-sky-50 text-sky-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                +50
              </span>
              <div>
                <p className="font-bold text-slate-700">Signup Welcome Reward</p>
                <p className="text-[10px] text-slate-400 leading-tight">Credited automatically when you create a new workspace profile.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                +10
              </span>
              <div>
                <p className="font-bold text-slate-700">Daily Login Bonus</p>
                <p className="text-[10px] text-slate-400 leading-tight">Claimed once per calendar day on your initial login to the system.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="h-5 w-5 rounded-full bg-purple-50 text-purple-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                *
              </span>
              <div>
                <p className="font-bold text-slate-700">Profile Enhancements</p>
                <p className="text-[10px] text-slate-400 leading-tight">Completing your experiences, projects and certificates boosts career readiness.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Points Transaction Ledger */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              Points Transaction Ledger
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5">
              Live Audits
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-6 w-6 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin" />
              <p className="text-xs">Loading ledger audits...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Clock className="h-10 w-10 text-slate-200" />
              <p className="text-xs">No points ledger logs registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Activity Description</th>
                    <th className="py-2.5 text-right">Points Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 text-slate-400 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 text-slate-700 font-semibold">
                        {tx.description}
                      </td>
                      <td className={`py-3 text-right font-black ${
                        tx.points > 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points} Pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
