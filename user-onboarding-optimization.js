const { EventEmitter } = require('events');

class UserOnboardingOptimization extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.onboardingFlows = new Map();
    this.userProgress = new Map();
    this.analytics = new Map();
    this.abTests = new Map();
    
    this.initializeOnboardingFlows();
    this.setupAnalytics();
  }

  initializeOnboardingFlows() {
    // Main onboarding flow for new users
    const mainFlow = {
      id: 'main_onboarding',
      name: 'New Artist Onboarding',
      steps: [
        {
          id: 'welcome',
          type: 'welcome_screen',
          title: 'Welcome to Not a Label! 🎵',
          subtitle: 'The platform for independent musicians',
          content: 'Join thousands of artists building their careers with AI assistance and powerful tools.',
          ctaText: 'Get Started',
          duration: 30, // seconds
          skippable: false,
          media: {
            type: 'video',
            url: '/onboarding/welcome-video.mp4',
            thumbnail: '/images/welcome-thumbnail.jpg'
          }
        },
        
        {
          id: 'profile_creation',
          type: 'form',
          title: 'Create Your Artist Profile',
          subtitle: 'Tell us about your music',
          required: true,
          fields: [
            {
              name: 'artistName',
              type: 'text',
              label: 'Artist/Band Name',
              placeholder: 'Your stage name',
              required: true,
              validation: { minLength: 2, maxLength: 50 }
            },
            {
              name: 'genres',
              type: 'multiselect',
              label: 'Music Genres',
              options: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Indie', 'Folk', 'Jazz', 'Classical', 'R&B', 'Country'],
              required: true,
              maxSelections: 3
            },
            {
              name: 'experienceLevel',
              type: 'select',
              label: 'Experience Level',
              options: [
                { value: 'beginner', label: 'Beginner (0-2 years)' },
                { value: 'intermediate', label: 'Intermediate (3-5 years)' },
                { value: 'advanced', label: 'Advanced (6+ years)' },
                { value: 'professional', label: 'Professional' }
              ],
              required: true
            },
            {
              name: 'goals',
              type: 'checkbox',
              label: 'What are your goals?',
              options: [
                'Build a fanbase',
                'Collaborate with other artists',
                'Monetize my music',
                'Get discovered by labels',
                'Improve my skills',
                'Stream live performances'
              ],
              required: true,
              minSelections: 1
            }
          ],
          progressWeight: 30
        },

        {
          id: 'feature_tour',
          type: 'interactive_tour',
          title: 'Discover Your Superpowers',
          subtitle: 'Let\'s explore what you can do',
          required: true,
          tourStops: [
            {
              element: '#ai-assistant',
              title: 'Meet Your AI Career Assistant',
              content: 'Get personalized advice, industry insights, and career guidance powered by AI.',
              action: 'Try asking: "How can I grow my fanbase?"',
              interactive: true
            },
            {
              element: '#collaboration-network',
              title: 'Find Your Perfect Collaborators',
              content: 'Our smart matching connects you with artists who complement your style and goals.',
              action: 'View potential matches based on your profile',
              interactive: true
            },
            {
              element: '#fan-clubs',
              title: 'Build Your Fan Community',
              content: 'Create exclusive fan experiences and generate recurring revenue.',
              action: 'See fan club templates',
              interactive: false
            },
            {
              element: '#social-scheduler',
              title: 'Automate Your Social Presence',
              content: 'Schedule posts across all platforms and track engagement automatically.',
              action: 'Connect your social accounts',
              interactive: true
            },
            {
              element: '#analytics-dashboard',
              title: 'Track Your Growth',
              content: 'Monitor your progress with detailed analytics and insights.',
              action: 'View your dashboard preview',
              interactive: true
            }
          ],
          progressWeight: 25
        },

        {
          id: 'account_connections',
          type: 'integrations',
          title: 'Connect Your Accounts',
          subtitle: 'Sync your existing platforms',
          optional: true,
          integrations: [
            {
              platform: 'spotify',
              name: 'Spotify',
              icon: '/icons/spotify.svg',
              benefits: ['Sync your music catalog', 'Track streaming stats', 'Auto-update releases'],
              priority: 'high',
              oneClick: true
            },
            {
              platform: 'youtube',
              name: 'YouTube',
              icon: '/icons/youtube.svg',
              benefits: ['Video analytics', 'Auto-promotion', 'Content sync'],
              priority: 'high',
              oneClick: true
            },
            {
              platform: 'instagram',
              name: 'Instagram',
              icon: '/icons/instagram.svg',
              benefits: ['Auto-posting', 'Story scheduling', 'Engagement tracking'],
              priority: 'medium',
              oneClick: true
            },
            {
              platform: 'twitter',
              name: 'Twitter',
              icon: '/icons/twitter.svg',
              benefits: ['Tweet scheduling', 'Hashtag optimization', 'Audience insights'],
              priority: 'medium',
              oneClick: true
            }
          ],
          progressWeight: 15
        },

        {
          id: 'first_action',
          type: 'action_selection',
          title: 'What Would You Like to Do First?',
          subtitle: 'Choose your starting point',
          required: true,
          options: [
            {
              id: 'upload_music',
              title: 'Upload My First Track',
              description: 'Share your music and start building your catalog',
              icon: '🎵',
              estimatedTime: '5 minutes',
              difficulty: 'Easy',
              nextStep: 'music_upload_wizard'
            },
            {
              id: 'find_collaborators',
              title: 'Find Collaboration Partners',
              description: 'Connect with artists who match your style',
              icon: '🤝',
              estimatedTime: '10 minutes',
              difficulty: 'Easy',
              nextStep: 'collaboration_matching'
            },
            {
              id: 'create_fan_club',
              title: 'Launch My Fan Club',
              description: 'Start building a dedicated community',
              icon: '🎪',
              estimatedTime: '15 minutes',
              difficulty: 'Medium',
              nextStep: 'fan_club_setup'
            },
            {
              id: 'schedule_content',
              title: 'Schedule Social Media Posts',
              description: 'Plan your social media strategy',
              icon: '📱',
              estimatedTime: '10 minutes',
              difficulty: 'Easy',
              nextStep: 'social_media_setup'
            },
            {
              id: 'explore_platform',
              title: 'Explore the Platform',
              description: 'Take a guided tour of all features',
              icon: '🗺️',
              estimatedTime: '20 minutes',
              difficulty: 'Easy',
              nextStep: 'full_platform_tour'
            }
          ],
          progressWeight: 20
        },

        {
          id: 'completion',
          type: 'celebration',
          title: 'Welcome to the Community! 🎉',
          subtitle: 'You\'re all set to start your journey',
          content: {
            message: 'Your profile is complete and you\'re ready to explore everything Not a Label has to offer.',
            achievements: [
              'Profile Created ✓',
              'Features Discovered ✓',
              'First Action Planned ✓'
            ],
            nextSteps: [
              'Complete your first chosen action',
              'Explore the AI assistant',
              'Join the community discussions'
            ],
            rewards: [
              {
                type: 'badge',
                name: 'New Artist',
                description: 'Welcome to the community!'
              },
              {
                type: 'credits',
                amount: 100,
                description: 'Platform credits for premium features'
              }
            ]
          },
          progressWeight: 10
        }
      ],
      
      estimatedDuration: 900, // 15 minutes
      completionRate: 0,
      dropoffPoints: [],
      variants: ['default', 'short_form', 'music_focused', 'social_focused']
    };

    // Quick onboarding for experienced users
    const quickFlow = {
      id: 'quick_onboarding',
      name: 'Quick Setup for Pros',
      steps: [
        {
          id: 'express_profile',
          type: 'express_form',
          title: 'Quick Profile Setup',
          fields: [
            { name: 'artistName', type: 'text', required: true },
            { name: 'primaryGenre', type: 'select', required: true },
            { name: 'mainGoal', type: 'select', required: true }
          ]
        },
        {
          id: 'bulk_connections',
          type: 'bulk_integrations',
          title: 'Connect All Your Accounts',
          oneClickSetup: true
        },
        {
          id: 'dashboard_preview',
          type: 'preview',
          title: 'Your Dashboard is Ready'
        }
      ],
      estimatedDuration: 300 // 5 minutes
    };

    this.onboardingFlows.set('main', mainFlow);
    this.onboardingFlows.set('quick', quickFlow);
  }

  async startOnboarding(userId, flowType = 'main', variant = 'default') {
    const flow = this.onboardingFlows.get(flowType);
    if (!flow) {
      throw new Error(`Onboarding flow '${flowType}' not found`);
    }

    const sessionId = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      userId,
      flowType,
      variant,
      currentStep: 0,
      startedAt: new Date(),
      lastActivity: new Date(),
      progress: 0,
      completed: false,
      dropped: false,
      data: {},
      timeSpent: 0,
      interactionEvents: [],
      abTestGroup: this.assignABTestGroup(userId)
    };

    this.userProgress.set(userId, session);
    this.trackEvent(sessionId, 'onboarding_started', { flowType, variant });
    
    this.emit('onboardingStarted', { userId, sessionId, flowType, variant });
    
    return {
      success: true,
      sessionId,
      currentStep: flow.steps[0],
      totalSteps: flow.steps.length,
      progress: 0
    };
  }

  async nextStep(userId, stepData = {}) {
    const session = this.userProgress.get(userId);
    if (!session) {
      throw new Error('No active onboarding session found');
    }

    const flow = this.onboardingFlows.get(session.flowType);
    const currentStep = flow.steps[session.currentStep];
    
    // Validate step completion
    const validation = await this.validateStepCompletion(currentStep, stepData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        currentStep: currentStep
      };
    }

    // Save step data
    session.data[currentStep.id] = stepData;
    session.lastActivity = new Date();
    
    // Track step completion
    this.trackEvent(session.id, 'step_completed', {
      stepId: currentStep.id,
      stepType: currentStep.type,
      timeSpent: Date.now() - session.lastActivity.getTime()
    });

    // Move to next step
    session.currentStep++;
    session.progress = this.calculateProgress(flow, session.currentStep);

    // Check if onboarding is complete
    if (session.currentStep >= flow.steps.length) {
      return await this.completeOnboarding(userId);
    }

    const nextStep = flow.steps[session.currentStep];
    
    this.emit('stepCompleted', {
      userId,
      sessionId: session.id,
      completedStep: currentStep.id,
      nextStep: nextStep.id,
      progress: session.progress
    });

    return {
      success: true,
      currentStep: nextStep,
      progress: session.progress,
      totalSteps: flow.steps.length
    };
  }

  async validateStepCompletion(step, data) {
    switch (step.type) {
      case 'form':
        return this.validateFormStep(step, data);
      case 'interactive_tour':
        return this.validateTourStep(step, data);
      case 'action_selection':
        return this.validateActionSelection(step, data);
      default:
        return { valid: true };
    }
  }

  validateFormStep(step, data) {
    for (const field of step.fields) {
      if (field.required && (!data[field.name] || data[field.name] === '')) {
        return {
          valid: false,
          error: `${field.label} is required`,
          field: field.name
        };
      }

      if (field.validation && data[field.name]) {
        const value = data[field.name];
        
        if (field.validation.minLength && value.length < field.validation.minLength) {
          return {
            valid: false,
            error: `${field.label} must be at least ${field.validation.minLength} characters`,
            field: field.name
          };
        }
        
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          return {
            valid: false,
            error: `${field.label} must be no more than ${field.validation.maxLength} characters`,
            field: field.name
          };
        }
      }

      if (field.type === 'checkbox' && field.minSelections) {
        const selections = data[field.name] || [];
        if (selections.length < field.minSelections) {
          return {
            valid: false,
            error: `Please select at least ${field.minSelections} options for ${field.label}`,
            field: field.name
          };
        }
      }
    }

    return { valid: true };
  }

  validateTourStep(step, data) {
    const requiredInteractions = step.tourStops.filter(stop => stop.interactive).length;
    const completedInteractions = data.completedInteractions || [];
    
    if (completedInteractions.length < requiredInteractions) {
      return {
        valid: false,
        error: 'Please complete all interactive tour elements',
        missing: requiredInteractions - completedInteractions.length
      };
    }

    return { valid: true };
  }

  validateActionSelection(step, data) {
    if (!data.selectedAction) {
      return {
        valid: false,
        error: 'Please select an action to continue'
      };
    }

    const validActions = step.options.map(option => option.id);
    if (!validActions.includes(data.selectedAction)) {
      return {
        valid: false,
        error: 'Invalid action selected'
      };
    }

    return { valid: true };
  }

  calculateProgress(flow, currentStep) {
    if (currentStep >= flow.steps.length) return 100;
    
    let totalWeight = flow.steps.reduce((sum, step) => sum + (step.progressWeight || 10), 0);
    let completedWeight = flow.steps.slice(0, currentStep).reduce((sum, step) => sum + (step.progressWeight || 10), 0);
    
    return Math.round((completedWeight / totalWeight) * 100);
  }

  async completeOnboarding(userId) {
    const session = this.userProgress.get(userId);
    if (!session) {
      throw new Error('No active onboarding session found');
    }

    session.completed = true;
    session.completedAt = new Date();
    session.timeSpent = session.completedAt - session.startedAt;
    session.progress = 100;

    // Process onboarding data
    const profileData = await this.processOnboardingData(session);
    
    // Award completion rewards
    const rewards = await this.awardCompletionRewards(userId, session);
    
    // Track completion
    this.trackEvent(session.id, 'onboarding_completed', {
      totalTime: session.timeSpent,
      stepsCompleted: session.currentStep,
      variant: session.variant,
      abTestGroup: session.abTestGroup
    });

    // Update analytics
    this.updateOnboardingAnalytics(session);
    
    this.emit('onboardingCompleted', {
      userId,
      sessionId: session.id,
      profileData,
      rewards,
      timeSpent: session.timeSpent
    });

    return {
      success: true,
      completed: true,
      profileData,
      rewards,
      nextSteps: this.getRecommendedNextSteps(session.data)
    };
  }

  async processOnboardingData(session) {
    const data = session.data;
    
    return {
      profile: {
        artistName: data.profile_creation?.artistName,
        genres: data.profile_creation?.genres || [],
        experienceLevel: data.profile_creation?.experienceLevel,
        goals: data.profile_creation?.goals || []
      },
      integrations: data.account_connections || {},
      firstAction: data.first_action?.selectedAction,
      preferences: {
        notifications: true,
        emailUpdates: true,
        marketingEmails: false
      }
    };
  }

  async awardCompletionRewards(userId, session) {
    const rewards = [
      {
        type: 'badge',
        id: 'onboarding_complete',
        name: 'Getting Started',
        description: 'Completed the onboarding process'
      },
      {
        type: 'credits',
        amount: 100,
        description: 'Welcome bonus credits'
      }
    ];

    // Bonus rewards for quick completion
    if (session.timeSpent < 600000) { // 10 minutes
      rewards.push({
        type: 'badge',
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Completed onboarding in record time'
      });
    }

    // Bonus for connecting accounts
    const connections = Object.keys(session.data.account_connections || {}).length;
    if (connections >= 2) {
      rewards.push({
        type: 'credits',
        amount: 50 * connections,
        description: `Bonus for connecting ${connections} accounts`
      });
    }

    return rewards;
  }

  getRecommendedNextSteps(onboardingData) {
    const nextSteps = [];
    
    if (onboardingData.first_action?.selectedAction === 'upload_music') {
      nextSteps.push({
        action: 'upload_first_track',
        title: 'Upload Your First Track',
        description: 'Share your music with the community',
        priority: 'high',
        estimatedTime: '5 minutes'
      });
    }

    if (onboardingData.profile_creation?.goals?.includes('Build a fanbase')) {
      nextSteps.push({
        action: 'create_fan_club',
        title: 'Launch Your Fan Club',
        description: 'Start building your dedicated community',
        priority: 'medium',
        estimatedTime: '15 minutes'
      });
    }

    if (onboardingData.profile_creation?.goals?.includes('Collaborate with other artists')) {
      nextSteps.push({
        action: 'find_collaborators',
        title: 'Find Collaboration Partners',
        description: 'Connect with artists who match your style',
        priority: 'medium',
        estimatedTime: '10 minutes'
      });
    }

    return nextSteps;
  }

  assignABTestGroup(userId) {
    // Simple hash-based assignment for consistent grouping
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return Math.abs(hash) % 100 < 50 ? 'A' : 'B';
  }

  trackEvent(sessionId, eventType, data = {}) {
    const event = {
      sessionId,
      eventType,
      data,
      timestamp: new Date()
    };

    // Store event for analytics
    if (!this.analytics.has(sessionId)) {
      this.analytics.set(sessionId, []);
    }
    this.analytics.get(sessionId).push(event);
    
    this.emit('onboardingEvent', event);
  }

  setupAnalytics() {
    this.analyticsData = {
      totalSessions: 0,
      completedSessions: 0,
      averageCompletionTime: 0,
      dropoffPoints: new Map(),
      conversionRates: new Map(),
      abTestResults: new Map()
    };
  }

  updateOnboardingAnalytics(session) {
    this.analyticsData.totalSessions++;
    
    if (session.completed) {
      this.analyticsData.completedSessions++;
    }

    // Update completion time average
    if (session.timeSpent) {
      const totalTime = this.analyticsData.averageCompletionTime * (this.analyticsData.completedSessions - 1);
      this.analyticsData.averageCompletionTime = (totalTime + session.timeSpent) / this.analyticsData.completedSessions;
    }

    // Track A/B test results
    const testGroup = session.abTestGroup;
    if (!this.analyticsData.abTestResults.has(testGroup)) {
      this.analyticsData.abTestResults.set(testGroup, { total: 0, completed: 0 });
    }
    
    const groupData = this.analyticsData.abTestResults.get(testGroup);
    groupData.total++;
    if (session.completed) {
      groupData.completed++;
    }
  }

  getOnboardingAnalytics() {
    const completionRate = this.analyticsData.totalSessions > 0 ? 
      (this.analyticsData.completedSessions / this.analyticsData.totalSessions) * 100 : 0;

    return {
      totalSessions: this.analyticsData.totalSessions,
      completionRate: completionRate.toFixed(2),
      averageCompletionTime: Math.round(this.analyticsData.averageCompletionTime / 1000), // Convert to seconds
      dropoffPoints: Array.from(this.analyticsData.dropoffPoints.entries()),
      abTestResults: Array.from(this.analyticsData.abTestResults.entries()).map(([group, data]) => ({
        group,
        completionRate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(2) : 0,
        total: data.total,
        completed: data.completed
      }))
    };
  }

  async skipOnboarding(userId, reason = 'user_choice') {
    const session = this.userProgress.get(userId);
    if (session) {
      session.dropped = true;
      session.dropReason = reason;
      session.droppedAt = new Date();
      
      this.trackEvent(session.id, 'onboarding_skipped', { reason, stepReached: session.currentStep });
      this.emit('onboardingSkipped', { userId, sessionId: session.id, reason, stepReached: session.currentStep });
    }

    return { success: true, message: 'Onboarding skipped successfully' };
  }

  async pauseOnboarding(userId) {
    const session = this.userProgress.get(userId);
    if (session) {
      session.paused = true;
      session.pausedAt = new Date();
      
      this.trackEvent(session.id, 'onboarding_paused', { stepReached: session.currentStep });
    }

    return { success: true, message: 'Onboarding paused' };
  }

  async resumeOnboarding(userId) {
    const session = this.userProgress.get(userId);
    if (session && session.paused) {
      session.paused = false;
      session.resumedAt = new Date();
      
      this.trackEvent(session.id, 'onboarding_resumed', { stepReached: session.currentStep });
      
      const flow = this.onboardingFlows.get(session.flowType);
      const currentStep = flow.steps[session.currentStep];
      
      return {
        success: true,
        currentStep,
        progress: session.progress,
        totalSteps: flow.steps.length
      };
    }

    return { success: false, error: 'No paused onboarding session found' };
  }
}

module.exports = UserOnboardingOptimization;