'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/utils/auth';

interface Sample {
  id: string;
  name: string;
  description: string;
  creator: Creator;
  category: 'drums' | 'melody' | 'bass' | 'vocals' | 'fx' | 'loops';
  subCategory: string;
  genre: string;
  bpm?: number;
  key?: string;
  duration: number;
  fileSize: number;
  format: 'wav' | 'aiff' | 'mp3';
  quality: '16bit' | '24bit' | '32bit';
  sampleRate: number;
  tags: string[];
  price: number;
  audioPreview: string;
  downloadUrl: string;
  waveform: string;
  license: SampleLicense;
  isPremium: boolean;
  isExclusive: boolean;
  downloads: number;
  likes: number;
  isLiked: boolean;
  isPurchased: boolean;
  uploadDate: string;
  aiGenerated?: boolean;
  stemParts?: StemPart[];
}

interface Creator {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  followers: number;
  totalDownloads: number;
  specialties: string[];
}

interface SampleLicense {
  type: 'royalty-free' | 'exclusive' | 'creative-commons' | 'commercial';
  commercial: boolean;
  attribution: boolean;
  derivative: boolean;
  resale: boolean;
  terms: string;
}

interface StemPart {
  name: string;
  url: string;
  duration: number;
}

interface SamplePack {
  id: string;
  name: string;
  description: string;
  creator: Creator;
  artwork: string;
  samples: Sample[];
  totalSamples: number;
  totalDuration: number;
  price: number;
  discountedPrice?: number;
  genre: string;
  tags: string[];
  downloads: number;
  rating: number;
  reviews: number;
  isPurchased: boolean;
  releaseDate: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  samples: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SampleLibrary() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'samples' | 'packs' | 'collections' | 'upload' | 'analytics'>('samples');
  const [samples, setSamples] = useState<Sample[]>([]);
  const [samplePacks, setSamplePacks] = useState<SamplePack[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    genre: '',
    bpm: { min: 60, max: 200 },
    duration: { min: 0, max: 300 },
    quality: '',
    license: '',
    price: 'all',
    sortBy: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchSamples();
    fetchSamplePacks();
    fetchCollections();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const updateTime = () => setPlayTime(audio.currentTime);
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setPlayTime(0);
      });
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', () => {});
      };
    }
  }, [currentSample]);

  const fetchSamples = async () => {
    try {
      const response = await fetch('/api/marketplace/samples', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSamples(data.samples || []);
    } catch (error) {
      console.error('Error fetching samples:', error);
    }
  };

  const fetchSamplePacks = async () => {
    try {
      const response = await fetch('/api/marketplace/sample-packs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSamplePacks(data.packs || []);
    } catch (error) {
      console.error('Error fetching sample packs:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/marketplace/collections', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const playSample = (sample: Sample) => {
    if (currentSample?.id === sample.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentSample(sample);
      if (audioRef.current) {
        audioRef.current.src = sample.audioPreview;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadSample = async (sampleId: string) => {
    try {
      const response = await fetch(`/api/marketplace/samples/${sampleId}/download`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentSample?.name || 'sample'}.${currentSample?.format || 'wav'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading sample:', error);
    }
  };

  const likeSample = async (sampleId: string) => {
    try {
      await fetch(`/api/marketplace/samples/${sampleId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchSamples();
    } catch (error) {
      console.error('Error liking sample:', error);
    }
  };

  const toggleSampleSelection = (sampleId: string) => {
    setSelectedSamples(prev =>
      prev.includes(sampleId)
        ? prev.filter(id => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const createCollection = async (collectionData: any) => {
    try {
      const response = await fetch('/api/marketplace/collections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...collectionData,
          samples: selectedSamples
        })
      });

      if (response.ok) {
        setShowCreateCollectionModal(false);
        setSelectedSamples([]);
        fetchCollections();
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const uploadSample = async (sampleData: any) => {
    try {
      const formData = new FormData();
      Object.keys(sampleData).forEach(key => {
        if (sampleData[key] instanceof File) {
          formData.append(key, sampleData[key]);
        } else if (typeof sampleData[key] === 'object') {
          formData.append(key, JSON.stringify(sampleData[key]));
        } else {
          formData.append(key, sampleData[key]);
        }
      });

      const response = await fetch('/api/marketplace/samples', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        setShowUploadModal(false);
        fetchSamples();
      }
    } catch (error) {
      console.error('Error uploading sample:', error);
    }
  };

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = !searchQuery || 
      sample.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !filters.category || sample.category === filters.category;
    const matchesGenre = !filters.genre || sample.genre === filters.genre;
    const matchesBpm = !sample.bpm || (sample.bpm >= filters.bpm.min && sample.bpm <= filters.bpm.max);
    const matchesDuration = sample.duration >= filters.duration.min && sample.duration <= filters.duration.max;
    const matchesQuality = !filters.quality || sample.quality === filters.quality;
    const matchesLicense = !filters.license || sample.license.type === filters.license;
    const matchesPrice = filters.price === 'all' || 
      (filters.price === 'free' && sample.price === 0) ||
      (filters.price === 'premium' && sample.price > 0);

    return matchesSearch && matchesCategory && matchesGenre && matchesBpm && 
           matchesDuration && matchesQuality && matchesLicense && matchesPrice;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'duration':
        return a.duration - b.duration;
      case 'newest':
      default:
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
  });

  const renderSamples = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search samples, creators, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="drums">Drums</option>
              <option value="melody">Melody</option>
              <option value="bass">Bass</option>
              <option value="vocals">Vocals</option>
              <option value="fx">FX</option>
              <option value="loops">Loops</option>
            </select>
            
            <select
              value={filters.genre}
              onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Genres</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Electronic">Electronic</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Jazz">Jazz</option>
            </select>

            <select
              value={filters.price}
              onChange={(e) => setFilters(prev => ({ ...prev, price: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Downloaded</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>

        {selectedSamples.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-800">{selectedSamples.length} samples selected</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateCollectionModal(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Create Collection
              </button>
              <button
                onClick={() => setSelectedSamples([])}
                className="px-3 py-1 border border-blue-300 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sample Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSamples.map(sample => (
          <div
            key={sample.id}
            className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
              selectedSamples.includes(sample.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 truncate">{sample.name}</h3>
                  <p className="text-sm text-gray-600">{sample.creator.displayName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSamples.includes(sample.id)}
                    onChange={() => toggleSampleSelection(sample.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {sample.price > 0 ? (
                    <span className="text-sm font-bold text-green-600">${sample.price}</span>
                  ) : (
                    <span className="text-sm font-bold text-blue-600">FREE</span>
                  )}
                </div>
              </div>

              {/* Waveform/Visual */}
              <div className="relative mb-3 h-16 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={sample.waveform || '/api/placeholder/300/64'}
                  alt="Waveform"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => playSample(sample)}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm hover:scale-110 transition-transform"
                  >
                    {currentSample?.id === sample.id && isPlaying ? '⏸️' : '▶️'}
                  </button>
                </div>
              </div>

              {/* Sample Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category:</span>
                  <span className="capitalize">{sample.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span>{Math.floor(sample.duration / 60)}:{(sample.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                {sample.bpm && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">BPM:</span>
                    <span>{sample.bpm}</span>
                  </div>
                )}
                {sample.key && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Key:</span>
                    <span>{sample.key}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Format:</span>
                  <span className="uppercase">{sample.format} {sample.quality}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                <span className={`px-2 py-1 text-xs rounded ${
                  sample.isPremium ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {sample.isPremium ? 'Premium' : 'Standard'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded capitalize">
                  {sample.license.type}
                </span>
                {sample.aiGenerated && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">
                    AI Generated
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{sample.downloads} downloads</span>
                  <button
                    onClick={() => likeSample(sample.id)}
                    className={`flex items-center space-x-1 ${sample.isLiked ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    <span>❤️</span>
                    <span>{sample.likes}</span>
                  </button>
                </div>

                <div className="flex space-x-2">
                  {sample.isPurchased || sample.price === 0 ? (
                    <button
                      onClick={() => downloadSample(sample.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Download
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentSample(sample);
                        setShowLicenseModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      License
                    </button>
                  )}
                  
                  {sample.stemParts && sample.stemParts.length > 0 && (
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      Stems
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSamples.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No samples found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderPacks = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Sample Packs</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {samplePacks.map(pack => (
          <div key={pack.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img
              src={pack.artwork || '/api/placeholder/400/200'}
              alt={pack.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900">{pack.name}</h3>
                <div className="text-right">
                  {pack.discountedPrice ? (
                    <div>
                      <span className="text-lg font-bold text-green-600">${pack.discountedPrice}</span>
                      <span className="text-sm text-gray-500 line-through ml-1">${pack.price}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-green-600">${pack.price}</span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{pack.description}</p>

              <div className="flex items-center space-x-2 mb-3">
                <img
                  src={pack.creator.avatar || '/api/placeholder/24/24'}
                  alt={pack.creator.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600">{pack.creator.displayName}</span>
                {pack.creator.verified && <span className="text-blue-500">✓</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span className="text-gray-500">Samples:</span>
                  <span className="ml-1 font-medium">{pack.totalSamples}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <span className="ml-1 font-medium">{Math.floor(pack.totalDuration / 60)}:{(pack.totalDuration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Downloads:</span>
                  <span className="ml-1 font-medium">{pack.downloads}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500">Rating:</span>
                  <div className="ml-1 flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium ml-1">{pack.rating}</span>
                  </div>
                </div>
              </div>

              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={pack.isPurchased}
              >
                {pack.isPurchased ? 'Purchased' : 'License Pack'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCollections = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Collections</h2>
        <button
          onClick={() => setShowCreateCollectionModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Collection
        </button>
      </div>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <div key={collection.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-2">{collection.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{collection.samples.length} samples</span>
                <span>{collection.isPublic ? 'Public' : 'Private'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
          <p className="text-gray-600">Create collections to organize your favorite samples</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sample Library</h1>
          <p className="text-gray-600">Discover, license, and organize high-quality samples and loops</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'samples', label: 'Browse Samples', icon: '🎵' },
              { id: 'packs', label: 'Sample Packs', icon: '📦' },
              { id: 'collections', label: 'My Collections', icon: '📁' },
              { id: 'upload', label: 'Upload', icon: '⬆️' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'samples' && renderSamples()}
        {activeTab === 'packs' && renderPacks()}
        {activeTab === 'collections' && renderCollections()}
        {activeTab === 'upload' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⬆️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Samples</h3>
            <p className="text-gray-600">Share your samples with the community</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sample Analytics</h3>
            <p className="text-gray-600">Track downloads and engagement</p>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <audio ref={audioRef} />
    </div>
  );
}