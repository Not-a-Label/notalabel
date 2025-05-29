'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';
import AIChatInterface from '@/components/ai/AIChatInterface';

interface CareerInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'tip';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'growth' | 'content' | 'revenue' | 'networking' | 'skills';
}

export default function AICareerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CareerInsight[]>([]);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    generateAIInsights();
  }, []);

  const generateAIInsights = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate sample insights
    const sampleInsights: CareerInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'TikTok Growth Window Open',
        description: 'Your genre is trending on TikTok. Perfect time to post track previews.',
        action: 'Create 15-second previews',
        priority: 'high',
        category: 'growth'
      },
      {
        id: '2',
        type: 'tip',
        title: 'Playlist Submission Ready',
        description: 'Your track quality and follower count make you playlist-ready.',
        action: 'Submit to 10 playlists',
        priority: 'high',
        category: 'growth'
      },
      {
        id: '3',
        type: 'success',
        title: 'Profile Optimization Complete',
        description: 'Your profile is well-optimized for discovery across platforms.',
        priority: 'low',
        category: 'skills'
      }
    ];
    
    setInsights(sampleInsights);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Analyzing Your Career...</h2>
            <p className="text-gray-600">Generating personalized insights and recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🤖 AI Career Assistant
              </h1>
              <p className="text-gray-600">
                Personalized insights and recommendations to accelerate your music career
              </p>
            </div>
            <button
              onClick={() => setShowChat(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              💬 Chat with AI
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-2xl font-bold text-gray-900">{insights.length}</div>
            <div className="text-sm text-gray-600">Active Insights</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-600">Weekly Goals</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-gray-900">5</div>
            <div className="text-sm text-gray-600">Quick Wins</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-purple-600">
              {insights.filter(i => i.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Insights</h2>
          <div className="space-y-4">
            {insights.map(insight => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-2 ${
                  insight.type === 'opportunity' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  insight.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  'bg-purple-50 border-purple-200 text-purple-800'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {insight.type === 'opportunity' ? '🚀' :
                     insight.type === 'warning' ? '⚠️' :
                     insight.type === 'success' ? '✅' : '💡'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{insight.description}</p>
                    {insight.action && (
                      <button className="text-sm font-medium underline hover:no-underline">
                        {insight.action} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🎵 Upload New Music</h3>
              <p className="text-sm text-gray-600 mb-3">Share your latest tracks to keep your audience engaged</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700">
                Start Upload
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📱 Create Social Content</h3>
              <p className="text-sm text-gray-600 mb-3">Generate a content calendar for the next month</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                Generate Content
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Set Weekly Goals</h3>
              <p className="text-sm text-gray-600 mb-3">Define specific, achievable targets for this week</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
                Set Goals
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Track Progress</h3>
              <p className="text-sm text-gray-600 mb-3">Review your growth and analytics from last week</p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Interface */}
      {showChat && (
        <AIChatInterface onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}