'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/utils/auth';
import { isNewUser } from '@/utils/onboarding';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Check if user has already completed onboarding
  useEffect(() => {
    if (!loading && user && !isNewUser()) {
      // User is authenticated but not marked as new, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex justify-center mb-8 pt-8">
            <Image
              src="/not-a-label-logo.png"
              alt="Not a Label Logo"
              width={100}
              height={100}
              priority
            />
          </div>
          <div className="max-w-xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 