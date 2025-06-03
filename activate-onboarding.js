// Add to auth controller after successful registration
// Path: /var/www/not-a-label-backend/controllers/authController.js

const ArtistOnboardingService = require('../services/artist-onboarding-service');
const onboardingService = new ArtistOnboardingService();

// Add this to the register function after user creation:
async function afterRegistration(user, registrationCode) {
  try {
    // Process artist onboarding
    if (user.role === 'artist') {
      await onboardingService.processNewArtist(user._id, registrationCode);
    }
    
    // Track general signup
    await Analytics.create({
      event: 'user_signup',
      userId: user._id,
      properties: {
        role: user.role,
        source: req.body.source || 'organic',
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Post-registration error:', error);
    // Don't fail registration if onboarding fails
  }
}

// Example integration in register endpoint:
/*
exports.register = async (req, res) => {
  try {
    const { email, password, username, role, registrationCode } = req.body;
    
    // ... existing registration logic ...
    
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      role: role || 'artist'
    });
    
    // Add this line:
    await afterRegistration(user, registrationCode);
    
    // ... rest of the function ...
  } catch (error) {
    // ... error handling ...
  }
};
*/