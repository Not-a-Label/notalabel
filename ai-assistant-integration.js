const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-iJK0N98V4HXdvs1234567890abcdef'
});

// AI Assistant context for music industry
const ASSISTANT_CONTEXT = `You are an AI assistant for independent musicians on the Not a Label platform. 
Your role is to provide personalized career advice, marketing strategies, and industry insights.
You have deep knowledge of:
- Music marketing and promotion strategies
- Streaming platform optimization
- Social media best practices for artists
- Revenue streams for independent musicians
- Music industry trends and opportunities
- Collaboration and networking tips
- Performance and touring advice
Always be encouraging, practical, and specific in your advice.`;

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get AI career advice
router.post('/advice', requireAuth, async (req, res) => {
  const startTime = Date.now();
  const { question, context } = req.body;
  
  try {
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Build user context
    const userContext = context ? `
User Context:
- Artist Name: ${context.artistName || 'Unknown'}
- Genre: ${context.genre || 'Unknown'}
- Career Stage: ${context.careerStage || 'Emerging'}
- Current Goals: ${context.goals || 'Growth'}
- Specific Situation: ${context.situation || 'General advice needed'}
` : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: ASSISTANT_CONTEXT },
        { role: 'user', content: `${userContext}\n\nQuestion: ${question}` }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const advice = completion.choices[0].message.content;
    const executionTime = Date.now() - startTime;

    // Log AI interaction
    if (req.db) {
      await new Promise((resolve) => {
        req.db.run(
          'INSERT INTO analytics (event_type, user_id, data) VALUES (?, ?, ?)',
          ['ai_advice_request', req.user.userId, JSON.stringify({ 
            question: question.substring(0, 100),
            executionTime 
          })],
          () => resolve()
        );
      });
    }

    res.json({
      success: true,
      advice,
      executionTime,
      tokens: completion.usage.total_tokens
    });

  } catch (error) {
    console.error('AI advice error:', error);
    res.status(500).json({ 
      error: 'Failed to generate advice',
      details: error.message 
    });
  }
});

// Generate marketing strategy
router.post('/marketing-strategy', requireAuth, async (req, res) => {
  const { artistProfile, goals, budget, timeframe } = req.body;
  
  try {
    const prompt = `Create a detailed marketing strategy for an independent artist:
Artist: ${artistProfile.name || 'Independent Artist'}
Genre: ${artistProfile.genre || 'Various'}
Current Monthly Listeners: ${artistProfile.monthlyListeners || 'Starting out'}
Goals: ${goals || 'Increase fanbase and streams'}
Budget: ${budget || 'Limited'}
Timeframe: ${timeframe || '3 months'}

Provide a structured plan with:
1. Immediate actions (this week)
2. Short-term strategy (1 month)
3. Medium-term goals (3 months)
4. Budget allocation suggestions
5. Key performance indicators to track`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: ASSISTANT_CONTEXT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    res.json({
      success: true,
      strategy: completion.choices[0].message.content,
      tokens: completion.usage.total_tokens
    });

  } catch (error) {
    console.error('Marketing strategy error:', error);
    res.status(500).json({ 
      error: 'Failed to generate marketing strategy',
      details: error.message 
    });
  }
});

// Analyze artist profile and provide insights
router.post('/profile-analysis', requireAuth, async (req, res) => {
  const { profile, analytics } = req.body;
  
  try {
    const prompt = `Analyze this artist profile and provide actionable insights:
Artist: ${profile.artistName}
Genre: ${profile.genre}
Bio: ${profile.bio || 'No bio provided'}
Active Since: ${profile.createdAt}

Analytics:
- Total Streams: ${analytics.totalStreams || 0}
- Monthly Growth: ${analytics.monthlyGrowth || 'N/A'}
- Top Platform: ${analytics.topPlatform || 'Unknown'}
- Engagement Rate: ${analytics.engagementRate || 'N/A'}

Provide:
1. Strengths to leverage
2. Areas for improvement
3. Opportunities to explore
4. Recommended next steps
5. Similar successful artists to study`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: ASSISTANT_CONTEXT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    res.json({
      success: true,
      analysis: completion.choices[0].message.content,
      tokens: completion.usage.total_tokens
    });

  } catch (error) {
    console.error('Profile analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze profile',
      details: error.message 
    });
  }
});

// Generate content ideas
router.post('/content-ideas', requireAuth, async (req, res) => {
  const { genre, platform, contentType, recentPosts } = req.body;
  
  try {
    const prompt = `Generate creative content ideas for an independent ${genre || 'music'} artist:
Platform: ${platform || 'Instagram'}
Content Type: ${contentType || 'Mixed'}
Recent Posts: ${recentPosts || 'Various music content'}

Provide 10 unique, engaging content ideas that:
1. Align with the genre and artist brand
2. Encourage fan engagement
3. Are feasible for independent artists
4. Include specific posting tips
5. Suggest relevant hashtags`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: ASSISTANT_CONTEXT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 600
    });

    res.json({
      success: true,
      ideas: completion.choices[0].message.content,
      tokens: completion.usage.total_tokens
    });

  } catch (error) {
    console.error('Content ideas error:', error);
    res.status(500).json({ 
      error: 'Failed to generate content ideas',
      details: error.message 
    });
  }
});

// AI chat conversation (maintains context)
router.post('/chat', requireAuth, async (req, res) => {
  const { messages, artistContext } = req.body;
  
  try {
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Add system context
    const systemMessage = {
      role: 'system',
      content: `${ASSISTANT_CONTEXT}\n\nArtist Context:\n${JSON.stringify(artistContext || {})}`
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 400
    });

    res.json({
      success: true,
      message: completion.choices[0].message.content,
      tokens: completion.usage.total_tokens
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat',
      details: error.message 
    });
  }
});

// Get trending topics and opportunities
router.get('/trending', requireAuth, async (req, res) => {
  try {
    const { genre } = req.query;
    
    const prompt = `What are the current trending topics, opportunities, and strategies for ${genre || 'independent'} artists in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}?

Include:
1. Trending sounds/styles
2. Platform-specific opportunities
3. Collaboration trends
4. Marketing tactics working now
5. Upcoming opportunities to prepare for`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: ASSISTANT_CONTEXT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({
      success: true,
      trends: completion.choices[0].message.content,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trending topics error:', error);
    res.status(500).json({ 
      error: 'Failed to get trending topics',
      details: error.message 
    });
  }
});

module.exports = router;