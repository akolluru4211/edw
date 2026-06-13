'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api, BACKEND_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  RefreshCw,
  Zap,
  ArrowRight,
  X,
  ExternalLink
} from 'lucide-react';

interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  atsScore: number;
  keywordReport: string; // JSON string
  uploadedAt: string;
}

export default function ResumeOptimizer() {
  const { refreshUser } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resume');
      setResumes(res.data);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Only PDF and DOCX files are accepted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const allowed = ['.pdf', '.docx', '.doc'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setError('Only PDF and DOCX files are accepted.');
      return;
    }
    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchResumes();
      await refreshUser();
    } catch (err: any) {
      console.error('Failed to upload resume:', err);
      setError(err?.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await api.delete(`/resume/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
      await refreshUser();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">ATS Resume Optimizer</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload your real resume (PDF or DOCX) to get an instant ATS compatibility score with improvement suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Zone & Scanner */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-slate-900 text-base mb-4">Upload Your Resume</h2>
            
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all select-none ${
                selectedFile
                  ? 'border-sky-400 bg-sky-50/40'
                  : 'border-slate-200 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3.5 rounded-2xl ${selectedFile ? 'bg-sky-100 text-sky-600' : 'bg-sky-50 text-sky-500'}`}>
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {selectedFile ? selectedFile.name : 'Click or drag & drop your resume here'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedFile 
                      ? `${formatBytes(selectedFile.size)} · PDF / DOCX`
                      : 'Accepts PDF, DOCX · Max 10MB'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Selected file action row */}
            {selectedFile && (
              <div className="mt-4 flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-800">{selectedFile.name}</span>
                    <span className="text-xs text-slate-500">{formatBytes(selectedFile.size)} · Ready to analyze</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {uploading ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <>Analyze Resume <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resume list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-base">Analyzed Resumes</h2>
              <button onClick={fetchResumes} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {resumes.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No resumes uploaded yet</p>
                <p className="text-slate-300 text-xs mt-1">Upload a PDF or DOCX above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map(r => (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{r.fileName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(r.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mt-1.5 ${
                          r.atsScore >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                          r.atsScore >= 60 ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                          'bg-red-50 border-red-200 text-red-700'
                        }`}>
                          ATS: {r.atsScore}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a 
                        href={`${BACKEND_URL}${r.fileUrl}`}
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 px-3 py-2 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </a>
                      <button 
                        onClick={() => handleDeleteResume(r.id)} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Score Panel */}
        <div className="lg:col-span-1">
          {resumes.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Latest ATS Score</p>
                <div className="relative flex items-center justify-center">
                  <svg height="120" width="120" className="-rotate-90">
                    <circle stroke="#f1f5f9" fill="transparent" strokeWidth="8" r="48" cx="60" cy="60" />
                    <circle
                      stroke={resumes[0].atsScore >= 80 ? '#10b981' : resumes[0].atsScore >= 60 ? '#f59e0b' : '#ef4444'}
                      fill="transparent" strokeWidth="8"
                      strokeDasharray={301.6}
                      style={{ strokeDashoffset: 301.6 - (resumes[0].atsScore / 100) * 301.6, transition: 'stroke-dashoffset 1s ease' }}
                      r="48" cx="60" cy="60" strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-900">{resumes[0].atsScore}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Match</span>
                  </div>
                </div>
                <p className={`mt-3 text-sm font-bold ${
                  resumes[0].atsScore >= 80 ? 'text-emerald-600' : 
                  resumes[0].atsScore >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {resumes[0].atsScore >= 80 ? '🎉 Excellent match!' : 
                   resumes[0].atsScore >= 60 ? '⚠️ Needs improvement' : '❌ Low ATS score'}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <p className="font-bold text-slate-900 text-sm mb-3">AI Feedback</p>
                {resumes[0].keywordReport && JSON.parse(resumes[0].keywordReport).map((line: string, idx: number) => {
                  const isWarning = line.includes('⚠️');
                  const isSuccess = line.includes('✅');
                  return (
                    <div key={idx} className={`p-3 border rounded-xl flex items-start gap-2.5 ${
                      isSuccess ? 'bg-emerald-50 border-emerald-100' : isWarning ? 'bg-amber-50 border-amber-100' : 'bg-sky-50 border-sky-100'
                    }`}>
                      <div className="shrink-0 mt-0.5">
                        {isSuccess && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                        {isWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        {!isSuccess && !isWarning && <Zap className="h-4 w-4 text-sky-500" />}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{line.replace(/^[✅⚠️💡]/, '').trim()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-semibold">No analysis yet</p>
              <p className="text-slate-400 text-xs mt-1">Upload a resume to see your ATS score and feedback</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
