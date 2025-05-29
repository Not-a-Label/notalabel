'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MegaphoneIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  ChartBarIcon,
  SparklesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface MarketingPost {
  id: number;
  type: string;
  content: string;
  platform: string;
  scheduledFor: string | null;
  status: string;
  createdAt: string;
}

interface MarketingStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
}

export default function MarketingDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [stats, setStats] = useState<MarketingStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0
  });
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'announcement',
    content: '',
    platform: 'instagram',
    scheduledFor: ''
  });

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketing/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketing/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.analytics.posts);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketing/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: newPost.type,
          context: {
            artistName: 'Your Artist Name',
            genre: 'Your Genre',
            announcement: 'Your announcement'
          },
          tone: 'professional'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
        setNewPost({ ...newPost, content: data.content });
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const createPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/marketing/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPost)
      });
      
      if (response.ok) {
        fetchPosts();
        fetchStats();
        setShowGenerator(false);
        setNewPost({
          type: 'announcement',
          content: '',
          platform: 'instagram',
          scheduledFor: ''
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const deletePost = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/marketing/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchPosts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketing Hub</h1>
        <button
          onClick={() => setShowGenerator(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
            <MegaphoneIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Published</p>
              <p className="text-2xl font-bold">{stats.publishedPosts}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Drafts</p>
              <p className="text-2xl font-bold">{stats.draftPosts}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Scheduled</p>
              <p className="text-2xl font-bold">{stats.scheduledPosts}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Post Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create Marketing Post</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Post Type</label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2"
                >
                  <option value="announcement">Announcement</option>
                  <option value="promotion">Promotion</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select
                  value={newPost.platform}
                  onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2"
                >
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="facebook">Facebook</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 h-32"
                  placeholder="Write your post content..."
                />
                <button
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="mt-2 flex items-center space-x-2 text-purple-400 hover:text-purple-300"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Schedule For (Optional)</label>
                <input
                  type="datetime-local"
                  value={newPost.scheduledFor}
                  onChange={(e) => setNewPost({ ...newPost, scheduledFor: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowGenerator(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                disabled={!newPost.content}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Posts</h2>
        
        {posts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No posts yet. Create your first marketing post!</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.status === 'published' ? 'bg-green-600' :
                        post.status === 'scheduled' ? 'bg-blue-600' :
                        'bg-gray-600'
                      }`}>
                        {post.status}
                      </span>
                      <span className="text-gray-400 text-sm">{post.platform}</span>
                      <span className="text-gray-400 text-sm">• {post.type}</span>
                    </div>
                    <p className="text-gray-200 mb-2">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Created: {formatDate(post.createdAt)}</span>
                      {post.scheduledFor && (
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>Scheduled: {formatDate(post.scheduledFor)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="text-gray-400 hover:text-white">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => deletePost(post.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}