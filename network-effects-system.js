// Network Effects and Community Features System
// Creates viral loops through collaboration and community engagement

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Database setup for community features
const db = new sqlite3.Database('./community.db');

// Initialize community tables
db.serialize(() => {
    // Collaborations table
    db.run(`CREATE TABLE IF NOT EXISTS collaborations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        initiator_id INTEGER NOT NULL,
        collaborator_id INTEGER NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        project_type ENUM('song', 'album', 'ep', 'single') DEFAULT 'song',
        status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
        revenue_split_percentage DECIMAL(5,2) DEFAULT 50.00,
        total_revenue DECIMAL(10,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Fan connections table
    db.run(`CREATE TABLE IF NOT EXISTS fan_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fan_user_id INTEGER NOT NULL,
        artist_user_id INTEGER NOT NULL,
        connection_type ENUM('follow', 'support', 'collaborate') DEFAULT 'follow',
        engagement_score INTEGER DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Community challenges table
    db.run(`CREATE TABLE IF NOT EXISTS community_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_name VARCHAR(255) NOT NULL,
        description TEXT,
        challenge_type ENUM('remix', 'cover', 'original', 'collaboration') DEFAULT 'remix',
        prize_pool DECIMAL(10,2) DEFAULT 0.00,
        entry_fee DECIMAL(5,2) DEFAULT 0.00,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status ENUM('upcoming', 'active', 'judging', 'completed') DEFAULT 'upcoming',
        created_by INTEGER NOT NULL,
        max_participants INTEGER DEFAULT 100
    )`);

    // Challenge submissions table
    db.run(`CREATE TABLE IF NOT EXISTS challenge_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        submission_url VARCHAR(500) NOT NULL,
        submission_title VARCHAR(255) NOT NULL,
        votes_count INTEGER DEFAULT 0,
        engagement_score INTEGER DEFAULT 0,
        prize_won DECIMAL(10,2) DEFAULT 0.00,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES community_challenges(id)
    )`);

    // Social proof activities table
    db.run(`CREATE TABLE IF NOT EXISTS social_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity_type ENUM('stream', 'purchase', 'share', 'comment', 'collaboration', 'challenge_win') NOT NULL,
        target_user_id INTEGER,
        content_id INTEGER,
        activity_data JSON,
        virality_score INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Network growth metrics table
    db.run(`CREATE TABLE IF NOT EXISTS network_metrics (
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

// Collaboration System Routes
app.post('/api/collaborations/initiate', authenticateToken, (req, res) => {
    const { collaborator_id, project_name, project_type, revenue_split } = req.body;
    const initiator_id = req.user.userId;

    // Create collaboration invitation
    db.run(
        `INSERT INTO collaborations 
         (initiator_id, collaborator_id, project_name, project_type, revenue_split_percentage)
         VALUES (?, ?, ?, ?, ?)`,
        [initiator_id, collaborator_id, project_name, project_type, revenue_split || 50],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create collaboration' });
            }

            // Record social activity for virality
            recordSocialActivity(initiator_id, 'collaboration', collaborator_id, this.lastID);
            
            // Send notification to collaborator
            sendCollaborationNotification(collaborator_id, {
                initiator_id,
                project_name,
                collaboration_id: this.lastID
            });

            res.json({ 
                success: true, 
                collaboration_id: this.lastID,
                message: 'Collaboration invitation sent!'
            });
        }
    );
});

app.post('/api/collaborations/:id/respond', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { response } = req.body; // 'accept' or 'decline'
    const user_id = req.user.userId;

    const status = response === 'accept' ? 'active' : 'cancelled';

    db.run(
        `UPDATE collaborations SET status = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? AND collaborator_id = ?`,
        [status, id, user_id],
        function(err) {
            if (err || this.changes === 0) {
                return res.status(400).json({ error: 'Failed to update collaboration' });
            }

            if (response === 'accept') {
                // Increase network effects when collaboration is accepted
                updateNetworkMetrics(user_id);
                recordSocialActivity(user_id, 'collaboration', null, id);
            }

            res.json({ success: true, status });
        }
    );
});

// Community Challenge System
app.post('/api/challenges/create', authenticateToken, (req, res) => {
    const { challenge_name, description, challenge_type, prize_pool, entry_fee, duration_days } = req.body;
    const created_by = req.user.userId;
    
    const start_date = new Date();
    const end_date = new Date(Date.now() + (duration_days * 24 * 60 * 60 * 1000));

    db.run(
        `INSERT INTO community_challenges 
         (challenge_name, description, challenge_type, prize_pool, entry_fee, start_date, end_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [challenge_name, description, challenge_type, prize_pool, entry_fee, start_date, end_date, created_by],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create challenge' });
            }

            // Amplify challenge creation through network
            amplifyThroughNetwork(created_by, 'challenge_created', {
                challenge_id: this.lastID,
                challenge_name,
                prize_pool
            });

            res.json({ 
                success: true, 
                challenge_id: this.lastID,
                message: 'Challenge created and announced to your network!'
            });
        }
    );
});

app.get('/api/challenges/active', (req, res) => {
    db.all(
        `SELECT c.*, COUNT(cs.id) as participant_count 
         FROM community_challenges c
         LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
         WHERE c.status = 'active' AND c.end_date > datetime('now')
         GROUP BY c.id
         ORDER BY c.prize_pool DESC, c.created_at DESC`,
        (err, challenges) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch challenges' });
            }

            res.json({ challenges });
        }
    );
});

// Fan Connection and Engagement System
app.post('/api/connections/follow', authenticateToken, (req, res) => {
    const { artist_user_id } = req.body;
    const fan_user_id = req.user.userId;

    db.run(
        `INSERT OR REPLACE INTO fan_connections 
         (fan_user_id, artist_user_id, connection_type, engagement_score)
         VALUES (?, ?, 'follow', 10)`,
        [fan_user_id, artist_user_id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to follow artist' });
            }

            // Create network effect - notify artist's network about new fan
            recordSocialActivity(fan_user_id, 'follow', artist_user_id);
            updateNetworkMetrics(artist_user_id);

            res.json({ success: true, message: 'Now following artist!' });
        }
    );
});

// Social Proof and Viral Activity Amplification
function recordSocialActivity(user_id, activity_type, target_user_id = null, content_id = null, data = {}) {
    const virality_score = calculateViralityScore(activity_type, data);
    
    db.run(
        `INSERT INTO social_activities 
         (user_id, activity_type, target_user_id, content_id, activity_data, virality_score)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, activity_type, target_user_id, content_id, JSON.stringify(data), virality_score]
    );

    // Amplify high-virality activities
    if (virality_score > 70) {
        amplifyThroughNetwork(user_id, activity_type, data);
    }
}

function calculateViralityScore(activity_type, data = {}) {
    const scores = {
        'stream': 5,
        'purchase': 25,
        'share': 15,
        'comment': 10,
        'collaboration': 40,
        'challenge_win': 50,
        'follow': 10
    };

    let base_score = scores[activity_type] || 5;
    
    // Boost score based on engagement metrics
    if (data.amount && data.amount > 50) base_score *= 1.5;
    if (data.collaboration_count > 5) base_score *= 1.3;
    if (data.fan_count > 100) base_score *= 1.2;

    return Math.min(100, Math.round(base_score));
}

function amplifyThroughNetwork(user_id, activity_type, data) {
    // Get user's network (followers, collaborators, fans)
    db.all(
        `SELECT DISTINCT 
            CASE 
                WHEN fc.fan_user_id = ? THEN fc.artist_user_id
                WHEN fc.artist_user_id = ? THEN fc.fan_user_id
                WHEN c.initiator_id = ? THEN c.collaborator_id
                WHEN c.collaborator_id = ? THEN c.initiator_id
            END as network_user_id
         FROM fan_connections fc
         LEFT JOIN collaborations c ON (c.initiator_id = ? OR c.collaborator_id = ?)
         WHERE (fc.fan_user_id = ? OR fc.artist_user_id = ?)
            OR (c.initiator_id = ? OR c.collaborator_id = ?)`,
        [user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id],
        (err, network) => {
            if (err || !network.length) return;

            // Send activity notifications to network
            network.forEach(connection => {
                if (connection.network_user_id) {
                    sendNetworkActivityNotification(connection.network_user_id, {
                        user_id,
                        activity_type,
                        data
                    });
                }
            });
        }
    );
}

// Network Metrics Calculation
function updateNetworkMetrics(user_id) {
    // Calculate comprehensive network metrics
    db.all(
        `SELECT 
            (SELECT COUNT(*) FROM fan_connections WHERE artist_user_id = ? OR fan_user_id = ?) as connections_count,
            (SELECT COUNT(*) FROM collaborations WHERE (initiator_id = ? OR collaborator_id = ?) AND status = 'active') as collaborations_count,
            (SELECT COUNT(*) FROM fan_connections WHERE artist_user_id = ?) as fan_count,
            (SELECT COALESCE(SUM(total_revenue * revenue_split_percentage / 100), 0) FROM collaborations WHERE (initiator_id = ? OR collaborator_id = ?) AND status = 'completed') as network_value`,
        [user_id, user_id, user_id, user_id, user_id, user_id, user_id],
        (err, results) => {
            if (err || !results.length) return;

            const metrics = results[0];
            const influence_score = calculateInfluenceScore(metrics);

            db.run(
                `INSERT OR REPLACE INTO network_metrics 
                 (user_id, connections_count, collaborations_count, fan_count, influence_score, network_value, last_calculated)
                 VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [user_id, metrics.connections_count, metrics.collaborations_count, 
                 metrics.fan_count, influence_score, metrics.network_value]
            );
        }
    );
}

function calculateInfluenceScore(metrics) {
    // Weighted influence calculation
    const weights = {
        connections: 2,
        collaborations: 5,
        fans: 3,
        revenue: 0.1
    };

    return Math.round(
        (metrics.connections_count * weights.connections) +
        (metrics.collaborations_count * weights.collaborations) +
        (metrics.fan_count * weights.fans) +
        (metrics.network_value * weights.revenue)
    );
}

// Network Analytics Dashboard
app.get('/api/network/analytics/:user_id', authenticateToken, (req, res) => {
    const { user_id } = req.params;

    // Get comprehensive network analytics
    Promise.all([
        // Network metrics
        new Promise((resolve) => {
            db.get(
                'SELECT * FROM network_metrics WHERE user_id = ?',
                [user_id],
                (err, metrics) => resolve(metrics || {})
            );
        }),
        
        // Recent activities
        new Promise((resolve) => {
            db.all(
                `SELECT * FROM social_activities 
                 WHERE user_id = ? OR target_user_id = ?
                 ORDER BY created_at DESC LIMIT 20`,
                [user_id, user_id],
                (err, activities) => resolve(activities || [])
            );
        }),
        
        // Active collaborations
        new Promise((resolve) => {
            db.all(
                `SELECT c.*, u1.username as initiator_name, u2.username as collaborator_name
                 FROM collaborations c
                 LEFT JOIN users u1 ON c.initiator_id = u1.id
                 LEFT JOIN users u2 ON c.collaborator_id = u2.id
                 WHERE (c.initiator_id = ? OR c.collaborator_id = ?) AND c.status = 'active'`,
                [user_id, user_id],
                (err, collaborations) => resolve(collaborations || [])
            );
        })
    ]).then(([metrics, activities, collaborations]) => {
        res.json({
            network_metrics: metrics,
            recent_activities: activities,
            active_collaborations: collaborations,
            growth_recommendations: generateGrowthRecommendations(metrics)
        });
    });
});

function generateGrowthRecommendations(metrics) {
    const recommendations = [];

    if (metrics.fan_count < 50) {
        recommendations.push({
            type: 'fan_growth',
            message: 'Focus on building your fan base - consider creating engaging content and participating in challenges',
            priority: 'high'
        });
    }

    if (metrics.collaborations_count < 3) {
        recommendations.push({
            type: 'collaboration',
            message: 'Increase collaborations to expand your network and cross-pollinate audiences',
            priority: 'medium'
        });
    }

    if (metrics.influence_score < 100) {
        recommendations.push({
            type: 'engagement',
            message: 'Boost engagement by actively supporting other artists and participating in community activities',
            priority: 'medium'
        });
    }

    return recommendations;
}

// Notification helpers
function sendCollaborationNotification(user_id, data) {
    // Integration with existing notification system
    console.log(`Collaboration notification sent to user ${user_id}:`, data);
}

function sendNetworkActivityNotification(user_id, data) {
    // Integration with existing notification system
    console.log(`Network activity notification sent to user ${user_id}:`, data);
}

// Viral Loop Activation Routes
app.post('/api/network/activate-viral-loop', authenticateToken, (req, res) => {
    const { action_type, target_data } = req.body;
    const user_id = req.user.userId;

    // Record and amplify the viral action
    recordSocialActivity(user_id, action_type, null, null, target_data);
    
    // Calculate viral coefficient for this action
    const viral_coefficient = calculateViralCoefficient(user_id, action_type);
    
    res.json({
        success: true,
        viral_coefficient,
        message: 'Viral loop activated!'
    });
});

function calculateViralCoefficient(user_id, action_type) {
    // Simple viral coefficient calculation
    // viral_coefficient = (invites_sent * conversion_rate)
    
    db.get(
        `SELECT 
            COUNT(*) as total_actions,
            (SELECT COUNT(*) FROM fan_connections WHERE fan_user_id = ?) as network_size
         FROM social_activities 
         WHERE user_id = ? AND activity_type = ?`,
        [user_id, user_id, action_type],
        (err, result) => {
            if (err || !result) return 0;
            
            // Estimate conversion based on network size and action frequency
            const conversion_rate = Math.min(0.1, result.network_size / 1000);
            return result.total_actions * conversion_rate;
        }
    );
    
    return 0; // Default return for synchronous response
}

module.exports = { app, db };

console.log('Network Effects and Community Features System initialized');
console.log('Features: Collaborations, Community Challenges, Fan Networks, Social Proof, Viral Loops');