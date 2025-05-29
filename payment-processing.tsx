'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet' | 'paypal';
  provider: 'stripe' | 'paypal' | 'crypto' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName: string;
  isDefault: boolean;
  isVerified: boolean;
  country: string;
  currency: string;
  createdAt: string;
  metadata?: any;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'refund' | 'royalty' | 'subscription' | 'withdrawal' | 'deposit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'disputed';
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  description: string;
  reference: string;
  paymentMethodId?: string;
  paymentMethod?: PaymentMethod;
  fromUserId?: string;
  fromUser?: string;
  toUserId?: string;
  toUser?: string;
  productId?: string;
  productType: 'beat' | 'sample' | 'nft' | 'subscription' | 'session' | 'concert' | 'merchandise';
  productTitle?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: TransactionMetadata;
}

interface TransactionMetadata {
  orderId?: string;
  invoiceId?: string;
  stripePaymentId?: string;
  royaltyPeriod?: string;
  licenseType?: string;
  downloadCount?: number;
  refundReason?: string;
  disputeReason?: string;
}

interface RoyaltyDistribution {
  id: string;
  transactionId: string;
  productId: string;
  productType: string;
  totalAmount: number;
  currency: string;
  period: string;
  splits: RoyaltySplit[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
}

interface RoyaltySplit {
  recipientId: string;
  recipientName: string;
  percentage: number;
  amount: number;
  role: string;
  paymentMethodId?: string;
  status: 'pending' | 'paid' | 'failed';
  paidAt?: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  processingFee: number;
  netAmount: number;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  estimatedArrival: string;
}

interface WalletBalance {
  currency: string;
  available: number;
  pending: number;
  reserved: number;
  total: number;
  lastUpdated: string;
}

interface PaymentSettings {
  defaultCurrency: string;
  autoWithdraw: boolean;
  autoWithdrawThreshold: number;
  autoWithdrawMethod?: string;
  royaltyFrequency: 'immediate' | 'weekly' | 'monthly';
  taxSettings: TaxSettings;
  notificationSettings: NotificationSettings;
}

interface TaxSettings {
  country: string;
  region?: string;
  taxNumber?: string;
  isVatRegistered: boolean;
  vatNumber?: string;
  includeVat: boolean;
  vatRate: number;
}

interface NotificationSettings {
  emailTransactions: boolean;
  emailRoyalties: boolean;
  emailWithdrawals: boolean;
  smsHighValue: boolean;
  pushNotifications: boolean;
}

export default function PaymentProcessing() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'royalties' | 'withdrawals' | 'methods' | 'settings'>('overview');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [royalties, setRoyalties] = useState<RoyaltyDistribution[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: '30d',
    minAmount: '',
    maxAmount: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const [methodsRes, transactionsRes, royaltiesRes, withdrawalsRes, balancesRes, settingsRes] = await Promise.all([
        fetch('/api/payments/methods', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/payments/transactions', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/payments/royalties', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/payments/withdrawals', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/payments/balances', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/payments/settings', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);

      const [methods, transactions, royalties, withdrawals, balances, settings] = await Promise.all([
        methodsRes.json(),
        transactionsRes.json(),
        royaltiesRes.json(),
        withdrawalsRes.json(),
        balancesRes.json(),
        settingsRes.json()
      ]);

      setPaymentMethods(methods.methods || []);
      setTransactions(transactions.transactions || []);
      setRoyalties(royalties.royalties || []);
      setWithdrawals(withdrawals.withdrawals || []);
      setWalletBalances(balances.balances || []);
      setPaymentSettings(settings.settings);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (methodData: any) => {
    try {
      const response = await fetch('/api/payments/methods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(methodData)
      });

      if (response.ok) {
        setShowAddMethodModal(false);
        fetchPaymentData();
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const requestWithdrawal = async (withdrawalData: any) => {
    try {
      const response = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(withdrawalData)
      });

      if (response.ok) {
        setShowWithdrawModal(false);
        fetchPaymentData();
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
    }
  };

  const updatePaymentSettings = async (settings: PaymentSettings) => {
    try {
      const response = await fetch('/api/payments/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setPaymentSettings(settings);
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = !filters.type || transaction.type === filters.type;
    const matchesStatus = !filters.status || transaction.status === filters.status;
    const matchesAmount = (!filters.minAmount || transaction.amount >= parseFloat(filters.minAmount)) &&
                         (!filters.maxAmount || transaction.amount <= parseFloat(filters.maxAmount));
    
    // Date filtering based on dateRange
    const now = new Date();
    const transactionDate = new Date(transaction.createdAt);
    let dateMatch = true;
    
    switch (filters.dateRange) {
      case '7d':
        dateMatch = transactionDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateMatch = transactionDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateMatch = transactionDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    return matchesType && matchesStatus && matchesAmount && dateMatch;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Wallet Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {walletBalances.map(balance => (
          <div key={balance.currency} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{balance.currency.toUpperCase()} Wallet</h3>
              <span className="text-2xl">💰</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Available:</span>
                <span className="text-lg font-bold text-green-600">${balance.available.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pending:</span>
                <span className="text-sm text-yellow-600">${balance.pending.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Reserved:</span>
                <span className="text-sm text-gray-600">${balance.reserved.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              disabled={balance.available === 0}
            >
              Withdraw
            </button>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${transactions.filter(t => t.type === 'sale' && t.status === 'completed').reduce((sum, t) => sum + t.netAmount, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Total Sales</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${transactions.filter(t => t.type === 'royalty' && t.status === 'completed').reduce((sum, t) => sum + t.netAmount, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Royalties Earned</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Total Withdrawn</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${transactions.reduce((sum, t) => sum + (t.fee || 0), 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">Platform Fees</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {transactions.slice(0, 5).map(transaction => (
            <div key={transaction.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'sale' ? 'bg-green-100 text-green-600' :
                    transaction.type === 'purchase' ? 'bg-blue-100 text-blue-600' :
                    transaction.type === 'royalty' ? 'bg-purple-100 text-purple-600' :
                    transaction.type === 'withdrawal' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {transaction.type === 'sale' ? '💰' :
                     transaction.type === 'purchase' ? '🛒' :
                     transaction.type === 'royalty' ? '👑' :
                     transaction.type === 'withdrawal' ? '📤' :
                     '💳'}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                    <p className="text-sm text-gray-600">{transaction.productTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    transaction.type === 'sale' || transaction.type === 'royalty' ? 'text-green-600' :
                    'text-gray-900'
                  }`}>
                    {transaction.type === 'sale' || transaction.type === 'royalty' ? '+' : '-'}
                    ${transaction.netAmount.toFixed(2)}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-600' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {transaction.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="sale">Sales</option>
            <option value="purchase">Purchases</option>
            <option value="royalty">Royalties</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="subscription">Subscriptions</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          <input
            type="number"
            placeholder="Min amount"
            value={filters.minAmount}
            onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="number"
            placeholder="Max amount"
            value={filters.maxAmount}
            onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      transaction.type === 'sale' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'purchase' ? 'bg-blue-100 text-blue-600' :
                      transaction.type === 'royalty' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{transaction.description}</div>
                    {transaction.productTitle && (
                      <div className="text-xs text-gray-500">{transaction.productTitle}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${transaction.fee.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={
                      transaction.type === 'sale' || transaction.type === 'royalty' ? 'text-green-600' : 'text-gray-900'
                    }>
                      ${transaction.netAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-600' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      transaction.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
        <button
          onClick={() => setShowAddMethodModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Method
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paymentMethods.map(method => (
          <div key={method.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-8 rounded flex items-center justify-center text-white text-xs font-bold ${
                  method.brand === 'visa' ? 'bg-blue-600' :
                  method.brand === 'mastercard' ? 'bg-red-600' :
                  method.brand === 'amex' ? 'bg-green-600' :
                  'bg-gray-600'
                }`}>
                  {method.brand?.toUpperCase() || method.type.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {method.type === 'card' ? `•••• ${method.last4}` : method.holderName}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">{method.type} • {method.provider}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {method.isDefault && (
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Default</span>
                )}
                {method.isVerified && (
                  <span className="text-green-600">✓</span>
                )}
              </div>
            </div>

            {method.type === 'card' && method.expiryMonth && method.expiryYear && (
              <div className="text-sm text-gray-600 mb-4">
                Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
              </div>
            )}

            <div className="flex space-x-2">
              {!method.isDefault && (
                <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Set Default
                </button>
              )}
              <button className="px-3 py-2 text-red-600 hover:text-red-800 text-sm">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
          <p className="text-gray-600 mb-6">Add a payment method to receive payments</p>
          <button
            onClick={() => setShowAddMethodModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Payment Method
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Processing</h1>
          <p className="text-gray-600">Manage your payments, earnings, and financial settings</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'transactions', label: 'Transactions', icon: '💳' },
              { id: 'royalties', label: 'Royalties', icon: '👑' },
              { id: 'withdrawals', label: 'Withdrawals', icon: '📤' },
              { id: 'methods', label: 'Payment Methods', icon: '💰' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'royalties' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👑</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Royalty Distributions</h3>
            <p className="text-gray-600">Track and manage your royalty payments</p>
          </div>
        )}
        {activeTab === 'withdrawals' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Withdrawal History</h3>
            <p className="text-gray-600">View and request fund withdrawals</p>
          </div>
        )}
        {activeTab === 'methods' && renderPaymentMethods()}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Settings</h3>
            <p className="text-gray-600">Configure payment preferences and tax settings</p>
          </div>
        )}
      </div>
    </div>
  );
}