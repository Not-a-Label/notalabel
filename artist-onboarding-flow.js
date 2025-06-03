// Automated Artist Onboarding Flow for Not a Label
// Streamlines the journey from signup to first sale

const express = require('express');
const app = express();

// Onboarding workflow configuration
const ONBOARDING_FLOW = {
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Not a Label!',
      duration: '1 min',
      actions: [
        'Show welcome video from founder',
        'Display founding artist benefits',
        'Collect basic artist info'
      ]
    },
    {
      id: 'profile_setup',
      title: 'Create Your Artist Profile',
      duration: '3 mins',
      actions: [
        'Upload profile photo',
        'Write artist bio',
        'Add genre and style tags',
        'Connect social media accounts'
      ]
    },
    {
      id: 'music_upload',
      title: 'Upload Your First Track',
      duration: '5 mins',
      actions: [
        'Upload music file (MP3/WAV)',
        'Add track metadata',
        'Upload cover art',
        'Set pricing (suggested: $0.99-$2.99)'
      ]
    },
    {
      id: 'payment_setup',
      title: 'Set Up Your Earnings',
      duration: '2 mins',
      actions: [
        'Connect Stripe account',
        'Verify identity',
        'Set payout preferences',
        'Review fee structure (0% platform fee!)'
      ]
    },
    {
      id: 'growth_tools',
      title: 'Activate Growth Tools',
      duration: '2 mins',
      actions: [
        'Generate referral code',
        'Join founding artist community',
        'Enable fan messaging',
        'Set up email list'
      ]
    },
    {
      id: 'first_promotion',
      title: 'Launch Your First Campaign',
      duration: '3 mins',
      actions: [
        'Create shareable link',
        'Generate social media posts',
        'Schedule release announcement',
        'Invite first 10 fans'
      ]
    }
  ],
  
  email_sequence: [
    {
      trigger: 'signup',
      delay: 0,
      subject: 'Welcome to Not a Label! 🎵 Let\'s get you started',
      template: 'welcome_founding_artist'
    },
    {
      trigger: 'profile_complete',
      delay: 0,
      subject: 'Your artist profile looks amazing! Next step...',
      template: 'profile_complete_next'
    },
    {
      trigger: 'first_upload',
      delay: 0,
      subject: '🎉 Your music is live! Here\'s how to get your first sales',
      template: 'first_track_live'
    },
    {
      trigger: 'no_activity_24h',
      delay: 1440, // 24 hours in minutes
      subject: 'Need help? I\'m here to support your journey',
      template: 'check_in_support'
    },
    {
      trigger: 'first_sale',
      delay: 0,
      subject: '💰 You made your first sale! Here\'s what\'s next',
      template: 'first_sale_celebration'
    }
  ],
  
  gamification: {
    achievements: [
      { id: 'profile_complete', name: 'Profile Pro', points: 10 },
      { id: 'first_upload', name: 'Music Maker', points: 25 },
      { id: 'payment_verified', name: 'Ready to Earn', points: 15 },
      { id: 'first_fan', name: 'Fan Favorite', points: 20 },
      { id: 'first_sale', name: 'Revenue Generator', points: 50 },
      { id: 'referral_sent', name: 'Community Builder', points: 30 }
    ],
    
    rewards: [
      { points: 50, reward: 'Featured Artist Badge' },
      { points: 100, reward: 'Priority Support Access' },
      { points: 200, reward: 'Free Professional Photoshoot' },
      { points: 500, reward: 'Studio Session Credit ($500)' }
    ]
  }
};

// Onboarding API endpoints
app.post('/api/onboarding/start', async (req, res) => {
  const { userId, artistName, email } = req.body;
  
  console.log(`🎯 Starting onboarding for ${artistName}`);
  
  // Initialize onboarding state
  const onboardingState = {
    userId,
    artistName,
    email,
    currentStep: 'welcome',
    completedSteps: [],
    points: 0,
    startTime: new Date(),
    referralCode: generateReferralCode(artistName)
  };
  
  // Send welcome email
  await sendOnboardingEmail('signup', email, { artistName });
  
  // Track onboarding start
  trackEvent('onboarding_started', { userId, artistName });
  
  res.json({
    success: true,
    onboardingState,
    nextStep: ONBOARDING_FLOW.steps[0],
    message: 'Welcome to Not a Label! Let\'s build your music empire together.'
  });
});

app.post('/api/onboarding/complete-step', async (req, res) => {
  const { userId, stepId, stepData } = req.body;
  
  console.log(`✅ ${userId} completed step: ${stepId}`);
  
  // Award points for completion
  const achievement = ONBOARDING_FLOW.gamification.achievements.find(a => a.id === stepId);
  const pointsEarned = achievement ? achievement.points : 10;
  
  // Update onboarding progress
  const updatedState = await updateOnboardingProgress(userId, stepId, pointsEarned);
  
  // Check for rewards
  const unlockedRewards = checkForRewards(updatedState.totalPoints);
  
  // Get next step
  const currentIndex = ONBOARDING_FLOW.steps.findIndex(s => s.id === stepId);
  const nextStep = ONBOARDING_FLOW.steps[currentIndex + 1];
  
  // Send completion email if applicable
  if (stepId === 'profile_complete' || stepId === 'first_upload') {
    await sendOnboardingEmail(stepId, updatedState.email, { artistName: updatedState.artistName });
  }
  
  res.json({
    success: true,
    pointsEarned,
    totalPoints: updatedState.totalPoints,
    unlockedRewards,
    nextStep: nextStep || null,
    progress: ((currentIndex + 1) / ONBOARDING_FLOW.steps.length * 100).toFixed(0) + '%'
  });
});

app.get('/api/onboarding/status/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const status = await getOnboardingStatus(userId);
  
  res.json({
    success: true,
    ...status,
    tips: generateContextualTips(status.currentStep)
  });
});

// Helper functions
function generateReferralCode(artistName) {
  const cleaned = artistName.replace(/\s+/g, '').toLowerCase();
  const random = Math.random().toString(36).substring(7);
  return `${cleaned}-${random}`.substring(0, 20);
}

async function sendOnboardingEmail(trigger, email, data) {
  const emailConfig = ONBOARDING_FLOW.email_sequence.find(e => e.trigger === trigger);
  if (!emailConfig) return;
  
  console.log(`📧 Sending email: ${emailConfig.subject} to ${email}`);
  
  // In production, this would integrate with email service
  // For now, we'll simulate the email send
  return {
    sent: true,
    subject: emailConfig.subject,
    template: emailConfig.template
  };
}

function trackEvent(eventName, data) {
  console.log(`📊 Tracking: ${eventName}`, data);
  // Would send to analytics system
}

async function updateOnboardingProgress(userId, stepId, pointsEarned) {
  // In production, this would update database
  return {
    userId,
    completedSteps: ['welcome', 'profile_setup', stepId],
    totalPoints: 35 + pointsEarned,
    email: 'artist@example.com',
    artistName: 'Test Artist'
  };
}

function checkForRewards(totalPoints) {
  return ONBOARDING_FLOW.gamification.rewards
    .filter(r => totalPoints >= r.points)
    .map(r => r.reward);
}

async function getOnboardingStatus(userId) {
  // In production, fetch from database
  return {
    userId,
    currentStep: 'music_upload',
    completedSteps: ['welcome', 'profile_setup'],
    totalPoints: 35,
    startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
    completionTime: null,
    isComplete: false
  };
}

function generateContextualTips(currentStep) {
  const tips = {
    welcome: [
      'You\'re joining as a founding artist - special perks await!',
      'Take a moment to explore what makes Not a Label different'
    ],
    profile_setup: [
      'A complete profile gets 3x more fan engagement',
      'Use high-quality photos - first impressions matter!'
    ],
    music_upload: [
      'Start with your best track - quality over quantity',
      'Price between $0.99-$2.99 for optimal sales'
    ],
    payment_setup: [
      'You keep 100% of your revenue - no platform fees!',
      'Payouts happen instantly after each sale'
    ],
    growth_tools: [
      'Your referral code can earn you $50 per artist',
      'Engaged fans buy 5x more music'
    ],
    first_promotion: [
      'Share your music link everywhere - we track all sales',
      'Personal messages convert 10x better than posts'
    ]
  };
  
  return tips[currentStep] || ['Keep going - you\'re doing great!'];
}

// Interactive onboarding UI generator
app.get('/api/onboarding/ui-config', (req, res) => {
  res.json({
    theme: {
      primaryColor: '#667eea',
      successColor: '#48bb78',
      fontFamily: 'Inter, sans-serif'
    },
    
    components: {
      progressBar: {
        style: 'stepped',
        showPercentage: true,
        animated: true
      },
      
      welcomeVideo: {
        url: 'https://not-a-label.art/videos/founder-welcome.mp4',
        thumbnail: 'https://not-a-label.art/images/video-thumb.jpg',
        duration: '2:30'
      },
      
      tooltips: {
        enabled: true,
        delay: 3000,
        position: 'bottom'
      }
    },
    
    copy: {
      headlines: {
        welcome: 'Welcome to the Revolution! 🎸',
        profile: 'Let\'s Make You Discoverable',
        upload: 'Time to Share Your Art',
        payment: 'Set Up Your Money Machine',
        growth: 'Activate Your Fanbase',
        launch: 'Go Live in 3... 2... 1...'
      },
      
      ctas: {
        primary: 'Continue',
        skip: 'I\'ll do this later',
        help: 'Need help?'
      }
    }
  });
});

// Export for use in main app
module.exports = {
  onboardingRouter: app,
  ONBOARDING_FLOW
};

// Standalone execution for testing
if (require.main === module) {
  console.log('🎯 Artist Onboarding Flow Configuration');
  console.log('======================================');
  console.log(`Total steps: ${ONBOARDING_FLOW.steps.length}`);
  console.log(`Estimated time: ${ONBOARDING_FLOW.steps.reduce((sum, s) => sum + parseInt(s.duration), 0)} minutes`);
  console.log(`Email touchpoints: ${ONBOARDING_FLOW.email_sequence.length}`);
  console.log(`Gamification points available: ${ONBOARDING_FLOW.gamification.achievements.reduce((sum, a) => sum + a.points, 0)}`);
  console.log('\n✅ Onboarding flow ready for implementation!');
}