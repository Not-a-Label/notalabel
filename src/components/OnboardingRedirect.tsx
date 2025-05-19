'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth';
import { isNewUser } from '@/utils/onboarding';

/**
 * Component that checks if a user should be redirected to onboarding
 * This should be included in the app's main layout to check on every page load
 */
export default function OnboardingRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't do anything while loading or if no user is logged in
    if (loading || !user) {
      return;
    }

    // If this is a new user, redirect to onboarding
    if (isNewUser()) {
      // Don't redirect if already on the onboarding path
      const isOnOnboardingPath = window.location.pathname.startsWith('/onboarding');
      if (!isOnOnboardingPath) {
        router.push('/onboarding');
      }
    }
  }, [user, loading, router]);

  // This component doesn't render anything
  return null;
} 