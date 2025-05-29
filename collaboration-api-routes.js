const express = require('express');
const router = express.Router();
const db = require('./database');
const auth = require('./middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/collaboration/');
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

// Artist Discovery Routes
router.get('/discover/artists', auth, async (req, res) => {
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
      LEFT JOIN collaborations c ON u.id = c.artist_id
      WHERE u.id != ? AND u.looking_for_collaborations = 1
    `;
    
    const params = [req.user.id];

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

    const artists = await db.all(query, params);

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

router.post('/discover/connect', auth, async (req, res) => {
  try {
    const { artistId, message } = req.body;

    const existingConnection = await db.get(
      'SELECT id FROM connections WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
      [req.user.id, artistId, artistId, req.user.id]
    );

    if (existingConnection) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    const connectionId = await db.run(
      'INSERT INTO connections (user1_id, user2_id, status, message, created_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, artistId, 'pending', message, new Date().toISOString()]
    );

    res.json({ success: true, connectionId: connectionId.lastID });
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ error: 'Failed to create connection' });
  }
});

// Project Management Routes
router.get('/projects', auth, async (req, res) => {
  try {
    const projects = await db.all(`
      SELECT p.*, 
             GROUP_CONCAT(pc.user_id) as collaborator_ids,
             GROUP_CONCAT(u.username) as collaborator_names
      FROM projects p
      LEFT JOIN project_collaborators pc ON p.id = pc.project_id
      LEFT JOIN users u ON pc.user_id = u.id
      WHERE p.owner_id = ? OR pc.user_id = ?
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `, [req.user.id, req.user.id]);

    const processedProjects = await Promise.all(projects.map(async (project) => {
      const tasks = await db.all(
        'SELECT * FROM project_tasks WHERE project_id = ? ORDER BY created_at DESC',
        [project.id]
      );

      const files = await db.all(
        'SELECT * FROM project_files WHERE project_id = ? ORDER BY uploaded_at DESC',
        [project.id]
      );

      const messages = await db.all(`
        SELECT pm.*, u.username as sender_name
        FROM project_messages pm
        JOIN users u ON pm.sender_id = u.id
        WHERE pm.project_id = ?
        ORDER BY pm.created_at DESC
        LIMIT 10
      `, [project.id]);

      return {
        ...project,
        collaborators: project.collaborator_ids ? 
          project.collaborator_ids.split(',').map((id, index) => ({
            id,
            name: project.collaborator_names.split(',')[index],
            role: 'collaborator'
          })) : [],
        tasks: tasks.map(task => ({
          ...task,
          assignee: task.assignee_id ? { id: task.assignee_id, name: task.assignee_name } : null
        })),
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

router.post('/projects', auth, async (req, res) => {
  try {
    const { title, description, genre, deadline, collaborators } = req.body;

    const projectId = await db.run(`
      INSERT INTO projects (title, description, genre, status, deadline, owner_id, created_at, updated_at)
      VALUES (?, ?, ?, 'planning', ?, ?, ?, ?)
    `, [title, description, genre, deadline, req.user.id, new Date().toISOString(), new Date().toISOString()]);

    if (collaborators && collaborators.length > 0) {
      for (const collaboratorId of collaborators) {
        await db.run(
          'INSERT INTO project_collaborators (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)',
          [projectId.lastID, collaboratorId, 'collaborator', new Date().toISOString()]
        );
      }
    }

    res.json({ success: true, projectId: projectId.lastID });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.post('/projects/:id/tasks', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, assigneeId, priority, dueDate } = req.body;
    const projectId = req.params.id;

    const taskId = await db.run(`
      INSERT INTO project_tasks (project_id, title, description, assignee_id, priority, status, due_date, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, 'todo', ?, ?, ?)
    `, [projectId, title, description, assigneeId, priority, dueDate, req.user.id, new Date().toISOString()]);

    if (req.file) {
      await db.run(
        'INSERT INTO task_attachments (task_id, filename, file_path, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?)',
        [taskId.lastID, req.file.originalname, req.file.path, req.user.id, new Date().toISOString()]
      );
    }

    res.json({ success: true, taskId: taskId.lastID });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.post('/projects/:id/files', auth, upload.single('file'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const { description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = await db.run(`
      INSERT INTO project_files (project_id, filename, file_path, file_size, file_type, description, uploaded_by, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      projectId, 
      req.file.originalname, 
      req.file.path, 
      req.file.size, 
      req.file.mimetype, 
      description, 
      req.user.id, 
      new Date().toISOString()
    ]);

    res.json({ 
      success: true, 
      fileId: fileId.lastID,
      filename: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Messaging Routes
router.get('/messages/conversations', auth, async (req, res) => {
  try {
    const conversations = await db.all(`
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
    `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const { page = 1, limit = 50 } = req.query;

    const messages = await db.all(`
      SELECT m.*, u.username as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [
      req.user.id, otherUserId, otherUserId, req.user.id,
      parseInt(limit), (parseInt(page) - 1) * parseInt(limit)
    ]);

    await db.run(
      'UPDATE messages SET read_at = ? WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL',
      [new Date().toISOString(), otherUserId, req.user.id]
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/messages', auth, upload.single('attachment'), async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;

    let messageData = {
      sender_id: req.user.id,
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

    const messageId = await db.run(`
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
    ]);

    res.json({ success: true, messageId: messageId.lastID });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const messageId = req.params.messageId;

    await db.run(
      'UPDATE messages SET read_at = ? WHERE id = ? AND receiver_id = ?',
      [new Date().toISOString(), messageId, req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Project invitations
router.post('/projects/:id/invite', auth, async (req, res) => {
  try {
    const { artistId, role = 'collaborator', message } = req.body;
    const projectId = req.params.id;

    const inviteId = await db.run(`
      INSERT INTO project_invitations (project_id, inviter_id, invitee_id, role, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `, [projectId, req.user.id, artistId, role, message, new Date().toISOString()]);

    res.json({ success: true, inviteId: inviteId.lastID });
  } catch (error) {
    console.error('Error sending project invitation:', error);
    res.status(500).json({ error: 'Failed to send project invitation' });
  }
});

module.exports = router;