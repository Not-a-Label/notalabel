#!/usr/bin/env node

/**
 * Viral Referral System for Not a Label
 * Revenue-sharing referral system that incentivizes viral growth
 */

const express = require('express');
const crypto = require('crypto');

// Add to existing backend
const referralSystemRoutes = (app, db, stripeInstance) => {

// Authentication middleware (reuse existing)
const authenticate = (req, res, next) => {
  // Use existing auth middleware
  next();
};

// Generate unique referral code
const generateReferralCode = (userId, username) => {
  const base = username ? username.toUpperCase().replace(/[^A-Z0-9]/g, '') : 'USER';
  const hash = crypto.createHash('md5').update(userId.toString()).digest('hex').substring(0, 4);
  return `${base}_${hash}`;
};

// Create or get user's referral code
app.post('/api/referrals/create-code', authenticate, (req, res) => {
  const userId = req.user.id;
  const username = req.user.username || req.user.email.split('@')[0];
  
  // Check if user already has a referral code
  db.get(`
    SELECT referral_code FROM user_referrals 
    WHERE referrer_id = ?
  `, [userId], (err, existing) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existing) {
      return res.json({
        referral_code: existing.referral_code,
        referral_url: `https://not-a-label.art/signup?ref=${existing.referral_code}`,
        status: 'existing'
      });
    }

    // Generate new referral code
    const referralCode = generateReferralCode(userId, username);
    const timestamp = new Date().toISOString();

    db.run(`
      INSERT INTO user_referrals (
        referrer_id, referral_code, created_at, total_referrals, total_earnings
      ) VALUES (?, ?, ?, 0, 0)
    `, [userId, referralCode, timestamp], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create referral code' });
      }

      res.json({
        referral_code: referralCode,
        referral_url: `https://not-a-label.art/signup?ref=${referralCode}`,
        status: 'created',
        database_id: this.lastID
      });
    });
  });
});

// Track referral signup
app.post('/api/referrals/track-signup', (req, res) => {
  const { referral_code, new_user_id, new_user_email } = req.body;
  
  if (!referral_code || !new_user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Find referrer
  db.get(`
    SELECT referrer_id FROM user_referrals 
    WHERE referral_code = ?
  `, [referral_code], (err, referrer) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Record the referral
    const timestamp = new Date().toISOString();
    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    db.run(`
      INSERT INTO referral_tracking (
        referral_id, referrer_id, referred_id, referral_code, 
        signup_date, status, commission_rate
      ) VALUES (?, ?, ?, ?, ?, 'active', 0.05)
    `, [referralId, referrer.referrer_id, new_user_id, referral_code, timestamp], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to track referral' });
      }

      // Update referrer's stats
      db.run(`
        UPDATE user_referrals 
        SET total_referrals = total_referrals + 1
        WHERE referrer_id = ?
      `, [referrer.referrer_id]);

      // Award signup bonus to new user
      db.run(`
        INSERT INTO user_credits (
          user_id, amount, credit_type, description, created_at
        ) VALUES (?, 1000, 'referral_signup', 'Welcome bonus for using referral code', ?)
      `, [new_user_id, timestamp]);

      res.json({
        success: true,
        referral_id: referralId,
        bonus_awarded: 1000, // $10 credit in cents
        message: 'Referral tracked successfully'
      });
    });
  });
});

// Process referral commission (called when referred user makes payment)
app.post('/api/referrals/process-commission', (req, res) => {
  const { user_id, payment_amount, transaction_id } = req.body;
  
  if (!user_id || !payment_amount || !transaction_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if this user was referred
  db.get(`
    SELECT rt.*, ur.referrer_id 
    FROM referral_tracking rt
    JOIN user_referrals ur ON rt.referrer_id = ur.referrer_id
    WHERE rt.referred_id = ? AND rt.status = 'active'
  `, [user_id], (err, referral) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!referral) {
      return res.json({ message: 'No active referral found for user' });
    }

    // Calculate commission (5% of payment)
    const commission = Math.floor(payment_amount * 0.05);
    const timestamp = new Date().toISOString();
    const commissionId = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Record commission
    db.run(`
      INSERT INTO referral_commissions (
        commission_id, referrer_id, referred_id, transaction_id,
        commission_amount, payment_amount, created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      commissionId, referral.referrer_id, user_id, transaction_id,
      commission, payment_amount, timestamp
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to record commission' });
      }

      // Update referrer's total earnings
      db.run(`
        UPDATE user_referrals 
        SET total_earnings = total_earnings + ?
        WHERE referrer_id = ?
      `, [commission, referral.referrer_id]);

      // Add credit to referrer's account
      db.run(`
        INSERT INTO user_credits (
          user_id, amount, credit_type, description, created_at
        ) VALUES (?, ?, 'referral_commission', ?, ?)
      `, [
        referral.referrer_id, 
        commission, 
        `Commission from ${referral.referral_code} referral`, 
        timestamp
      ]);

      res.json({
        success: true,
        commission_id: commissionId,
        commission_amount: commission,
        referrer_id: referral.referrer_id,
        message: 'Commission processed successfully'
      });
    });
  });
});

// Get referral dashboard data
app.get('/api/referrals/dashboard', authenticate, (req, res) => {
  const userId = req.user.id;

  // Get referral stats
  db.get(`
    SELECT 
      referral_code,
      total_referrals,
      total_earnings
    FROM user_referrals 
    WHERE referrer_id = ?
  `, [userId], (err, stats) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!stats) {
      return res.json({
        referral_code: null,
        total_referrals: 0,
        total_earnings: 0,
        recent_referrals: [],
        commission_history: [],
        tier_progress: null
      });
    }

    // Get recent referrals
    db.all(`
      SELECT 
        rt.referral_id,
        rt.signup_date,
        rt.status,
        u.email as referred_email
      FROM referral_tracking rt
      LEFT JOIN users u ON rt.referred_id = u.id
      WHERE rt.referrer_id = ?
      ORDER BY rt.signup_date DESC
      LIMIT 10
    `, [userId], (err, recentReferrals) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Get commission history
      db.all(`
        SELECT 
          commission_id,
          commission_amount,
          payment_amount,
          created_at,
          status
        FROM referral_commissions
        WHERE referrer_id = ?
        ORDER BY created_at DESC
        LIMIT 20
      `, [userId], (err, commissionHistory) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        // Calculate tier progress
        const tierProgress = calculateTierProgress(stats.total_referrals, stats.total_earnings);

        res.json({
          referral_code: stats.referral_code,
          referral_url: `https://not-a-label.art/signup?ref=${stats.referral_code}`,
          total_referrals: stats.total_referrals,
          total_earnings: stats.total_earnings,
          recent_referrals: recentReferrals,
          commission_history: commissionHistory,
          tier_progress: tierProgress,
          social_sharing: {
            twitter: generateTwitterShare(stats.referral_code),
            facebook: generateFacebookShare(stats.referral_code),
            instagram: generateInstagramCopy(stats.referral_code)
          }
        });
      });
    });
  });
});

// Calculate referral tier progress
const calculateTierProgress = (totalReferrals, totalEarnings) => {
  const tiers = [
    { name: 'Starter', referrals: 1, bonus: 5000, features: ['Basic dashboard'] },
    { name: 'Promoter', referrals: 5, bonus: 30000, features: ['Advanced analytics', 'Custom referral page'] },
    { name: 'Champion', referrals: 10, bonus: 75000, features: ['Priority support', 'Revenue insights'] },
    { name: 'Legend', referrals: 25, bonus: 200000, features: ['Exclusive features', 'Direct founder access'] }
  ];

  let currentTier = null;
  let nextTier = tiers[0];

  for (let i = 0; i < tiers.length; i++) {
    if (totalReferrals >= tiers[i].referrals) {
      currentTier = tiers[i];
      nextTier = tiers[i + 1] || null;
    }
  }

  return {
    current_tier: currentTier,
    next_tier: nextTier,
    progress_to_next: nextTier ? (totalReferrals / nextTier.referrals) : 1,
    lifetime_earnings: totalEarnings
  };
};

// Generate social sharing content
const generateTwitterShare = (referralCode) => ({
  text: `🎵 Just found Not a Label - the platform that actually pays independent artists fairly! Join me and get started with a bonus: https://not-a-label.art/signup?ref=${referralCode} #IndependentMusic #NotALabel`,
  url: `https://not-a-label.art/signup?ref=${referralCode}`
});

const generateFacebookShare = (referralCode) => ({
  text: `Finally, a music platform that treats artists right! 🚀 Not a Label gives musicians the tools and fair revenue sharing they deserve. Check it out:`,
  url: `https://not-a-label.art/signup?ref=${referralCode}`
});

const generateInstagramCopy = (referralCode) => ({
  text: `🎤 Game-changing platform for independent artists!\n\n✨ Fair revenue sharing\n💰 Real earnings tracking\n🚀 Growth tools that work\n\nLink in bio or: not-a-label.art/signup?ref=${referralCode}\n\n#IndependentMusic #MusicRevenue #NotALabel #ArtistLife`,
  hashtags: ['#IndependentMusic', '#MusicRevenue', '#NotALabel', '#ArtistLife', '#MusicBusiness']
});

// Top referrers leaderboard (public)
app.get('/api/referrals/leaderboard', (req, res) => {
  const { period = 'all', limit = 10 } = req.query;
  
  let dateFilter = '';
  if (period === 'month') {
    dateFilter = "AND rt.signup_date >= date('now', 'start of month')";
  } else if (period === 'week') {
    dateFilter = "AND rt.signup_date >= date('now', 'start of week')";
  }

  db.all(`
    SELECT 
      ur.referral_code,
      u.username,
      COUNT(rt.referral_id) as referral_count,
      SUM(rc.commission_amount) as total_earnings
    FROM user_referrals ur
    JOIN users u ON ur.referrer_id = u.id
    LEFT JOIN referral_tracking rt ON ur.referrer_id = rt.referrer_id ${dateFilter}
    LEFT JOIN referral_commissions rc ON ur.referrer_id = rc.referrer_id
    GROUP BY ur.referrer_id
    HAVING referral_count > 0
    ORDER BY referral_count DESC, total_earnings DESC
    LIMIT ?
  `, [parseInt(limit)], (err, leaderboard) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      period,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.username,
        referral_count: entry.referral_count,
        total_earnings: entry.total_earnings || 0,
        badge: index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'
      }))
    });
  });
});

// Get referral analytics (for growth tracking)
app.get('/api/referrals/analytics', authenticate, (req, res) => {
  // This would require admin privileges in production
  const { period = 'month' } = req.query;
  
  let dateFilter = "WHERE signup_date >= date('now', 'start of month')";
  if (period === 'week') {
    dateFilter = "WHERE signup_date >= date('now', 'start of week')";
  } else if (period === 'all') {
    dateFilter = '';
  }

  db.all(`
    SELECT 
      DATE(signup_date) as date,
      COUNT(*) as referrals,
      COUNT(DISTINCT referrer_id) as active_referrers
    FROM referral_tracking
    ${dateFilter}
    GROUP BY DATE(signup_date)
    ORDER BY date DESC
  `, (err, analytics) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate viral coefficient
    db.get(`
      SELECT 
        COUNT(DISTINCT referrer_id) as total_referrers,
        COUNT(*) as total_referrals,
        SUM(commission_amount) as total_commissions
      FROM referral_tracking rt
      LEFT JOIN referral_commissions rc ON rt.referral_id = rc.commission_id
      ${dateFilter.replace('signup_date', 'rt.signup_date')}
    `, (err, summary) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const viralCoefficient = summary.total_referrals / Math.max(summary.total_referrers, 1);

      res.json({
        period,
        summary: {
          total_referrers: summary.total_referrers || 0,
          total_referrals: summary.total_referrals || 0,
          total_commissions: summary.total_commissions || 0,
          viral_coefficient: viralCoefficient.toFixed(2),
          average_referrals_per_user: viralCoefficient.toFixed(1)
        },
        daily_breakdown: analytics
      });
    });
  });
});

};

// Database schema for referral system
const referralSchema = `
-- User referral codes and stats
CREATE TABLE IF NOT EXISTS user_referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (referrer_id) REFERENCES users(id)
);

-- Individual referral tracking
CREATE TABLE IF NOT EXISTS referral_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referral_id TEXT UNIQUE NOT NULL,
  referrer_id INTEGER NOT NULL,
  referred_id INTEGER NOT NULL,
  referral_code TEXT NOT NULL,
  signup_date TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  commission_rate REAL DEFAULT 0.05,
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_id) REFERENCES users(id)
);

-- Commission payments
CREATE TABLE IF NOT EXISTS referral_commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commission_id TEXT UNIQUE NOT NULL,
  referrer_id INTEGER NOT NULL,
  referred_id INTEGER NOT NULL,
  transaction_id TEXT NOT NULL,
  commission_amount INTEGER NOT NULL,
  payment_amount INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (referrer_id) REFERENCES users(id),
  FOREIGN KEY (referred_id) REFERENCES users(id)
);

-- User credits system
CREATE TABLE IF NOT EXISTS user_credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  credit_type TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer ON referral_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred ON referral_tracking(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_commissions_referrer ON referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);
`;

console.log('✅ Viral Referral System Module Ready');
console.log('🚀 Features:');
console.log('  - Revenue-sharing referral codes');
console.log('  - Automatic commission processing');
console.log('  - Tier-based bonus system');
console.log('  - Social sharing optimization');
console.log('  - Viral leaderboards');
console.log('  - Growth analytics tracking');

module.exports = { referralSystemRoutes, referralSchema };