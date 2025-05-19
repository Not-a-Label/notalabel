'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/auth';
import { getOnboardingData, saveOnboardingData, clearOnboardingData } from '@/utils/onboarding';

// Mock analytics service until real implementation
const trackEvent = (eventName: string, category: string, data: any) => {
  console.log(`[Analytics] Event: ${eventName}, Category: ${category}`, data);
};

// Mock enums for analytics
enum EventName {
  PROFILE_UPDATE = 'profile_update',
  BUTTON_CLICK = 'button_click'
}

enum EventCategory {
  USER = 'user'
}

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [profileData, setProfileData] = useState({
    artistName: '',
    bio: '',
    location: '',
    genre: '',
  });

  // Load any existing onboarding data
  useEffect(() => {
    const savedData = getOnboardingData();
    if (Object.keys(savedData).length > 0) {
      setProfileData(prev => ({ ...prev, ...savedData }));
    }
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => {
      const updated = { ...prev, [name]: value };
      // Save to session storage so data persists between steps
      saveOnboardingData(updated);
      return updated;
    });
  };

  // Handle profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would send this data to the backend
      console.log('Saving profile data:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track event
      trackEvent(EventName.PROFILE_UPDATE, EventCategory.USER, {
        status: 'success',
        is_onboarding: true
      });
      
      // Redirect to the next step
      router.push('/onboarding/complete');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save profile. Please try again.');
      
      // Track error
      trackEvent(EventName.PROFILE_UPDATE, EventCategory.USER, {
        status: 'error',
        is_onboarding: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Skip this step
  const handleSkip = () => {
    trackEvent(EventName.BUTTON_CLICK, EventCategory.USER, {
      action: 'skip_profile_onboarding'
    });
    router.push('/onboarding/complete');
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-sky-400 mb-2">Complete Your Artist Profile</h1>
        <p className="text-slate-300">
          Let's make your profile stand out. Tell potential fans and collaborators about yourself and your music.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="artistName" className="block text-sm font-medium text-slate-300 mb-1">
              Artist Name *
            </label>
            <input
              id="artistName"
              name="artistName"
              type="text"
              value={profileData.artistName}
              onChange={handleChange}
              placeholder="Your artist or band name"
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="Tell fans about yourself and your music"
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-1">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={profileData.location}
              onChange={handleChange}
              placeholder="City, Country"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-1">
              Primary Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={profileData.genre}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Select a genre</option>
              <option value="rock">Rock</option>
              <option value="pop">Pop</option>
              <option value="hiphop">Hip Hop</option>
              <option value="rnb">R&B</option>
              <option value="electronic">Electronic</option>
              <option value="dance">Dance</option>
              <option value="jazz">Jazz</option>
              <option value="folk">Folk</option>
              <option value="classical">Classical</option>
              <option value="country">Country</option>
              <option value="alternative">Alternative</option>
              <option value="metal">Metal</option>
              <option value="indie">Indie</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
          >
            Skip for Now
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-sm bg-sky-600 text-white font-medium rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
} 