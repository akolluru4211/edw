'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { 
  MessagesSquare, 
  ThumbsUp, 
  MessageSquarePlus, 
  Plus, 
  RefreshCw,
  Send
} from 'lucide-react';


interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  user: {
    fullName: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  likesCount: number;
  createdAt: string;
  user: {
    fullName: string;
    role: string;
  };
  comments: Comment[];
}

export default function CommunityTimeline() {
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // New Post Form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Comment input maps (postId -> commentText)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/community/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || creating) return;
    setCreating(true);

    try {
      await api.post('/community/posts', {
        title: newTitle.trim(),
        content: newContent.trim()
      });
      setNewTitle('');
      setNewContent('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to publish post:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Optimitic update
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p));
      await api.post(`/community/posts/${postId}/like`);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    // Clear input
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      await api.post('/community/comments', {
        postId,
        content: commentText.trim()
      });
      fetchPosts(); // Reload comment list
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleCommentInputChange = (postId: string, text: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: text }));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Community Q&A</h1>
          <p className="text-slate-500 text-sm mt-1">
            Ask questions, share knowledge, and discuss career topics with peers.
          </p>
        </div>
        <button
          onClick={fetchPosts}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 bg-white border border-slate-200 hover:border-sky-200 px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="space-y-5">
        
        {/* Create Post */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-sky-50 rounded-xl">
              <MessageSquarePlus className="h-4.5 w-4.5 text-sky-600" />
            </div>
            <h2 className="font-bold text-slate-900 text-base">Start a Discussion</h2>
          </div>
          <form onSubmit={handleCreatePost} className="space-y-3">
            <input
              type="text"
              placeholder="Post title — e.g. Tips for the AWS Cloud Practitioner exam"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-colors placeholder:text-slate-400"
            />
            <textarea
              placeholder="Share context, ask your question, or describe what you want to discuss..."
              required
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white transition-colors resize-none placeholder:text-slate-400"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4" />
                {creating ? 'Publishing…' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>

        {/* Feed */}
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-sky-500 border-t-transparent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <MessagesSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-sm">No posts yet — be the first to start a discussion!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {post.user?.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{post.user?.fullName}</p>
                    <p className="text-xs text-slate-400 capitalize">{post.user?.role?.toLowerCase()}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">{post.title}</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Like + Comments count */}
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}
                </button>
                <span className="text-slate-400 text-sm">{post.comments?.length || 0} comments</span>
              </div>

              {/* Comments */}
              {post.comments?.length > 0 && (
                <div className="space-y-3 pl-3 border-l-2 border-slate-100">
                  {post.comments.map((c: Comment) => (
                    <div key={c.id}>
                      <p className="font-semibold text-slate-800 text-xs">{c.user?.fullName}</p>
                      <p className="text-slate-600 text-sm mt-0.5 leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <form
                onSubmit={(e) => handleAddComment(e, post.id)}
                className="flex gap-2 items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:border-sky-400 transition-colors"
              >
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!commentInputs[post.id]?.trim()}
                  className="p-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
