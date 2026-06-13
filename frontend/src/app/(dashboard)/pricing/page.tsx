'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Sparkles, 
  Check, 
  HelpCircle, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Star, 
  Info,
  ExternalLink,
  Lock,
  Loader2,
  Calendar,
  Gift
} from 'lucide-react';

// Pricing plans configuration
const PLANS = [
  {
    id: 'FREE',
    name: 'Free Starter',
    price: 0,
    period: '/month',
    desc: 'For students starting their career path.',
    badge: 'Standard Access',
    color: 'slate',
    features: [
      'Basic Career Dashboard',
      '50 Welcome Ed Points',
      'Standard AI Career Coach responses',
      'Basic resume builder & text viewer',
      'Access to jobs and peer network suggestion directory'
    ],
    buttonText: 'Current Plan',
    popular: false
  },
  {
    id: 'PRO',
    name: 'Career Pro',
    price: 49,
    period: '/month',
    desc: 'Optimize your profile and ATS score for recruiters.',
    badge: 'Most Popular',
    color: 'sky',
    features: [
      'Comprehensive ATS Resume audit scanner',
      'Advanced AI Career Coach with deep profile integration',
      'Mock interview generator with AI performance feedback',
      '100 Bonus Ed Points on subscription',
      'Unlimited connection requests and messaging keys',
      'Premium PRO badge next to profile name'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
    paymentLink: 'https://rzp.io/rzp/74TlmCDo',
    paymentButtonId: 'pl_SMfioaC5eN9nq7'
  },
  {
    id: 'PREMIUM',
    name: 'Industry Elite',
    price: 99,
    period: '/month',
    desc: 'The ultimate toolkit for securing elite job offers.',
    badge: 'Best Value',
    color: 'amber',
    features: [
      'Everything in Pro plan',
      '250 Bonus Ed Points on subscription',
      'Direct messaging encryption keys automatically managed',
      'Priority access to local mock assessments',
      'Standout gold profile beacon inside network Suggestions',
      'Elite 24/7 priority AI career support'
    ],
    buttonText: 'Upgrade to Elite',
    popular: false,
    paymentLink: 'https://rzp.io/rzp/a4ZncFq',
    paymentButtonId: 'pl_T145sOIPPbzPCH'
  }
];

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Sandbox Modal States
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState<'card' | 'processing' | 'success'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Load Razorpay SDK Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!user) return null;

  const currentPlan = user.plan || 'FREE';

  // Format subscription expiry date
  const getExpiryString = () => {
    if (!user.subscriptionExpiresAt) return '';
    const date = new Date(user.subscriptionExpiresAt);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Main upgrade trigger
  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return;
    setLoadingPlan(planId);
    setErrorMsg(null);
    setSuccessPlan(null);

    try {
      const res = await api.post('/subscription/create-order', { plan: planId });
      const orderData = res.data;

      if (orderData.mock) {
        // Fallback to local sandbox modal simulation
        setMockOrderDetails({ ...orderData, plan: planId });
        setPaymentStep('card');
        setShowMockModal(true);
        setLoadingPlan(null);
      } else {
        // Open live Razorpay standard checkout
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Edworld Co.',
          description: `Upgrade to ${planId} Tier`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            setLoadingPlan(planId);
            try {
              const verifyRes = await api.post('/subscription/verify-payment', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
                mock: false
              });

              if (verifyRes.data.success) {
                setSuccessPlan(planId);
                await refreshUser();
              }
            } catch (err: any) {
              setErrorMsg(err.response?.data?.error || 'Payment verification failed.');
            } finally {
              setLoadingPlan(null);
            }
          },
          prefill: {
            name: user.fullName,
            email: user.email
          },
          theme: {
            color: planId === 'PREMIUM' ? '#d97706' : '#0284c7'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoadingPlan(null);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to initialize checkout.');
      setLoadingPlan(null);
    }
  };

  // Simulate payment processing in sandbox mock mode
  const handleCompleteMockPayment = async () => {
    if (!mockOrderDetails) return;
    setPaymentStep('processing');

    setTimeout(async () => {
      try {
        const verifyRes = await api.post('/subscription/verify-payment', {
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).slice(2)}`,
          razorpay_order_id: mockOrderDetails.orderId,
          razorpay_signature: `sig_mock_${Math.random().toString(36).slice(2)}`,
          plan: mockOrderDetails.plan,
          mock: true
        });

        if (verifyRes.data.success) {
          setPaymentStep('success');
          setSuccessPlan(mockOrderDetails.plan);
          await refreshUser();
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || 'Mock payment verification failed.');
        setShowMockModal(false);
      }
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* ─── Premium Glassmorphism Header ─── */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-100 rounded-full text-xs font-bold text-sky-600">
          <Sparkles className="h-3.5 w-3.5" /> Edworld Membership
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">
          Invest in your Career, <br/>
          <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Unlock Premium AI Tools</span>
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Upgrade your workspace to access advanced ATS scanners, priority mock interview matching, and standalone E2EE peer chat capability.
        </p>
      </div>

      {/* ─── Current Plan Info & Notification Alerts ─── */}
      <div className="max-w-4xl mx-auto">
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-semibold">
            <Info className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {successPlan && (
          <div className="mb-6 p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-3xl flex items-start gap-4 text-slate-800 animate-scale-in">
            <div className="h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-emerald-800">Subscription Upgraded Successfully!</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Congratulations! Your account is now active on the <strong>{successPlan}</strong> plan tier. We've credited your account with subscription bonus points!
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Subscription</p>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800">
                {PLANS.find(p => p.id === currentPlan)?.name}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                currentPlan === 'FREE' ? 'bg-slate-100 text-slate-600' :
                currentPlan === 'PRO' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
              }`}>
                {currentPlan}
              </span>
            </div>
            {currentPlan !== 'FREE' && user.subscriptionExpiresAt && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Plan expires on <strong>{getExpiryString()}</strong> (Auto-renews)
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Balance Points</p>
              <p className="text-sm font-black text-amber-600">{user.edPoints || 0} Pts</p>
            </div>
            <div className="h-10 w-10 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
              <Gift className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Premium Pricing Cards grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isPopular = plan.popular;
          
          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col rounded-3xl p-6 border transition-all duration-300 bg-white
                ${isPopular ? 'border-sky-500 md:scale-105 shadow-xl md:z-10' : 'border-slate-200 shadow-sm'}
                hover:shadow-md hover:border-slate-300 group`}
            >
              {isPopular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3.5 py-1 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}
              
              {!isPopular && plan.badge && (
                <div className="self-start px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider mb-3">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-1 mt-2">
                <h3 className="text-lg font-black text-slate-800 group-hover:text-sky-700 transition-colors">{plan.name}</h3>
                <p className="text-xs text-slate-400 leading-snug">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 my-5">
                <span className="text-3xl font-black text-slate-800">₹{plan.price}</span>
                <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mb-6">
                {plan.id === 'FREE' ? (
                  <button 
                    disabled 
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 text-center select-none"
                  >
                    {isCurrent ? 'Current Plan' : 'Free Forever'}
                  </button>
                ) : isCurrent ? (
                  <button 
                    disabled 
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 text-center select-none"
                  >
                    Active Tier
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    {/* Main Upgrade Button */}
                    <button 
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loadingPlan !== null}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md
                        ${plan.color === 'amber'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/10'
                          : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sky-600/10'
                        }`}
                    >
                      {loadingPlan === plan.id ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      ) : (
                        <>
                          {plan.buttonText} <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>

                    {/* Official Razorpay Link Support */}
                    {plan.paymentLink && (
                      <a 
                        href={plan.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 text-center flex items-center justify-center gap-1 transition-colors"
                      >
                        Official Razorpay Checkout Page <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {/* Official Razorpay Script Payment Button */}
                    {plan.paymentButtonId && (
                      <div className="w-full pt-1">
                        <RazorpayPaymentButton buttonId={plan.paymentButtonId} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="flex-1 space-y-3.5 border-t border-slate-100 pt-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included features:</p>
                <ul className="space-y-2.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-normal">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.color === 'amber' ? 'text-amber-500' : 'text-sky-500'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Sandbox Payment Mock Modal ─── */}
      {showMockModal && mockOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#1c2e4a] text-white p-5 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-sky-500 rounded-xl flex items-center justify-center font-black text-sm">R</div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Razorpay Checkout</h3>
                  <p className="text-[10px] text-sky-200 font-semibold uppercase tracking-wider">Local Sandbox Simulation</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMockModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 space-y-5">
              
              {/* Payment Summary */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Plan Selected</p>
                  <p className="text-sm font-extrabold text-slate-800">{mockOrderDetails.plan} Membership</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Amount</p>
                  <p className="text-lg font-black text-[#1c2e4a]">₹{mockOrderDetails.amount / 100}</p>
                </div>
              </div>

              {paymentStep === 'card' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="4111 2222 3333 4444" 
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/[^0-9\s]/g, '').slice(0, 19))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-500 focus:bg-white font-medium pl-10"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry (MM/YY)</label>
                      <input 
                        type="text" 
                        placeholder="12/28" 
                        value={expiry}
                        onChange={e => setExpiry(e.target.value.replace(/[^0-9/]/g, '').slice(0, 5))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-500 focus:bg-white font-medium text-center"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">CVV / CVN</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="•••" 
                          value={cvv}
                          onChange={e => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-sky-500 focus:bg-white font-medium text-center pl-8"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-amber-800 text-[10px] leading-relaxed">
                    <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Local Sandbox Mode</strong> does not charge real cards. You can enter any mock card details above and click Pay to trigger the simulation.
                    </p>
                  </div>

                  <button 
                    onClick={handleCompleteMockPayment}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Simulate Payment Successful <Zap className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-14 w-14 border-4 border-sky-100 rounded-full animate-ping" />
                    <Loader2 className="h-10 w-10 text-sky-600 animate-spin" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-sm text-slate-800">Processing Sandbox Payment...</h4>
                    <p className="text-[10px] text-slate-400">Verifying mock order signature and credentials</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-8 gap-4 text-center animate-scale-in">
                  <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-sm text-emerald-800">Payment Verified!</h4>
                    <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                      Your local profile is upgraded. Click continue to update your active dashboard features.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowMockModal(false)}
                    className="mt-3 py-2 px-6 bg-[#1c2e4a] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple internal icon component for modal close
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// Dynamically renders the official Razorpay script-based Payment Button
function RazorpayPaymentButton({ buttonId }: { buttonId: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const form = document.createElement('form');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', buttonId);
      script.async = true;
      form.appendChild(script);
      containerRef.current.appendChild(form);
    }
  }, [buttonId]);

  return <div ref={containerRef} className="w-full flex justify-center py-1 select-none" />;
}
