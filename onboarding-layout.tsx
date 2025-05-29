'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/utils/auth';

interface OnboardingStep {
  path: string;
  title: string;
  description: string;
  order: number;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    path: '/onboarding',
    title: 'Welcome',
    description: 'Get started with Not a Label',
    order: 1
  },
  {
    path: '/onboarding/profile',
    title: 'Profile',
    description: 'Tell us about yourself',
    order: 2
  },
  {
    path: '/onboarding/goals',
    title: 'Goals',
    description: 'What do you want to achieve?',
    order: 3
  },
  {
    path: '/onboarding/platforms',
    title: 'Platforms',
    description: 'Connect your music platforms',
    order: 4
  },
  {
    path: '/onboarding/upload',
    title: 'Music',
    description: 'Upload your first track',
    order: 5
  },
  {
    path: '/onboarding/tour',
    title: 'Tour',
    description: 'Explore your dashboard',
    order: 6
  },
  {
    path: '/onboarding/complete',
    title: 'Complete',
    description: 'You\'re all set!',
    order: 7
  }
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const currentStep = ONBOARDING_STEPS.find(step => step.path === pathname);
  const currentStepIndex = currentStep ? currentStep.order - 1 : 0;
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  useEffect(() => {
    // Check if user just registered
    const justRegistered = localStorage.getItem('justRegistered');
    if (!justRegistered && !user) {
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  const handleSkip = () => {
    // Allow skipping to dashboard
    localStorage.removeItem('justRegistered');
    router.push('/dashboard');
  };

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      router.push(ONBOARDING_STEPS[currentStepIndex + 1].path);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      router.push(ONBOARDING_STEPS[currentStepIndex - 1].path);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {ONBOARDING_STEPS.map((step, index) => (
              <div
                key={step.path}
                className={`flex items-center ${
                  index < ONBOARDING_STEPS.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      index < currentStepIndex ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Current step info */}
          <div className="text-center mt-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentStep?.title}
            </h2>
            <p className="text-sm text-gray-600">{currentStep?.description}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentStepIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex === ONBOARDING_STEPS.length - 1}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                currentStepIndex === ONBOARDING_STEPS.length - 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-white bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}