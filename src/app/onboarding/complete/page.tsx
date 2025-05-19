'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearOnboardingData } from '@/utils/onboarding';
import { useAuth } from '@/utils/auth';
import { trackEvent, EventCategory, EventName } from '@/utils/analytics';

// Mock analytics service until real implementation
const trackEvent = (eventName: string, category: string, data: any) => {
  console.log(`[Analytics] Event: ${eventName}, Category: ${category}`, data);
};

// Mock enums for analytics
enum EventName {
  BUTTON_CLICK = 'button_click',
  ONBOARDING_COMPLETE = 'onboarding_complete'
}

enum EventCategory {
  USER = 'user'
}

// Mock Icon component until we can properly install Heroicons
const CheckCircleIcon = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={1.5} 
    className={props.className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const { user } = useAuth();

  // Handle completion of onboarding
  useEffect(() => {
    const completeOnboarding = async () => {
      if (isCompleting || !user) return;
      
      setIsCompleting(true);
      
      try {
        // In a real implementation, we would make an API call to update the user's profile
        // with the onboarding data and mark them as having completed onboarding
        
        // For now, we just clear the local onboarding data
        clearOnboardingData();
        
        // Track the event
        trackEvent(EventName.ONBOARDING_COMPLETE, EventCategory.USER, {
          userId: user.id,
          role: user.role
        });
        
        // Slight delay to show the success message
        setTimeout(() => {
          // Redirect to the appropriate dashboard
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error completing onboarding:', error);
        // If there's an error, don't clear the onboarding data
        // so the user can try again
        setIsCompleting(false);
      }
    };
    
    completeOnboarding();
  }, [user, router, isCompleting]);

  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8 text-center">
      <h2 className="text-2xl font-bold text-sky-400 mb-6">You're all set!</h2>
      
      <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <p className="text-lg text-slate-300 mb-6">
        Your account setup is complete! You're ready to start using Not a Label.
      </p>
      
      <p className="text-slate-400 mb-8">
        You'll be redirected to your dashboard in a moment...
      </p>
      
      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
        <div className="bg-sky-500 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
} 