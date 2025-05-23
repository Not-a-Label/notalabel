import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Redis client for caching and pub/sub
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisEnabled = process.env.REDIS_ENABLED !== 'false'; // Allow explicit disabling
const isVercel = process.env.VERCEL === '1';

// Create Redis client with more robust configuration
const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Back off exponentially, max 10 seconds
      const delay = Math.min(Math.pow(2, retries) * 100, 10000);
      return delay;
    },
    connectTimeout: isVercel ? 5000 : 10000, // Shorter timeout in Vercel
  }
});

// Track if Redis is connected
let isRedisConnected = false;

// Connect to Redis with retry
const connectWithRetry = async (maxRetries = 3) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      if (!redisEnabled) {
        logger.info('Redis is explicitly disabled by configuration');
        return false;
      }
      
      await redisClient.connect();
      isRedisConnected = true;
      logger.info('Successfully connected to Redis');
      return true;
    } catch (error) {
      attempts++;
      logger.warn(`Redis connection attempt ${attempts}/${maxRetries} failed:`, error);
      
      if (attempts >= maxRetries) {
        logger.warn('Maximum Redis connection attempts reached - running without Redis');
        return false;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempts) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
};

// Initialize connection
(async () => {
  try {
    await connectWithRetry();
  } catch (error) {
    isRedisConnected = false;
    logger.warn('Redis initialization error - running without Redis:', error);
  }
})();

// Handle Redis errors
redisClient.on('error', (err) => {
  if (isRedisConnected) {
    logger.warn('Redis error - switching to local mode:', err);
    isRedisConnected = false;
  }
});

// Handle Redis reconnection
redisClient.on('reconnecting', () => {
  logger.info('Attempting to reconnect to Redis...');
});

redisClient.on('connect', () => {
  logger.info('Redis connection established');
  isRedisConnected = true;
});

// Cache middleware for API responses
export const cacheMiddleware = (duration: number) => {
  return async (req: any, res: any, next: any) => {
    // Skip caching if Redis is not available
    if (!isRedisConnected || req.method !== 'GET') {
      return next();
    }

    const key = `api:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        return res.status(200).json({
          ...parsedData,
          source: 'cache'
        });
      }

      // Replace res.json with our custom implementation to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        if (isRedisConnected) {
          redisClient.setEx(key, duration, JSON.stringify(data))
            .catch(err => logger.error('Redis cache error:', err));
        }
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Pub/Sub for event-driven communication
export const publishEvent = async (channel: string, message: any) => {
  if (!isRedisConnected) {
    logger.info(`Redis not connected - would publish to ${channel}: ${typeof message === 'string' ? message : JSON.stringify(message)}`);
    return false;
  }

  try {
    const stringMessage = typeof message === 'string' 
      ? message 
      : JSON.stringify(message);
    
    await redisClient.publish(channel, stringMessage);
    logger.info(`Published to ${channel}`);
    return true;
  } catch (error) {
    logger.error('Event publishing error:', error);
    return false;
  }
};

export const subscribeToChannel = async (channel: string, callback: (message: string) => void) => {
  if (!isRedisConnected) {
    logger.warn(`Redis not connected - cannot subscribe to ${channel}`);
    return null;
  }

  try {
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
    
    logger.info(`Subscribed to channel: ${channel}`);
    return subscriber;
  } catch (error) {
    logger.error(`Subscription error for channel ${channel}:`, error);
    return null; // Return null instead of throwing to be more resilient
  }
};

// Check if Redis is connected (for health checks)
export const isRedisAvailable = () => isRedisConnected;

export default redisClient; 