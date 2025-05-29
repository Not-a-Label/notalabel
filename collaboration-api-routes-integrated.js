// Collaboration features module to be integrated into enhanced-backend-with-auth.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads/collaboration');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp3|wav|aiff|m4a|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type for collaboration upload'));
    }
  }
});

function addCollaborationRoutes(app, authenticateToken, dbOptimizer) {
  // Create collaboration tables
  dbOptimizer.db.serialize(() => {
    // Connections table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users (id),
      FOREIGN KEY (user2_id) REFERENCES users (id),
      UNIQUE(user1_id, user2_id)
    )`);

    // Projects table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      genre TEXT,
      status TEXT DEFAULT 'planning',
      deadline DATETIME,
      owner_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id)
    )`);

    // Project collaborators table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS project_collaborators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'collaborator',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(project_id, user_id)
    )`);

    // Project tasks table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS project_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assignee_id INTEGER,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'todo',
      due_date DATETIME,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (project_id) REFERENCES projects (id),
      FOREIGN KEY (assignee_id) REFERENCES users (id),
      FOREIGN KEY (created_by) REFERENCES users (id)
    )`);

    // Task attachments table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS task_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_by INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES project_tasks (id),
      FOREIGN KEY (uploaded_by) REFERENCES users (id)
    )`);

    // Project files table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS project_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_type TEXT,
      description TEXT,
      uploaded_by INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id),
      FOREIGN KEY (uploaded_by) REFERENCES users (id)
    )`);

    // Messages table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT,
      type TEXT DEFAULT 'text',
      file_path TEXT,
      file_name TEXT,
      file_size INTEGER,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (receiver_id) REFERENCES users (id)
    )`);

    // Project messages table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS project_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id),
      FOREIGN KEY (sender_id) REFERENCES users (id)
    )`);

    // Project invitations table
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS project_invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      inviter_id INTEGER NOT NULL,
      invitee_id INTEGER NOT NULL,
      role TEXT DEFAULT 'collaborator',
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      responded_at DATETIME,
      FOREIGN KEY (project_id) REFERENCES projects (id),
      FOREIGN KEY (inviter_id) REFERENCES users (id),
      FOREIGN KEY (invitee_id) REFERENCES users (id)
    )`);

    // Add collaboration fields to users table if they don't exist
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS looking_for_collaborations BOOLEAN DEFAULT 0`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS collaboration_rating REAL DEFAULT 0`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS instruments TEXT`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS looking_for TEXT`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level TEXT`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT`);
    dbOptimizer.db.run(`ALTER TABLE users ADD COLUMN IF NOT EXISTS genres TEXT`);
  });

  // Artist Discovery Routes
  app.get('/api/collaboration/discover/artists', authenticateToken, async (req, res) => {
    try {
      const { 
        genre, 
        skill, 
        location, 
        experience, 
        instrument,
        lookingFor,
        minRating = 0,
        page = 1,
        limit = 20
      } = req.query;

      let query = `
        SELECT u.id, u.username as name, u.display_name as displayName,
               u.location, u.genres, u.skills, u.instruments,
               u.looking_for as lookingFor, u.experience_level as experience,
               u.verified, u.collaboration_rating as rating,
               COUNT(c.id) as collaborations,
               u.profile_image as profileImage, u.bio
        FROM users u
        LEFT JOIN project_collaborators c ON u.id = c.user_id
        WHERE u.id != ? AND u.looking_for_collaborations = 1
      `;
      
      const params = [req.user.userId];

      if (genre) {
        query += ` AND u.genres LIKE ?`;
        params.push(`%${genre}%`);
      }

      if (skill) {
        query += ` AND u.skills LIKE ?`;
        params.push(`%${skill}%`);
      }

      if (location) {
        query += ` AND u.location LIKE ?`;
        params.push(`%${location}%`);
      }

      if (experience) {
        query += ` AND u.experience_level = ?`;
        params.push(experience);
      }

      if (instrument) {
        query += ` AND u.instruments LIKE ?`;
        params.push(`%${instrument}%`);
      }

      if (lookingFor) {
        query += ` AND u.looking_for LIKE ?`;
        params.push(`%${lookingFor}%`);
      }

      query += ` AND u.collaboration_rating >= ?`;
      params.push(minRating);

      query += ` GROUP BY u.id ORDER BY u.collaboration_rating DESC, u.verified DESC`;
      query += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

      const artists = await new Promise((resolve, reject) => {
        dbOptimizer.db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const processedArtists = artists.map(artist => ({
        ...artist,
        genres: artist.genres ? JSON.parse(artist.genres) : [],
        skills: artist.skills ? JSON.parse(artist.skills) : [],
        instruments: artist.instruments ? JSON.parse(artist.instruments) : [],
        lookingFor: artist.lookingFor ? JSON.parse(artist.lookingFor) : [],
        rating: parseFloat(artist.rating) || 0,
        collaborations: parseInt(artist.collaborations) || 0
      }));

      res.json({ artists: processedArtists });
    } catch (error) {
      console.error('Error fetching artists:', error);
      res.status(500).json({ error: 'Failed to fetch artists' });
    }
  });

  app.post('/api/collaboration/discover/connect', authenticateToken, async (req, res) => {
    try {
      const { artistId, message } = req.body;

      const existingConnection = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT id FROM connections WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
          [req.user.userId, artistId, artistId, req.user.userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (existingConnection) {
        return res.status(400).json({ error: 'Connection already exists' });
      }

      const result = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          'INSERT INTO connections (user1_id, user2_id, status, message, created_at) VALUES (?, ?, ?, ?, ?)',
          [req.user.userId, artistId, 'pending', message, new Date().toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.json({ success: true, connectionId: result.id });
    } catch (error) {
      console.error('Error creating connection:', error);
      res.status(500).json({ error: 'Failed to create connection' });
    }
  });

  // Project Management Routes
  app.get('/api/collaboration/projects', authenticateToken, async (req, res) => {
    try {
      const projects = await new Promise((resolve, reject) => {
        dbOptimizer.db.all(`
          SELECT p.*, 
                 GROUP_CONCAT(pc.user_id) as collaborator_ids,
                 GROUP_CONCAT(u.username) as collaborator_names
          FROM projects p
          LEFT JOIN project_collaborators pc ON p.id = pc.project_id
          LEFT JOIN users u ON pc.user_id = u.id
          WHERE p.owner_id = ? OR pc.user_id = ?
          GROUP BY p.id
          ORDER BY p.updated_at DESC
        `, [req.user.userId, req.user.userId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const processedProjects = await Promise.all(projects.map(async (project) => {
        const tasks = await new Promise((resolve, reject) => {
          dbOptimizer.db.all(
            'SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at DESC',
            [project.id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });

        const files = await new Promise((resolve, reject) => {
          dbOptimizer.db.all(
            'SELECT * FROM project_files WHERE project_id = ? ORDER BY uploaded_at DESC',
            [project.id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            }
          );
        });

        const messages = await new Promise((resolve, reject) => {
          dbOptimizer.db.all(`
            SELECT pm.*, u.username as sender_name
            FROM project_messages pm
            JOIN users u ON pm.sender_id = u.id
            WHERE pm.project_id = ?
            ORDER BY pm.created_at DESC
            LIMIT 10
          `, [project.id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        return {
          ...project,
          collaborators: project.collaborator_ids ? 
            project.collaborator_ids.split(',').map((id, index) => ({
              id,
              name: project.collaborator_names.split(',')[index],
              role: 'collaborator'
            })) : [],
          tasks,
          files,
          messages
        };
      }));

      res.json({ projects: processedProjects });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  app.post('/api/collaboration/projects', authenticateToken, async (req, res) => {
    try {
      const { title, description, genre, deadline, collaborators } = req.body;

      const result = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(`
          INSERT INTO projects (title, description, genre, status, deadline, owner_id, created_at, updated_at)
          VALUES (?, ?, ?, 'planning', ?, ?, ?, ?)
        `, [title, description, genre, deadline, req.user.userId, new Date().toISOString(), new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });

      if (collaborators && collaborators.length > 0) {
        for (const collaboratorId of collaborators) {
          await new Promise((resolve, reject) => {
            dbOptimizer.db.run(
              'INSERT INTO project_collaborators (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)',
              [result.id, collaboratorId, 'collaborator', new Date().toISOString()],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      res.json({ success: true, projectId: result.id });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  app.post('/api/collaboration/projects/:id/tasks', authenticateToken, upload.single('attachment'), async (req, res) => {
    try {
      const { title, description, assigneeId, priority, dueDate } = req.body;
      const projectId = req.params.id;

      const result = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(`
          INSERT INTO project_tasks (project_id, title, description, assignee_id, priority, status, due_date, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, 'todo', ?, ?, ?)
        `, [projectId, title, description, assigneeId, priority, dueDate, req.user.userId, new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });

      if (req.file) {
        await new Promise((resolve, reject) => {
          dbOptimizer.db.run(
            'INSERT INTO task_attachments (task_id, filename, file_path, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?)',
            [result.id, req.file.originalname, req.file.path, req.user.userId, new Date().toISOString()],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      res.json({ success: true, taskId: result.id });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.post('/api/collaboration/projects/:id/files', authenticateToken, upload.single('file'), async (req, res) => {
    try {
      const projectId = req.params.id;
      const { description } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(`
          INSERT INTO project_files (project_id, filename, file_path, file_size, file_type, description, uploaded_by, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          projectId, 
          req.file.originalname, 
          req.file.path, 
          req.file.size, 
          req.file.mimetype, 
          description, 
          req.user.userId, 
          new Date().toISOString()
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });

      res.json({ 
        success: true, 
        fileId: result.id,
        filename: req.file.originalname,
        fileSize: req.file.size
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Messaging Routes
  app.get('/api/collaboration/messages/conversations', authenticateToken, async (req, res) => {
    try {
      const conversations = await new Promise((resolve, reject) => {
        dbOptimizer.db.all(`
          SELECT DISTINCT
            CASE 
              WHEN c.user1_id = ? THEN c.user2_id 
              ELSE c.user1_id 
            END as other_user_id,
            CASE 
              WHEN c.user1_id = ? THEN u2.username 
              ELSE u1.username 
            END as other_user_name,
            CASE 
              WHEN c.user1_id = ? THEN u2.profile_image 
              ELSE u1.profile_image 
            END as other_user_avatar,
            m.content as last_message,
            m.created_at as last_message_time,
            COUNT(CASE WHEN m.receiver_id = ? AND m.read_at IS NULL THEN 1 END) as unread_count
          FROM connections c
          JOIN users u1 ON c.user1_id = u1.id
          JOIN users u2 ON c.user2_id = u2.id
          LEFT JOIN messages m ON (
            (m.sender_id = c.user1_id AND m.receiver_id = c.user2_id) OR
            (m.sender_id = c.user2_id AND m.receiver_id = c.user1_id)
          )
          WHERE (c.user1_id = ? OR c.user2_id = ?) AND c.status = 'accepted'
          GROUP BY other_user_id, other_user_name, other_user_avatar
          ORDER BY last_message_time DESC
        `, [req.user.userId, req.user.userId, req.user.userId, req.user.userId, req.user.userId, req.user.userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      res.json({ conversations });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.get('/api/collaboration/messages/:userId', authenticateToken, async (req, res) => {
    try {
      const otherUserId = req.params.userId;
      const { page = 1, limit = 50 } = req.query;

      const messages = await new Promise((resolve, reject) => {
        dbOptimizer.db.all(`
          SELECT m.*, u.username as sender_name
          FROM messages m
          JOIN users u ON m.sender_id = u.id
          WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
          ORDER BY m.created_at DESC
          LIMIT ? OFFSET ?
        `, [
          req.user.userId, otherUserId, otherUserId, req.user.userId,
          parseInt(limit), (parseInt(page) - 1) * parseInt(limit)
        ],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          'UPDATE messages SET read_at = ? WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL',
          [new Date().toISOString(), otherUserId, req.user.userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({ messages: messages.reverse() });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/collaboration/messages', authenticateToken, upload.single('attachment'), async (req, res) => {
    try {
      const { receiverId, content, type = 'text' } = req.body;

      let messageData = {
        sender_id: req.user.userId,
        receiver_id: receiverId,
        content,
        type,
        created_at: new Date().toISOString()
      };

      if (req.file) {
        messageData.type = 'file';
        messageData.file_path = req.file.path;
        messageData.file_name = req.file.originalname;
        messageData.file_size = req.file.size;
      }

      const result = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(`
          INSERT INTO messages (sender_id, receiver_id, content, type, file_path, file_name, file_size, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          messageData.sender_id,
          messageData.receiver_id,
          messageData.content,
          messageData.type,
          messageData.file_path || null,
          messageData.file_name || null,
          messageData.file_size || null,
          messageData.created_at
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });

      res.json({ success: true, messageId: result.id });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  app.post('/api/collaboration/messages/:messageId/read', authenticateToken, async (req, res) => {
    try {
      const messageId = req.params.messageId;

      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          'UPDATE messages SET read_at = ? WHERE id = ? AND receiver_id = ?',
          [new Date().toISOString(), messageId, req.user.userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  // Project invitations
  app.post('/api/collaboration/projects/:id/invite', authenticateToken, async (req, res) => {
    try {
      const { artistId, role = 'collaborator', message } = req.body;
      const projectId = req.params.id;

      const result = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(`
          INSERT INTO project_invitations (project_id, inviter_id, invitee_id, role, message, status, created_at)
          VALUES (?, ?, ?, ?, ?, 'pending', ?)
        `, [projectId, req.user.userId, artistId, role, message, new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        });
      });

      res.json({ success: true, inviteId: result.id });
    } catch (error) {
      console.error('Error sending project invitation:', error);
      res.status(500).json({ error: 'Failed to send project invitation' });
    }
  });

  console.log('Collaboration routes added successfully');
}

module.exports = addCollaborationRoutes;