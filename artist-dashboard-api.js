// Artist Dashboard API endpoints
function addDashboardRoutes(app, authenticateToken, dbOptimizer) {
  
  // Get dashboard overview
  app.get('/api/dashboard/overview', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Get user profile
      const userProfile = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT username, email, artist_name, genre, verified, created_at FROM users WHERE id = ?',
          [userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      // Get analytics summary
      const analyticsData = await dbOptimizer.cachedQuery(
        `SELECT 
          COUNT(*) as total_events,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          MAX(created_at) as last_activity
        FROM analytics 
        WHERE user_id = ? AND created_at >= datetime('now', '-30 days')`,
        [userId],
        `dashboard_analytics_${userId}`
      );

      // Get feedback count
      const feedbackCount = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT COUNT(*) as count FROM feedback WHERE user_id = ?',
          [userId],
          (err, row) => err ? reject(err) : resolve(row.count)
        );
      });

      // Mock streaming data (would integrate with real APIs)
      const streamingStats = {
        spotify: {
          monthlyListeners: Math.floor(Math.random() * 5000) + 100,
          streams: Math.floor(Math.random() * 50000) + 1000,
          playlists: Math.floor(Math.random() * 20) + 1
        },
        youtube: {
          subscribers: Math.floor(Math.random() * 2000) + 50,
          views: Math.floor(Math.random() * 100000) + 5000,
          videos: Math.floor(Math.random() * 50) + 5
        },
        soundcloud: {
          followers: Math.floor(Math.random() * 1000) + 50,
          plays: Math.floor(Math.random() * 20000) + 500
        }
      };

      // Calculate growth metrics
      const growth = {
        monthlyGrowth: '+' + (Math.random() * 30 + 5).toFixed(1) + '%',
        weeklyActive: analyticsData[0].active_days,
        engagementRate: (Math.random() * 5 + 2).toFixed(1) + '%'
      };

      res.json({
        success: true,
        profile: userProfile,
        stats: {
          totalEvents: analyticsData[0].total_events,
          activeDays: analyticsData[0].active_days,
          lastActivity: analyticsData[0].last_activity,
          feedbackReceived: feedbackCount
        },
        streaming: streamingStats,
        growth,
        aiAssistantAvailable: true
      });

    } catch (error) {
      console.error('Dashboard overview error:', error);
      res.status(500).json({ 
        error: 'Failed to load dashboard',
        details: error.message 
      });
    }
  });

  // Get detailed analytics
  app.get('/api/dashboard/analytics', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const days = parseInt(req.query.days) || 30;
      
      // Get daily analytics
      const dailyAnalytics = await dbOptimizer.cachedQuery(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as events,
          COUNT(DISTINCT event_type) as event_types
        FROM analytics 
        WHERE user_id = ? AND created_at >= datetime('now', '-${days} days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC`,
        [userId],
        `daily_analytics_${userId}_${days}`
      );

      // Get event type breakdown
      const eventBreakdown = await dbOptimizer.cachedQuery(
        `SELECT 
          event_type,
          COUNT(*) as count
        FROM analytics 
        WHERE user_id = ? AND created_at >= datetime('now', '-${days} days')
        GROUP BY event_type
        ORDER BY count DESC`,
        [userId],
        `event_breakdown_${userId}_${days}`
      );

      // Generate chart data
      const chartData = {
        timeline: dailyAnalytics.map(day => ({
          date: day.date,
          value: day.events
        })),
        eventTypes: eventBreakdown.map(event => ({
          name: event.event_type,
          value: event.count
        }))
      };

      res.json({
        success: true,
        period: `${days} days`,
        analytics: dailyAnalytics,
        breakdown: eventBreakdown,
        chartData
      });

    } catch (error) {
      console.error('Analytics detail error:', error);
      res.status(500).json({ 
        error: 'Failed to load analytics',
        details: error.message 
      });
    }
  });

  // Get fan insights (mock data)
  app.get('/api/dashboard/fan-insights', authenticateToken, async (req, res) => {
    try {
      // Mock fan demographics
      const demographics = {
        topCountries: [
          { country: 'United States', percentage: 35 },
          { country: 'United Kingdom', percentage: 18 },
          { country: 'Canada', percentage: 12 },
          { country: 'Germany', percentage: 8 },
          { country: 'Australia', percentage: 7 }
        ],
        ageGroups: [
          { range: '18-24', percentage: 45 },
          { range: '25-34', percentage: 30 },
          { range: '35-44', percentage: 15 },
          { range: '45+', percentage: 10 }
        ],
        gender: {
          male: 58,
          female: 40,
          other: 2
        },
        topCities: [
          'Los Angeles', 'London', 'New York', 'Toronto', 'Berlin'
        ]
      };

      // Mock engagement metrics
      const engagement = {
        averageListenTime: '3:45',
        repeatListeners: 68,
        shareRate: 12,
        saveRate: 24,
        commentRate: 8
      };

      res.json({
        success: true,
        demographics,
        engagement,
        totalFans: Math.floor(Math.random() * 10000) + 1000,
        activeFans: Math.floor(Math.random() * 5000) + 500
      });

    } catch (error) {
      console.error('Fan insights error:', error);
      res.status(500).json({ 
        error: 'Failed to load fan insights',
        details: error.message 
      });
    }
  });

  // Get revenue analytics (mock data)
  app.get('/api/dashboard/revenue', authenticateToken, async (req, res) => {
    try {
      const months = ['January', 'February', 'March', 'April', 'May'];
      const currentMonth = months[new Date().getMonth()] || 'Current Month';

      // Mock revenue data
      const revenue = {
        total: (Math.random() * 5000 + 500).toFixed(2),
        thisMonth: (Math.random() * 1000 + 100).toFixed(2),
        lastMonth: (Math.random() * 1000 + 100).toFixed(2),
        sources: [
          { source: 'Spotify', amount: (Math.random() * 500 + 50).toFixed(2), percentage: 35 },
          { source: 'Apple Music', amount: (Math.random() * 400 + 40).toFixed(2), percentage: 28 },
          { source: 'YouTube', amount: (Math.random() * 300 + 30).toFixed(2), percentage: 20 },
          { source: 'Merchandise', amount: (Math.random() * 200 + 20).toFixed(2), percentage: 12 },
          { source: 'Live Shows', amount: (Math.random() * 100 + 10).toFixed(2), percentage: 5 }
        ],
        monthlyTrend: months.map(month => ({
          month,
          amount: (Math.random() * 1000 + 200).toFixed(2)
        })),
        projectedNext: (Math.random() * 1500 + 300).toFixed(2)
      };

      res.json({
        success: true,
        revenue,
        currency: 'USD',
        period: currentMonth
      });

    } catch (error) {
      console.error('Revenue analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to load revenue data',
        details: error.message 
      });
    }
  });

  // Get upcoming opportunities
  app.get('/api/dashboard/opportunities', authenticateToken, async (req, res) => {
    try {
      // Mock opportunities based on genre
      const opportunities = [
        {
          type: 'playlist',
          title: 'Submit to Fresh Hip-Hop Weekly',
          description: 'Popular Spotify playlist accepting submissions',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          potential: 'High',
          action: 'Submit Track'
        },
        {
          type: 'collaboration',
          title: 'Producer seeking hip-hop artists',
          description: 'Grammy-nominated producer looking for features',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          potential: 'Medium',
          action: 'Send Demo'
        },
        {
          type: 'performance',
          title: 'Local Music Festival Applications Open',
          description: 'Summer festival accepting artist applications',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          potential: 'High',
          action: 'Apply Now'
        },
        {
          type: 'contest',
          title: 'Independent Artist Awards 2025',
          description: 'Annual awards for independent musicians',
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          potential: 'Medium',
          action: 'Enter Contest'
        }
      ];

      res.json({
        success: true,
        opportunities,
        totalOpportunities: opportunities.length,
        newThisWeek: 2
      });

    } catch (error) {
      console.error('Opportunities error:', error);
      res.status(500).json({ 
        error: 'Failed to load opportunities',
        details: error.message 
      });
    }
  });

  // Update artist goals
  app.post('/api/dashboard/goals', authenticateToken, async (req, res) => {
    try {
      const { goals } = req.body;
      const userId = req.user.userId;

      // Store goals in analytics
      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
          ['goals_updated', userId, JSON.stringify(goals)],
          (err) => err ? reject(err) : resolve()
        );
      });

      res.json({
        success: true,
        message: 'Goals updated successfully',
        goals
      });

    } catch (error) {
      console.error('Goals update error:', error);
      res.status(500).json({ 
        error: 'Failed to update goals',
        details: error.message 
      });
    }
  });

  console.log('Dashboard routes added successfully');
}

module.exports = addDashboardRoutes;