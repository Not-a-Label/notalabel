const express = require('express');
const router = express.Router();
const db = require('./database');
const auth = require('./middleware/auth');
const multer = require('multer');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

// Business Configuration - Founder Revenue Settings
const BUSINESS_CONFIG = {
  PLATFORM_FEE_PERCENTAGE: 15, // 15% platform fee on all transactions
  SUBSCRIPTION_PLATFORM_FEE: 5, // Additional 5% on subscription transactions
  NFT_MINTING_FEE: 25, // $25 flat fee for NFT minting
  WITHDRAWAL_FEE_PERCENTAGE: 2.5, // 2.5% fee on withdrawals
  MINIMUM_WITHDRAWAL: 20, // $20 minimum withdrawal
  BUSINESS_WALLET_ID: 'platform_business_wallet',
  FOUNDER_USER_ID: process.env.FOUNDER_USER_ID || '1', // Set this in environment
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD'],
  TAX_RATE: 0.0875, // 8.75% for applicable transactions
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/marketplace/');
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
    const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|aiff|m4a|mp4|mov|pdf|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type for marketplace upload'));
    }
  }
});

// Business Revenue Tracking Middleware
const trackBusinessRevenue = async (transactionData) => {
  try {
    const {
      transaction_id,
      user_id,
      transaction_type,
      gross_amount,
      platform_fee,
      net_amount,
      currency = 'USD',
      product_type,
      product_id,
      payment_method
    } = transactionData;

    // Record business revenue
    await db.run(`
      INSERT INTO business_revenue (
        transaction_id, user_id, transaction_type, gross_amount, platform_fee,
        net_amount, currency, product_type, product_id, payment_method,
        recorded_at, fiscal_year, fiscal_quarter
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      transaction_id, user_id, transaction_type, gross_amount, platform_fee,
      net_amount, currency, product_type, product_id, payment_method,
      new Date().toISOString(),
      new Date().getFullYear(),
      Math.ceil((new Date().getMonth() + 1) / 3)
    ]);

    // Update business wallet balance
    await db.run(`
      INSERT OR REPLACE INTO business_wallets (
        currency, available_balance, pending_balance, total_revenue, last_updated
      ) VALUES (
        ?, 
        COALESCE((SELECT available_balance FROM business_wallets WHERE currency = ?), 0) + ?,
        COALESCE((SELECT pending_balance FROM business_wallets WHERE currency = ?), 0),
        COALESCE((SELECT total_revenue FROM business_wallets WHERE currency = ?), 0) + ?,
        ?
      )
    `, [currency, currency, platform_fee, currency, currency, platform_fee, new Date().toISOString()]);

    console.log(`Business revenue tracked: $${platform_fee} ${currency} from ${transaction_type}`);
  } catch (error) {
    console.error('Error tracking business revenue:', error);
  }
};

// Calculate platform fees
const calculateFees = (amount, transactionType, productType) => {
  let feePercentage = BUSINESS_CONFIG.PLATFORM_FEE_PERCENTAGE;
  let flatFee = 0;

  // Adjust fees based on transaction type
  if (transactionType === 'subscription') {
    feePercentage += BUSINESS_CONFIG.SUBSCRIPTION_PLATFORM_FEE;
  }
  
  if (productType === 'nft' && transactionType === 'mint') {
    flatFee = BUSINESS_CONFIG.NFT_MINTING_FEE;
  }

  const percentageFee = (amount * feePercentage) / 100;
  const totalFee = percentageFee + flatFee;
  const netAmount = amount - totalFee;

  return {
    grossAmount: amount,
    platformFee: totalFee,
    netAmount: Math.max(0, netAmount),
    feeBreakdown: {
      percentage: percentageFee,
      flat: flatFee,
      rate: feePercentage
    }
  };
};

// Beat Marketplace Routes
router.get('/beats', auth, async (req, res) => {
  try {
    const { genre, bpm_min, bpm_max, price_min, price_max, sort = 'newest' } = req.query;
    
    let query = `
      SELECT b.*, p.username as producer_name, p.display_name as producer_display_name,
             p.avatar as producer_avatar, p.verified as producer_verified,
             COUNT(bl.id) as likes_count,
             CASE WHEN ubl.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
             CASE WHEN bp.id IS NOT NULL THEN 1 ELSE 0 END as is_purchased
      FROM beats b
      JOIN users p ON b.producer_id = p.id
      LEFT JOIN beat_likes bl ON b.id = bl.beat_id
      LEFT JOIN user_beat_likes ubl ON b.id = ubl.beat_id AND ubl.user_id = ?
      LEFT JOIN beat_purchases bp ON b.id = bp.beat_id AND bp.user_id = ?
      WHERE b.is_active = 1
    `;
    
    const params = [req.user.id, req.user.id];

    if (genre) {
      query += ` AND b.genre = ?`;
      params.push(genre);
    }

    if (bpm_min) {
      query += ` AND b.bpm >= ?`;
      params.push(bpm_min);
    }

    if (bpm_max) {
      query += ` AND b.bpm <= ?`;
      params.push(bpm_max);
    }

    if (price_min) {
      query += ` AND b.price >= ?`;
      params.push(price_min);
    }

    if (price_max) {
      query += ` AND b.price <= ?`;
      params.push(price_max);
    }

    query += ` GROUP BY b.id`;

    // Add sorting
    switch (sort) {
      case 'popular':
        query += ` ORDER BY b.sales DESC, likes_count DESC`;
        break;
      case 'price-low':
        query += ` ORDER BY b.price ASC`;
        break;
      case 'price-high':
        query += ` ORDER BY b.price DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY b.created_at DESC`;
    }

    const beats = await db.all(query, params);

    // Process beats data
    const processedBeats = beats.map(beat => ({
      ...beat,
      tags: beat.tags ? JSON.parse(beat.tags) : [],
      mood: beat.mood ? JSON.parse(beat.mood) : [],
      licenses: beat.licenses ? JSON.parse(beat.licenses) : [],
      producer: {
        id: beat.producer_id,
        name: beat.producer_name,
        displayName: beat.producer_display_name,
        avatar: beat.producer_avatar,
        verified: beat.producer_verified === 1
      }
    }));

    res.json({ beats: processedBeats });
  } catch (error) {
    console.error('Error fetching beats:', error);
    res.status(500).json({ error: 'Failed to fetch beats' });
  }
});

router.post('/beats', auth, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'artwork', maxCount: 1 },
  { name: 'stems', maxCount: 10 }
]), async (req, res) => {
  try {
    const {
      title, description, genre, subGenre, bpm, key, mood, tags,
      price, exclusivePrice, isExclusive, licenses
    } = req.body;

    const audioFile = req.files.audio ? req.files.audio[0].path : null;
    const artworkFile = req.files.artwork ? req.files.artwork[0].path : null;
    const stemFiles = req.files.stems ? req.files.stems.map(file => file.path) : [];

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const beatId = await db.run(`
      INSERT INTO beats (
        producer_id, title, description, genre, sub_genre, bpm, key_signature,
        mood, tags, price, exclusive_price, is_exclusive, licenses,
        audio_file, artwork, stem_files, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `, [
      req.user.id, title, description, genre, subGenre, bpm, key,
      JSON.stringify(mood), JSON.stringify(tags), price, exclusivePrice,
      isExclusive ? 1 : 0, JSON.stringify(licenses), audioFile, artworkFile,
      JSON.stringify(stemFiles), new Date().toISOString(), new Date().toISOString()
    ]);

    res.json({ success: true, beatId: beatId.lastID });
  } catch (error) {
    console.error('Error creating beat:', error);
    res.status(500).json({ error: 'Failed to create beat' });
  }
});

router.post('/beats/:id/purchase', auth, async (req, res) => {
  try {
    const beatId = req.params.id;
    const { licenseId, paymentMethodId } = req.body;

    // Get beat details
    const beat = await db.get('SELECT * FROM beats WHERE id = ? AND is_active = 1', [beatId]);
    if (!beat) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // Get license details
    const licenses = JSON.parse(beat.licenses || '[]');
    const license = licenses.find(l => l.id === licenseId);
    if (!license) {
      return res.status(400).json({ error: 'Invalid license selected' });
    }

    // Calculate fees
    const fees = calculateFees(license.price, 'purchase', 'beat');

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(fees.grossAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        type: 'beat_purchase',
        beat_id: beatId,
        license_id: licenseId,
        user_id: req.user.id,
        producer_id: beat.producer_id
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Record transaction
      const transactionId = await db.run(`
        INSERT INTO transactions (
          user_id, type, status, amount, fee, net_amount, currency, description,
          product_type, product_id, payment_method_id, stripe_payment_id, created_at
        ) VALUES (?, 'purchase', 'completed', ?, ?, ?, 'USD', ?, 'beat', ?, ?, ?, ?)
      `, [
        req.user.id, fees.grossAmount, fees.platformFee, fees.netAmount,
        `Beat purchase: ${beat.title}`, beatId, paymentMethodId,
        paymentIntent.id, new Date().toISOString()
      ]);

      // Record purchase
      await db.run(`
        INSERT INTO beat_purchases (
          beat_id, user_id, license_id, transaction_id, price, license_terms, purchased_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        beatId, req.user.id, licenseId, transactionId.lastID,
        license.price, JSON.stringify(license), new Date().toISOString()
      ]);

      // Update beat sales count
      await db.run('UPDATE beats SET sales = sales + 1 WHERE id = ?', [beatId]);

      // Create producer payment (net amount after platform fee)
      const producerPayment = fees.netAmount;
      await db.run(`
        INSERT INTO transactions (
          user_id, type, status, amount, fee, net_amount, currency, description,
          product_type, product_id, reference_transaction_id, created_at
        ) VALUES (?, 'sale', 'completed', ?, 0, ?, 'USD', ?, 'beat', ?, ?, ?)
      `, [
        beat.producer_id, producerPayment, producerPayment,
        `Beat sale: ${beat.title}`, beatId, transactionId.lastID, new Date().toISOString()
      ]);

      // Track business revenue
      await trackBusinessRevenue({
        transaction_id: transactionId.lastID,
        user_id: req.user.id,
        transaction_type: 'beat_purchase',
        gross_amount: fees.grossAmount,
        platform_fee: fees.platformFee,
        net_amount: fees.netAmount,
        currency: 'USD',
        product_type: 'beat',
        product_id: beatId,
        payment_method: 'stripe'
      });

      res.json({ 
        success: true, 
        transactionId: transactionId.lastID,
        downloadUrl: `/api/marketplace/beats/${beatId}/download`
      });
    } else {
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error purchasing beat:', error);
    res.status(500).json({ error: 'Failed to purchase beat' });
  }
});

// Sample Library Routes
router.get('/samples', auth, async (req, res) => {
  try {
    const { category, genre, format, price = 'all', sort = 'newest' } = req.query;
    
    let query = `
      SELECT s.*, c.username as creator_name, c.display_name as creator_display_name,
             c.avatar as creator_avatar, c.verified as creator_verified,
             COUNT(sl.id) as downloads_count,
             CASE WHEN usl.id IS NOT NULL THEN 1 ELSE 0 END as is_liked,
             CASE WHEN sp.id IS NOT NULL THEN 1 ELSE 0 END as is_purchased
      FROM samples s
      JOIN users c ON s.creator_id = c.id
      LEFT JOIN sample_likes sl ON s.id = sl.sample_id
      LEFT JOIN user_sample_likes usl ON s.id = usl.sample_id AND usl.user_id = ?
      LEFT JOIN sample_purchases sp ON s.id = sp.sample_id AND sp.user_id = ?
      WHERE s.is_active = 1
    `;
    
    const params = [req.user.id, req.user.id];

    if (category) {
      query += ` AND s.category = ?`;
      params.push(category);
    }

    if (genre) {
      query += ` AND s.genre = ?`;
      params.push(genre);
    }

    if (format) {
      query += ` AND s.format = ?`;
      params.push(format);
    }

    if (price === 'free') {
      query += ` AND s.price = 0`;
    } else if (price === 'premium') {
      query += ` AND s.price > 0`;
    }

    query += ` GROUP BY s.id`;

    // Add sorting
    switch (sort) {
      case 'popular':
        query += ` ORDER BY downloads_count DESC`;
        break;
      case 'price-low':
        query += ` ORDER BY s.price ASC`;
        break;
      case 'price-high':
        query += ` ORDER BY s.price DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY s.created_at DESC`;
    }

    const samples = await db.all(query, params);

    const processedSamples = samples.map(sample => ({
      ...sample,
      tags: sample.tags ? JSON.parse(sample.tags) : [],
      license: sample.license ? JSON.parse(sample.license) : {},
      creator: {
        id: sample.creator_id,
        name: sample.creator_name,
        displayName: sample.creator_display_name,
        avatar: sample.creator_avatar,
        verified: sample.creator_verified === 1
      }
    }));

    res.json({ samples: processedSamples });
  } catch (error) {
    console.error('Error fetching samples:', error);
    res.status(500).json({ error: 'Failed to fetch samples' });
  }
});

router.post('/samples', auth, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'stems', maxCount: 10 }
]), async (req, res) => {
  try {
    const {
      name, description, category, subCategory, genre, bpm, key,
      tags, price, format, quality, sampleRate, license
    } = req.body;

    const audioFile = req.files.audio ? req.files.audio[0] : null;
    const stemFiles = req.files.stems ? req.files.stems.map(file => file.path) : [];

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const sampleId = await db.run(`
      INSERT INTO samples (
        creator_id, name, description, category, sub_category, genre, bpm, key_signature,
        tags, price, format, quality, sample_rate, duration, file_size, audio_file,
        stem_files, license, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `, [
      req.user.id, name, description, category, subCategory, genre, bpm, key,
      JSON.stringify(tags), price, format, quality, sampleRate,
      audioFile.duration || 0, audioFile.size, audioFile.path,
      JSON.stringify(stemFiles), JSON.stringify(license),
      new Date().toISOString(), new Date().toISOString()
    ]);

    res.json({ success: true, sampleId: sampleId.lastID });
  } catch (error) {
    console.error('Error creating sample:', error);
    res.status(500).json({ error: 'Failed to create sample' });
  }
});

// Session Musicians Routes
router.get('/musicians', auth, async (req, res) => {
  try {
    const { instrument, genre, experience, location, availability } = req.query;
    
    let query = `
      SELECT m.*, u.username, u.display_name, u.avatar, u.verified,
             AVG(r.rating) as average_rating, COUNT(r.id) as review_count
      FROM musicians m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN musician_reviews r ON m.id = r.musician_id
      WHERE m.is_active = 1
    `;
    
    const params = [];

    if (instrument) {
      query += ` AND m.instruments LIKE ?`;
      params.push(`%${instrument}%`);
    }

    if (genre) {
      query += ` AND m.genres LIKE ?`;
      params.push(`%${genre}%`);
    }

    if (experience) {
      query += ` AND m.experience_level = ?`;
      params.push(experience);
    }

    if (location) {
      query += ` AND m.location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (availability) {
      query += ` AND m.availability = ?`;
      params.push(availability);
    }

    query += ` GROUP BY m.id ORDER BY average_rating DESC`;

    const musicians = await db.all(query, params);

    const processedMusicians = musicians.map(musician => ({
      ...musician,
      instruments: musician.instruments ? JSON.parse(musician.instruments) : [],
      genres: musician.genres ? JSON.parse(musician.genres) : [],
      skills: musician.skills ? JSON.parse(musician.skills) : [],
      portfolio: musician.portfolio ? JSON.parse(musician.portfolio) : [],
      rating: musician.average_rating || 0,
      totalJobs: musician.total_jobs || 0,
      reviews: []
    }));

    res.json({ musicians: processedMusicians });
  } catch (error) {
    console.error('Error fetching musicians:', error);
    res.status(500).json({ error: 'Failed to fetch musicians' });
  }
});

router.post('/hire', auth, async (req, res) => {
  try {
    const { musicianId, projectTitle, description, budget, deadline, paymentMethodId } = req.body;

    // Get musician details
    const musician = await db.get('SELECT * FROM musicians WHERE id = ?', [musicianId]);
    if (!musician) {
      return res.status(404).json({ error: 'Musician not found' });
    }

    // Calculate fees
    const fees = calculateFees(budget, 'session_hire', 'session');

    // Create Stripe payment intent (hold funds in escrow)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(fees.grossAmount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      capture_method: 'manual', // Hold funds until work is completed
      metadata: {
        type: 'session_hire',
        musician_id: musicianId,
        client_id: req.user.id
      }
    });

    if (paymentIntent.status === 'requires_capture') {
      // Create contract
      const contractId = await db.run(`
        INSERT INTO session_contracts (
          client_id, musician_id, project_title, description, budget,
          platform_fee, net_amount, deadline, status, payment_intent_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `, [
        req.user.id, musicianId, projectTitle, description, fees.grossAmount,
        fees.platformFee, fees.netAmount, deadline, paymentIntent.id, new Date().toISOString()
      ]);

      res.json({ success: true, contractId: contractId.lastID });
    } else {
      res.status(400).json({ error: 'Payment authorization failed' });
    }
  } catch (error) {
    console.error('Error hiring musician:', error);
    res.status(500).json({ error: 'Failed to hire musician' });
  }
});

// NFT Routes
router.get('/nft/marketplace', auth, async (req, res) => {
  try {
    const trending = await db.all(`
      SELECT n.*, a.username as artist_name, a.display_name as artist_display_name,
             a.avatar as artist_avatar, a.verified as artist_verified
      FROM music_nfts n
      JOIN users a ON n.artist_id = a.id
      WHERE n.is_active = 1
      ORDER BY n.volume_24h DESC
      LIMIT 10
    `);

    const featured = await db.all(`
      SELECT n.*, a.username as artist_name, a.display_name as artist_display_name,
             a.avatar as artist_avatar, a.verified as artist_verified
      FROM music_nfts n
      JOIN users a ON n.artist_id = a.id
      WHERE n.is_active = 1 AND n.is_featured = 1
      ORDER BY n.created_at DESC
      LIMIT 5
    `);

    const newReleases = await db.all(`
      SELECT n.*, a.username as artist_name, a.display_name as artist_display_name,
             a.avatar as artist_avatar, a.verified as artist_verified
      FROM music_nfts n
      JOIN users a ON n.artist_id = a.id
      WHERE n.is_active = 1
      ORDER BY n.created_at DESC
      LIMIT 20
    `);

    const marketplace = {
      trending: trending.map(nft => ({ ...nft, artist: { id: nft.artist_id, name: nft.artist_name, displayName: nft.artist_display_name, avatar: nft.artist_avatar, verified: nft.artist_verified === 1 } })),
      featured: featured.map(nft => ({ ...nft, artist: { id: nft.artist_id, name: nft.artist_name, displayName: nft.artist_display_name, avatar: nft.artist_avatar, verified: nft.artist_verified === 1 } })),
      newReleases: newReleases.map(nft => ({ ...nft, artist: { id: nft.artist_id, name: nft.artist_name, displayName: nft.artist_display_name, avatar: nft.artist_avatar, verified: nft.artist_verified === 1 } }))
    };

    res.json({ marketplace });
  } catch (error) {
    console.error('Error fetching NFT marketplace:', error);
    res.status(500).json({ error: 'Failed to fetch NFT marketplace' });
  }
});

router.post('/nft/mint', auth, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'artwork', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title, description, genre, price, currency, royaltyPercentage,
      totalSupply, blockchain, utility, metadata
    } = req.body;

    const audioFile = req.files.audio ? req.files.audio[0].path : null;
    const artworkFile = req.files.artwork ? req.files.artwork[0].path : null;

    if (!audioFile || !artworkFile) {
      return res.status(400).json({ error: 'Audio and artwork files are required' });
    }

    // Calculate minting fee
    const mintingFee = BUSINESS_CONFIG.NFT_MINTING_FEE;

    // Create Stripe payment for minting fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: mintingFee * 100, // Convert to cents
      currency: 'usd',
      payment_method: req.body.paymentMethodId,
      confirm: true,
      metadata: {
        type: 'nft_minting',
        user_id: req.user.id
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Generate unique token ID
      const tokenId = crypto.randomBytes(32).toString('hex');

      // Create NFT record
      const nftId = await db.run(`
        INSERT INTO music_nfts (
          artist_id, title, description, genre, artwork, audio_preview, full_track,
          token_id, blockchain, price, currency, royalty_percentage, total_supply,
          available_supply, utility, metadata, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `, [
        req.user.id, title, description, genre, artworkFile, audioFile, audioFile,
        tokenId, blockchain, price, currency, royaltyPercentage, totalSupply,
        totalSupply, JSON.stringify(utility), JSON.stringify(metadata),
        new Date().toISOString(), new Date().toISOString()
      ]);

      // Record minting transaction
      const transactionId = await db.run(`
        INSERT INTO transactions (
          user_id, type, status, amount, fee, net_amount, currency, description,
          product_type, product_id, payment_method_id, stripe_payment_id, created_at
        ) VALUES (?, 'mint', 'completed', ?, 0, ?, 'USD', ?, 'nft', ?, ?, ?, ?)
      `, [
        req.user.id, mintingFee, -mintingFee, `NFT minting: ${title}`,
        nftId.lastID, req.body.paymentMethodId, paymentIntent.id, new Date().toISOString()
      ]);

      // Track business revenue from minting fee
      await trackBusinessRevenue({
        transaction_id: transactionId.lastID,
        user_id: req.user.id,
        transaction_type: 'nft_mint',
        gross_amount: mintingFee,
        platform_fee: mintingFee,
        net_amount: 0,
        currency: 'USD',
        product_type: 'nft',
        product_id: nftId.lastID,
        payment_method: 'stripe'
      });

      res.json({ success: true, nftId: nftId.lastID, tokenId });
    } else {
      res.status(400).json({ error: 'Minting payment failed' });
    }
  } catch (error) {
    console.error('Error minting NFT:', error);
    res.status(500).json({ error: 'Failed to mint NFT' });
  }
});

// Subscription Routes
router.get('/subscriptions/tiers', auth, async (req, res) => {
  try {
    const tiers = await db.all('SELECT * FROM subscription_tiers WHERE is_active = 1 ORDER BY price ASC');
    
    const processedTiers = tiers.map(tier => ({
      ...tier,
      features: tier.features ? JSON.parse(tier.features) : [],
      limits: tier.limits ? JSON.parse(tier.limits) : {},
      benefits: tier.benefits ? JSON.parse(tier.benefits) : [],
      addOns: tier.add_ons ? JSON.parse(tier.add_ons) : []
    }));

    res.json({ tiers: processedTiers });
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    res.status(500).json({ error: 'Failed to fetch subscription tiers' });
  }
});

router.post('/subscriptions/subscribe', auth, async (req, res) => {
  try {
    const { tierId, billingCycle, paymentMethodId, addOns = {} } = req.body;

    // Get tier details
    const tier = await db.get('SELECT * FROM subscription_tiers WHERE id = ?', [tierId]);
    if (!tier) {
      return res.status(404).json({ error: 'Subscription tier not found' });
    }

    const basePrice = tier.price;
    const addOnCost = Object.values(addOns).reduce((sum, qty) => sum + qty, 0) * 10; // Simplified
    const totalPrice = basePrice + addOnCost;

    // Calculate platform fees
    const fees = calculateFees(totalPrice, 'subscription', 'subscription');

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: req.user.stripe_customer_id,
      items: [{ price: tier.stripe_price_id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: req.user.id,
        tier_id: tierId,
        billing_cycle: billingCycle
      }
    });

    // Record subscription
    const subscriptionId = await db.run(`
      INSERT INTO user_subscriptions (
        user_id, tier_id, stripe_subscription_id, status, billing_cycle,
        start_date, next_billing_date, add_ons, created_at
      ) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?)
    `, [
      req.user.id, tierId, subscription.id, billingCycle,
      new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      JSON.stringify(addOns), new Date().toISOString()
    ]);

    // Track business revenue
    await trackBusinessRevenue({
      transaction_id: subscriptionId.lastID,
      user_id: req.user.id,
      transaction_type: 'subscription',
      gross_amount: fees.grossAmount,
      platform_fee: fees.platformFee,
      net_amount: fees.netAmount,
      currency: 'USD',
      product_type: 'subscription',
      product_id: tierId,
      payment_method: 'stripe'
    });

    res.json({ success: true, subscriptionId: subscriptionId.lastID });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Business Revenue and Analytics Routes (Founder Access)
router.get('/business/revenue', auth, async (req, res) => {
  try {
    // Check if user is founder
    if (req.user.id !== BUSINESS_CONFIG.FOUNDER_USER_ID) {
      return res.status(403).json({ error: 'Access denied: Founder only' });
    }

    const { period = '30d', currency = 'USD' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case '7d':
        dateFilter = "AND recorded_at >= datetime('now', '-7 days')";
        break;
      case '30d':
        dateFilter = "AND recorded_at >= datetime('now', '-30 days')";
        break;
      case '90d':
        dateFilter = "AND recorded_at >= datetime('now', '-90 days')";
        break;
      case '1y':
        dateFilter = "AND recorded_at >= datetime('now', '-1 year')";
        break;
    }

    // Get revenue summary
    const revenue = await db.get(`
      SELECT 
        SUM(platform_fee) as total_revenue,
        SUM(CASE WHEN transaction_type = 'beat_purchase' THEN platform_fee ELSE 0 END) as beats_revenue,
        SUM(CASE WHEN transaction_type = 'sample_purchase' THEN platform_fee ELSE 0 END) as samples_revenue,
        SUM(CASE WHEN transaction_type = 'nft_mint' THEN platform_fee ELSE 0 END) as nft_revenue,
        SUM(CASE WHEN transaction_type = 'subscription' THEN platform_fee ELSE 0 END) as subscription_revenue,
        SUM(CASE WHEN transaction_type = 'session_hire' THEN platform_fee ELSE 0 END) as session_revenue,
        COUNT(*) as total_transactions
      FROM business_revenue 
      WHERE currency = ? ${dateFilter}
    `, [currency]);

    // Get daily revenue for charts
    const dailyRevenue = await db.all(`
      SELECT 
        DATE(recorded_at) as date,
        SUM(platform_fee) as revenue,
        COUNT(*) as transactions
      FROM business_revenue 
      WHERE currency = ? ${dateFilter}
      GROUP BY DATE(recorded_at)
      ORDER BY date DESC
    `, [currency]);

    // Get wallet balances
    const wallets = await db.all('SELECT * FROM business_wallets ORDER BY currency');

    res.json({
      revenue,
      dailyRevenue,
      wallets,
      config: {
        platformFeePercentage: BUSINESS_CONFIG.PLATFORM_FEE_PERCENTAGE,
        nftMintingFee: BUSINESS_CONFIG.NFT_MINTING_FEE,
        withdrawalFeePercentage: BUSINESS_CONFIG.WITHDRAWAL_FEE_PERCENTAGE
      }
    });
  } catch (error) {
    console.error('Error fetching business revenue:', error);
    res.status(500).json({ error: 'Failed to fetch business revenue' });
  }
});

router.get('/business/analytics', auth, async (req, res) => {
  try {
    // Check if user is founder
    if (req.user.id !== BUSINESS_CONFIG.FOUNDER_USER_ID) {
      return res.status(403).json({ error: 'Access denied: Founder only' });
    }

    // User growth analytics
    const userGrowth = await db.all(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users 
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Top revenue sources
    const topProducts = await db.all(`
      SELECT 
        product_type,
        SUM(platform_fee) as revenue,
        COUNT(*) as transactions
      FROM business_revenue 
      WHERE recorded_at >= datetime('now', '-30 days')
      GROUP BY product_type
      ORDER BY revenue DESC
    `);

    // Top users by revenue generation
    const topUsers = await db.all(`
      SELECT 
        u.username,
        u.display_name,
        SUM(br.platform_fee) as total_fees_generated,
        COUNT(br.id) as transactions
      FROM business_revenue br
      JOIN users u ON br.user_id = u.id
      WHERE br.recorded_at >= datetime('now', '-30 days')
      GROUP BY br.user_id
      ORDER BY total_fees_generated DESC
      LIMIT 10
    `);

    res.json({
      userGrowth,
      topProducts,
      topUsers
    });
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    res.status(500).json({ error: 'Failed to fetch business analytics' });
  }
});

// Withdrawal Routes (For users to withdraw their earnings)
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, currency = 'USD', paymentMethodId } = req.body;

    if (amount < BUSINESS_CONFIG.MINIMUM_WITHDRAWAL) {
      return res.status(400).json({ 
        error: `Minimum withdrawal amount is $${BUSINESS_CONFIG.MINIMUM_WITHDRAWAL}` 
      });
    }

    // Get user balance
    const balance = await db.get(`
      SELECT SUM(net_amount) as available_balance
      FROM transactions 
      WHERE user_id = ? AND type IN ('sale', 'royalty') AND status = 'completed'
    `, [req.user.id]);

    const availableBalance = balance?.available_balance || 0;

    if (amount > availableBalance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Calculate withdrawal fee
    const withdrawalFee = amount * (BUSINESS_CONFIG.WITHDRAWAL_FEE_PERCENTAGE / 100);
    const netAmount = amount - withdrawalFee;

    // Create withdrawal request
    const withdrawalId = await db.run(`
      INSERT INTO withdrawal_requests (
        user_id, amount, withdrawal_fee, net_amount, currency, payment_method_id,
        status, requested_at, estimated_arrival
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `, [
      req.user.id, amount, withdrawalFee, netAmount, currency, paymentMethodId,
      new Date().toISOString(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    ]);

    // Record withdrawal transaction
    const transactionId = await db.run(`
      INSERT INTO transactions (
        user_id, type, status, amount, fee, net_amount, currency, description,
        created_at
      ) VALUES (?, 'withdrawal', 'pending', ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id, amount, withdrawalFee, -netAmount, currency,
      'Withdrawal request', new Date().toISOString()
    ]);

    // Track business revenue from withdrawal fee
    await trackBusinessRevenue({
      transaction_id: transactionId.lastID,
      user_id: req.user.id,
      transaction_type: 'withdrawal_fee',
      gross_amount: amount,
      platform_fee: withdrawalFee,
      net_amount: netAmount,
      currency,
      product_type: 'withdrawal',
      product_id: withdrawalId.lastID,
      payment_method: 'stripe'
    });

    res.json({ 
      success: true, 
      withdrawalId: withdrawalId.lastID,
      netAmount,
      fee: withdrawalFee,
      estimatedArrival: '2-3 business days'
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

module.exports = router;