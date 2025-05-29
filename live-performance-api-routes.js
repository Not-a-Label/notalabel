const express = require('express');
const router = express.Router();
const db = require('./database');
const auth = require('./middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/live-performance/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp3|wav|aiff|m4a|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type for live performance upload'));
    }
  }
});

// Live Streaming Routes
router.get('/streams', auth, async (req, res) => {
  try {
    const streams = await db.all(`
      SELECT s.*, COUNT(v.id) as viewer_count
      FROM live_streams s
      LEFT JOIN stream_viewers v ON s.id = v.stream_id AND v.is_active = 1
      WHERE s.streamer_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, [req.user.id]);

    res.json({ streams });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

router.post('/start', auth, async (req, res) => {
  try {
    const { title, description, platforms, settings } = req.body;

    const streamId = await db.run(`
      INSERT INTO live_streams (
        streamer_id, title, description, platforms, settings, status, 
        start_time, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'live', ?, ?, ?)
    `, [
      req.user.id,
      title,
      description,
      JSON.stringify(platforms),
      JSON.stringify(settings),
      new Date().toISOString(),
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    // Create platform connections
    for (const platform of platforms) {
      await db.run(`
        INSERT INTO stream_platforms (stream_id, platform_name, rtmp_url, stream_key)
        VALUES (?, ?, ?, ?)
      `, [streamId.lastID, platform, `rtmp://live.${platform}.com/live`, `sk_${streamId.lastID}_${platform}`]);
    }

    const stream = await db.get('SELECT * FROM live_streams WHERE id = ?', [streamId.lastID]);
    res.json({ success: true, stream });
  } catch (error) {
    console.error('Error starting stream:', error);
    res.status(500).json({ error: 'Failed to start stream' });
  }
});

router.post('/streams/:id/end', auth, async (req, res) => {
  try {
    const streamId = req.params.id;

    await db.run(`
      UPDATE live_streams 
      SET status = 'ended', end_time = ?, updated_at = ?
      WHERE id = ? AND streamer_id = ?
    `, [new Date().toISOString(), new Date().toISOString(), streamId, req.user.id]);

    // Mark all viewers as inactive
    await db.run('UPDATE stream_viewers SET is_active = 0 WHERE stream_id = ?', [streamId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error ending stream:', error);
    res.status(500).json({ error: 'Failed to end stream' });
  }
});

router.get('/platforms', auth, async (req, res) => {
  try {
    const platforms = await db.all(`
      SELECT platform_name, connected, stream_key, rtmp_url, created_at
      FROM platform_connections
      WHERE user_id = ?
    `, [req.user.id]);

    res.json({ platforms });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

router.post('/platforms/:platform/connect', auth, async (req, res) => {
  try {
    const platform = req.params.platform;
    const streamKey = `sk_${req.user.id}_${platform}_${Date.now()}`;
    const rtmpUrl = `rtmp://live.${platform}.com/live`;

    await db.run(`
      INSERT OR REPLACE INTO platform_connections 
      (user_id, platform_name, connected, stream_key, rtmp_url, created_at, updated_at)
      VALUES (?, ?, 1, ?, ?, ?, ?)
    `, [req.user.id, platform, streamKey, rtmpUrl, new Date().toISOString(), new Date().toISOString()]);

    res.json({ success: true, streamKey, rtmpUrl });
  } catch (error) {
    console.error('Error connecting platform:', error);
    res.status(500).json({ error: 'Failed to connect platform' });
  }
});

// Virtual Concerts Routes
router.get('/concerts', auth, async (req, res) => {
  try {
    const concerts = await db.all(`
      SELECT c.*, COUNT(t.id) as current_attendees
      FROM virtual_concerts c
      LEFT JOIN concert_tickets t ON c.id = t.concert_id AND t.status = 'active'
      WHERE c.artist_id = ? OR c.id IN (
        SELECT concert_id FROM concert_tickets WHERE attendee_id = ? AND status = 'active'
      )
      GROUP BY c.id
      ORDER BY c.date DESC
    `, [req.user.id, req.user.id]);

    res.json({ concerts });
  } catch (error) {
    console.error('Error fetching concerts:', error);
    res.status(500).json({ error: 'Failed to fetch concerts' });
  }
});

router.post('/concerts', auth, async (req, res) => {
  try {
    const {
      title, description, date, startTime, endTime, ticketPrice, freeEvent,
      maxAttendees, venue, chatEnabled, merchEnabled, recordingEnabled
    } = req.body;

    const concertId = await db.run(`
      INSERT INTO virtual_concerts (
        title, description, artist_id, date, start_time, end_time,
        ticket_price, free_event, max_attendees, venue, chat_enabled,
        merch_enabled, recording_enabled, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?)
    `, [
      title, description, req.user.id, date, startTime, endTime,
      ticketPrice || 0, freeEvent ? 1 : 0, maxAttendees || 100, venue,
      chatEnabled ? 1 : 0, merchEnabled ? 1 : 0, recordingEnabled ? 1 : 0,
      new Date().toISOString(), new Date().toISOString()
    ]);

    res.json({ success: true, concertId: concertId.lastID });
  } catch (error) {
    console.error('Error creating concert:', error);
    res.status(500).json({ error: 'Failed to create concert' });
  }
});

router.get('/concerts/tickets', auth, async (req, res) => {
  try {
    const tickets = await db.all(`
      SELECT t.*, c.title as concert_title, c.artist_id, c.date, c.start_time
      FROM concert_tickets t
      JOIN virtual_concerts c ON t.concert_id = c.id
      WHERE t.attendee_id = ?
      ORDER BY c.date DESC
    `, [req.user.id]);

    res.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.post('/concerts/:id/tickets', auth, async (req, res) => {
  try {
    const concertId = req.params.id;
    const { ticketType } = req.body;

    const concert = await db.get('SELECT * FROM virtual_concerts WHERE id = ?', [concertId]);
    if (!concert) {
      return res.status(404).json({ error: 'Concert not found' });
    }

    const ticketId = await db.run(`
      INSERT INTO concert_tickets (
        concert_id, attendee_id, ticket_type, price, status, 
        purchase_date, qr_code
      ) VALUES (?, ?, ?, ?, 'active', ?, ?)
    `, [
      concertId, req.user.id, ticketType, concert.ticket_price,
      new Date().toISOString(), `qr_${concertId}_${req.user.id}_${Date.now()}`
    ]);

    res.json({ success: true, ticketId: ticketId.lastID });
  } catch (error) {
    console.error('Error purchasing ticket:', error);
    res.status(500).json({ error: 'Failed to purchase ticket' });
  }
});

router.post('/concerts/:id/join', auth, async (req, res) => {
  try {
    const concertId = req.params.id;

    const ticket = await db.get(`
      SELECT * FROM concert_tickets 
      WHERE concert_id = ? AND attendee_id = ? AND status = 'active'
    `, [concertId, req.user.id]);

    if (!ticket) {
      return res.status(403).json({ error: 'No valid ticket found' });
    }

    const streamUrl = `https://stream.notlabel.com/concert/${concertId}`;
    res.json({ success: true, streamUrl });
  } catch (error) {
    console.error('Error joining concert:', error);
    res.status(500).json({ error: 'Failed to join concert' });
  }
});

// Setlist Management Routes
router.get('/setlists', auth, async (req, res) => {
  try {
    const setlists = await db.all(`
      SELECT s.*, COUNT(si.id) as item_count
      FROM setlists s
      LEFT JOIN setlist_items si ON s.id = si.setlist_id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `, [req.user.id]);

    for (let setlist of setlists) {
      const items = await db.all(`
        SELECT si.*, so.title as song_title, so.artist, so.duration, so.key_signature, so.tempo
        FROM setlist_items si
        JOIN songs so ON si.song_id = so.id
        WHERE si.setlist_id = ?
        ORDER BY si.order_number
      `, [setlist.id]);
      
      setlist.items = items;
    }

    res.json({ setlists });
  } catch (error) {
    console.error('Error fetching setlists:', error);
    res.status(500).json({ error: 'Failed to fetch setlists' });
  }
});

router.post('/setlists', auth, async (req, res) => {
  try {
    const { name, description, eventType, venue, date, startTime } = req.body;

    const setlistId = await db.run(`
      INSERT INTO setlists (
        user_id, name, description, event_type, venue, date, start_time,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
    `, [
      req.user.id, name, description, eventType, venue, date, startTime,
      new Date().toISOString(), new Date().toISOString()
    ]);

    res.json({ success: true, setlistId: setlistId.lastID });
  } catch (error) {
    console.error('Error creating setlist:', error);
    res.status(500).json({ error: 'Failed to create setlist' });
  }
});

router.get('/songs', auth, async (req, res) => {
  try {
    const songs = await db.all(`
      SELECT * FROM songs 
      WHERE user_id = ? 
      ORDER BY title
    `, [req.user.id]);

    res.json({ songs });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

router.post('/setlists/:id/songs', auth, async (req, res) => {
  try {
    const setlistId = req.params.id;
    const { songId } = req.body;

    const maxOrder = await db.get(
      'SELECT MAX(order_number) as max_order FROM setlist_items WHERE setlist_id = ?',
      [setlistId]
    );

    const orderNumber = (maxOrder?.max_order || 0) + 1;

    await db.run(`
      INSERT INTO setlist_items (
        setlist_id, song_id, order_number, is_played, created_at
      ) VALUES (?, ?, ?, 0, ?)
    `, [setlistId, songId, orderNumber, new Date().toISOString()]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding song to setlist:', error);
    res.status(500).json({ error: 'Failed to add song to setlist' });
  }
});

// Merchandise Routes
router.get('/merchandise', auth, async (req, res) => {
  try {
    const items = await db.all(`
      SELECT * FROM merchandise_items 
      WHERE artist_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({ items });
  } catch (error) {
    console.error('Error fetching merchandise:', error);
    res.status(500).json({ error: 'Failed to fetch merchandise' });
  }
});

router.post('/merchandise', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name, description, category, price, stock, sizes, colors,
      isLiveExclusive, shippingRequired
    } = req.body;

    const images = req.files ? req.files.map(file => file.path) : [];

    const itemId = await db.run(`
      INSERT INTO merchandise_items (
        artist_id, name, description, category, price, stock, sizes, colors,
        images, is_live_exclusive, shipping_required, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `, [
      req.user.id, name, description, category, price, stock,
      JSON.stringify(sizes || []), JSON.stringify(colors || []),
      JSON.stringify(images), isLiveExclusive ? 1 : 0, shippingRequired ? 1 : 0,
      new Date().toISOString(), new Date().toISOString()
    ]);

    res.json({ success: true, itemId: itemId.lastID });
  } catch (error) {
    console.error('Error creating merchandise item:', error);
    res.status(500).json({ error: 'Failed to create merchandise item' });
  }
});

router.put('/merchandise/:id/toggle', auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { isActive } = req.body;

    await db.run(`
      UPDATE merchandise_items 
      SET is_active = ?, updated_at = ?
      WHERE id = ? AND artist_id = ?
    `, [isActive ? 1 : 0, new Date().toISOString(), itemId, req.user.id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error toggling merchandise item:', error);
    res.status(500).json({ error: 'Failed to toggle merchandise item' });
  }
});

router.get('/merchandise/displays', auth, async (req, res) => {
  try {
    const displays = await db.all(`
      SELECT * FROM merchandise_displays 
      WHERE artist_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({ displays });
  } catch (error) {
    console.error('Error fetching displays:', error);
    res.status(500).json({ error: 'Failed to fetch displays' });
  }
});

router.post('/merchandise/displays', auth, async (req, res) => {
  try {
    const {
      name, items, showDuringStream, autoPromote, promotionInterval,
      discountType, discountValue, bannerText, position
    } = req.body;

    const displayId = await db.run(`
      INSERT INTO merchandise_displays (
        artist_id, name, items, show_during_stream, auto_promote, promotion_interval,
        discount_type, discount_value, banner_text, position, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `, [
      req.user.id, name, JSON.stringify(items), showDuringStream ? 1 : 0,
      autoPromote ? 1 : 0, promotionInterval, discountType, discountValue,
      bannerText, position, new Date().toISOString(), new Date().toISOString()
    ]);

    res.json({ success: true, displayId: displayId.lastID });
  } catch (error) {
    console.error('Error creating display:', error);
    res.status(500).json({ error: 'Failed to create display' });
  }
});

router.get('/merchandise/live-sales', auth, async (req, res) => {
  try {
    const sales = await db.all(`
      SELECT ls.*, mi.name as item_name, mi.images as item_images
      FROM live_sales ls
      JOIN merchandise_items mi ON ls.item_id = mi.id
      WHERE mi.artist_id = ?
      ORDER BY ls.timestamp DESC
    `, [req.user.id]);

    const processedSales = sales.map(sale => ({
      ...sale,
      item: {
        name: sale.item_name,
        images: JSON.parse(sale.item_images || '[]'),
        shippingRequired: sale.shipping_required
      },
      item_images: undefined,
      item_name: undefined
    }));

    res.json({ sales: processedSales });
  } catch (error) {
    console.error('Error fetching live sales:', error);
    res.status(500).json({ error: 'Failed to fetch live sales' });
  }
});

// Analytics Routes
router.get('/analytics/performances', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    let dateFilter = '';

    switch (period) {
      case '7d':
        dateFilter = "AND ls.start_time >= datetime('now', '-7 days')";
        break;
      case '30d':
        dateFilter = "AND ls.start_time >= datetime('now', '-30 days')";
        break;
      case '90d':
        dateFilter = "AND ls.start_time >= datetime('now', '-90 days')";
        break;
      default:
        dateFilter = '';
    }

    const performances = await db.all(`
      SELECT 
        ls.id as stream_id,
        ls.title,
        ls.start_time as date,
        (julianday(ls.end_time) - julianday(ls.start_time)) * 24 * 60 as duration,
        ls.peak_viewers,
        ls.average_viewers,
        ls.total_viewers,
        ls.chat_messages,
        ls.likes,
        ls.shares,
        ls.reactions,
        COALESCE(SUM(ct.price), 0) as ticket_revenue,
        COALESCE(SUM(lss.total_amount), 0) as merch_revenue,
        COALESCE(SUM(ls.donations), 0) as donation_revenue
      FROM live_streams ls
      LEFT JOIN concert_tickets ct ON ls.concert_id = ct.concert_id
      LEFT JOIN live_sales lss ON ls.id = lss.stream_id
      WHERE ls.streamer_id = ? AND ls.status = 'ended' ${dateFilter}
      GROUP BY ls.id
      ORDER BY ls.start_time DESC
    `, [req.user.id]);

    const processedPerformances = performances.map(perf => ({
      streamId: perf.stream_id,
      title: perf.title,
      date: perf.date,
      duration: Math.round(perf.duration || 0),
      peakViewers: perf.peak_viewers || 0,
      averageViewers: perf.average_viewers || 0,
      totalViewers: perf.total_viewers || 0,
      engagement: {
        chatMessages: perf.chat_messages || 0,
        likes: perf.likes || 0,
        shares: perf.shares || 0,
        reactions: perf.reactions || 0
      },
      revenue: {
        tickets: perf.ticket_revenue || 0,
        merchandise: perf.merch_revenue || 0,
        donations: perf.donation_revenue || 0,
        total: (perf.ticket_revenue || 0) + (perf.merch_revenue || 0) + (perf.donation_revenue || 0)
      },
      audience: {
        newFollowers: Math.floor(Math.random() * 50), // Mock data
        returningViewers: Math.floor(Math.random() * 80),
        averageViewTime: Math.floor(Math.random() * 45),
        dropOffRate: Math.floor(Math.random() * 30)
      },
      platforms: [
        {
          platform: 'youtube',
          viewers: Math.floor((perf.peak_viewers || 0) * 0.6),
          peakViewers: Math.floor((perf.peak_viewers || 0) * 0.6),
          engagement: Math.random() * 15,
          revenue: (perf.ticket_revenue || 0) * 0.6,
          chatActivity: (perf.chat_messages || 0) * 0.6
        }
      ]
    }));

    res.json({ performances: processedPerformances });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ error: 'Failed to fetch performance analytics' });
  }
});

router.get('/analytics/performances/:streamId/demographics', auth, async (req, res) => {
  try {
    // Mock demographics data - would be real in production
    const demographics = {
      ageGroups: [
        { range: '18-24', percentage: 25 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 20 },
        { range: '45-54', percentage: 15 },
        { range: '55+', percentage: 5 }
      ],
      geography: [
        { country: 'United States', percentage: 45 },
        { country: 'Canada', percentage: 15 },
        { country: 'United Kingdom', percentage: 12 },
        { country: 'Australia', percentage: 8 },
        { country: 'Germany', percentage: 6 },
        { country: 'Other', percentage: 14 }
      ],
      devices: [
        { type: 'desktop', percentage: 55 },
        { type: 'mobile', percentage: 35 },
        { type: 'tablet', percentage: 10 }
      ],
      timeZones: [
        { zone: 'EST', percentage: 35 },
        { zone: 'PST', percentage: 25 },
        { zone: 'GMT', percentage: 20 },
        { zone: 'CET', percentage: 15 },
        { zone: 'Other', percentage: 5 }
      ]
    };

    res.json({ demographics });
  } catch (error) {
    console.error('Error fetching demographics:', error);
    res.status(500).json({ error: 'Failed to fetch demographics' });
  }
});

router.get('/analytics/performances/:streamId/timeline', auth, async (req, res) => {
  try {
    // Mock timeline data - would be real in production
    const timeline = [];
    const startTime = new Date();
    for (let i = 0; i < 120; i += 5) {
      const time = new Date(startTime.getTime() + i * 60 * 1000);
      timeline.push({
        timestamp: time.toISOString(),
        viewers: Math.floor(Math.random() * 500) + 100,
        chatActivity: Math.floor(Math.random() * 50),
        reactions: Math.floor(Math.random() * 20),
        event: i === 30 ? 'Song Started' : i === 60 ? 'Merch Promotion' : i === 90 ? 'Q&A Session' : null
      });
    }

    res.json({ timeline });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

router.get('/status', auth, async (req, res) => {
  try {
    const activeStream = await db.get(`
      SELECT id, status FROM live_streams 
      WHERE streamer_id = ? AND status = 'live'
      ORDER BY start_time DESC
      LIMIT 1
    `, [req.user.id]);

    res.json({
      isLive: !!activeStream,
      streamId: activeStream?.id || null
    });
  } catch (error) {
    console.error('Error checking live status:', error);
    res.status(500).json({ error: 'Failed to check live status' });
  }
});

module.exports = router;