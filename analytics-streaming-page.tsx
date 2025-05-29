'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StreamingPlatform {
  id: string;
  name: string;
  logo: string;
  totalStreams: number;
  monthlyListeners: number;
  topCountries: string[];
  growth: number;
}

interface Track {
  id: string;
  title: string;
  streams: number;
  saves: number;
  skipRate: number;
  avgListenTime: string;
  playlists: number;
}

interface Playlist {
  id: string;
  name: string;
  curator: string;
  followers: number;
  position: number;
  streams: number;
  dateAdded: string;
}

export default function StreamingAnalytics() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'playlists'>('overview');

  // Mock data
  const platforms: StreamingPlatform[] = [
    {
      id: 'spotify',
      name: 'Spotify',
      logo: '🎵',
      totalStreams: 32456,
      monthlyListeners: 2134,
      topCountries: ['United States', 'United Kingdom', 'Canada'],
      growth: 15.2
    },
    {
      id: 'apple',
      name: 'Apple Music',
      logo: '🎵',
      totalStreams: 8234,
      monthlyListeners: 423,
      topCountries: ['United States', 'Japan', 'Germany'],
      growth: 8.7
    },
    {
      id: 'youtube',
      name: 'YouTube Music',
      logo: '📺',
      totalStreams: 4541,
      monthlyListeners: 290,
      topCountries: ['India', 'United States', 'Brazil'],
      growth: 23.5
    }
  ];

  const topTracks: Track[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      streams: 12453,
      saves: 1823,
      skipRate: 12.3,
      avgListenTime: '2:45',
      playlists: 23
    },
    {
      id: '2',
      title: 'City Lights',
      streams: 9832,
      saves: 1234,
      skipRate: 15.7,
      avgListenTime: '2:12',
      playlists: 18
    },
    {
      id: '3',
      title: 'Summer Vibes',
      streams: 7234,
      saves: 892,
      skipRate: 18.2,
      avgListenTime: '1:58',
      playlists: 12
    },
    {
      id: '4',
      title: 'Lost in Time',
      streams: 5621,
      saves: 723,
      skipRate: 14.5,
      avgListenTime: '2:34',
      playlists: 8
    }
  ];

  const playlists: Playlist[] = [
    {
      id: '1',
      name: 'Indie Chill',
      curator: 'Spotify Editorial',
      followers: 234567,
      position: 12,
      streams: 4532,
      dateAdded: '2024-01-15'
    },
    {
      id: '2',
      name: 'Fresh Finds',
      curator: 'Spotify Algorithmic',
      followers: 156789,
      position: 34,
      streams: 2341,
      dateAdded: '2024-01-22'
    },
    {
      id: '3',
      name: 'Alternative Nation',
      curator: 'User Playlist',
      followers: 45678,
      position: 8,
      streams: 1234,
      dateAdded: '2024-02-01'
    }
  ];

  const generateStreamingChart = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        streams: Math.floor(Math.random() * 2000 + 500)
      };
    });

    const maxStreams = Math.max(...data.map(d => d.streams));
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
              {Math.floor(maxStreams * percent / 100)}
            </text>
          </g>
        ))}

        {/* Line chart */}
        <path
          d={data.map((d, i) => {
            const x = padding + (i * (chartWidth - padding * 2) / (data.length - 1));
            const y = padding + (chartHeight - (d.streams / maxStreams) * chartHeight);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="#7C3AED"
          strokeWidth="2"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + (i * (chartWidth - padding * 2) / (data.length - 1));
          const y = padding + (chartHeight - (d.streams / maxStreams) * chartHeight);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#7C3AED"
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Streaming Analytics</h1>
        <p className="text-gray-600">Deep dive into your streaming performance across platforms</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Platforms</option>
          <option value="spotify">Spotify</option>
          <option value="apple">Apple Music</option>
          <option value="youtube">YouTube Music</option>
        </select>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>

        <button className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {(['overview', 'tracks', 'playlists'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
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
          {/* Platform Summary */}
          <div className="grid md:grid-cols-3 gap-6">
            {platforms
              .filter(p => selectedPlatform === 'all' || p.id === selectedPlatform)
              .map((platform) => (
                <div key={platform.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.logo}</span>
                      <h3 className="font-semibold">{platform.name}</h3>
                    </div>
                    <span className={`text-sm ${platform.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {platform.growth > 0 ? '↑' : '↓'} {Math.abs(platform.growth)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-600 text-sm">Total Streams</p>
                      <p className="text-2xl font-bold">{platform.totalStreams.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Listeners</p>
                      <p className="text-xl font-semibold">{platform.monthlyListeners.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Top Countries</p>
                      <div className="flex flex-wrap gap-1">
                        {platform.topCountries.map((country, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Streaming Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Streaming Trends</h3>
            {generateStreamingChart()}
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Key Insights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <p className="font-medium">Peak streaming day</p>
                  <p className="text-sm text-gray-600">Fridays see 23% more streams than average</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <p className="font-medium">Geographic expansion</p>
                  <p className="text-sm text-gray-600">Your music reached 5 new countries this month</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="font-medium">Listening duration</p>
                  <p className="text-sm text-gray-600">Average listen time increased by 12%</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="font-medium">Playlist performance</p>
                  <p className="text-sm text-gray-600">3 new editorial playlist placements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracks' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saves
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skip Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Listen Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Playlists
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topTracks.map((track) => (
                <tr key={track.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{track.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{track.streams.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{track.saves.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${track.skipRate < 15 ? 'text-green-600' : 'text-orange-600'}`}>
                      {track.skipRate}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{track.avgListenTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{track.playlists}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'playlists' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Playlist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Followers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Streams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playlists.map((playlist) => (
                <tr key={playlist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{playlist.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{playlist.curator}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{playlist.followers.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">#{playlist.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{playlist.streams.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(playlist.dateAdded).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}