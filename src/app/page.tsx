'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/utils/auth';
import { isNewUser } from '@/utils/onboarding';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Check if user is already logged in, if so redirect appropriately
  useEffect(() => {
    if (loading) return; // Wait for auth status to load
    
    if (user) {
      setRedirecting(true);
      
      // For new users, direct them to the onboarding flow
      if (isNewUser()) {
        router.push('/onboarding');
      }
      // For existing users, direct to appropriate dashboard
      else if (user.role === 'artist') {
        router.push('/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <header className="absolute top-0 right-0 p-6">
        <nav className="flex gap-4">
          <Link href="/auth/login" className="hover:text-sky-400 transition-colors">
            Login
          </Link>
        </nav>
      </header>

      <main className="text-center flex flex-col items-center">
        <div className="mb-8">
          <Image
            src="/not-a-label-logo.png"
            alt="Not a Label Logo"
            width={150}
            height={150}
            priority
          />
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6">
          Welcome to <span className="text-sky-400">Not a Label</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Empowering independent artists with the tools to manage their careers,
          understand their audience, and get AI-powered guidance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-sky-500/50"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-slate-600/50"
          >
            Learn More
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-0 p-6 text-slate-400 text-sm">
        © {new Date().getFullYear()} Not a Label. All rights reserved.
      </footer>
    </div>
  );
} 