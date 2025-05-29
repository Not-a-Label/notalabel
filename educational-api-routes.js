const express = require('express');
const router = express.Router();
const db = require('./db');
const authMiddleware = require('./authMiddleware');
const { trackBusinessRevenue, calculateFees } = require('./businessRevenue');

// Platform fee for educational content
const EDUCATION_PLATFORM_FEE = 30; // 30% platform fee on educational content

// Get learning path recommendations
router.get('/education/learning-path', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's profile and history
    const userProfile = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    const completedCourses = await db.all(
      'SELECT * FROM course_completions WHERE user_id = ?',
      [userId]
    );
    
    // Generate personalized learning path
    const learningPath = generateLearningPath(userProfile, completedCourses);
    
    res.json({ currentPath: learningPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's course progress
router.get('/education/progress', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const courses = await db.all(`
      SELECT 
        e.course_id as courseId,
        c.title,
        e.progress,
        e.last_accessed as lastAccessed
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.last_accessed DESC
      LIMIT 10
    `, [userId]);
    
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured courses
router.get('/education/featured', async (req, res) => {
  try {
    const courses = await db.all(`
      SELECT 
        c.*,
        u.name as instructor,
        COUNT(DISTINCT e.user_id) as enrollments,
        AVG(r.rating) as rating
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      WHERE c.featured = 1
      GROUP BY c.id
      ORDER BY enrollments DESC
      LIMIT 6
    `);
    
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tutorials with filters
router.get('/education/tutorials', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    
    let query = `
      SELECT 
        t.*,
        u.name as instructor_name,
        u.avatar as instructor_avatar,
        COUNT(DISTINCT e.user_id) as students,
        AVG(r.rating) as rating,
        COUNT(DISTINCT r.id) as reviews
      FROM tutorials t
      JOIN users u ON t.instructor_id = u.id
      LEFT JOIN enrollments e ON t.id = e.tutorial_id
      LEFT JOIN reviews r ON t.id = r.tutorial_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (category && category !== 'all') {
      query += ' AND t.category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (minPrice) {
      query += ' AND t.price >= ?';
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ' AND t.price <= ?';
      params.push(maxPrice);
    }
    
    query += ' GROUP BY t.id ORDER BY students DESC';
    
    const tutorials = await db.all(query, params);
    
    res.json({ tutorials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase tutorial
router.post('/education/purchase-tutorial', authMiddleware, async (req, res) => {
  try {
    const { tutorialId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    // Get tutorial details
    const tutorial = await db.get(
      'SELECT * FROM tutorials WHERE id = ?',
      [tutorialId]
    );
    
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    
    // Check if already purchased
    const existing = await db.get(
      'SELECT * FROM enrollments WHERE user_id = ? AND tutorial_id = ?',
      [userId, tutorialId]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Already enrolled' });
    }
    
    // Calculate fees
    const fees = calculateFees(tutorial.price, 'tutorial');
    
    // Process payment (simplified)
    const paymentId = `pay_${Date.now()}`;
    
    // Create enrollment
    await db.run(`
      INSERT INTO enrollments (user_id, tutorial_id, price_paid, enrolled_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [userId, tutorialId, tutorial.price]);
    
    // Record payment to instructor
    await db.run(`
      INSERT INTO payments (
        user_id, amount, type, status, payment_method, 
        payment_id, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      tutorial.instructor_id,
      fees.netAmount,
      'tutorial_sale',
      'completed',
      paymentMethod,
      paymentId,
      JSON.stringify({ tutorialId, buyerId: userId })
    ]);
    
    // Track business revenue
    await trackBusinessRevenue({
      type: 'tutorial_sale',
      amount: fees.platformFee,
      userId,
      metadata: {
        tutorialId,
        instructorId: tutorial.instructor_id,
        tutorialPrice: tutorial.price
      }
    });
    
    res.json({ 
      success: true, 
      enrollmentId: this.lastID,
      fees
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get masterclasses
router.get('/education/masterclasses', async (req, res) => {
  try {
    const masterclasses = await db.all(`
      SELECT 
        m.*,
        u.name as instructor_name,
        u.bio as instructor_bio,
        COUNT(DISTINCT e.user_id) as enrolledStudents,
        AVG(r.rating) as rating,
        COUNT(DISTINCT r.id) as reviews
      FROM masterclasses m
      JOIN users u ON m.instructor_id = u.id
      LEFT JOIN masterclass_enrollments e ON m.id = e.masterclass_id
      LEFT JOIN reviews r ON m.id = r.masterclass_id
      GROUP BY m.id
      ORDER BY m.start_date ASC
    `);
    
    res.json({ masterclasses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's masterclasses
router.get('/education/my-masterclasses', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const enrolled = await db.all(`
      SELECT masterclass_id FROM masterclass_enrollments WHERE user_id = ?
    `, [userId]);
    
    const upcoming = await db.all(`
      SELECT 
        s.masterclass_id as masterclassId,
        m.title,
        u.name as instructor,
        s.date,
        s.time,
        s.duration
      FROM masterclass_sessions s
      JOIN masterclasses m ON s.masterclass_id = m.id
      JOIN users u ON m.instructor_id = u.id
      JOIN masterclass_enrollments e ON m.id = e.masterclass_id
      WHERE e.user_id = ? AND s.date >= date('now')
      ORDER BY s.date ASC
      LIMIT 5
    `, [userId]);
    
    res.json({ 
      enrolled: enrolled.map(e => e.masterclass_id),
      upcoming
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll in masterclass
router.post('/education/enroll', authMiddleware, async (req, res) => {
  try {
    const { masterclassId } = req.body;
    const userId = req.user.id;
    
    // Get masterclass details
    const masterclass = await db.get(
      'SELECT * FROM masterclasses WHERE id = ?',
      [masterclassId]
    );
    
    if (!masterclass) {
      return res.status(404).json({ error: 'Masterclass not found' });
    }
    
    // Check capacity
    const enrolledCount = await db.get(
      'SELECT COUNT(*) as count FROM masterclass_enrollments WHERE masterclass_id = ?',
      [masterclassId]
    );
    
    if (enrolledCount.count >= masterclass.max_students) {
      return res.status(400).json({ error: 'Masterclass is full' });
    }
    
    // Calculate fees
    const fees = calculateFees(masterclass.price, 'masterclass');
    
    // Process enrollment
    await db.run(`
      INSERT INTO masterclass_enrollments (
        user_id, masterclass_id, price_paid, enrolled_at
      ) VALUES (?, ?, ?, datetime('now'))
    `, [userId, masterclassId, masterclass.price]);
    
    // Pay instructor
    await db.run(`
      INSERT INTO payments (
        user_id, amount, type, status, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `, [
      masterclass.instructor_id,
      fees.netAmount,
      'masterclass_enrollment',
      'completed'
    ]);
    
    // Track business revenue
    await trackBusinessRevenue({
      type: 'masterclass_enrollment',
      amount: fees.platformFee,
      userId,
      metadata: {
        masterclassId,
        instructorId: masterclass.instructor_id,
        price: masterclass.price
      }
    });
    
    res.json({ success: true, enrollmentId: this.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get mentors
router.get('/education/mentors', async (req, res) => {
  try {
    const { expertise, minPrice, maxPrice, minRating } = req.query;
    
    let query = `
      SELECT 
        m.*,
        u.name,
        u.avatar,
        u.location,
        AVG(r.rating) as rating,
        COUNT(DISTINCT r.id) as reviews,
        COUNT(DISTINCT s.id) as sessionsCompleted,
        COUNT(DISTINCT ms.student_id) as students
      FROM mentors m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN mentor_reviews r ON m.id = r.mentor_id
      LEFT JOIN mentor_sessions s ON m.id = s.mentor_id AND s.status = 'completed'
      LEFT JOIN mentor_students ms ON m.id = ms.mentor_id
      WHERE m.active = 1
    `;
    
    const params = [];
    
    if (expertise && expertise !== 'all') {
      query += ' AND m.expertise LIKE ?';
      params.push(`%${expertise}%`);
    }
    
    if (minPrice) {
      query += ' AND m.hourly_rate >= ?';
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ' AND m.hourly_rate <= ?';
      params.push(maxPrice);
    }
    
    query += ' GROUP BY m.id';
    
    if (minRating) {
      query += ' HAVING rating >= ?';
      params.push(minRating);
    }
    
    query += ' ORDER BY rating DESC, sessionsCompleted DESC';
    
    const mentors = await db.all(query, params);
    
    res.json({ mentors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book mentor session
router.post('/education/book-mentor', authMiddleware, async (req, res) => {
  try {
    const { mentorId, type, sessionDate, sessionTime } = req.body;
    const userId = req.user.id;
    
    // Get mentor details
    const mentor = await db.get(
      'SELECT * FROM mentors WHERE id = ?',
      [mentorId]
    );
    
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    // Calculate price based on type
    let price, sessions;
    switch (type) {
      case 'oneTime':
        price = mentor.hourly_rate;
        sessions = 1;
        break;
      case 'package5':
        price = mentor.package_5_rate;
        sessions = 5;
        break;
      case 'package10':
        price = mentor.package_10_rate;
        sessions = 10;
        break;
      case 'monthly':
        price = mentor.monthly_rate;
        sessions = 4;
        break;
      default:
        return res.status(400).json({ error: 'Invalid booking type' });
    }
    
    // Calculate fees
    const fees = calculateFees(price, 'mentorship');
    
    // Create booking
    await db.run(`
      INSERT INTO mentor_bookings (
        student_id, mentor_id, type, price, sessions_remaining,
        created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [userId, mentorId, type, price, sessions]);
    
    const bookingId = this.lastID;
    
    // Create first session if date provided
    if (sessionDate && sessionTime) {
      await db.run(`
        INSERT INTO mentor_sessions (
          booking_id, mentor_id, student_id, date, time,
          status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `, [bookingId, mentorId, userId, sessionDate, sessionTime, 'scheduled']);
    }
    
    // Pay mentor
    await db.run(`
      INSERT INTO payments (
        user_id, amount, type, status, created_at
      ) VALUES (?, ?, ?, ?, datetime('now'))
    `, [
      mentor.user_id,
      fees.netAmount,
      'mentorship_booking',
      'completed'
    ]);
    
    // Track business revenue
    await trackBusinessRevenue({
      type: 'mentorship_booking',
      amount: fees.platformFee,
      userId,
      metadata: {
        mentorId,
        bookingType: type,
        price,
        sessions
      }
    });
    
    res.json({ success: true, bookingId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get certifications
router.get('/education/certifications', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT e.user_id) as enrolledCount,
        COUNT(DISTINCT comp.user_id) as completedCount,
        AVG(r.rating) as rating
      FROM certifications c
      LEFT JOIN certification_enrollments e ON c.id = e.certification_id
      LEFT JOIN certification_completions comp ON c.id = comp.certification_id
      LEFT JOIN reviews r ON c.id = r.certification_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (category && category !== 'all') {
      query += ' AND c.category = ?';
      params.push(category);
    }
    
    query += ' GROUP BY c.id ORDER BY enrolledCount DESC';
    
    const certifications = await db.all(query, params);
    
    res.json({ certifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's certification progress
router.get('/education/my-certifications', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const progress = await db.all(`
      SELECT 
        ce.*,
        c.title,
        c.modules_count,
        COUNT(DISTINCT cm.module_id) as modulesCompleted
      FROM certification_enrollments ce
      JOIN certifications c ON ce.certification_id = c.id
      LEFT JOIN certification_modules_completed cm ON ce.id = cm.enrollment_id
      WHERE ce.user_id = ?
      GROUP BY ce.id
    `, [userId]);
    
    const achievements = await db.all(`
      SELECT * FROM user_achievements 
      WHERE user_id = ? 
      ORDER BY unlocked_at DESC
    `, [userId]);
    
    res.json({ progress, achievements });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll in certification
router.post('/education/enroll-certification', authMiddleware, async (req, res) => {
  try {
    const { certificationId } = req.body;
    const userId = req.user.id;
    
    // Get certification details
    const certification = await db.get(
      'SELECT * FROM certifications WHERE id = ?',
      [certificationId]
    );
    
    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    
    // Check if already enrolled
    const existing = await db.get(
      'SELECT * FROM certification_enrollments WHERE user_id = ? AND certification_id = ?',
      [userId, certificationId]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Already enrolled' });
    }
    
    // Calculate fees
    const fees = calculateFees(certification.price, 'certification');
    
    // Create enrollment
    await db.run(`
      INSERT INTO certification_enrollments (
        user_id, certification_id, price_paid, progress,
        start_date, estimated_completion, created_at
      ) VALUES (?, ?, ?, ?, date('now'), date('now', '+${certification.duration}'), datetime('now'))
    `, [userId, certificationId, certification.price, 0]);
    
    // Track business revenue
    await trackBusinessRevenue({
      type: 'certification_enrollment',
      amount: fees.platformFee,
      userId,
      metadata: {
        certificationId,
        price: certification.price
      }
    });
    
    res.json({ success: true, enrollmentId: this.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate learning path
function generateLearningPath(userProfile, completedCourses) {
  // Simplified learning path generation
  const paths = {
    beginner: 'Music Production Fundamentals',
    intermediate: 'Advanced Production Techniques',
    advanced: 'Professional Music Business',
    expert: 'Industry Leadership & Innovation'
  };
  
  const level = completedCourses.length === 0 ? 'beginner' :
                completedCourses.length < 5 ? 'intermediate' :
                completedCourses.length < 10 ? 'advanced' : 'expert';
  
  return paths[level];
}

module.exports = router;