// Beta Artist Invitation System for Not a Label
// Manages exclusive invitations for first 100 founding artists

const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

// Beta configuration
const BETA_CONFIG = {
  totalSlots: 100,
  slotsUsed: 0,
  invitationExpiry: 30, // days
  foundingArtistBenefits: [
    '50% off platform fees forever (when fees are introduced)',
    'Exclusive founding artist badge',
    'Priority customer support',
    'Early access to new features',
    'Input on platform development',
    '$100 marketing credit',
    'Professional photoshoot opportunity'
  ]
};

// In-memory storage (would use database in production)
const invitations = new Map();
const acceptedArtists = new Map();

// Generate unique invitation code
function generateInviteCode(artistName) {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `FOUNDER-${timestamp}-${random}`.toUpperCase();
}

// API Endpoints

// Create beta invitation
app.post('/api/beta/invite', async (req, res) => {
  const { artistName, email, invitedBy, personalMessage } = req.body;
  
  // Check available slots
  if (BETA_CONFIG.slotsUsed >= BETA_CONFIG.totalSlots) {
    return res.status(400).json({
      error: 'Beta program is full',
      waitlist: true
    });
  }
  
  // Generate invitation
  const inviteCode = generateInviteCode(artistName);
  const invitation = {
    code: inviteCode,
    artistName,
    email,
    invitedBy: invitedBy || 'Jason Ino',
    personalMessage: personalMessage || getDefaultMessage(artistName),
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + BETA_CONFIG.invitationExpiry * 24 * 60 * 60 * 1000),
    status: 'pending',
    benefits: BETA_CONFIG.foundingArtistBenefits
  };
  
  // Store invitation
  invitations.set(inviteCode, invitation);
  
  // Send invitation email (simulated)
  const emailContent = generateInvitationEmail(invitation);
  
  res.json({
    success: true,
    inviteCode,
    inviteUrl: `https://not-a-label.art/join/${inviteCode}`,
    slotsRemaining: BETA_CONFIG.totalSlots - BETA_CONFIG.slotsUsed - 1,
    emailPreview: emailContent
  });
});

// Validate invitation code
app.get('/api/beta/validate/:code', (req, res) => {
  const { code } = req.params;
  const invitation = invitations.get(code);
  
  if (!invitation) {
    return res.status(404).json({ 
      valid: false, 
      error: 'Invalid invitation code' 
    });
  }
  
  if (new Date() > invitation.expiresAt) {
    return res.status(400).json({ 
      valid: false, 
      error: 'Invitation has expired' 
    });
  }
  
  if (invitation.status === 'accepted') {
    return res.status(400).json({ 
      valid: false, 
      error: 'Invitation already used' 
    });
  }
  
  res.json({
    valid: true,
    invitation: {
      artistName: invitation.artistName,
      invitedBy: invitation.invitedBy,
      personalMessage: invitation.personalMessage,
      benefits: invitation.benefits,
      slotsRemaining: BETA_CONFIG.totalSlots - BETA_CONFIG.slotsUsed
    }
  });
});

// Accept invitation
app.post('/api/beta/accept', async (req, res) => {
  const { code, artistProfile } = req.body;
  const invitation = invitations.get(code);
  
  if (!invitation || invitation.status === 'accepted') {
    return res.status(400).json({ 
      error: 'Invalid or already used invitation' 
    });
  }
  
  // Mark invitation as accepted
  invitation.status = 'accepted';
  invitation.acceptedAt = new Date();
  BETA_CONFIG.slotsUsed++;
  
  // Create founding artist record
  const foundingArtist = {
    id: crypto.randomBytes(16).toString('hex'),
    ...artistProfile,
    inviteCode: code,
    invitedBy: invitation.invitedBy,
    joinedAt: new Date(),
    benefits: invitation.benefits,
    referralCode: generateReferralCode(artistProfile.artistName),
    earnings: {
      total: 0,
      pending: 0,
      paid: 0
    }
  };
  
  acceptedArtists.set(foundingArtist.id, foundingArtist);
  
  // Generate welcome package
  const welcomePackage = generateWelcomePackage(foundingArtist);
  
  res.json({
    success: true,
    artistId: foundingArtist.id,
    referralCode: foundingArtist.referralCode,
    welcomePackage,
    message: `Welcome to Not a Label, ${artistProfile.artistName}! You're founding artist #${BETA_CONFIG.slotsUsed}`
  });
});

// Get beta program status
app.get('/api/beta/status', (req, res) => {
  const recentArtists = Array.from(acceptedArtists.values())
    .sort((a, b) => b.joinedAt - a.joinedAt)
    .slice(0, 10)
    .map(artist => ({
      name: artist.artistName,
      joinedAt: artist.joinedAt,
      invitedBy: artist.invitedBy
    }));
  
  res.json({
    totalSlots: BETA_CONFIG.totalSlots,
    slotsUsed: BETA_CONFIG.slotsUsed,
    slotsAvailable: BETA_CONFIG.totalSlots - BETA_CONFIG.slotsUsed,
    percentFull: ((BETA_CONFIG.slotsUsed / BETA_CONFIG.totalSlots) * 100).toFixed(1),
    recentArtists,
    benefits: BETA_CONFIG.foundingArtistBenefits,
    urgencyMessage: getUrgencyMessage()
  });
});

// Batch invite system for outreach
app.post('/api/beta/batch-invite', async (req, res) => {
  const { artists, customMessage } = req.body;
  const results = [];
  
  for (const artist of artists) {
    if (BETA_CONFIG.slotsUsed >= BETA_CONFIG.totalSlots) {
      results.push({
        ...artist,
        status: 'failed',
        reason: 'Beta full'
      });
      continue;
    }
    
    const inviteCode = generateInviteCode(artist.name);
    const invitation = {
      code: inviteCode,
      artistName: artist.name,
      email: artist.email,
      invitedBy: 'Not a Label Team',
      personalMessage: customMessage || getDefaultMessage(artist.name),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + BETA_CONFIG.invitationExpiry * 24 * 60 * 60 * 1000),
      status: 'pending',
      benefits: BETA_CONFIG.foundingArtistBenefits
    };
    
    invitations.set(inviteCode, invitation);
    
    results.push({
      ...artist,
      status: 'invited',
      inviteCode,
      inviteUrl: `https://not-a-label.art/join/${inviteCode}`
    });
  }
  
  res.json({
    success: true,
    invited: results.filter(r => r.status === 'invited').length,
    failed: results.filter(r => r.status === 'failed').length,
    results
  });
});

// Helper functions

function generateReferralCode(artistName) {
  const clean = artistName.toLowerCase().replace(/\s+/g, '');
  const random = crypto.randomBytes(3).toString('hex');
  return `${clean}-${random}`.substring(0, 15);
}

function getDefaultMessage(artistName) {
  return `Hi ${artistName},

You've been personally selected to join Not a Label as one of our 100 founding artists.

As a founding artist, you'll keep 100% of your music revenue (no platform fees!) and help shape the future of independent music.

This exclusive invitation expires in 30 days and slots are filling fast.

Looking forward to having you on the platform!

- Jason Ino, Founder`;
}

function generateInvitationEmail(invitation) {
  return {
    subject: `${invitation.artistName}, you're invited to be a founding artist 🎵`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
    .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .invite-code { background: #e2e8f0; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center; margin: 20px 0; }
    .urgency { background: #fed7d7; color: #9b2c2c; padding: 15px; border-radius: 5px; text-align: center; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Invited to Join Not a Label!</h1>
      <p>Exclusive Founding Artist Invitation</p>
    </div>
    
    <div class="content">
      <p>Hi ${invitation.artistName},</p>
      
      <p>${invitation.personalMessage}</p>
      
      <div class="invite-code">
        Your Invitation Code: <strong>${invitation.code}</strong>
      </div>
      
      <div class="benefits">
        <h3>🎁 Your Founding Artist Benefits:</h3>
        <ul>
          ${invitation.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>
      </div>
      
      <center>
        <a href="https://not-a-label.art/join/${invitation.code}" class="cta-button">
          Accept Your Invitation →
        </a>
      </center>
      
      <div class="urgency">
        ⏰ Only ${BETA_CONFIG.totalSlots - BETA_CONFIG.slotsUsed} founding artist slots remaining!
      </div>
      
      <p>This invitation expires on ${invitation.expiresAt.toLocaleDateString()}.</p>
      
      <p>Questions? Reply to this email or join our Discord community.</p>
      
      <p>Can't wait to see what you create!</p>
      
      <p><strong>Jason Ino</strong><br>
      Founder, Not a Label</p>
    </div>
  </div>
</body>
</html>
    `,
    text: invitation.personalMessage + `\n\nAccept your invitation at: https://not-a-label.art/join/${invitation.code}`
  };
}

function generateWelcomePackage(artist) {
  return {
    welcomeVideo: 'https://not-a-label.art/welcome/founding-artist-video',
    quickStartGuide: 'https://not-a-label.art/guides/quick-start',
    communityAccess: {
      discord: 'https://discord.gg/not-a-label-founders',
      telegram: 'https://t.me/notalabel_founders'
    },
    marketingAssets: {
      badge: 'https://not-a-label.art/assets/founding-artist-badge.png',
      banners: [
        'https://not-a-label.art/assets/founding-artist-banner-1.jpg',
        'https://not-a-label.art/assets/founding-artist-banner-2.jpg'
      ],
      pressKit: 'https://not-a-label.art/press/founding-artist-kit.zip'
    },
    nextSteps: [
      'Complete your artist profile',
      'Upload your first track',
      'Share your referral code to earn $50 per artist',
      'Join the founders-only Discord channel'
    ]
  };
}

function getUrgencyMessage() {
  const slotsLeft = BETA_CONFIG.totalSlots - BETA_CONFIG.slotsUsed;
  
  if (slotsLeft <= 10) {
    return `🔥 FINAL ${slotsLeft} SPOTS! Beta closing soon!`;
  } else if (slotsLeft <= 25) {
    return `⚡ Only ${slotsLeft} founding artist spots left!`;
  } else if (slotsLeft <= 50) {
    return `🎯 ${slotsLeft} spots remaining - over 50% full!`;
  } else {
    return `🚀 Join ${BETA_CONFIG.slotsUsed} artists already on the platform!`;
  }
}

// Export for integration
module.exports = {
  betaRouter: app,
  BETA_CONFIG,
  generateInviteCode
};

// Test execution
if (require.main === module) {
  // Simulate some beta invitations
  console.log('🎯 Beta Artist Invitation System');
  console.log('================================');
  console.log(`Total slots: ${BETA_CONFIG.totalSlots}`);
  console.log(`Benefits: ${BETA_CONFIG.foundingArtistBenefits.length} exclusive perks`);
  console.log(`Invitation validity: ${BETA_CONFIG.invitationExpiry} days`);
  
  // Test invitation generation
  const testInvite = generateInviteCode('Test Artist');
  console.log(`\nSample invite code: ${testInvite}`);
  console.log(`Invite URL: https://not-a-label.art/join/${testInvite}`);
  
  console.log('\n✅ Beta invitation system ready!');
}