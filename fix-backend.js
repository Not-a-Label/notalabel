#!/usr/bin/env node
/**
 * Complete working backend with Stripe integration
 * This bypasses TypeScript compilation issues
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const stripe = require('stripe');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Stripe
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Database setup
const db = new sqlite3.Database('./data/notalabel.db');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://159.89.247.208:3000',
  credentials: true
}));

// Raw middleware for webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.send('Backend server is running with SQLite and Stripe!');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      database: true,
      jwt: !!process.env.JWT_SECRET
    },
    version: '1.0.0'
  });
});

// Stripe configuration
app.get('/api/payments/config', (req, res) => {
  res.json({
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Subscription tiers
app.get('/api/subscriptions/tiers', (req, res) => {
  const tiers = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 9.99,
      priceId: 'price_basic_test',
      features: [
        'Upload up to 10 tracks',
        'Basic analytics',
        'Standard distribution'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 19.99,
      priceId: 'price_pro_test',
      features: [
        'Unlimited uploads',
        'Advanced analytics',
        'Priority distribution',
        'Social media automation'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 49.99,
      priceId: 'price_enterprise_test',
      features: [
        'Everything in Pro',
        'White-label branding',
        'API access',
        'Dedicated support'
      ]
    }
  ];
  
  res.json(tiers);
});

// Create payment intent
app.post('/api/payments/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', payment_type = 'subscription' } = req.body;

    // Calculate business fees (15% base + additional fees)
    const platformFee = Math.round(amount * 0.15); // 15% platform fee
    const additionalFee = payment_type === 'nft_mint' ? 2500 : // $25 for NFT minting
                         payment_type === 'ai_processing' ? 500 : // $5 for AI processing
                         payment_type === 'subscription' ? Math.round(amount * 0.05) : 0; // Extra 5% for subscriptions

    const totalBusinessRevenue = platformFee + additionalFee;

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amount,
      currency: currency,
      application_fee_amount: totalBusinessRevenue,
      metadata: {
        payment_type,
        platform_fee: platformFee.toString(),
        additional_fee: additionalFee.toString(),
        business_revenue: totalBusinessRevenue.toString()
      }
    });

    // Log business revenue
    const timestamp = new Date().toISOString();
    db.run(`
      INSERT INTO business_revenue (
        transaction_id, amount, fee_type, description, created_at
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      paymentIntent.id,
      totalBusinessRevenue,
      payment_type,
      `Platform fee for ${payment_type}`,
      timestamp
    ]);

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      business_revenue: totalBusinessRevenue
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint
app.post('/api/payments/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update business revenue record
        db.run(`
          UPDATE business_revenue 
          SET status = 'completed', updated_at = ?
          WHERE transaction_id = ?
        `, [new Date().toISOString(), paymentIntent.id]);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Mark as failed
        db.run(`
          UPDATE business_revenue 
          SET status = 'failed', updated_at = ?
          WHERE transaction_id = ?
        `, [new Date().toISOString(), failedPayment.id]);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Founder-only business revenue endpoint
app.get('/api/payments/business-revenue', (req, res) => {
  // Note: In production, this should have proper authentication
  // For now, we'll return data for testing
  
  db.all(`
    SELECT 
      SUM(amount) as total_revenue,
      COUNT(*) as total_transactions,
      fee_type,
      DATE(created_at) as date
    FROM business_revenue 
    WHERE status = 'completed'
    GROUP BY fee_type, DATE(created_at)
    ORDER BY created_at DESC
  `, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const totalRevenue = rows.reduce((sum, row) => sum + (row.total_revenue || 0), 0);
    const totalTransactions = rows.reduce((sum, row) => sum + (row.total_transactions || 0), 0);

    res.json({
      summary: {
        total_revenue: totalRevenue,
        total_transactions: totalTransactions,
        currency: 'usd'
      },
      breakdown: rows,
      safe_withdrawal_amount: Math.floor(totalRevenue * 0.20), // 20% safe withdrawal
      recommended_retention: Math.floor(totalRevenue * 0.80)   // 80% for growth
    });
  });
});

// Founder profits summary
app.get('/api/founder/profits/summary', (req, res) => {
  // Get business revenue summary
  db.get(`
    SELECT 
      SUM(amount) as total_collected,
      COUNT(*) as total_transactions
    FROM business_revenue 
    WHERE status = 'completed'
  `, (err, revenue) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get withdrawal summary
    db.get(`
      SELECT 
        SUM(amount) as total_withdrawn,
        COUNT(*) as withdrawal_count,
        MAX(created_at) as last_withdrawal
      FROM founder_withdrawals 
      WHERE status = 'completed'
    `, (err, withdrawals) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const totalCollected = revenue?.total_collected || 0;
      const totalWithdrawn = withdrawals?.total_withdrawn || 0;
      const availableBalance = totalCollected - totalWithdrawn;

      res.json({
        revenue: {
          total_collected: totalCollected,
          total_transactions: revenue?.total_transactions || 0
        },
        withdrawals: {
          total_withdrawn: totalWithdrawn,
          count: withdrawals?.withdrawal_count || 0,
          last_withdrawal: withdrawals?.last_withdrawal
        },
        balance: {
          available: availableBalance,
          safe_withdrawal: Math.floor(availableBalance * 0.20), // 20% safe to withdraw
          retention_recommended: Math.floor(availableBalance * 0.80) // 80% keep for growth
        }
      });
    });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Test business logic without Stripe API calls
app.post('/api/payments/simulate-payment', (req, res) => {
  try {
    const { amount, payment_type = 'subscription' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Calculate business fees (same logic as real payment)
    const platformFee = Math.round(amount * 0.15); // 15% platform fee
    const additionalFee = payment_type === 'nft_mint' ? 2500 : // $25 for NFT minting
                         payment_type === 'ai_processing' ? 500 : // $5 for AI processing  
                         payment_type === 'subscription' ? Math.round(amount * 0.05) : 0; // Extra 5% for subscriptions

    const totalBusinessRevenue = platformFee + additionalFee;
    const simulatedPaymentId = `pi_test_${Date.now()}`;

    // Log business revenue (simulated)
    const timestamp = new Date().toISOString();
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
    
    db.run(`
      INSERT INTO business_revenue (
        transaction_id, user_id, transaction_type, gross_amount, platform_fee, net_amount, recorded_at, fiscal_year, fiscal_quarter
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      simulatedPaymentId,
      1, // Default user ID for testing
      payment_type,
      amount,
      totalBusinessRevenue,
      amount - totalBusinessRevenue,
      timestamp,
      currentYear,
      currentQuarter
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        simulated_payment_id: simulatedPaymentId,
        original_amount: amount,
        platform_fee: platformFee,
        additional_fee: additionalFee,
        total_business_revenue: totalBusinessRevenue,
        fee_percentage: ((totalBusinessRevenue / amount) * 100).toFixed(2) + '%',
        database_record_id: this.lastID
      });
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Platform metrics endpoint (used by FounderBudgetAdvisor)
app.get('/api/founder/platform-metrics', (req, res) => {
  db.all(`
    SELECT 
      SUM(platform_fee) as monthly_revenue,
      COUNT(*) as total_transactions
    FROM business_revenue 
    WHERE strftime('%Y-%m', recorded_at) = strftime('%Y-%m', 'now')
  `, (err, monthlyData) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const monthlyRevenue = monthlyData[0]?.monthly_revenue || 0;
    
    // Mock some metrics for now - in production these would come from real data
    const metrics = {
      monthly_revenue: monthlyRevenue,
      user_growth_rate: 15, // 15% monthly user growth
      server_costs: 450, // Monthly server costs
      marketing_spend: Math.floor(monthlyRevenue * 0.15), // 15% of revenue on marketing
      cash_reserves: monthlyRevenue * 6, // Assume 6 months reserves
      burn_rate: monthlyRevenue * 0.65, // 65% burn rate
      runway_months: 6
    };

    res.json({ metrics });
  });
});

// Business revenue endpoint with export functionality
app.get('/api/payments/business/revenue', (req, res) => {
  const { period = 'all', format = 'json' } = req.query;
  
  let whereClause = '';
  if (period === 'month') {
    whereClause = "WHERE strftime('%Y-%m', recorded_at) = strftime('%Y-%m', 'now')";
  } else if (period === 'quarter') {
    whereClause = "WHERE recorded_at >= date('now', 'start of month', '-3 months')";
  } else if (period === 'year') {
    whereClause = "WHERE strftime('%Y', recorded_at) = strftime('%Y', 'now')";
  }

  const query = `
    SELECT 
      DATE(recorded_at) as date,
      transaction_type,
      COUNT(*) as transaction_count,
      SUM(gross_amount) as gross_revenue,
      SUM(platform_fee) as platform_revenue,
      SUM(net_amount) as net_revenue
    FROM business_revenue 
    ${whereClause}
    GROUP BY DATE(recorded_at), transaction_type
    ORDER BY recorded_at DESC
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Calculate totals
    const totals = {
      total_transactions: rows.reduce((sum, row) => sum + row.transaction_count, 0),
      total_gross_revenue: rows.reduce((sum, row) => sum + (row.gross_revenue || 0), 0),
      total_platform_revenue: rows.reduce((sum, row) => sum + (row.platform_revenue || 0), 0),
      total_net_revenue: rows.reduce((sum, row) => sum + (row.net_revenue || 0), 0)
    };

    if (format === 'csv') {
      // CSV export
      let csv = 'Date,Transaction Type,Count,Gross Revenue,Platform Revenue,Net Revenue\n';
      rows.forEach(row => {
        csv += `${row.date},${row.transaction_type},${row.transaction_count},${row.gross_revenue},${row.platform_revenue},${row.net_revenue}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=business-revenue.csv');
      res.send(csv);
    } else {
      res.json({
        period,
        totals,
        data: rows,
        summary: {
          effective_fee_rate: ((totals.total_platform_revenue / totals.total_gross_revenue) * 100).toFixed(2) + '%',
          average_transaction: (totals.total_gross_revenue / totals.total_transactions).toFixed(2)
        }
      });
    }
  });
});

// Export endpoint
app.get('/api/payments/business/export', (req, res) => {
  // Redirect to the same endpoint with CSV format
  const { period = 'all' } = req.query;
  res.redirect(`/api/payments/business/revenue?period=${period}&format=csv`);
});

// Test founder revenue calculation
app.get('/api/founder/revenue-calculator', (req, res) => {
  db.get(`
    SELECT 
      SUM(platform_fee) as total_collected,
      COUNT(*) as total_transactions
    FROM business_revenue
  `, (err, revenue) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const totalCollected = revenue?.total_collected || 0;
    
    // Business budget advisor calculations
    const safeWithdrawalCalculations = {
      conservative: Math.floor(totalCollected * 0.10), // 10% if under $5k
      moderate: Math.floor(totalCollected * 0.15),     // 15% if under $10k  
      aggressive: Math.floor(totalCollected * 0.20),   // 20% if under $50k
      optimal: Math.floor(totalCollected * 0.25)       // 25% if over $50k
    };

    let recommendedWithdrawal;
    let riskLevel;
    
    if (totalCollected < 5000) {
      recommendedWithdrawal = safeWithdrawalCalculations.conservative;
      riskLevel = 'conservative';
    } else if (totalCollected < 10000) {
      recommendedWithdrawal = safeWithdrawalCalculations.moderate;
      riskLevel = 'moderate';
    } else if (totalCollected < 50000) {
      recommendedWithdrawal = safeWithdrawalCalculations.aggressive;
      riskLevel = 'aggressive';
    } else {
      recommendedWithdrawal = safeWithdrawalCalculations.optimal;
      riskLevel = 'optimal';
    }

    res.json({
      total_business_revenue: totalCollected,
      total_transactions: revenue?.total_transactions || 0,
      safe_withdrawal_recommendations: safeWithdrawalCalculations,
      recommended_withdrawal: recommendedWithdrawal,
      recommended_retention: totalCollected - recommendedWithdrawal,
      risk_level: riskLevel,
      advice: {
        conservative: "Safest approach - minimal impact on growth",
        moderate: "Balanced approach - steady growth with personal income", 
        aggressive: "Higher risk - prioritizes personal income",
        optimal: "Maximum sustainable withdrawal for established revenue"
      }
    });
  });
});

// Founder authentication middleware
const founderAuth = (req, res, next) => {
  const founderId = process.env.FOUNDER_USER_ID || 'jason_ino_founder';
  
  // In production, this would check JWT token
  // For now, we'll use a simple header check
  const userHeader = req.headers['x-founder-id'] || req.query.founder_id;
  
  if (userHeader !== founderId) {
    return res.status(403).json({ 
      error: 'Access denied. Founder-only endpoint.',
      required_id: founderId 
    });
  }
  
  req.founder = { id: founderId };
  next();
};

// Get available balance for withdrawal
app.get('/api/founder/balance', founderAuth, (req, res) => {
  db.get(`
    SELECT 
      SUM(platform_fee) as total_collected,
      COUNT(*) as total_transactions
    FROM business_revenue
  `, (err, revenue) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total withdrawn
    db.get(`
      SELECT 
        SUM(amount) as total_withdrawn,
        COUNT(*) as withdrawal_count
      FROM founder_withdrawals 
      WHERE status = 'completed'
    `, (err, withdrawals) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const totalCollected = revenue?.total_collected || 0;
      const totalWithdrawn = withdrawals?.total_withdrawn || 0;
      const availableBalance = totalCollected - totalWithdrawn;

      // Safe withdrawal calculations
      const safeWithdrawalTiers = {
        conservative: Math.floor(availableBalance * 0.10), // 10% if under $5k
        moderate: Math.floor(availableBalance * 0.15),     // 15% if under $10k
        aggressive: Math.floor(availableBalance * 0.20),   // 20% if under $50k
        optimal: Math.floor(availableBalance * 0.25)       // 25% if over $50k
      };

      let recommendedAmount;
      let riskLevel;
      
      if (totalCollected < 5000) {
        recommendedAmount = safeWithdrawalTiers.conservative;
        riskLevel = 'conservative';
      } else if (totalCollected < 10000) {
        recommendedAmount = safeWithdrawalTiers.moderate;
        riskLevel = 'moderate';
      } else if (totalCollected < 50000) {
        recommendedAmount = safeWithdrawalTiers.aggressive;
        riskLevel = 'aggressive';
      } else {
        recommendedAmount = safeWithdrawalTiers.optimal;
        riskLevel = 'optimal';
      }

      res.json({
        balance: {
          total_collected: totalCollected,
          total_withdrawn: totalWithdrawn,
          available: availableBalance,
          currency: 'USD'
        },
        safe_withdrawal: {
          recommended_amount: recommendedAmount,
          risk_level: riskLevel,
          tiers: safeWithdrawalTiers,
          reasoning: {
            conservative: 'Safest approach - minimal growth impact',
            moderate: 'Balanced approach - steady growth with income',
            aggressive: 'Higher risk - prioritizes founder income',
            optimal: 'Maximum sustainable for established revenue'
          }
        },
        withdrawal_history: {
          total_withdrawn: totalWithdrawn,
          withdrawal_count: withdrawals?.withdrawal_count || 0
        }
      });
    });
  });
});

// Request founder withdrawal
app.post('/api/founder/withdraw', founderAuth, async (req, res) => {
  try {
    const { amount, bank_account_id, description = 'Founder withdrawal' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    // Check available balance
    const balanceCheck = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          (SELECT COALESCE(SUM(platform_fee), 0) FROM business_revenue) -
          (SELECT COALESCE(SUM(amount), 0) FROM founder_withdrawals WHERE status = 'completed') as available_balance
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result.available_balance);
      });
    });

    if (amount > balanceCheck) {
      return res.status(400).json({ 
        error: 'Insufficient balance', 
        available: balanceCheck,
        requested: amount 
      });
    }

    // Create withdrawal record
    const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    db.run(`
      INSERT INTO founder_withdrawals (
        withdrawal_id, founder_id, amount, description, status, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      withdrawalId,
      req.founder.id,
      amount,
      description,
      'pending',
      timestamp,
      timestamp
    ], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create withdrawal' });
      }

      res.json({
        success: true,
        withdrawal: {
          id: withdrawalId,
          amount: amount,
          status: 'pending',
          description: description,
          created_at: timestamp,
          estimated_arrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
          database_id: this.lastID
        },
        remaining_balance: balanceCheck - amount
      });
      
      // Simulate approval process (in production this would be manual or automated)
      setTimeout(() => {
        db.run(`
          UPDATE founder_withdrawals 
          SET status = 'completed', updated_at = ?
          WHERE withdrawal_id = ?
        `, [new Date().toISOString(), withdrawalId]);
        
        console.log(`✅ Withdrawal ${withdrawalId} auto-approved for $${amount}`);
      }, 5000); // Auto-approve after 5 seconds for demo
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Withdrawal processing failed' });
  }
});

// Get withdrawal history
app.get('/api/founder/withdrawals', founderAuth, (req, res) => {
  const { limit = 50, offset = 0, status = 'all' } = req.query;
  
  let whereClause = '';
  let params = [];
  
  if (status !== 'all') {
    whereClause = 'WHERE status = ?';
    params.push(status);
  }
  
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(`
    SELECT 
      withdrawal_id,
      amount,
      description,
      status,
      created_at,
      updated_at
    FROM founder_withdrawals 
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `, params, (err, withdrawals) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Get totals
    db.get(`
      SELECT 
        COUNT(*) as total_count,
        SUM(amount) as total_amount
      FROM founder_withdrawals 
      ${whereClause}
    `, status !== 'all' ? [status] : [], (err, totals) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        withdrawals: withdrawals,
        pagination: {
          total: totals.total_count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < totals.total_count
        },
        summary: {
          total_amount: totals.total_amount || 0,
          total_count: totals.total_count || 0
        }
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Complete backend running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Stripe config: http://localhost:${PORT}/api/payments/config`);
  console.log(`📊 Business revenue: http://localhost:${PORT}/api/payments/business-revenue`);
  console.log(`🧪 Test payment: POST http://localhost:${PORT}/api/payments/simulate-payment`);
  console.log(`📈 Revenue calculator: http://localhost:${PORT}/api/founder/revenue-calculator`);
  console.log(`💰 Founder balance: http://localhost:${PORT}/api/founder/balance`);
  console.log(`🏦 Founder withdrawal: POST http://localhost:${PORT}/api/founder/withdraw`);
});

module.exports = app;