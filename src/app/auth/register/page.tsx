'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth';
import { trackEvent, EventCategory, EventName } from '@/utils/analytics';
import { isNewUser } from '@/utils/onboarding';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('fan');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, error: authError, user } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // For new users, direct them to the onboarding flow
      if (isNewUser()) {
        router.push('/onboarding');
      } else if (user.role === 'artist') {
        router.push('/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // Track signup attempt
      trackEvent(EventName.SIGNUP, EventCategory.USER, { 
        role, 
        status: 'attempt' 
      });
      
      // Register the user - our auth system will mark them as new
      await register(email, password, role);
      
      // Track successful signup
      trackEvent(EventName.SIGNUP, EventCategory.USER, { 
        role, 
        status: 'success' 
      });
      
      // Registration successful, login happens automatically
      // Redirection to onboarding happens in the useEffect above
    } catch (err) {
      // Track failed signup
      trackEvent(EventName.SIGNUP, EventCategory.USER, { 
        role, 
        status: 'error' 
      });
      
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  // Use local error or auth error
  const displayError = localError || authError;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <main className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-sky-400">Create your Not a Label Account</h1>
          <p className="mt-2 text-slate-400">
            Join our community of independent artists and fans.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleRegister}>
          {displayError && <p className="text-red-500 text-sm text-center">{displayError}</p>}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="•••••••• (min. 6 characters)"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-300">
              I am a...
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              disabled={isLoading}
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            >
              <option value="fan">Fan</option>
              <option value="artist">Artist</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{
            ' '
          }
          <Link href="/auth/login" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
            Login here
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          <Link href="/" className="hover:text-sky-400 transition-colors">
            &larr; Back to Home
          </Link>
        </p>
      </main>
    </div>
  );
} 