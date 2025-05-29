'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface TrackData {
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseDate: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  file: File | null;
  artwork: File | null;
}

const GENRES = [
  'Hip Hop', 'Pop', 'Rock', 'Electronic', 'R&B', 'Country', 'Jazz', 'Classical',
  'Folk', 'Reggae', 'Blues', 'Indie', 'Alternative', 'Punk', 'Metal', 'Soul',
  'Funk', 'Latin', 'World', 'Experimental', 'Other'
];

const SUGGESTED_TAGS = [
  'original', 'cover', 'remix', 'acoustic', 'instrumental', 'live', 'demo',
  'collaboration', 'single', 'debut', 'experimental', 'produced', 'written'
];

export default function OnboardingUploadPage() {
  const router = useRouter();
  const audioFileRef = useRef<HTMLInputElement>(null);
  const artworkFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trackData, setTrackData] = useState<TrackData>({
    title: '',
    artist: '',
    album: '',
    genre: '',
    releaseDate: '',
    description: '',
    tags: [],
    isPublic: true,
    file: null,
    artwork: null
  });
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setTrackData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        setErrors(prev => ({ ...prev, file: 'Please select an audio file' }));
        return;
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'Audio file must be less than 50MB' }));
        return;
      }

      setTrackData(prev => ({ ...prev, file }));
      
      // Create audio preview
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
      
      // Auto-fill title if empty
      if (!trackData.title) {
        const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setTrackData(prev => ({ ...prev, title: filename }));
      }
      
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, artwork: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, artwork: 'Artwork must be less than 10MB' }));
        return;
      }

      setTrackData(prev => ({ ...prev, artwork: file }));
      
      // Create artwork preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setArtworkPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setErrors(prev => ({ ...prev, artwork: '' }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setTrackData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!trackData.file) {
      newErrors.file = 'Please select an audio file to upload';
    }
    
    if (!trackData.title.trim()) {
      newErrors.title = 'Track title is required';
    }
    
    if (!trackData.artist.trim()) {
      newErrors.artist = 'Artist name is required';
    }
    
    if (!trackData.genre) {
      newErrors.genre = 'Please select a genre';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateUpload = (): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        setUploadProgress(progress);
      }, 200);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Simulate file upload with progress
      await simulateUpload();
      
      // Save track data to localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      onboardingData.firstTrack = {
        ...trackData,
        fileUrl: audioPreview,
        artworkUrl: artworkPreview,
        uploadedAt: new Date().toISOString()
      };
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      
      // Additional delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Move to next step
      router.push('/onboarding/tour');
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ submit: 'Upload failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/tour');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload your first track
        </h1>
        <p className="text-gray-600">
          Share your music with the world and start building your audience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Audio File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio File *
          </label>
          {!trackData.file ? (
            <div
              onClick={() => audioFileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-purple-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">MP3, WAV, FLAC, M4A (Max 50MB)</p>
              </div>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{trackData.file.name}</p>
                    <p className="text-sm text-gray-500">{(trackData.file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTrackData(prev => ({ ...prev, file: null }));
                    setAudioPreview(null);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              {audioPreview && (
                <div className="mt-4">
                  <audio controls className="w-full">
                    <source src={audioPreview} type={trackData.file.type} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}
          <input
            ref={audioFileRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
          />
          {errors.file && (
            <p className="mt-1 text-sm text-red-600">{errors.file}</p>
          )}
        </div>

        {/* Upload Progress */}
        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Track Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Track Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={trackData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="What's this track called?"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-1">
              Artist *
            </label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={trackData.artist}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                errors.artist ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Who performed this?"
            />
            {errors.artist && (
              <p className="mt-1 text-sm text-red-600">{errors.artist}</p>
            )}
          </div>

          <div>
            <label htmlFor="album" className="block text-sm font-medium text-gray-700 mb-1">
              Album/EP (optional)
            </label>
            <input
              type="text"
              id="album"
              name="album"
              value={trackData.album}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Part of an album or EP?"
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
              Genre *
            </label>
            <select
              id="genre"
              name="genre"
              value={trackData.genre}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                errors.genre ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select genre</option>
              {GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            {errors.genre && (
              <p className="mt-1 text-sm text-red-600">{errors.genre}</p>
            )}
          </div>
        </div>

        {/* Artwork Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Artwork (optional)
          </label>
          <div className="flex items-start space-x-4">
            <div
              onClick={() => artworkFileRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors"
            >
              {artworkPreview ? (
                <img
                  src={artworkPreview}
                  alt="Artwork preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Upload cover art for your track. Square images (1:1 ratio) work best.
              </p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 10MB)</p>
            </div>
          </div>
          <input
            ref={artworkFileRef}
            type="file"
            accept="image/*"
            onChange={handleArtworkUpload}
            className="hidden"
          />
          {errors.artwork && (
            <p className="mt-1 text-sm text-red-600">{errors.artwork}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={trackData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            placeholder="Tell listeners about this track, your inspiration, or anything special about it..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  trackData.tags.includes(tag)
                    ? 'bg-purple-100 border-purple-300 text-purple-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Setting */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={trackData.isPublic}
            onChange={handleInputChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            Make this track publicly visible on your profile
          </label>
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
            onClick={() => router.push('/onboarding/platforms')}
            className="text-gray-500 hover:text-gray-700"
          >
            Back
          </button>

          <div className="space-x-3">
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
              {loading ? 'Uploading...' : 'Upload Track'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}