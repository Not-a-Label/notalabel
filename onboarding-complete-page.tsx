'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingData {
  profile?: any;
  goals?: any;
  platforms?: any;
  firstTrack?: any;
  tourCompleted?: boolean;
  completedAt?: string;
}

interface PersonalizedRecommendation {
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Load onboarding data
    const data = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    setOnboardingData(data);
    
    // Generate personalized recommendations
    generateRecommendations(data);
    
    // Hide confetti after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const generateRecommendations = (data: OnboardingData) => {
    const recs: PersonalizedRecommendation[] = [];
    
    // Based on career stage
    if (data.goals?.careerStage === 'hobbyist') {
      recs.push({
        title: 'Share your first track',
        description: 'Get comfortable sharing your music with a small audience first',
        action: 'Upload a track',
        priority: 'high',
        icon: '🎵'
      });
    } else if (data.goals?.careerStage === 'emerging') {
      recs.push({
        title: 'Grow your social media presence',
        description: 'Focus on consistent posting and engaging with your audience',
        action: 'Create content calendar',
        priority: 'high',
        icon: '📱'
      });
    }
    
    // Based on goals
    if (data.goals?.primaryGoals?.includes('grow-audience')) {
      recs.push({
        title: 'Connect with your audience',
        description: 'Use our AI assistant to create engaging social media content',
        action: 'Get content ideas',
        priority: 'high',
        icon: '🤖'
      });
    }
    
    if (data.goals?.primaryGoals?.includes('collaborate')) {
      recs.push({
        title: 'Find collaboration partners',
        description: 'Connect with artists in your genre for potential collaborations',
        action: 'Browse artists',
        priority: 'medium',
        icon: '🤝'
      });
    }
    
    // Based on platforms
    const connectedPlatforms = data.platforms?.connections?.filter(p => p.connected)?.length || 0;
    if (connectedPlatforms === 0) {
      recs.push({
        title: 'Connect your music platforms',
        description: 'Link Spotify, YouTube, or SoundCloud to see unified analytics',
        action: 'Connect platforms',
        priority: 'medium',
        icon: '🔗'
      });
    }
    
    // Based on whether they uploaded music
    if (!data.firstTrack) {
      recs.push({
        title: 'Upload your music',
        description: 'Share your tracks and start building your audience',
        action: 'Upload tracks',
        priority: 'high',
        icon: '⬆️'
      });
    }
    
    // Generic recommendations
    recs.push({
      title: 'Set up your profile',
      description: 'Complete your artist profile to help fans discover you',
      action: 'Edit profile',
      priority: 'medium',
      icon: '👤'
    });
    
    setRecommendations(recs.slice(0, 4)); // Show top 4 recommendations
  };

  const getCompletionStats = () => {
    const stats = {
      profileCompleted: !!onboardingData.profile?.artistName,
      goalsSet: !!onboardingData.goals?.careerStage,
      platformsConnected: onboardingData.platforms?.connections?.filter(p => p.connected)?.length || 0,
      musicUploaded: !!onboardingData.firstTrack,
      tourCompleted: !!onboardingData.tourCompleted
    };
    
    const completed = Object.values(stats).filter(Boolean).length + (stats.platformsConnected > 0 ? 1 : 0) - 1;
    const total = 5;
    
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const stats = getCompletionStats();

  const handleGetStarted = () => {
    // Clear any remaining onboarding flags
    localStorage.removeItem('justRegistered');
    localStorage.removeItem('userDisplayName');
    
    // Navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-bounce absolute top-4 left-4 text-2xl">🎉</div>
          <div className="animate-bounce absolute top-6 right-8 text-2xl" style={{ animationDelay: '0.5s' }}>🎊</div>
          <div className="animate-bounce absolute top-12 left-1/3 text-2xl" style={{ animationDelay: '1s' }}>🎈</div>
          <div className="animate-bounce absolute top-8 right-1/3 text-2xl" style={{ animationDelay: '1.5s' }}>✨</div>
          <div className="animate-bounce absolute top-16 left-2/3 text-2xl" style={{ animationDelay: '2s' }}>🌟</div>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to Not a Label!
        </h1>
        <p className="text-xl text-gray-600">
          You're all set to start your independent music journey
        </p>
      </div>

      {/* Completion Stats */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-8">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Onboarding Progress</h2>
          <div className="text-4xl font-bold text-purple-600 mt-2">
            {stats.percentage}%
          </div>
          <p className="text-gray-600">Complete</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className={`p-3 rounded-lg ${stats.profileCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">
              {stats.profileCompleted ? '✅' : '⏳'}
            </div>
            <div className="text-sm font-medium">Profile</div>
          </div>
          
          <div className={`p-3 rounded-lg ${stats.goalsSet ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">
              {stats.goalsSet ? '✅' : '⏳'}
            </div>
            <div className="text-sm font-medium">Goals</div>
          </div>
          
          <div className={`p-3 rounded-lg ${stats.platformsConnected > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">
              {stats.platformsConnected > 0 ? '✅' : '⏳'}
            </div>
            <div className="text-sm font-medium">
              Platforms ({stats.platformsConnected})
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${stats.musicUploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">
              {stats.musicUploaded ? '✅' : '⏳'}
            </div>
            <div className="text-sm font-medium">Music</div>
          </div>
          
          <div className={`p-3 rounded-lg ${stats.tourCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
            <div className="text-2xl mb-1">
              {stats.tourCompleted ? '✅' : '⏳'}
            </div>
            <div className="text-sm font-medium">Tour</div>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Your Next Steps
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Based on your goals and profile, here's what we recommend doing first:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                rec.priority === 'high'
                  ? 'border-red-200 bg-red-50'
                  : rec.priority === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{rec.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <button className={`text-sm px-3 py-1 rounded-md font-medium ${
                    rec.priority === 'high'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors`}>
                    {rec.action}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">What happens next?</h3>
        <div className="space-y-2 text-purple-800">
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span>Your dashboard will show real-time analytics as you grow</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🤖</span>
            <span>Our AI assistant will provide personalized career advice</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🎵</span>
            <span>Upload more music and track performance</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🤝</span>
            <span>Connect with other artists for collaborations</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📈</span>
            <span>Watch your audience and revenue grow over time</span>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center">
        <button
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Enter Your Dashboard 🎯
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Ready to take control of your music career? Let's go! 🚀
        </p>
      </div>

      {/* Summary Stats */}
      {onboardingData.profile && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Welcome, <strong>{onboardingData.profile.artistName}</strong>! 
            {onboardingData.profile.genre && ` We're excited to help you grow in ${onboardingData.profile.genre}.`}
          </p>
          {onboardingData.completedAt && (
            <p className="mt-1">
              Onboarding completed on {new Date(onboardingData.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}