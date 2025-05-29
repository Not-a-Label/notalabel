// Music File Upload and Storage System
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

function addMusicUploadRoutes(app, authenticateToken, dbOptimizer) {
  
  // Create music tables
  const createMusicTables = () => {
    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      artist_name TEXT,
      album TEXT,
      genre TEXT,
      duration INTEGER,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      file_hash TEXT,
      cover_art_path TEXT,
      waveform_data TEXT,
      bpm INTEGER,
      key_signature TEXT,
      mood TEXT,
      tags TEXT,
      play_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      is_public BOOLEAN DEFAULT 1,
      is_downloadable BOOLEAN DEFAULT 0,
      release_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS track_plays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL,
      user_id INTEGER,
      ip_address TEXT,
      play_duration INTEGER,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (track_id) REFERENCES tracks (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS track_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(track_id, user_id),
      FOREIGN KEY (track_id) REFERENCES tracks (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      cover_image_path TEXT,
      is_public BOOLEAN DEFAULT 1,
      play_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    dbOptimizer.db.run(`CREATE TABLE IF NOT EXISTS playlist_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      track_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(playlist_id, track_id),
      FOREIGN KEY (playlist_id) REFERENCES playlists (id),
      FOREIGN KEY (track_id) REFERENCES tracks (id)
    )`);

    console.log('Music tables created');
  };

  createMusicTables();

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const userId = req.user.userId;
      const uploadDir = path.join(__dirname, 'uploads', 'music', userId.toString());
      
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `track-${uniqueSuffix}${ext}`);
    }
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /mp3|wav|m4a|flac|ogg/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only MP3, WAV, M4A, FLAC, and OGG files are allowed.'));
      }
    }
  });

  // Upload track
  app.post('/api/music/upload', authenticateToken, upload.single('track'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { title, album, genre, tags, isPublic, isDownloadable } = req.body;
      const userId = req.user.userId;

      // Get user info for artist name
      const user = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT artist_name, username FROM users WHERE id = ?',
          [userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      // Calculate file hash for duplicate detection
      const fileBuffer = await fs.readFile(req.file.path);
      const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');

      // Check for duplicate
      const duplicate = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT id, title FROM tracks WHERE file_hash = ?',
          [fileHash],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (duplicate) {
        // Remove uploaded file
        await fs.unlink(req.file.path);
        return res.status(409).json({ 
          error: 'Duplicate track detected',
          existingTrack: duplicate
        });
      }

      // Save track to database
      const trackId = await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          `INSERT INTO tracks (
            user_id, title, artist_name, album, genre, 
            file_path, file_size, file_hash, tags, 
            is_public, is_downloadable
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            title || path.basename(req.file.originalname, path.extname(req.file.originalname)),
            user.artist_name || user.username,
            album || null,
            genre || null,
            req.file.path,
            req.file.size,
            fileHash,
            tags || null,
            isPublic !== 'false' ? 1 : 0,
            isDownloadable === 'true' ? 1 : 0
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Log upload event
      await new Promise((resolve) => {
        dbOptimizer.db.run(
          'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
          ['track_uploaded', userId, JSON.stringify({ trackId, title })],
          () => resolve()
        );
      });

      res.json({
        success: true,
        trackId,
        message: 'Track uploaded successfully',
        track: {
          id: trackId,
          title: title || req.file.originalname,
          artist: user.artist_name || user.username,
          fileSize: req.file.size,
          uploadDate: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      // Clean up file if error
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      res.status(500).json({ 
        error: 'Failed to upload track',
        details: error.message 
      });
    }
  });

  // Get user's tracks
  app.get('/api/music/my-tracks', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const tracks = await dbOptimizer.cachedQuery(
        `SELECT 
          id, title, artist_name, album, genre, duration,
          play_count, like_count, share_count,
          is_public, is_downloadable, created_at
        FROM tracks 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?`,
        [userId, limit, offset],
        `my_tracks_${userId}_${limit}_${offset}`
      );

      const totalCount = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT COUNT(*) as count FROM tracks WHERE user_id = ?',
          [userId],
          (err, row) => err ? reject(err) : resolve(row.count)
        );
      });

      res.json({
        success: true,
        tracks,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + tracks.length < totalCount
        }
      });

    } catch (error) {
      console.error('Get tracks error:', error);
      res.status(500).json({ 
        error: 'Failed to get tracks',
        details: error.message 
      });
    }
  });

  // Get public tracks (discover)
  app.get('/api/music/discover', async (req, res) => {
    try {
      const { genre, mood, search } = req.query;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      let sql = `
        SELECT 
          t.id, t.title, t.artist_name, t.album, t.genre, t.duration,
          t.play_count, t.like_count, t.share_count, t.created_at,
          u.username, u.verified
        FROM tracks t
        JOIN users u ON t.user_id = u.id
        WHERE t.is_public = 1
      `;
      
      const params = [];

      if (genre) {
        sql += ' AND t.genre = ?';
        params.push(genre);
      }

      if (mood) {
        sql += ' AND t.mood = ?';
        params.push(mood);
      }

      if (search) {
        sql += ' AND (t.title LIKE ? OR t.artist_name LIKE ? OR t.tags LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const tracks = await dbOptimizer.cachedQuery(sql, params);

      res.json({
        success: true,
        tracks,
        filters: { genre, mood, search }
      });

    } catch (error) {
      console.error('Discover error:', error);
      res.status(500).json({ 
        error: 'Failed to get tracks',
        details: error.message 
      });
    }
  });

  // Stream track
  app.get('/api/music/stream/:trackId', async (req, res) => {
    try {
      const { trackId } = req.params;
      const userId = req.user?.userId || null;

      // Get track info
      const track = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT * FROM tracks WHERE id = ? AND (is_public = 1 OR user_id = ?)',
          [trackId, userId || -1],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }

      // Check if file exists
      try {
        await fs.access(track.file_path);
      } catch {
        return res.status(404).json({ error: 'Track file not found' });
      }

      // Log play
      await new Promise((resolve) => {
        dbOptimizer.db.run(
          'INSERT INTO track_plays (track_id, user_id, ip_address) VALUES (?, ?, ?)',
          [trackId, userId, req.ip],
          () => resolve()
        );
      });

      // Increment play count
      await new Promise((resolve) => {
        dbOptimizer.db.run(
          'UPDATE tracks SET play_count = play_count + 1 WHERE id = ?',
          [trackId],
          () => resolve()
        );
      });

      // Stream the file
      const stat = await fs.stat(track.file_path);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Support partial content for seeking
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        });
        
        const stream = require('fs').createReadStream(track.file_path, { start, end });
        stream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        });
        
        const stream = require('fs').createReadStream(track.file_path);
        stream.pipe(res);
      }

    } catch (error) {
      console.error('Stream error:', error);
      res.status(500).json({ 
        error: 'Failed to stream track',
        details: error.message 
      });
    }
  });

  // Like/unlike track
  app.post('/api/music/tracks/:trackId/like', authenticateToken, async (req, res) => {
    try {
      const { trackId } = req.params;
      const userId = req.user.userId;

      // Check if already liked
      const existing = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT id FROM track_likes WHERE track_id = ? AND user_id = ?',
          [trackId, userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (existing) {
        // Unlike
        await new Promise((resolve, reject) => {
          dbOptimizer.db.run(
            'DELETE FROM track_likes WHERE track_id = ? AND user_id = ?',
            [trackId, userId],
            (err) => err ? reject(err) : resolve()
          );
        });

        await new Promise((resolve) => {
          dbOptimizer.db.run(
            'UPDATE tracks SET like_count = like_count - 1 WHERE id = ?',
            [trackId],
            () => resolve()
          );
        });

        res.json({
          success: true,
          liked: false,
          message: 'Track unliked'
        });
      } else {
        // Like
        await new Promise((resolve, reject) => {
          dbOptimizer.db.run(
            'INSERT INTO track_likes (track_id, user_id) VALUES (?, ?)',
            [trackId, userId],
            (err) => err ? reject(err) : resolve()
          );
        });

        await new Promise((resolve) => {
          dbOptimizer.db.run(
            'UPDATE tracks SET like_count = like_count + 1 WHERE id = ?',
            [trackId],
            () => resolve()
          );
        });

        res.json({
          success: true,
          liked: true,
          message: 'Track liked'
        });
      }

    } catch (error) {
      console.error('Like error:', error);
      res.status(500).json({ 
        error: 'Failed to like/unlike track',
        details: error.message 
      });
    }
  });

  // Delete track
  app.delete('/api/music/tracks/:trackId', authenticateToken, async (req, res) => {
    try {
      const { trackId } = req.params;
      const userId = req.user.userId;

      // Get track and verify ownership
      const track = await new Promise((resolve, reject) => {
        dbOptimizer.db.get(
          'SELECT * FROM tracks WHERE id = ? AND user_id = ?',
          [trackId, userId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      if (!track) {
        return res.status(404).json({ error: 'Track not found or unauthorized' });
      }

      // Delete file
      try {
        await fs.unlink(track.file_path);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }

      // Delete from database
      await new Promise((resolve, reject) => {
        dbOptimizer.db.run(
          'DELETE FROM tracks WHERE id = ?',
          [trackId],
          (err) => err ? reject(err) : resolve()
        );
      });

      res.json({
        success: true,
        message: 'Track deleted successfully'
      });

    } catch (error) {
      console.error('Delete track error:', error);
      res.status(500).json({ 
        error: 'Failed to delete track',
        details: error.message 
      });
    }
  });

  console.log('Music upload system added successfully');
}

module.exports = addMusicUploadRoutes;