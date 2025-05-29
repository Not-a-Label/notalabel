'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfileData {
  artistName: string;
  realName: string;
  bio: string;
  genre: string;
  location: string;
  website: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  profileImage: File | null;
}

const GENRES = [
  'Hip Hop', 'Pop', 'Rock', 'Electronic', 'R&B', 'Country', 'Jazz', 'Classical',
  'Folk', 'Reggae', 'Blues', 'Indie', 'Alternative', 'Punk', 'Metal', 'Soul',
  'Funk', 'Latin', 'World', 'Experimental', 'Other'
];

export default function OnboardingProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    artistName: '',
    realName: '',
    bio: '',
    genre: '',
    location: '',
    website: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    profileImage: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: 'Image must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: 'Please select an image file' }));
        return;
      }

      setProfileData(prev => ({ ...prev, profileImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any existing error
      setErrors(prev => ({ ...prev, profileImage: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!profileData.artistName.trim()) {
      newErrors.artistName = 'Artist name is required';
    }
    
    if (!profileData.genre) {
      newErrors.genre = 'Please select your primary genre';
    }
    
    if (profileData.bio.length < 50) {
      newErrors.bio = 'Bio should be at least 50 characters to help fans discover you';
    }
    
    if (profileData.website && !profileData.website.startsWith('http')) {
      newErrors.website = 'Website URL should start with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Save profile data to localStorage for now (in production, this would go to the backend)
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.profile = profileData;
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Move to next step
      router.push('/onboarding/goals');
    } catch (error) {
      console.error('Profile save error:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/goals');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tell us about yourself
        </h1>
        <p className="text-gray-600">
          Help fans and other artists discover who you are and what you create
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <p className="text-sm text-gray-500">Upload a profile photo (optional)</p>
          {errors.profileImage && (
            <p className="text-sm text-red-600">{errors.profileImage}</p>
          )}
        </div>

        {/* Artist Name */}
        <div>
          <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-1">
            Artist/Band Name *
          </label>
          <input
            type="text"
            id="artistName"
            name="artistName"
            value={profileData.artistName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
              errors.artistName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="How should fans know you?"
          />
          {errors.artistName && (
            <p className="mt-1 text-sm text-red-600">{errors.artistName}</p>
          )}
        </div>

        {/* Real Name */}
        <div>
          <label htmlFor="realName" className="block text-sm font-medium text-gray-700 mb-1">
            Real Name (optional)
          </label>
          <input
            type="text"
            id="realName"
            name="realName"
            value={profileData.realName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="Your legal name (kept private)"
          />
        </div>

        {/* Genre */}
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
            Primary Genre *
          </label>
          <select
            id="genre"
            name="genre"
            value={profileData.genre}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
              errors.genre ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select your primary genre</option>
            {GENRES.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          {errors.genre && (
            <p className="mt-1 text-sm text-red-600">{errors.genre}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={profileData.location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="City, State/Country"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio *
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={profileData.bio}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
              errors.bio ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Tell fans about your music, influences, story, and what makes you unique..."
          />
          <div className="flex justify-between mt-1">
            {errors.bio ? (
              <p className="text-sm text-red-600">{errors.bio}</p>
            ) : (
              <p className="text-sm text-gray-500">
                {profileData.bio.length}/500 characters (minimum 50)
              </p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links (optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={profileData.website}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                  errors.website ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">@</span>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={profileData.instagram}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                Twitter/X
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">@</span>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  value={profileData.twitter}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                TikTok
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400">@</span>
                <input
                  type="text"
                  id="tiktok"
                  name="tiktok"
                  value={profileData.tiktok}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}