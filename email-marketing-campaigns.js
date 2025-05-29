// Email Marketing Campaigns for Not a Label Launch
const campaigns = {
  // Pre-Launch Email Sequence
  preLaunch: {
    welcomeSeries: [
      {
        id: 'welcome-1',
        name: 'Welcome to the Revolution',
        subject: '🎵 Welcome to Not a Label - Your Music Journey Starts Here',
        sendAfter: 0, // Immediate
        template: `
          <h1>Welcome to Not a Label, {{firstName}}!</h1>
          
          <p>You're officially part of the movement that's changing how independent musicians build their careers.</p>
          
          <h2>Here's what's coming:</h2>
          <ul>
            <li>🤖 AI-powered music production tools</li>
            <li>📊 Advanced analytics dashboard</li>
            <li>🤝 Collaboration network</li>
            <li>💰 Multiple revenue streams</li>
          </ul>
          
          <p>Over the next few days, we'll show you exactly how Not a Label will transform your music career.</p>
          
          <a href="{{ctaLink}}" class="cta-button">Join Our Community</a>
        `
      },
      {
        id: 'welcome-2',
        name: 'Meet the AI Music Producer',
        subject: '🎛️ Your Personal AI Music Producer is Waiting',
        sendAfter: 2, // Days
        template: `
          <h1>Meet Your New Production Partner</h1>
          
          <p>Hi {{firstName}},</p>
          
          <p>What if you could have a world-class producer available 24/7?</p>
          
          <p>Our AI Music Production Suite includes:</p>
          <ul>
            <li>✨ Professional mixing & mastering</li>
            <li>🎹 Chord progression generator</li>
            <li>🎤 Vocal enhancement tools</li>
            <li>📝 AI songwriting assistant</li>
          </ul>
          
          <p>No more expensive studio time. No more waiting for the "right" producer.</p>
          
          <a href="{{demoLink}}" class="cta-button">Watch AI in Action</a>
        `
      },
      {
        id: 'welcome-3',
        name: 'Success Stories',
        subject: '📈 How Sarah Grew Her Fanbase 10x in 6 Months',
        sendAfter: 4, // Days
        template: `
          <h1>Real Artists. Real Results.</h1>
          
          <p>{{firstName}}, meet Sarah Chen.</p>
          
          <p>6 months ago, she was struggling to get 100 streams per month.</p>
          
          <p>Today? She's averaging 50,000+ monthly listeners.</p>
          
          <h2>Her secret?</h2>
          <ul>
            <li>📊 Data-driven release strategy</li>
            <li>🎯 Targeted fan engagement</li>
            <li>💡 AI-optimized production</li>
            <li>🤝 Strategic collaborations</li>
          </ul>
          
          <blockquote>"Not a Label gave me the tools and insights I needed to go from bedroom artist to full-time musician."</blockquote>
          
          <a href="{{caseStudyLink}}" class="cta-button">Read Sarah's Full Story</a>
        `
      },
      {
        id: 'welcome-4',
        name: 'Early Bird Offer',
        subject: '🎁 Exclusive Offer: 50% Off for Early Adopters',
        sendAfter: 6, // Days
        template: `
          <h1>Special Offer for {{firstName}}</h1>
          
          <p>As one of our early supporters, you get:</p>
          
          <div class="offer-box">
            <h2>50% OFF All Plans</h2>
            <p>For Life!</p>
          </div>
          
          <h3>Choose Your Plan:</h3>
          <ul>
            <li>🎵 <strong>Solo Artist</strong>: $9.99/mo (normally $19.99)</li>
            <li>🚀 <strong>Pro Musician</strong>: $24.99/mo (normally $49.99)</li>
            <li>⭐ <strong>Label Killer</strong>: $49.99/mo (normally $99.99)</li>
          </ul>
          
          <p>This offer expires when we launch. Lock in your rate now!</p>
          
          <a href="{{earlyBirdLink}}" class="cta-button">Claim Your Discount</a>
        `
      }
    ],

    // Countdown Emails
    countdownSeries: [
      {
        id: 'countdown-7',
        name: '7 Days to Launch',
        subject: '⏰ 7 Days Until Everything Changes',
        daysBeforeLaunch: 7,
        template: `
          <h1>The Countdown Begins!</h1>
          
          <p>{{firstName}}, in just 7 days, Not a Label goes live.</p>
          
          <p>Here's what happens on launch day:</p>
          <ul>
            <li>🚀 Platform goes live</li>
            <li>🎁 Early bird pricing ends</li>
            <li>🏆 Launch day competitions begin</li>
            <li>💫 First 1000 users get bonus features</li>
          </ul>
          
          <a href="{{reminderLink}}" class="cta-button">Set a Reminder</a>
        `
      },
      {
        id: 'countdown-3',
        name: '3 Days to Launch',
        subject: '🔥 3 Days Left - Don't Miss Out!',
        daysBeforeLaunch: 3,
        template: `
          <h1>Just 72 Hours to Go!</h1>
          
          <p>{{firstName}}, the music industry is about to change forever.</p>
          
          <p>Quick reminder of what you'll get access to:</p>
          <ul>
            <li>🎛️ Complete AI production suite</li>
            <li>📊 Professional analytics dashboard</li>
            <li>🌍 Global distribution network</li>
            <li>💰 Multiple monetization tools</li>
            <li>🤝 Collaboration marketplace</li>
          </ul>
          
          <p><strong>Remember:</strong> Early bird pricing ends at launch!</p>
          
          <a href="{{finalOfferLink}}" class="cta-button">Secure Your Spot</a>
        `
      },
      {
        id: 'countdown-24h',
        name: '24 Hours to Launch',
        subject: '🚨 24 HOURS: Final Call for Early Access',
        daysBeforeLaunch: 1,
        template: `
          <h1>This Is It, {{firstName}}!</h1>
          
          <div class="countdown-banner">
            <h2>24 HOURS LEFT</h2>
          </div>
          
          <p>Tomorrow at this time, Not a Label will be live.</p>
          
          <p>Don't miss your chance to:</p>
          <ul>
            <li>✅ Lock in 50% off for life</li>
            <li>✅ Be among the first 1000 users</li>
            <li>✅ Get exclusive launch bonuses</li>
            <li>✅ Start growing your music career immediately</li>
          </ul>
          
          <a href="{{lastChanceLink}}" class="cta-button">Get Early Access Now</a>
        `
      }
    ]
  },

  // Launch Day Campaign
  launchDay: {
    id: 'launch-announcement',
    name: 'We're Live!',
    subject: '🎉 Not a Label is LIVE - Your Access is Ready!',
    template: `
      <h1>🎉 WE'RE LIVE!</h1>
      
      <p>{{firstName}}, the wait is over!</p>
      
      <p>Not a Label is officially open for business, and your account is ready.</p>
      
      <div class="launch-banner">
        <h2>Welcome to the Future of Music</h2>
        <a href="{{loginLink}}" class="cta-button">Access Your Account</a>
      </div>
      
      <h3>🎁 Launch Day Bonuses:</h3>
      <ul>
        <li>1 month of Pro features FREE</li>
        <li>1000 AI credits</li>
        <li>Priority support</li>
        <li>Exclusive "Founder" badge</li>
      </ul>
      
      <p>Let's make music history together!</p>
    `
  },

  // Post-Launch Onboarding
  postLaunch: {
    onboardingSeries: [
      {
        id: 'onboard-1',
        name: 'Getting Started Guide',
        subject: '🚀 Your First Steps with Not a Label',
        sendAfter: 1, // Day after signup
        template: `
          <h1>Let's Get You Set Up, {{firstName}}!</h1>
          
          <p>Welcome to Not a Label! Here's your quick-start guide:</p>
          
          <ol>
            <li>📝 Complete your artist profile</li>
            <li>🎵 Upload your first track</li>
            <li>🤖 Try the AI mixing tool</li>
            <li>📊 Check your analytics dashboard</li>
            <li>🤝 Connect with other artists</li>
          </ol>
          
          <a href="{{tutorialLink}}" class="cta-button">Start Tutorial</a>
        `
      },
      {
        id: 'onboard-2',
        name: 'AI Tools Tutorial',
        subject: '🤖 Master the AI Music Production Suite',
        sendAfter: 3, // Days after signup
        template: `
          <h1>Time to Make Some Magic!</h1>
          
          <p>{{firstName}}, ready to explore your AI production tools?</p>
          
          <p>We've prepared exclusive tutorials for you:</p>
          <ul>
            <li>🎛️ Professional mixing in 5 minutes</li>
            <li>🎹 Generate hit chord progressions</li>
            <li>🎤 Perfect your vocals instantly</li>
            <li>📝 Co-write with AI</li>
          </ul>
          
          <a href="{{aiTutorialLink}}" class="cta-button">Watch Tutorials</a>
        `
      }
    ]
  },

  // Engagement Campaigns
  engagement: {
    weeklyTips: {
      id: 'weekly-tips',
      name: 'Weekly Music Success Tips',
      subject: '💡 This Week's Music Success Tip',
      frequency: 'weekly',
      templates: [
        'Release strategies that work',
        'Maximizing your streaming revenue',
        'Building authentic fan connections',
        'Collaboration best practices'
      ]
    },
    
    featureAnnouncements: {
      id: 'feature-updates',
      name: 'New Feature Announcements',
      subject: '🆕 New Feature Alert: {{featureName}}',
      trigger: 'new_feature_release'
    },

    milestonesCelebration: {
      id: 'milestone-celebration',
      name: 'Milestone Achievements',
      triggers: {
        first_upload: 'Congrats on your first upload!',
        hundredth_stream: 'You just hit 100 streams!',
        first_collab: 'Your first collaboration is live!',
        thousand_fans: 'You reached 1,000 fans!'
      }
    }
  },

  // Retention Campaigns
  retention: {
    inactiveUsers: {
      id: 'win-back',
      name: 'We Miss You Campaign',
      subject: '🎵 {{firstName}}, your music is waiting',
      triggerAfterDays: 14,
      template: `
        <h1>We Miss You, {{firstName}}!</h1>
        
        <p>It's been a while since we've seen you on Not a Label.</p>
        
        <p>While you were away, we added:</p>
        <ul>
          <li>🆕 New AI vocal tuning features</li>
          <li>🎯 Enhanced audience targeting</li>
          <li>💰 Improved monetization tools</li>
        </ul>
        
        <p>Plus, we have a special offer to welcome you back:</p>
        <div class="offer-box">
          <h2>30% Off Next Month</h2>
          <p>Use code: COMEBACK30</p>
        </div>
        
        <a href="{{comebackLink}}" class="cta-button">Continue Your Journey</a>
      `
    }
  }
};

// Email Template Styles
const emailStyles = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h1 {
      color: #7c3aed;
      font-size: 28px;
      margin-bottom: 20px;
    }
    
    h2 {
      color: #6b21a8;
      font-size: 22px;
      margin-top: 30px;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
      color: white;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 50px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    
    .offer-box {
      background: #f3f4f6;
      border: 2px solid #7c3aed;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    
    .countdown-banner {
      background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 20px 0;
    }
    
    blockquote {
      border-left: 4px solid #7c3aed;
      padding-left: 20px;
      margin: 20px 0;
      font-style: italic;
      color: #666;
    }
    
    .launch-banner {
      background: url('/email-banner.jpg') center/cover;
      padding: 60px 20px;
      text-align: center;
      border-radius: 12px;
      margin: 20px 0;
    }
  </style>
`;

module.exports = { campaigns, emailStyles };