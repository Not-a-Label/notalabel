'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  UsersIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  overview: {
    totalPosts: number;
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
    growthRate: number;
  };
  platforms: {
    [key: string]: {
      posts: number;
      reach: number;
      engagement: number;
      followers: number;
    };
  };
  timeRange: {
    daily: Array<{
      date: string;
      posts: number;
      reach: number;
      engagement: number;
    }>;
    weekly: Array<{
      week: string;
      posts: number;
      reach: number;
      engagement: number;
    }>;
    monthly: Array<{
      month: string;
      posts: number;
      reach: number;
      engagement: number;
    }>;
  };
  topPosts: Array<{
    id: number;
    content: string;
    platform: string;
    reach: number;
    engagement: number;
    date: string;
  }>;
  audienceInsights: {
    demographics: {
      ageGroups: { [key: string]: number };
      locations: { [key: string]: number };
      interests: { [key: string]: number };
    };
    bestTimes: {
      days: { [key: string]: number };
      hours: { [key: string]: number };
    };
  };
}

export default function AdvancedAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedPlatform]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/advanced?timeRange=${timeRange}&platform=${selectedPlatform}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Mock data for demonstration
      setAnalytics({
        overview: {
          totalPosts: 47,
          totalReach: 15420,
          totalEngagement: 892,
          avgEngagementRate: 5.8,
          growthRate: 23.5
        },
        platforms: {
          instagram: { posts: 18, reach: 8500, engagement: 425, followers: 1250 },
          twitter: { posts: 15, reach: 4200, engagement: 315, followers: 850 },
          facebook: { posts: 10, reach: 2100, engagement: 105, followers: 420 },
          tiktok: { posts: 4, reach: 620, engagement: 47, followers: 180 }
        },
        timeRange: {
          daily: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            posts: Math.floor(Math.random() * 5) + 1,
            reach: Math.floor(Math.random() * 1000) + 500,
            engagement: Math.floor(Math.random() * 100) + 20
          })),
          weekly: [],
          monthly: []
        },
        topPosts: [
          {
            id: 1,
            content: "🎸 Just dropped my new single 'Electric Dreams'! What do you think?",
            platform: 'instagram',
            reach: 2500,
            engagement: 185,
            date: '2025-05-26'
          },
          {
            id: 2,
            content: "Behind the scenes of my latest recording session 🎵",
            platform: 'twitter',
            reach: 1800,
            engagement: 142,
            date: '2025-05-25'
          }
        ],
        audienceInsights: {
          demographics: {
            '18-24': 35,
            '25-34': 42,
            '35-44': 18,
            '45+': 5
          },
          bestTimes: {
            Monday: 15,
            Tuesday: 12,
            Wednesday: 8,
            Thursday: 18,
            Friday: 25,
            Saturday: 20,
            Sunday: 2
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="daily">Last 7 Days</option>
            <option value="weekly">Last 4 Weeks</option>
            <option value="monthly">Last 6 Months</option>
          </select>
          
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalReach)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+{analytics.overview.growthRate}%</span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Engagement</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalEngagement)}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <HeartIcon className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">Rate: {analytics.overview.avgEngagementRate}%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalPosts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">This {timeRange.slice(0, -2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.growthRate}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">Month over month</span>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.platforms).map(([platform, data]) => (
            <div key={platform} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold capitalize">{platform}</h3>
                <span className="text-sm text-gray-500">{data.posts} posts</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reach:</span>
                  <span className="text-sm font-medium">{formatNumber(data.reach)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Engagement:</span>
                  <span className="text-sm font-medium">{formatNumber(data.engagement)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Followers:</span>
                  <span className="text-sm font-medium">{formatNumber(data.followers)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Posts</h2>
        <div className="space-y-4">
          {analytics.topPosts.map((post) => (
            <div key={post.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{post.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="capitalize">{post.platform}</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-600">Reach: {formatNumber(post.reach)}</div>
                  <div className="text-sm text-gray-600">Engagement: {formatNumber(post.engagement)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Audience Demographics</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Age Groups</h3>
              {Object.entries(analytics.audienceInsights.demographics.ageGroups).map(([age, percentage]) => (
                <div key={age} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{age}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Best Publishing Times</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Day of Week</h3>
              {Object.entries(analytics.audienceInsights.bestTimes).map(([day, engagement]) => (
                <div key={day} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{day}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(engagement / 25) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{engagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}