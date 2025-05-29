// Enhanced Analytics Backend Endpoints
// Add these to the backend index.js

// Analytics table for storing user interaction data
db.run(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_name TEXT NOT NULL,
    event_category TEXT NOT NULL,
    event_label TEXT,
    event_value INTEGER,
    page_path TEXT,
    user_agent TEXT,
    ip_address TEXT,
    session_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Track analytics event
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { 
      eventName, 
      eventCategory, 
      eventLabel, 
      eventValue, 
      pagePath, 
      sessionId 
    } = req.body;
    
    // Get user ID if authenticated
    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notalabel-secret-key');
        userId = decoded.id;
      } catch (err) {
        // Anonymous tracking is fine
      }
    }
    
    // Get client info
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    db.run(
      `INSERT INTO analytics_events 
       (user_id, event_name, event_category, event_label, event_value, page_path, user_agent, ip_address, session_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, eventName, eventCategory, eventLabel, eventValue, pagePath, userAgent, ipAddress, sessionId],
      function(err) {
        if (err) {
          console.error('Analytics tracking error:', err);
          return res.status(500).json({ error: 'Failed to track event' });
        }
        
        res.json({ success: true, eventId: this.lastID });
      }
    );
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get advanced analytics data
app.get('/api/analytics/advanced', authenticateToken, async (req, res) => {
  try {
    const { timeRange = 'weekly', platform = 'all' } = req.query;
    const userId = req.user.id;
    
    // Calculate date range
    let dateFilter = '';
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'daily':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    dateFilter = `AND created_at >= '${startDate.toISOString()}'`;
    
    // Get marketing posts analytics
    const getPostsAnalytics = () => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT 
             COUNT(*) as total_posts,
             COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
             COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts,
             COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_posts,
             platform,
             COUNT(*) as platform_posts
           FROM marketing_posts 
           WHERE user_id = ? ${dateFilter}
           GROUP BY platform`,
          [userId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
    };
    
    // Get analytics events
    const getEventsAnalytics = () => {
      return new Promise((resolve, reject) => {
        db.all(
          `SELECT 
             event_category,
             event_name,
             COUNT(*) as event_count,
             DATE(timestamp) as event_date
           FROM analytics_events 
           WHERE user_id = ? ${dateFilter.replace('created_at', 'timestamp')}
           GROUP BY event_category, event_name, DATE(timestamp)
           ORDER BY timestamp DESC`,
          [userId],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });
    };
    
    // Get feedback analytics
    const getFeedbackAnalytics = () => {
      return new Promise((resolve, reject) => {
        db.get(
          `SELECT 
             COUNT(*) as total_feedback,
             AVG(rating) as average_rating,
             COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_feedback
           FROM feedback 
           WHERE user_id = ? OR user_id IS NULL`,
          [userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    };
    
    // Execute all queries
    const [postsData, eventsData, feedbackData] = await Promise.all([
      getPostsAnalytics(),
      getEventsAnalytics(), 
      getFeedbackAnalytics()
    ]);
    
    // Process platform data
    const platforms = {};
    let totalPosts = 0, totalReach = 0, totalEngagement = 0;
    
    postsData.forEach(row => {
      if (row.platform) {
        platforms[row.platform] = {
          posts: row.platform_posts,
          reach: Math.floor(Math.random() * 5000) + 1000, // Mock data for demo
          engagement: Math.floor(Math.random() * 500) + 100,
          followers: Math.floor(Math.random() * 2000) + 500
        };
        totalPosts += row.platform_posts;
        totalReach += platforms[row.platform].reach;
        totalEngagement += platforms[row.platform].engagement;
      }
    });
    
    // Generate time series data
    const timeSeriesData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      timeSeriesData.push({
        date: date.toISOString().split('T')[0],
        posts: Math.floor(Math.random() * 5) + 1,
        reach: Math.floor(Math.random() * 1000) + 500,
        engagement: Math.floor(Math.random() * 100) + 20
      });
    }
    
    // Get top posts (with mock engagement data)
    const topPosts = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, content, platform, created_at 
         FROM marketing_posts 
         WHERE user_id = ? ${dateFilter}
         ORDER BY created_at DESC 
         LIMIT 5`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else {
            const enhancedPosts = rows.map(post => ({
              ...post,
              reach: Math.floor(Math.random() * 3000) + 500,
              engagement: Math.floor(Math.random() * 300) + 50,
              date: post.created_at
            }));
            resolve(enhancedPosts);
          }
        }
      );
    });
    
    // Compile response
    const analyticsData = {
      overview: {
        totalPosts: totalPosts || 0,
        totalReach: totalReach || 0,
        totalEngagement: totalEngagement || 0,
        avgEngagementRate: totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : 0,
        growthRate: 23.5 // Mock growth rate
      },
      platforms: platforms,
      timeRange: {
        [timeRange]: timeSeriesData
      },
      topPosts: topPosts,
      audienceInsights: {
        demographics: {
          ageGroups: {
            '18-24': 35,
            '25-34': 42,
            '35-44': 18,
            '45+': 5
          },
          locations: {
            'United States': 45,
            'United Kingdom': 20,
            'Canada': 15,
            'Australia': 10,
            'Other': 10
          },
          interests: {
            'Independent Music': 85,
            'Music Production': 65,
            'Live Music': 55,
            'Music Marketing': 45
          }
        },
        bestTimes: {
          days: {
            'Monday': 15,
            'Tuesday': 12,
            'Wednesday': 8,
            'Thursday': 18,
            'Friday': 25,
            'Saturday': 20,
            'Sunday': 2
          },
          hours: {
            '9AM': 5,
            '12PM': 15,
            '3PM': 20,
            '6PM': 25,
            '9PM': 20,
            '12AM': 15
          }
        }
      },
      events: eventsData,
      feedback: feedbackData
    };
    
    res.json(analyticsData);
    
  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get real-time analytics summary
app.get('/api/analytics/realtime', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  // Get last 24 hours activity
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  db.all(
    `SELECT 
       event_category,
       COUNT(*) as count
     FROM analytics_events 
     WHERE user_id = ? AND timestamp >= ?
     GROUP BY event_category`,
    [userId, yesterday],
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Get recent posts
      db.all(
        `SELECT COUNT(*) as recent_posts 
         FROM marketing_posts 
         WHERE user_id = ? AND created_at >= ?`,
        [userId, yesterday],
        (err, posts) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json({
            realtime: {
              activeUsers: Math.floor(Math.random() * 50) + 10,
              pageViews: Math.floor(Math.random() * 200) + 50,
              events: events,
              recentPosts: posts[0]?.recent_posts || 0,
              timestamp: new Date().toISOString()
            }
          });
        }
      );
    }
  );
});