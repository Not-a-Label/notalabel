import React, { useState, useEffect } from 'react';
import './FounderAdminDashboard.css';

interface DashboardMetrics {
  revenue: {
    today: number;
    month: number;
    total: number;
    growth: number;
  };
  artists: {
    total: number;
    active: number;
    new_today: number;
    pending_invites: number;
  };
  platform: {
    health_score: number;
    uptime: string;
    active_users: number;
    viral_coefficient: number;
  };
  growth: {
    mrr: number;
    arr: number;
    runway_months: number;
    burn_rate: number;
  };
}

export const FounderAdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'revenue' | 'artists' | 'growth'>('overview');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Check if user is founder
  const isFounder = localStorage.getItem('userId') === process.env.REACT_APP_FOUNDER_USER_ID;

  useEffect(() => {
    if (!isFounder) {
      window.location.href = '/dashboard';
      return;
    }

    fetchFounderMetrics();
    const interval = setInterval(fetchFounderMetrics, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchFounderMetrics = async () => {
    try {
      const response = await fetch(`/api/founder/dashboard?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const data = await response.json();
      setMetrics(data.metrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch founder metrics:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatGrowth = (value: number) => {
    const formatted = value > 0 ? `+${value}%` : `${value}%`;
    return value > 0 ? (
      <span className="growth positive">{formatted}</span>
    ) : (
      <span className="growth negative">{formatted}</span>
    );
  };

  if (!isFounder) {
    return null;
  }

  if (loading) {
    return (
      <div className="founder-dashboard loading">
        <div className="loading-spinner">Loading founder dashboard...</div>
      </div>
    );
  }

  return (
    <div className="founder-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Founder Dashboard</h1>
          <p className="welcome">Welcome back, Jason</p>
        </div>
        
        <div className="header-controls">
          <div className="time-selector">
            <button 
              className={timeRange === 'today' ? 'active' : ''}
              onClick={() => setTimeRange('today')}
            >
              Today
            </button>
            <button 
              className={timeRange === 'week' ? 'active' : ''}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button 
              className={timeRange === 'month' ? 'active' : ''}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button 
              className={timeRange === 'year' ? 'active' : ''}
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </div>
          
          <button className="export-btn">Export Report</button>
        </div>
      </header>

      {metrics && (
        <>
          <div className="key-metrics">
            <div className="metric-card primary">
              <div className="metric-header">
                <span className="metric-label">Total Revenue</span>
                {formatGrowth(metrics.revenue.growth)}
              </div>
              <div className="metric-value">{formatCurrency(metrics.revenue.total)}</div>
              <div className="metric-subtext">
                {formatCurrency(metrics.revenue.month)} this month
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">MRR</span>
                <span className="metric-trend">📈</span>
              </div>
              <div className="metric-value">{formatCurrency(metrics.growth.mrr)}</div>
              <div className="metric-subtext">
                {formatCurrency(metrics.growth.arr)} ARR
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Active Artists</span>
                <span className="metric-badge">{metrics.artists.new_today} new</span>
              </div>
              <div className="metric-value">{metrics.artists.active}</div>
              <div className="metric-subtext">
                {metrics.artists.total} total registered
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Runway</span>
                <span className={`runway-status ${metrics.growth.runway_months > 12 ? 'healthy' : 'warning'}`}>
                  {metrics.growth.runway_months > 12 ? '✅' : '⚠️'}
                </span>
              </div>
              <div className="metric-value">{metrics.growth.runway_months} months</div>
              <div className="metric-subtext">
                Burn: {formatCurrency(metrics.growth.burn_rate)}/mo
              </div>
            </div>
          </div>

          <nav className="view-tabs">
            <button 
              className={activeView === 'overview' ? 'active' : ''}
              onClick={() => setActiveView('overview')}
            >
              Overview
            </button>
            <button 
              className={activeView === 'revenue' ? 'active' : ''}
              onClick={() => setActiveView('revenue')}
            >
              Revenue Details
            </button>
            <button 
              className={activeView === 'artists' ? 'active' : ''}
              onClick={() => setActiveView('artists')}
            >
              Artist Management
            </button>
            <button 
              className={activeView === 'growth' ? 'active' : ''}
              onClick={() => setActiveView('growth')}
            >
              Growth Strategy
            </button>
          </nav>

          {activeView === 'overview' && (
            <div className="overview-content">
              <div className="platform-health">
                <h3>Platform Health</h3>
                <div className="health-grid">
                  <div className="health-item">
                    <div className="health-score" style={{['--score' as any]: metrics.platform.health_score}}>
                      {metrics.platform.health_score}%
                    </div>
                    <span>Health Score</span>
                  </div>
                  <div className="health-item">
                    <div className="health-value">{metrics.platform.uptime}</div>
                    <span>Uptime</span>
                  </div>
                  <div className="health-item">
                    <div className="health-value">{metrics.platform.active_users}</div>
                    <span>Active Now</span>
                  </div>
                  <div className="health-item">
                    <div className="health-value viral">
                      {metrics.platform.viral_coefficient}
                    </div>
                    <span>Viral Coefficient</span>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button className="action-btn">
                    <span className="icon">📧</span>
                    Send Beta Invites
                  </button>
                  <button className="action-btn">
                    <span className="icon">💰</span>
                    Process Payouts
                  </button>
                  <button className="action-btn">
                    <span className="icon">📊</span>
                    View Analytics
                  </button>
                  <button className="action-btn">
                    <span className="icon">🚀</span>
                    Launch Campaign
                  </button>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">🎵</span>
                    <div>
                      <strong>Sarah Chen</strong> uploaded "Midnight Dreams"
                      <span className="activity-time">5 minutes ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">💳</span>
                    <div>
                      <strong>$47.00</strong> payment processed
                      <span className="activity-time">12 minutes ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">👥</span>
                    <div>
                      <strong>Marcus Johnson</strong> accepted beta invite
                      <span className="activity-time">28 minutes ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'revenue' && (
            <div className="revenue-content">
              <div className="revenue-breakdown">
                <h3>Revenue Breakdown</h3>
                <div className="breakdown-chart">
                  <div className="revenue-sources">
                    <div className="source-item">
                      <span className="source-label">Marketplace Sales</span>
                      <span className="source-value">{formatCurrency(metrics.revenue.month * 0.7)}</span>
                      <div className="source-bar" style={{ width: '70%' }}></div>
                    </div>
                    <div className="source-item">
                      <span className="source-label">Subscriptions</span>
                      <span className="source-value">{formatCurrency(metrics.revenue.month * 0.2)}</span>
                      <div className="source-bar" style={{ width: '20%' }}></div>
                    </div>
                    <div className="source-item">
                      <span className="source-label">AI Services</span>
                      <span className="source-value">{formatCurrency(metrics.revenue.month * 0.1)}</span>
                      <div className="source-bar" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="payout-controls">
                <h3>Founder Payouts</h3>
                <div className="payout-info">
                  <div className="available-balance">
                    <span>Available for Withdrawal</span>
                    <strong>{formatCurrency(metrics.revenue.total * 0.15)}</strong>
                  </div>
                  <button className="payout-btn">Process Payout</button>
                </div>
                <div className="budget-advisor">
                  <p>💡 Recommended withdrawal: {formatCurrency(metrics.revenue.total * 0.10)}</p>
                  <p className="advisor-note">Keep 5% buffer for growth initiatives</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'artists' && (
            <div className="artists-content">
              <div className="artist-stats">
                <h3>Artist Overview</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-number">{metrics.artists.total}</span>
                    <span className="stat-label">Total Artists</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{metrics.artists.pending_invites}</span>
                    <span className="stat-label">Pending Invites</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{100 - metrics.artists.total}</span>
                    <span className="stat-label">Slots Available</span>
                  </div>
                </div>
              </div>

              <div className="invite-management">
                <h3>Beta Program</h3>
                <div className="beta-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(metrics.artists.total / 100) * 100}%` }}
                    ></div>
                  </div>
                  <span>{metrics.artists.total}/100 Founding Artists</span>
                </div>
                <button className="invite-btn">Send Batch Invites</button>
              </div>
            </div>
          )}

          {activeView === 'growth' && (
            <div className="growth-content">
              <div className="growth-metrics">
                <h3>Growth Metrics</h3>
                <div className="metrics-display">
                  <div className="growth-metric">
                    <span className="metric-icon">🚀</span>
                    <div>
                      <strong>Viral Coefficient</strong>
                      <span className={metrics.platform.viral_coefficient > 1 ? 'viral' : 'subviral'}>
                        {metrics.platform.viral_coefficient}
                      </span>
                    </div>
                  </div>
                  <div className="growth-metric">
                    <span className="metric-icon">📈</span>
                    <div>
                      <strong>Monthly Growth</strong>
                      <span>{metrics.revenue.growth}%</span>
                    </div>
                  </div>
                  <div className="growth-metric">
                    <span className="metric-icon">💰</span>
                    <div>
                      <strong>CAC</strong>
                      <span>$6.15</span>
                    </div>
                  </div>
                  <div className="growth-metric">
                    <span className="metric-icon">🎯</span>
                    <div>
                      <strong>LTV</strong>
                      <span>$847</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="growth-actions">
                <h3>Growth Initiatives</h3>
                <div className="initiative-list">
                  <div className="initiative">
                    <input type="checkbox" checked readOnly />
                    <span>Launch referral program</span>
                  </div>
                  <div className="initiative">
                    <input type="checkbox" checked readOnly />
                    <span>Activate marketing automation</span>
                  </div>
                  <div className="initiative">
                    <input type="checkbox" />
                    <span>Partner with music blogs</span>
                  </div>
                  <div className="initiative">
                    <input type="checkbox" />
                    <span>Launch TikTok campaign</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FounderAdminDashboard;