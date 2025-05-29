// Recommendation API Routes for Not a Label
const express = require('express');
const router = express.Router();
const MusicRecommendationEngine = require('./recommendation-engine');

// Initialize recommendation engine
const recommendationEngine = new MusicRecommendationEngine(process.env.OPENAI_API_KEY);

// Get personalized recommendations
router.post('/recommendations/personalized', async (req, res) => {
  try {
    const { userId } = req.user;
    const userProfile = {
      favoriteGenres: req.body.favoriteGenres || ['Indie', 'Alternative'],
      recentlyPlayed: req.body.recentlyPlayed || [],
      mood: req.body.mood || 'neutral',
      activity: req.body.activity || 'browsing'
    };

    const recommendations = await recommendationEngine.getRecommendations(userProfile);
    
    // Track recommendation generation
    await trackEvent(userId, 'recommendations_generated', 'personalized', recommendations.length);
    
    res.json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Discover new artists
router.post('/recommendations/discover', async (req, res) => {
  try {
    const { userId } = req.user;
    const discoveryProfile = {
      willingnessToExplore: req.body.explorationLevel || 0.5,
      excludeGenres: req.body.excludeGenres || [],
      preferredEra: req.body.preferredEra || 'contemporary'
    };

    const discoveries = await recommendationEngine.discoverNewArtists(discoveryProfile);
    
    res.json({
      success: true,
      discoveries,
      profile: discoveryProfile
    });
  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ error: 'Failed to discover new artists' });
  }
});

// Generate themed playlist
router.post('/recommendations/playlist', async (req, res) => {
  try {
    const { theme, duration = 60, preferences } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const playlist = await recommendationEngine.generatePlaylist(
      theme,
      duration,
      preferences || {}
    );
    
    res.json({
      success: true,
      playlist,
      sharingUrl: `/playlist/${playlist.id}`
    });
  } catch (error) {
    console.error('Playlist generation error:', error);
    res.status(500).json({ error: 'Failed to generate playlist' });
  }
});

// Get contextual recommendations
router.post('/recommendations/contextual', async (req, res) => {
  try {
    const context = {
      timeOfDay: getTimeOfDay(),
      weather: req.body.weather || 'clear',
      location: req.body.location || 'home',
      activity: req.body.activity || 'relaxing'
    };

    const recommendations = await recommendationEngine.getContextualRecommendations(context);
    
    res.json({
      success: true,
      recommendations,
      context
    });
  } catch (error) {
    console.error('Contextual recommendations error:', error);
    res.status(500).json({ error: 'Failed to get contextual recommendations' });
  }
});

// Submit feedback on recommendations
router.post('/recommendations/feedback', async (req, res) => {
  try {
    const { recommendationId, action, rating } = req.body;
    const { userId } = req.user;
    
    // Store feedback in database
    await storeFeedback(userId, recommendationId, action, rating);
    
    // Get adjusted recommendations if requested
    if (req.body.requestNewRecommendations) {
      const userFeedback = await getUserFeedbackHistory(userId);
      const adjusted = await recommendationEngine.adjustRecommendations(
        [],
        userFeedback
      );
      
      return res.json({
        success: true,
        message: 'Feedback recorded',
        newRecommendations: adjusted
      });
    }
    
    res.json({
      success: true,
      message: 'Feedback recorded'
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// Get recommendation history
router.get('/recommendations/history', async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit = 20, offset = 0 } = req.query;
    
    const history = await getRecommendationHistory(userId, limit, offset);
    
    res.json({
      success: true,
      history,
      total: history.length
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get recommendation history' });
  }
});

// Get similar songs/artists
router.post('/recommendations/similar', async (req, res) => {
  try {
    const { type, id, limit = 10 } = req.body;
    
    if (!type || !id) {
      return res.status(400).json({ error: 'Type and ID are required' });
    }
    
    let similar;
    if (type === 'song') {
      const songFeatures = await getSongFeatures(id);
      similar = await recommendationEngine.getContentBasedRecommendations(songFeatures);
    } else if (type === 'artist') {
      similar = await getSimilarArtists(id, limit);
    }
    
    res.json({
      success: true,
      similar,
      type,
      originalId: id
    });
  } catch (error) {
    console.error('Similar items error:', error);
    res.status(500).json({ error: 'Failed to find similar items' });
  }
});

// Helper functions
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 6) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

async function trackEvent(userId, eventName, category, value) {
  // Track analytics event
  console.log(`Event: ${eventName} for user ${userId}`);
}

async function storeFeedback(userId, recommendationId, action, rating) {
  // Store in database
  console.log(`Feedback: ${action} on ${recommendationId} by ${userId}`);
}

async function getUserFeedbackHistory(userId) {
  // Fetch from database
  return {
    liked: [],
    disliked: [],
    skipped: []
  };
}

async function getRecommendationHistory(userId, limit, offset) {
  // Fetch from database
  return [];
}

async function getSongFeatures(songId) {
  // Fetch song audio features
  return {
    tempo: 120,
    energy: 7,
    valence: 8,
    acousticness: 3,
    danceability: 6
  };
}

async function getSimilarArtists(artistId, limit) {
  // Find similar artists
  return [];
}

module.exports = router;