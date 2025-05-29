// Security and Rate Limiting Middleware
const rateLimit = require("express-rate-limit");

function setupSecurityMiddleware(app) {
  // General API rate limit
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: "Too many requests, please try again later."
  });

  // Strict rate limit for auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    skipSuccessfulRequests: true
  });

  // Apply rate limiters
  app.use("/api/", generalLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/login", authLimiter);

  console.log("Security middleware configured");
}

module.exports = setupSecurityMiddleware;
