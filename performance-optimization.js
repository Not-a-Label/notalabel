const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Redis = require('redis');

class PerformanceOptimization {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.cdnConfig = config.cdn || {};
    this.redis = config.redis ? Redis.createClient(config.redis) : null;
    
    this.setupCaching();
    this.setupCompression();
    this.setupSecurityHeaders();
    this.setupRateLimiting();
  }

  // CDN and Static Asset Optimization
  setupCDN() {
    return {
      staticAssets: {
        images: {
          formats: ['webp', 'avif', 'jpg', 'png'],
          sizes: [320, 640, 960, 1280, 1920],
          quality: {
            webp: 85,
            avif: 80,
            jpg: 90
          },
          lazy: true,
          progressive: true
        },
        
        css: {
          minify: true,
          purge: true,
          critical: true,
          inline: true // For critical CSS
        },
        
        javascript: {
          minify: true,
          bundle: true,
          splitChunks: true,
          treeshaking: true,
          compression: 'gzip'
        },
        
        fonts: {
          preload: ['woff2'],
          fallbacks: true,
          display: 'swap'
        }
      },

      caching: {
        staticAssets: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Expires': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        api: {
          'Cache-Control': 'public, max-age=300, s-maxage=600',
          'Vary': 'Accept-Encoding, Authorization'
        },
        html: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'Vary': 'Accept-Encoding'
        }
      }
    };
  }

  // Advanced Caching Strategy
  setupCaching() {
    this.cacheStrategies = {
      // Browser caching
      browser: {
        staticAssets: 31536000, // 1 year
        api: 300, // 5 minutes
        html: 60 // 1 minute
      },

      // CDN caching
      cdn: {
        staticAssets: 31536000, // 1 year
        api: 600, // 10 minutes
        html: 300 // 5 minutes
      },

      // Server-side caching
      memory: {
        userProfiles: 3600, // 1 hour
        analytics: 300, // 5 minutes
        search: 1800, // 30 minutes
        recommendations: 7200 // 2 hours
      },

      // Redis caching for distributed systems
      redis: {
        sessions: 86400, // 24 hours
        apiResponses: 1800, // 30 minutes
        computedData: 3600 // 1 hour
      }
    };
  }

  // Compression Middleware
  setupCompression() {
    return compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
      chunkSize: 16 * 1024,
      windowBits: 15,
      memLevel: 8
    });
  }

  // Security Headers
  setupSecurityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          fontSrc: ["'self'", "fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'", "'unsafe-eval'", "www.googletagmanager.com"],
          connectSrc: ["'self'", "api.openai.com", "www.google-analytics.com"],
          mediaSrc: ["'self'", "blob:"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  // Rate Limiting
  setupRateLimiting() {
    return {
      general: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false
      }),

      api: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        message: 'API rate limit exceeded',
        standardHeaders: true,
        legacyHeaders: false
      }),

      auth: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20, // limit auth attempts
        message: 'Too many authentication attempts',
        standardHeaders: true,
        legacyHeaders: false
      }),

      upload: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 50, // 50 uploads per hour
        message: 'Upload limit exceeded',
        standardHeaders: true,
        legacyHeaders: false
      })
    };
  }

  // Database Query Optimization
  getDatabaseOptimizations() {
    return {
      indexing: {
        users: ['email', 'username', 'created_at'],
        artists: ['user_id', 'genre', 'location', 'verified'],
        tracks: ['artist_id', 'genre', 'release_date', 'plays'],
        collaborations: ['artist_id', 'status', 'created_at'],
        fan_clubs: ['artist_id', 'tier', 'active'],
        analytics: ['user_id', 'event_type', 'timestamp']
      },

      queries: {
        // Use prepared statements
        prepared: true,
        
        // Connection pooling
        pool: {
          min: 5,
          max: 20,
          idle: 30000
        },

        // Query optimization
        eager: ['related_data'],
        select: ['only', 'needed', 'fields'],
        limit: 'always_paginate',
        
        // Caching
        cache: {
          ttl: 300, // 5 minutes
          keys: ['user_id', 'artist_id']
        }
      },

      migrations: {
        // Database schema optimizations
        partitioning: ['analytics_by_date', 'events_by_month'],
        sharding: ['user_data_by_region'],
        archiving: ['old_analytics_data']
      }
    };
  }

  // Image Optimization
  getImageOptimization() {
    return {
      processing: {
        formats: {
          webp: { quality: 85, effort: 6 },
          avif: { quality: 80, effort: 9 },
          jpg: { quality: 90, progressive: true },
          png: { compressionLevel: 9, progressive: true }
        },

        sizes: [
          { width: 320, suffix: 'mobile' },
          { width: 640, suffix: 'tablet' },
          { width: 960, suffix: 'desktop' },
          { width: 1280, suffix: 'hd' },
          { width: 1920, suffix: 'fullhd' }
        ],

        lazy: {
          placeholder: 'blur',
          threshold: 0.1,
          rootMargin: '50px'
        }
      },

      cdn: {
        provider: 'cloudinary', // or 'cloudflare', 'aws-cloudfront'
        transformations: {
          auto: ['format', 'quality'],
          gravity: 'auto',
          crop: 'fill'
        }
      }
    };
  }

  // Bundle Optimization
  getBundleOptimization() {
    return {
      webpack: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all'
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all'
            }
          }
        },

        optimization: {
          usedExports: true,
          sideEffects: false,
          concatenateModules: true,
          moduleIds: 'deterministic',
          chunkIds: 'deterministic'
        },

        plugins: [
          'TerserPlugin',
          'CompressionPlugin',
          'BundleAnalyzerPlugin'
        ]
      },

      loading: {
        preload: ['critical-resources'],
        prefetch: ['next-page-resources'],
        modulePreload: ['dynamic-imports'],
        dns: ['external-domains']
      }
    };
  }

  // API Optimization
  getAPIOptimizations() {
    return {
      response: {
        compression: true,
        pagination: {
          defaultLimit: 20,
          maxLimit: 100
        },
        fields: 'selective', // Only return requested fields
        includes: 'lazy' // Lazy load related data
      },

      caching: {
        etag: true,
        lastModified: true,
        conditional: true,
        vary: ['Accept-Encoding', 'Authorization']
      },

      optimization: {
        n_plus_one: 'prevent', // Prevent N+1 queries
        batching: true, // Batch similar requests
        dataloader: true, // Use DataLoader pattern
        graphql: 'optional' // GraphQL for complex queries
      }
    };
  }

  // Memory Management
  getMemoryOptimizations() {
    return {
      node: {
        maxOldSpaceSize: 4096, // 4GB
        maxSemiSpaceSize: 256, // 256MB
        gcInterval: 100 // Force GC every 100 allocations
      },

      caching: {
        maxSize: '1GB',
        maxAge: 3600, // 1 hour
        strategy: 'LRU' // Least Recently Used
      },

      monitoring: {
        heapUsage: true,
        memoryLeaks: true,
        gc: true
      }
    };
  }

  // Performance Monitoring
  setupMonitoring() {
    return {
      metrics: {
        responseTime: {
          histogram: true,
          percentiles: [50, 90, 95, 99]
        },
        
        throughput: {
          requests_per_second: true,
          concurrent_users: true
        },

        errors: {
          rate: true,
          types: ['4xx', '5xx'],
          alerts: true
        },

        resources: {
          cpu: true,
          memory: true,
          disk: true,
          network: true
        }
      },

      alerts: {
        responseTime: { threshold: 1000, action: 'scale' },
        errorRate: { threshold: 5, action: 'investigate' },
        memory: { threshold: 80, action: 'restart' },
        cpu: { threshold: 90, action: 'scale' }
      },

      dashboards: {
        realtime: true,
        historical: true,
        alerts: true
      }
    };
  }

  // Load Balancing and Scaling
  getScalingStrategy() {
    return {
      horizontal: {
        minInstances: 2,
        maxInstances: 10,
        targetCPU: 70,
        targetMemory: 80,
        scaleUpCooldown: 300, // 5 minutes
        scaleDownCooldown: 600 // 10 minutes
      },

      loadBalancing: {
        algorithm: 'round_robin',
        healthChecks: {
          path: '/health',
          interval: 30,
          timeout: 10,
          unhealthyThreshold: 3
        },
        stickySession: false
      },

      database: {
        readReplicas: 2,
        connectionPooling: true,
        queryOptimization: true,
        indexing: 'automatic'
      }
    };
  }

  // Performance Testing
  getPerformanceTests() {
    return {
      loadTesting: {
        scenarios: [
          {
            name: 'normal_load',
            users: 100,
            duration: '10m',
            rampUp: '2m'
          },
          {
            name: 'peak_load',
            users: 1000,
            duration: '5m',
            rampUp: '1m'
          },
          {
            name: 'stress_test',
            users: 5000,
            duration: '2m',
            rampUp: '30s'
          }
        ],

        assertions: {
          responseTime: { p95: 1000 },
          errorRate: { max: 1 },
          throughput: { min: 100 }
        }
      },

      monitoring: {
        realtime: true,
        reports: true,
        automation: true
      }
    };
  }

  // Cache Implementation
  async get(key, fallback = null) {
    try {
      // Try memory cache first
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        if (cached.expires > Date.now()) {
          return cached.value;
        }
        this.cache.delete(key);
      }

      // Try Redis cache
      if (this.redis) {
        const cached = await this.redis.get(key);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Return fallback or null
      return fallback;
    } catch (error) {
      console.error('Cache get error:', error);
      return fallback;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      // Set in memory cache
      this.cache.set(key, {
        value,
        expires: Date.now() + (ttl * 1000)
      });

      // Set in Redis cache
      if (this.redis) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
      }

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async invalidate(pattern) {
    try {
      // Clear memory cache
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }

      // Clear Redis cache
      if (this.redis) {
        const keys = await this.redis.keys(`*${pattern}*`);
        if (keys.length > 0) {
          await this.redis.del(keys);
        }
      }

      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }

  // Performance metrics
  getPerformanceMetrics() {
    return {
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        version: process.version
      },
      cache: {
        size: this.cache.size,
        hitRate: this.calculateCacheHitRate(),
        memory: this.calculateCacheMemory()
      },
      timing: {
        responseTime: this.getAverageResponseTime(),
        dbQueries: this.getAverageQueryTime(),
        apiCalls: this.getAverageAPITime()
      }
    };
  }

  calculateCacheHitRate() {
    // Mock implementation
    return Math.random() * 100;
  }

  calculateCacheMemory() {
    let memory = 0;
    for (const [key, value] of this.cache) {
      memory += JSON.stringify(value).length;
    }
    return memory;
  }

  getAverageResponseTime() {
    // Mock implementation
    return Math.random() * 200;
  }

  getAverageQueryTime() {
    // Mock implementation
    return Math.random() * 50;
  }

  getAverageAPITime() {
    // Mock implementation
    return Math.random() * 100;
  }
}

module.exports = PerformanceOptimization;