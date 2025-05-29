const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseOptimizer {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, 'database.db');
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
    
    // Optimize SQLite settings for performance
    this.db.run('PRAGMA synchronous = NORMAL');
    this.db.run('PRAGMA cache_size = 10000');
    this.db.run('PRAGMA temp_store = MEMORY');
    this.db.run('PRAGMA mmap_size = 268435456'); // 256MB
    
    // Create indexes for better query performance
    this.createIndexes();
    
    // Setup automatic VACUUM
    this.setupAutoVacuum();
  }

  createIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_composite ON analytics(event_type, user_id, created_at)'
    ];

    indexes.forEach(index => {
      this.db.run(index, (err) => {
        if (err) {
          console.error('Error creating index:', err.message);
        }
      });
    });
  }

  setupAutoVacuum() {
    // Enable auto-vacuum
    this.db.run('PRAGMA auto_vacuum = INCREMENTAL');
    
    // Schedule periodic vacuum operations
    setInterval(() => {
      this.db.run('PRAGMA incremental_vacuum(1000)', (err) => {
        if (err) {
          console.error('Auto vacuum error:', err.message);
        } else {
          console.log('Database auto-vacuum completed');
        }
      });
    }, 60 * 60 * 1000); // Every hour
  }

  // Cached query execution
  async cachedQuery(sql, params = [], cacheKey = null) {
    const key = cacheKey || `${sql}_${JSON.stringify(params)}`;
    
    // Check cache first
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
          // Cache the result
          this.queryCache.set(key, {
            data: rows,
            timestamp: Date.now()
          });
          resolve(rows);
        }
      });
    });
  }

  // Batch insert for better performance
  async batchInsert(table, data, batchSize = 100) {
    if (!data.length) return;

    const columns = Object.keys(data[0]);
    const placeholders = columns.map(() => '?').join(',');
    const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        const stmt = this.db.prepare(sql);
        let processed = 0;
        let errors = [];

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          
          batch.forEach(item => {
            const values = columns.map(col => item[col]);
            stmt.run(values, (err) => {
              if (err) {
                errors.push(err);
              }
              processed++;
              
              if (processed === data.length) {
                stmt.finalize();
                if (errors.length > 0) {
                  this.db.run('ROLLBACK');
                  reject(errors);
                } else {
                  this.db.run('COMMIT');
                  resolve(processed);
                }
              }
            });
          });
        }
      });
    });
  }

  // Connection pooling simulation
  async getConnection() {
    // In a real app, you'd use a connection pool
    // For SQLite, we'll use the single connection efficiently
    return this.db;
  }

  // Analytics optimized queries
  async getAnalyticsSummary(timeframe = '24 HOURS') {
    const sql = `
      SELECT 
        event_type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM analytics 
      WHERE created_at >= datetime('now', '-${timeframe}')
      GROUP BY event_type, DATE(created_at)
      ORDER BY created_at DESC
    `;
    
    return this.cachedQuery(sql, [], `analytics_summary_${timeframe}`);
  }

  async getUserEngagement(userId, days = 30) {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as activity_count,
        COUNT(DISTINCT event_type) as unique_events
      FROM analytics 
      WHERE user_id = ? 
        AND created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    return this.cachedQuery(sql, [userId], `user_engagement_${userId}_${days}`);
  }

  async getTopEvents(limit = 10) {
    const sql = `
      SELECT 
        event_type,
        COUNT(*) as total_count,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(CASE WHEN user_id IS NOT NULL THEN 1 ELSE 0 END) as user_ratio
      FROM analytics 
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY event_type
      ORDER BY total_count DESC
      LIMIT ?
    `;
    
    return this.cachedQuery(sql, [limit], `top_events_${limit}`);
  }

  // Database health monitoring
  async getDatabaseStats() {
    const stats = {};
    
    // Get table sizes
    const tables = ['users', 'feedback', 'analytics'];
    for (const table of tables) {
      const count = await new Promise((resolve, reject) => {
        this.db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
      stats[table] = count;
    }

    // Get database file size
    const dbInfo = await new Promise((resolve, reject) => {
      this.db.get('PRAGMA page_count', (err, row) => {
        if (err) reject(err);
        else {
          this.db.get('PRAGMA page_size', (err2, row2) => {
            if (err2) reject(err2);
            else resolve({
              pages: row.page_count,
              pageSize: row2.page_size,
              totalSize: row.page_count * row2.page_size
            });
          });
        }
      });
    });

    stats.database = dbInfo;
    stats.cacheSize = this.queryCache.size;
    
    return stats;
  }

  // Performance monitoring
  async analyzeQuery(sql, params = []) {
    const start = process.hrtime.bigint();
    
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        if (err) {
          reject(err);
        } else {
          resolve({
            rows,
            executionTime: duration,
            rowCount: rows.length
          });
        }
      });
    });
  }

  // Clean up expired cache entries
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.queryCache.delete(key);
      }
    }
  }

  // Graceful shutdown
  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Create optimized backend with database optimization
class OptimizedBackendWithDB {
  constructor() {
    this.dbOptimizer = new DatabaseOptimizer();
    this.app = null;
  }

  async initialize() {
    await this.dbOptimizer.initialize();
    
    // Setup periodic cache cleanup
    setInterval(() => {
      this.dbOptimizer.cleanCache();
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  // Optimized feedback endpoint
  async submitFeedback(name, email, message) {
    const start = Date.now();
    
    try {
      const result = await new Promise((resolve, reject) => {
        this.dbOptimizer.db.run(
          'INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)',
          [name, email, message],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      // Log performance
      const duration = Date.now() - start;
      console.log(`Feedback insert took ${duration}ms`);

      return {
        success: true,
        id: result.id,
        message: 'Feedback submitted successfully'
      };
    } catch (error) {
      console.error('Feedback submission error:', error);
      throw error;
    }
  }

  // Optimized analytics endpoint
  async logAnalytics(eventType, userId, data) {
    const start = Date.now();
    
    try {
      const result = await new Promise((resolve, reject) => {
        this.dbOptimizer.db.run(
          'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
          [eventType, userId, JSON.stringify(data)],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      // Log performance
      const duration = Date.now() - start;
      console.log(`Analytics insert took ${duration}ms`);

      return {
        success: true,
        id: result.id
      };
    } catch (error) {
      console.error('Analytics logging error:', error);
      throw error;
    }
  }

  // Get analytics with caching
  async getAnalytics(limit = 100) {
    return this.dbOptimizer.cachedQuery(
      'SELECT * FROM analytics ORDER BY created_at DESC LIMIT ?',
      [limit],
      `analytics_list_${limit}`
    );
  }

  // Database health endpoint
  async getDatabaseHealth() {
    const stats = await this.dbOptimizer.getDatabaseStats();
    const summary = await this.dbOptimizer.getAnalyticsSummary();
    
    return {
      status: 'healthy',
      stats,
      recent_activity: summary.slice(0, 10),
      cache_stats: {
        size: this.dbOptimizer.queryCache.size,
        timeout: this.dbOptimizer.cacheTimeout
      }
    };
  }
}

module.exports = {
  DatabaseOptimizer,
  OptimizedBackendWithDB
};