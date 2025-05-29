const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/music');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max for audio files
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const allowedTypes = /wav|flac|mp3|m4a|aiff/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype || extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed'));
      }
    } else if (file.fieldname === 'artwork') {
      const allowedTypes = /jpeg|jpg|png/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only JPEG and PNG images are allowed'));
      }
    }
    cb(null, false);
  }
});

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // In production, verify JWT token here
  req.userId = 'demo-user-id';
  next();
};

// Get all releases for a user
router.get('/api/distribution/releases', authenticateToken, async (req, res) => {
  try {
    // Mock data - in production, fetch from database
    const releases = [
      {
        id: '1',
        title: 'Midnight Dreams',
        artist: 'Artist Name',
        type: 'single',
        releaseDate: '2024-02-15',
        status: 'live',
        platforms: ['spotify', 'apple', 'youtube', 'tidal'],
        artwork: '/api/distribution/artwork/1',
        tracks: 1,
        streams: 12453,
        earnings: 234.56
      },
      {
        id: '2',
        title: 'City Lights EP',
        artist: 'Artist Name',
        type: 'ep',
        releaseDate: '2024-03-01',
        status: 'distributed',
        platforms: ['spotify', 'apple', 'amazon'],
        artwork: '/api/distribution/artwork/2',
        tracks: 4,
        streams: 8765,
        earnings: 167.89
      }
    ];
    
    res.json({ releases });
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

// Get release details
router.get('/api/distribution/releases/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock data - in production, fetch from database
    const release = {
      id,
      title: 'Midnight Dreams',
      artist: 'Artist Name',
      type: 'single',
      releaseDate: '2024-02-15',
      status: 'live',
      platforms: ['spotify', 'apple', 'youtube', 'tidal'],
      artwork: `/api/distribution/artwork/${id}`,
      metadata: {
        genre: 'Pop',
        subgenre: 'Indie Pop',
        language: 'English',
        copyright: '© 2024 Artist Name',
        recordLabel: 'Independent',
        upc: '123456789012',
        catalogNumber: 'CAT001'
      },
      tracks: [
        {
          id: '1',
          title: 'Midnight Dreams',
          duration: '3:24',
          isrc: 'USRC17607839',
          writers: ['John Doe', 'Jane Smith'],
          producers: ['Mike Producer'],
          featuring: null,
          explicit: false,
          audioFile: `/api/distribution/audio/${id}/1`
        }
      ],
      platformStatus: {
        spotify: { status: 'live', url: 'https://open.spotify.com/track/...', listeners: 5432 },
        apple: { status: 'live', url: 'https://music.apple.com/...', listeners: 2341 },
        youtube: { status: 'processing', url: null, listeners: 0 },
        tidal: { status: 'live', url: 'https://tidal.com/...', listeners: 876 }
      }
    };
    
    res.json({ release });
  } catch (error) {
    console.error('Error fetching release:', error);
    res.status(500).json({ error: 'Failed to fetch release details' });
  }
});

// Create new release
router.post('/api/distribution/releases', authenticateToken, async (req, res) => {
  try {
    const { title, artist, type, releaseDate, platforms } = req.body;
    
    // Validate required fields
    if (!title || !artist || !type || !releaseDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Mock release creation - in production, save to database
    const newRelease = {
      id: Date.now().toString(),
      title,
      artist,
      type,
      releaseDate,
      status: 'draft',
      platforms: platforms || [],
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({ release: newRelease });
  } catch (error) {
    console.error('Error creating release:', error);
    res.status(500).json({ error: 'Failed to create release' });
  }
});

// Upload track audio
router.post('/api/distribution/releases/:id/tracks', 
  authenticateToken, 
  upload.single('audio'), 
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, featuring, writers, producers, explicit, isrc } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }
      
      // Mock track creation - in production, save to database
      const track = {
        id: Date.now().toString(),
        releaseId: id,
        title,
        featuring,
        writers: writers ? writers.split(',') : [],
        producers: producers ? producers.split(',') : [],
        explicit: explicit === 'true',
        isrc,
        audioFile: req.file.filename,
        duration: '0:00', // Would be calculated from actual file
        uploadedAt: new Date().toISOString()
      };
      
      res.json({ track });
    } catch (error) {
      console.error('Error uploading track:', error);
      res.status(500).json({ error: 'Failed to upload track' });
    }
});

// Upload release artwork
router.post('/api/distribution/releases/:id/artwork', 
  authenticateToken, 
  upload.single('artwork'), 
  async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No artwork file uploaded' });
      }
      
      // Validate image dimensions (in production)
      // const dimensions = await getImageDimensions(req.file.path);
      // if (dimensions.width < 3000 || dimensions.height < 3000) {
      //   await fs.unlink(req.file.path);
      //   return res.status(400).json({ error: 'Artwork must be at least 3000x3000 pixels' });
      // }
      
      res.json({ 
        artworkUrl: `/api/distribution/artwork/${id}`,
        filename: req.file.filename 
      });
    } catch (error) {
      console.error('Error uploading artwork:', error);
      res.status(500).json({ error: 'Failed to upload artwork' });
    }
});

// Update release metadata
router.put('/api/distribution/releases/:id/metadata', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const metadata = req.body;
    
    // Validate metadata
    const requiredFields = ['genre', 'language', 'copyright', 'recordLabel'];
    for (const field of requiredFields) {
      if (!metadata[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    
    // Mock update - in production, save to database
    res.json({ 
      message: 'Metadata updated successfully',
      metadata 
    });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ error: 'Failed to update metadata' });
  }
});

// Submit release for distribution
router.post('/api/distribution/releases/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { platforms, scheduledDate } = req.body;
    
    // Validate release is ready for distribution
    // In production, check all required fields are complete
    
    // Mock submission - in production, trigger distribution workflow
    const submission = {
      releaseId: id,
      platforms,
      scheduledDate: scheduledDate || new Date().toISOString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      estimatedProcessingTime: '24-48 hours'
    };
    
    res.json({ 
      message: 'Release submitted for distribution',
      submission 
    });
  } catch (error) {
    console.error('Error submitting release:', error);
    res.status(500).json({ error: 'Failed to submit release' });
  }
});

// Get distribution platforms
router.get('/api/distribution/platforms', authenticateToken, async (req, res) => {
  try {
    const platforms = [
      { 
        id: 'spotify', 
        name: 'Spotify', 
        connected: true, 
        earnings: 3456.78, 
        releases: 15,
        commission: 0,
        payoutSchedule: 'Monthly',
        minPayout: 10
      },
      { 
        id: 'apple', 
        name: 'Apple Music', 
        connected: true, 
        earnings: 2345.67, 
        releases: 15,
        commission: 0,
        payoutSchedule: 'Monthly',
        minPayout: 50
      },
      { 
        id: 'youtube', 
        name: 'YouTube Music', 
        connected: true, 
        earnings: 1234.56, 
        releases: 12,
        commission: 0,
        payoutSchedule: 'Monthly',
        minPayout: 100
      },
      { 
        id: 'amazon', 
        name: 'Amazon Music', 
        connected: true, 
        earnings: 567.89, 
        releases: 10,
        commission: 0,
        payoutSchedule: 'Quarterly',
        minPayout: 25
      },
      { 
        id: 'tidal', 
        name: 'Tidal', 
        connected: false, 
        earnings: 0, 
        releases: 0,
        commission: 0,
        payoutSchedule: 'Monthly',
        minPayout: 50
      },
      { 
        id: 'deezer', 
        name: 'Deezer', 
        connected: false, 
        earnings: 0, 
        releases: 0,
        commission: 0,
        payoutSchedule: 'Quarterly',
        minPayout: 50
      }
    ];
    
    res.json({ platforms });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

// Connect/disconnect platform
router.post('/api/distribution/platforms/:platformId/connect', authenticateToken, async (req, res) => {
  try {
    const { platformId } = req.params;
    const { action } = req.body; // 'connect' or 'disconnect'
    
    // Mock platform connection - in production, handle OAuth flow
    res.json({ 
      message: `Platform ${action}ed successfully`,
      platformId,
      connected: action === 'connect'
    });
  } catch (error) {
    console.error('Error updating platform connection:', error);
    res.status(500).json({ error: 'Failed to update platform connection' });
  }
});

// Get distribution analytics
router.get('/api/distribution/analytics', authenticateToken, async (req, res) => {
  try {
    const { releaseId, platform, timeRange = '30d' } = req.query;
    
    // Mock analytics data
    const analytics = {
      totalStreams: 45231,
      totalEarnings: 567.89,
      avgStreamsPerDay: 1507,
      topPlatforms: [
        { platform: 'spotify', streams: 23456, earnings: 234.56 },
        { platform: 'apple', streams: 12345, earnings: 185.23 },
        { platform: 'youtube', streams: 5430, earnings: 89.45 }
      ],
      streamTrends: generateTrendData(timeRange),
      earningsTrends: generateEarningsTrendData(timeRange)
    };
    
    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching distribution analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Helper functions
function generateTrendData(timeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    data.push({
      date: date.toISOString().split('T')[0],
      streams: Math.floor(Math.random() * 2000 + 500)
    });
  }
  
  return data;
}

function generateEarningsTrendData(timeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    data.push({
      date: date.toISOString().split('T')[0],
      earnings: Math.random() * 50 + 10
    });
  }
  
  return data;
}

module.exports = router;