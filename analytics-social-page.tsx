'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  followers: number;
  engagement: number;
  posts: number;
  reach: number;
  growth: number;
}

interface Post {
  id: string;
  platform: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement: number;
}

interface Audience {
  platform: string;
  demographics: {
    age: { range: string; percentage: number }[];
    gender: { type: string; percentage: number }[];
    location: { country: string; percentage: number }[];
  };
}

export default function SocialMediaAnalytics() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'audience'>('overview');

  // Mock data
  const platforms: SocialPlatform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      followers: 12453,
      engagement: 5.8,
      posts: 156,
      reach: 234567,
      growth: 12.3
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      followers: 8234,
      engagement: 8.2,
      posts: 89,
      reach: 456789,
      growth: 28.5
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      followers: 3456,
      engagement: 3.2,
      posts: 234,
      reach: 123456,
      growth: 5.7
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      followers: 5678,
      engagement: 4.5,
      posts: 45,
      reach: 345678,
      growth: 15.2
    }
  ];

  const topPosts: Post[] = [
    {
      id: '1',
      platform: 'instagram',
      content: 'Behind the scenes from our latest music video shoot! 🎬✨',
      date: '2024-01-20',
      likes: 3456,
      comments: 234,
      shares: 123,
      reach: 45678,
      engagement: 8.2
    },
    {
      id: '2',
      platform: 'tiktok',
      content: 'New dance challenge for #MidnightDreams 💃🎵',
      date: '2024-01-18',
      likes: 12345,
      comments: 567,
      shares: 890,
      reach: 123456,
      engagement: 11.3
    },
    {
      id: '3',
      platform: 'twitter',
      content: 'Announcing our spring tour dates! Get your tickets now 🎤',
      date: '2024-01-15',
      likes: 789,
      comments: 123,
      shares: 234,
      reach: 23456,
      engagement: 4.9
    },
    {
      id: '4',
      platform: 'youtube',
      content: 'Acoustic version of "City Lights" - Live Session',
      date: '2024-01-12',
      likes: 2345,
      comments: 345,
      shares: 123,
      reach: 34567,
      engagement: 8.1
    }
  ];

  const audienceData: Audience = {
    platform: selectedPlatform === 'all' ? 'Overall' : selectedPlatform,
    demographics: {
      age: [
        { range: '13-17', percentage: 15 },
        { range: '18-24', percentage: 35 },
        { range: '25-34', percentage: 28 },
        { range: '35-44', percentage: 15 },
        { range: '45+', percentage: 7 }
      ],
      gender: [
        { type: 'Female', percentage: 58 },
        { type: 'Male', percentage: 40 },
        { type: 'Other', percentage: 2 }
      ],
      location: [
        { country: 'United States', percentage: 45 },
        { country: 'United Kingdom', percentage: 15 },
        { country: 'Canada', percentage: 12 },
        { country: 'Australia', percentage: 8 },
        { country: 'Other', percentage: 20 }
      ]
    }
  };

  const generateEngagementChart = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagement: Math.floor(Math.random() * 500 + 100),
        reach: Math.floor(Math.random() * 10000 + 5000)
      };
    });

    const maxEngagement = Math.max(...data.map(d => d.engagement));
    const chartHeight = 200;
    const chartWidth = 800;
    const padding = 40;

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + padding * 2}`} className="w-full h-64">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(percent => (
          <g key={percent}>
            <line
              x1={padding}
              y1={padding + (chartHeight * (100 - percent) / 100)}
              x2={chartWidth - padding}
              y2={padding + (chartHeight * (100 - percent) / 100)}
              stroke="#E5E7EB"
              strokeDasharray="2,2"
            />
            <text
              x={padding - 10}
              y={padding + (chartHeight * (100 - percent) / 100) + 5}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {Math.floor(maxEngagement * percent / 100)}
            </text>
          </g>
        ))}

        {/* Engagement line */}
        <path
          d={data.map((d, i) => {
            const x = padding + (i * (chartWidth - padding * 2) / (data.length - 1));
            const y = padding + (chartHeight - (d.engagement / maxEngagement) * chartHeight);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + (i * (chartWidth - padding * 2) / (data.length - 1));
          const y = padding + (chartHeight - (d.engagement / maxEngagement) * chartHeight);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#F59E0B"
              className="hover:r-4 transition-all cursor-pointer"
            />
          );
        })}

        {/* X-axis labels */}
        {data.filter((_, i) => i % Math.ceil(data.length / 10) === 0).map((d, i, arr) => {
          const dataIndex = data.indexOf(d);
          const x = padding + (dataIndex * (chartWidth - padding * 2) / (data.length - 1));
          return (
            <text
              key={i}
              x={x}
              y={chartHeight + padding + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {d.date}
            </text>
          );
        })}
      </svg>
    );
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.icon : '📱';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Analytics</h1>
        <p className="text-gray-600">Track your social media performance and audience engagement</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Platforms</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="twitter">Twitter/X</option>
          <option value="youtube">YouTube</option>
        </select>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>

        <button className="ml-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {(['overview', 'posts', 'audience'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Platform Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms
              .filter(p => selectedPlatform === 'all' || p.id === selectedPlatform)
              .map((platform) => (
                <div key={platform.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <h3 className="font-semibold">{platform.name}</h3>
                    </div>
                    <span className={`text-sm ${platform.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {platform.growth > 0 ? '↑' : '↓'} {Math.abs(platform.growth)}%
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-sm">Followers</p>
                      <p className="text-2xl font-bold">{platform.followers.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-600 text-xs">Engagement</p>
                        <p className="font-semibold">{platform.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Posts</p>
                        <p className="font-semibold">{platform.posts}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-gray-600 text-xs">Monthly Reach</p>
                      <p className="font-semibold">{(platform.reach / 1000).toFixed(1)}K</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Engagement Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Engagement Trends</h3>
            {generateEngagementChart()}
          </div>

          {/* Content Performance */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Content Performance Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎥</span>
                <div>
                  <p className="font-medium">Video content performs best</p>
                  <p className="text-sm text-gray-600">Videos get 3x more engagement than photos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-medium">Optimal posting time</p>
                  <p className="text-sm text-gray-600">7-9 PM generates highest engagement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">#️⃣</span>
                <div>
                  <p className="font-medium">Hashtag performance</p>
                  <p className="text-sm text-gray-600">#indie and #newmusic drive most discovery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="font-medium">Consistent posting pays off</p>
                  <p className="text-sm text-gray-600">3-4 posts/week optimal for growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-4">
          {topPosts
            .filter(post => selectedPlatform === 'all' || post.platform === selectedPlatform)
            .map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{post.content}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {post.engagement}% engagement
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-gray-600 text-sm">Likes</p>
                    <p className="font-semibold">{post.likes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Comments</p>
                    <p className="font-semibold">{post.comments.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Shares</p>
                    <p className="font-semibold">{post.shares.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Reach</p>
                    <p className="font-semibold">{(post.reach / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'audience' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Age Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
            <div className="space-y-3">
              {audienceData.demographics.age.map((age) => (
                <div key={age.range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{age.range}</span>
                    <span className="font-medium">{age.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${age.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
            <div className="space-y-3">
              {audienceData.demographics.gender.map((gender) => (
                <div key={gender.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{gender.type}</span>
                    <span className="font-medium">{gender.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${gender.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
            <div className="space-y-3">
              {audienceData.demographics.location.map((location) => (
                <div key={location.country}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{location.country}</span>
                    <span className="font-medium">{location.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}