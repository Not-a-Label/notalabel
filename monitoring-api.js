// Simple monitoring API endpoints
// Add to /var/www/not-a-label-backend/routes/monitoring.js

const express = require('express');
const router = express.Router();
const os = require('os');

// Mock data for now - replace with real database queries
const mockData = {
  users: { total: 45, artists: 12, new_24h: 3 },
  tracks: { total: 156, uploads_24h: 8 },
  activeUsers: 23,
  plays: 2456,
  revenue: 523.45
};

// Health check endpoint
router.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    load: os.loadavg()[0]
  });
});

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  res.json({
    users: mockData.users,
    content: {
      tracks: mockData.tracks.total,
      uploads_24h: mockData.tracks.uploads_24h
    },
    system: {
      node_version: process.version,
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptime_hours: Math.round(process.uptime() / 3600)
    }
  });
});

// Real-time stats endpoint
router.get('/realtime', async (req, res) => {
  res.json({
    active_users_1h: mockData.activeUsers + Math.floor(Math.random() * 10),
    plays_1h: mockData.plays + Math.floor(Math.random() * 100),
    signups_1h: Math.floor(Math.random() * 5),
    timestamp: new Date()
  });
});

module.exports = router;