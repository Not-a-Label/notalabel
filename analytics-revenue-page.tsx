'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RevenueStream {
  id: string;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
  change: number;
  transactions: number;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  platform?: string;
}

interface PayoutSchedule {
  platform: string;
  nextPayout: string;
  estimatedAmount: number;
  frequency: string;
  minimumThreshold: number;
}

export default function RevenueAnalytics() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview');

  // Mock data
  const revenueStreams: RevenueStream[] = [
    {
      id: 'streaming',
      name: 'Streaming',
      icon: '🎵',
      amount: 3456.78,
      percentage: 45,
      change: 12.3,
      transactions: 156
    },
    {
      id: 'downloads',
      name: 'Downloads',
      icon: '⬇️',
      amount: 1234.56,
      percentage: 16,
      change: -5.2,
      transactions: 89
    },
    {
      id: 'merchandise',
      name: 'Merchandise',
      icon: '👕',
      amount: 2345.67,
      percentage: 30,
      change: 23.4,
      transactions: 234
    },
    {
      id: 'live',
      name: 'Live Shows',
      icon: '🎤',
      amount: 678.90,
      percentage: 9,
      change: 45.6,
      transactions: 12
    }
  ];

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-25',
      type: 'streaming',
      description: 'Spotify - Monthly royalties',
      amount: 1234.56,
      status: 'completed',
      platform: 'Spotify'
    },
    {
      id: '2',
      date: '2024-01-24',
      type: 'merchandise',
      description: 'T-shirt sales (15 units)',
      amount: 345.00,
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-01-23',
      type: 'streaming',
      description: 'Apple Music - Q4 2023',
      amount: 567.89,
      status: 'processing',
      platform: 'Apple Music'
    },
    {
      id: '4',
      date: '2024-01-22',
      type: 'download',
      description: 'Bandcamp - Album sales',
      amount: 123.45,
      status: 'completed',
      platform: 'Bandcamp'
    },
    {
      id: '5',
      date: '2024-01-20',
      type: 'live',
      description: 'The Blue Note - Door split',
      amount: 456.78,
      status: 'pending'
    }
  ];

  const payoutSchedules: PayoutSchedule[] = [
    {
      platform: 'Spotify',
      nextPayout: '2024-02-15',
      estimatedAmount: 1456.78,
      frequency: 'Monthly',
      minimumThreshold: 10
    },
    {
      platform: 'Apple Music',
      nextPayout: '2024-03-01',
      estimatedAmount: 823.45,
      frequency: 'Quarterly',
      minimumThreshold: 50
    },
    {
      platform: 'YouTube',
      nextPayout: '2024-02-20',
      estimatedAmount: 234.56,
      frequency: 'Monthly',
      minimumThreshold: 100
    },
    {
      platform: 'Bandcamp',
      nextPayout: '2024-01-30',
      estimatedAmount: 567.89,
      frequency: 'Weekly',
      minimumThreshold: 0
    }
  ];

  const totalRevenue = revenueStreams.reduce((sum, stream) => sum + stream.amount, 0);

  const generateRevenueChart = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 500 + 100)
      };
    });

    const maxRevenue = Math.max(...data.map(d => d.revenue));
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
              ${Math.floor(maxRevenue * percent / 100)}
            </text>
          </g>
        ))}

        {/* Area chart */}
        <path
          d={`${data.map((d, i) => {
            const x = padding + (i * (chartWidth - padding * 2) / (data.length - 1));
            const y = padding + (chartHeight - (d.revenue / maxRevenue) * chartHeight);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')} L ${chartWidth - padding} ${chartHeight + padding} L ${padding} ${chartHeight + padding} Z`}
          fill="url(#revenueGradient)"
          opacity="0.3"
        />

        {/* Line chart */}
        <path
          d={data.map((d, i) => {
            const x = padding + (i * (chartWidth - padding * 2) / (data.length - 1));
            const y = padding + (chartHeight - (d.revenue / maxRevenue) * chartHeight);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + (i * (chartWidth - padding * 2) / (data.length - 1));
          const y = padding + (chartHeight - (d.revenue / maxRevenue) * chartHeight);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#10B981"
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

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue Analytics</h1>
        <p className="text-gray-600">Track your earnings and financial performance</p>
      </div>

      {/* Total Revenue Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mb-1">Total Revenue ({timeRange})</p>
            <p className="text-4xl font-bold text-gray-900">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-green-600 mt-2">↑ 15.3% from previous period</p>
          </div>
          <div className="text-6xl opacity-20">💰</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>

        <button className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Download Tax Report
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          {(['overview', 'transactions', 'payouts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-green-600 text-green-600'
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
          {/* Revenue Streams */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {revenueStreams.map((stream) => (
              <div key={stream.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stream.icon}</span>
                    <h3 className="font-semibold">{stream.name}</h3>
                  </div>
                  <span className={`text-sm ${stream.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stream.change > 0 ? '↑' : '↓'} {Math.abs(stream.change)}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold">${stream.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-gray-600">{stream.percentage}% of total</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">{stream.transactions} transactions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Revenue Trends</h3>
            {generateRevenueChart()}
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              {revenueStreams.map((stream) => (
                <div key={stream.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span>{stream.icon}</span>
                      {stream.name}
                    </span>
                    <span className="font-medium">{stream.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      style={{ width: `${stream.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.platform || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="grid md:grid-cols-2 gap-6">
          {payoutSchedules.map((payout) => (
            <div key={payout.platform} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{payout.platform}</h3>
                <span className="text-sm text-gray-600">{payout.frequency}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Next Payout</p>
                  <p className="font-medium">
                    {new Date(payout.nextPayout).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Estimated Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${payout.estimatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-600">
                    Minimum threshold: ${payout.minimumThreshold}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}