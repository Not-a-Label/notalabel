const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Middleware
app.use(cors());
app.use(express.json());

// Database optimization class (same as before)
class DatabaseOptimizer {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.queryCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.optimizeDatabase();
          resolve();
        }
      });
    });
  }

  optimizeDatabase() {
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA synchronous = NORMAL');
    this.db.run('PRAGMA cache_size = 10000');
    this.db.run('PRAGMA temp_store = MEMORY');
    this.createIndexes();
  }

  createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)'
    ];

    indexes.forEach(index => {
      this.db.run(index, (err) => {
        if (err && !err.message.includes('already exists')) {
          console.error('Index creation error:', err.message);
        }
      });
    });
  }

  async cachedQuery(sql, params = [], cacheKey = null) {
    const key = cacheKey || `${sql}_${JSON.stringify(params)}`;
    
    if (this.queryCache.has(key)) {
      const cached = this.queryCache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      } else {
        this.queryCache.delete(key);
      }
    }

    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          this.queryCache.set(key, {
            data: rows,
            timestamp: Date.now()
          });
          resolve(rows);
        }
      });
    });
  }

  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key);
      }
    }
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) console.error('Database close error:', err.message);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Initialize database
const dbPath = path.join(__dirname, 'database.db');
const dbOptimizer = new DatabaseOptimizer(dbPath);

dbOptimizer.initialize().then(() => {
  // Create tables with enhanced user table
  dbOptimizer.db.serialize(() => {
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      artist_name TEXT,
      genre TEXT,
      bio TEXT,
      avatar_url TEXT,
      verified BOOLEAN DEFAULT 0,
      active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      email TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
    
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT,
      user_id INTEGER,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
  });
  console.log('Database with authentication tables initialized');
}).catch(err => {
  console.error('Database initialization error:', err);
});

// Setup periodic cache cleanup
setInterval(() => {
  dbOptimizer.cleanCache();
}, 10 * 60 * 1000); // Every 10 minutes

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

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate password
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// User Registration
app.post('/api/auth/register', async (req, res) => {
  const startTime = Date.now();
  const { username, email, password, firstName, lastName, artistName, genre } = req.body;
  
  try {
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: username, email, password' 
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      dbOptimizer.db.get(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await new Promise((resolve, reject) => {
      dbOptimizer.db.run(
        `INSERT INTO users (username, email, password, first_name, last_name, artist_name, genre) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, email, hashedPassword, firstName || null, lastName || null, artistName || null, genre || null],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.id, 
        username, 
        email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const executionTime = Date.now() - startTime;
    console.log(`User registration completed in ${executionTime}ms`);

    // Log registration analytics
    await new Promise((resolve, reject) => {
      dbOptimizer.db.run(
        'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
        ['user_registration', result.id, JSON.stringify({ source: 'web', executionTime })],
        (err) => {
          if (err) console.error('Analytics logging error:', err);
          resolve();
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.id,
        username,
        email,
        firstName,
        lastName,
        artistName,
        genre
      },
      token,
      executionTime
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const startTime = Date.now();
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await new Promise((resolve, reject) => {
      dbOptimizer.db.get(
        'SELECT * FROM users WHERE email = ? AND active = 1',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const executionTime = Date.now() - startTime;
    console.log(`User login completed in ${executionTime}ms`);

    // Log login analytics
    await new Promise((resolve, reject) => {
      dbOptimizer.db.run(
        'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
        ['user_login', user.id, JSON.stringify({ executionTime })],
        (err) => {
          if (err) console.error('Analytics logging error:', err);
          resolve();
        }
      );
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        artistName: user.artist_name,
        genre: user.genre,
        verified: user.verified,
        avatarUrl: user.avatar_url
      },
      token,
      executionTime
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});

// Get user profile (protected)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      dbOptimizer.db.get(
        'SELECT id, username, email, first_name, last_name, artist_name, genre, bio, avatar_url, verified, created_at FROM users WHERE id = ?',
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        artistName: user.artist_name,
        genre: user.genre,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        verified: user.verified,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    });
  }
});

// Update user profile (protected)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { firstName, lastName, artistName, genre, bio } = req.body;
  
  try {
    await new Promise((resolve, reject) => {
      dbOptimizer.db.run(
        `UPDATE users SET 
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         artist_name = COALESCE(?, artist_name),
         genre = COALESCE(?, genre),
         bio = COALESCE(?, bio),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [firstName, lastName, artistName, genre, bio, req.user.userId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
});

// Logout (protected)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a real app, you'd invalidate the token in a blacklist
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Health check (enhanced with user count)
app.get('/api/health', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      dbOptimizer.db.get('SELECT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const stats = await Promise.all([
      new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          if (err) reject(err);
          else resolve({ users: row.count });
        });
      }),
      new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT COUNT(*) as count FROM feedback', (err, row) => {
          if (err) reject(err);
          else resolve({ feedback: row.count });
        });
      }),
      new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT COUNT(*) as count FROM analytics', (err, row) => {
          if (err) reject(err);
          else resolve({ analytics: row.count });
        });
      })
    ]);

    const combinedStats = stats.reduce((acc, stat) => ({ ...acc, ...stat }), {});

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        connected: true,
        ...combinedStats,
        cache_size: dbOptimizer.queryCache.size
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced feedback endpoint (can optionally link to user)
app.post('/api/feedback', async (req, res) => {
  const startTime = Date.now();
  const { name, email, message } = req.body;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      // Continue without user ID if token is invalid
    }
  }
  
  try {
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, message' 
      });
    }

    const result = await new Promise((resolve, reject) => {
      dbOptimizer.db.run(
        'INSERT INTO feedback (user_id, name, email, message) VALUES (?, ?, ?, ?)',
        [userId, name, email, message],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              id: this.lastID,
              executionTime: Date.now() - startTime
            });
          }
        }
      );
    });

    console.log(`Feedback insert completed in ${result.executionTime}ms`);

    res.json({ 
      success: true, 
      id: result.id,
      message: 'Feedback submitted successfully',
      executionTime: result.executionTime
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    });
  }
});

// Enhanced analytics endpoint (same as before)
app.post('/api/analytics', async (req, res) => {
  const startTime = Date.now();
  const { eventType, userId, data } = req.body;
  
  try {
    if (!eventType) {
      return res.status(400).json({ 
        error: 'Missing required field: eventType' 
      });
    }

    const result = await new Promise((resolve, reject) => {
      dbOptimizer.db.run(
        'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
        [eventType, userId, JSON.stringify(data || {})],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              id: this.lastID,
              executionTime: Date.now() - startTime
            });
          }
        }
      );
    });

    console.log(`Analytics insert completed in ${result.executionTime}ms`);

    res.json({ 
      success: true, 
      id: result.id,
      executionTime: result.executionTime
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to log analytics',
      details: error.message 
    });
  }
});

// Get analytics data with caching (same as before)
app.get('/api/analytics', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const limit = parseInt(req.query.limit) || 100;
    const eventType = req.query.eventType;
    
    let sql = 'SELECT * FROM analytics';
    let params = [];
    
    if (eventType) {
      sql += ' WHERE event_type = ?';
      params.push(eventType);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const cacheKey = `analytics_${eventType || 'all'}_${limit}`;
    const rows = await dbOptimizer.cachedQuery(sql, params, cacheKey);
    
    const executionTime = Date.now() - startTime;
    console.log(`Analytics query completed in ${executionTime}ms (${rows.length} rows)`);

    res.json({
      data: rows,
      count: rows.length,
      executionTime,
      cached: dbOptimizer.queryCache.has(cacheKey)
    });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve analytics',
      details: error.message 
    });
  }
});

// Get analytics summary (same as before)
app.get('/api/analytics/summary', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const hours = parseInt(req.query.hours) || 24;
    
    const sql = `
      SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        MAX(created_at) as last_event
      FROM analytics 
      WHERE created_at >= datetime('now', '-${hours} hours')
      GROUP BY event_type
      ORDER BY count DESC
    `;
    
    const cacheKey = `analytics_summary_${hours}h`;
    const rows = await dbOptimizer.cachedQuery(sql, [], cacheKey);
    
    const executionTime = Date.now() - startTime;
    console.log(`Analytics summary completed in ${executionTime}ms`);

    res.json({
      summary: rows,
      timeframe: `${hours} hours`,
      executionTime,
      cached: dbOptimizer.queryCache.has(cacheKey)
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ 
      error: 'Failed to generate analytics summary',
      details: error.message 
    });
  }
});

// Database performance endpoint (same as before)
app.get('/api/db/performance', async (req, res) => {
  try {
    const stats = await new Promise((resolve, reject) => {
      dbOptimizer.db.get('PRAGMA page_count', (err, pageRow) => {
        if (err) {
          reject(err);
        } else {
          dbOptimizer.db.get('PRAGMA page_size', (err2, sizeRow) => {
            if (err2) {
              reject(err2);
            } else {
              resolve({
                pages: pageRow.page_count,
                pageSize: sizeRow.page_size,
                totalSize: pageRow.page_count * sizeRow.page_size
              });
            }
          });
        }
      });
    });

    res.json({
      database: {
        size_bytes: stats.totalSize,
        size_mb: Math.round(stats.totalSize / 1024 / 1024 * 100) / 100,
        pages: stats.pages,
        page_size: stats.pageSize
      },
      cache: {
        size: dbOptimizer.queryCache.size,
        timeout_ms: dbOptimizer.cacheTimeout
      },
      performance: {
        uptime: Math.floor(process.uptime()),
        memory_usage: process.memoryUsage()
      }
    });
  } catch (error) {
    console.error('Performance stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get performance stats',
      details: error.message 
    });
  }
});

// Import and add AI routes
const addAIRoutes = require('./ai-routes-addon');
addAIRoutes(app, authenticateToken, dbOptimizer);

// Import and add Dashboard routes
const addDashboardRoutes = require('./artist-dashboard-api');
addDashboardRoutes(app, authenticateToken, dbOptimizer);

// Import and add Streaming integration routes
const { addStreamingRoutes, createStreamingTables } = require('./streaming-integration');
addStreamingRoutes(app, authenticateToken, dbOptimizer);
// Create streaming tables
createStreamingTables(dbOptimizer.db);

// Import and add Collaboration routes
const addCollaborationRoutes = require('./collaboration-features');
addCollaborationRoutes(app, authenticateToken, dbOptimizer);

// Import and add Email notification routes
const addEmailRoutes = require('./email-notification-system');
addEmailRoutes(app, authenticateToken, dbOptimizer);

// Import and add Music upload routes
const addMusicUploadRoutes = require('./music-upload-system');
addMusicUploadRoutes(app, authenticateToken, dbOptimizer);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  await dbOptimizer.close();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
app.listen(PORT, () => {
  console.log(`Enhanced backend with authentication and AI assistant running on port ${PORT}`);
  console.log(`Database optimizations, auth endpoints, and AI features enabled`);
});

module.exports = app;