'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userDisplayName') || 'Artist';
    setDisplayName(name);
  }, []);

  const features = [
    {
      icon: '🎵',
      title: 'Upload & Stream Music',
      description: 'Share your music directly with fans'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Track your growth and engagement'
    },
    {
      icon: '🤖',
      title: 'AI Career Assistant',
      description: 'Get personalized advice and strategies'
    },
    {
      icon: '🤝',
      title: 'Collaborate',
      description: 'Connect with other independent artists'
    },
    {
      icon: '💰',
      title: 'Revenue Tracking',
      description: 'Monitor earnings from all platforms'
    },
    {
      icon: '🎯',
      title: 'Marketing Tools',
      description: 'Promote your music effectively'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Not a Label, {displayName}! 🎉
        </h1>
        <p className="text-lg text-gray-600">
          You\'ve taken the first step towards true independence in your music career.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          What you can do with Not a Label:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🚀 Quick Start Guide
        </h3>
        <p className="text-gray-700 mb-4">
          This onboarding will take about 5 minutes and help you:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Complete your artist profile
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Set your career goals
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Connect your existing platforms
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Upload your first track
          </li>
        </ul>
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push('/onboarding/profile')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          Let\'s get started
          <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}