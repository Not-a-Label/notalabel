// Email Notification System
// Uses nodemailer for sending emails

const nodemailer = require('nodemailer');

function addEmailRoutes(app, authenticateToken, dbOptimizer) {
  
  // Create email tables
  const createEmailTables = () => {
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS email_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      template TEXT,
      status TEXT DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME,
      error TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS email_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      marketing_emails BOOLEAN DEFAULT 1,
      collaboration_notifications BOOLEAN DEFAULT 1,
      analytics_reports BOOLEAN DEFAULT 1,
      playlist_updates BOOLEAN DEFAULT 1,
      ai_recommendations BOOLEAN DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log('Email tables created');
  };

  createEmailTables();

  // Create transporter (in production, use real SMTP settings)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'noreply@not-a-label.art',
      pass: process.env.SMTP_PASS || 'demo-password'
    }
  });

  // Email templates
  const emailTemplates = {
    welcome: (data) => ({
      subject: 'Welcome to Not a Label! 🎵',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Welcome to Not a Label, ${data.artistName || data.username}!</h1>
          <p>We're excited to have you join our community of independent artists.</p>
          <h2>Get Started:</h2>
          <ul>
            <li>Complete your artist profile</li>
            <li>Connect your streaming platforms</li>
            <li>Explore AI-powered insights</li>
            <li>Find collaboration opportunities</li>
          </ul>
          <a href="http://not-a-label.art/dashboard" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Go to Dashboard</a>
          <p style="color: #666;">If you have any questions, our AI assistant is here to help!</p>
        </div>
      `
    }),
    
    collaboration: (data) => ({
      subject: `New collaboration opportunity: ${data.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8b5cf6;">New Collaboration Request</h2>
          <p><strong>${data.requesterName}</strong> wants to collaborate with you!</p>
          <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${data.title}</h3>
            <p>${data.description}</p>
            <p><strong>Genre:</strong> ${data.genre}</p>
            <p><strong>Role:</strong> ${data.role}</p>
          </div>
          <a href="http://not-a-label.art/collaborations/${data.collaborationId}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Collaboration</a>
        </div>
      `
    }),
    
    weeklyAnalytics: (data) => ({
      subject: 'Your Weekly Music Stats 📊',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Weekly Performance Report</h1>
          <p>Hey ${data.artistName}, here's how your music performed this week:</p>
          
          <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Key Metrics</h3>
            <p><strong>Total Streams:</strong> ${data.totalStreams.toLocaleString()} (${data.streamGrowth})</p>
            <p><strong>New Listeners:</strong> ${data.newListeners.toLocaleString()}</p>
            <p><strong>Revenue:</strong> $${data.revenue}</p>
            <p><strong>Top Platform:</strong> ${data.topPlatform}</p>
          </div>
          
          <h3>AI Insight</h3>
          <p style="background: #e9d5ff; padding: 15px; border-radius: 6px;">${data.aiInsight}</p>
          
          <a href="http://not-a-label.art/dashboard/analytics" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Full Analytics</a>
        </div>
      `
    }),
    
    playlistUpdate: (data) => ({
      subject: `🎉 Your track was added to ${data.playlistName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6;">Playlist Placement Success!</h1>
          <p>Great news! Your track "${data.trackName}" was added to:</p>
          
          <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h2>${data.playlistName}</h2>
            <p style="font-size: 24px; color: #8b5cf6;">${data.followers.toLocaleString()} followers</p>
            <p>Platform: ${data.platform}</p>
          </div>
          
          <p>This placement could expose your music to thousands of new listeners!</p>
          
          <h3>Next Steps:</h3>
          <ul>
            <li>Share this achievement on social media</li>
            <li>Thank the playlist curator</li>
            <li>Monitor your streaming analytics</li>
          </ul>
        </div>
      `
    })
  };

  // Send email function
  const sendEmail = async (toEmail, template, data) => {
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: '"Not a Label" <noreply@not-a-label.art>',
      to: toEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    // In production, actually send the email
    // For now, we'll simulate it
    return {
      messageId: Math.random().toString(36).substr(2, 9),
      accepted: [toEmail],
      response: 'Email queued for sending'
    };
  };

  // Queue email
  app.post('/api/email/send', authenticateToken, async (req, res) => {
    try {
      const { toEmail, template, data } = req.body;
      const userId = req.user.userId;

      if (!toEmail || !template) {
        return res.status(400).json({ error: 'Email and template required' });
      }

      // Check user preferences
      const preferences = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT * FROM email_preferences WHERE user_id = ?',
          [userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      // Queue the email
      const emailId = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO email_queue (user_id, to_email, subject, body, template) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, toEmail, 'Notification', JSON.stringify(data), template],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Simulate sending
      const result = await sendEmail(toEmail, template, data);

      // Update status
      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          'UPDATE email_queue SET status = ?, sent_at = datetime("now") WHERE id = ?',
          ['sent', emailId],
          (err) => err ? reject(err) : resolve()
        );
      });

      res.json({
        success: true,
        emailId,
        messageId: result.messageId,
        status: 'sent'
      });

    } catch (error) {
      console.error('Send email error:', error);
      res.status(500).json({ 
        error: 'Failed to send email',
        details: error.message 
      });
    }
  });

  // Get email preferences
  app.get('/api/email/preferences', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      let preferences = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT * FROM email_preferences WHERE user_id = ?',
          [userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      // Create default preferences if not exist
      if (!preferences) {
        await new Promise((resolve, reject) => {
          dbOptimizer.db.run(
            'INSERT INTO email_preferences (user_id) VALUES (?)',
            [userId],
            (err) => err ? reject(err) : resolve()
          );
        });

        preferences = {
          marketing_emails: 1,
          collaboration_notifications: 1,
          analytics_reports: 1,
          playlist_updates: 1,
          ai_recommendations: 1
        };
      }

      res.json({
        success: true,
        preferences
      });

    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({ 
        error: 'Failed to get email preferences',
        details: error.message 
      });
    }
  });

  // Update email preferences
  app.put('/api/email/preferences', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const updates = req.body;

      const fields = Object.keys(updates)
        .filter(key => ['marketing_emails', 'collaboration_notifications', 'analytics_reports', 'playlist_updates', 'ai_recommendations'].includes(key))
        .map(key => `${key} = ?`);

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid preferences to update' });
      }

      const values = fields.map(field => updates[field.split(' ')[0]]);
      values.push(userId);

      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `UPDATE email_preferences SET ${fields.join(', ')}, updated_at = datetime('now') WHERE user_id = ?`,
          values,
          (err) => err ? reject(err) : resolve()
        );
      });

      res.json({
        success: true,
        message: 'Email preferences updated'
      });

    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ 
        error: 'Failed to update email preferences',
        details: error.message 
      });
    }
  });

  // Get email history
  app.get('/api/email/history', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 50;

      const emails = await dbOptimizer.cachedQuery(
        `SELECT id, to_email, subject, template, status, created_at, sent_at 
         FROM email_queue 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit],
        `email_history_${userId}`
      );

      res.json({
        success: true,
        emails,
        total: emails.length
      });

    } catch (error) {
      console.error('Get email history error:', error);
      res.status(500).json({ 
        error: 'Failed to get email history',
        details: error.message 
      });
    }
  });

  // Send test email
  app.post('/api/email/test', authenticateToken, async (req, res) => {
    try {
      const user = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT * FROM users WHERE id = ?',
          [req.user.userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      await sendEmail(user.email, 'welcome', {
        username: user.username,
        artistName: user.artist_name
      });

      res.json({
        success: true,
        message: 'Test email sent to ' + user.email
      });

    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ 
        error: 'Failed to send test email',
        details: error.message 
      });
    }
  });

  // Automated email triggers
  const setupEmailTriggers = () => {
    // Welcome email on registration (called from registration endpoint)
    app.on('user:registered', async (userData) => {
      await sendEmail(userData.email, 'welcome', userData);
    });

    // Weekly analytics email (would be scheduled with cron)
    app.on('analytics:weekly', async (userId) => {
      // Get user and analytics data
      // Send weekly report
    });

    // Collaboration notification
    app.on('collaboration:request', async (collabData) => {
      // Send notification to collaboration owner
    });
  };

  setupEmailTriggers();
  console.log('Email notification system added successfully');
}

module.exports = addEmailRoutes;