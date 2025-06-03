#!/usr/bin/env node

/**
 * Revenue-Driven Marketing Campaigns for Not a Label
 * Performance-based marketing automation that scales with revenue
 */

const express = require('express');

// Revenue-Driven Marketing System
const marketingCampaignRoutes = (app, db, stripeInstance) => {

// Campaign budget allocation based on current revenue
app.get('/api/marketing/budget-allocation', (req, res) => {
  // Get current month's platform revenue
  db.get(`
    SELECT 
      SUM(platform_fee) as monthly_revenue,
      COUNT(*) as transaction_count
    FROM business_revenue 
    WHERE strftime('%Y-%m', recorded_at) = strftime('%Y-%m', 'now')
  `, (err, revenue) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const monthlyRevenue = revenue?.monthly_revenue || 0;
    const budgetAllocation = calculateMarketingBudget(monthlyRevenue);

    res.json({
      monthly_revenue: monthlyRevenue,
      transaction_count: revenue?.transaction_count || 0,
      budget_allocation: budgetAllocation,
      recommended_campaigns: getRecommendedCampaigns(monthlyRevenue),
      scaling_thresholds: getScalingThresholds(),
      roi_targets: getRoiTargets(monthlyRevenue)
    });
  });
});

// Calculate marketing budget (20% of revenue)
const calculateMarketingBudget = (monthlyRevenue) => {
  const totalBudget = Math.floor(monthlyRevenue * 0.20); // 20% of revenue
  
  return {
    total_budget: totalBudget,
    channel_allocation: {
      facebook_ads: Math.floor(totalBudget * 0.35),      // 35% - highest ROI
      google_ads: Math.floor(totalBudget * 0.25),        // 25% - search intent
      instagram_ads: Math.floor(totalBudget * 0.15),     // 15% - visual content
      youtube_ads: Math.floor(totalBudget * 0.10),       // 10% - video content
      spotify_ads: Math.floor(totalBudget * 0.10),       // 10% - music audience
      influencer_marketing: Math.floor(totalBudget * 0.05) // 5% - partnerships
    },
    reserve_fund: Math.floor(totalBudget * 0.10), // 10% for testing new channels
    budget_period: 'monthly'
  };
};

// Get recommended campaigns based on revenue level
const getRecommendedCampaigns = (monthlyRevenue) => {
  if (monthlyRevenue < 1000) {
    return [
      {
        name: 'Startup Growth Campaign',
        budget: Math.floor(monthlyRevenue * 0.20),
        channels: ['facebook_ads', 'organic_social'],
        target: 'independent_musicians',
        message: 'Start earning more from your music',
        duration: '30_days'
      }
    ];
  } else if (monthlyRevenue < 5000) {
    return [
      {
        name: 'Scale-Up Acquisition',
        budget: Math.floor(monthlyRevenue * 0.15),
        channels: ['facebook_ads', 'google_ads'],
        target: 'artists_with_existing_revenue',
        message: 'Double your music income in 90 days',
        duration: '30_days'
      },
      {
        name: 'Success Story Amplification',
        budget: Math.floor(monthlyRevenue * 0.05),
        channels: ['social_media', 'pr'],
        target: 'general_music_audience',
        message: 'Platform generating real income for artists',
        duration: '30_days'
      }
    ];
  } else {
    return [
      {
        name: 'Market Leader Campaign',
        budget: Math.floor(monthlyRevenue * 0.12),
        channels: ['all_channels'],
        target: 'professional_musicians',
        message: 'Industry-leading platform for independent artists',
        duration: '30_days'
      },
      {
        name: 'Viral Success Campaign',
        budget: Math.floor(monthlyRevenue * 0.08),
        channels: ['influencer_marketing', 'youtube_ads'],
        target: 'music_influencers',
        message: 'Artists earning $5k+ monthly on our platform',
        duration: '30_days'
      }
    ];
  }
};

// Create performance-based campaign
app.post('/api/marketing/create-campaign', (req, res) => {
  const {
    campaign_name,
    budget,
    channels = [],
    target_audience,
    campaign_message,
    success_metrics = {},
    duration_days = 30
  } = req.body;

  if (!campaign_name || !budget || channels.length === 0) {
    return res.status(400).json({ error: 'Missing required campaign fields' });
  }

  const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  const endDate = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString();

  // Store campaign
  db.run(`
    INSERT INTO marketing_campaigns (
      campaign_id, campaign_name, budget, channels, target_audience,
      campaign_message, success_metrics, start_date, end_date,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
  `, [
    campaignId, campaign_name, budget, JSON.stringify(channels),
    target_audience, campaign_message, JSON.stringify(success_metrics),
    timestamp, endDate, timestamp
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to create campaign' });
    }

    // Initialize campaign tracking
    initializeCampaignTracking(campaignId, channels);

    res.json({
      campaign_id: campaignId,
      status: 'active',
      budget_allocated: budget,
      channels: channels,
      tracking_pixels: generateTrackingPixels(campaignId),
      success_metrics: success_metrics,
      message: 'Campaign created successfully'
    });
  });
});

// Initialize tracking for campaign channels
const initializeCampaignTracking = (campaignId, channels) => {
  channels.forEach(channel => {
    const trackingId = `track_${campaignId}_${channel}`;
    const timestamp = new Date().toISOString();

    db.run(`
      INSERT INTO campaign_tracking (
        tracking_id, campaign_id, channel, impressions, clicks,
        conversions, spend, revenue, created_at
      ) VALUES (?, ?, ?, 0, 0, 0, 0, 0, ?)
    `, [trackingId, campaignId, channel, timestamp]);
  });
};

// Generate tracking pixels and UTM parameters
const generateTrackingPixels = (campaignId) => {
  return {
    facebook_pixel: `fbq('track', 'Lead', {campaign_id: '${campaignId}'});`,
    google_analytics: `gtag('event', 'conversion', {campaign_id: '${campaignId}'});`,
    utm_parameters: {
      utm_source: 'not_a_label',
      utm_medium: 'paid',
      utm_campaign: campaignId,
      utm_content: 'artist_acquisition'
    },
    conversion_webhook: `https://not-a-label.art/api/marketing/track-conversion?campaign_id=${campaignId}`
  };
};

// Track campaign performance
app.post('/api/marketing/track-performance', (req, res) => {
  const {
    campaign_id,
    channel,
    impressions = 0,
    clicks = 0,
    conversions = 0,
    spend = 0,
    revenue = 0
  } = req.body;

  if (!campaign_id || !channel) {
    return res.status(400).json({ error: 'Missing campaign_id or channel' });
  }

  // Update tracking data
  db.run(`
    UPDATE campaign_tracking 
    SET 
      impressions = impressions + ?,
      clicks = clicks + ?,
      conversions = conversions + ?,
      spend = spend + ?,
      revenue = revenue + ?,
      updated_at = ?
    WHERE campaign_id = ? AND channel = ?
  `, [impressions, clicks, conversions, spend, revenue, new Date().toISOString(), campaign_id, channel], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update tracking' });
    }

    // Check if campaign needs optimization
    checkCampaignOptimization(campaign_id, channel);

    res.json({
      success: true,
      campaign_id: campaign_id,
      channel: channel,
      tracking_updated: true
    });
  });
});

// Automatic campaign optimization
const checkCampaignOptimization = (campaignId, channel) => {
  db.get(`
    SELECT * FROM campaign_tracking 
    WHERE campaign_id = ? AND channel = ?
  `, [campaignId, channel], (err, tracking) => {
    if (err || !tracking) return;

    const cpc = tracking.clicks > 0 ? tracking.spend / tracking.clicks : 0;
    const conversionRate = tracking.clicks > 0 ? (tracking.conversions / tracking.clicks) * 100 : 0;
    const roi = tracking.spend > 0 ? (tracking.revenue / tracking.spend) : 0;

    // Auto-optimization rules
    const optimizations = [];

    if (cpc > 5 && tracking.clicks > 100) { // High cost per click
      optimizations.push({
        type: 'reduce_bid',
        reason: 'High CPC detected',
        recommendation: 'Reduce bid by 20%'
      });
    }

    if (conversionRate < 2 && tracking.clicks > 50) { // Low conversion rate
      optimizations.push({
        type: 'improve_targeting',
        reason: 'Low conversion rate',
        recommendation: 'Refine audience targeting'
      });
    }

    if (roi < 2 && tracking.spend > 100) { // Poor ROI
      optimizations.push({
        type: 'pause_campaign',
        reason: 'ROI below threshold',
        recommendation: 'Pause and optimize campaign'
      });
    }

    if (optimizations.length > 0) {
      // Store optimization recommendations
      optimizations.forEach(opt => {
        db.run(`
          INSERT INTO campaign_optimizations (
            campaign_id, channel, optimization_type, reason,
            recommendation, created_at, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `, [campaignId, channel, opt.type, opt.reason, opt.recommendation, new Date().toISOString()]);
      });
    }
  });
};

// Success story automation
app.post('/api/marketing/generate-success-story', (req, res) => {
  const { user_id, milestone_type, milestone_value } = req.body;

  if (!user_id || !milestone_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get user data
  db.get(`
    SELECT username, email FROM users WHERE id = ?
  `, [user_id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate success story content
    const successStory = generateSuccessStoryContent(user, milestone_type, milestone_value);
    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Store success story
    db.run(`
      INSERT INTO success_stories (
        story_id, user_id, milestone_type, milestone_value,
        story_content, social_content, created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_approval')
    `, [
      storyId, user_id, milestone_type, milestone_value,
      JSON.stringify(successStory.story), JSON.stringify(successStory.social),
      timestamp
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create success story' });
      }

      res.json({
        story_id: storyId,
        success_story: successStory,
        status: 'pending_approval',
        estimated_reach: calculateEstimatedReach(milestone_type, milestone_value)
      });
    });
  });
});

// Generate success story content
const generateSuccessStoryContent = (user, milestoneType, milestoneValue) => {
  const templates = {
    first_1000_revenue: {
      story: {
        headline: `Independent Artist Hits $1,000 Monthly Revenue`,
        content: `${user.username} just achieved a major milestone - earning over $1,000 in a single month through our platform! This success story shows what's possible for independent artists who take control of their music career.`,
        quote: `"I never thought I'd see consistent four-figure months from my music. Not a Label changed everything!" - ${user.username}`,
        call_to_action: 'Start your journey to $1,000+ monthly revenue'
      },
      social: {
        twitter: `🎉 ${user.username} just earned $${milestoneValue} this month! Another success story from independent artists taking control. #IndependentMusic #NotALabel`,
        instagram: `🎵 SUCCESS STORY ALERT! 🎵\n\n${user.username} just hit $${milestoneValue} monthly revenue! \n\nProof that independent artists can thrive 💪\n\n#IndependentMusic #ArtistSuccess #NotALabel`,
        facebook: `Amazing news! ${user.username} is now earning $${milestoneValue} monthly through our platform. Stories like this inspire us every day. What's your music income goal?`
      }
    },
    
    viral_song: {
      story: {
        headline: `Artist's Song Goes Viral - Earns $${milestoneValue} in Revenue`,
        content: `${user.username}'s latest track has taken off, generating incredible streaming numbers and substantial revenue. This is exactly why we built Not a Label - to help artists capitalize on their viral moments.`,
        quote: `"When my song went viral, Not a Label helped me maximize every stream and turn it into real income." - ${user.username}`,
        call_to_action: 'Get ready for your viral moment'
      },
      social: {
        twitter: `🔥 VIRAL ALERT! ${user.username}'s track is blowing up and they're earning real money from it! $${milestoneValue} and counting... #ViralMusic #IndependentArtist`,
        instagram: `🚀 VIRAL SUCCESS STORY 🚀\n\n${user.username}'s song is everywhere and the revenue is flowing! $${milestoneValue} earned!\n\n#ViralMusic #ArtistSuccess #IndependentMusic`,
        facebook: `Incredible! ${user.username}'s song has gone viral and they're seeing real financial results. This is what independent music success looks like in 2024!`
      }
    }
  };
  
  return templates[milestoneType] || templates.first_1000_revenue;
};

// Calculate estimated social reach
const calculateEstimatedReach = (milestoneType, milestoneValue) => {
  const baseReach = {
    first_1000_revenue: 5000,
    viral_song: 15000,
    platform_milestone: 8000
  };
  
  const reach = baseReach[milestoneType] || 3000;
  const valueMultiplier = Math.log10(milestoneValue / 1000) || 1;
  
  return Math.floor(reach * valueMultiplier);
};

// Marketing ROI analytics
app.get('/api/marketing/roi-analytics', (req, res) => {
  const { period = 'month' } = req.query;
  
  let dateFilter = "WHERE start_date >= date('now', 'start of month')";
  if (period === 'week') {
    dateFilter = "WHERE start_date >= date('now', 'start of week')";
  } else if (period === 'all') {
    dateFilter = '';
  }

  // Get campaign performance
  db.all(`
    SELECT 
      mc.campaign_name,
      mc.budget,
      SUM(ct.spend) as total_spend,
      SUM(ct.revenue) as total_revenue,
      SUM(ct.conversions) as total_conversions,
      SUM(ct.clicks) as total_clicks,
      SUM(ct.impressions) as total_impressions
    FROM marketing_campaigns mc
    JOIN campaign_tracking ct ON mc.campaign_id = ct.campaign_id
    ${dateFilter.replace('start_date', 'mc.start_date')}
    GROUP BY mc.campaign_id
    ORDER BY total_revenue DESC
  `, (err, campaigns) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate metrics for each campaign
    const campaignMetrics = campaigns.map(campaign => {
      const roi = campaign.total_spend > 0 ? (campaign.total_revenue / campaign.total_spend) : 0;
      const cpc = campaign.total_clicks > 0 ? (campaign.total_spend / campaign.total_clicks) : 0;
      const conversionRate = campaign.total_clicks > 0 ? (campaign.total_conversions / campaign.total_clicks * 100) : 0;
      const cpa = campaign.total_conversions > 0 ? (campaign.total_spend / campaign.total_conversions) : 0;

      return {
        ...campaign,
        roi: roi.toFixed(2),
        cpc: cpc.toFixed(2),
        conversion_rate: conversionRate.toFixed(2) + '%',
        cost_per_acquisition: cpa.toFixed(2),
        performance_rating: getPerformanceRating(roi, conversionRate)
      };
    });

    // Overall summary
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.total_spend || 0), 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.total_conversions || 0), 0);

    res.json({
      period,
      summary: {
        total_campaigns: campaigns.length,
        total_spend: totalSpend,
        total_revenue: totalRevenue,
        overall_roi: totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00',
        total_conversions: totalConversions,
        average_cpa: totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : '0.00'
      },
      campaign_performance: campaignMetrics,
      optimization_recommendations: generateMarketingOptimizations(campaignMetrics)
    });
  });
});

// Get performance rating
const getPerformanceRating = (roi, conversionRate) => {
  if (roi >= 3 && conversionRate >= 5) return 'excellent';
  else if (roi >= 2 && conversionRate >= 3) return 'good';
  else if (roi >= 1.5 && conversionRate >= 2) return 'average';
  else return 'poor';
};

// Generate marketing optimization recommendations
const generateMarketingOptimizations = (campaigns) => {
  const recommendations = [];
  
  campaigns.forEach(campaign => {
    if (parseFloat(campaign.roi) < 1.5) {
      recommendations.push({
        campaign: campaign.campaign_name,
        type: 'roi_optimization',
        issue: 'Low ROI',
        recommendation: 'Pause campaign and optimize targeting',
        priority: 'high'
      });
    }
    
    if (parseFloat(campaign.conversion_rate) < 2) {
      recommendations.push({
        campaign: campaign.campaign_name,
        type: 'conversion_optimization',
        issue: 'Low conversion rate',
        recommendation: 'A/B test landing pages and improve messaging',
        priority: 'medium'
      });
    }
    
    if (parseFloat(campaign.cost_per_acquisition) > 50) {
      recommendations.push({
        campaign: campaign.campaign_name,
        type: 'cost_optimization',
        issue: 'High acquisition cost',
        recommendation: 'Refine audience targeting and reduce bids',
        priority: 'medium'
      });
    }
  });
  
  return recommendations;
};

};

// Database schema for marketing system
const marketingSchema = `
-- Marketing campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id TEXT UNIQUE NOT NULL,
  campaign_name TEXT NOT NULL,
  budget INTEGER NOT NULL,
  channels TEXT NOT NULL,
  target_audience TEXT,
  campaign_message TEXT,
  success_metrics TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL
);

-- Campaign performance tracking
CREATE TABLE IF NOT EXISTS campaign_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_id TEXT UNIQUE NOT NULL,
  campaign_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(campaign_id)
);

-- Campaign optimization recommendations
CREATE TABLE IF NOT EXISTS campaign_optimizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  optimization_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(campaign_id)
);

-- Success stories for viral marketing
CREATE TABLE IF NOT EXISTS success_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_value INTEGER NOT NULL,
  story_content TEXT NOT NULL,
  social_content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  published_at TEXT,
  status TEXT DEFAULT 'pending_approval',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_tracking_campaign ON campaign_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_user ON success_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
`;

console.log('✅ Revenue-Driven Marketing Module Ready');
console.log('💰 Features:');
console.log('  - Dynamic budget allocation (20% of revenue)');
console.log('  - Performance-based campaign optimization');
console.log('  - Automatic success story generation');
console.log('  - ROI tracking and analytics');
console.log('  - Multi-channel attribution');
console.log('  - Viral content amplification');

module.exports = { marketingCampaignRoutes, marketingSchema };