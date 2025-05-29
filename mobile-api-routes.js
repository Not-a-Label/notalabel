const express = require('express');
const router = express.Router();
const db = require('./db');
const authMiddleware = require('./authMiddleware');
const multer = require('multer');
const webpush = require('web-push');

// Configure web push
webpush.setVapidDetails(
  'mailto:admin@not-a-label.art',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Get offline music tracks
router.get('/music/tracks', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const tracks = await db.all(`
      SELECT 
        t.*,
        a.name as artist,
        al.name as album,
        COUNT(p.id) as playCount,
        MAX(p.played_at) as lastPlayed
      FROM tracks t
      LEFT JOIN artists a ON t.artist_id = a.id
      LEFT JOIN albums al ON t.album_id = al.id
      LEFT JOIN plays p ON t.id = p.track_id AND p.user_id = ?
      WHERE t.user_id = ? OR t.public = 1
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [userId, userId]);
    
    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download track for offline playback
router.get('/music/download/:trackId', authMiddleware, async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.id;
    
    // Get track details
    const track = await db.get(
      'SELECT * FROM tracks WHERE id = ?',
      [trackId]
    );
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Check access permissions
    if (track.user_id !== userId && !track.public) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Log download
    await db.run(`
      INSERT INTO downloads (user_id, track_id, downloaded_at)
      VALUES (?, ?, datetime('now'))
    `, [userId, trackId]);
    
    // Stream file from storage
    res.sendFile(track.file_path);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to push notifications
router.post('/notifications/subscribe', authMiddleware, async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;
    
    // Save subscription to database
    await db.run(`
      INSERT OR REPLACE INTO push_subscriptions (
        user_id, endpoint, keys, created_at
      ) VALUES (?, ?, ?, datetime('now'))
    `, [
      userId,
      subscription.endpoint,
      JSON.stringify(subscription.keys)
    ]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification preferences
router.get('/notifications/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const preferences = await db.get(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );
    
    res.json({ 
      preferences: preferences || getDefaultPreferences(),
      quietHours: preferences?.quiet_hours ? JSON.parse(preferences.quiet_hours) : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update notification preferences
router.post('/notifications/preferences', authMiddleware, async (req, res) => {
  try {
    const { preferences, quietHours } = req.body;
    const userId = req.user.id;
    
    await db.run(`
      INSERT OR REPLACE INTO notification_preferences (
        user_id, preferences, quiet_hours, updated_at
      ) VALUES (?, ?, ?, datetime('now'))
    `, [
      userId,
      JSON.stringify(preferences),
      JSON.stringify(quietHours)
    ]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notifications
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = 'all' } = req.query;
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    
    if (filter === 'unread') {
      query += ' AND read = 0';
    } else if (filter !== 'all') {
      query += ' AND type = ?';
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const params = filter !== 'all' && filter !== 'unread' 
      ? [userId, filter] 
      : [userId];
    
    const notifications = await db.all(query, params);
    
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stream notifications (Server-Sent Events)
router.get('/notifications/stream', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Send initial ping
  res.write('data: {"type":"ping"}\n\n');
  
  // Set up listener for new notifications
  const interval = setInterval(async () => {
    try {
      const notification = await db.get(`
        SELECT * FROM notifications 
        WHERE user_id = ? AND sent = 0
        ORDER BY created_at DESC
        LIMIT 1
      `, [userId]);
      
      if (notification) {
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
        
        // Mark as sent
        await db.run(
          'UPDATE notifications SET sent = 1 WHERE id = ?',
          [notification.id]
        );
        
        // Send push notification
        await sendPushNotification(userId, notification);
      }
    } catch (error) {
      console.error('SSE error:', error);
    }
  }, 5000); // Check every 5 seconds
  
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Upload recording
router.post('/recordings/upload', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const { name, duration } = req.body;
    const userId = req.user.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Save to storage
    const fileName = `recording_${userId}_${Date.now()}.webm`;
    const filePath = `/storage/recordings/${fileName}`;
    
    // Save file (simplified - in production use cloud storage)
    await saveFile(filePath, file.buffer);
    
    // Save to database
    const result = await db.run(`
      INSERT INTO recordings (
        user_id, name, file_path, duration, size, created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [userId, name, filePath, duration, file.size]);
    
    res.json({ 
      success: true,
      recordingId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user recordings
router.get('/recordings', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recordings = await db.all(`
      SELECT * FROM recordings
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    
    res.json({ recordings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share content
router.post('/share/post', authMiddleware, async (req, res) => {
  try {
    const { platforms, content, caption, hashtags } = req.body;
    const userId = req.user.id;
    
    // Create share record
    const result = await db.run(`
      INSERT INTO shares (
        user_id, content_type, content_id, platforms,
        caption, hashtags, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      userId,
      content.type,
      content.id,
      JSON.stringify(platforms),
      caption,
      JSON.stringify(hashtags)
    ]);
    
    // Post to each platform
    for (const platform of platforms) {
      await postToPlatform(platform, {
        content,
        caption,
        hashtags,
        userId
      });
    }
    
    res.json({ 
      success: true,
      shareId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule share
router.post('/share/schedule', authMiddleware, async (req, res) => {
  try {
    const { platforms, content, caption, hashtags, scheduledTime } = req.body;
    const userId = req.user.id;
    
    const result = await db.run(`
      INSERT INTO scheduled_shares (
        user_id, content_type, content_id, platforms,
        caption, hashtags, scheduled_for, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      userId,
      content.type,
      content.id,
      JSON.stringify(platforms),
      caption,
      JSON.stringify(hashtags),
      scheduledTime
    ]);
    
    res.json({ 
      success: true,
      scheduleId: result.lastID
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get share templates
router.get('/share/templates', authMiddleware, async (req, res) => {
  try {
    const templates = await db.all(`
      SELECT * FROM share_templates
      WHERE user_id = ? OR public = 1
      ORDER BY uses DESC
    `, [req.user.id]);
    
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get share analytics
router.get('/share/analytics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const analytics = await db.all(`
      SELECT 
        platform,
        COUNT(*) as shares,
        SUM(clicks) as clicks,
        AVG(engagement_rate) as engagement,
        MAX(created_at) as lastShare
      FROM share_analytics
      WHERE user_id = ?
      GROUP BY platform
    `, [userId]);
    
    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function sendPushNotification(userId, notification) {
  try {
    // Get user's push subscriptions
    const subscriptions = await db.all(
      'SELECT * FROM push_subscriptions WHERE user_id = ?',
      [userId]
    );
    
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: notification.data ? JSON.parse(notification.data) : {}
    });
    
    // Send to all subscriptions
    const promises = subscriptions.map(sub => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: JSON.parse(sub.keys)
      };
      
      return webpush.sendNotification(subscription, payload)
        .catch(error => {
          if (error.statusCode === 410) {
            // Subscription expired, remove it
            db.run(
              'DELETE FROM push_subscriptions WHERE id = ?',
              [sub.id]
            );
          }
        });
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Push notification error:', error);
  }
}

async function postToPlatform(platform, data) {
  // Platform-specific posting logic
  switch (platform) {
    case 'instagram':
      // Use Instagram API
      break;
    case 'twitter':
      // Use Twitter API
      break;
    case 'facebook':
      // Use Facebook API
      break;
    // ... other platforms
  }
}

function getDefaultPreferences() {
  return {
    messages: { enabled: true, push: true, email: true, sms: false },
    likes: { enabled: true, push: true, email: false, sms: false },
    releases: { enabled: true, push: true, email: true, sms: true },
    analytics: { enabled: true, push: false, email: true, sms: false },
    events: { enabled: true, push: true, email: true, sms: true },
    collaborations: { enabled: true, push: true, email: true, sms: false },
    revenue: { enabled: true, push: true, email: true, sms: false },
    achievements: { enabled: true, push: true, email: false, sms: false }
  };
}

async function saveFile(path, buffer) {
  // In production, use cloud storage (S3, GCS, etc.)
  // For now, simplified local storage
  const fs = require('fs').promises;
  const dir = require('path').dirname(path);
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path, buffer);
}

module.exports = router;