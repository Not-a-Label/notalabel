// Add this to the backend index.js

// Feedback table creation (add to database initialization)
db.run(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    rating INTEGER NOT NULL,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    email TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    url TEXT,
    status TEXT DEFAULT 'new',
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Feedback submission endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const { rating, category, message, email, timestamp, userAgent, url } = req.body;
    
    // Get user ID if authenticated
    let userId = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'notalabel-secret-key');
        userId = decoded.id;
      } catch (err) {
        // Anonymous feedback is fine
      }
    }
    
    // Validate required fields
    if (!rating || !category || !message) {
      return res.status(400).json({ error: 'Rating, category, and message are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Insert feedback
    db.run(
      `INSERT INTO feedback (user_id, rating, category, message, email, timestamp, user_agent, url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, rating, category, message, email, timestamp, userAgent, url],
      function(err) {
        if (err) {
          console.error('Feedback insertion error:', err);
          return res.status(500).json({ error: 'Failed to save feedback' });
        }
        
        console.log(`New feedback received: ${category} - Rating: ${rating}/5`);
        res.json({ 
          success: true, 
          message: 'Thank you for your feedback!',
          id: this.lastID 
        });
      }
    );
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoint to view feedback (authenticated users only)
app.get('/api/admin/feedback', authenticateToken, (req, res) => {
  // Only allow admin access (you can add admin role checking here)
  db.all(
    `SELECT f.*, u.email as user_email, u.name as user_name 
     FROM feedback f 
     LEFT JOIN users u ON f.user_id = u.id 
     ORDER BY f.timestamp DESC 
     LIMIT 100`,
    [],
    (err, feedback) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ feedback });
    }
  );
});

// Feedback analytics endpoint
app.get('/api/admin/feedback/analytics', authenticateToken, (req, res) => {
  db.get(
    `SELECT 
       COUNT(*) as total_feedback,
       AVG(rating) as average_rating,
       COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_feedback,
       COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_feedback
     FROM feedback`,
    [],
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Get category breakdown
      db.all(
        `SELECT category, COUNT(*) as count, AVG(rating) as avg_rating 
         FROM feedback 
         GROUP BY category 
         ORDER BY count DESC`,
        [],
        (err, categories) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json({
            analytics: {
              overview: stats,
              categories: categories
            }
          });
        }
      );
    }
  );
});