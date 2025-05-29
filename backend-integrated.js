const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Database setup
const db = new sqlite3.Database('./data/notalabel.db');

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      artist_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS marketing_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      platform TEXT,
      scheduled_for DATETIME,
      posted_at DATETIME,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'notalabel-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Marketing content templates
const marketingTemplates = {
  social_media: {
    announcement: "🎵 Exciting news! {content} 🎵\n\n#IndependentMusic #NewMusic #MusicAnnouncement",
    promotion: "🎸 Check out {content}! 🎸\n\nLink: {link}\n\n#IndependentArtist #MusicPromotion",
    engagement: "What's your favorite {content}? Let us know in the comments! 👇\n\n#MusicCommunity #IndependentMusic"
  },
  email: {
    newsletter: {
      subject: "News from {artist_name}: {topic}",
      body: "Dear Music Lover,\n\n{content}\n\nThank you for your continued support!\n\nBest regards,\n{artist_name}"
    },
    announcement: {
      subject: "Big Announcement: {topic}",
      body: "Hello!\n\n{content}\n\nStay tuned for more updates!\n\n{artist_name}"
    }
  }
};

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Not a Label API is running' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Not a Label Backend',
    openai: !!process.env.OPENAI_API_KEY
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, artistType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password, name, artist_type) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, artistType],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(400).json({ error: err.message });
        }
        
        const token = jwt.sign(
          { id: this.lastID, email },
          process.env.JWT_SECRET || 'notalabel-secret-key'
        );
        
        res.json({ token, user: { id: this.lastID, email, name, artistType } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'notalabel-secret-key'
      );
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          artistType: user.artist_type
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Assistant endpoint
app.post('/api/ai/assistant', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const systemPrompt = `You are an AI assistant for Not a Label, a platform for independent musicians. 
    Help users with career advice, marketing strategies, and music industry insights.
    Be encouraging, professional, and knowledgeable about the independent music scene.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });
    
    res.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'AI assistant error' });
  }
});

// Marketing API Routes
app.get('/api/marketing/templates', authenticateToken, (req, res) => {
  res.json({ templates: marketingTemplates });
});

app.post('/api/marketing/templates/generate', authenticateToken, async (req, res) => {
  try {
    const { type, context, tone = 'professional' } = req.body;
    const userId = req.user.id;

    const prompt = `Generate ${type} marketing content for an independent musician with the following context: ${JSON.stringify(context)}. 
    Use a ${tone} tone. Make it engaging and suitable for social media or email marketing.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a marketing expert for independent musicians. Generate engaging, professional content.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    const generatedContent = completion.choices[0].message.content;

    res.json({
      content: generatedContent,
      type,
      tone,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.post('/api/marketing/posts/create', authenticateToken, async (req, res) => {
  try {
    const { type, content, platform, scheduledFor } = req.body;
    const userId = req.user.id;

    db.run(
      `INSERT INTO marketing_posts (user_id, type, content, platform, scheduled_for, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, content, platform, scheduledFor, 'draft'],
      function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        
        res.json({
          id: this.lastID,
          message: 'Post created successfully',
          post: {
            id: this.lastID,
            type,
            content,
            platform,
            scheduledFor,
            status: 'draft'
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/marketing/posts', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(
    'SELECT * FROM marketing_posts WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ posts });
    }
  );
});

app.put('/api/marketing/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, platform, scheduledFor, status } = req.body;
    const userId = req.user.id;

    db.run(
      `UPDATE marketing_posts 
       SET content = ?, platform = ?, scheduled_for = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [content, platform, scheduledFor, status, id, userId],
      function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json({ message: 'Post updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/marketing/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(
    'DELETE FROM marketing_posts WHERE id = ? AND user_id = ?',
    [id, userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      res.json({ message: 'Post deleted successfully' });
    }
  );
});

// Marketing analytics endpoint
app.get('/api/marketing/analytics', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.get(
    `SELECT 
       COUNT(*) as total_posts,
       COUNT(CASE WHEN status = 'published' THEN 1 END) as published_posts,
       COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_posts,
       COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_posts
     FROM marketing_posts 
     WHERE user_id = ?`,
    [userId],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        analytics: {
          posts: stats,
          platforms: {
            twitter: 0,
            instagram: 0,
            facebook: 0,
            email: 0
          },
          engagement: {
            total_reach: 0,
            total_engagement: 0
          }
        }
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Not a Label backend running on port ${PORT}`);
});