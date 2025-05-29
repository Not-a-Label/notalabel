'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  currency: string;
  isPopular: boolean;
  features: Feature[];
  limits: Limits;
  benefits: Benefit[];
  addOns: AddOn[];
  trialDays: number;
  isActive: boolean;
  userCount: number;
  category: 'artist' | 'producer' | 'label' | 'fan';
}

interface Feature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: string;
  icon: string;
  category: 'music' | 'distribution' | 'analytics' | 'collaboration' | 'marketing' | 'support';
}

interface Limits {
  songsUpload: number; // -1 for unlimited
  storageGB: number;
  distributionPlatforms: number;
  collaborators: number;
  liveConcerts: number;
  fanEmails: number;
  analyticsRetention: number; // days
  apiCalls: number;
  customBranding: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  whiteLabel: boolean;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  value?: string;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  category: 'storage' | 'distribution' | 'marketing' | 'analytics' | 'support';
  isPopular: boolean;
}

interface UserSubscription {
  id: string;
  tierId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trialing' | 'past_due';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
  addOns: SubscribedAddOn[];
  usage: UsageStats;
  payments: PaymentHistory[];
}

interface SubscribedAddOn {
  addOnId: string;
  addOn: AddOn;
  quantity: number;
  startDate: string;
  endDate: string;
}

interface UsageStats {
  songsUploaded: number;
  storageUsedGB: number;
  distributionPlatformsUsed: number;
  collaboratorsActive: number;
  liveConcertsHosted: number;
  fanEmailsSent: number;
  apiCallsThisMonth: number;
  lastUpdated: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: 'paid' | 'failed' | 'pending' | 'refunded';
  invoiceUrl?: string;
}

interface PricingCalculator {
  selectedTier: string;
  billingCycle: 'monthly' | 'yearly';
  selectedAddOns: { [key: string]: number };
  discountCode?: string;
  totalMonthly: number;
  totalYearly: number;
  savings: number;
}

export default function SubscriptionTiers() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'plans' | 'addons' | 'calculator' | 'billing' | 'usage'>('plans');
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [calculator, setCalculator] = useState<PricingCalculator>({
    selectedTier: '',
    billingCycle: 'monthly',
    selectedAddOns: {},
    totalMonthly: 0,
    totalYearly: 0,
    savings: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<'artist' | 'producer' | 'label' | 'fan'>('artist');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionTiers();
    fetchUserSubscription();
    fetchAddOns();
  }, []);

  useEffect(() => {
    calculatePricing();
  }, [calculator.selectedTier, calculator.billingCycle, calculator.selectedAddOns]);

  const fetchSubscriptionTiers = async () => {
    try {
      const response = await fetch('/api/subscriptions/tiers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSubscriptionTiers(data.tiers || []);
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUserSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const fetchAddOns = async () => {
    try {
      const response = await fetch('/api/subscriptions/addons', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAddOns(data.addOns || []);
    } catch (error) {
      console.error('Error fetching add-ons:', error);
    }
  };

  const calculatePricing = () => {
    const selectedTier = subscriptionTiers.find(tier => tier.id === calculator.selectedTier);
    if (!selectedTier) return;

    const tierPrice = selectedTier.price;
    const addOnTotal = Object.entries(calculator.selectedAddOns).reduce((sum, [addOnId, quantity]) => {
      const addOn = addOns.find(a => a.id === addOnId);
      return sum + (addOn ? addOn.price * quantity : 0);
    }, 0);

    const monthlyTotal = tierPrice + addOnTotal;
    const yearlyTotal = calculator.billingCycle === 'yearly' ? monthlyTotal * 10 : monthlyTotal * 12; // 2 months free
    const savings = calculator.billingCycle === 'yearly' ? monthlyTotal * 2 : 0;

    setCalculator(prev => ({
      ...prev,
      totalMonthly: monthlyTotal,
      totalYearly: yearlyTotal,
      savings
    }));
  };

  const subscribeTo = async (tierId: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tierId,
          billingCycle,
          addOns: calculator.selectedAddOns
        })
      });

      if (response.ok) {
        fetchUserSubscription();
        setShowUpgradeModal(false);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        fetchUserSubscription();
        setShowCancelModal(false);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const addAddOn = async (addOnId: string, quantity: number = 1) => {
    try {
      const response = await fetch('/api/subscriptions/addons/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ addOnId, quantity })
      });

      if (response.ok) {
        fetchUserSubscription();
      }
    } catch (error) {
      console.error('Error adding add-on:', error);
    }
  };

  const filteredTiers = subscriptionTiers.filter(tier => tier.category === selectedCategory);

  const renderPlans = () => (
    <div className="space-y-8">
      {/* Category Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          {['artist', 'producer', 'label', 'fan'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-6 py-2 rounded-md transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setCalculator(prev => ({ ...prev, billingCycle: 'monthly' }))}
            className={`px-4 py-2 rounded-md transition-colors ${
              calculator.billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCalculator(prev => ({ ...prev, billingCycle: 'yearly' }))}
            className={`px-4 py-2 rounded-md transition-colors ${
              calculator.billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Yearly <span className="text-green-600 text-sm ml-1">(Save 17%)</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTiers.map(tier => {
          const isCurrentPlan = userSubscription?.tierId === tier.id;
          const displayPrice = calculator.billingCycle === 'yearly' ? tier.price * 10 : tier.price;
          const billingText = calculator.billingCycle === 'yearly' ? '/year' : '/month';

          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-xl border-2 p-6 ${
                tier.isPopular
                  ? 'border-blue-500 shadow-lg'
                  : isCurrentPlan
                  ? 'border-green-500'
                  : 'border-gray-200'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">${displayPrice}</span>
                  <span className="text-gray-600">{billingText}</span>
                </div>
                {calculator.billingCycle === 'yearly' && (
                  <div className="text-sm text-green-600">
                    Save ${tier.price * 2}/year
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {tier.features.slice(0, 8).map(feature => (
                  <div key={feature.id} className="flex items-center space-x-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {feature.included ? '✓' : '✗'}
                    </span>
                    <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                      {feature.name}
                      {feature.limit && <span className="text-gray-500 ml-1">({feature.limit})</span>}
                    </span>
                  </div>
                ))}
                {tier.features.length > 8 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{tier.features.length - 8} more features
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                {isCurrentPlan ? (
                  <div className="space-y-2">
                    <button className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed">
                      Current Plan
                    </button>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel Plan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCalculator(prev => ({ ...prev, selectedTier: tier.id }));
                      setShowUpgradeModal(true);
                    }}
                    className={`w-full px-4 py-3 rounded-lg transition-colors ${
                      tier.isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {tier.trialDays > 0 ? `Start ${tier.trialDays}-Day Trial` : 'Subscribe Now'}
                  </button>
                )}

                {tier.trialDays > 0 && !isCurrentPlan && (
                  <p className="text-xs text-gray-500 text-center">
                    No credit card required for trial
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Feature Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                {filteredTiers.map(tier => (
                  <th key={tier.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {['music', 'distribution', 'analytics', 'collaboration', 'marketing', 'support'].map(category => {
                const categoryFeatures = filteredTiers[0]?.features.filter(f => f.category === category) || [];
                return categoryFeatures.map(feature => (
                  <tr key={feature.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {feature.name}
                    </td>
                    {filteredTiers.map(tier => {
                      const tierFeature = tier.features.find(f => f.id === feature.id);
                      return (
                        <td key={tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                          {tierFeature?.included ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-gray-300">✗</span>
                          )}
                          {tierFeature?.limit && (
                            <div className="text-xs text-gray-500">{tierFeature.limit}</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAddOns = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add-Ons & Extras</h2>
        <p className="text-gray-600">Enhance your subscription with additional features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addOns.map(addOn => (
          <div key={addOn.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {addOn.isPopular && (
              <div className="inline-block bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium mb-3">
                Popular
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-2">{addOn.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{addOn.description}</p>

            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold text-gray-900">${addOn.price}</span>
              <span className="text-gray-600 ml-1">/{addOn.billingCycle}</span>
            </div>

            <button
              onClick={() => addAddOn(addOn.id)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!userSubscription}
            >
              {userSubscription ? 'Add to Plan' : 'Subscribe First'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsage = () => {
    if (!userSubscription) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600">Subscribe to a plan to see your usage statistics</p>
        </div>
      );
    }

    const usage = userSubscription.usage;
    const limits = userSubscription.tier.limits;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Usage Statistics</h2>
          <p className="text-gray-600">Monitor your current usage against plan limits</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: 'Songs Uploaded',
              used: usage.songsUploaded,
              limit: limits.songsUpload,
              icon: '🎵',
              color: 'blue'
            },
            {
              label: 'Storage Used',
              used: usage.storageUsedGB,
              limit: limits.storageGB,
              icon: '💾',
              color: 'green',
              unit: 'GB'
            },
            {
              label: 'Distribution Platforms',
              used: usage.distributionPlatformsUsed,
              limit: limits.distributionPlatforms,
              icon: '📡',
              color: 'purple'
            },
            {
              label: 'Active Collaborators',
              used: usage.collaboratorsActive,
              limit: limits.collaborators,
              icon: '👥',
              color: 'orange'
            },
            {
              label: 'Live Concerts',
              used: usage.liveConcertsHosted,
              limit: limits.liveConcerts,
              icon: '🎤',
              color: 'red'
            },
            {
              label: 'API Calls',
              used: usage.apiCallsThisMonth,
              limit: limits.apiCalls,
              icon: '🔌',
              color: 'indigo'
            }
          ].map(item => {
            const percentage = item.limit === -1 ? 0 : (item.used / item.limit) * 100;
            const isUnlimited = item.limit === -1;

            return (
              <div key={item.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <span className="text-2xl">{item.icon}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Used:</span>
                    <span className="font-medium">
                      {item.used} {item.unit || ''}
                      {!isUnlimited && ` / ${item.limit} ${item.unit || ''}`}
                    </span>
                  </div>

                  {!isUnlimited && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${item.color}-500 transition-all duration-300`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {isUnlimited ? 'Unlimited' : `${percentage.toFixed(1)}% used`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
          <p className="text-gray-600">Choose the perfect plan for your music career</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex justify-center space-x-8">
            {[
              { id: 'plans', label: 'Plans', icon: '💎' },
              { id: 'addons', label: 'Add-Ons', icon: '➕' },
              { id: 'calculator', label: 'Calculator', icon: '🧮' },
              { id: 'billing', label: 'Billing', icon: '💳' },
              { id: 'usage', label: 'Usage', icon: '📊' }
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
        {activeTab === 'plans' && renderPlans()}
        {activeTab === 'addons' && renderAddOns()}
        {activeTab === 'calculator' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧮</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pricing Calculator</h3>
            <p className="text-gray-600">Calculate your custom pricing with add-ons</p>
          </div>
        )}
        {activeTab === 'billing' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Billing History</h3>
            <p className="text-gray-600">View invoices and payment history</p>
          </div>
        )}
        {activeTab === 'usage' && renderUsage()}
      </div>
    </div>
  );
}