// Modified backend startup to support WebSockets
const http = require('http');
const path = require('path');

// Get the enhanced backend app
const app = require('./enhanced-backend-with-auth');

// Create HTTP server
const server = http.createServer(app);

// Get database optimizer from app
const dbOptimizer = app.locals.dbOptimizer || { db: null };

// Setup WebSocket notifications
const setupRealtimeNotifications = require('./realtime-notifications');
const { io, notifications, notificationEvents, storeNotification, addNotificationRoutes } = 
  setupRealtimeNotifications(server, dbOptimizer);

// Add notification routes to app
const authenticateToken = app.locals.authenticateToken || ((req, res, next) => next());
addNotificationRoutes(app, authenticateToken);

// Make notifications available globally
app.locals.notifications = notifications;
app.locals.notificationEvents = notificationEvents;
app.locals.storeNotification = storeNotification;

// Start server with WebSocket support
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`WebSocket-enabled backend running on port ${PORT}`);
  console.log(`Real-time notifications active`);
});

module.exports = { app, server, io };