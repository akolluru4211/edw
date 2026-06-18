'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Briefcase, 
  MessagesSquare, 
  Trash2, 
  UserCog, 
  TrendingUp,
  RefreshCw,
  Lock,
  MessageSquare,
  Download,
  Send,
  Coins,
  Activity,
  Plus,
  Minus,
  Sparkles,
  Award,
  Check,
  X,
  Link2
} from 'lucide-react';

interface AdminMetrics {
  users: number;
  profiles: number;
  resumes: number;
  applications: number;
  opportunities: number;
  connections: number;
  posts: number;
  chats: number;
}

interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'ADMIN';
  createdAt: string;
  memberId?: string;
  edPoints: number;
}

interface PointTransaction {
  id: string;
  points: number;
  description: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  };
}

interface ActivityLog {
  id: string;
  type: string;
  email: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

interface AmbassadorApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  collegeName: string;
  course: string;
  year: string;
  rollNumber: string;
  city: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function AdminConsole() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'logs' | 'ambassadors' | 'ads'>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [ambassadors, setAmbassadors] = useState<AmbassadorApplication[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bulk Custom Message Sender States
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const handleExportExcel = () => {
    if (users.length === 0) {
      setErrorMsg("No user records available to export.");
      return;
    }

    const headers = ["Member ID", "Full Name", "Email", "Role", "Ed Points", "Registered Date"];
    const rows = users.map(u => [
      u.memberId || 'N/A',
      u.fullName,
      u.email,
      u.role,
      u.edPoints,
      new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `edworld_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendBulkAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSuccess(null);
    setBulkError(null);

    if (!bulkTitle.trim() || !bulkText.trim()) {
      setBulkError("Please specify an announcement title and message body.");
      return;
    }

    setSendingBulk(true);
    try {
      const response = await api.post('/admin/notifications/bulk', {
        title: bulkTitle,
        text: bulkText
      });
      setBulkSuccess(`Successfully dispatched announcement to ${response.data.count} users!`);
      setBulkTitle('');
      setBulkText('');
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      setBulkError(err.response?.data?.error || "Failed to send bulk announcements.");
    } finally {
      setSendingBulk(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const metricsRes = await api.get('/admin/metrics');
      setMetrics(metricsRes.data.metrics);
      
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);

      const logsRes = await api.get('/admin/logs');
      setLogs(logsRes.data);

      const txRes = await api.get('/admin/transactions');
      setTransactions(txRes.data);

      try {
        const ambassadorsRes = await api.get('/ambassador/admin');
        setAmbassadors(ambassadorsRes.data);
      } catch (ambErr) {
        console.error('Failed to fetch ambassador applications:', ambErr);
      }

      try {
        const adsRes = await api.get('/admin/ads');
        setAds(adsRes.data);
      } catch (adsErr) {
        console.error('Failed to fetch ads:', adsErr);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Unauthorized or failed to retrieve administrative controls.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAmbassadorStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(id);
    try {
      await api.put(`/ambassador/admin/${id}/status`, { status: newStatus });
      setAmbassadors(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error('Failed to update ambassador status:', err);
      setErrorMsg('Failed to update application status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-extrabold text-slate-800 text-lg">Access Prohibited</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            Administrative credentials are required to access database tables and telemetry logs. Your user account role is flagged as {user?.role}.
          </p>
        </div>
      </div>
    );
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      const metricsRes = await api.get('/admin/metrics');
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      console.error('Failed to update user role:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAdjustPoints = async (userId: string, currentPoints: number, amount: number) => {
    setActionLoadingId(userId);
    const newPoints = Math.max(0, currentPoints + amount);
    try {
      await api.put(`/admin/users/${userId}/points`, { points: newPoints });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, edPoints: newPoints } : u));
      
      const txRes = await api.get('/admin/transactions');
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to adjust user points:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user.id) {
      setErrorMsg("Cannot delete your own admin account.");
      return;
    }
    if (!confirm("Are you sure you want to delete this user? This will cascade delete their profile and resumes.")) return;
    
    setActionLoadingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      const metricsRes = await api.get('/admin/metrics');
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to delete all activity logs from the database?")) return;
    setLoading(true);
    try {
      await api.delete('/admin/logs');
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-sky-600" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Monitor system-wide metrics, review student account listings, adjust system roles, and audit database telemetry.
          </p>
        </div>

        <div className="flex gap-3 items-center shrink-0">
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Users</span>
          </button>
          <button 
            onClick={fetchAdminData}
            className="text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-4 rounded-2xl animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Admin Tab Selectors */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto max-w-full">
        {[
          { id: 'overview', label: 'System Overview', icon: ShieldCheck },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'transactions', label: 'Point Transactions', icon: Coins },
          { id: 'logs', label: 'Activity Audit Logs', icon: Activity },
          { id: 'ambassadors', label: 'Ambassadors Apply', icon: Award },
          { id: 'ads', label: 'Advertisements', icon: Link2 }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Database Telemetry Grid */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'Total Accounts', val: metrics.users, icon: Users, color: 'text-sky-600 bg-sky-50' },
                  { label: 'Scanned Resumes', val: metrics.resumes, icon: FileText, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Active Openings', val: metrics.opportunities, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Connected Peers', val: metrics.connections, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Discussion Posts', val: metrics.posts, icon: MessagesSquare, color: 'text-violet-600 bg-violet-50' },
                  { label: 'AI Mentorship Chats', val: metrics.chats, icon: MessageSquare, color: 'text-pink-600 bg-pink-50' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                        <h3 className="text-xl font-black text-slate-800 mt-1">{item.val}</h3>
                      </div>
                      <div className={`p-2.5 rounded-xl ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bulk Announcement Center */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-slate-800 font-extrabold text-base tracking-tight mb-2 flex items-center gap-2">
                <MessagesSquare className="h-5 w-5 text-sky-600" />
                Bulk Announcement Center
              </h2>
              <p className="text-slate-400 text-xs font-semibold mb-6">
                Broadcast a custom notification and dispatch an automated email with "Edworld Co." branding and logo to all registered platform users.
              </p>

              {bulkSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold p-4 rounded-2xl mb-6">
                  {bulkSuccess}
                </div>
              )}

              {bulkError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-4 rounded-2xl mb-6">
                  {bulkError}
                </div>
              )}

              <form onSubmit={handleSendBulkAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-slate-600 font-bold text-xs mb-1.5">Announcement Title / Email Subject</label>
                  <input 
                    type="text"
                    placeholder="e.g. Platform System Maintenance Schedule"
                    value={bulkTitle}
                    onChange={(e) => setBulkTitle(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold text-xs mb-1.5">Message Content</label>
                  <textarea 
                    rows={4}
                    placeholder="Type your bulk custom message here..."
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:border-sky-300 focus:outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingBulk}
                  className="bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
                >
                  {sendingBulk ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Broadcasting to all users...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Broadcast Announcement & Email</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-sky-600" />
                <h2 className="text-slate-800 font-extrabold text-base tracking-tight">Active User Accounts</h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{users.length} Total</span>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4 pl-6">Candidate Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Ed Points</th>
                      <th className="p-4">Authorization Role</th>
                      <th className="p-4">Registered On</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                              {u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <span className="font-bold text-slate-800">{u.fullName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 font-medium select-all">{u.email}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Coins className="h-3.5 w-3.5 text-amber-500" />
                            <span className="font-extrabold text-slate-800">{u.edPoints} Pts</span>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => handleAdjustPoints(u.id, u.edPoints, 200)}
                                disabled={actionLoadingId === u.id}
                                title="Award 200 Points"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 transition-all cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleAdjustPoints(u.id, u.edPoints, -200)}
                                disabled={actionLoadingId === u.id || u.edPoints < 200}
                                title="Deduct 200 Points"
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-all cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role}
                            disabled={actionLoadingId === u.id}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 focus:outline-none"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="ALUMNI">Alumni</option>
                            <option value="MENTOR">Mentor</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td className="p-4 text-slate-400 font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={actionLoadingId === u.id}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-2">
              <Coins className="h-5 w-5 text-sky-600" />
              <h2 className="text-slate-800 font-extrabold text-base tracking-tight">Point Transactions Ledger</h2>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium text-sm">
                No point transactions logged in the ledger yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4 pl-6">Member Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Points Delta</th>
                      <th className="p-4">Log Description</th>
                      <th className="p-4 pr-6">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 text-slate-800 font-bold">{tx.user?.fullName || 'System Event'}</td>
                        <td className="p-4 text-slate-500 font-medium">{tx.user?.email || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${
                            tx.points > 0 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {tx.points > 0 ? `+${tx.points}` : tx.points} Pts
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{tx.description}</td>
                        <td className="p-4 pr-6 text-slate-400 font-medium">{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-sky-600" />
                <h2 className="text-slate-800 font-extrabold text-base tracking-tight">System Audit & Activity Logs</h2>
              </div>
              {logs.length > 0 && (
                <button
                  onClick={handleClearLogs}
                  className="text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium text-sm">
                No activity logs in the system database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4 pl-6">Log Type</th>
                      <th className="p-4">Actor Email</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4 pr-6">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/80 text-slate-700 font-mono text-[9px] font-black rounded-md tracking-wider">
                            {log.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-800 font-bold">{log.email}</td>
                        <td className="p-4 text-slate-500 font-medium leading-relaxed max-w-sm truncate" title={log.details}>
                          {log.details}
                        </td>
                        <td className="p-4 text-slate-400 font-mono font-medium">{log.ipAddress || 'local'}</td>
                        <td className="p-4 pr-6 text-slate-400 font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'ambassadors' && (
          <motion.div
            key="ambassadors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-sky-600" />
                <h2 className="text-slate-800 font-extrabold text-base tracking-tight">Ambassador Applications</h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{ambassadors.length} Total</span>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : ambassadors.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium text-sm">
                No ambassador applications in the system database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4 pl-6">Student Details</th>
                      <th className="p-4">College Details</th>
                      <th className="p-4">Social Media & Contacts</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {ambassadors.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 space-y-1">
                          <div className="font-bold text-slate-800">{a.name}</div>
                          <div className="text-slate-400 font-medium text-[10px] select-all">{a.email}</div>
                          <div className="text-slate-400 font-medium text-[10px]">Roll: {a.rollNumber}</div>
                        </td>
                        <td className="p-4 space-y-1">
                          <div className="font-bold text-slate-700">{a.collegeName}</div>
                          <div className="text-slate-500 font-medium">{a.course}</div>
                          <div className="text-slate-400 font-medium text-[10px]">{a.year} Year • {a.city}</div>
                        </td>
                        <td className="p-4 space-y-1.5">
                          <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                            <div>📞 Phone: <span className="select-all">{a.phone}</span></div>
                            <div>💬 WhatsApp: <span className="select-all">{a.whatsapp}</span></div>
                          </div>
                          <div>
                            <a 
                              href={a.linkedin} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-sky-600 hover:text-sky-700 font-bold hover:underline"
                            >
                              <Link2 className="h-3 w-3" />
                              <span>Social Profile</span>
                            </a>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider ${
                            a.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : a.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {a.status === 'PENDING' && (
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleUpdateAmbassadorStatus(a.id, 'APPROVED')}
                                disabled={actionLoadingId === a.id}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                                title="Approve Application"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleUpdateAmbassadorStatus(a.id, 'REJECTED')}
                                disabled={actionLoadingId === a.id}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                                title="Reject Application"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                          {a.status !== 'PENDING' && (
                            <span className="text-[10px] text-slate-400 font-bold">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'ads' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Advertisements</h2>
                <p className="text-xs text-slate-500 mt-1">Manage ad campaigns submitted by business owners</p>
              </div>
              <a href="/ads" target="_blank" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all">
                <Plus className="h-3.5 w-3.5" /> View Ad Portal
              </a>
            </div>

            {ads.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <Link2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-2">No advertisements yet</p>
                <p className="text-slate-400 text-xs">Ads submitted by business owners will appear here</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ad</th>
                        <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business</th>
                        <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget</th>
                        <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Performance</th>
                        <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {ads.map(ad => (
                        <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {ad.imageUrl ? <img src={ad.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover border border-slate-100" /> : <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center"><Link2 className="h-4 w-4 text-slate-400" /></div>}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{ad.title}</p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{ad.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-semibold text-slate-700">{ad.businessName}</p>
                            <p className="text-[10px] text-slate-400">{ad.contactEmail}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-bold text-slate-700">₹{ad.totalBudget}</p>
                            <p className="text-[10px] text-slate-400">₹{ad.costPerDay}/day · ₹{ad.costPer100Views}/100 views</p>
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-semibold text-slate-700">{ad.views.toLocaleString()} views</p>
                            <p className="text-[10px] text-slate-400">{ad.clicks.toLocaleString()} clicks</p>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ad.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              ad.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              ad.status === 'PAUSED' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                              ad.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                              'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>{ad.status}</span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex gap-1 justify-end">
                              {ad.status === 'PENDING' && (
                                <button onClick={async () => { await api.put(`/admin/ads/${ad.id}/status`, { status: 'ACTIVE' }); fetchAdminData(); }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-all cursor-pointer" title="Approve">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {ad.status === 'ACTIVE' && (
                                <button onClick={async () => { await api.put(`/admin/ads/${ad.id}/status`, { status: 'PAUSED' }); fetchAdminData(); }}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 transition-all cursor-pointer" title="Pause">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {ad.status === 'PAUSED' && (
                                <button onClick={async () => { await api.put(`/admin/ads/${ad.id}/status`, { status: 'ACTIVE' }); fetchAdminData(); }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-all cursor-pointer" title="Resume">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button onClick={async () => { if (confirm('Delete this ad?')) { await api.delete(`/admin/ads/${ad.id}`); fetchAdminData(); } }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-all cursor-pointer" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
