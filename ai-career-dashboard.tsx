'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';

interface CareerInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'tip';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'growth' | 'content' | 'revenue' | 'networking' | 'skills';
}

interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  actionSteps: string[];
  expectedOutcome: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToComplete: string;
  category: 'immediate' | 'this_week' | 'this_month';
}

export default function AICareerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<CareerInsight[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    generateAIInsights();
  }, []);

  const generateAIInsights = async () => {
    setLoading(true);
    
    // Get user data from onboarding
    const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate personalized insights based on user data
    const userInsights = generatePersonalizedInsights(onboardingData);
    const userGoals = generateWeeklyGoals(onboardingData);
    const userRecs = generateRecommendations(onboardingData);
    
    setInsights(userInsights);
    setWeeklyGoals(userGoals);
    setRecommendations(userRecs);
    setLoading(false);
  };

  const generatePersonalizedInsights = (data: any): CareerInsight[] => {
    const insights: CareerInsight[] = [];
    
    // Career stage insights
    if (data.goals?.careerStage === 'hobbyist') {
      insights.push({
        id: '1',
        type: 'tip',
        title: 'Perfect Time to Start Building',
        description: 'As a hobbyist, focus on consistency. Regular uploads build momentum.',
        action: 'Upload one track this week',
        priority: 'high',
        category: 'growth'
      });
    } else if (data.goals?.careerStage === 'emerging') {
      insights.push({
        id: '1',
        type: 'opportunity',
        title: 'Growth Acceleration Window',
        description: 'Your emerging status is perfect for rapid growth. Focus on audience engagement.',
        action: 'Start daily social media posting',
        priority: 'high',
        category: 'growth'
      });
    }

    // Genre-specific insights
    if (data.profile?.genre === 'Hip Hop') {
      insights.push({
        id: '2',
        type: 'tip',
        title: 'Hip Hop Trend Alert',
        description: 'TikTok and Instagram Reels are driving Hip Hop discovery right now.',
        action: 'Create 15-second track previews',
        priority: 'medium',
        category: 'content'
      });
    } else if (data.profile?.genre === 'Electronic') {
      insights.push({
        id: '2',
        type: 'opportunity',
        title: 'Playlist Placement Opportunity',
        description: 'Electronic music has high playlist acceptance rates on Spotify.',
        action: 'Submit to electronic playlists',
        priority: 'high',
        category: 'growth'
      });
    }

    // Goal-specific insights
    if (data.goals?.primaryGoals?.includes('grow-audience')) {
      insights.push({
        id: '3',
        type: 'success',
        title: 'Audience Growth Strategy Ready',
        description: 'Your profile is optimized for discovery. Time to be more active.',
        action: 'Post 3x per week for 30 days',
        priority: 'high',
        category: 'growth'
      });
    }

    // Platform insights
    const connectedPlatforms = data.platforms?.connections?.filter(p => p.connected)?.length || 0;
    if (connectedPlatforms === 0) {
      insights.push({
        id: '4',
        type: 'warning',
        title: 'Missing Analytics Data',
        description: 'Connect your platforms to unlock detailed insights and recommendations.',
        action: 'Connect Spotify or YouTube',
        priority: 'medium',
        category: 'skills'
      });
    }

    // Time commitment insights
    if (data.goals?.timeCommitment === '1-5 hours') {
      insights.push({
        id: '5',
        type: 'tip',
        title: 'Maximize Your Limited Time',
        description: 'With 1-5 hours weekly, focus on high-impact activities like content creation.',
        action: 'Batch create content on Sundays',
        priority: 'medium',
        category: 'content'
      });
    }

    return insights;
  };

  const generateWeeklyGoals = (data: any): WeeklyGoal[] => {
    const goals: WeeklyGoal[] = [];
    const currentDate = new Date();
    const weekEnd = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (data.goals?.primaryGoals?.includes('grow-audience')) {
      goals.push({
        id: '1',
        title: 'Grow Social Media Following',
        description: 'Increase followers across all platforms by engaging daily',
        progress: 30,
        target: '+50 followers',
        deadline: weekEnd.toLocaleDateString(),
        status: 'in_progress'
      });
    }

    if (!data.firstTrack) {
      goals.push({
        id: '2',
        title: 'Upload First Track',
        description: 'Share your music with the world and start building your catalog',
        progress: 0,
        target: '1 track uploaded',
        deadline: weekEnd.toLocaleDateString(),
        status: 'pending'
      });
    }

    goals.push({
      id: '3',
      title: 'Complete Profile Setup',
      description: 'Fill out all profile sections for better discoverability',
      progress: 75,
      target: '100% profile completion',
      deadline: weekEnd.toLocaleDateString(),
      status: 'in_progress'
    });

    return goals;
  };

  const generateRecommendations = (data: any): AIRecommendation[] => {
    const recs: AIRecommendation[] = [];

    // Immediate actions
    recs.push({
      id: '1',
      title: 'Create Your First TikTok',
      description: 'Share a 15-second behind-the-scenes video of your music creation process',
      reasoning: `Based on your ${data.profile?.genre || 'music'} genre and growth goals, TikTok can rapidly increase your visibility`,
      actionSteps: [
        'Record yourself making music or playing an instrument',
        'Add trending audio or your own track preview',
        'Use relevant hashtags for your genre',
        'Post consistently for 7 days'
      ],
      expectedOutcome: 'Potential reach of 1,000-10,000 new listeners',
      difficulty: 'easy',
      timeToComplete: '2 hours',
      category: 'immediate'
    });

    // Weekly recommendations
    if (data.goals?.primaryGoals?.includes('collaborate')) {
      recs.push({
        id: '2',
        title: 'Reach Out to 5 Artists for Collaboration',
        description: 'Network with artists in your genre for potential collaborations',
        reasoning: 'Collaborations can double your audience reach and create lasting industry connections',
        actionSteps: [
          'Research artists with similar audience size',
          'Listen to their music and find connection points',
          'Send personalized collaboration proposals',
          'Offer specific value (vocals, production, etc.)'
        ],
        expectedOutcome: '1-2 positive responses, potential collaboration projects',
        difficulty: 'medium',
        timeToComplete: '3 hours',
        category: 'this_week'
      });
    }

    // Monthly recommendations
    recs.push({
      id: '3',
      title: 'Launch Your First Release Campaign',
      description: 'Plan and execute a full marketing campaign for your next release',
      reasoning: 'Strategic releases with proper marketing can 10x your track performance',
      actionSteps: [
        'Set release date 4 weeks in advance',
        'Create social media content calendar',
        'Submit to playlists and blogs',
        'Plan release week activities',
        'Track and analyze results'
      ],
      expectedOutcome: '500-2000 new streams, potential playlist placements',
      difficulty: 'hard',
      timeToComplete: '10 hours over 4 weeks',
      category: 'this_month'
    });

    return recs;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return '🚀';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'tip': return '💡';
      default: return '📊';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'tip': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

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
            <div className="text-2xl font-bold text-gray-900">{weeklyGoals.length}</div>
            <div className="text-sm text-gray-600">Weekly Goals</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-gray-900">{recommendations.filter(r => r.category === 'immediate').length}</div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
                <div className="flex space-x-2">
                  {['all', 'growth', 'content', 'revenue', 'networking'].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredInsights.map(insight => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{getInsightIcon(insight.type)}</div>
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

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended Actions</h2>
              <div className="space-y-6">
                {recommendations.map(rec => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rec.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          rec.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rec.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{rec.timeToComplete}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{rec.description}</p>
                    
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-sm text-gray-700 font-medium mb-2">Why this works:</p>
                      <p className="text-sm text-gray-600">{rec.reasoning}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Action Steps:</p>
                      <ol className="text-sm text-gray-600 space-y-1">
                        {rec.actionSteps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-600 font-medium mr-2">{index + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600 font-medium">
                        Expected: {rec.expectedOutcome}
                      </p>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors text-sm">
                        Start Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weekly Goals */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">This Week's Goals</h2>
              <div className="space-y-4">
                {weeklyGoals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{goal.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        goal.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {goal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: {goal.target}</span>
                      <span>Due: {goal.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <div className="font-medium text-purple-900">📊 Request Career Analysis</div>
                  <div className="text-sm text-purple-700">Get detailed insights about your progress</div>
                </button>
                <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="font-medium text-blue-900">🎯 Set New Goals</div>
                  <div className="text-sm text-blue-700">Define your next career milestones</div>
                </button>
                <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <div className="font-medium text-green-900">📈 View Progress Report</div>
                  <div className="text-sm text-green-700">See how you're trending over time</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}