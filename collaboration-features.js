// Artist Collaboration Features
// Find collaborators, manage projects, share splits

function addCollaborationRoutes(app, authenticateToken, dbOptimizer) {
  
  // Create collaboration tables
  const createCollabTables = () => {
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS collaborations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      genre TEXT,
      creator_id INTEGER NOT NULL,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deadline DATETIME,
      FOREIGN KEY (creator_id) REFERENCES users (id)
    )`);

    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS collaboration_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collaboration_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      split_percentage REAL,
      status TEXT DEFAULT 'pending',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collaboration_id) REFERENCES collaborations (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(collaboration_id, user_id)
    )`);

    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS collaboration_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collaboration_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collaboration_id) REFERENCES collaborations (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
  };

  createCollabTables();

  // Create new collaboration
  app.post('/api/collaborations/create', authenticateToken, async (req, res) => {
    try {
      const { title, description, genre, deadline, roles } = req.body;
      const creatorId = req.user.userId;

      if (!title || !description) {
        return res.status(400).json({ error: 'Title and description required' });
      }

      const collabId = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO collaborations (title, description, genre, creator_id, deadline) 
           VALUES (?, ?, ?, ?, ?)`,
          [title, description, genre, creatorId, deadline || null],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Add creator as first member
      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO collaboration_members (collaboration_id, user_id, role, status) 
           VALUES (?, ?, ?, 'accepted')`,
          [collabId, creatorId, 'Creator'],
          (err) => err ? reject(err) : resolve()
        );
      });

      res.json({
        success: true,
        collaborationId: collabId,
        message: 'Collaboration created successfully'
      });

    } catch (error) {
      console.error('Create collaboration error:', error);
      res.status(500).json({ 
        error: 'Failed to create collaboration',
        details: error.message 
      });
    }
  });

  // Browse open collaborations
  app.get('/api/collaborations/browse', authenticateToken, async (req, res) => {
    try {
      const { genre, role, status = 'open' } = req.query;
      const userId = req.user.userId;

      let sql = `
        SELECT 
          c.*,
          u.username as creator_name,
          u.artist_name as creator_artist_name,
          COUNT(DISTINCT cm.user_id) as member_count
        FROM collaborations c
        JOIN users u ON c.creator_id = u.id
        LEFT JOIN collaboration_members cm ON c.id = cm.collaboration_id
        WHERE c.status = ?
      `;
      
      const params = [status];

      if (genre) {
        sql += ' AND c.genre = ?';
        params.push(genre);
      }

      sql += ' GROUP BY c.id ORDER BY c.created_at DESC LIMIT 20';

      const collaborations = await dbOptimizer.cachedQuery(sql, params);

      res.json({
        success: true,
        collaborations,
        total: collaborations.length
      });

    } catch (error) {
      console.error('Browse collaborations error:', error);
      res.status(500).json({ 
        error: 'Failed to browse collaborations',
        details: error.message 
      });
    }
  });

  // Get user's collaborations
  app.get('/api/collaborations/my', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;

      const collaborations = await dbOptimizer.cachedQuery(
        `SELECT 
          c.*,
          cm.role,
          cm.split_percentage,
          cm.status as member_status,
          COUNT(DISTINCT cm2.user_id) as total_members
        FROM collaborations c
        JOIN collaboration_members cm ON c.id = cm.collaboration_id
        LEFT JOIN collaboration_members cm2 ON c.id = cm2.collaboration_id
        WHERE cm.user_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC`,
        [userId],
        `my_collaborations_${userId}`
      );

      res.json({
        success: true,
        collaborations,
        stats: {
          active: collaborations.filter(c => c.status === 'active').length,
          pending: collaborations.filter(c => c.member_status === 'pending').length,
          completed: collaborations.filter(c => c.status === 'completed').length
        }
      });

    } catch (error) {
      console.error('Get my collaborations error:', error);
      res.status(500).json({ 
        error: 'Failed to get collaborations',
        details: error.message 
      });
    }
  });

  // Join collaboration
  app.post('/api/collaborations/:id/join', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { role, message } = req.body;
      const userId = req.user.userId;

      // Check if already a member
      const existing = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT id FROM collaboration_members WHERE collaboration_id = ? AND user_id = ?',
          [id, userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (existing) {
        return res.status(400).json({ error: 'Already a member of this collaboration' });
      }

      // Add as pending member
      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO collaboration_members (collaboration_id, user_id, role, status) 
           VALUES (?, ?, ?, 'pending')`,
          [id, userId, role || 'Collaborator'],
          (err) => err ? reject(err) : resolve()
        );
      });

      // Add join message
      if (message) {
        await new Promise((resolve, reject) => {
          dbOptimizer.db.run(
            `INSERT INTO collaboration_messages (collaboration_id, user_id, message) 
             VALUES (?, ?, ?)`,
            [id, userId, `Join request: ${message}`],
            (err) => err ? reject(err) : resolve()
          );
        });
      }

      res.json({
        success: true,
        message: 'Join request sent successfully'
      });

    } catch (error) {
      console.error('Join collaboration error:', error);
      res.status(500).json({ 
        error: 'Failed to join collaboration',
        details: error.message 
      });
    }
  });

  // Get collaboration details
  app.get('/api/collaborations/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Get collaboration info
      const collaboration = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          `SELECT c.*, u.username as creator_name, u.artist_name as creator_artist_name
           FROM collaborations c
           JOIN users u ON c.creator_id = u.id
           WHERE c.id = ?`,
          [id],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (!collaboration) {
        return res.status(404).json({ error: 'Collaboration not found' });
      }

      // Get members
      const members = await dbOptimizer.cachedQuery(
        `SELECT 
          cm.*,
          u.username,
          u.artist_name,
          u.genre as user_genre
        FROM collaboration_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.collaboration_id = ?`,
        [id]
      );

      // Get recent messages
      const messages = await dbOptimizer.cachedQuery(
        `SELECT 
          m.*,
          u.username,
          u.artist_name
        FROM collaboration_messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.collaboration_id = ?
        ORDER BY m.created_at DESC
        LIMIT 50`,
        [id]
      );

      // Check if user is a member
      const isMember = members.some(m => m.user_id === userId);

      res.json({
        success: true,
        collaboration,
        members,
        messages: isMember ? messages : [],
        isMember,
        isCreator: collaboration.creator_id === userId
      });

    } catch (error) {
      console.error('Get collaboration details error:', error);
      res.status(500).json({ 
        error: 'Failed to get collaboration details',
        details: error.message 
      });
    }
  });

  // Send collaboration message
  app.post('/api/collaborations/:id/message', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = req.user.userId;

      if (!message) {
        return res.status(400).json({ error: 'Message required' });
      }

      // Verify member
      const isMember = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT id FROM collaboration_members WHERE collaboration_id = ? AND user_id = ? AND status = "accepted"',
          [id, userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (!isMember) {
        return res.status(403).json({ error: 'Not a member of this collaboration' });
      }

      const messageId = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO collaboration_messages (collaboration_id, user_id, message) 
           VALUES (?, ?, ?)`,
          [id, userId, message],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      res.json({
        success: true,
        messageId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ 
        error: 'Failed to send message',
        details: error.message 
      });
    }
  });

  // Find collaborators by skills/genre
  app.get('/api/collaborations/find-artists', authenticateToken, async (req, res) => {
    try {
      const { genre, skills, verified } = req.query;
      const userId = req.user.userId;

      let sql = `
        SELECT 
          u.id,
          u.username,
          u.artist_name,
          u.genre,
          u.bio,
          u.verified,
          COUNT(DISTINCT c.id) as collaboration_count,
          AVG(cm.split_percentage) as avg_split
        FROM users u
        LEFT JOIN collaboration_members cm ON u.id = cm.user_id
        LEFT JOIN collaborations c ON cm.collaboration_id = c.id
        WHERE u.id != ? AND u.active = 1
      `;
      
      const params = [userId];

      if (genre) {
        sql += ' AND u.genre = ?';
        params.push(genre);
      }

      if (verified === 'true') {
        sql += ' AND u.verified = 1';
      }

      sql += ' GROUP BY u.id ORDER BY collaboration_count DESC LIMIT 20';

      const artists = await dbOptimizer.cachedQuery(sql, params);

      res.json({
        success: true,
        artists,
        total: artists.length
      });

    } catch (error) {
      console.error('Find artists error:', error);
      res.status(500).json({ 
        error: 'Failed to find artists',
        details: error.message 
      });
    }
  });

  console.log('Collaboration routes added successfully');
}

module.exports = addCollaborationRoutes;