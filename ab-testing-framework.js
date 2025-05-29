const { EventEmitter } = require('events');

class ABTestingFramework extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.experiments = new Map();
    this.participants = new Map();
    this.results = new Map();
    this.segments = new Map();
    
    this.setupStatisticalEngine();
    this.initializeTestTemplates();
  }

  setupStatisticalEngine() {
    this.statisticalEngine = {
      confidenceLevel: 0.95,
      minimumSampleSize: 100,
      minimumDetectableEffect: 0.05, // 5% improvement
      powerAnalysis: 0.8,
      
      // Statistical functions
      calculateZScore: (p1, p2, n1, n2) => {
        const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2);
        const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
        return (p1 - p2) / standardError;
      },
      
      calculatePValue: (zScore) => {
        // Simplified p-value calculation
        return 2 * (1 - this.normalCDF(Math.abs(zScore)));
      },
      
      normalCDF: (x) => {
        // Approximation of normal cumulative distribution function
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
      },
      
      erf: (x) => {
        // Approximation of error function
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;
        
        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return sign * y;
      }
    };
  }

  initializeTestTemplates() {
    this.testTemplates = {
      landing_page: {
        name: 'Landing Page Optimization',
        type: 'conversion',
        variations: [
          {
            id: 'control',
            name: 'Original Landing Page',
            description: 'Current landing page design',
            changes: []
          },
          {
            id: 'variant_a',
            name: 'Simplified Hero Section',
            description: 'Cleaner hero with focused CTA',
            changes: ['hero_simplification', 'prominent_cta', 'reduced_text']
          },
          {
            id: 'variant_b',
            name: 'Video Background',
            description: 'Hero with background video',
            changes: ['video_background', 'overlay_text', 'animated_cta']
          }
        ],
        metrics: ['conversion_rate', 'bounce_rate', 'time_on_page', 'scroll_depth'],
        primaryMetric: 'conversion_rate',
        duration: 14 // days
      },

      signup_flow: {
        name: 'Signup Flow Optimization',
        type: 'conversion',
        variations: [
          {
            id: 'control',
            name: 'Multi-Step Signup',
            description: 'Current 3-step signup process',
            changes: []
          },
          {
            id: 'variant_a',
            name: 'Single-Step Signup',
            description: 'All fields on one page',
            changes: ['single_step', 'progress_removed', 'compact_form']
          },
          {
            id: 'variant_b',
            name: 'Social Signup First',
            description: 'Social login options prominent',
            changes: ['social_first', 'email_secondary', 'oauth_prominent']
          }
        ],
        metrics: ['signup_completion_rate', 'form_abandonment', 'time_to_complete'],
        primaryMetric: 'signup_completion_rate',
        duration: 10
      },

      onboarding_flow: {
        name: 'Onboarding Experience',
        type: 'engagement',
        variations: [
          {
            id: 'control',
            name: 'Standard Onboarding',
            description: 'Current onboarding flow',
            changes: []
          },
          {
            id: 'variant_a',
            name: 'Interactive Tutorial',
            description: 'Hands-on guided experience',
            changes: ['interactive_elements', 'guided_actions', 'progress_gamification']
          },
          {
            id: 'variant_b',
            name: 'Video-First Onboarding',
            description: 'Video explanations with skippable text',
            changes: ['video_tutorials', 'skip_options', 'visual_learning']
          }
        ],
        metrics: ['completion_rate', 'time_to_complete', 'feature_adoption', 'day_1_retention'],
        primaryMetric: 'completion_rate',
        duration: 21
      },

      pricing_page: {
        name: 'Pricing Strategy',
        type: 'conversion',
        variations: [
          {
            id: 'control',
            name: 'Three-Tier Pricing',
            description: 'Basic, Pro, Premium tiers',
            changes: []
          },
          {
            id: 'variant_a',
            name: 'Freemium Model',
            description: 'Free tier with premium upgrades',
            changes: ['free_tier_added', 'feature_limitations', 'upgrade_prompts']
          },
          {
            id: 'variant_b',
            name: 'Single Premium Tier',
            description: 'One comprehensive paid plan',
            changes: ['simplified_pricing', 'all_features_included', 'clear_value_prop']
          }
        ],
        metrics: ['conversion_rate', 'plan_selection', 'revenue_per_visitor'],
        primaryMetric: 'conversion_rate',
        duration: 28
      },

      email_campaigns: {
        name: 'Email Marketing Optimization',
        type: 'engagement',
        variations: [
          {
            id: 'control',
            name: 'Standard Newsletter',
            description: 'Current email format',
            changes: []
          },
          {
            id: 'variant_a',
            name: 'Personalized Content',
            description: 'AI-personalized recommendations',
            changes: ['personalized_recommendations', 'dynamic_content', 'user_behavior_based']
          },
          {
            id: 'variant_b',
            name: 'Short & Sweet',
            description: 'Concise format with clear CTAs',
            changes: ['reduced_content', 'single_cta', 'mobile_first']
          }
        ],
        metrics: ['open_rate', 'click_through_rate', 'unsubscribe_rate', 'conversion_rate'],
        primaryMetric: 'click_through_rate',
        duration: 14
      },

      feature_announcement: {
        name: 'Feature Announcement',
        type: 'engagement',
        variations: [
          {
            id: 'control',
            name: 'Banner Notification',
            description: 'Top banner with feature info',
            changes: []
          },
          {
            id: 'variant_a',
            name: 'Modal Popup',
            description: 'Full-screen modal with demo',
            changes: ['modal_popup', 'feature_demo', 'interactive_preview']
          },
          {
            id: 'variant_b',
            name: 'In-App Tour',
            description: 'Guided tour highlighting feature',
            changes: ['guided_tour', 'step_by_step', 'contextual_help']
          }
        ],
        metrics: ['feature_adoption_rate', 'dismissal_rate', 'engagement_time'],
        primaryMetric: 'feature_adoption_rate',
        duration: 7
      }
    };
  }

  async createExperiment(experimentData) {
    const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const experiment = {
      id: experimentId,
      name: experimentData.name,
      description: experimentData.description,
      type: experimentData.type, // 'conversion', 'engagement', 'retention'
      hypothesis: experimentData.hypothesis,
      
      template: experimentData.template || null,
      
      variations: experimentData.variations || this.testTemplates[experimentData.template]?.variations || [],
      
      targeting: {
        segments: experimentData.targeting?.segments || ['all_users'],
        trafficAllocation: experimentData.targeting?.trafficAllocation || 100, // Percentage of traffic
        countries: experimentData.targeting?.countries || ['all'],
        devices: experimentData.targeting?.devices || ['all'],
        newUsersOnly: experimentData.targeting?.newUsersOnly || false
      },
      
      trafficSplit: experimentData.trafficSplit || this.calculateEvenSplit(experimentData.variations?.length || 2),
      
      metrics: {
        primary: experimentData.metrics?.primary || 'conversion_rate',
        secondary: experimentData.metrics?.secondary || [],
        all: experimentData.metrics?.all || ['conversion_rate', 'bounce_rate', 'time_on_page']
      },
      
      schedule: {
        startDate: new Date(experimentData.startDate || Date.now()),
        endDate: experimentData.endDate ? new Date(experimentData.endDate) : null,
        duration: experimentData.duration || 14, // days
        timezone: experimentData.timezone || 'UTC'
      },
      
      sampleSize: {
        minimum: experimentData.sampleSize?.minimum || this.statisticalEngine.minimumSampleSize,
        target: experimentData.sampleSize?.target || this.calculateRequiredSampleSize(experimentData),
        current: 0
      },
      
      status: 'draft', // 'draft', 'running', 'paused', 'completed', 'stopped'
      
      results: {
        participants: 0,
        conversions: 0,
        statistical: {
          confidence: 0,
          significance: false,
          pValue: null,
          liftPercent: 0
        }
      },
      
      settings: {
        confidenceLevel: experimentData.confidenceLevel || this.statisticalEngine.confidenceLevel,
        minimumDetectableEffect: experimentData.minimumDetectableEffect || this.statisticalEngine.minimumDetectableEffect,
        earlyStoppingEnabled: experimentData.earlyStoppingEnabled || false,
        equalTrafficSplit: experimentData.equalTrafficSplit || true
      },
      
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: experimentData.createdBy || 'system'
    };

    this.experiments.set(experimentId, experiment);
    this.initializeExperimentTracking(experimentId);
    
    this.emit('experimentCreated', { experimentId, experiment });
    return { success: true, experimentId, experiment };
  }

  calculateEvenSplit(variationCount) {
    const splitPercentage = 100 / variationCount;
    const splits = {};
    
    for (let i = 0; i < variationCount; i++) {
      const variationId = i === 0 ? 'control' : `variant_${String.fromCharCode(97 + i - 1)}`;
      splits[variationId] = splitPercentage;
    }
    
    return splits;
  }

  calculateRequiredSampleSize(experimentData) {
    // Simplified sample size calculation
    const baselineConversion = experimentData.baselineConversion || 0.1; // 10%
    const minimumDetectableEffect = experimentData.minimumDetectableEffect || 0.05; // 5%
    const alpha = 1 - (experimentData.confidenceLevel || 0.95); // 0.05
    const beta = 1 - (experimentData.power || 0.8); // 0.2
    
    // Simplified formula (actual implementation would use more complex statistical calculations)
    const zAlpha = 1.96; // Z-score for 95% confidence
    const zBeta = 0.84; // Z-score for 80% power
    
    const p1 = baselineConversion;
    const p2 = baselineConversion * (1 + minimumDetectableEffect);
    const pooledP = (p1 + p2) / 2;
    
    const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pooledP * (1 - pooledP);
    const denominator = Math.pow(p2 - p1, 2);
    
    return Math.ceil(numerator / denominator);
  }

  initializeExperimentTracking(experimentId) {
    const tracking = {
      experimentId,
      variationMetrics: {},
      dailyMetrics: [],
      userSessions: [],
      conversionEvents: [],
      segmentPerformance: {},
      devicePerformance: {},
      timeBasedAnalysis: {
        hourly: {},
        daily: {},
        weekly: {}
      }
    };

    this.results.set(experimentId, tracking);
  }

  async startExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return { success: false, error: 'Experiment not found' };
    }

    if (experiment.status !== 'draft') {
      return { success: false, error: 'Experiment cannot be started' };
    }

    // Validate experiment setup
    const validation = this.validateExperiment(experiment);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    experiment.status = 'running';
    experiment.startedAt = new Date();
    experiment.updatedAt = new Date();

    // Calculate end date if not set
    if (!experiment.schedule.endDate) {
      experiment.schedule.endDate = new Date(
        experiment.startedAt.getTime() + (experiment.schedule.duration * 24 * 60 * 60 * 1000)
      );
    }

    // Initialize variation tracking
    experiment.variations.forEach(variation => {
      const tracking = this.results.get(experimentId);
      tracking.variationMetrics[variation.id] = {
        participants: 0,
        conversions: 0,
        conversionRate: 0,
        bounceRate: 0,
        timeOnPage: 0,
        revenue: 0
      };
    });

    // Start automatic result calculation
    this.startResultsCalculation(experimentId);

    this.emit('experimentStarted', { experimentId, experiment });
    return { success: true, experiment };
  }

  validateExperiment(experiment) {
    // Check variations
    if (experiment.variations.length < 2) {
      return { valid: false, error: 'At least 2 variations are required' };
    }

    // Check traffic split
    const totalTraffic = Object.values(experiment.trafficSplit).reduce((sum, percent) => sum + percent, 0);
    if (Math.abs(totalTraffic - 100) > 0.1) {
      return { valid: false, error: 'Traffic split must total 100%' };
    }

    // Check metrics
    if (!experiment.metrics.primary) {
      return { valid: false, error: 'Primary metric is required' };
    }

    // Check targeting
    if (experiment.targeting.trafficAllocation <= 0 || experiment.targeting.trafficAllocation > 100) {
      return { valid: false, error: 'Traffic allocation must be between 1-100%' };
    }

    return { valid: true };
  }

  async assignUserToVariation(userId, experimentId, userAttributes = {}) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user is eligible for experiment
    const eligible = this.checkUserEligibility(experiment, userAttributes);
    if (!eligible) {
      return null;
    }

    // Check if user already assigned
    const participantKey = `${experimentId}_${userId}`;
    if (this.participants.has(participantKey)) {
      return this.participants.get(participantKey);
    }

    // Determine variation using consistent hashing
    const variation = this.assignVariation(userId, experiment);
    
    const assignment = {
      userId,
      experimentId,
      variationId: variation.id,
      variationName: variation.name,
      assignedAt: new Date(),
      userAttributes,
      events: []
    };

    this.participants.set(participantKey, assignment);
    
    // Update experiment metrics
    const tracking = this.results.get(experimentId);
    tracking.variationMetrics[variation.id].participants++;
    experiment.results.participants++;
    experiment.sampleSize.current++;

    this.emit('userAssigned', { experimentId, userId, variationId: variation.id });
    
    return assignment;
  }

  checkUserEligibility(experiment, userAttributes) {
    // Check traffic allocation
    if (Math.random() * 100 > experiment.targeting.trafficAllocation) {
      return false;
    }

    // Check new users only
    if (experiment.targeting.newUsersOnly && userAttributes.isReturning) {
      return false;
    }

    // Check device targeting
    if (experiment.targeting.devices && 
        experiment.targeting.devices !== 'all' && 
        !experiment.targeting.devices.includes(userAttributes.device)) {
      return false;
    }

    // Check country targeting
    if (experiment.targeting.countries && 
        experiment.targeting.countries !== 'all' && 
        !experiment.targeting.countries.includes(userAttributes.country)) {
      return false;
    }

    // Check segment targeting
    if (experiment.targeting.segments && 
        experiment.targeting.segments !== 'all_users') {
      const userSegments = userAttributes.segments || [];
      const hasMatchingSegment = experiment.targeting.segments.some(segment => 
        userSegments.includes(segment)
      );
      if (!hasMatchingSegment) {
        return false;
      }
    }

    return true;
  }

  assignVariation(userId, experiment) {
    // Use consistent hashing for stable assignment
    const hash = this.hashUserId(userId, experiment.id);
    const hashPercent = (hash % 10000) / 100; // Convert to 0-100 range
    
    let cumulativePercent = 0;
    for (const [variationId, percent] of Object.entries(experiment.trafficSplit)) {
      cumulativePercent += percent;
      if (hashPercent <= cumulativePercent) {
        return experiment.variations.find(v => v.id === variationId);
      }
    }

    // Fallback to control
    return experiment.variations.find(v => v.id === 'control') || experiment.variations[0];
  }

  hashUserId(userId, experimentId) {
    // Simple hash function for consistent user assignment
    const str = `${userId}_${experimentId}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async trackEvent(userId, experimentId, eventType, eventData = {}) {
    const participantKey = `${experimentId}_${userId}`;
    const assignment = this.participants.get(participantKey);
    
    if (!assignment) {
      return { success: false, error: 'User not in experiment' };
    }

    const event = {
      type: eventType,
      data: eventData,
      timestamp: new Date(),
      variationId: assignment.variationId
    };

    assignment.events.push(event);

    // Update experiment metrics
    const experiment = this.experiments.get(experimentId);
    const tracking = this.results.get(experimentId);
    const variationMetrics = tracking.variationMetrics[assignment.variationId];

    // Handle specific event types
    switch (eventType) {
      case 'conversion':
        variationMetrics.conversions++;
        variationMetrics.conversionRate = variationMetrics.conversions / variationMetrics.participants;
        experiment.results.conversions++;
        
        if (eventData.revenue) {
          variationMetrics.revenue += eventData.revenue;
        }
        break;

      case 'bounce':
        // Track bounce events for bounce rate calculation
        break;

      case 'page_view':
        if (eventData.timeOnPage) {
          variationMetrics.timeOnPage = 
            (variationMetrics.timeOnPage * (variationMetrics.participants - 1) + eventData.timeOnPage) / 
            variationMetrics.participants;
        }
        break;
    }

    // Add to daily metrics
    const today = new Date().toISOString().split('T')[0];
    const dailyMetric = tracking.dailyMetrics.find(m => m.date === today);
    
    if (dailyMetric) {
      dailyMetric.events++;
      if (eventType === 'conversion') {
        dailyMetric.conversions++;
      }
    } else {
      tracking.dailyMetrics.push({
        date: today,
        events: 1,
        conversions: eventType === 'conversion' ? 1 : 0,
        participants: variationMetrics.participants
      });
    }

    this.emit('eventTracked', { experimentId, userId, eventType, variationId: assignment.variationId });
    
    return { success: true, event };
  }

  startResultsCalculation(experimentId) {
    // Calculate results every hour
    const calculationInterval = setInterval(() => {
      this.calculateExperimentResults(experimentId);
    }, 60 * 60 * 1000); // 1 hour

    // Stop calculation when experiment ends
    const experiment = this.experiments.get(experimentId);
    const duration = experiment.schedule.endDate.getTime() - Date.now();
    
    setTimeout(() => {
      clearInterval(calculationInterval);
      this.completeExperiment(experimentId);
    }, duration);
  }

  calculateExperimentResults(experimentId) {
    const experiment = this.experiments.get(experimentId);
    const tracking = this.results.get(experimentId);
    
    if (!experiment || experiment.status !== 'running') return;

    const variations = Object.entries(tracking.variationMetrics);
    if (variations.length < 2) return;

    // Get control and primary variant
    const control = variations.find(([id]) => id === 'control') || variations[0];
    const primaryVariant = variations.find(([id]) => id !== 'control' && id !== control[0]) || variations[1];

    const [controlId, controlMetrics] = control;
    const [variantId, variantMetrics] = primaryVariant;

    // Calculate statistical significance
    const controlConversionRate = controlMetrics.conversionRate;
    const variantConversionRate = variantMetrics.conversionRate;
    
    if (controlMetrics.participants > 0 && variantMetrics.participants > 0) {
      const zScore = this.statisticalEngine.calculateZScore(
        variantConversionRate,
        controlConversionRate,
        variantMetrics.participants,
        controlMetrics.participants
      );
      
      const pValue = this.statisticalEngine.calculatePValue(zScore);
      const isSignificant = pValue < (1 - experiment.settings.confidenceLevel);
      const confidence = (1 - pValue) * 100;
      
      const lift = controlConversionRate > 0 ? 
        ((variantConversionRate - controlConversionRate) / controlConversionRate) * 100 : 0;

      experiment.results.statistical = {
        confidence: Math.round(confidence * 100) / 100,
        significance: isSignificant,
        pValue: Math.round(pValue * 10000) / 10000,
        liftPercent: Math.round(lift * 100) / 100,
        zScore: Math.round(zScore * 100) / 100
      };

      // Check for early stopping
      if (experiment.settings.earlyStoppingEnabled && 
          isSignificant && 
          experiment.sampleSize.current >= experiment.sampleSize.minimum) {
        this.stopExperiment(experimentId, 'early_significance');
      }
    }

    experiment.updatedAt = new Date();
    this.emit('resultsUpdated', { experimentId, results: experiment.results });
  }

  async getExperimentResults(experimentId, detailed = false) {
    const experiment = this.experiments.get(experimentId);
    const tracking = this.results.get(experimentId);
    
    if (!experiment || !tracking) {
      return { success: false, error: 'Experiment not found' };
    }

    const results = {
      experiment: {
        id: experimentId,
        name: experiment.name,
        status: experiment.status,
        duration: this.calculateExperimentDuration(experiment),
        participants: experiment.results.participants
      },
      
      variations: Object.entries(tracking.variationMetrics).map(([id, metrics]) => {
        const variation = experiment.variations.find(v => v.id === id);
        return {
          id,
          name: variation?.name || id,
          participants: metrics.participants,
          conversions: metrics.conversions,
          conversionRate: Math.round(metrics.conversionRate * 10000) / 100, // Percentage with 2 decimals
          bounceRate: Math.round(metrics.bounceRate * 10000) / 100,
          timeOnPage: Math.round(metrics.timeOnPage),
          revenue: metrics.revenue,
          trafficSplit: experiment.trafficSplit[id]
        };
      }),
      
      statistical: experiment.results.statistical,
      
      recommendation: this.generateRecommendation(experiment),
      
      timeline: detailed ? tracking.dailyMetrics : tracking.dailyMetrics.slice(-7)
    };

    if (detailed) {
      results.segmentAnalysis = this.calculateSegmentAnalysis(tracking);
      results.deviceAnalysis = this.calculateDeviceAnalysis(tracking);
      results.timeAnalysis = this.calculateTimeBasedAnalysis(tracking);
    }

    return { success: true, results };
  }

  calculateExperimentDuration(experiment) {
    if (!experiment.startedAt) return 0;
    
    const endTime = experiment.completedAt || experiment.stoppedAt || new Date();
    return Math.ceil((endTime - experiment.startedAt) / (1000 * 60 * 60 * 24)); // Days
  }

  generateRecommendation(experiment) {
    const stats = experiment.results.statistical;
    
    if (!stats.significance) {
      if (experiment.sampleSize.current < experiment.sampleSize.minimum) {
        return {
          action: 'continue',
          reason: 'Insufficient sample size for reliable results',
          confidence: 'low'
        };
      } else {
        return {
          action: 'no_change',
          reason: 'No statistically significant difference detected',
          confidence: 'high'
        };
      }
    }

    if (stats.liftPercent > 0) {
      return {
        action: 'implement_variant',
        reason: `Variant shows ${stats.liftPercent}% improvement with ${stats.confidence}% confidence`,
        confidence: stats.confidence > 95 ? 'high' : 'medium'
      };
    } else {
      return {
        action: 'keep_control',
        reason: `Control performs better by ${Math.abs(stats.liftPercent)}%`,
        confidence: stats.confidence > 95 ? 'high' : 'medium'
      };
    }
  }

  calculateSegmentAnalysis(tracking) {
    // Mock implementation - would analyze performance by user segments
    return {
      new_users: { conversionRate: 12.5, participants: 450 },
      returning_users: { conversionRate: 8.2, participants: 320 },
      mobile_users: { conversionRate: 10.1, participants: 380 },
      desktop_users: { conversionRate: 14.8, participants: 390 }
    };
  }

  calculateDeviceAnalysis(tracking) {
    // Mock implementation - would analyze performance by device type
    return {
      mobile: { conversionRate: 9.8, participants: 420 },
      desktop: { conversionRate: 15.2, participants: 280 },
      tablet: { conversionRate: 11.5, participants: 70 }
    };
  }

  calculateTimeBasedAnalysis(tracking) {
    // Mock implementation - would analyze performance by time
    return {
      best_hour: '2-3 PM',
      best_day: 'Tuesday',
      weekend_vs_weekday: { weekend: 8.5, weekday: 12.1 }
    };
  }

  async stopExperiment(experimentId, reason = 'manual') {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return { success: false, error: 'Experiment not found' };
    }

    if (experiment.status !== 'running') {
      return { success: false, error: 'Experiment is not running' };
    }

    experiment.status = 'stopped';
    experiment.stoppedAt = new Date();
    experiment.stopReason = reason;
    experiment.updatedAt = new Date();

    // Calculate final results
    this.calculateExperimentResults(experimentId);

    this.emit('experimentStopped', { experimentId, reason });
    return { success: true, experiment };
  }

  async completeExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    experiment.status = 'completed';
    experiment.completedAt = new Date();
    experiment.updatedAt = new Date();

    // Calculate final results
    this.calculateExperimentResults(experimentId);

    // Generate final report
    const report = await this.generateExperimentReport(experimentId);

    this.emit('experimentCompleted', { experimentId, report });
    return { success: true, experiment, report };
  }

  async generateExperimentReport(experimentId) {
    const results = await this.getExperimentResults(experimentId, true);
    
    if (!results.success) return null;

    const experiment = this.experiments.get(experimentId);
    const { variations, statistical, recommendation } = results.results;
    
    const winner = variations.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );

    const report = {
      experiment: {
        name: experiment.name,
        hypothesis: experiment.hypothesis,
        duration: this.calculateExperimentDuration(experiment),
        participants: experiment.results.participants
      },
      
      results: {
        winner: winner.name,
        winnerLift: statistical.liftPercent,
        confidence: statistical.confidence,
        significance: statistical.significance
      },
      
      variations: variations,
      
      insights: {
        keyFindings: this.generateKeyFindings(experiment, variations, statistical),
        learnings: this.generateLearnings(experiment, variations),
        nextSteps: this.generateNextSteps(recommendation, variations)
      },
      
      recommendation: recommendation,
      
      generatedAt: new Date()
    };

    return report;
  }

  generateKeyFindings(experiment, variations, statistical) {
    const findings = [];
    
    if (statistical.significance) {
      findings.push(`Statistically significant result with ${statistical.confidence}% confidence`);
      findings.push(`${statistical.liftPercent > 0 ? 'Positive' : 'Negative'} lift of ${Math.abs(statistical.liftPercent)}%`);
    } else {
      findings.push('No statistically significant difference between variations');
    }
    
    const highestPerforming = variations.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );
    findings.push(`${highestPerforming.name} had the highest conversion rate at ${highestPerforming.conversionRate}%`);
    
    return findings;
  }

  generateLearnings(experiment, variations) {
    return [
      'User behavior insights from the test',
      'Performance differences across segments',
      'Impact on secondary metrics',
      'Unexpected user interactions observed'
    ];
  }

  generateNextSteps(recommendation, variations) {
    const steps = [];
    
    switch (recommendation.action) {
      case 'implement_variant':
        steps.push('Roll out winning variation to 100% of traffic');
        steps.push('Monitor performance post-implementation');
        steps.push('Plan follow-up tests to further optimize');
        break;
      case 'continue':
        steps.push('Continue test until statistical significance');
        steps.push('Consider increasing traffic allocation');
        break;
      case 'no_change':
        steps.push('Keep current implementation');
        steps.push('Analyze secondary metrics for insights');
        steps.push('Plan new test with different variations');
        break;
    }
    
    return steps;
  }

  getFrameworkMetrics() {
    const totalExperiments = this.experiments.size;
    const runningExperiments = Array.from(this.experiments.values())
      .filter(exp => exp.status === 'running').length;
    const completedExperiments = Array.from(this.experiments.values())
      .filter(exp => exp.status === 'completed').length;
    
    const significantResults = Array.from(this.experiments.values())
      .filter(exp => exp.results.statistical.significance).length;
    
    const totalParticipants = Array.from(this.experiments.values())
      .reduce((sum, exp) => sum + exp.results.participants, 0);

    return {
      experiments: {
        total: totalExperiments,
        running: runningExperiments,
        completed: completedExperiments,
        significantResults: significantResults
      },
      participants: {
        total: totalParticipants,
        average: totalExperiments > 0 ? Math.round(totalParticipants / totalExperiments) : 0
      },
      performance: {
        significanceRate: completedExperiments > 0 ? 
          Math.round((significantResults / completedExperiments) * 100) : 0,
        averageLift: this.calculateAverageLift(),
        testVelocity: this.calculateTestVelocity()
      }
    };
  }

  calculateAverageLift() {
    const significantExperiments = Array.from(this.experiments.values())
      .filter(exp => exp.results.statistical.significance);
    
    if (significantExperiments.length === 0) return 0;
    
    const totalLift = significantExperiments
      .reduce((sum, exp) => sum + Math.abs(exp.results.statistical.liftPercent), 0);
    
    return Math.round((totalLift / significantExperiments.length) * 100) / 100;
  }

  calculateTestVelocity() {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentExperiments = Array.from(this.experiments.values())
      .filter(exp => exp.createdAt >= last30Days);
    
    return recentExperiments.length;
  }
}

module.exports = ABTestingFramework;