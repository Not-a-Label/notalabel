'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRocket, FaMusic, FaChartLine, FaUsers, FaMagic,
  FaCheckCircle, FaArrowRight, FaPlay, FaHeadphones,
  FaUpload, FaMicrophone, FaBook, FaTrophy, FaGift,
  FaCalendar, FaComments, FaLightbulb, FaStar
} from 'react-icons/fa';
import confetti from 'canvas-confetti';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  action?: () => void;
  completed: boolean;
}

export default function BetaOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: '',
    artistName: '',
    primaryGoal: '',
    experience: ''
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to the Beta!',
      description: 'Get your exclusive beta perks and set up your account',
      icon: FaRocket,
      completed: false
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about your music and goals',
      icon: FaMusic,
      completed: false
    },
    {
      id: 'upload',
      title: 'Upload Your First Track',
      description: 'Experience AI-powered production',
      icon: FaUpload,
      completed: false
    },
    {
      id: 'explore',
      title: 'Explore Key Features',
      description: 'Discover what makes Not a Label special',
      icon: FaMagic,
      completed: false
    },
    {
      id: 'connect',
      title: 'Join the Community',
      description: 'Meet other beta artists',
      icon: FaUsers,
      completed: false
    }
  ];

  const goals = [
    { id: 'growth', label: 'Grow my fanbase', icon: FaChartLine },
    { id: 'quality', label: 'Improve production quality', icon: FaHeadphones },
    { id: 'revenue', label: 'Increase revenue', icon: FaTrophy },
    { id: 'collab', label: 'Find collaborators', icon: FaUsers }
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Just starting out' },
    { id: 'intermediate', label: '1-3 years experience' },
    { id: 'advanced', label: '3+ years experience' },
    { id: 'pro', label: 'Full-time musician' }
  ];

  useEffect(() => {
    // Check if user has completed onboarding before
    const onboardingComplete = localStorage.getItem('betaOnboardingComplete');
    if (onboardingComplete) {
      setShowWelcome(false);
    }
  }, []);

  const completeStep = (stepId: string) => {
    setCompletedSteps([...completedSteps, stepId]);
    
    // Celebration animation
    if (stepId === 'upload') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    
    // Move to next step
    if (currentStep < onboardingSteps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 500);
    } else {
      // Onboarding complete
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('betaOnboardingComplete', 'true');
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 }
    });
  };

  // Welcome Screen
  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50" />
            <div className="relative w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <FaRocket className="text-5xl text-white" />
            </div>
          </motion.div>

          <h1 className="text-5xl font-bold mb-6">
            Welcome to the Future, {userProfile.name || 'Beta Artist'}!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            You're one of 500 artists shaping the future of independent music. 
            Let's get you set up with your exclusive beta benefits.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: FaGift, label: 'Free Pro Forever' },
              { icon: FaStar, label: 'Founding Status' },
              { icon: FaHeadphones, label: 'Priority Support' },
              { icon: FaLightbulb, label: 'Shape Features' }
            ].map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-lg p-4"
              >
                <perk.icon className="text-3xl mx-auto mb-2 text-purple-400" />
                <p className="text-sm">{perk.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowWelcome(false)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg hover:shadow-lg transition-all"
          >
            Start Your Journey
            <FaArrowRight className="inline ml-2" />
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Main Onboarding Flow
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Beta Onboarding</h2>
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
              animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Journey</h3>
              <div className="space-y-3">
                {onboardingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = index === currentStep;
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        isCurrent ? 'bg-purple-50 border-2 border-purple-500' : ''
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? <FaCheckCircle /> : <Icon />}
                      </div>
                      <div>
                        <h4 className={`font-medium ${isCurrent ? 'text-purple-700' : ''}`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Beta Benefits Reminder */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <h4 className="font-medium mb-2">Your Beta Benefits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Lifetime Pro access ($600/year value)</li>
                  <li>✓ Direct line to founders</li>
                  <li>✓ Early access to new features</li>
                  <li>✓ 5% revenue bonus for 1 year</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step Details */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                {/* Step 1: Welcome */}
                {currentStep === 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Welcome to Your Beta Dashboard!</h2>
                    
                    <div className="mb-8">
                      <label className="block text-sm font-medium mb-2">What should we call you?</label>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Your name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-purple-50 rounded-lg p-6">
                        <FaCalendar className="text-3xl text-purple-600 mb-3" />
                        <h3 className="font-semibold mb-2">Schedule Your 1-on-1</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Get personal onboarding with our team
                        </p>
                        <button className="text-purple-600 font-medium hover:text-purple-700">
                          Book Now →
                        </button>
                      </div>
                      
                      <div className="bg-pink-50 rounded-lg p-6">
                        <FaComments className="text-3xl text-pink-600 mb-3" />
                        <h3 className="font-semibold mb-2">Join Beta Community</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Connect with other beta artists
                        </p>
                        <button className="text-pink-600 font-medium hover:text-pink-700">
                          Join Slack →
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => completeStep('welcome')}
                      disabled={!userProfile.name}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50"
                    >
                      Continue to Profile Setup
                    </button>
                  </div>
                )}

                {/* Step 2: Profile */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Tell Us About Your Music</h2>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Artist/Band Name</label>
                      <input
                        type="text"
                        value={userProfile.artistName}
                        onChange={(e) => setUserProfile({ ...userProfile, artistName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Your artist name"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-3">What's your primary goal?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {goals.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            onClick={() => setUserProfile({ ...userProfile, primaryGoal: id })}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              userProfile.primaryGoal === id
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="text-2xl mx-auto mb-2 text-purple-600" />
                            <p className="text-sm">{label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-8">
                      <label className="block text-sm font-medium mb-3">Experience Level</label>
                      <div className="space-y-2">
                        {experienceLevels.map(({ id, label }) => (
                          <label
                            key={id}
                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="experience"
                              value={id}
                              checked={userProfile.experience === id}
                              onChange={(e) => setUserProfile({ ...userProfile, experience: e.target.value })}
                              className="text-purple-600"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => completeStep('profile')}
                      disabled={!userProfile.artistName || !userProfile.primaryGoal || !userProfile.experience}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50"
                    >
                      Save Profile & Continue
                    </button>
                  </div>
                )}

                {/* Step 3: Upload */}
                {currentStep === 2 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">Upload Your First Track</h2>
                    <p className="text-gray-600 mb-8">
                      Experience the magic of AI-powered production. Upload any audio file and watch it transform.
                    </p>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 mb-6">
                      <FaUpload className="text-5xl text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Drop your track here</p>
                      <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                      <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Choose File
                      </button>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4 mb-6">
                      <p className="text-sm">
                        <strong>Beta Bonus:</strong> Your first 100 AI processings are FREE (usually $2.50 each)
                      </p>
                    </div>

                    <button
                      onClick={() => completeStep('upload')}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg"
                    >
                      Upload Later
                    </button>
                  </div>
                )}

                {/* Step 4: Explore */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Explore Key Features</h2>
                    <p className="text-gray-600 mb-8">
                      Take a quick tour of the features that will transform your music career.
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          title: 'AI Music Production',
                          description: 'Professional mixing and mastering in minutes',
                          icon: FaMagic,
                          color: 'purple'
                        },
                        {
                          title: 'Analytics Dashboard',
                          description: 'Understand your audience like never before',
                          icon: FaChartLine,
                          color: 'blue'
                        },
                        {
                          title: 'Direct Monetization',
                          description: 'Keep 100% of your earnings',
                          icon: FaTrophy,
                          color: 'green'
                        },
                        {
                          title: 'Collaboration Network',
                          description: 'Connect with artists worldwide',
                          icon: FaUsers,
                          color: 'pink'
                        }
                      ].map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md cursor-pointer"
                          >
                            <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center`}>
                              <Icon className={`text-2xl text-${feature.color}-600`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold">{feature.title}</h3>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                            <FaPlay className="text-gray-400" />
                          </motion.div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => completeStep('explore')}
                      className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg"
                    >
                      Start Exploring
                    </button>
                  </div>
                )}

                {/* Step 5: Connect */}
                {currentStep === 4 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">You're All Set! 🎉</h2>
                    <p className="text-gray-600 mb-8">
                      Welcome to the Not a Label beta family. Here's how to make the most of your experience:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {[
                        {
                          icon: FaComments,
                          title: 'Join Slack',
                          description: 'Connect with other beta artists'
                        },
                        {
                          icon: FaBook,
                          title: 'Read Guide',
                          description: 'Beta user handbook'
                        },
                        {
                          icon: FaLightbulb,
                          title: 'Share Ideas',
                          description: 'Your feedback shapes the platform'
                        }
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div key={index} className="bg-gray-50 rounded-lg p-6">
                            <Icon className="text-3xl text-purple-600 mx-auto mb-3" />
                            <h3 className="font-medium mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => completeStep('connect')}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg"
                    >
                      Complete Onboarding
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}