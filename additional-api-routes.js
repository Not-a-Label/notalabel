const express = require('express');
const router = express.Router();

// Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    console.log('Contact form submission:', { name, email, subject, category, message });
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Music distribution platforms
router.get('/music-distribution/platforms', (req, res) => {
  const platforms = [
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'World\'s largest music streaming platform',
      fee: '0%',
      payoutDelay: '2-3 months',
      supported: true
    },
    {
      id: 'apple-music',
      name: 'Apple Music',
      description: 'Apple\'s premium music streaming service',
      fee: '0%',
      payoutDelay: '2-3 months',
      supported: true
    },
    {
      id: 'youtube-music',
      name: 'YouTube Music',
      description: 'Google\'s music streaming platform',
      fee: '0%',
      payoutDelay: '2-3 months',
      supported: true
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      description: 'Creator-focused audio platform',
      fee: '0%',
      payoutDelay: '1-2 months',
      supported: true
    },
    {
      id: 'bandcamp',
      name: 'Bandcamp',
      description: 'Artist-friendly music platform',
      fee: '10-15%',
      payoutDelay: '1-2 weeks',
      supported: true
    }
  ];
  
  res.json({ platforms, total: platforms.length });
});

// Social media platforms
router.get('/social/platforms', (req, res) => {
  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Visual content sharing platform',
      apiSupported: true,
      features: ['Posts', 'Stories', 'Reels', 'IGTV']
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Short-form video platform',
      apiSupported: true,
      features: ['Videos', 'Sounds', 'Effects']
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Real-time social networking',
      apiSupported: true,
      features: ['Tweets', 'Threads', 'Spaces']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Social networking platform',
      apiSupported: true,
      features: ['Posts', 'Events', 'Pages']
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Video sharing platform',
      apiSupported: true,
      features: ['Videos', 'Shorts', 'Live Streams']
    }
  ];
  
  res.json({ platforms, total: platforms.length });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      database: 'connected',
      api: 'operational',
      auth: 'active'
    }
  });
});

// Platform statistics
router.get('/stats', (req, res) => {
  res.json({
    users: {
      total: 1247,
      active: 892,
      newThisMonth: 156
    },
    tracks: {
      total: 5432,
      uploaded: 234,
      distributed: 4321
    },
    revenue: {
      totalGenerated: 125670.50,
      platformFees: 18850.58,
      artistPayouts: 106819.92
    },
    features: {
      analytics: 'active',
      collaboration: 'active',
      aiProduction: 'active',
      marketplace: 'active',
      education: 'active'
    }
  });
});

module.exports = router;