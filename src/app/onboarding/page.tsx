'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth';
import { 
  saveOnboardingStep, 
  getOnboardingStep, 
  saveOnboardingData, 
  getOnboardingData,
  clearOnboardingData
} from '@/utils/onboarding';
import { trackEvent, trackOnboardingStep, EventCategory, EventName } from '@/utils/analytics';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [formData, setFormData] = useState({
    artistName: '',
    genre: '',
  });

  // Initialize from saved state if available
  useEffect(() => {
    const savedStep = getOnboardingStep();
    if (savedStep > 1) {
      setStep(savedStep);
    } else {
      // Track starting onboarding if this is the first view
      trackEvent(EventName.ONBOARDING_START, EventCategory.ONBOARDING, {
        userId: user?.id
      });
    }

    const savedData = getOnboardingData();
    if (Object.keys(savedData).length > 0) {
      setFormData(prev => ({ ...prev, ...savedData }));
    }
  }, [user]);

  // Save step when it changes
  useEffect(() => {
    saveOnboardingStep(step);
    
    // Track onboarding step progress
    if (step > 1) {
      trackOnboardingStep(step, {
        userId: user?.id,
        totalSteps
      });
    }
  }, [step, user, totalSteps]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [id]: value };
      // Save to session storage so data persists between steps
      saveOnboardingData(updated);
      return updated;
    });
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step completed, proceed to completion page
      router.push('/onboarding/complete');
    }
  };

  const handleSkip = () => {
    // Track skipped onboarding
    trackEvent(EventName.ONBOARDING_COMPLETE, EventCategory.ONBOARDING, {
      userId: user?.id,
      skipped: true,
      step
    });
    
    // Skip onboarding and go directly to dashboard
    clearOnboardingData();
    router.push('/dashboard');
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-sky-400">Welcome to Not a Label</h1>
          <span className="text-sm text-slate-400">Step {step} of {totalSteps}</span>
        </div>
        <div className="w-full bg-slate-700 h-2 rounded-full">
          <div 
            className="bg-sky-400 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Let's set up your account</h2>
          <p className="text-slate-300">
            Thank you for joining Not a Label! We'll help you get started with a few quick steps
            to customize your experience.
          </p>
          <p className="text-slate-300">
            We'll guide you through setting up your profile, connecting your music, and exploring
            the platform.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Tell us about yourself</h2>
          <p className="text-slate-300">
            Let's personalize your experience. Tell us a bit about yourself and your music.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="artistName" className="block text-sm font-medium text-slate-300 mb-1">
                Artist Name
              </label>
              <input
                id="artistName"
                type="text"
                value={formData.artistName}
                onChange={handleInputChange}
                placeholder="Your artist name"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-1">
                Primary Genre
              </label>
              <select
                id="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Select a genre</option>
                <option value="rock">Rock</option>
                <option value="pop">Pop</option>
                <option value="hiphop">Hip Hop</option>
                <option value="electronic">Electronic</option>
                <option value="jazz">Jazz</option>
                <option value="folk">Folk</option>
                <option value="classical">Classical</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">You're all set!</h2>
          <p className="text-slate-300">
            Congratulations! Your account is now set up and ready to go.
          </p>
          <p className="text-slate-300">
            From your dashboard, you can:
          </p>
          <ul className="list-disc pl-5 text-slate-300 space-y-2">
            <li>Complete your artist profile</li>
            <li>Upload and manage your music</li>
            <li>Track your analytics</li>
            <li>Get AI-powered insights</li>
          </ul>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
        ) : (
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
          >
            Skip
          </button>
        )}
        
        <button
          onClick={handleNext}
          className="px-4 py-2 text-sm bg-sky-600 text-white font-medium rounded-md hover:bg-sky-700 transition-colors"
        >
          {step === totalSteps ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
} 