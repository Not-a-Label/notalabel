const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Import optimization modules
const ScalingIntegrationMaster = require('./scaling-integration-master');

class OptimizedBackend {
  constructor() {
    this.app = express();
    this.db = null;
    this.scalingMaster = null;
    
    this.setupMiddleware();
    this.initializeDatabase();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupGracefulShutdown();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          fontSrc: ["'self'", "fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-eval'", "www.googletagmanager.com"],
          connectSrc: ["'self'", "api.openai.com", "www.google-analytics.com"]
        }
      }
    }));

    // Compression middleware
    this.app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: { error: 'Too many requests from this IP, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/api/health';
      }
    });
    this.app.use('/api/', limiter);

    // Stricter rate limiting for auth endpoints
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: { error: 'Too many authentication attempts' }
    });
    this.app.use('/api/auth/', authLimiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp}: ${req.method} ${req.path} - IP: ${req.ip}`);
      next();
    });

    // Request timing middleware
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      const originalSend = res.send;
      
      res.send = function(data) {
        const responseTime = Date.now() - req.startTime;
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        originalSend.call(this, data);
      };
      
      next();
    });
  }

  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'optimized_platform.db');
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
          return;
        }
        
        console.log('Connected to SQLite database');
        this.createTables().then(resolve).catch(reject);
      });

      // Database error handling
      this.db.on('error', (err) => {
        console.error('Database error:', err);
      });
    });
  }

  async createTables() {
    const queries = [
      // Users table with optimized schema
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        artist_name TEXT,
        bio TEXT,
        genres TEXT, -- JSON array as string
        location TEXT,
        verified BOOLEAN DEFAULT FALSE,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        two_factor_secret TEXT,
        profile_image_url TEXT,
        subscription_type TEXT DEFAULT 'free',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        email_verified BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'active'
      )`,

      // Feedback table with enhanced structure
      `CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        sentiment TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'new',
        ip_address TEXT,
        user_agent TEXT,
        page_url TEXT,
        session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`,

      // Analytics events table
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_type TEXT NOT NULL,
        event_data TEXT, -- JSON data as string
        page_url TEXT,
        session_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`,

      // User sessions table for improved auth
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,

      // System health monitoring
      `CREATE TABLE IF NOT EXISTS system_health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_unit TEXT,
        severity TEXT DEFAULT 'info',
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Error logs table
      `CREATE TABLE IF NOT EXISTS error_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        error_type TEXT NOT NULL,
        error_message TEXT NOT NULL,
        stack_trace TEXT,
        request_url TEXT,
        request_method TEXT,
        user_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        resolved BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`
    ];

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category)',
      'CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type)',
      'CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)',
      'CREATE INDEX IF NOT EXISTS idx_health_timestamp ON system_health(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON error_logs(created_at)'
    ];

    try {
      // Create tables
      for (const query of queries) {
        await this.runQuery(query);
      }

      // Create indexes
      for (const index of indexes) {
        await this.runQuery(index);
      }

      console.log('Database tables and indexes created successfully');
    } catch (error) {
      console.error('Error creating database tables:', error);
      throw error;
    }
  }

  runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  allQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/api/health', async (req, res) => {
      try {
        const healthData = await this.checkSystemHealth();
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          ...healthData
        });
      } catch (error) {
        res.status(500).json({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Enhanced feedback endpoint
    this.app.post('/api/feedback', async (req, res) => {
      try {
        const { category, rating, comment, userId } = req.body;

        // Validate input
        if (!category || !rating || rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            error: 'Category and valid rating (1-5) are required'
          });
        }

        // Determine sentiment based on rating
        const sentiment = rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative';
        const priority = rating <= 2 ? 'high' : rating === 3 ? 'medium' : 'low';

        const result = await this.runQuery(
          `INSERT INTO feedback (user_id, category, rating, comment, sentiment, priority, ip_address, user_agent, page_url, session_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId || null,
            category,
            rating,
            comment || null,
            sentiment,
            priority,
            req.ip,
            req.get('User-Agent'),
            req.get('Referer'),
            req.headers['x-session-id'] || null
          ]
        );

        // Log for monitoring
        console.log(`${new Date().toISOString()}: New feedback received: ${category} - Rating: ${rating}/5`);

        // Track analytics event
        await this.trackAnalyticsEvent(userId, 'feedback_submitted', {
          category,
          rating,
          sentiment,
          priority
        }, req);

        res.json({
          success: true,
          feedbackId: result.id,
          message: 'Feedback submitted successfully'
        });

      } catch (error) {
        console.error('Feedback submission error:', error);
        await this.logError('feedback_submission', error, req);
        res.status(500).json({
          success: false,
          error: 'Failed to submit feedback'
        });
      }
    });

    // Analytics tracking endpoint
    this.app.post('/api/analytics/track', async (req, res) => {
      try {
        const { eventType, eventData, userId } = req.body;

        if (!eventType) {
          return res.status(400).json({
            success: false,
            error: 'Event type is required'
          });
        }

        await this.trackAnalyticsEvent(userId, eventType, eventData, req);

        res.json({
          success: true,
          message: 'Event tracked successfully'
        });

      } catch (error) {
        console.error('Analytics tracking error:', error);
        await this.logError('analytics_tracking', error, req);
        res.status(500).json({
          success: false,
          error: 'Failed to track event'
        });
      }
    });

    // Get feedback analytics
    this.app.get('/api/feedback/analytics', async (req, res) => {
      try {
        const { timeframe = '30d' } = req.query;
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        
        const analytics = await this.getFeedbackAnalytics(days);
        res.json({
          success: true,
          analytics,
          timeframe
        });

      } catch (error) {
        console.error('Feedback analytics error:', error);
        await this.logError('feedback_analytics', error, req);
        res.status(500).json({
          success: false,
          error: 'Failed to get feedback analytics'
        });
      }
    });

    // System metrics endpoint
    this.app.get('/api/system/metrics', async (req, res) => {
      try {
        const metrics = await this.getSystemMetrics();
        res.json({
          success: true,
          metrics,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('System metrics error:', error);
        await this.logError('system_metrics', error, req);
        res.status(500).json({
          success: false,
          error: 'Failed to get system metrics'
        });
      }
    });

    // Initialize and integrate scaling optimization systems
    try {
      this.scalingMaster = new ScalingIntegrationMaster({
        seo: {},
        onboarding: {},
        performance: {},
        marketing: {},
        abTesting: {},
        referral: {},
        retention: {}
      });

      this.app.use('/api/scaling', this.scalingMaster.getRouter());
      console.log('Scaling optimization systems integrated successfully');
    } catch (error) {
      console.error('Error integrating scaling systems:', error);
    }

    // Serve static files
    this.app.use(express.static('public'));

    // Catch-all route for SPA
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  async trackAnalyticsEvent(userId, eventType, eventData, req) {
    try {
      await this.runQuery(
        `INSERT INTO analytics_events (user_id, event_type, event_data, page_url, session_id, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId || null,
          eventType,
          JSON.stringify(eventData || {}),
          req.get('Referer'),
          req.headers['x-session-id'] || null,
          req.ip,
          req.get('User-Agent')
        ]
      );
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  async logError(errorType, error, req = null) {
    try {
      await this.runQuery(
        `INSERT INTO error_logs (error_type, error_message, stack_trace, request_url, request_method, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          errorType,
          error.message || error,
          error.stack || null,
          req ? req.originalUrl : null,
          req ? req.method : null,
          req ? req.ip : null,
          req ? req.get('User-Agent') : null
        ]
      );
    } catch (logError) {
      console.error('Error logging error to database:', logError);
    }
  }

  async checkSystemHealth() {
    try {
      // Database health check
      await this.getQuery('SELECT 1');
      
      // Memory usage check
      const memUsage = process.memoryUsage();
      const memoryHealth = memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'good' : 'warning';
      
      // Uptime check
      const uptime = process.uptime();
      const uptimeHealth = uptime > 3600 ? 'good' : 'warning'; // 1 hour
      
      return {
        database: 'connected',
        memory: {
          status: memoryHealth,
          usage: memUsage
        },
        uptime: {
          status: uptimeHealth,
          seconds: uptime
        }
      };
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async getFeedbackAnalytics(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Overall statistics
      const totalFeedback = await this.getQuery(
        'SELECT COUNT(*) as count FROM feedback WHERE created_at >= ?',
        [cutoffDate.toISOString()]
      );

      // Rating distribution
      const ratingDistribution = await this.allQuery(
        'SELECT rating, COUNT(*) as count FROM feedback WHERE created_at >= ? GROUP BY rating ORDER BY rating',
        [cutoffDate.toISOString()]
      );

      // Category breakdown
      const categoryBreakdown = await this.allQuery(
        'SELECT category, COUNT(*) as count, AVG(rating) as avg_rating FROM feedback WHERE created_at >= ? GROUP BY category ORDER BY count DESC',
        [cutoffDate.toISOString()]
      );

      // Sentiment analysis
      const sentimentAnalysis = await this.allQuery(
        'SELECT sentiment, COUNT(*) as count FROM feedback WHERE created_at >= ? GROUP BY sentiment',
        [cutoffDate.toISOString()]
      );

      // Daily trends
      const dailyTrends = await this.allQuery(
        `SELECT DATE(created_at) as date, COUNT(*) as count, AVG(rating) as avg_rating 
         FROM feedback 
         WHERE created_at >= ? 
         GROUP BY DATE(created_at) 
         ORDER BY date`,
        [cutoffDate.toISOString()]
      );

      return {
        totalFeedback: totalFeedback.count,
        ratingDistribution,
        categoryBreakdown,
        sentimentAnalysis,
        dailyTrends,
        averageRating: categoryBreakdown.reduce((sum, cat) => sum + cat.avg_rating, 0) / (categoryBreakdown.length || 1)
      };
    } catch (error) {
      throw new Error(`Failed to get feedback analytics: ${error.message}`);
    }
  }

  async getSystemMetrics() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Database metrics
      const userCount = await this.getQuery('SELECT COUNT(*) as count FROM users');
      const feedbackCount = await this.getQuery('SELECT COUNT(*) as count FROM feedback WHERE created_at >= ?', [oneDayAgo.toISOString()]);
      const analyticsEvents = await this.getQuery('SELECT COUNT(*) as count FROM analytics_events WHERE timestamp >= ?', [oneDayAgo.toISOString()]);
      
      // Error rate
      const errorCount = await this.getQuery('SELECT COUNT(*) as count FROM error_logs WHERE created_at >= ?', [oneDayAgo.toISOString()]);

      // System performance
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      return {
        database: {
          totalUsers: userCount.count,
          dailyFeedback: feedbackCount.count,
          dailyEvents: analyticsEvents.count,
          dailyErrors: errorCount.count
        },
        performance: {
          uptime: process.uptime(),
          memory: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
            percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          }
        },
        timestamp: now.toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get system metrics: ${error.message}`);
    }
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use(async (error, req, res, next) => {
      console.error('Unhandled error:', error);
      
      // Log error to database
      await this.logError('unhandled_error', error, req);

      // Send error response
      res.status(error.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Process error handlers
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught Exception:', error);
      await this.logError('uncaught_exception', error);
      
      // Graceful shutdown
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      await this.logError('unhandled_rejection', new Error(reason));
    });
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`${signal} received. Starting graceful shutdown...`);
      
      try {
        // Close database connection
        if (this.db) {
          this.db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('Database connection closed');
            }
          });
        }

        // Close server
        if (this.server) {
          this.server.close(() => {
            console.log('Server closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  async start(port = 4000) {
    try {
      await this.initializeDatabase();
      
      this.server = this.app.listen(port, () => {
        console.log(`${new Date().toISOString()}: Not a Label optimized backend running on port ${port}`);
        console.log(`${new Date().toISOString()}: Enhanced features: Feedback ✓ Analytics ✓ Tracking ✓ Optimization ✓`);
        
        // Log startup to database
        this.trackAnalyticsEvent(null, 'server_started', {
          port,
          timestamp: new Date().toISOString(),
          nodeVersion: process.version,
          platform: process.platform
        });
      });

      // Handle server errors
      this.server.on('error', async (error) => {
        console.error('Server error:', error);
        await this.logError('server_error', error);
      });

      return this.server;
    } catch (error) {
      console.error('Failed to start server:', error);
      await this.logError('server_startup', error);
      throw error;
    }
  }
}

// Initialize and start the optimized backend
if (require.main === module) {
  const backend = new OptimizedBackend();
  backend.start(process.env.PORT || 4000).catch(console.error);
}

module.exports = OptimizedBackend;