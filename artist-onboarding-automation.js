// Artist Onboarding Automation System
// Deploy to: /var/www/not-a-label-backend/services/

const EmailService = require('./email-service');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

class ArtistOnboardingService {
  constructor() {
    this.emailService = new EmailService();
    this.foundingArtistCodes = ['FOUNDER2025', 'BETA2025'];
  }

  async processNewArtist(userId, registrationCode) {
    try {
      const user = await User.findById(userId);
      if (!user || user.role !== 'artist') return;

      // Check if founding artist
      const isFoundingArtist = this.foundingArtistCodes.includes(registrationCode);
      
      if (isFoundingArtist) {
        await this.upgradeToFoundingArtist(user);
      }

      // Send welcome email
      await this.sendWelcomeEmail(user, isFoundingArtist);

      // Create onboarding checklist
      await this.createOnboardingChecklist(user);

      // Track signup analytics
      await this.trackSignup(user, isFoundingArtist);

      // Schedule follow-up emails
      await this.scheduleFollowUps(user);

      return { success: true, isFoundingArtist };
    } catch (error) {
      console.error('Onboarding error:', error);
      return { success: false, error: error.message };
    }
  }

  async upgradeToFoundingArtist(user) {
    user.accountType = 'founding_artist';
    user.subscription = {
      plan: 'pro',
      status: 'active',
      expiresAt: null, // Lifetime access
      features: ['all_pro_features', 'founding_artist_badge', 'priority_support']
    };
    await user.save();
  }

  async sendWelcomeEmail(user, isFoundingArtist) {
    const subject = isFoundingArtist 
      ? '🎉 Welcome to Not a Label, Founding Artist!'
      : 'Welcome to Not a Label!';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <img src="https://not-a-label.art/logo-nal.png" alt="Not a Label" style="width: 80px; margin-bottom: 20px;">
        
        <h1 style="color: #8B5CF6;">Welcome to Not a Label, ${user.username}!</h1>
        
        ${isFoundingArtist ? `
          <div style="background: linear-gradient(to right, #8B5CF6, #EC4899); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="margin: 0;">🌟 You're a Founding Artist!</h2>
            <p>You have lifetime Pro access and will help shape the future of independent music.</p>
          </div>
        ` : ''}
        
        <h2>Getting Started Checklist:</h2>
        <ul style="line-height: 2;">
          <li>✅ Complete your artist profile</li>
          <li>📸 Upload a profile photo</li>
          <li>🎵 Upload your first track</li>
          <li>📊 Connect your streaming platforms</li>
          <li>🤖 Try the AI career assistant</li>
        </ul>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3>Quick Links:</h3>
          <p>
            <a href="https://not-a-label.art/dashboard/profile/edit" style="color: #8B5CF6;">Complete Profile</a> |
            <a href="https://not-a-label.art/dashboard/music" style="color: #8B5CF6;">Upload Music</a> |
            <a href="https://not-a-label.art/dashboard/ai" style="color: #8B5CF6;">AI Assistant</a>
          </p>
        </div>
        
        ${isFoundingArtist ? `
          <div style="border: 2px solid #8B5CF6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Founding Artist Benefits:</h3>
            <ul>
              <li>Lifetime Pro account (worth $348/year)</li>
              <li>Direct line to the founder: jason@not-a-label.art</li>
              <li>Monthly video calls with other founding artists</li>
              <li>Your input shapes our roadmap</li>
              <li>Early access to all new features</li>
            </ul>
          </div>
        ` : ''}
        
        <p>Need help? Just reply to this email or visit our <a href="https://not-a-label.art/learn" style="color: #8B5CF6;">Learning Center</a>.</p>
        
        <p style="color: #6B7280; font-size: 14px;">
          Let's revolutionize the music industry together.<br>
          - Jason Ino, Founder
        </p>
      </div>
    `;

    await this.emailService.sendEmail({
      to: user.email,
      subject,
      html,
      from: 'hello@not-a-label.art'
    });
  }

  async createOnboardingChecklist(user) {
    const checklist = {
      userId: user._id,
      steps: [
        { id: 'profile_photo', name: 'Upload profile photo', completed: false },
        { id: 'bio', name: 'Write artist bio', completed: false },
        { id: 'first_track', name: 'Upload first track', completed: false },
        { id: 'connect_spotify', name: 'Connect Spotify', completed: false },
        { id: 'ai_chat', name: 'Have first AI conversation', completed: false },
        { id: 'share_profile', name: 'Share your profile', completed: false }
      ],
      createdAt: new Date()
    };

    // Store in user metadata
    user.onboarding = checklist;
    await user.save();
  }

  async trackSignup(user, isFoundingArtist) {
    await Analytics.create({
      event: 'artist_signup',
      userId: user._id,
      properties: {
        isFoundingArtist,
        source: user.metadata?.signupSource || 'direct',
        timestamp: new Date()
      }
    });
  }

  async scheduleFollowUps(user) {
    // Day 3: Check-in email
    setTimeout(async () => {
      await this.sendCheckInEmail(user);
    }, 3 * 24 * 60 * 60 * 1000);

    // Day 7: Tips email
    setTimeout(async () => {
      await this.sendTipsEmail(user);
    }, 7 * 24 * 60 * 60 * 1000);

    // Day 14: Success stories
    setTimeout(async () => {
      await this.sendSuccessStoriesEmail(user);
    }, 14 * 24 * 60 * 60 * 1000);
  }

  async sendCheckInEmail(user) {
    const progress = await this.getOnboardingProgress(user);
    
    const subject = progress < 50 
      ? 'Need help getting started?' 
      : 'You\'re doing great!';

    const html = `
      <h1>Hey ${user.username}! 👋</h1>
      <p>Just checking in to see how you're doing with Not a Label.</p>
      
      ${progress < 50 ? `
        <p>I noticed you haven't uploaded any music yet. Here's a quick video showing how easy it is:</p>
        <a href="https://not-a-label.art/learn/upload-music" style="background: #8B5CF6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Watch Tutorial</a>
      ` : `
        <p>You're making great progress! Your profile is ${progress}% complete.</p>
      `}
      
      <p>Reply if you need any help!</p>
    `;

    await this.emailService.sendEmail({
      to: user.email,
      subject,
      html,
      from: 'jason@not-a-label.art'
    });
  }

  async getOnboardingProgress(user) {
    const checklist = user.onboarding?.steps || [];
    const completed = checklist.filter(step => step.completed).length;
    return Math.round((completed / checklist.length) * 100);
  }

  // Quick function to test with existing users
  async retroactivelyOnboardArtists() {
    const artists = await User.find({ role: 'artist', onboarding: { $exists: false } });
    
    for (const artist of artists) {
      await this.createOnboardingChecklist(artist);
      console.log(`Added onboarding for ${artist.username}`);
    }
    
    return `Processed ${artists.length} artists`;
  }
}

module.exports = ArtistOnboardingService;