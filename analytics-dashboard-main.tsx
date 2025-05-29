'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';
import Link from 'next/link';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  unit?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

interface PlatformMetric {
  platform: string;
  icon: string;
  followers: number;
  growth: number;
  engagement: number;
  topContent: string;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetric[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock analytics based on user data
    const mockMetrics = generateMockMetrics();
    const mockChart = generateChartData(timeRange);
    const mockPlatforms = generatePlatformMetrics();
    const mockTracks = generateTopTracks();
    
    setMetrics(mockMetrics);
    setChartData(mockChart);
    setPlatformMetrics(mockPlatforms);
    setTopTracks(mockTracks);
    setLoading(false);
  };

  const generateMockMetrics = (): MetricCard[] => {
    return [
      {
        title: 'Total Streams',
        value: '45,231',
        change: 23.5,
        changeType: 'positive',
        icon: '🎵',
        unit: 'plays'
      },
      {
        title: 'Monthly Listeners',
        value: '2,847',
        change: 15.2,
        changeType: 'positive',
        icon: '👥',
        unit: 'listeners'
      },
      {
        title: 'Total Revenue',
        value: '$342.50',
        change: 8.7,
        changeType: 'positive',
        icon: '💰',
        unit: 'USD'
      },
      {
        title: 'Engagement Rate',
        value: '4.8%',
        change: -0.3,
        changeType: 'negative',
        icon: '📊',
        unit: 'rate'
      }
    ];
  };

  const generateChartData = (range: string): ChartData => {
    const labels = range === '7d' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : range === '30d'
      ? Array.from({length: 30}, (_, i) => `Day ${i + 1}`)
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    return {
      labels,
      datasets: [
        {
          label: 'Streams',
          data: labels.map(() => Math.floor(Math.random() * 500) + 200),
          color: 'rgb(147, 51, 234)'
        },
        {
          label: 'New Followers',
          data: labels.map(() => Math.floor(Math.random() * 50) + 10),
          color: 'rgb(59, 130, 246)'
        }
      ]
    };
  };

  const generatePlatformMetrics = (): PlatformMetric[] => {
    return [
      {
        platform: 'Spotify',
        icon: '🎵',
        followers: 1234,
        growth: 12.5,
        engagement: 3.2,
        topContent: 'Summer Vibes - 12K streams'
      },
      {
        platform: 'TikTok',
        icon: '🎭',
        followers: 856,
        growth: 45.2,
        engagement: 8.7,
        topContent: 'Studio Session - 45K views'
      },
      {
        platform: 'Instagram',
        icon: '📸',
        followers: 623,
        growth: 8.3,
        engagement: 5.4,
        topContent: 'Behind the Scenes - 2.3K likes'
      },
      {
        platform: 'YouTube',
        icon: '📺',
        followers: 412,
        growth: 6.1,
        engagement: 2.8,
        topContent: 'Official Video - 8K views'
      }
    ];
  };

  const generateTopTracks = () => {
    return [
      { 
        title: 'Summer Vibes', 
        streams: 12453, 
        change: 23.4, 
        revenue: '$45.23',
        platforms: ['spotify', 'apple', 'youtube']
      },
      { 
        title: 'Night Drive', 
        streams: 8932, 
        change: 15.2, 
        revenue: '$32.45',
        platforms: ['spotify', 'soundcloud']
      },
      { 
        title: 'City Lights', 
        streams: 6234, 
        change: -5.3, 
        revenue: '$23.12',
        platforms: ['spotify', 'apple']
      },
      { 
        title: 'Dreams', 
        streams: 4521, 
        change: 45.6, 
        revenue: '$18.34',
        platforms: ['spotify', 'youtube', 'tiktok']
      }
    ];
  };

  const SimpleLineChart = ({ data }: { data: ChartData }) => {
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    const chartHeight = 200;
    
    return (
      <div className="relative">
        <svg width="100%" height={chartHeight} className="overflow-visible">
          {data.datasets.map((dataset, datasetIndex) => {
            const points = dataset.data.map((value, index) => {
              const x = (index / (data.labels.length - 1)) * 100;
              const y = chartHeight - (value / maxValue) * chartHeight;
              return `${x}%,${y}`;
            }).join(' ');
            
            return (
              <g key={datasetIndex}>
                <polyline
                  fill="none"
                  stroke={dataset.color}
                  strokeWidth="2"
                  points={points}
                  style={{ strokeDasharray: datasetIndex === 1 ? '5,5' : 'none' }}
                />
                {dataset.data.map((value, index) => {
                  const x = (index / (data.labels.length - 1)) * 100;
                  const y = chartHeight - (value / maxValue) * chartHeight;
                  return (
                    <circle
                      key={index}
                      cx={`${x}%`}
                      cy={y}
                      r="4"
                      fill={dataset.color}
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data.labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          {data.datasets.map((dataset, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-sm text-gray-600">{dataset.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-gray-900">Loading Analytics...</h2>
            <p className="text-gray-600 mt-2">Crunching your numbers across all platforms</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Track your growth across all platforms</p>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Period:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{metric.icon}</span>
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-600' : 
                  metric.changeType === 'negative' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {metric.changeType === 'positive' ? '+' : ''}{metric.change}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1">vs previous period</p>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Growth Overview</h2>
            <div className="flex space-x-2">
              <Link
                href="/dashboard/analytics/advanced"
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                Advanced Analytics →
              </Link>
            </div>
          </div>
          
          {chartData && <SimpleLineChart data={chartData} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Performance</h2>
            <div className="space-y-4">
              {platformMetrics.map((platform, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{platform.platform}</h3>
                        <p className="text-sm text-gray-600">
                          {platform.followers.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        platform.growth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {platform.growth > 0 ? '+' : ''}{platform.growth}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {platform.engagement}% engagement
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Top: {platform.topContent}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/analytics/platform"
              className="block text-center text-sm text-purple-600 hover:text-purple-800 mt-4"
            >
              View All Platforms →
            </Link>
          </div>

          {/* Top Tracks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Tracks</h2>
            <div className="space-y-3">
              {topTracks.map((track, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center text-purple-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{track.title}</h3>
                      <p className="text-sm text-gray-600">
                        {track.streams.toLocaleString()} streams
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      track.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {track.change > 0 ? '+' : ''}{track.change}%
                    </p>
                    <p className="text-sm text-gray-600">{track.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/analytics/tracks"
              className="block text-center text-sm text-purple-600 hover:text-purple-800 mt-4"
            >
              View All Tracks →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/analytics/metrics"
              className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-2 block">📊</span>
              <span className="text-sm font-medium text-gray-900">Detailed Metrics</span>
            </Link>
            <Link
              href="/dashboard/analytics/revenue"
              className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-2 block">💰</span>
              <span className="text-sm font-medium text-gray-900">Revenue Report</span>
            </Link>
            <Link
              href="/dashboard/analytics/audience"
              className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-2 block">👥</span>
              <span className="text-sm font-medium text-gray-900">Fan Demographics</span>
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mb-2 block">📄</span>
              <span className="text-sm font-medium text-gray-900">Export Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}