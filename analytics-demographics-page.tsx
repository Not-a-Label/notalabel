'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DemographicData {
  category: string;
  segments: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
}

interface GeographicData {
  country: string;
  code: string;
  listeners: number;
  percentage: number;
  topCities: string[];
}

interface ListenerProfile {
  trait: string;
  description: string;
  percentage: number;
  icon: string;
}

export default function DemographicsAnalytics() {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState<'age' | 'gender' | 'location' | 'interests'>('age');
  const [timeRange, setTimeRange] = useState<string>('30d');

  // Mock demographic data
  const demographicData: Record<string, DemographicData> = {
    age: {
      category: 'Age Groups',
      segments: [
        { name: '13-17', value: 2345, percentage: 12, color: '#FBBF24' },
        { name: '18-24', value: 6789, percentage: 35, color: '#F59E0B' },
        { name: '25-34', value: 5432, percentage: 28, color: '#EF4444' },
        { name: '35-44', value: 2890, percentage: 15, color: '#DC2626' },
        { name: '45-54', value: 1234, percentage: 6, color: '#B91C1C' },
        { name: '55+', value: 776, percentage: 4, color: '#991B1B' }
      ]
    },
    gender: {
      category: 'Gender Distribution',
      segments: [
        { name: 'Female', value: 11234, percentage: 58, color: '#EC4899' },
        { name: 'Male', value: 7734, percentage: 40, color: '#3B82F6' },
        { name: 'Non-binary', value: 387, percentage: 2, color: '#8B5CF6' }
      ]
    },
    interests: {
      category: 'Music Interests',
      segments: [
        { name: 'Indie/Alternative', value: 8765, percentage: 45, color: '#7C3AED' },
        { name: 'Pop', value: 5432, percentage: 28, color: '#A78BFA' },
        { name: 'Rock', value: 3210, percentage: 17, color: '#C4B5FD' },
        { name: 'Electronic', value: 1543, percentage: 8, color: '#DDD6FE' },
        { name: 'Other', value: 387, percentage: 2, color: '#EDE9FE' }
      ]
    }
  };

  const geographicData: GeographicData[] = [
    {
      country: 'United States',
      code: 'US',
      listeners: 8765,
      percentage: 45,
      topCities: ['Los Angeles', 'New York', 'Chicago']
    },
    {
      country: 'United Kingdom',
      code: 'GB',
      listeners: 2890,
      percentage: 15,
      topCities: ['London', 'Manchester', 'Birmingham']
    },
    {
      country: 'Canada',
      code: 'CA',
      listeners: 2345,
      percentage: 12,
      topCities: ['Toronto', 'Vancouver', 'Montreal']
    },
    {
      country: 'Australia',
      code: 'AU',
      listeners: 1543,
      percentage: 8,
      topCities: ['Sydney', 'Melbourne', 'Brisbane']
    },
    {
      country: 'Germany',
      code: 'DE',
      listeners: 1234,
      percentage: 6,
      topCities: ['Berlin', 'Hamburg', 'Munich']
    },
    {
      country: 'Other',
      code: 'OTHER',
      listeners: 2709,
      percentage: 14,
      topCities: ['Various']
    }
  ];

  const listenerProfiles: ListenerProfile[] = [
    {
      trait: 'Music Enthusiasts',
      description: 'Listen to 5+ hours of music daily',
      percentage: 68,
      icon: '🎧'
    },
    {
      trait: 'Playlist Curators',
      description: 'Create and share playlists regularly',
      percentage: 42,
      icon: '📝'
    },
    {
      trait: 'Concert Goers',
      description: 'Attend live shows monthly',
      percentage: 34,
      icon: '🎤'
    },
    {
      trait: 'Vinyl Collectors',
      description: 'Purchase physical music media',
      percentage: 23,
      icon: '💿'
    },
    {
      trait: 'Early Adopters',
      description: 'Discover new artists before trending',
      percentage: 56,
      icon: '🚀'
    },
    {
      trait: 'Social Sharers',
      description: 'Share music on social media weekly',
      percentage: 71,
      icon: '📱'
    }
  ];

  const generatePieChart = (data: DemographicData) => {
    let cumulativePercentage = 0;
    const radius = 100;
    const centerX = 150;
    const centerY = 150;

    return (
      <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
        {data.segments.map((segment, index) => {
          const startAngle = (cumulativePercentage * 360) / 100;
          const endAngle = ((cumulativePercentage + segment.percentage) * 360) / 100;
          cumulativePercentage += segment.percentage;

          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

          const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
          const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
          const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
          const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            'Z'
          ].join(' ');

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              {segment.percentage > 5 && (
                <>
                  {/* Label positioning */}
                  {(() => {
                    const midAngle = (startAngle + endAngle) / 2;
                    const labelX = centerX + (radius * 0.7) * Math.cos((midAngle * Math.PI) / 180);
                    const labelY = centerY + (radius * 0.7) * Math.sin((midAngle * Math.PI) / 180);
                    return (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-white text-sm font-medium pointer-events-none"
                      >
                        {segment.percentage}%
                      </text>
                    );
                  })()}
                </>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const currentData = demographicData[selectedMetric] || demographicData.age;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Demographics Analytics</h1>
        <p className="text-gray-600">Understand your audience and their characteristics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Total Listeners</p>
          <p className="text-2xl font-bold">19,466</p>
          <p className="text-sm text-green-600 mt-1">↑ 12.5% growth</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Countries Reached</p>
          <p className="text-2xl font-bold">42</p>
          <p className="text-sm text-green-600 mt-1">+5 new this month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Avg. Listener Age</p>
          <p className="text-2xl font-bold">26.3</p>
          <p className="text-sm text-gray-600 mt-1">Years old</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm mb-1">Engagement Rate</p>
          <p className="text-2xl font-bold">68.4%</p>
          <p className="text-sm text-green-600 mt-1">↑ 3.2% increase</p>
        </div>
      </div>

      {/* Demographic Breakdown */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Audience Breakdown</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="age">Age Groups</option>
              <option value="gender">Gender</option>
              <option value="interests">Music Interests</option>
            </select>
          </div>
          
          <div className="mb-6">
            {generatePieChart(currentData)}
          </div>

          <div className="space-y-2">
            {currentData.segments.map((segment) => (
              <div key={segment.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm">{segment.name}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{segment.value.toLocaleString()}</span>
                  <span className="text-gray-500 ml-1">({segment.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-6">Geographic Distribution</h3>
          <div className="space-y-4">
            {geographicData.map((country) => (
              <div key={country.code}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{country.country}</p>
                    <p className="text-xs text-gray-600">
                      Top cities: {country.topCities.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{country.listeners.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{country.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listener Profiles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-6">Listener Profiles & Behaviors</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listenerProfiles.map((profile) => (
            <div key={profile.trait} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{profile.icon}</span>
                <div className="flex-1">
                  <p className="font-medium mb-1">{profile.trait}</p>
                  <p className="text-sm text-gray-600 mb-2">{profile.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${profile.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{profile.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mt-8">
        <h3 className="text-xl font-semibold mb-4">Key Demographic Insights</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-medium">Core audience identified</p>
              <p className="text-sm text-gray-600">18-34 year olds make up 63% of your listeners</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <p className="font-medium">Growing international reach</p>
              <p className="text-sm text-gray-600">20% growth in European listeners this quarter</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium">Highly engaged community</p>
              <p className="text-sm text-gray-600">Your listeners are 2x more likely to share music</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-medium">Untapped potential</p>
              <p className="text-sm text-gray-600">Consider targeting 25-34 demographic for growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}