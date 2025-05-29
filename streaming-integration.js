// Music Streaming Platform Integration
// Supports Spotify, YouTube Music, Apple Music, SoundCloud

function addStreamingRoutes(app, authenticateToken, dbOptimizer) {
  
  // Store streaming credentials
  app.post('/api/streaming/connect', authenticateToken, async (req, res) => {
    try {
      const { platform, accessToken, refreshToken, expiresIn } = req.body;
      const userId = req.user.userId;
      
      if (!platform || !accessToken) {
        return res.status(400).json({ error: 'Platform and access token required' });
      }

      // Store encrypted tokens (in production, encrypt these)
      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT OR REPLACE INTO streaming_connections 
           (user_id, platform, access_token, refresh_token, expires_at, connected_at) 
           VALUES (?, ?, ?, ?, datetime('now', '+${expiresIn || 3600} seconds'), datetime('now'))`,
          [userId, platform, accessToken, refreshToken || null],
          (err) => err ? reject(err) : resolve()
        );
      });

      // Log connection event
      await new Promise((resolve) => {
        dbOptimizer.db.run(
          'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
          [`${platform}_connected`, userId, JSON.stringify({ platform })],
          () => resolve()
        );
      });

      res.json({
        success: true,
        message: `Successfully connected to ${platform}`,
        platform
      });

    } catch (error) {
      console.error('Streaming connection error:', error);
      res.status(500).json({ 
        error: 'Failed to connect streaming platform',
        details: error.message 
      });
    }
  });

  // Get connected platforms
  app.get('/api/streaming/connections', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const connections = await dbOptimizer.cachedQuery(
        `SELECT platform, connected_at, expires_at 
         FROM streaming_connections 
         WHERE user_id = ? AND expires_at > datetime('now')`,
        [userId],
        `streaming_connections_${userId}`
      );

      // Available platforms
      const platforms = [
        { 
          id: 'spotify',
          name: 'Spotify',
          connected: connections.some(c => c.platform === 'spotify'),
          features: ['Analytics', 'Playlists', 'Artist Profile']
        },
        { 
          id: 'youtube',
          name: 'YouTube Music',
          connected: connections.some(c => c.platform === 'youtube'),
          features: ['Video Analytics', 'Channel Stats', 'Revenue']
        },
        { 
          id: 'apple',
          name: 'Apple Music',
          connected: connections.some(c => c.platform === 'apple'),
          features: ['iTunes Analytics', 'Playlists', 'Charts']
        },
        { 
          id: 'soundcloud',
          name: 'SoundCloud',
          connected: connections.some(c => c.platform === 'soundcloud'),
          features: ['Play Stats', 'Comments', 'Reposts']
        }
      ];

      res.json({
        success: true,
        platforms,
        connections
      });

    } catch (error) {
      console.error('Get connections error:', error);
      res.status(500).json({ 
        error: 'Failed to get streaming connections',
        details: error.message 
      });
    }
  });

  // Get unified streaming analytics
  app.get('/api/streaming/analytics', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const days = parseInt(req.query.days) || 30;
      
      // Mock streaming data (in production, fetch from real APIs)
      const spotifyData = {
        streams: Math.floor(Math.random() * 50000) + 10000,
        listeners: Math.floor(Math.random() * 5000) + 1000,
        playlists: Math.floor(Math.random() * 50) + 5,
        topCountries: ['US', 'UK', 'DE', 'CA', 'AU'],
        topCities: ['Los Angeles', 'London', 'Berlin', 'Toronto', 'Sydney'],
        dailyStreams: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          streams: Math.floor(Math.random() * 2000) + 500
        }))
      };

      const youtubeData = {
        views: Math.floor(Math.random() * 100000) + 20000,
        subscribers: Math.floor(Math.random() * 5000) + 500,
        watchTime: Math.floor(Math.random() * 50000) + 10000,
        revenue: (Math.random() * 500 + 100).toFixed(2),
        topVideos: [
          { title: 'Latest Music Video', views: Math.floor(Math.random() * 20000) + 5000 },
          { title: 'Behind The Scenes', views: Math.floor(Math.random() * 10000) + 2000 },
          { title: 'Live Performance', views: Math.floor(Math.random() * 15000) + 3000 }
        ]
      };

      const combinedStats = {
        totalStreams: spotifyData.streams + youtubeData.views,
        totalListeners: spotifyData.listeners + youtubeData.subscribers,
        totalRevenue: (parseFloat(youtubeData.revenue) + Math.random() * 300 + 50).toFixed(2),
        growth: {
          streams: '+' + (Math.random() * 30 + 10).toFixed(1) + '%',
          listeners: '+' + (Math.random() * 20 + 5).toFixed(1) + '%',
          revenue: '+' + (Math.random() * 25 + 8).toFixed(1) + '%'
        }
      };

      res.json({
        success: true,
        period: `${days} days`,
        platforms: {
          spotify: spotifyData,
          youtube: youtubeData
        },
        combined: combinedStats
      });

    } catch (error) {
      console.error('Streaming analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to get streaming analytics',
        details: error.message 
      });
    }
  });

  // Get top tracks across platforms
  app.get('/api/streaming/top-tracks', authenticateToken, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      // Mock top tracks data
      const tracks = Array.from({ length: limit }, (_, i) => ({
        position: i + 1,
        title: `Track ${i + 1}`,
        artist: req.user.username,
        streams: {
          spotify: Math.floor(Math.random() * 10000) + 1000,
          youtube: Math.floor(Math.random() * 20000) + 2000,
          apple: Math.floor(Math.random() * 8000) + 800,
          total: 0
        },
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: (Math.random() * 10).toFixed(1)
      }));

      // Calculate totals
      tracks.forEach(track => {
        track.streams.total = track.streams.spotify + track.streams.youtube + track.streams.apple;
      });

      // Sort by total streams
      tracks.sort((a, b) => b.streams.total - a.streams.total);

      res.json({
        success: true,
        tracks,
        totalTracks: tracks.length,
        period: '30 days'
      });

    } catch (error) {
      console.error('Top tracks error:', error);
      res.status(500).json({ 
        error: 'Failed to get top tracks',
        details: error.message 
      });
    }
  });

  // Playlist submission opportunities
  app.get('/api/streaming/playlist-opportunities', authenticateToken, async (req, res) => {
    try {
      const genre = req.query.genre || 'all';
      
      // Mock playlist opportunities
      const playlists = [
        {
          id: 1,
          name: 'Fresh Finds Hip-Hop',
          platform: 'spotify',
          followers: 125000,
          description: 'Latest hip-hop discoveries updated weekly',
          submissionOpen: true,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          requirements: ['Released within 30 days', 'Clean version available'],
          curatorNotes: 'Looking for unique sounds and strong lyrics'
        },
        {
          id: 2,
          name: 'Underground Rap City',
          platform: 'spotify',
          followers: 45000,
          description: 'Best underground and indie hip-hop',
          submissionOpen: true,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          requirements: ['Independent artists only', 'Original production'],
          curatorNotes: 'Authenticity is key'
        },
        {
          id: 3,
          name: 'Hip-Hop Central',
          platform: 'apple',
          followers: 89000,
          description: 'Curated hip-hop from around the world',
          submissionOpen: true,
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          requirements: ['High quality production', 'Available on Apple Music'],
          curatorNotes: 'International artists welcome'
        }
      ];

      res.json({
        success: true,
        playlists: genre === 'all' ? playlists : playlists.filter(p => p.description.toLowerCase().includes(genre.toLowerCase())),
        totalOpportunities: playlists.length
      });

    } catch (error) {
      console.error('Playlist opportunities error:', error);
      res.status(500).json({ 
        error: 'Failed to get playlist opportunities',
        details: error.message 
      });
    }
  });

  // Submit to playlist
  app.post('/api/streaming/playlist-submit', authenticateToken, async (req, res) => {
    try {
      const { playlistId, trackId, message } = req.body;
      const userId = req.user.userId;
      
      if (!playlistId || !trackId) {
        return res.status(400).json({ error: 'Playlist ID and track ID required' });
      }

      // Log submission
      await new Promise((resolve) => {
        dbOptimizer.db.run(
          'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
          ['playlist_submission', userId, JSON.stringify({ playlistId, trackId, message })],
          () => resolve()
        );
      });

      res.json({
        success: true,
        message: 'Track submitted successfully',
        submissionId: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        estimatedResponse: '7-14 days'
      });

    } catch (error) {
      console.error('Playlist submission error:', error);
      res.status(500).json({ 
        error: 'Failed to submit to playlist',
        details: error.message 
      });
    }
  });

  // OAuth callback endpoints (for real integration)
  app.get('/api/streaming/callback/:platform', async (req, res) => {
    const { platform } = req.params;
    const { code, state } = req.query;
    
    // In production, exchange code for access token
    res.json({
      success: true,
      message: `OAuth callback for ${platform}`,
      note: 'In production, this would exchange the code for an access token'
    });
  });

  console.log('Streaming integration routes added successfully');
}

// Create streaming connections table
function createStreamingTables(db) {
  db.run(`CREATE TABLE IF NOT EXISTS streaming_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at DATETIME,
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, platform),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  
  console.log('Streaming tables created');
}

module.exports = { addStreamingRoutes, createStreamingTables };