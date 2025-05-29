// Real-time Notifications with Socket.io
const socketIO = require('socket.io');

function setupRealtimeNotifications(server, dbOptimizer) {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store user socket connections
  const userSockets = new Map();

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify JWT token (simplified for demo)
    try {
      // In production, properly verify JWT
      const userId = socket.handshake.auth.userId;
      socket.userId = userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Store socket connection
    if (!userSockets.has(socket.userId)) {
      userSockets.set(socket.userId, new Set());
    }
    userSockets.get(socket.userId).add(socket.id);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join collaboration rooms
    socket.on('join:collaboration', async (collaborationId) => {
      // Verify user is member of collaboration
      const isMember = await new Promise((resolve) => {
        dbOptimizer.db.get(
          'SELECT id FROM collaboration_members WHERE collaboration_id = ? AND user_id = ?',
          [collaborationId, socket.userId],
          (err, row) => resolve(!!row)
        );
      });

      if (isMember) {
        socket.join(`collaboration:${collaborationId}`);
        socket.emit('joined:collaboration', { collaborationId });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      const userSocketSet = userSockets.get(socket.userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          userSockets.delete(socket.userId);
        }
      }
    });
  });

  // Notification functions
  const notifications = {
    // Send notification to specific user
    sendToUser: (userId, event, data) => {
      io.to(`user:${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    },

    // Send notification to all collaboration members
    sendToCollaboration: (collaborationId, event, data) => {
      io.to(`collaboration:${collaborationId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    },

    // Broadcast to all connected users
    broadcast: (event, data) => {
      io.emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Notification types
  const notificationEvents = {
    // New collaboration request
    collaborationRequest: async (data) => {
      notifications.sendToUser(data.targetUserId, 'notification:collaboration', {
        type: 'collaboration_request',
        title: 'New Collaboration Request',
        message: `${data.requesterName} wants to collaborate on "${data.collaborationTitle}"`,
        actionUrl: `/collaborations/${data.collaborationId}`,
        priority: 'high'
      });
    },

    // Collaboration message
    collaborationMessage: (data) => {
      notifications.sendToCollaboration(data.collaborationId, 'collaboration:message', {
        userId: data.userId,
        username: data.username,
        message: data.message,
        collaborationId: data.collaborationId
      });
    },

    // Analytics milestone
    analyticsMilestone: (data) => {
      notifications.sendToUser(data.userId, 'notification:milestone', {
        type: 'analytics_milestone',
        title: 'Milestone Reached! 🎉',
        message: data.message,
        metric: data.metric,
        value: data.value,
        priority: 'medium'
      });
    },

    // Playlist update
    playlistUpdate: (data) => {
      notifications.sendToUser(data.userId, 'notification:playlist', {
        type: 'playlist_update',
        title: 'Playlist Update',
        message: `Your track "${data.trackName}" was ${data.action} ${data.playlistName}`,
        platform: data.platform,
        priority: 'high'
      });
    },

    // AI recommendation
    aiRecommendation: (data) => {
      notifications.sendToUser(data.userId, 'notification:ai', {
        type: 'ai_recommendation',
        title: 'AI Insight Available',
        message: data.recommendation,
        category: data.category,
        actionUrl: '/dashboard/ai-insights',
        priority: 'low'
      });
    },

    // System announcement
    systemAnnouncement: (data) => {
      notifications.broadcast('notification:system', {
        type: 'system_announcement',
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium'
      });
    }
  };

  // Create notifications table
  const createNotificationTable = () => {
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log('Notifications table created');
  };

  createNotificationTable();

  // Store notification in database
  const storeNotification = async (userId, type, title, message, data = {}) => {
    return new Promise((resolve, reject) => {
      dbOptimizer.db.run(
        `INSERT INTO notifications (user_id, type, title, message, data) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, type, title, message, JSON.stringify(data)],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  };

  // API endpoints for notifications
  const addNotificationRoutes = (app, authenticateToken) => {
    // Get user notifications
    app.get('/api/notifications', authenticateToken, async (req, res) => {
      try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 50;
        const unreadOnly = req.query.unread === 'true';

        let sql = 'SELECT * FROM notifications WHERE user_id = ?';
        if (unreadOnly) {
          sql += ' AND read = 0';
        }
        sql += ' ORDER BY created_at DESC LIMIT ?';

        const notifications = await dbOptimizer.cachedQuery(sql, [userId, limit]);

        res.json({
          success: true,
          notifications,
          unreadCount: notifications.filter(n => !n.read).length
        });

      } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ 
          error: 'Failed to get notifications',
          details: error.message 
        });
      }
    });

    // Mark notification as read
    app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
      try {
        const { id } = req.params;
        const userId = req.user.userId;

        await new Promise((resolve, reject) => {
          dbOptimizer.db.run(
            'UPDATE notifications SET read = 1, read_at = datetime("now") WHERE id = ? AND user_id = ?',
            [id, userId],
            (err) => err ? reject(err) : resolve()
          );
        });

        res.json({
          success: true,
          message: 'Notification marked as read'
        });

      } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ 
          error: 'Failed to mark notification as read',
          details: error.message 
        });
      }
    });

    // Mark all as read
    app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
      try {
        const userId = req.user.userId;

        await new Promise((resolve, reject) => {
          dbOptimizer.db.run(
            'UPDATE notifications SET read = 1, read_at = datetime("now") WHERE user_id = ? AND read = 0',
            [userId],
            (err) => err ? reject(err) : resolve()
          );
        });

        res.json({
          success: true,
          message: 'All notifications marked as read'
        });

      } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ 
          error: 'Failed to mark all as read',
          details: error.message 
        });
      }
    });

    // Send test notification
    app.post('/api/notifications/test', authenticateToken, async (req, res) => {
      try {
        const userId = req.user.userId;
        
        // Store in database
        await storeNotification(
          userId,
          'test',
          'Test Notification',
          'This is a test real-time notification!',
          { test: true }
        );

        // Send real-time notification
        notifications.sendToUser(userId, 'notification:test', {
          type: 'test',
          title: 'Test Notification',
          message: 'This is a test real-time notification!',
          priority: 'low'
        });

        res.json({
          success: true,
          message: 'Test notification sent'
        });

      } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({ 
          error: 'Failed to send test notification',
          details: error.message 
        });
      }
    });
  };

  // Return the notification system
  return {
    io,
    notifications,
    notificationEvents,
    storeNotification,
    addNotificationRoutes
  };
}

module.exports = setupRealtimeNotifications;