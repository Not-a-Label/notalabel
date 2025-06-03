const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('outreach.db');

// Initialize database tables
db.serialize(() => {
    // Artists table
    db.run(`CREATE TABLE IF NOT EXISTS artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT,
        platform TEXT,
        genre TEXT,
        followers INTEGER,
        email TEXT,
        contact_method TEXT,
        engagement_rate REAL,
        last_post_date TEXT,
        bio TEXT,
        recent_activity TEXT,
        profile_url TEXT,
        status TEXT DEFAULT 'discovered',
        priority INTEGER DEFAULT 1,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Outreach campaigns table
    db.run(`CREATE TABLE IF NOT EXISTS outreach_campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artist_id INTEGER,
        template_id TEXT,
        subject TEXT,
        content TEXT,
        sent_at DATETIME,
        opened_at DATETIME,
        responded_at DATETIME,
        response_content TEXT,
        status TEXT DEFAULT 'draft',
        scheduled_for DATETIME,
        follow_up_date DATETIME,
        FOREIGN KEY (artist_id) REFERENCES artists(id)
    )`);

    // Email templates table
    db.run(`CREATE TABLE IF NOT EXISTS email_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        response_rate REAL DEFAULT 0,
        open_rate REAL DEFAULT 0,
        conversion_rate REAL DEFAULT 0,
        times_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // AB tests table
    db.run(`CREATE TABLE IF NOT EXISTS ab_tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_name TEXT,
        variant_a TEXT,
        variant_b TEXT,
        variant_a_sends INTEGER DEFAULT 0,
        variant_b_sends INTEGER DEFAULT 0,
        variant_a_opens INTEGER DEFAULT 0,
        variant_b_opens INTEGER DEFAULT 0,
        variant_a_responses INTEGER DEFAULT 0,
        variant_b_responses INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Analytics table
    db.run(`CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT,
        metric_value TEXT,
        date DATE DEFAULT CURRENT_DATE,
        additional_data TEXT
    )`);

    // Insert default email templates
    const defaultTemplates = [
        {
            id: 'personal',
            name: 'Personal Introduction',
            subject: "You're invited to shape the future of independent music",
            content: `Hi [ARTIST_NAME],

I've been following your music and I'm genuinely impressed by [SPECIFIC_SONG]. Your approach to [SPECIFIC_ASPECT] really resonates with what I'm building.

I'm Jason Ino, founder of Not a Label - a platform where independent artists keep 100% of their music revenue. No record deals, no middlemen, just direct connections between you and your fans.

I'm personally inviting 100 founding artists to help shape this platform, and I'd love for you to be one of them.

As a founding artist, you'll get:
• Lifetime reduced platform fees (10% vs standard 15%)
• Founding Artist badge and recognition
• Direct input on new features
• Priority support
• Early access to everything we build

Why I built this:
Every stream on Spotify pays $0.003. That means you need 1 million streams to earn $3,000. On Not a Label, selling 300 albums at $10 each earns the same amount - and you keep every dollar.

I believe artists like you deserve better. Interested in learning more?

Best,
Jason Ino
Founder, Not a Label
jason@not-a-label.art

P.S. - We're launching this week. Only [SPOTS_REMAINING] founding artist spots remain.`
        },
        {
            id: 'value',
            name: 'Value-Focused Pitch',
            subject: 'Keep 100% of your music revenue - Founding artist invitation',
            content: `Hi [ARTIST_NAME],

Quick question: What if you could earn $10,000 from 1,000 true fans instead of needing 3.3 million streams?

That's exactly what Not a Label enables. We're a direct-to-fan platform where independent artists keep 100% of their music sales revenue.

The math:
• Streaming: 3.3M streams = $10,000
• Not a Label: 1,000 fans × $10 album = $10,000 (all yours)

I'm personally inviting you to be one of our first 100 founding artists because [SPECIFIC_REASON].

Founding artist benefits:
✓ Lifetime 10% platform fee (vs 15% standard)
✓ Founding Artist badge
✓ Direct feature input  
✓ Priority support
✓ Early access to all tools

What we provide:
• Direct music sales (MP3, FLAC, vinyl pre-orders)
• AI career assistant for marketing advice
• Fan messaging and community tools
• NFT collectibles for super fans
• Transparent analytics

No upfront costs. We only succeed when you succeed.

Interested? Reply and I'll send you early access.

Jason Ino
Founder, Not a Label
not-a-label.art`
        },
        {
            id: 'followup',
            name: 'Follow-up Email',
            subject: 'Following up on Not a Label founding artist invitation',
            content: `Hi [ARTIST_NAME],

I reached out last week about joining Not a Label as a founding artist, but I know emails can get buried!

Just wanted to follow up because we're down to the final [SPOTS_REMAINING] founding artist spots, and I genuinely think you'd be a perfect fit based on [SPECIFIC_REASON].

Quick reminder of what's included:
• Keep 100% of your music sales revenue
• Lifetime 10% platform fee (vs 15% standard)
• Direct input on platform development
• Founding Artist recognition

If you're interested, just reply to this email and I'll send you early access.

If not, no worries at all - I understand you're busy creating amazing music!

Best,
Jason`
        }
    ];

    defaultTemplates.forEach(template => {
        db.run(`INSERT OR REPLACE INTO email_templates (id, name, subject, content) VALUES (?, ?, ?, ?)`,
            [template.id, template.name, template.subject, template.content]);
    });

    // Sample artists for testing
    const sampleArtists = [
        {
            name: 'Maya Chen',
            username: 'mayabeats',
            platform: 'instagram',
            genre: 'electronic',
            followers: 12500,
            engagement_rate: 8.4,
            last_post_date: '2024-01-27',
            recent_activity: 'Working on my new EP 🎧',
            email: 'maya@example.com',
            status: 'pending'
        },
        {
            name: 'Alex Rivers',
            username: 'alexriversmusic',
            platform: 'instagram',
            genre: 'folk',
            followers: 8200,
            engagement_rate: 12.1,
            last_post_date: '2024-01-28',
            recent_activity: 'Streaming payouts are brutal 😤',
            email: 'alex@example.com',
            status: 'sent'
        }
    ];

    sampleArtists.forEach(artist => {
        db.run(`INSERT OR REPLACE INTO artists (name, username, platform, genre, followers, engagement_rate, last_post_date, recent_activity, email, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [artist.name, artist.username, artist.platform, artist.genre, artist.followers, 
             artist.engagement_rate, artist.last_post_date, artist.recent_activity, artist.email, artist.status]);
    });
});

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'jason@not-a-label.art',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// API Routes

// Get dashboard metrics
app.get('/api/metrics', (req, res) => {
    const metrics = {};
    
    // Get artist counts
    db.get(`SELECT COUNT(*) as total FROM artists`, (err, row) => {
        metrics.totalArtists = row.total;
        
        db.get(`SELECT COUNT(*) as founding FROM artists WHERE status = 'converted'`, (err, row) => {
            metrics.foundingArtists = row.founding;
            
            db.get(`SELECT COUNT(*) as contacted FROM outreach_campaigns WHERE status = 'sent'`, (err, row) => {
                metrics.contacted = row.contacted;
                
                db.get(`SELECT COUNT(*) as responded FROM outreach_campaigns WHERE responded_at IS NOT NULL`, (err, row) => {
                    metrics.responded = row.responded;
                    metrics.responseRate = metrics.contacted > 0 ? Math.round((metrics.responded / metrics.contacted) * 100) : 0;
                    
                    res.json(metrics);
                });
            });
        });
    });
});

// Artist discovery and search
app.post('/api/artists/search', async (req, res) => {
    const { platform, genre, keywords, followerRange } = req.body;
    
    try {
        // Mock search results - in production, integrate with social media APIs
        const mockResults = [
            {
                name: 'Luna Park',
                username: 'lunaparkmusic',
                platform: platform,
                genre: genre || 'indie-pop',
                followers: Math.floor(Math.random() * 20000) + 5000,
                engagement_rate: (Math.random() * 10 + 2).toFixed(1),
                last_post_date: '2024-01-29',
                recent_activity: 'New single dropping this Friday! 🎵',
                email: null,
                profile_url: `https://${platform}.com/lunaparkmusic`,
                bio: 'Independent artist making dreamy indie pop',
                priority: Math.floor(Math.random() * 3) + 1
            },
            {
                name: 'Sam Rodriguez',
                username: 'samrodriguezbeats',
                platform: platform,
                genre: genre || 'hip-hop',
                followers: Math.floor(Math.random() * 15000) + 8000,
                engagement_rate: (Math.random() * 8 + 4).toFixed(1),
                last_post_date: '2024-01-28',
                recent_activity: 'Studio session vibes 🎤',
                email: null,
                profile_url: `https://${platform}.com/samrodriguezbeats`,
                bio: 'Hip-hop producer and artist from LA',
                priority: Math.floor(Math.random() * 3) + 1
            }
        ];
        
        res.json(mockResults);
    } catch (error) {
        res.status(500).json({ error: 'Search failed', details: error.message });
    }
});

// Add artist to database
app.post('/api/artists', (req, res) => {
    const { name, username, platform, genre, followers, engagement_rate, email, profile_url, bio, recent_activity } = req.body;
    
    db.run(`INSERT INTO artists (name, username, platform, genre, followers, engagement_rate, email, profile_url, bio, recent_activity, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'discovered')`,
        [name, username, platform, genre, followers, engagement_rate, email, profile_url, bio, recent_activity],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Artist added successfully' });
        });
});

// Get outreach queue
app.get('/api/outreach/queue', (req, res) => {
    db.all(`SELECT a.*, c.id as campaign_id, c.template_id, c.status as campaign_status, c.sent_at, c.responded_at
            FROM artists a 
            LEFT JOIN outreach_campaigns c ON a.id = c.artist_id
            WHERE a.status IN ('pending', 'sent', 'responded', 'converted')
            ORDER BY a.priority DESC, a.created_at ASC`,
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        });
});

// Add artist to outreach queue
app.post('/api/outreach/queue', (req, res) => {
    const { artistId, templateId, priority } = req.body;
    
    // Update artist status
    db.run(`UPDATE artists SET status = 'pending', priority = ? WHERE id = ?`, [priority || 2, artistId]);
    
    // Create campaign draft
    db.run(`INSERT INTO outreach_campaigns (artist_id, template_id, status) VALUES (?, ?, 'draft')`,
        [artistId, templateId || 'personal'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ campaignId: this.lastID, message: 'Added to outreach queue' });
        });
});

// Get email templates
app.get('/api/templates', (req, res) => {
    db.all(`SELECT * FROM email_templates ORDER BY times_used DESC`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Send email
app.post('/api/outreach/send', async (req, res) => {
    const { campaignId, artistId, templateId, customSubject, customContent, recipientEmail } = req.body;
    
    try {
        // Get artist and template data
        const artist = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM artists WHERE id = ?`, [artistId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        const template = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM email_templates WHERE id = ?`, [templateId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!artist || !template) {
            return res.status(404).json({ error: 'Artist or template not found' });
        }
        
        // Personalize email content
        const foundingArtistsCount = await new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as count FROM artists WHERE status = 'converted'`, (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });
        
        const spotsRemaining = 100 - foundingArtistsCount;
        
        let subject = customSubject || template.subject;
        let content = customContent || template.content;
        
        // Replace placeholders
        const replacements = {
            '[ARTIST_NAME]': artist.name,
            '[SPECIFIC_SONG]': artist.recent_activity || 'your latest release',
            '[SPECIFIC_ASPECT]': artist.genre || 'your music',
            '[SPECIFIC_REASON]': `your ${artist.genre} style and ${artist.followers} engaged followers`,
            '[SPOTS_REMAINING]': spotsRemaining
        };
        
        Object.entries(replacements).forEach(([placeholder, value]) => {
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
            content = content.replace(new RegExp(placeholder, 'g'), value);
        });
        
        // Send email (mock for now - replace with real email service)
        const emailData = {
            from: '"Jason Ino - Not a Label" <jason@not-a-label.art>',
            to: recipientEmail || artist.email,
            subject: subject,
            text: content,
            html: content.replace(/\n/g, '<br>')
        };
        
        // Simulate email sending (in production, use real transporter)
        console.log('Sending email:', emailData);
        
        // Update campaign
        db.run(`UPDATE outreach_campaigns SET 
                subject = ?, content = ?, status = 'sent', sent_at = CURRENT_TIMESTAMP 
                WHERE id = ?`, [subject, content, campaignId]);
        
        // Update artist status
        db.run(`UPDATE artists SET status = 'sent' WHERE id = ?`, [artistId]);
        
        // Update template usage
        db.run(`UPDATE email_templates SET times_used = times_used + 1 WHERE id = ?`, [templateId]);
        
        res.json({ message: 'Email sent successfully', emailData });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

// Analytics endpoints
app.get('/api/analytics/overview', (req, res) => {
    const analytics = {};
    
    // Get campaign stats
    db.all(`SELECT 
                COUNT(*) as total_campaigns,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
                COUNT(CASE WHEN responded_at IS NOT NULL THEN 1 END) as responded,
                ROUND(COUNT(CASE WHEN responded_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(CASE WHEN status = 'sent' THEN 1 END), 1) as response_rate
            FROM outreach_campaigns`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        analytics.campaigns = rows[0];
        
        // Get conversion funnel
        db.all(`SELECT 
                    COUNT(CASE WHEN status = 'discovered' THEN 1 END) as discovered,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as queued,
                    COUNT(CASE WHEN status = 'sent' THEN 1 END) as contacted,
                    COUNT(CASE WHEN status = 'responded' THEN 1 END) as responded,
                    COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted
                FROM artists`, (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            analytics.funnel = rows[0];
            res.json(analytics);
        });
    });
});

// Get best performing templates
app.get('/api/analytics/templates', (req, res) => {
    db.all(`SELECT t.*, 
                COUNT(c.id) as campaigns_sent,
                COUNT(CASE WHEN c.responded_at IS NOT NULL THEN 1 END) as responses,
                ROUND(COUNT(CASE WHEN c.responded_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(c.id), 1) as response_rate
            FROM email_templates t
            LEFT JOIN outreach_campaigns c ON t.id = c.template_id AND c.status = 'sent'
            GROUP BY t.id
            ORDER BY response_rate DESC`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// A/B testing endpoints
app.post('/api/ab-tests', (req, res) => {
    const { testName, variantA, variantB } = req.body;
    
    db.run(`INSERT INTO ab_tests (test_name, variant_a, variant_b) VALUES (?, ?, ?)`,
        [testName, variantA, variantB],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'A/B test created' });
        });
});

app.get('/api/ab-tests', (req, res) => {
    db.all(`SELECT * FROM ab_tests WHERE status = 'active' ORDER BY created_at DESC`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Mock artist response (for testing)
app.post('/api/outreach/mock-response', (req, res) => {
    const { campaignId, responseContent, interested } = req.body;
    
    db.run(`UPDATE outreach_campaigns SET 
            responded_at = CURRENT_TIMESTAMP, 
            response_content = ?
            WHERE id = ?`, [responseContent, campaignId]);
    
    if (interested) {
        db.run(`UPDATE artists SET status = 'responded' WHERE id = (
                    SELECT artist_id FROM outreach_campaigns WHERE id = ?
                )`, [campaignId]);
    }
    
    res.json({ message: 'Response recorded' });
});

// Convert artist to founding member
app.post('/api/artists/:id/convert', (req, res) => {
    const artistId = req.params.id;
    
    db.run(`UPDATE artists SET status = 'converted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [artistId],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Artist converted to founding member' });
        });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`🚀 Outreach API running on port ${PORT}`);
    console.log(`🎯 Endpoints available at http://localhost:${PORT}/api/`);
});

module.exports = app;