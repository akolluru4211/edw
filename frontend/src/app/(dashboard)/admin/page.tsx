'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
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
  Send
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
}

export default function AdminConsole() {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  
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
      alert("No user records available to export.");
      return;
    }

    // Define CSV Headers
    const headers = ["Member ID", "Full Name", "Email", "Role", "Registered Date"];
    
    // Format rows
    const rows = users.map(u => [
      u.memberId || 'N/A',
      u.fullName,
      u.email,
      u.role,
      new Date(u.createdAt).toLocaleDateString()
    ]);

    // Build CSV Content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create a Blob and download link
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Unauthorized or failed to retrieve administrative controls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  // Deny access check
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
      // Refresh metrics
      const metricsRes = await api.get('/admin/metrics');
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      console.error('Failed to update user role:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user.id) {
      alert("Cannot delete your own admin account.");
      return;
    }
    if (!confirm("Are you sure you want to delete this user? This will cascade delete their profile and resumes.")) return;
    
    setActionLoadingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      // Refresh metrics
      const metricsRes = await api.get('/admin/metrics');
      setMetrics(metricsRes.data.metrics);
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setActionLoadingId(null);
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
            Monitor system-wide metrics, review student account listings, adjust system roles, and audit SQLite database stats.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button 
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Users to Excel</span>
          </button>
          <button 
            onClick={fetchAdminData}
            className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-4 rounded-2xl">
          {errorMsg}
        </div>
      )}

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
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">{item.val}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </motion.div>
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

      {/* User listings Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-2">
          <UserCog className="h-5 w-5 text-sky-600" />
          <h2 className="text-slate-800 font-extrabold text-base tracking-tight">Active User Accounts</h2>
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
                  <th className="p-4">Registered On</th>
                  <th className="p-4">Authorization Role</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                          {u.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-medium select-all">{u.email}</td>
                    <td className="p-4 text-slate-400 font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
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
      </div>

    </div>
  );
}
