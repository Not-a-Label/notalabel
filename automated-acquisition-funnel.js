#!/usr/bin/env node

/**
 * Automated Artist Acquisition Funnel
 * Multi-channel growth system for Not a Label
 */

const express = require('express');
const crypto = require('crypto');

// Automated Artist Acquisition System
const acquisitionFunnelRoutes = (app, db, stripeInstance) => {

// Lead scoring and qualification
app.post('/api/growth/score-lead', (req, res) => {
  const { 
    email, 
    social_followers = 0, 
    monthly_streams = 0, 
    current_revenue = 0,
    music_genre = 'unknown',
    years_active = 0,
    referral_source = 'organic'
  } = req.body;

  // Calculate lead score (0-100)
  const leadScore = calculateLeadScore({
    social_followers,
    monthly_streams,
    current_revenue,
    music_genre,
    years_active,
    referral_source
  });

  // Determine funnel path based on score
  const funnelPath = determineFunnelPath(leadScore);
  
  // Store lead in database
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  db.run(`
    INSERT INTO growth_leads (
      lead_id, email, lead_score, funnel_path, social_followers,
      monthly_streams, current_revenue, music_genre, years_active,
      referral_source, created_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `, [
    leadId, email, leadScore, funnelPath, social_followers,
    monthly_streams, current_revenue, music_genre, years_active,
    referral_source, timestamp
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to store lead' });
    }

    res.json({
      lead_id: leadId,
      lead_score: leadScore,
      funnel_path: funnelPath,
      recommended_actions: getRecommendedActions(leadScore, funnelPath),
      next_step_timing: getNextStepTiming(funnelPath)
    });
  });
});

// Calculate lead score algorithm
const calculateLeadScore = (data) => {
  let score = 0;
  
  // Social following (0-25 points)
  if (data.social_followers > 10000) score += 25;
  else if (data.social_followers > 5000) score += 20;
  else if (data.social_followers > 1000) score += 15;
  else if (data.social_followers > 500) score += 10;
  else if (data.social_followers > 100) score += 5;
  
  // Monthly streams (0-25 points)
  if (data.monthly_streams > 50000) score += 25;
  else if (data.monthly_streams > 10000) score += 20;
  else if (data.monthly_streams > 5000) score += 15;
  else if (data.monthly_streams > 1000) score += 10;
  else if (data.monthly_streams > 100) score += 5;
  
  // Current revenue (0-20 points)
  if (data.current_revenue > 5000) score += 20;
  else if (data.current_revenue > 1000) score += 15;
  else if (data.current_revenue > 500) score += 10;
  else if (data.current_revenue > 100) score += 5;
  
  // Experience (0-15 points)
  if (data.years_active > 5) score += 15;
  else if (data.years_active > 2) score += 10;
  else if (data.years_active > 1) score += 5;
  
  // Genre bonus (0-10 points)
  const highValueGenres = ['pop', 'hip-hop', 'electronic', 'indie', 'rock'];
  if (highValueGenres.includes(data.music_genre.toLowerCase())) score += 10;
  else score += 5;
  
  // Referral source bonus (0-5 points)
  if (data.referral_source === 'referral') score += 5;
  else if (data.referral_source === 'social_media') score += 3;
  else if (data.referral_source === 'search') score += 2;
  
  return Math.min(score, 100);
};

// Determine acquisition funnel path
const determineFunnelPath = (leadScore) => {
  if (leadScore >= 80) return 'premium_fast_track';
  else if (leadScore >= 60) return 'standard_accelerated';
  else if (leadScore >= 40) return 'nurture_sequence';
  else return 'education_first';
};

// Get recommended actions based on lead score
const getRecommendedActions = (leadScore, funnelPath) => {
  const actions = {
    premium_fast_track: [
      'immediate_personal_outreach',
      'custom_demo_video',
      'priority_onboarding_call',
      'exclusive_beta_features'
    ],
    standard_accelerated: [
      'automated_welcome_series',
      'success_story_sharing',
      'feature_demo_videos',
      'limited_time_discount'
    ],
    nurture_sequence: [
      'educational_email_series',
      'webinar_invitations',
      'case_study_content',
      'gradual_feature_introduction'
    ],
    education_first: [
      'music_business_guide',
      'revenue_optimization_tips',
      'platform_comparison_content',
      'community_introduction'
    ]
  };
  
  return actions[funnelPath] || actions.education_first;
};

// Get timing for next step
const getNextStepTiming = (funnelPath) => {
  const timing = {
    premium_fast_track: '1 hour',
    standard_accelerated: '4 hours',
    nurture_sequence: '24 hours',
    education_first: '72 hours'
  };
  
  return timing[funnelPath] || timing.education_first;
};

// Automated follow-up system
app.post('/api/growth/trigger-followup', (req, res) => {
  const { lead_id, action_type } = req.body;
  
  if (!lead_id || !action_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get lead data
  db.get(`
    SELECT * FROM growth_leads WHERE lead_id = ?
  `, [lead_id], (err, lead) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Generate personalized content
    const personalizedContent = generatePersonalizedContent(lead, action_type);
    
    // Record follow-up action
    const followupId = `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    db.run(`
      INSERT INTO growth_followups (
        followup_id, lead_id, action_type, content, 
        scheduled_at, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
    `, [
      followupId, lead_id, action_type, JSON.stringify(personalizedContent),
      timestamp, timestamp
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to schedule follow-up' });
      }

      // In production, this would trigger email/SMS/etc.
      console.log(`📧 Follow-up scheduled: ${action_type} for ${lead.email}`);

      res.json({
        followup_id: followupId,
        action_type: action_type,
        content: personalizedContent,
        status: 'scheduled',
        message: 'Follow-up action scheduled successfully'
      });
    });
  });
});

// Generate personalized content based on lead data
const generatePersonalizedContent = (lead, actionType) => {
  const templates = {
    immediate_personal_outreach: {
      subject: `${lead.music_genre} artist? Let's talk revenue optimization!`,
      body: `Hi! I noticed you're a ${lead.music_genre} artist with ${lead.social_followers} followers. Based on your profile, you could potentially earn $${Math.floor(lead.monthly_streams * 0.003)} monthly with our platform. Would you like a 15-minute call to discuss?`,
      call_to_action: 'Schedule Call',
      urgency: 'high'
    },
    
    automated_welcome_series: {
      subject: 'Welcome to Not a Label - Your revenue potential is huge!',
      body: `Welcome! Artists like you (${lead.music_genre}, ${lead.monthly_streams} monthly streams) typically see their revenue increase by 40-60% within 3 months on our platform. Here's how to get started...`,
      call_to_action: 'Start Free Trial',
      urgency: 'medium'
    },
    
    educational_email_series: {
      subject: 'How independent artists are earning $5k+/month',
      body: `Did you know that ${lead.music_genre} artists with your level of engagement can earn significantly more? Here's a case study of an artist who went from $${lead.current_revenue}/month to $3,500/month...`,
      call_to_action: 'Read Case Study',
      urgency: 'low'
    },
    
    success_story_sharing: {
      subject: 'Artist just hit $2,847 monthly - here\'s how',
      body: `A ${lead.music_genre} artist similar to you just shared their success story. They went from ${lead.monthly_streams} streams to over 75k streams in 4 months using our platform. Want to see their strategy?`,
      call_to_action: 'View Success Story',
      urgency: 'medium'
    }
  };
  
  return templates[actionType] || templates.educational_email_series;
};

// A/B test different acquisition messages
app.post('/api/growth/ab-test', (req, res) => {
  const { lead_id, test_variants } = req.body;
  
  if (!lead_id || !test_variants || test_variants.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 test variants' });
  }

  // Randomly assign variant
  const selectedVariant = test_variants[Math.floor(Math.random() * test_variants.length)];
  const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  // Record A/B test assignment
  db.run(`
    INSERT INTO growth_ab_tests (
      test_id, lead_id, variant_name, variant_content,
      assigned_at, status
    ) VALUES (?, ?, ?, ?, ?, 'active')
  `, [
    testId, lead_id, selectedVariant.name, 
    JSON.stringify(selectedVariant), timestamp
  ], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to assign A/B test' });
    }

    res.json({
      test_id: testId,
      selected_variant: selectedVariant,
      message: 'A/B test variant assigned'
    });
  });
});

// Track conversion events
app.post('/api/growth/track-conversion', (req, res) => {
  const { lead_id, conversion_type, conversion_value = 0 } = req.body;
  
  if (!lead_id || !conversion_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conversionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  // Record conversion
  db.run(`
    INSERT INTO growth_conversions (
      conversion_id, lead_id, conversion_type, conversion_value,
      converted_at
    ) VALUES (?, ?, ?, ?, ?)
  `, [conversionId, lead_id, conversion_type, conversion_value, timestamp], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to track conversion' });
    }

    // Update lead status
    db.run(`
      UPDATE growth_leads 
      SET status = 'converted', converted_at = ?
      WHERE lead_id = ?
    `, [timestamp, lead_id]);

    // Calculate attribution and ROI
    calculateAttribution(lead_id, conversion_value);

    res.json({
      conversion_id: conversionId,
      lead_id: lead_id,
      conversion_type: conversion_type,
      conversion_value: conversion_value,
      message: 'Conversion tracked successfully'
    });
  });
});

// Calculate attribution for growth channels
const calculateAttribution = (leadId, conversionValue) => {
  db.get(`
    SELECT referral_source, funnel_path FROM growth_leads 
    WHERE lead_id = ?
  `, [leadId], (err, lead) => {
    if (err || !lead) return;

    // Update channel performance stats
    db.run(`
      INSERT OR REPLACE INTO channel_performance (
        channel, date, conversions, revenue
      ) VALUES (
        ?, DATE('now'), 
        COALESCE((SELECT conversions FROM channel_performance WHERE channel = ? AND date = DATE('now')), 0) + 1,
        COALESCE((SELECT revenue FROM channel_performance WHERE channel = ? AND date = DATE('now')), 0) + ?
      )
    `, [lead.referral_source, lead.referral_source, lead.referral_source, conversionValue]);
  });
};

// Growth analytics dashboard
app.get('/api/growth/analytics', (req, res) => {
  const { period = 'month' } = req.query;
  
  let dateFilter = "WHERE created_at >= date('now', 'start of month')";
  if (period === 'week') {
    dateFilter = "WHERE created_at >= date('now', 'start of week')";
  } else if (period === 'all') {
    dateFilter = '';
  }

  // Get lead generation stats
  db.all(`
    SELECT 
      DATE(created_at) as date,
      funnel_path,
      COUNT(*) as leads,
      AVG(lead_score) as avg_score
    FROM growth_leads
    ${dateFilter}
    GROUP BY DATE(created_at), funnel_path
    ORDER BY date DESC
  `, (err, leadStats) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get conversion stats
    db.all(`
      SELECT 
        gl.referral_source,
        COUNT(gc.conversion_id) as conversions,
        SUM(gc.conversion_value) as revenue,
        AVG(gl.lead_score) as avg_lead_score
      FROM growth_leads gl
      LEFT JOIN growth_conversions gc ON gl.lead_id = gc.lead_id
      ${dateFilter.replace('created_at', 'gl.created_at')}
      GROUP BY gl.referral_source
    `, (err, conversionStats) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Calculate funnel metrics
      db.get(`
        SELECT 
          COUNT(*) as total_leads,
          COUNT(CASE WHEN status = 'converted' THEN 1 END) as conversions,
          AVG(lead_score) as avg_lead_score,
          SUM(CASE WHEN gc.conversion_value THEN gc.conversion_value ELSE 0 END) as total_revenue
        FROM growth_leads gl
        LEFT JOIN growth_conversions gc ON gl.lead_id = gc.lead_id
        ${dateFilter.replace('created_at', 'gl.created_at')}
      `, (err, summary) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        const conversionRate = (summary.conversions / Math.max(summary.total_leads, 1) * 100).toFixed(2);
        const avgRevenuePerLead = (summary.total_revenue / Math.max(summary.total_leads, 1)).toFixed(2);

        res.json({
          period,
          summary: {
            total_leads: summary.total_leads || 0,
            conversions: summary.conversions || 0,
            conversion_rate: conversionRate + '%',
            total_revenue: summary.total_revenue || 0,
            avg_revenue_per_lead: avgRevenuePerLead,
            avg_lead_score: (summary.avg_lead_score || 0).toFixed(1)
          },
          lead_generation_by_day: leadStats,
          channel_performance: conversionStats,
          funnel_optimization: generateFunnelOptimizations(leadStats, conversionStats)
        });
      });
    });
  });
});

// Generate funnel optimization recommendations
const generateFunnelOptimizations = (leadStats, conversionStats) => {
  const recommendations = [];
  
  // Analyze conversion rates by channel
  conversionStats.forEach(channel => {
    const conversionRate = (channel.conversions / Math.max(channel.leads || 1, 1)) * 100;
    
    if (conversionRate < 5) {
      recommendations.push({
        type: 'channel_optimization',
        channel: channel.referral_source,
        issue: 'Low conversion rate',
        recommendation: `Improve ${channel.referral_source} targeting and messaging`,
        priority: 'high'
      });
    }
    
    if (channel.avg_lead_score < 40) {
      recommendations.push({
        type: 'lead_quality',
        channel: channel.referral_source,
        issue: 'Low quality leads',
        recommendation: `Refine ${channel.referral_source} audience targeting`,
        priority: 'medium'
      });
    }
  });
  
  // Analyze funnel paths
  const funnelPaths = {};
  leadStats.forEach(stat => {
    if (!funnelPaths[stat.funnel_path]) {
      funnelPaths[stat.funnel_path] = { leads: 0, avgScore: 0 };
    }
    funnelPaths[stat.funnel_path].leads += stat.leads;
    funnelPaths[stat.funnel_path].avgScore += stat.avg_score;
  });
  
  Object.keys(funnelPaths).forEach(path => {
    const data = funnelPaths[path];
    if (data.leads > 10 && data.avgScore / data.leads < 50) {
      recommendations.push({
        type: 'funnel_optimization',
        funnel_path: path,
        issue: 'Underperforming funnel',
        recommendation: `Optimize ${path} messaging and timing`,
        priority: 'medium'
      });
    }
  });
  
  return recommendations;
};

};

// Database schema for growth system
const growthSchema = `
-- Lead tracking and scoring
CREATE TABLE IF NOT EXISTS growth_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  lead_score INTEGER NOT NULL,
  funnel_path TEXT NOT NULL,
  social_followers INTEGER DEFAULT 0,
  monthly_streams INTEGER DEFAULT 0,
  current_revenue INTEGER DEFAULT 0,
  music_genre TEXT,
  years_active INTEGER DEFAULT 0,
  referral_source TEXT DEFAULT 'organic',
  created_at TEXT NOT NULL,
  converted_at TEXT,
  status TEXT DEFAULT 'active'
);

-- Follow-up automation
CREATE TABLE IF NOT EXISTS growth_followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  followup_id TEXT UNIQUE NOT NULL,
  lead_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  content TEXT,
  scheduled_at TEXT NOT NULL,
  sent_at TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES growth_leads(lead_id)
);

-- A/B testing
CREATE TABLE IF NOT EXISTS growth_ab_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id TEXT UNIQUE NOT NULL,
  lead_id TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  variant_content TEXT,
  assigned_at TEXT NOT NULL,
  converted_at TEXT,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (lead_id) REFERENCES growth_leads(lead_id)
);

-- Conversion tracking
CREATE TABLE IF NOT EXISTS growth_conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversion_id TEXT UNIQUE NOT NULL,
  lead_id TEXT NOT NULL,
  conversion_type TEXT NOT NULL,
  conversion_value INTEGER DEFAULT 0,
  converted_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES growth_leads(lead_id)
);

-- Channel performance tracking
CREATE TABLE IF NOT EXISTS channel_performance (
  channel TEXT NOT NULL,
  date TEXT NOT NULL,
  conversions INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  PRIMARY KEY (channel, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_growth_leads_score ON growth_leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_growth_leads_source ON growth_leads(referral_source);
CREATE INDEX IF NOT EXISTS idx_growth_conversions_lead ON growth_conversions(lead_id);
`;

console.log('✅ Automated Acquisition Funnel Module Ready');
console.log('🎯 Features:');
console.log('  - AI lead scoring (0-100 scale)');
console.log('  - Dynamic funnel path assignment');
console.log('  - Personalized follow-up automation');
console.log('  - A/B testing for conversion optimization');
console.log('  - Multi-channel attribution tracking');
console.log('  - Growth analytics and recommendations');

module.exports = { acquisitionFunnelRoutes, growthSchema };