'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  action: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'Your command center for everything music-related',
    icon: '📊',
    features: [
      'Track streaming analytics across all platforms',
      'Monitor follower growth and engagement',
      'See your revenue and earnings breakdown',
      'Get AI-powered insights and recommendations'
    ],
    action: 'Explore Dashboard'
  },
  {
    id: 'ai-assistant',
    title: 'AI Career Assistant',
    description: 'Get personalized advice to grow your music career',
    icon: '🤖',
    features: [
      'Career guidance based on your goals',
      'Content strategy recommendations',
      'Marketing tips for your genre and audience',
      'Industry insights and trends'
    ],
    action: 'Try AI Assistant'
  },
  {
    id: 'music-library',
    title: 'Music Library',
    description: 'Manage and showcase your tracks',
    icon: '🎵',
    features: [
      'Upload and organize your music',
      'Share tracks with custom players',
      'Track individual song performance',
      'Create playlists and releases'
    ],
    action: 'Visit Music Library'
  },
  {
    id: 'collaboration',
    title: 'Collaboration Hub',
    description: 'Connect and work with other artists',
    icon: '🤝',
    features: [
      'Find artists in your genre or area',
      'Create and join collaboration projects',
      'Share private tracks for feedback',
      'Network with industry professionals'
    ],
    action: 'Find Collaborators'
  },
  {
    id: 'marketing',
    title: 'Marketing Tools',
    description: 'Promote your music effectively',
    icon: '📢',
    features: [
      'Schedule social media posts',
      'Create promotional campaigns',
      'Design custom graphics and videos',
      'Track campaign performance'
    ],
    action: 'Start Marketing'
  }
];

export default function OnboardingTourPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleStepComplete = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFinishTour = async () => {
    // Mark onboarding as complete
    const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    onboardingData.tourCompleted = true;
    onboardingData.completedAt = new Date().toISOString();
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    
    // Clear the "just registered" flag
    localStorage.removeItem('justRegistered');
    
    // Go to completion page
    router.push('/onboarding/complete');
  };

  const handleSkip = () => {
    router.push('/onboarding/complete');
  };

  const currentTourStep = TOUR_STEPS[currentStep];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discover your new tools
        </h1>
        <p className="text-gray-600">
          Let's explore the features that will help you grow your music career
        </p>
        
        {/* Progress indicator */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            {TOUR_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index < currentStep
                    ? 'bg-green-500'
                    : index === currentStep
                    ? 'bg-purple-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </p>
      </div>

      {/* Current Step Content */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full text-4xl mb-4">
            {currentTourStep.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentTourStep.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {currentTourStep.description}
          </p>
        </div>

        {/* Features List */}
        <div className="bg-purple-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-purple-900 mb-4">What you can do:</h3>
          <ul className="space-y-3">
            {currentTourStep.features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-purple-800">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive Demo Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8">
          <div className="text-6xl mb-4">{currentTourStep.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Interactive Preview
          </h3>
          <p className="text-gray-600 mb-4">
            This is where you'd see a preview of the {currentTourStep.title.toLowerCase()} in action
          </p>
          <button
            onClick={() => handleStepComplete(currentTourStep.id)}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            {currentTourStep.action}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip tour
            </button>

            {currentStep === TOUR_STEPS.length - 1 ? (
              <button
                onClick={handleFinishTour}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Finish Tour
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step Overview */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Your Journey Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOUR_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                index < currentStep
                  ? 'border-green-200 bg-green-50'
                  : index === currentStep
                  ? 'border-purple-200 bg-purple-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{step.icon}</div>
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  {step.title}
                </h4>
                {index < currentStep && (
                  <div className="text-green-600 text-xs font-medium">
                    ✓ Completed
                  </div>
                )}
                {index === currentStep && (
                  <div className="text-purple-600 text-xs font-medium">
                    Current
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}