'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Track {
  id: string;
  title: string;
  duration: string;
  file: File | null;
  isrc?: string;
  writers: string[];
  producers: string[];
  featuring?: string;
  explicit: boolean;
  lyrics?: string;
  uploadProgress: number;
}

interface ReleaseMetadata {
  genre: string;
  subgenre?: string;
  language: string;
  copyright: string;
  recordLabel: string;
  upc?: string;
  catalogNumber?: string;
}

export default function MusicDistributionUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<'tracks' | 'metadata' | 'artwork' | 'review'>('tracks');
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: '1',
      title: '',
      duration: '0:00',
      file: null,
      writers: [''],
      producers: [''],
      explicit: false,
      uploadProgress: 0
    }
  ]);
  const [metadata, setMetadata] = useState<ReleaseMetadata>({
    genre: '',
    language: 'English',
    copyright: `© ${new Date().getFullYear()} `,
    recordLabel: ''
  });
  const [artwork, setArtwork] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string>('');

  const genres = [
    'Alternative', 'Blues', 'Classical', 'Country', 'Electronic',
    'Folk', 'Hip-Hop/Rap', 'Jazz', 'Latin', 'Metal', 'Pop',
    'R&B/Soul', 'Rock', 'World', 'Other'
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian',
    'Portuguese', 'Japanese', 'Korean', 'Chinese', 'Other'
  ];

  const handleFileSelect = (trackId: string, file: File) => {
    // Simulate file processing and duration extraction
    const duration = `${Math.floor(Math.random() * 4) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { ...track, file, duration, uploadProgress: 0 }
        : track
    ));

    // Simulate upload progress
    const interval = setInterval(() => {
      setTracks(prev => prev.map(track => {
        if (track.id === trackId && track.uploadProgress < 100) {
          const newProgress = Math.min(track.uploadProgress + 10, 100);
          if (newProgress === 100) clearInterval(interval);
          return { ...track, uploadProgress: newProgress };
        }
        return track;
      }));
    }, 200);
  };

  const handleArtworkSelect = (file: File) => {
    setArtwork(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setArtworkPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      title: '',
      duration: '0:00',
      file: null,
      writers: [''],
      producers: [''],
      explicit: false,
      uploadProgress: 0
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (trackId: string) => {
    setTracks(tracks.filter(track => track.id !== trackId));
  };

  const updateTrack = (trackId: string, updates: Partial<Track>) => {
    setTracks(tracks.map(track => 
      track.id === trackId ? { ...track, ...updates } : track
    ));
  };

  const addCredit = (trackId: string, type: 'writers' | 'producers') => {
    setTracks(tracks.map(track => 
      track.id === trackId 
        ? { ...track, [type]: [...track[type], ''] }
        : track
    ));
  };

  const updateCredit = (trackId: string, type: 'writers' | 'producers', index: number, value: string) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        const credits = [...track[type]];
        credits[index] = value;
        return { ...track, [type]: credits };
      }
      return track;
    }));
  };

  const removeCredit = (trackId: string, type: 'writers' | 'producers', index: number) => {
    setTracks(tracks.map(track => {
      if (track.id === trackId) {
        const credits = track[type].filter((_, i) => i !== index);
        return { ...track, [type]: credits };
      }
      return track;
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'tracks':
        return tracks.every(track => 
          track.title && track.file && track.uploadProgress === 100 &&
          track.writers.every(w => w.trim()) && track.producers.every(p => p.trim())
        );
      case 'metadata':
        return metadata.genre && metadata.recordLabel && metadata.copyright;
      case 'artwork':
        return artwork !== null;
      default:
        return true;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {(['tracks', 'metadata', 'artwork', 'review'] as const).map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step ? 'bg-purple-600 text-white' :
                  ['tracks', 'metadata', 'artwork'].slice(0, ['tracks', 'metadata', 'artwork', 'review'].indexOf(currentStep)).includes(step) 
                    ? 'bg-purple-200 text-purple-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm mt-2 capitalize">{step}</span>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-4 ${
                  ['tracks', 'metadata', 'artwork'].slice(0, ['tracks', 'metadata', 'artwork', 'review'].indexOf(currentStep)).includes(step)
                    ? 'bg-purple-200' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'tracks' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6">Upload Tracks</h2>
          
          <div className="space-y-6">
            {tracks.map((track, trackIndex) => (
              <div key={track.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">Track {trackIndex + 1}</h3>
                  {tracks.length > 1 && (
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File
                  </label>
                  {track.file ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎵</span>
                          <div>
                            <p className="font-medium">{track.file.name}</p>
                            <p className="text-sm text-gray-500">Duration: {track.duration}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => updateTrack(track.id, { file: null, uploadProgress: 0 })}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      {track.uploadProgress < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${track.uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                    >
                      <span className="text-3xl mb-2 block">📁</span>
                      <p className="text-gray-600">Click to upload audio file</p>
                      <p className="text-sm text-gray-500 mt-1">WAV, FLAC, or MP3 (320kbps)</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(track.id, file);
                    }}
                  />
                </div>

                {/* Track Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Track Title *
                    </label>
                    <input
                      type="text"
                      value={track.title}
                      onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter track title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featuring Artists
                    </label>
                    <input
                      type="text"
                      value={track.featuring || ''}
                      onChange={(e) => updateTrack(track.id, { featuring: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Artist Name, Another Artist"
                    />
                  </div>
                </div>

                {/* Credits */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Writers/Composers *
                    </label>
                    {track.writers.map((writer, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={writer}
                          onChange={(e) => updateCredit(track.id, 'writers', index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Writer name"
                        />
                        {track.writers.length > 1 && (
                          <button
                            onClick={() => removeCredit(track.id, 'writers', index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addCredit(track.id, 'writers')}
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      + Add writer
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Producers *
                    </label>
                    {track.producers.map((producer, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={producer}
                          onChange={(e) => updateCredit(track.id, 'producers', index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Producer name"
                        />
                        {track.producers.length > 1 && (
                          <button
                            onClick={() => removeCredit(track.id, 'producers', index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addCredit(track.id, 'producers')}
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      + Add producer
                    </button>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={track.explicit}
                      onChange={(e) => updateTrack(track.id, { explicit: e.target.checked })}
                      className="rounded text-purple-600"
                    />
                    <span className="text-sm">Explicit content</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ISRC (Optional)
                    </label>
                    <input
                      type="text"
                      value={track.isrc || ''}
                      onChange={(e) => updateTrack(track.id, { isrc: e.target.value })}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="e.g., USRC17607839"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addTrack}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              + Add Another Track
            </button>
          </div>
        </div>
      )}

      {currentStep === 'metadata' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6">Release Metadata</h2>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Genre *
                </label>
                <select
                  value={metadata.genre}
                  onChange={(e) => setMetadata({ ...metadata, genre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select genre</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-genre
                </label>
                <input
                  type="text"
                  value={metadata.subgenre || ''}
                  onChange={(e) => setMetadata({ ...metadata, subgenre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Indie Pop, Trap, etc."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language *
                </label>
                <select
                  value={metadata.language}
                  onChange={(e) => setMetadata({ ...metadata, language: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {languages.map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Label *
                </label>
                <input
                  type="text"
                  value={metadata.recordLabel}
                  onChange={(e) => setMetadata({ ...metadata, recordLabel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your label or artist name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copyright *
              </label>
              <input
                type="text"
                value={metadata.copyright}
                onChange={(e) => setMetadata({ ...metadata, copyright: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="© 2024 Your Name"
              />
              <p className="text-xs text-gray-500 mt-1">
                The (P) line - typically includes the year and copyright owner
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPC/EAN
                </label>
                <input
                  type="text"
                  value={metadata.upc || ''}
                  onChange={(e) => setMetadata({ ...metadata, upc: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Leave blank to auto-generate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catalog Number
                </label>
                <input
                  type="text"
                  value={metadata.catalogNumber || ''}
                  onChange={(e) => setMetadata({ ...metadata, catalogNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'artwork' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6">Release Artwork</h2>
          
          <div className="max-w-md mx-auto">
            {artworkPreview ? (
              <div className="mb-6">
                <img
                  src={artworkPreview}
                  alt="Release artwork"
                  className="w-full rounded-lg shadow-lg"
                />
                <button
                  onClick={() => {
                    setArtwork(null);
                    setArtworkPreview('');
                  }}
                  className="mt-4 text-red-600 hover:text-red-700 text-sm"
                >
                  Remove artwork
                </button>
              </div>
            ) : (
              <div
                onClick={() => artworkInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors flex flex-col items-center justify-center"
              >
                <span className="text-6xl mb-4 block">🖼️</span>
                <p className="text-gray-600 font-medium">Click to upload artwork</p>
                <p className="text-sm text-gray-500 mt-2">
                  Minimum 3000x3000px, JPG or PNG
                </p>
              </div>
            )}
            <input
              ref={artworkInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleArtworkSelect(file);
              }}
            />

            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Artwork Requirements</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Square format (1:1 aspect ratio)</li>
                <li>• Minimum 3000x3000 pixels</li>
                <li>• Maximum file size: 10MB</li>
                <li>• No pixelated or blurry images</li>
                <li>• No promotional text or URLs</li>
                <li>• Must own rights to the image</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'review' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6">Review & Submit</h2>
          
          <div className="space-y-6">
            {/* Release Summary */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Release Summary</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4">
                  {artworkPreview && (
                    <img src={artworkPreview} alt="Artwork" className="w-20 h-20 rounded-lg" />
                  )}
                  <div>
                    <p className="font-medium">Release Title</p>
                    <p className="text-gray-600">{tracks.length} tracks</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Genre:</span>
                    <span className="ml-2 font-medium">{metadata.genre}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Label:</span>
                    <span className="ml-2 font-medium">{metadata.recordLabel}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Language:</span>
                    <span className="ml-2 font-medium">{metadata.language}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Track List */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Track List</h3>
              <div className="space-y-2">
                {tracks.map((track, index) => (
                  <div key={track.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{index + 1}.</span>
                      <div>
                        <p className="font-medium">
                          {track.title}
                          {track.featuring && <span className="text-gray-600"> (feat. {track.featuring})</span>}
                        </p>
                        <p className="text-sm text-gray-500">
                          {track.writers.filter(w => w).join(', ')} • {track.duration}
                        </p>
                      </div>
                    </div>
                    {track.explicit && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">E</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution Platforms */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Distribution Platforms</h3>
              <div className="flex flex-wrap gap-3">
                {['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music'].map(platform => (
                  <span key={platform} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded text-purple-600" />
                <span className="text-sm text-gray-700">
                  I confirm that I own all rights to this music and have permission from all 
                  contributors. I agree to the distribution terms and conditions.
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => {
            const steps: Array<typeof currentStep> = ['tracks', 'metadata', 'artwork', 'review'];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex > 0) {
              setCurrentStep(steps[currentIndex - 1]);
            }
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={currentStep === 'tracks'}
        >
          Previous
        </button>
        
        {currentStep === 'review' ? (
          <button className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Submit for Distribution
          </button>
        ) : (
          <button
            onClick={() => {
              const steps: Array<typeof currentStep> = ['tracks', 'metadata', 'artwork', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex < steps.length - 1) {
                setCurrentStep(steps[currentIndex + 1]);
              }
            }}
            disabled={!canProceed()}
            className={`px-8 py-2 rounded-lg transition-colors ${
              canProceed()
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}