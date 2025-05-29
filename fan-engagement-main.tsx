'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Fan {
  id: string;
  name: string;
  email: string;
  location: string;
  joinedDate: string;
  engagementScore: number;
  totalSpent: number;
  lastActive: string;
  tags: string[];
  avatar?: string;
}

interface Message {
  id: string;
  type: 'email' | 'sms' | 'push';
  subject: string;
  sentDate: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  status: 'sent' | 'scheduled' | 'draft';
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  claimedCount: number;
  availableCount: number;
  expiryDate?: string;
  type: 'merch' | 'music' | 'experience' | 'discount';
}

export default function FanEngagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'fans' | 'messages' | 'rewards'>('overview');
  const [selectedFan, setSelectedFan] = useState<Fan | null>(null);

  // Mock data
  const fanStats = {
    totalFans: 12453,
    activeFans: 8234,
    newThisMonth: 567,
    avgEngagement: 72.3,
    totalRevenue: 45678.90,
    topLocations: ['Los Angeles', 'New York', 'London', 'Toronto']
  };

  const topFans: Fan[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      location: 'Los Angeles, CA',
      joinedDate: '2023-05-15',
      engagementScore: 95,
      totalSpent: 234.56,
      lastActive: '2024-01-25',
      tags: ['VIP', 'Early Supporter', 'Influencer'],
      avatar: '👤'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      location: 'New York, NY',
      joinedDate: '2023-08-22',
      engagementScore: 88,
      totalSpent: 189.45,
      lastActive: '2024-01-24',
      tags: ['Super Fan', 'Playlist Curator'],
      avatar: '👤'
    },
    {
      id: '3',
      name: 'Emma Williams',
      email: 'emma.w@email.com',
      location: 'London, UK',
      joinedDate: '2023-06-10',
      engagementScore: 82,
      totalSpent: 156.78,
      lastActive: '2024-01-23',
      tags: ['International', 'Merch Collector'],
      avatar: '👤'
    }
  ];

  const recentMessages: Message[] = [
    {
      id: '1',
      type: 'email',
      subject: 'New Single "Midnight Dreams" Out Now! 🎵',
      sentDate: '2024-01-20',
      recipients: 8234,
      openRate: 45.2,
      clickRate: 12.8,
      status: 'sent'
    },
    {
      id: '2',
      type: 'email',
      subject: 'Spring Tour Dates Announced - Early Access',
      sentDate: '2024-01-18',
      recipients: 2345,
      openRate: 62.3,
      clickRate: 28.5,
      status: 'sent'
    },
    {
      id: '3',
      type: 'push',
      subject: 'Live Stream Starting in 30 Minutes!',
      sentDate: '2024-01-15',
      recipients: 5678,
      openRate: 73.4,
      clickRate: 45.2,
      status: 'sent'
    }
  ];

  const activeRewards: Reward[] = [
    {
      id: '1',
      name: 'Exclusive Acoustic EP',
      description: 'Get early access to our unplugged sessions',
      points: 500,
      claimedCount: 234,
      availableCount: 766,
      type: 'music'
    },
    {
      id: '2',
      name: '20% Merch Discount',
      description: 'Save on all merchandise for 30 days',
      points: 250,
      claimedCount: 456,
      availableCount: 544,
      expiryDate: '2024-02-28',
      type: 'discount'
    },
    {
      id: '3',
      name: 'Virtual Meet & Greet',
      description: 'Join an exclusive video call session',
      points: 1000,
      claimedCount: 45,
      availableCount: 5,
      expiryDate: '2024-02-15',
      type: 'experience'
    }
  ];

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'email': return '📧';
      case 'sms': return '💬';
      case 'push': return '🔔';
      default: return '📨';
    }
  };

  const getRewardIcon = (type: Reward['type']) => {
    switch (type) {
      case 'merch': return '👕';
      case 'music': return '🎵';
      case 'experience': return '✨';
      case 'discount': return '🏷️';
      default: return '🎁';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fan Engagement</h1>
        <p className="text-gray-600">Build deeper connections with your audience</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Total Fans</p>
          <p className="text-2xl font-bold">{fanStats.totalFans.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">+{fanStats.newThisMonth} this month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Active Fans</p>
          <p className="text-2xl font-bold">{fanStats.activeFans.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Avg Engagement</p>
          <p className="text-2xl font-bold">{fanStats.avgEngagement}%</p>
          <p className="text-sm text-green-600 mt-1">↑ 5.2%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Fan Revenue</p>
          <p className="text-2xl font-bold">${fanStats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">↑ 18.3%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {(['overview', 'fans', 'messages', 'rewards'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-pink-600 text-pink-600'
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
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('messages')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <span className="text-3xl mb-2 block">📨</span>
              <h3 className="font-semibold mb-1">Send Message</h3>
              <p className="text-sm opacity-90">Reach out to your fans</p>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <span className="text-3xl mb-2 block">🎁</span>
              <h3 className="font-semibold mb-1">Create Reward</h3>
              <p className="text-sm opacity-90">Incentivize engagement</p>
            </button>
            <button className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg p-6 hover:shadow-lg transition-shadow">
              <span className="text-3xl mb-2 block">📊</span>
              <h3 className="font-semibold mb-1">View Analytics</h3>
              <p className="text-sm opacity-90">Deep dive into data</p>
            </button>
          </div>

          {/* Top Fans */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Top Fans</h3>
              <button
                onClick={() => setActiveTab('fans')}
                className="text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {topFans.map((fan) => (
                <div key={fan.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl bg-gray-100 p-2 rounded-full">{fan.avatar}</div>
                    <div>
                      <p className="font-medium">{fan.name}</p>
                      <p className="text-sm text-gray-600">{fan.location}</p>
                      <div className="flex gap-2 mt-1">
                        {fan.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getEngagementColor(fan.engagementScore)}`}>
                      {fan.engagementScore}%
                    </p>
                    <p className="text-sm text-gray-600">Engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Messages */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Messages</h3>
              <div className="space-y-3">
                {recentMessages.slice(0, 3).map((message) => (
                  <div key={message.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getMessageIcon(message.type)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{message.subject}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Sent to {message.recipients.toLocaleString()} • {message.openRate}% opened
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Rewards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Popular Rewards</h3>
              <div className="space-y-3">
                {activeRewards.slice(0, 3).map((reward) => (
                  <div key={reward.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getRewardIcon(reward.type)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{reward.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {reward.claimedCount} claimed • {reward.points} points
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fans' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search fans..."
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>All Tags</option>
                <option>VIP</option>
                <option>Super Fan</option>
                <option>New Fan</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>All Locations</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
              </select>
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                Export List
              </button>
            </div>
          </div>

          {/* Fan List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lifetime Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topFans.map((fan) => (
                  <tr key={fan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl bg-gray-100 p-2 rounded-full mr-3">{fan.avatar}</div>
                        <div>
                          <p className="font-medium text-gray-900">{fan.name}</p>
                          <p className="text-sm text-gray-500">{fan.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fan.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(fan.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${getEngagementColor(fan.engagementScore)}`}>
                        {fan.engagementScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${fan.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedFan(fan)}
                        className="text-pink-600 hover:text-pink-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <button className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                + New Message
              </button>
            </div>
            
            {recentMessages.map((message) => (
              <div key={message.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getMessageIcon(message.type)}</span>
                    <div>
                      <h3 className="font-semibold">{message.subject}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(message.sentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    message.status === 'sent' ? 'bg-green-100 text-green-800' :
                    message.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {message.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{message.recipients.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Recipients</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{message.openRate}%</p>
                    <p className="text-sm text-gray-600">Open Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{message.clickRate}%</p>
                    <p className="text-sm text-gray-600">Click Rate</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Message Performance</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avg Open Rate</span>
                    <span className="font-medium">48.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-pink-600 h-2 rounded-full" style={{ width: '48.5%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avg Click Rate</span>
                    <span className="font-medium">22.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '22.3%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Best Practices</h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Send messages between 6-9 PM for best engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Personalized subjects get 26% more opens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600">•</span>
                  <span>Include exclusive content to boost clicks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Create New Reward */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Active Rewards</h3>
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                + Create Reward
              </button>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRewards.map((reward) => (
              <div key={reward.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{getRewardIcon(reward.type)}</span>
                  <span className="bg-purple-100 text-purple-700 text-sm px-2 py-1 rounded-full">
                    {reward.points} pts
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{reward.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Claimed</span>
                    <span className="font-medium">{reward.claimedCount}/{reward.claimedCount + reward.availableCount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(reward.claimedCount / (reward.claimedCount + reward.availableCount)) * 100}%` }}
                    />
                  </div>
                </div>

                {reward.expiryDate && (
                  <p className="text-xs text-gray-500 mb-4">
                    Expires: {new Date(reward.expiryDate).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Claims
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Reward Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Reward Program Stats</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">2,847</p>
                <p className="text-gray-600">Active Members</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">45.2%</p>
                <p className="text-gray-600">Redemption Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">125K</p>
                <p className="text-gray-600">Points Earned</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">$12.5K</p>
                <p className="text-gray-600">Additional Revenue</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fan Details Modal */}
      {selectedFan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold">Fan Details</h2>
                <button
                  onClick={() => setSelectedFan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Fan Info */}
                <div className="flex items-start gap-4">
                  <div className="text-5xl bg-gray-100 p-4 rounded-full">{selectedFan.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedFan.name}</h3>
                    <p className="text-gray-600">{selectedFan.email}</p>
                    <p className="text-gray-600">{selectedFan.location}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedFan.tags.map((tag, i) => (
                        <span key={i} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-pink-600">{selectedFan.engagementScore}%</p>
                    <p className="text-sm text-gray-600">Engagement</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">${selectedFan.totalSpent.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">
                      {Math.floor((new Date().getTime() - new Date(selectedFan.joinedDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-gray-600">Days as Fan</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">
                      {Math.floor((new Date().getTime() - new Date(selectedFan.lastActive).getTime()) / (1000 * 60 * 60 * 24))}d
                    </p>
                    <p className="text-sm text-gray-600">Last Active</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                    Send Message
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Add Note
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}