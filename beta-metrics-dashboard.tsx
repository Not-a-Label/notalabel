'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaChartLine, FaBug, FaStar, FaCheckCircle,
  FaClock, FaMusic, FaDollarSign, FaThumbsUp, FaExclamationTriangle,
  FaArrowUp, FaArrowDown, FaFireAlt, FaHeartbeat,
  FaRocket, FaTrophy, FaCalendarAlt, FaComments
} from 'react-icons/fa';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface BetaMetrics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    retentionRate: number;
    npsScore: number;
  };
  engagement: {
    dailyActiveUsers: number[];
    featureAdoption: { [key: string]: number };
    avgSessionTime: number;
    totalSessions: number;
  };
  platform: {
    uptime: number;
    avgLoadTime: number;
    errorRate: number;
    aiProcessingTime: number;
  };
  feedback: {
    totalFeedback: number;
    bugReports: number;
    featureRequests: number;
    satisfaction: number;
  };
  business: {
    revenue: number;
    transactions: number;
    avgTransactionValue: number;
    topFeatures: string[];
  };
}

export default function BetaMetricsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data - replace with real API calls
  const [metrics, setMetrics] = useState<BetaMetrics>({
    overview: {
      totalUsers: 287,
      activeUsers: 243,
      retentionRate: 84.7,
      npsScore: 72
    },
    engagement: {
      dailyActiveUsers: [180, 195, 210, 225, 243, 238, 243],
      featureAdoption: {
        'AI Production': 92,
        'Analytics': 78,
        'Collaboration': 65,
        'Marketplace': 43,
        'Education': 71
      },
      avgSessionTime: 23.5,
      totalSessions: 12847
    },
    platform: {
      uptime: 99.92,
      avgLoadTime: 1.8,
      errorRate: 0.08,
      aiProcessingTime: 2.3
    },
    feedback: {
      totalFeedback: 847,
      bugReports: 42,
      featureRequests: 213,
      satisfaction: 4.6
    },
    business: {
      revenue: 8743,
      transactions: 423,
      avgTransactionValue: 20.67,
      topFeatures: ['AI Mixing', 'Beat Marketplace', 'Analytics Pro']
    }
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const overviewCards: MetricCard[] = [
    {
      title: 'Active Beta Users',
      value: `${metrics.overview.activeUsers}/${metrics.overview.totalUsers}`,
      change: 12.5,
      icon: FaUsers,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Retention Rate',
      value: `${metrics.overview.retentionRate}%`,
      change: 3.2,
      icon: FaHeartbeat,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'NPS Score',
      value: metrics.overview.npsScore,
      change: 8,
      icon: FaStar,
      color: 'yellow',
      trend: 'up'
    },
    {
      title: 'Platform Health',
      value: `${metrics.platform.uptime}%`,
      change: 0,
      icon: FaCheckCircle,
      color: 'blue',
      trend: 'neutral'
    }
  ];

  // Chart configurations
  const dailyActiveUsersChart = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Active Users',
        data: metrics.engagement.dailyActiveUsers,
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const featureAdoptionChart = {
    labels: Object.keys(metrics.engagement.featureAdoption),
    datasets: [
      {
        label: 'Feature Adoption %',
        data: Object.values(metrics.engagement.featureAdoption),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ]
      }
    ]
  };

  const feedbackBreakdownChart = {
    labels: ['Praise', 'Bug Reports', 'Feature Requests', 'General'],
    datasets: [
      {
        data: [
          metrics.feedback.totalFeedback - metrics.feedback.bugReports - metrics.feedback.featureRequests - 200,
          metrics.feedback.bugReports,
          metrics.feedback.featureRequests,
          200
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ]
      }
    ]
  };

  const platformHealthRadar = {
    labels: ['Uptime', 'Speed', 'Reliability', 'AI Performance', 'User Satisfaction'],
    datasets: [
      {
        label: 'Current',
        data: [
          metrics.platform.uptime,
          100 - (metrics.platform.avgLoadTime * 20),
          100 - (metrics.platform.errorRate * 100),
          100 - (metrics.platform.aiProcessingTime * 20),
          metrics.feedback.satisfaction * 20
        ],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.2)'
      },
      {
        label: 'Target',
        data: [99.9, 90, 99, 85, 90],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Beta Program Metrics</h1>
              <p className="text-gray-600">Real-time insights from your beta testing program</p>
            </div>
            <div className="flex gap-2">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-${card.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`text-xl text-${card.color}-600`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    card.trend === 'up' ? 'text-green-600' : 
                    card.trend === 'down' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {card.trend === 'up' && <FaArrowUp />}
                    {card.trend === 'down' && <FaArrowDown />}
                    {card.change > 0 && '+'}
                    {card.change}%
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{card.value}</h3>
                <p className="text-gray-600">{card.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Engagement */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">User Engagement Trends</h2>
            <Line 
              data={dailyActiveUsersChart} 
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.engagement.avgSessionTime} min
                </p>
                <p className="text-sm text-gray-600">Avg Session Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">
                  {(metrics.engagement.totalSessions / metrics.overview.activeUsers).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Sessions/User</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.overview.activeUsers}
                </p>
                <p className="text-sm text-gray-600">Active Today</p>
              </div>
            </div>
          </div>

          {/* Feature Adoption */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Feature Adoption</h2>
            <Bar 
              data={featureAdoptionChart}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { 
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>

          {/* Feedback Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Feedback Analysis</h2>
            <Doughnut 
              data={feedbackBreakdownChart}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Feedback</span>
                <span className="font-medium">{metrics.feedback.totalFeedback}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Satisfaction Score</span>
                <span className="font-medium">{metrics.feedback.satisfaction}/5.0</span>
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Platform Health</h2>
            <Radar 
              data={platformHealthRadar}
              options={{
                responsive: true,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>

          {/* Success Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Success Metrics</h2>
            <div className="space-y-4">
              {[
                {
                  label: 'Onboarding Completion',
                  value: 92,
                  icon: FaCheckCircle,
                  color: 'green'
                },
                {
                  label: 'Feature Discovery',
                  value: 78,
                  icon: FaRocket,
                  color: 'purple'
                },
                {
                  label: 'Revenue Generated',
                  value: `$${metrics.business.revenue}`,
                  icon: FaDollarSign,
                  color: 'green',
                  isValue: true
                },
                {
                  label: 'Active Collaborations',
                  value: 142,
                  icon: FaUsers,
                  color: 'blue',
                  isValue: true
                }
              ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <metric.icon className={`text-${metric.color}-600`} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  {metric.isValue ? (
                    <span className="font-bold">{metric.value}</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-${metric.color}-600 h-2 rounded-full`}
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{metric.value}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">Key Insights & Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaFireAlt className="text-yellow-300" />
                <h3 className="font-semibold">Hot Feature</h3>
              </div>
              <p className="text-sm opacity-90">
                AI Production has 92% adoption rate. Consider expanding AI capabilities.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-orange-300" />
                <h3 className="font-semibold">Needs Attention</h3>
              </div>
              <p className="text-sm opacity-90">
                Marketplace adoption at 43%. Schedule user interviews to understand barriers.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaTrophy className="text-yellow-300" />
                <h3 className="font-semibold">Success Story</h3>
              </div>
              <p className="text-sm opacity-90">
                84.7% retention rate exceeds target by 14.7%. Beta users are highly engaged!
              </p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 flex justify-end gap-4">
          <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            Schedule Report
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Export Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}