const OpenAI = require('openai');

function addEnhancedAIRoutes(app, authenticateToken, dbOptimizer) {
  console.log('Setting up enhanced AI Career Assistant routes...');

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-key'
  });

  // AI Career Analysis endpoint
  app.post('/api/ai/career-analysis', authenticateToken, async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { userId } = req.user;
      const { includeRecommendations = true, analysisType = 'comprehensive' } = req.body;

      // Get user data
      const user = await new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get onboarding data (in real app, this would be from database)
      const onboardingData = {
        profile: {
          artistName: user.artist_name || user.username,
          genre: user.genre || 'Unknown',
          bio: user.bio || ''
        },
        goals: {
          careerStage: 'emerging', // This would come from onboarding data
          primaryGoals: ['grow-audience', 'increase-streams'],
          timeCommitment: '3-5 hours',
          audienceSize: '100-1K'
        }
      };

      const prompt = `As an AI music career advisor, analyze this artist's profile and provide specific, actionable insights:

Artist Profile:
- Name: ${onboardingData.profile.artistName}
- Genre: ${onboardingData.profile.genre}
- Career Stage: ${onboardingData.goals.careerStage}
- Goals: ${onboardingData.goals.primaryGoals.join(', ')}
- Time Available: ${onboardingData.goals.timeCommitment}
- Current Audience: ${onboardingData.goals.audienceSize}

Provide a JSON response with:
1. "insights" array with 3-5 specific opportunities or recommendations
2. "weekly_goals" array with 2-3 achievable goals for this week
3. "priority_actions" array with immediate next steps
4. "growth_strategy" with a 30-day plan

Focus on practical, genre-specific advice that considers their time constraints and current level.`;

      let aiResponse;
      
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder-key') {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.7
        });
        
        aiResponse = completion.choices[0].message.content;
      } else {
        // Mock response for development
        aiResponse = JSON.stringify({
          insights: [
            {
              type: 'opportunity',
              title: 'TikTok Growth Window',
              description: `${onboardingData.profile.genre} music is trending on TikTok right now. Your sound could work well with current viral formats.`,
              action: 'Create 15-second track previews with trending audio',
              priority: 'high'
            },
            {
              type: 'strategy',
              title: 'Playlist Placement Ready',
              description: 'Your current audience size is perfect for getting accepted to mid-tier playlists.',
              action: 'Submit to 10 playlists in your genre this week',
              priority: 'high'
            },
            {
              type: 'content',
              title: 'Behind-the-Scenes Content',
              description: 'Fans love seeing the creative process. This builds deeper connections.',
              action: 'Post studio sessions and songwriting moments',
              priority: 'medium'
            }
          ],
          weekly_goals: [
            {
              title: 'Increase Social Media Engagement',
              description: 'Post consistently and engage with your audience daily',
              target: '25% more engagement than last week',
              actions: ['Post 3x this week', 'Respond to all comments', 'Share stories daily']
            },
            {
              title: 'Submit to Playlists',
              description: 'Get your music in front of new listeners through playlists',
              target: 'Submit to 5 relevant playlists',
              actions: ['Research playlist curators', 'Craft personalized pitches', 'Follow submission guidelines']
            }
          ],
          priority_actions: [
            'Complete your Spotify for Artists profile today',
            'Post a TikTok featuring your latest track',
            'Engage with 10 artists in your genre',
            'Update your bio across all platforms'
          ],
          growth_strategy: {
            week_1: 'Focus on content creation and platform optimization',
            week_2: 'Pitch to playlists and collaborate with other artists',
            week_3: 'Analyze what worked and double down on successful content',
            week_4: 'Plan next release and build anticipation'
          }
        });
      }

      const executionTime = Date.now() - startTime;

      res.json({
        success: true,
        analysis: JSON.parse(aiResponse),
        artist: onboardingData.profile.artistName,
        executionTime
      });

    } catch (error) {
      console.error('AI Career Analysis error:', error);
      const executionTime = Date.now() - startTime;
      
      res.status(500).json({
        error: 'AI analysis failed',
        message: error.message,
        executionTime
      });
    }
  });

  // AI Chat endpoint
  app.post('/api/ai/chat', authenticateToken, async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { message, context = {} } = req.body;
      const { userId } = req.user;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get user context
      const user = await new Promise((resolve, reject) => {
        dbOptimizer.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      const systemPrompt = `You are an expert music career advisor helping independent artists succeed. 

Artist Context:
- Name: ${user?.artist_name || user?.username || 'Artist'}
- Genre: ${user?.genre || 'Unknown'}
- Career Focus: Independent music career growth

Guidelines:
- Give specific, actionable advice
- Consider the independent music landscape
- Be encouraging but realistic
- Focus on practical steps they can take today
- Keep responses concise but helpful
- Include specific numbers/metrics when relevant

User Question: ${message}`;

      let aiResponse;

      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder-key') {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: systemPrompt }],
          max_tokens: 500,
          temperature: 0.7
        });
        
        aiResponse = completion.choices[0].message.content;
      } else {
        // Mock responses based on keywords
        if (message.toLowerCase().includes('grow') || message.toLowerCase().includes('audience')) {
          aiResponse = `Great question! Here's a proven growth strategy for ${user?.genre || 'your genre'}:

**Week 1-2: Foundation**
- Post consistently (3x/week minimum)
- Use relevant hashtags for your genre
- Engage with other artists' content daily

**Week 3-4: Amplification**
- Collaborate with artists at your level
- Submit to 2-3 playlists weekly
- Share behind-the-scenes content

Focus on building genuine connections rather than just numbers. Quality engagement often leads to faster growth than mass following.

What specific platform are you looking to grow on first?`;
        } else {
          aiResponse = `I understand you're asking about "${message}". 

As an independent artist, the key is to focus on what you can control:
- Consistent content creation
- Building genuine fan relationships  
- Improving your craft continuously
- Strategic use of social media

For your specific situation, I'd recommend starting with one platform where your target audience is most active, then expanding from there.

Would you like me to dive deeper into any of these areas?`;
        }
      }

      const executionTime = Date.now() - startTime;

      res.json({
        success: true,
        response: aiResponse,
        suggestions: [
          'Tell me more about this',
          'What should I do next?',
          'Give me specific examples',
          'How do I get started?'
        ],
        executionTime
      });

    } catch (error) {
      console.error('AI Chat error:', error);
      const executionTime = Date.now() - startTime;
      
      res.status(500).json({
        error: 'AI chat failed',
        message: error.message,
        executionTime
      });
    }
  });

  // Content Strategy Generator endpoint
  app.post('/api/ai/content-strategy', authenticateToken, async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { genre, goals, timeCommitment, platforms = ['tiktok', 'instagram'] } = req.body;
      const { userId } = req.user;

      if (!genre || !goals || !timeCommitment) {
        return res.status(400).json({ error: 'Genre, goals, and time commitment are required' });
      }

      const prompt = `Create a detailed 4-week content strategy for an independent ${genre} artist.

Requirements:
- Goals: ${goals.join(', ')}
- Time Available: ${timeCommitment}
- Platforms: ${platforms.join(', ')}

Provide a JSON response with:
1. "strategy_overview" with key themes and posting frequency
2. "weekly_breakdown" array with 4 weeks of specific content ideas
3. "content_types" with platform-specific recommendations
4. "success_metrics" to track progress

Make it specific to ${genre} music and current platform trends.`;

      let aiResponse;

      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder-key') {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
          temperature: 0.8
        });
        
        aiResponse = completion.choices[0].message.content;
      } else {
        // Mock comprehensive content strategy
        aiResponse = JSON.stringify({
          strategy_overview: {
            theme: `Authentic ${genre} content that shows your creative process and personality`,
            posting_frequency: timeCommitment.includes('1-2') ? '2-3 posts/week' : '4-5 posts/week',
            content_mix: '40% music content, 30% behind-scenes, 20% personality, 10% industry insights'
          },
          weekly_breakdown: [
            {
              week: 1,
              theme: 'Introduction & Foundation',
              content: [
                { platform: 'tiktok', type: 'Track preview with hook', day: 'Monday' },
                { platform: 'instagram', type: 'Studio setup photo', day: 'Wednesday' },
                { platform: 'tiktok', type: 'Beat making process', day: 'Friday' }
              ]
            },
            {
              week: 2,
              theme: 'Behind the Music',
              content: [
                { platform: 'instagram', type: 'Songwriting process story', day: 'Monday' },
                { platform: 'tiktok', type: 'Lyrics explanation', day: 'Thursday' },
                { platform: 'instagram', type: 'Inspiration behind latest track', day: 'Saturday' }
              ]
            }
          ],
          content_types: {
            tiktok: ['15-30 second track previews', 'Beat making videos', 'Freestyle challenges', 'Day in the life'],
            instagram: ['Studio photos', 'Lyric graphics', 'Story takeovers', 'Collaboration posts']
          },
          success_metrics: [
            'Track total views and engagement rate',
            'Monitor which content types perform best',
            'Count new followers from content',
            'Measure saves and shares on posts'
          ]
        });
      }

      const executionTime = Date.now() - startTime;

      res.json({
        success: true,
        strategy: JSON.parse(aiResponse),
        generated_for: {
          genre,
          goals,
          time_commitment: timeCommitment,
          platforms
        },
        executionTime
      });

    } catch (error) {
      console.error('Content Strategy error:', error);
      const executionTime = Date.now() - startTime;
      
      res.status(500).json({
        error: 'Content strategy generation failed',
        message: error.message,
        executionTime
      });
    }
  });

  // Weekly Goals endpoint
  app.get('/api/ai/weekly-goals', authenticateToken, async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { userId } = req.user;

      // Get user's current goals and progress
      const goals = [
        {
          id: 1,
          title: 'Increase Social Media Engagement',
          description: 'Boost engagement across all your social platforms',
          progress: 65,
          target: '25% increase from last week',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress',
          actions: [
            'Post daily stories showing your creative process',
            'Respond to all comments within 2 hours',
            'Collaborate with 2 artists this week'
          ]
        },
        {
          id: 2,
          title: 'Submit to Music Playlists',
          description: 'Get your latest track on relevant playlists',
          progress: 40,
          target: 'Submit to 10 playlists',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress',
          actions: [
            'Research playlist curators in your genre',
            'Craft personalized submission emails',
            'Follow up on previous submissions'
          ]
        },
        {
          id: 3,
          title: 'Create Content for Next Release',
          description: 'Prepare promotional content for upcoming track',
          progress: 20,
          target: 'Complete content calendar',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          actions: [
            'Film behind-the-scenes content',
            'Create lyric videos',
            'Design cover art variations'
          ]
        }
      ];

      const executionTime = Date.now() - startTime;

      res.json({
        success: true,
        goals,
        week_start: new Date().toISOString(),
        completion_rate: Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length),
        executionTime
      });

    } catch (error) {
      console.error('Weekly Goals error:', error);
      const executionTime = Date.now() - startTime;
      
      res.status(500).json({
        error: 'Failed to fetch weekly goals',
        message: error.message,
        executionTime
      });
    }
  });

  console.log('Enhanced AI Career Assistant routes added successfully');
}

module.exports = addEnhancedAIRoutes;