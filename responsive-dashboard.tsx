'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/utils/auth';
import { shouldShowOnboarding } from '@/utils/onboarding';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  SparklesIcon, 
  UsersIcon, 
  MicrophoneIcon, 
  ShoppingBagIcon,
  CalendarIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  PlayIcon,
  CloudArrowDownIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import OfflineMusicManager from '@/components/OfflineMusicManager';

interface DashboardStats {
  totalStreams: number;
  monthlyRevenue: number;
  totalFans: number;
  activeEvents: number;
  monthlyGrowth: number;
  aiInteractions: number;
  totalUsers?: number;
  systemHealth?: string;
  modActions?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStreams: 1234567,
    monthlyRevenue: 4523.45,
    totalFans: 12456,
    activeEvents: 3,
    monthlyGrowth: 23.5,
    aiInteractions: 156,
    totalUsers: 45670,
    systemHealth: 'Excellent',
    modActions: 12
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if user needs onboarding
    if (shouldShowOnboarding()) {
      router.push('/onboarding');
    }
  }, [router, user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const roleIcons = {
    artist: '🎵',
    fan: '🎧', 
    admin: '⚙️',
    founder: '👑'
  };

  // Role-specific quick actions
  const getQuickActions = () => {
    const baseActions = [
      { 
        title: 'Analytics', 
        description: 'View detailed insights', 
        icon: ChartBarIcon, 
        href: '/dashboard/analytics',
        color: 'bg-indigo-500',
        stats: `+${stats.monthlyGrowth}%`
      }
    ];

    switch (user.role) {
      case 'artist':
        return [
          { 
            title: 'Revenue & Royalties', 
            description: 'Track earnings and manage splits', 
            icon: CurrencyDollarIcon, 
            href: '/dashboard/revenue',
            color: 'bg-green-500',
            stats: `$${stats.monthlyRevenue.toLocaleString()}`
          },
          { 
            title: 'AI Tools', 
            description: 'Get personalized career advice', 
            icon: SparklesIcon, 
            href: '/dashboard/ai',
            color: 'bg-purple-500',
            stats: `${stats.aiInteractions} chats`
          },
          { 
            title: 'Upload Music', 
            description: 'Share your latest tracks', 
            icon: CloudArrowDownIcon, 
            href: '/dashboard/music',
            color: 'bg-pink-500',
            stats: 'New release'
          },
          ...baseActions
        ];
      case 'fan':
        return [
          { 
            title: 'Discover Music', 
            description: 'Find new artists and tracks', 
            icon: PlayIcon, 
            href: '/discover',
            color: 'bg-blue-500',
            stats: 'Explore'
          },
          { 
            title: 'My Collection', 
            description: 'Your saved music and playlists', 
            icon: ShoppingBagIcon, 
            href: '/dashboard/playlists',
            color: 'bg-purple-500',
            stats: '245 tracks'
          },
          ...baseActions
        ];
      case 'admin':
        return [
          { 
            title: 'Admin Panel', 
            description: 'Platform administration', 
            icon: Cog6ToothIcon, 
            href: '/admin',
            color: 'bg-yellow-500',
            stats: `${stats.totalUsers} users`
          },
          { 
            title: 'Moderation', 
            description: 'Review content and users', 
            icon: ShieldCheckIcon, 
            href: '/admin/moderation',
            color: 'bg-red-500',
            stats: `${stats.modActions} actions`
          },
          ...baseActions
        ];
      case 'founder':
        return [
          { 
            title: 'Platform Admin', 
            description: 'Full system control', 
            icon: Cog6ToothIcon, 
            href: '/admin',
            color: 'bg-gradient-to-r from-purple-500 to-pink-500',
            stats: 'God Mode'
          },
          { 
            title: 'Business Analytics', 
            description: 'Revenue and growth metrics', 
            icon: ChartBarIcon, 
            href: '/admin/analytics',
            color: 'bg-gradient-to-r from-green-500 to-blue-500',
            stats: '$125K MRR'
          },
          ...baseActions
        ];
      default:
        return baseActions;
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome back, {user.username}! {roleIcons[user.role as keyof typeof roleIcons]}
          </h1>
          <p className="text-gray-400 mt-2">
            {user.role === 'artist' && 'Track your music career progress'}
            {user.role === 'fan' && 'Discover and support independent artists'}
            {user.role === 'admin' && 'Platform administration dashboard'}
            {user.role === 'founder' && 'Complete platform overview and control'}
          </p>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Streams</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.totalStreams.toLocaleString()}</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Fans</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.totalFans.toLocaleString()}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Events</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.activeEvents}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions - Responsive */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group relative overflow-hidden bg-gray-800 rounded-lg p-4 sm:p-6 hover:bg-gray-700 transition-colors"
              >
                <div className={`absolute inset-0 ${action.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10">
                  <action.icon className="h-8 w-8 mb-3" />
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{action.description}</p>
                  {action.stats && (
                    <p className="text-xs mt-2 text-gray-500">{action.stats}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Performance - Responsive Stack on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BellIcon className="h-6 w-6 mr-2" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <div>
                  <p className="font-medium">New fan subscriber</p>
                  <p className="text-sm text-gray-400">Sarah M. started following you</p>
                </div>
                <span className="text-xs text-gray-500">5m ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <div>
                  <p className="font-medium">Track milestone</p>
                  <p className="text-sm text-gray-400">"Midnight Dreams" reached 10k streams</p>
                </div>
                <span className="text-xs text-gray-500">1h ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <div>
                  <p className="font-medium">Revenue update</p>
                  <p className="text-sm text-gray-400">$523.45 deposited to your account</p>
                </div>
                <span className="text-xs text-gray-500">3h ago</span>
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2" />
              Performance Overview
            </h2>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ChartBarIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p>Performance chart will load here</p>
              </div>
            </div>
          </div>
        </div>

        {/* PWA Feature - Offline Music */}
        {user.role === 'artist' && (
          <div className="mt-8">
            <OfflineMusicManager />
          </div>
        )}
      </div>
    </div>
  );
}