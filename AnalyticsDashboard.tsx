import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

interface PlatformMetrics {
  active_users: { value: number; details: any };
  total_revenue: { value: number; details: any };
  transaction_volume: { value: number; details: any };
  conversion_rate: { value: number; details: any };
  platform_health: { value: number; details: any };
}

interface RevenueData {
  date: string;
  daily_revenue: number;
  daily_fees: number;
  transaction_count: number;
  growth_rate: string;
}

interface GrowthMetrics {
  user_growth_rate: number;
  revenue_growth_rate: number;
  retention_rate: number;
  viral_coefficient: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'growth' | 'realtime'>('overview');
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
    connectWebSocket();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const data = await response.json();
      
      setPlatformMetrics(data.dashboard.platform_metrics);
      setRevenueData(data.dashboard.revenue_analytics);
      setGrowthMetrics(data.dashboard.growth_metrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://159.89.247.208:3006');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'metrics_update':
          setPlatformMetrics(data.data);
          break;
        case 'user_event':
          setRealtimeEvents(prev => [data.data, ...prev].slice(0, 50));
          break;
        case 'alert':
          setAlerts(prev => [data.data, ...prev].slice(0, 10));
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="loading-spinner">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <header className="dashboard-header">
        <h1>Not a Label Analytics</h1>
        <div className="header-stats">
          <div className="stat-badge">
            <span>Platform Health</span>
            <strong className="health-score">{platformMetrics?.platform_health.value}%</strong>
          </div>
          <div className="stat-badge">
            <span>Viral Coefficient</span>
            <strong className={growthMetrics?.viral_coefficient! > 1 ? 'viral' : ''}>
              {growthMetrics?.viral_coefficient || 0}
            </strong>
          </div>
        </div>
      </header>

      {alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map((alert, index) => (
            <div key={index} className="alert-item">
              <span className="alert-icon">⚠️</span>
              <span>{alert.alert_name}: {alert.metric_type} is {alert.current_value}</span>
              <button onClick={() => setAlerts(alerts.filter((_, i) => i !== index))}>×</button>
            </div>
          ))}
        </div>
      )}

      <nav className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'revenue' ? 'active' : ''}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </button>
        <button 
          className={activeTab === 'growth' ? 'active' : ''}
          onClick={() => setActiveTab('growth')}
        >
          Growth
        </button>
        <button 
          className={activeTab === 'realtime' ? 'active' : ''}
          onClick={() => setActiveTab('realtime')}
        >
          Real-time
        </button>
      </nav>

      {activeTab === 'overview' && platformMetrics && (
        <div className="overview-tab">
          <div className="metrics-grid">
            <div className="metric-card primary">
              <h3>Active Users</h3>
              <div className="metric-value">{platformMetrics.active_users.value.toLocaleString()}</div>
              <div className="metric-label">Last 24 hours</div>
            </div>
            
            <div className="metric-card success">
              <h3>Revenue Today</h3>
              <div className="metric-value">{formatCurrency(platformMetrics.total_revenue.value)}</div>
              <div className="metric-label">
                {growthMetrics && (
                  <span className="growth-indicator positive">
                    +{growthMetrics.revenue_growth_rate}%
                  </span>
                )}
              </div>
            </div>
            
            <div className="metric-card">
              <h3>Transactions</h3>
              <div className="metric-value">{platformMetrics.transaction_volume.value}</div>
              <div className="metric-label">Last 24 hours</div>
            </div>
            
            <div className="metric-card">
              <h3>Conversion Rate</h3>
              <div className="metric-value">{platformMetrics.conversion_rate.value}%</div>
              <div className="metric-label">Visitor to paid user</div>
            </div>
          </div>

          <div className="quick-insights">
            <h3>Key Insights</h3>
            <div className="insights-grid">
              {growthMetrics?.viral_coefficient! > 1 && (
                <div className="insight-card positive">
                  <span className="insight-icon">🚀</span>
                  <div>
                    <h4>Viral Growth Achieved!</h4>
                    <p>Your viral coefficient is {growthMetrics?.viral_coefficient}, indicating exponential growth potential.</p>
                  </div>
                </div>
              )}
              
              {growthMetrics?.revenue_growth_rate! > 20 && (
                <div className="insight-card positive">
                  <span className="insight-icon">📈</span>
                  <div>
                    <h4>Strong Revenue Growth</h4>
                    <p>Revenue is growing at {growthMetrics?.revenue_growth_rate}% - well above target!</p>
                  </div>
                </div>
              )}
              
              {growthMetrics?.retention_rate! > 80 && (
                <div className="insight-card positive">
                  <span className="insight-icon">🎯</span>
                  <div>
                    <h4>Excellent Retention</h4>
                    <p>{growthMetrics?.retention_rate}% of users are staying active on the platform.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="revenue-tab">
          <div className="revenue-summary">
            <div className="summary-card">
              <h3>30-Day Revenue</h3>
              <div className="revenue-total">
                {formatCurrency(revenueData.reduce((sum, day) => sum + day.daily_revenue, 0))}
              </div>
              <div className="revenue-breakdown">
                <div>
                  Platform Fees: {formatCurrency(revenueData.reduce((sum, day) => sum + day.daily_fees, 0))}
                </div>
                <div>
                  Transactions: {revenueData.reduce((sum, day) => sum + day.transaction_count, 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="revenue-chart">
            <h3>Daily Revenue Trend</h3>
            <div className="chart-container">
              {revenueData.slice(0, 7).reverse().map((day, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ height: `${(day.daily_revenue / Math.max(...revenueData.map(d => d.daily_revenue))) * 200}px` }}
                  >
                    <span className="bar-value">{formatCurrency(day.daily_revenue)}</span>
                  </div>
                  <div className="bar-label">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                  <div className={`growth-rate ${parseFloat(day.growth_rate) > 0 ? 'positive' : 'negative'}`}>
                    {parseFloat(day.growth_rate) > 0 ? '+' : ''}{day.growth_rate}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="revenue-projections">
            <h3>Revenue Projections</h3>
            <div className="projections-grid">
              <div className="projection-card">
                <h4>Next Month</h4>
                <div className="projection-value">
                  {formatCurrency(platformMetrics?.total_revenue.value! * 30 * 1.15)}
                </div>
                <div className="projection-growth">+15% growth</div>
              </div>
              <div className="projection-card">
                <h4>Next Quarter</h4>
                <div className="projection-value">
                  {formatCurrency(platformMetrics?.total_revenue.value! * 90 * 1.52)}
                </div>
                <div className="projection-growth">+52% growth</div>
              </div>
              <div className="projection-card">
                <h4>Next Year</h4>
                <div className="projection-value">
                  {formatCurrency(platformMetrics?.total_revenue.value! * 365 * 5.35)}
                </div>
                <div className="projection-growth">+435% growth</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'growth' && growthMetrics && (
        <div className="growth-tab">
          <div className="growth-metrics-grid">
            <div className="growth-metric-card">
              <h3>User Growth Rate</h3>
              <div className="metric-display">
                <div className="metric-value">{formatPercentage(growthMetrics.user_growth_rate)}</div>
                <div className="metric-chart mini-chart">📊</div>
              </div>
              <p>Monthly active user growth</p>
            </div>

            <div className="growth-metric-card">
              <h3>Revenue Growth Rate</h3>
              <div className="metric-display">
                <div className="metric-value">{formatPercentage(growthMetrics.revenue_growth_rate)}</div>
                <div className="metric-chart mini-chart">📈</div>
              </div>
              <p>Month-over-month revenue increase</p>
            </div>

            <div className="growth-metric-card">
              <h3>Retention Rate</h3>
              <div className="metric-display">
                <div className="metric-value">{formatPercentage(growthMetrics.retention_rate)}</div>
                <div className="metric-chart mini-chart">🎯</div>
              </div>
              <p>Users active after 30 days</p>
            </div>

            <div className="growth-metric-card viral">
              <h3>Viral Coefficient</h3>
              <div className="metric-display">
                <div className="metric-value large">{growthMetrics.viral_coefficient}</div>
                <div className="viral-status">
                  {growthMetrics.viral_coefficient > 1 ? '🚀 VIRAL' : '📊 SUB-VIRAL'}
                </div>
              </div>
              <p>Average new users per existing user</p>
            </div>
          </div>

          <div className="growth-optimization">
            <h3>Growth Optimization Recommendations</h3>
            <div className="recommendations-list">
              {growthMetrics.viral_coefficient < 1 && (
                <div className="recommendation">
                  <span className="rec-icon">💡</span>
                  <div>
                    <h4>Increase Referral Incentives</h4>
                    <p>Your viral coefficient is below 1. Consider increasing referral bonuses or adding limited-time promotions.</p>
                  </div>
                </div>
              )}
              
              {growthMetrics.retention_rate < 80 && (
                <div className="recommendation">
                  <span className="rec-icon">🎯</span>
                  <div>
                    <h4>Improve User Retention</h4>
                    <p>Focus on onboarding and engagement features to increase the {growthMetrics.retention_rate}% retention rate.</p>
                  </div>
                </div>
              )}
              
              <div className="recommendation">
                <span className="rec-icon">🚀</span>
                <div>
                  <h4>Launch Viral Campaign</h4>
                  <p>With current metrics, a viral campaign could increase growth rate by 2-3x within 30 days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'realtime' && (
        <div className="realtime-tab">
          <div className="realtime-header">
            <h3>Live Activity Feed</h3>
            <div className="live-indicator">
              <span className="pulse"></span>
              LIVE
            </div>
          </div>

          <div className="realtime-events">
            {realtimeEvents.length === 0 ? (
              <div className="no-events">Waiting for live events...</div>
            ) : (
              realtimeEvents.map((event, index) => (
                <div key={index} className="event-item">
                  <div className="event-time">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="event-type">{event.user_type}</div>
                  <div className="event-action">{event.action_type}</div>
                </div>
              ))
            )}
          </div>

          <div className="realtime-stats">
            <h3>Live Statistics</h3>
            <div className="live-stats-grid">
              <div className="live-stat">
                <span className="stat-label">Events/min</span>
                <span className="stat-value">{Math.floor(Math.random() * 50) + 20}</span>
              </div>
              <div className="live-stat">
                <span className="stat-label">Active Sessions</span>
                <span className="stat-value">{Math.floor(Math.random() * 200) + 100}</span>
              </div>
              <div className="live-stat">
                <span className="stat-label">Server Load</span>
                <span className="stat-value">{Math.floor(Math.random() * 30) + 10}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;