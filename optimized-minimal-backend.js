const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database optimization class
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
    // Enable WAL mode for better concurrent access
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA synchronous = NORMAL');
    this.db.run('PRAGMA cache_size = 10000');
    this.db.run('PRAGMA temp_store = MEMORY');
    
    // Create indexes
    this.createIndexes();
  }

  createIndexes() {
    const indexes = [
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

  // Cached query execution
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

// Initialize database with optimization
const dbPath = path.join(__dirname, 'database.db');
const dbOptimizer = new DatabaseOptimizer(dbPath);

// Initialize database
dbOptimizer.initialize().then(() => {
  // Create tables
  dbOptimizer.db.serialize(() => {
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT,
      user_id INTEGER,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });

  console.log('Database optimization initialized');
}).catch(err => {
  console.error('Database initialization error:', err);
});

// Setup periodic cache cleanup
setInterval(() => {
  dbOptimizer.cleanCache();
  console.log(`Cache cleaned. Current size: ${dbOptimizer.queryCache.size}`);
}, 10 * 60 * 1000); // Every 10 minutes

// Health check with database stats
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await new Promise((resolve, reject) => {
      dbOptimizer.db.get('SELECT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Get basic stats
    const feedbackCount = await new Promise((resolve, reject) => {
      dbOptimizer.db.get('SELECT COUNT(*) as count FROM feedback', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    const analyticsCount = await new Promise((resolve, reject) => {
      dbOptimizer.db.get('SELECT COUNT(*) as count FROM analytics', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        connected: true,
        feedback_count: feedbackCount,
        analytics_count: analyticsCount,
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

// Optimized feedback endpoint
app.post('/api/feedback', async (req, res) => {
  const startTime = Date.now();
  const { name, email, message } = req.body;
  
  try {
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, message' 
      });
    }

    const result = await new Promise((resolve, reject) => {
      dbOptimizer.db.run(
        'INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)',
        [name, email, message],
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

// Optimized analytics endpoint with caching
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

// Get analytics data with caching
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

// Get analytics summary
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

// Database performance endpoint
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
  console.log(`Optimized backend server running on port ${PORT}`);
  console.log(`Database optimizations enabled with caching`);
});

module.exports = app;