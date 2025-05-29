const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Import existing enhanced backend
const enhancedBackendPath = path.join(__dirname, 'enhanced-backend-with-auth.js');
const aiAssistantPath = path.join(__dirname, 'ai-assistant-integration.js');

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Import AI assistant routes
const aiAssistant = require('./ai-assistant-integration');
app.use('/api/ai', authenticateToken, aiAssistant);

// Quick AI test endpoint (no auth for testing)
app.post('/api/ai/test', async (req, res) => {
  res.json({
    success: true,
    message: 'AI Assistant is ready! Available endpoints:',
    endpoints: [
      'POST /api/ai/advice - Get personalized career advice',
      'POST /api/ai/marketing-strategy - Generate marketing plan',
      'POST /api/ai/profile-analysis - Analyze artist profile',
      'POST /api/ai/content-ideas - Get content suggestions',
      'POST /api/ai/chat - Interactive AI chat',
      'GET /api/ai/trending - Get trending topics'
    ]
  });
});

console.log('AI Assistant integration added to backend');
module.exports = app;