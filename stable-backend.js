const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Database setup
let db;

// Initialize database
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'stable_platform.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
}

// Create database tables
async function createTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      artist_name TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      event_data TEXT,
      ip_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const query of queries) {
    await runQuery(query);
  }
  console.log('Database tables created successfully');
}

// Database helper functions
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Middleware setup
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}: ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await getQuery('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { category, rating, comment } = req.body;

    if (!category || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Category and valid rating (1-5) are required'
      });
    }

    const result = await runQuery(
      'INSERT INTO feedback (category, rating, comment, ip_address) VALUES (?, ?, ?, ?)',
      [category, rating, comment || null, req.ip]
    );

    console.log(`Feedback received: ${category} - ${rating}/5`);

    res.json({
      success: true,
      feedbackId: result.id,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

app.post('/api/analytics/track', async (req, res) => {
  try {
    const { eventType, eventData } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }

    await runQuery(
      'INSERT INTO analytics_events (event_type, event_data, ip_address) VALUES (?, ?, ?)',
      [eventType, JSON.stringify(eventData || {}), req.ip]
    );

    res.json({
      success: true,
      message: 'Event tracked'
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

app.get('/api/feedback/analytics', async (req, res) => {
  try {
    const totalFeedback = await getQuery('SELECT COUNT(*) as count FROM feedback');
    const avgRating = await getQuery('SELECT AVG(rating) as avg FROM feedback');
    const categoryBreakdown = await allQuery(
      'SELECT category, COUNT(*) as count, AVG(rating) as avg_rating FROM feedback GROUP BY category'
    );

    res.json({
      success: true,
      analytics: {
        totalFeedback: totalFeedback.count,
        averageRating: Math.round((avgRating.avg || 0) * 10) / 10,
        categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

app.get('/api/system/metrics', async (req, res) => {
  try {
    const feedbackCount = await getQuery('SELECT COUNT(*) as count FROM feedback');
    const eventsCount = await getQuery('SELECT COUNT(*) as count FROM analytics_events');
    
    res.json({
      success: true,
      metrics: {
        uptime: Math.floor(process.uptime()),
        feedback: feedbackCount.count,
        events: eventsCount.count,
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics'
    });
  }
});

// Serve static files
app.use(express.static('public'));

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (db) {
    db.close();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (db) {
    db.close();
  }
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`${new Date().toISOString()}: Not a Label stable backend running on port ${PORT}`);
      console.log(`${new Date().toISOString()}: Core features: Health ✓ Feedback ✓ Analytics ✓ Metrics ✓`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();