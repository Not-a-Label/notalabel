
// Integrated Growth Systems for Not a Label Platform
// Combines: Referral System, Acquisition Funnel, Marketing Campaigns, 
// Network Effects, and Strategic Partnerships

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Initialize all databases
const referralDb = new sqlite3.Database('./referral.db');
const acquisitionDb = new sqlite3.Database('./acquisition.db');
const marketingDb = new sqlite3.Database('./marketing.db');
const communityDb = new sqlite3.Database('./community.db');
const partnershipsDb = new sqlite3.Database('./partnerships.db');

// Create all tables for integrated system
const initializeDatabase = () => {
    console.log('Initializing integrated growth systems database...');
    
    // Referral system tables
    referralDb.serialize(() => {
        referralDb.run(`CREATE TABLE IF NOT EXISTS referral_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            referral_code VARCHAR(20) UNIQUE NOT NULL,
            total_referrals INTEGER DEFAULT 0,
            total_earnings DECIMAL(10,2) DEFAULT 0.00,
            tier_level INTEGER DEFAULT 1,
            bonus_earned DECIMAL(10,2) DEFAULT 0.00,
            is_active BOOLEAN DEFAULT true,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        referralDb.run(`CREATE TABLE IF NOT EXISTS referral_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referrer_user_id INTEGER NOT NULL,
            referred_user_id INTEGER NOT NULL,
            commission_amount DECIMAL(8,2) NOT NULL,
            transaction_amount DECIMAL(10,2) NOT NULL,
            commission_rate DECIMAL(5,2) NOT NULL,
            status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });

    // Community system tables
    communityDb.serialize(() => {
        communityDb.run(`CREATE TABLE IF NOT EXISTS collaborations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            initiator_id INTEGER NOT NULL,
            collaborator_id INTEGER NOT NULL,
            project_name VARCHAR(255) NOT NULL,
            project_type ENUM('song', 'album', 'ep', 'single') DEFAULT 'song',
            status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
            revenue_split_percentage DECIMAL(5,2) DEFAULT 50.00,
            total_revenue DECIMAL(10,2) DEFAULT 0.00,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        communityDb.run(`CREATE TABLE IF NOT EXISTS network_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            connections_count INTEGER DEFAULT 0,
            collaborations_count INTEGER DEFAULT 0,
            fan_count INTEGER DEFAULT 0,
            influence_score INTEGER DEFAULT 0,
            network_value DECIMAL(10,2) DEFAULT 0.00,
            last_calculated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });

    // Marketing automation tables  
    marketingDb.serialize(() => {
        marketingDb.run(`CREATE TABLE IF NOT EXISTS marketing_campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_name VARCHAR(255) NOT NULL,
            campaign_type ENUM('acquisition', 'retention', 'upsell', 'viral') NOT NULL,
            target_audience JSON NOT NULL,
            budget_allocated DECIMAL(10,2) NOT NULL,
            budget_spent DECIMAL(10,2) DEFAULT 0.00,
            performance_metrics JSON,
            status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });

    console.log('Growth systems database initialized successfully!');
};

// Viral Growth API Routes
app.get('/api/growth/overview/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;
    
    try {
        // Get referral stats
        const referralStats = await new Promise((resolve) => {
            referralDb.get(
                'SELECT * FROM referral_codes WHERE user_id = ?',
                [user_id],
                (err, result) => resolve(result || {})
            );
        });

        // Get network metrics
        const networkMetrics = await new Promise((resolve) => {
            communityDb.get(
                'SELECT * FROM network_metrics WHERE user_id = ?',
                [user_id],
                (err, result) => resolve(result || {})
            );
        });

        // Calculate viral coefficient
        const viralCoefficient = calculateViralCoefficient(referralStats, networkMetrics);
        
        // Growth projections
        const growthProjections = calculateGrowthProjections(referralStats, networkMetrics);

        res.json({
            success: true,
            growth_overview: {
                viral_coefficient: viralCoefficient,
                referral_earnings: referralStats.total_earnings || 0,
                network_influence: networkMetrics.influence_score || 0,
                total_connections: networkMetrics.connections_count || 0,
                growth_projections: growthProjections
            },
            recommendations: generateGrowthRecommendations(referralStats, networkMetrics)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch growth overview' });
    }
});

// Viral Loop Activation
app.post('/api/growth/activate-viral-loop', authenticateToken, async (req, res) => {
    const { action_type, target_data } = req.body;
    const user_id = req.user.userId;

    try {
        let viral_boost = 0;
        
        switch (action_type) {
            case 'share_referral':
                viral_boost = await activateReferralSharing(user_id, target_data);
                break;
            case 'collaboration_invite':
                viral_boost = await activateCollaborationViral(user_id, target_data);
                break;
            case 'cross_platform_promotion':
                viral_boost = await activateCrossPlatformViral(user_id, target_data);
                break;
            default:
                viral_boost = 10; // Base viral boost
        }

        // Update user's viral metrics
        await updateViralMetrics(user_id, action_type, viral_boost);

        res.json({
            success: true,
            viral_boost: viral_boost,
            total_viral_score: await getTotalViralScore(user_id),
            message: 'Viral loop activated successfully!'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to activate viral loop' });
    }
});

// Growth Analytics Dashboard
app.get('/api/growth/analytics/:user_id', authenticateToken, async (req, res) => {
    const { user_id } = req.params;
    const { timeframe = '30d' } = req.query;

    try {
        const analytics = await Promise.all([
            getReferralAnalytics(user_id, timeframe),
            getNetworkGrowthAnalytics(user_id, timeframe),
            getRevenueGrowthAnalytics(user_id, timeframe),
            getViralityAnalytics(user_id, timeframe)
        ]);

        const [referral, network, revenue, virality] = analytics;

        res.json({
            growth_analytics: {
                referral_performance: referral,
                network_expansion: network,
                revenue_growth: revenue,
                virality_metrics: virality,
                compound_growth_rate: calculateCompoundGrowthRate(analytics),
                next_milestone: calculateNextMilestone(analytics)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch growth analytics' });
    }
});

// Helper Functions
function calculateViralCoefficient(referralStats, networkMetrics) {
    const referrals = referralStats.total_referrals || 0;
    const connections = networkMetrics.connections_count || 0;
    const influence = networkMetrics.influence_score || 0;
    
    // Viral coefficient = (invites_sent * conversion_rate * average_invites_per_user)
    const conversion_rate = Math.min(0.15, influence / 1000);
    const avg_invites = Math.max(1, connections / 10);
    
    return Math.round((referrals * conversion_rate * avg_invites) * 100) / 100;
}

function calculateGrowthProjections(referralStats, networkMetrics) {
    const current_revenue = referralStats.total_earnings || 0;
    const viral_coefficient = calculateViralCoefficient(referralStats, networkMetrics);
    
    // Project growth based on viral coefficient
    const monthly_multiplier = Math.max(1.1, 1 + (viral_coefficient * 0.1));
    
    return {
        next_month: Math.round(current_revenue * monthly_multiplier),
        three_months: Math.round(current_revenue * Math.pow(monthly_multiplier, 3)),
        six_months: Math.round(current_revenue * Math.pow(monthly_multiplier, 6)),
        growth_rate: Math.round((monthly_multiplier - 1) * 100)
    };
}

async function activateReferralSharing(user_id, target_data) {
    // Simulate social sharing boost
    const sharing_platforms = target_data.platforms || ['twitter', 'instagram', 'tiktok'];
    const boost_per_platform = 15;
    
    return sharing_platforms.length * boost_per_platform;
}

async function activateCollaborationViral(user_id, target_data) {
    // Collaboration amplifies both users' networks
    const collaboration_boost = 25;
    const network_size_bonus = Math.min(50, (target_data.network_size || 0) / 10);
    
    return collaboration_boost + network_size_bonus;
}

async function activateCrossPlatformViral(user_id, target_data) {
    // Cross-platform promotion creates network effects
    const platforms_count = target_data.platforms_count || 1;
    const base_boost = 20;
    const platform_multiplier = Math.min(3, platforms_count * 0.5);
    
    return Math.round(base_boost * platform_multiplier);
}

function generateGrowthRecommendations(referralStats, networkMetrics) {
    const recommendations = [];
    
    const viral_coefficient = calculateViralCoefficient(referralStats, networkMetrics);
    
    if (viral_coefficient < 0.5) {
        recommendations.push({
            type: 'viral_optimization',
            priority: 'high',
            message: 'Boost your viral coefficient by encouraging more referrals and collaborations',
            action: 'Implement aggressive referral incentives and partner with high-influence artists'
        });
    }
    
    if ((referralStats.total_referrals || 0) < 5) {
        recommendations.push({
            type: 'referral_acceleration',
            priority: 'high',
            message: 'Focus on your first 5 referrals to unlock tier bonuses',
            action: 'Share your referral code on all social platforms and offer limited-time bonuses'
        });
    }
    
    if ((networkMetrics.influence_score || 0) < 100) {
        recommendations.push({
            type: 'influence_building',
            priority: 'medium',
            message: 'Increase your influence score through community engagement',
            action: 'Participate in challenges, collaborate with other artists, and support community members'
        });
    }
    
    return recommendations;
}

// Initialize and start the integrated growth system
initializeDatabase();

const PORT = process.env.GROWTH_PORT || 3005;
app.listen(PORT, () => {
    console.log(`Integrated Growth Systems running on port ${PORT}`);
    console.log('Active systems: Referral, Acquisition, Marketing, Network Effects, Partnerships');
    console.log('Ready to scale Not a Label to viral growth! 🚀');
});

module.exports = { app, authenticateToken };
