'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';

interface PerformanceMetrics {
  streamId: string;
  title: string;
  date: string;
  duration: number;
  peakViewers: number;
  averageViewers: number;
  totalViewers: number;
  engagement: {
    chatMessages: number;
    likes: number;
    shares: number;
    reactions: number;
  };
  revenue: {
    tickets: number;
    merchandise: number;
    donations: number;
    total: number;
  };
  audience: {
    newFollowers: number;
    returningViewers: number;
    averageViewTime: number;
    dropOffRate: number;
  };
  platforms: PlatformMetrics[];
}

interface PlatformMetrics {
  platform: string;
  viewers: number;
  peakViewers: number;
  engagement: number;
  revenue: number;
  chatActivity: number;
}

interface ViewerDemographics {
  ageGroups: { range: string; percentage: number }[];
  geography: { country: string; percentage: number }[];
  devices: { type: string; percentage: number }[];
  timeZones: { zone: string; percentage: number }[];
}

interface EngagementTimeline {
  timestamp: string;
  viewers: number;
  chatActivity: number;
  reactions: number;
  event?: string;
}

export default function LivePerformanceAnalytics() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'audience' | 'revenue'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [performances, setPerformances] = useState<PerformanceMetrics[]>([]);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceMetrics | null>(null);
  const [demographics, setDemographics] = useState<ViewerDemographics | null>(null);
  const [timeline, setTimeline] = useState<EngagementTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformances();
  }, [selectedPeriod]);

  useEffect(() => {
    if (selectedPerformance) {
      fetchDetailedAnalytics(selectedPerformance.streamId);
    }
  }, [selectedPerformance]);

  const fetchPerformances = async () => {
    try {
      const response = await fetch(`/api/analytics/performances?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPerformances(data.performances || []);
      if (data.performances?.length > 0) {
        setSelectedPerformance(data.performances[0]);
      }
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedAnalytics = async (streamId: string) => {
    try {
      const [demographicsRes, timelineRes] = await Promise.all([
        fetch(`/api/analytics/performances/${streamId}/demographics`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/analytics/performances/${streamId}/timeline`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const demographicsData = await demographicsRes.json();
      const timelineData = await timelineRes.json();

      setDemographics(demographicsData.demographics);
      setTimeline(timelineData.timeline || []);
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderOverview = () => {
    if (!selectedPerformance) return null;

    const totalRevenue = selectedPerformance.revenue.total;
    const engagementRate = selectedPerformance.averageViewers > 0 
      ? ((selectedPerformance.engagement.chatMessages + selectedPerformance.engagement.reactions) / selectedPerformance.averageViewers * 100)
      : 0;

    return (
      <div className="space-y-6">
        {/* Performance Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Select Performance</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {performances.map(performance => (
              <button
                key={performance.streamId}
                onClick={() => setSelectedPerformance(performance)}
                className={`text-left p-4 rounded-lg border transition-colors ${
                  selectedPerformance?.streamId === performance.streamId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <h3 className="font-medium text-gray-900 mb-1">{performance.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{new Date(performance.date).toLocaleDateString()}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{formatNumber(performance.peakViewers)} peak</span>
                  <span className="text-green-600 font-medium">${performance.revenue.total}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Peak Viewers</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedPerformance.peakViewers)}</div>
            <div className="text-sm text-gray-500">Avg: {formatNumber(selectedPerformance.averageViewers)}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-500">
              ${(totalRevenue / (selectedPerformance.duration / 60)).toFixed(2)}/hour
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{engagementRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">
              {formatNumber(selectedPerformance.engagement.chatMessages + selectedPerformance.engagement.reactions)} interactions
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatDuration(selectedPerformance.duration)}</div>
            <div className="text-sm text-gray-500">
              {formatDuration(selectedPerformance.audience.averageViewTime)} avg watch
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">${selectedPerformance.revenue.tickets}</div>
              <div className="text-sm text-gray-600">Tickets</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${selectedPerformance.revenue.merchandise}</div>
              <div className="text-sm text-gray-600">Merchandise</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">${selectedPerformance.revenue.donations}</div>
              <div className="text-sm text-gray-600">Donations</div>
            </div>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {selectedPerformance.platforms.map(platform => (
              <div key={platform.platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {platform.platform.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{platform.platform}</h4>
                    <p className="text-sm text-gray-600">{formatNumber(platform.viewers)} viewers</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">${platform.revenue}</div>
                  <div className="text-xs text-gray-500">{platform.engagement.toFixed(1)}% engagement</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Engagement Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedPerformance.engagement.chatMessages)}</div>
              <div className="text-sm text-gray-500">Chat Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedPerformance.engagement.likes)}</div>
              <div className="text-sm text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedPerformance.engagement.shares)}</div>
              <div className="text-sm text-gray-500">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedPerformance.engagement.reactions)}</div>
              <div className="text-sm text-gray-500">Reactions</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailed = () => {
    if (!selectedPerformance || !timeline.length) return null;

    return (
      <div className="space-y-6">
        {/* Engagement Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Engagement Timeline</h3>
          <div className="h-64 flex items-end space-x-1">
            {timeline.map((point, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{
                    height: `${(point.viewers / Math.max(...timeline.map(p => p.viewers))) * 100}%`,
                    minHeight: '2px'
                  }}
                  title={`${point.viewers} viewers at ${new Date(point.timestamp).toLocaleTimeString()}`}
                />
                {point.event && (
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1" title={point.event} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{new Date(timeline[0]?.timestamp).toLocaleTimeString()}</span>
            <span>{new Date(timeline[timeline.length - 1]?.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Performance Moments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Key Performance Moments</h3>
          <div className="space-y-3">
            {timeline.filter(point => point.event).map((point, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{point.event}</h4>
                  <p className="text-sm text-gray-600">{new Date(point.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{formatNumber(point.viewers)} viewers</div>
                  <div className="text-xs text-gray-500">{point.chatActivity} chat messages</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viewer Retention */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Viewer Retention</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{selectedPerformance.audience.returningViewers}%</div>
              <div className="text-sm text-gray-500">Returning Viewers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{formatDuration(selectedPerformance.audience.averageViewTime)}</div>
              <div className="text-sm text-gray-500">Average Watch Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{selectedPerformance.audience.dropOffRate}%</div>
              <div className="text-sm text-gray-500">Drop-off Rate</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAudience = () => {
    if (!demographics) return null;

    return (
      <div className="space-y-6">
        {/* Age Demographics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Age Demographics</h3>
          <div className="space-y-3">
            {demographics.ageGroups.map(group => (
              <div key={group.range} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{group.range}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">{group.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {demographics.geography.map(country => (
              <div key={country.country} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{country.country}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">{country.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Device Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demographics.devices.map(device => (
              <div key={device.type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{device.percentage}%</div>
                <div className="text-sm text-gray-600 capitalize">{device.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Zones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Time Zone Distribution</h3>
          <div className="space-y-3">
            {demographics.timeZones.map(tz => (
              <div key={tz.zone} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{tz.zone}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${tz.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">{tz.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRevenue = () => {
    if (!selectedPerformance) return null;

    const revenueData = selectedPerformance.revenue;
    const total = revenueData.total;

    return (
      <div className="space-y-6">
        {/* Revenue Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">${total.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">${revenueData.tickets}</div>
              <div className="text-sm text-gray-500">Tickets ({((revenueData.tickets / total) * 100).toFixed(1)}%)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">${revenueData.merchandise}</div>
              <div className="text-sm text-gray-500">Merchandise ({((revenueData.merchandise / total) * 100).toFixed(1)}%)</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">${revenueData.donations}</div>
              <div className="text-sm text-gray-500">Donations ({((revenueData.donations / total) * 100).toFixed(1)}%)</div>
            </div>
          </div>
        </div>

        {/* Revenue by Platform */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Platform</h3>
          <div className="space-y-4">
            {selectedPerformance.platforms.map(platform => (
              <div key={platform.platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">{platform.platform}</h4>
                  <p className="text-sm text-gray-600">{formatNumber(platform.viewers)} viewers</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">${platform.revenue}</div>
                  <div className="text-sm text-gray-500">${(platform.revenue / platform.viewers).toFixed(2)} per viewer</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">${(total / selectedPerformance.peakViewers).toFixed(2)}</div>
              <div className="text-sm text-gray-600">Revenue per Peak Viewer</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${(total / (selectedPerformance.duration / 60)).toFixed(2)}</div>
              <div className="text-sm text-gray-600">Revenue per Hour</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">${(total / selectedPerformance.totalViewers).toFixed(2)}</div>
              <div className="text-sm text-gray-600">Revenue per Total Viewer</div>
            </div>
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends</h3>
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-600">Revenue trend analysis coming soon</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Performance Analytics</h1>
          <p className="text-gray-600">Detailed insights into your live streaming performance</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'detailed', label: 'Detailed', icon: '📈' },
              { id: 'audience', label: 'Audience', icon: '👥' },
              { id: 'revenue', label: 'Revenue', icon: '💰' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {performances.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No performance data yet</h3>
            <p className="text-gray-600">Start live streaming to see detailed analytics</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'detailed' && renderDetailed()}
            {activeTab === 'audience' && renderAudience()}
            {activeTab === 'revenue' && renderRevenue()}
          </>
        )}
      </div>
    </div>
  );
}