'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/utils/auth';

interface StreamPlatform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  streamKey?: string;
  rtmpUrl?: string;
  viewerCount?: number;
  status: 'offline' | 'live' | 'connecting' | 'error';
}

interface LiveStream {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: 'scheduled' | 'live' | 'ended';
  platforms: string[];
  startTime: string;
  endTime?: string;
  viewerCount: number;
  peakViewers: number;
  revenue: number;
  chatEnabled: boolean;
  recordingEnabled: boolean;
}

interface StreamSettings {
  bitrate: number;
  resolution: string;
  framerate: number;
  audioQuality: string;
  enableChat: boolean;
  enableDonations: boolean;
  enableMerch: boolean;
  moderationLevel: 'none' | 'basic' | 'strict';
}

export default function LiveStreamingMain() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'setup' | 'analytics' | 'settings'>('dashboard');
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [platforms, setPlatforms] = useState<StreamPlatform[]>([
    {
      id: 'youtube',
      name: 'YouTube Live',
      icon: '🔴',
      connected: false,
      status: 'offline'
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: '🟣',
      connected: false,
      status: 'offline'
    },
    {
      id: 'instagram',
      name: 'Instagram Live',
      icon: '📸',
      connected: false,
      status: 'offline'
    },
    {
      id: 'facebook',
      name: 'Facebook Live',
      icon: '🔵',
      connected: false,
      status: 'offline'
    },
    {
      id: 'tiktok',
      name: 'TikTok Live',
      icon: '⚫',
      connected: false,
      status: 'offline'
    }
  ]);
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    bitrate: 3000,
    resolution: '1920x1080',
    framerate: 30,
    audioQuality: 'high',
    enableChat: true,
    enableDonations: true,
    enableMerch: true,
    moderationLevel: 'basic'
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    fetchStreams();
    fetchPlatformStatus();
  }, []);

  const fetchStreams = async () => {
    try {
      const response = await fetch('/api/live/streams', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStreams(data.streams || []);
    } catch (error) {
      console.error('Error fetching streams:', error);
    }
  };

  const fetchPlatformStatus = async () => {
    try {
      const response = await fetch('/api/live/platforms', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPlatforms(data.platforms || platforms);
    } catch (error) {
      console.error('Error fetching platform status:', error);
    }
  };

  const connectPlatform = async (platformId: string) => {
    try {
      const response = await fetch(`/api/live/platforms/${platformId}/connect`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPlatforms(prev => prev.map(p => 
          p.id === platformId ? { ...p, connected: true, streamKey: data.streamKey, rtmpUrl: data.rtmpUrl } : p
        ));
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
    }
  };

  const startStream = async (streamData: Partial<LiveStream>) => {
    try {
      const response = await fetch('/api/live/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...streamData,
          settings: streamSettings
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCurrentStream(data.stream);
        setIsStreaming(true);
        
        // Start camera/microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1920, height: 1080 },
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Set up media recorder for local recording
        if (streamSettings.enableChat) {
          mediaRecorderRef.current = new MediaRecorder(stream);
        }
      }
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  };

  const endStream = async () => {
    try {
      if (currentStream) {
        await fetch(`/api/live/streams/${currentStream.id}/end`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }
      
      setIsStreaming(false);
      setCurrentStream(null);
      
      // Stop media streams
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    } catch (error) {
      console.error('Error ending stream:', error);
    }
  };

  const scheduleStream = async (streamData: any) => {
    try {
      const response = await fetch('/api/live/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(streamData)
      });
      
      if (response.ok) {
        setShowScheduleModal(false);
        fetchStreams();
      }
    } catch (error) {
      console.error('Error scheduling stream:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Live Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Live Status</h2>
          {isStreaming ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">LIVE</span>
            </div>
          ) : (
            <span className="text-gray-500">Offline</span>
          )}
        </div>

        {currentStream ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full aspect-video bg-black rounded-lg"
              />
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={endStream}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Stream
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Settings
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{currentStream.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{currentStream.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Viewers:</span>
                    <span className="ml-2 font-medium text-gray-900">{currentStream.viewerCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Peak:</span>
                    <span className="ml-2 font-medium text-gray-900">{currentStream.peakViewers}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {Math.floor((Date.now() - new Date(currentStream.startTime).getTime()) / 60000)}m
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue:</span>
                    <span className="ml-2 font-medium text-green-600">${currentStream.revenue}</span>
                  </div>
                </div>
              </div>
              
              {/* Active Platforms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Streaming To:</h4>
                <div className="space-y-2">
                  {platforms.filter(p => currentStream.platforms.includes(p.id)).map(platform => (
                    <div key={platform.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{platform.icon}</span>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">{platform.viewerCount || 0} viewers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to go live?</h3>
            <p className="text-gray-600 mb-6">Connect your platforms and start streaming to your audience</p>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Live Stream
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Streams */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Streams</h2>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Schedule Stream
          </button>
        </div>

        {streams.filter(s => s.status === 'scheduled').length > 0 ? (
          <div className="space-y-4">
            {streams.filter(s => s.status === 'scheduled').map(stream => (
              <div key={stream.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={stream.thumbnail || '/api/placeholder/60/60'}
                    alt={stream.title}
                    className="w-15 h-10 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{stream.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(stream.startTime).toLocaleDateString()} at{' '}
                      {new Date(stream.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {stream.platforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <span key={platformId} className="text-lg" title={platform.name}>
                        {platform.icon}
                      </span>
                    ) : null;
                  })}
                  <button
                    onClick={() => startStream(stream)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Go Live
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-600">No upcoming streams scheduled</p>
          </div>
        )}
      </div>

      {/* Recent Streams */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Streams</h2>
        
        {streams.filter(s => s.status === 'ended').length > 0 ? (
          <div className="space-y-4">
            {streams.filter(s => s.status === 'ended').slice(0, 5).map(stream => (
              <div key={stream.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={stream.thumbnail || '/api/placeholder/60/60'}
                    alt={stream.title}
                    className="w-15 h-10 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{stream.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(stream.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{stream.peakViewers} peak viewers</div>
                  <div className="text-sm text-green-600">${stream.revenue} earned</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎬</div>
            <p className="text-gray-600">No previous streams yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="space-y-8">
      {/* Platform Connections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Connections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map(platform => (
            <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <span className="font-medium text-gray-900">{platform.name}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  platform.connected ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
              
              {platform.connected ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">Status: Connected</div>
                  {platform.streamKey && (
                    <div className="text-xs text-gray-500">
                      Stream Key: {platform.streamKey.substring(0, 8)}...
                    </div>
                  )}
                  <button className="w-full px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => connectPlatform(platform.id)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stream Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Stream Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
              <select
                value={streamSettings.resolution}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, resolution: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1920x1080">1080p (1920x1080)</option>
                <option value="1280x720">720p (1280x720)</option>
                <option value="854x480">480p (854x480)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bitrate (kbps)</label>
              <input
                type="range"
                min="1000"
                max="8000"
                value={streamSettings.bitrate}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, bitrate: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{streamSettings.bitrate} kbps</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frame Rate</label>
              <select
                value={streamSettings.framerate}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, framerate: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={60}>60 FPS</option>
                <option value={30}>30 FPS</option>
                <option value={24}>24 FPS</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audio Quality</label>
              <select
                value={streamSettings.audioQuality}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, audioQuality: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="high">High Quality (320 kbps)</option>
                <option value="medium">Medium Quality (128 kbps)</option>
                <option value="low">Low Quality (64 kbps)</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Enable Chat</label>
                <input
                  type="checkbox"
                  checked={streamSettings.enableChat}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, enableChat: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Enable Donations</label>
                <input
                  type="checkbox"
                  checked={streamSettings.enableDonations}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, enableDonations: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Enable Merchandise</label>
                <input
                  type="checkbox"
                  checked={streamSettings.enableMerch}
                  onChange={(e) => setStreamSettings(prev => ({ ...prev, enableMerch: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moderation Level</label>
              <select
                value={streamSettings.moderationLevel}
                onChange={(e) => setStreamSettings(prev => ({ ...prev, moderationLevel: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="none">No Moderation</option>
                <option value="basic">Basic Filtering</option>
                <option value="strict">Strict Moderation</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Streaming</h1>
          <p className="text-gray-600">Broadcast your music and connect with fans in real-time</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'setup', label: 'Setup', icon: '⚙️' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '🔧' }
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
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'setup' && renderSetup()}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600">Detailed streaming analytics and insights</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Settings</h3>
            <p className="text-gray-600">Advanced streaming configuration options</p>
          </div>
        )}
      </div>

      {/* Schedule Stream Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Live Stream</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              scheduleStream({
                title: formData.get('title'),
                description: formData.get('description'),
                startTime: formData.get('startTime'),
                platforms: platforms.filter(p => p.connected).map(p => p.id)
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stream Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter stream title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your stream"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    name="startTime"
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}