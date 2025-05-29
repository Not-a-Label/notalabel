'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PlatformConnection {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  username?: string;
  followers?: number;
  url?: string;
}

interface PlatformsData {
  connections: PlatformConnection[];
  otherPlatforms: string;
}

const PLATFORMS = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎵',
    description: 'Connect to import your streaming data and analytics',
    color: 'bg-green-500'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    description: 'Sync your video content and view analytics',
    color: 'bg-red-500'
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: '☁️',
    description: 'Import tracks and engagement metrics',
    color: 'bg-orange-500'
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp',
    icon: '🎪',
    description: 'Connect your store and sales data',
    color: 'bg-blue-500'
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    icon: '🍎',
    description: 'Track your Apple Music streams and analytics',
    color: 'bg-gray-800'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    description: 'Sync your posts and follower growth',
    color: 'bg-pink-500'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎭',
    description: 'Track viral content and engagement',
    color: 'bg-black'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🐦',
    description: 'Monitor mentions and engagement',
    color: 'bg-blue-400'
  }
];

export default function OnboardingPlatformsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [platformsData, setPlatformsData] = useState<PlatformsData>({
    connections: PLATFORMS.map(platform => ({ ...platform, connected: false })),
    otherPlatforms: ''
  });

  const handleConnect = async (platformId: string) => {
    setConnectingPlatform(platformId);
    
    try {
      // Simulate OAuth connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update connection status
      setPlatformsData(prev => ({
        ...prev,
        connections: prev.connections.map(conn =>
          conn.id === platformId
            ? { 
                ...conn, 
                connected: true, 
                username: `demo_user_${platformId}`,
                followers: Math.floor(Math.random() * 10000) + 100
              }
            : conn
        )
      }));
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = (platformId: string) => {
    setPlatformsData(prev => ({
      ...prev,
      connections: prev.connections.map(conn =>
        conn.id === platformId
          ? { ...conn, connected: false, username: undefined, followers: undefined }
          : conn
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save platforms data to localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.platforms = platformsData;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Move to next step
      router.push('/onboarding/upload');
    } catch (error) {
      console.error('Platforms save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectedCount = platformsData.connections.filter(conn => conn.connected).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Connect your platforms
        </h1>
        <p className="text-gray-600">
          Link your existing accounts to get personalized insights and track your growth
        </p>
        {connectedCount > 0 && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✅ {connectedCount} platform{connectedCount !== 1 ? 's' : ''} connected
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformsData.connections.map(platform => (
            <div key={platform.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {platform.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                    {platform.connected && platform.username && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600 font-medium">@{platform.username}</p>
                        {platform.followers && (
                          <p className="text-xs text-gray-500">{platform.followers.toLocaleString()} followers</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  {platform.connected ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Connected
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDisconnect(platform.id)}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(platform.id)}
                      disabled={connectingPlatform === platform.id}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {connectingPlatform === platform.id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connecting...
                        </span>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Other Platforms */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Other platforms or links</h3>
          <textarea
            value={platformsData.otherPlatforms}
            onChange={(e) => setPlatformsData(prev => ({ ...prev, otherPlatforms: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="List any other platforms where you share music (Twitch, Discord, personal website, etc.)"
          />
        </div>

        {/* Benefits Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Why connect your platforms?</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• <strong>Unified Analytics:</strong> See all your metrics in one dashboard</li>
            <li>• <strong>Growth Tracking:</strong> Monitor follower and engagement trends</li>
            <li>• <strong>Content Optimization:</strong> AI recommendations based on your best-performing content</li>
            <li>• <strong>Cross-Platform Promotion:</strong> Coordinate releases across all channels</li>
            <li>• <strong>Revenue Insights:</strong> Track earnings from streaming and sales</li>
          </ul>
        </div>

        {/* Skip Option */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            Don't worry, you can connect platforms later in your settings
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={() => router.push('/onboarding/goals')}
            className="text-gray-500 hover:text-gray-700"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}