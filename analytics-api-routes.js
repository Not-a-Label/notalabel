const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // In production, verify JWT token here
  // For now, we'll assume authentication is handled
  req.userId = 'demo-user-id';
  next();
};

// Get overview analytics
router.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    // Mock data - in production, fetch from database
    const metrics = {
      totalStreams: 45231,
      monthlyListeners: 2847,
      revenue: 4715.01,
      engagement: 6.8,
      timeRange
    };
    
    const platformPerformance = [
      { platform: 'Spotify', streams: 23456, listeners: 1532, growth: 15.2 },
      { platform: 'Apple Music', streams: 12345, listeners: 823, growth: 8.7 },
      { platform: 'YouTube', streams: 5430, listeners: 392, growth: 23.5 },
      { platform: 'TikTok', streams: 4000, listeners: 100, growth: 45.3 }
    ];
    
    const topTracks = [
      { title: 'Midnight Dreams', streams: 12453, growth: 23.5 },
      { title: 'City Lights', streams: 9832, growth: 15.2 },
      { title: 'Summer Vibes', streams: 7234, growth: -5.3 }
    ];
    
    res.json({
      metrics,
      platformPerformance,
      topTracks
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get streaming analytics
router.get('/api/analytics/streaming', authenticateToken, async (req, res) => {
  try {
    const { platform = 'all', timeRange = '30d' } = req.query;
    
    const streamingData = {
      platforms: [
        {
          id: 'spotify',
          name: 'Spotify',
          totalStreams: 32456,
          monthlyListeners: 2134,
          topCountries: ['United States', 'United Kingdom', 'Canada'],
          growth: 15.2
        },
        {
          id: 'apple',
          name: 'Apple Music',
          totalStreams: 8234,
          monthlyListeners: 423,
          topCountries: ['United States', 'Japan', 'Germany'],
          growth: 8.7
        }
      ],
      tracks: [
        {
          id: '1',
          title: 'Midnight Dreams',
          streams: 12453,
          saves: 1823,
          skipRate: 12.3,
          avgListenTime: '2:45',
          playlists: 23
        }
      ],
      trends: generateTrendData(timeRange)
    };
    
    res.json(streamingData);
  } catch (error) {
    console.error('Streaming analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch streaming data' });
  }
});

// Get social media analytics
router.get('/api/analytics/social', authenticateToken, async (req, res) => {
  try {
    const { platform = 'all', timeRange = '30d' } = req.query;
    
    const socialData = {
      platforms: [
        {
          id: 'instagram',
          name: 'Instagram',
          followers: 12453,
          engagement: 5.8,
          posts: 156,
          reach: 234567,
          growth: 12.3
        },
        {
          id: 'tiktok',
          name: 'TikTok',
          followers: 8234,
          engagement: 8.2,
          posts: 89,
          reach: 456789,
          growth: 28.5
        }
      ],
      topPosts: [
        {
          id: '1',
          platform: 'instagram',
          content: 'Behind the scenes from our latest music video shoot!',
          likes: 3456,
          comments: 234,
          shares: 123,
          reach: 45678,
          engagement: 8.2
        }
      ],
      audience: {
        demographics: {
          age: [
            { range: '13-17', percentage: 15 },
            { range: '18-24', percentage: 35 },
            { range: '25-34', percentage: 28 }
          ],
          gender: [
            { type: 'Female', percentage: 58 },
            { type: 'Male', percentage: 40 }
          ]
        }
      }
    };
    
    res.json(socialData);
  } catch (error) {
    console.error('Social analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch social data' });
  }
});

// Get revenue analytics
router.get('/api/analytics/revenue', authenticateToken, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const revenueData = {
      totalRevenue: 7715.01,
      streams: [
        {
          id: 'streaming',
          name: 'Streaming',
          amount: 3456.78,
          percentage: 45,
          change: 12.3,
          transactions: 156
        },
        {
          id: 'merchandise',
          name: 'Merchandise',
          amount: 2345.67,
          percentage: 30,
          change: 23.4,
          transactions: 234
        }
      ],
      transactions: [
        {
          id: '1',
          date: '2024-01-25',
          type: 'streaming',
          description: 'Spotify - Monthly royalties',
          amount: 1234.56,
          status: 'completed',
          platform: 'Spotify'
        }
      ],
      payouts: [
        {
          platform: 'Spotify',
          nextPayout: '2024-02-15',
          estimatedAmount: 1456.78,
          frequency: 'Monthly',
          minimumThreshold: 10
        }
      ],
      trends: generateTrendData(timeRange)
    };
    
    res.json(revenueData);
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

// Get demographics analytics
router.get('/api/analytics/demographics', authenticateToken, async (req, res) => {
  try {
    const demographicsData = {
      totalListeners: 19466,
      countriesReached: 42,
      avgAge: 26.3,
      engagementRate: 68.4,
      demographics: {
        age: [
          { range: '13-17', value: 2345, percentage: 12 },
          { range: '18-24', value: 6789, percentage: 35 },
          { range: '25-34', value: 5432, percentage: 28 },
          { range: '35-44', value: 2890, percentage: 15 },
          { range: '45-54', value: 1234, percentage: 6 },
          { range: '55+', value: 776, percentage: 4 }
        ],
        gender: [
          { type: 'Female', value: 11234, percentage: 58 },
          { type: 'Male', value: 7734, percentage: 40 },
          { type: 'Non-binary', value: 387, percentage: 2 }
        ],
        interests: [
          { name: 'Indie/Alternative', value: 8765, percentage: 45 },
          { name: 'Pop', value: 5432, percentage: 28 },
          { name: 'Rock', value: 3210, percentage: 17 }
        ]
      },
      geographic: [
        {
          country: 'United States',
          code: 'US',
          listeners: 8765,
          percentage: 45,
          topCities: ['Los Angeles', 'New York', 'Chicago']
        },
        {
          country: 'United Kingdom',
          code: 'GB',
          listeners: 2890,
          percentage: 15,
          topCities: ['London', 'Manchester', 'Birmingham']
        }
      ],
      behaviors: [
        {
          trait: 'Music Enthusiasts',
          description: 'Listen to 5+ hours of music daily',
          percentage: 68
        },
        {
          trait: 'Playlist Curators',
          description: 'Create and share playlists regularly',
          percentage: 42
        }
      ]
    };
    
    res.json(demographicsData);
  } catch (error) {
    console.error('Demographics analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch demographics data' });
  }
});

// Export analytics report
router.post('/api/analytics/export', authenticateToken, async (req, res) => {
  try {
    const { type, format = 'pdf', timeRange = '30d' } = req.body;
    
    // In production, generate actual report file
    // For now, return mock response
    const exportData = {
      reportId: `report-${Date.now()}`,
      type,
      format,
      timeRange,
      status: 'processing',
      estimatedTime: '2 minutes',
      downloadUrl: null
    };
    
    res.json(exportData);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

// Helper function to generate trend data
function generateTrendData(timeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 1000 + 500)
    });
  }
  
  return data;
}

module.exports = router;