'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Release {
  id: string;
  title: string;
  artist: string;
  type: 'single' | 'ep' | 'album';
  releaseDate: string;
  status: 'draft' | 'pending' | 'distributed' | 'live';
  platforms: string[];
  artwork: string;
  tracks: number;
}

interface DistributionPlatform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  earnings: number;
  releases: number;
}

export default function MusicDistribution() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'releases' | 'new' | 'platforms'>('releases');
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  // Mock data
  const releases: Release[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'Your Artist Name',
      type: 'single',
      releaseDate: '2024-02-15',
      status: 'live',
      platforms: ['spotify', 'apple', 'youtube', 'tidal'],
      artwork: '🎵',
      tracks: 1
    },
    {
      id: '2',
      title: 'City Lights EP',
      artist: 'Your Artist Name',
      type: 'ep',
      releaseDate: '2024-03-01',
      status: 'distributed',
      platforms: ['spotify', 'apple', 'amazon'],
      artwork: '🌃',
      tracks: 4
    },
    {
      id: '3',
      title: 'Summer Vibes',
      artist: 'Your Artist Name',
      type: 'single',
      releaseDate: '2024-03-15',
      status: 'pending',
      platforms: ['spotify', 'apple'],
      artwork: '☀️',
      tracks: 1
    },
    {
      id: '4',
      title: 'Untitled Album',
      artist: 'Your Artist Name',
      type: 'album',
      releaseDate: '2024-04-01',
      status: 'draft',
      platforms: [],
      artwork: '💿',
      tracks: 12
    }
  ];

  const platforms: DistributionPlatform[] = [
    { id: 'spotify', name: 'Spotify', icon: '🎵', connected: true, earnings: 3456.78, releases: 15 },
    { id: 'apple', name: 'Apple Music', icon: '🍎', connected: true, earnings: 2345.67, releases: 15 },
    { id: 'youtube', name: 'YouTube Music', icon: '📺', connected: true, earnings: 1234.56, releases: 12 },
    { id: 'amazon', name: 'Amazon Music', icon: '📦', connected: true, earnings: 567.89, releases: 10 },
    { id: 'tidal', name: 'Tidal', icon: '🌊', connected: false, earnings: 0, releases: 0 },
    { id: 'deezer', name: 'Deezer', icon: '🎧', connected: false, earnings: 0, releases: 0 }
  ];

  const getStatusColor = (status: Release['status']) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'distributed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Release['type']) => {
    switch (type) {
      case 'single':
        return 'Single';
      case 'ep':
        return 'EP';
      case 'album':
        return 'Album';
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Distribution</h1>
        <p className="text-gray-600">Distribute your music to all major streaming platforms</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Total Releases</p>
          <p className="text-2xl font-bold">18</p>
          <p className="text-sm text-green-600 mt-1">3 this month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Live on Platforms</p>
          <p className="text-2xl font-bold">42</p>
          <p className="text-sm text-gray-600 mt-1">Across 6 platforms</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Total Earnings</p>
          <p className="text-2xl font-bold">$7,604</p>
          <p className="text-sm text-green-600 mt-1">↑ 23.5%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Avg. Processing</p>
          <p className="text-2xl font-bold">2.5 days</p>
          <p className="text-sm text-gray-600 mt-1">To go live</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {(['releases', 'new', 'platforms'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'releases' ? 'My Releases' : tab === 'new' ? 'New Release' : 'Platforms'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'releases' && (
        <div className="space-y-4">
          {releases.map((release) => (
            <div key={release.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-4xl bg-gray-100 p-4 rounded-lg">{release.artwork}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{release.title}</h3>
                    <p className="text-gray-600 mb-2">{release.artist}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">{getTypeLabel(release.type)}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">{release.tracks} {release.tracks === 1 ? 'track' : 'tracks'}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">
                        {new Date(release.releaseDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    {release.platforms.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {release.platforms.map(platformId => {
                          const platform = platforms.find(p => p.id === platformId);
                          return platform ? (
                            <span key={platformId} className="text-lg" title={platform.name}>
                              {platform.icon}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                    {release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                  </span>
                  <button
                    onClick={() => setSelectedRelease(release)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'new' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold mb-6">Create New Release</h2>
            
            <div className="space-y-6">
              {/* Release Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['single', 'ep', 'album'] as const).map((type) => (
                    <button
                      key={type}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      <div className="text-2xl mb-1">
                        {type === 'single' ? '🎵' : type === 'ep' ? '💿' : '📀'}
                      </div>
                      <p className="font-medium capitalize">{type}</p>
                      <p className="text-xs text-gray-500">
                        {type === 'single' ? '1 track' : type === 'ep' ? '2-6 tracks' : '7+ tracks'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter release title"
                />
              </div>

              <div>
                <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Artist
                </label>
                <input
                  type="text"
                  id="artist"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Artist name"
                />
              </div>

              {/* Release Date */}
              <div>
                <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Releases typically go live at midnight in your timezone
                </p>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distribution Platforms
                </label>
                <div className="space-y-2">
                  {platforms.filter(p => p.connected).map((platform) => (
                    <label key={platform.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="rounded text-purple-600" defaultChecked />
                      <span className="text-xl">{platform.icon}</span>
                      <span className="font-medium">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Continue to Upload Tracks
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'platforms' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div key={platform.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{platform.icon}</span>
                  <h3 className="text-lg font-semibold">{platform.name}</h3>
                </div>
                {platform.connected ? (
                  <span className="text-green-600 text-sm">Connected</span>
                ) : (
                  <span className="text-gray-400 text-sm">Not connected</span>
                )}
              </div>

              {platform.connected ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm">Total Earnings</p>
                    <p className="text-xl font-bold">${platform.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <div>
                      <p className="text-gray-600 text-xs">Releases</p>
                      <p className="font-semibold">{platform.releases}</p>
                    </div>
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      Manage →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">
                    Connect to start distributing
                  </p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Connect Platform
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Release Details Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold">Release Details</h2>
                <button
                  onClick={() => setSelectedRelease(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="text-6xl bg-gray-100 p-6 rounded-lg">{selectedRelease.artwork}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedRelease.title}</h3>
                    <p className="text-gray-600">{selectedRelease.artist}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{getTypeLabel(selectedRelease.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Release Date:</span>
                        <span className="font-medium">
                          {new Date(selectedRelease.releaseDate).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRelease.status)}`}>
                          {selectedRelease.status.charAt(0).toUpperCase() + selectedRelease.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Status */}
                <div>
                  <h4 className="font-semibold mb-3">Platform Status</h4>
                  <div className="space-y-2">
                    {platforms.filter(p => p.connected).map((platform) => {
                      const isDistributed = selectedRelease.platforms.includes(platform.id);
                      return (
                        <div key={platform.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{platform.icon}</span>
                            <span className="font-medium">{platform.name}</span>
                          </div>
                          {isDistributed ? (
                            <span className="text-green-600 text-sm">✓ Distributed</span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not distributed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Edit Release
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    View Analytics
                  </button>
                  {selectedRelease.status === 'draft' && (
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}