'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/utils/auth';

interface Beat {
  id: string;
  title: string;
  description: string;
  producer: Producer;
  genre: string;
  subGenre: string;
  bpm: number;
  key: string;
  mood: string[];
  tags: string[];
  duration: number;
  price: number;
  audioPreview: string;
  waveform: string;
  artwork: string;
  licenses: License[];
  isExclusive: boolean;
  exclusivePrice?: number;
  sales: number;
  likes: number;
  isLiked: boolean;
  isPurchased: boolean;
  uploadDate: string;
  lastPlayed?: string;
  stems?: {
    drums: string;
    bass: string;
    melody: string;
    vocals?: string;
  };
}

interface Producer {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  followers: number;
  totalSales: number;
  rating: number;
  location: string;
  specialties: string[];
}

interface License {
  id: string;
  name: string;
  price: number;
  description: string;
  features: LicenseFeature[];
  isPopular?: boolean;
}

interface LicenseFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface CartItem {
  beatId: string;
  beat: Beat;
  licenseId: string;
  license: License;
  price: number;
}

interface Purchase {
  id: string;
  beatId: string;
  beat: Beat;
  licenseId: string;
  license: License;
  purchaseDate: string;
  price: number;
  downloadUrl: string;
  certificateUrl: string;
}

export default function BeatMarketplace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'purchases' | 'earnings'>('browse');
  const [beats, setBeats] = useState<Beat[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    bpm: { min: 60, max: 200 },
    price: { min: 0, max: 500 },
    mood: '',
    key: '',
    sortBy: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchBeats();
    fetchPurchases();
    loadCart();
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
  }, [currentBeat]);

  const fetchBeats = async () => {
    try {
      const response = await fetch('/api/marketplace/beats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setBeats(data.beats || []);
    } catch (error) {
      console.error('Error fetching beats:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/marketplace/purchases', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('beatCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem('beatCart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const playBeat = (beat: Beat) => {
    if (currentBeat?.id === beat.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentBeat(beat);
      if (audioRef.current) {
        audioRef.current.src = beat.audioPreview;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const addToCart = (beat: Beat, license: License) => {
    const existingItem = cart.find(item => item.beatId === beat.id && item.licenseId === license.id);
    if (existingItem) return;

    const newItem: CartItem = {
      beatId: beat.id,
      beat,
      licenseId: license.id,
      license,
      price: license.price
    };

    saveCart([...cart, newItem]);
  };

  const removeFromCart = (beatId: string, licenseId: string) => {
    const newCart = cart.filter(item => !(item.beatId === beatId && item.licenseId === licenseId));
    saveCart(newCart);
  };

  const likeBeat = async (beatId: string) => {
    try {
      await fetch(`/api/marketplace/beats/${beatId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchBeats();
    } catch (error) {
      console.error('Error liking beat:', error);
    }
  };

  const uploadBeat = async (beatData: any) => {
    try {
      const formData = new FormData();
      Object.keys(beatData).forEach(key => {
        if (beatData[key] instanceof File) {
          formData.append(key, beatData[key]);
        } else if (typeof beatData[key] === 'object') {
          formData.append(key, JSON.stringify(beatData[key]));
        } else {
          formData.append(key, beatData[key]);
        }
      });

      const response = await fetch('/api/marketplace/beats', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (response.ok) {
        setShowUploadModal(false);
        fetchBeats();
      }
    } catch (error) {
      console.error('Error uploading beat:', error);
    }
  };

  const purchaseBeats = async () => {
    try {
      const response = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: cart })
      });

      if (response.ok) {
        saveCart([]);
        setShowCartModal(false);
        fetchPurchases();
      }
    } catch (error) {
      console.error('Error purchasing beats:', error);
    }
  };

  const filteredBeats = beats.filter(beat => {
    const matchesSearch = !searchQuery || 
      beat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.producer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = !filters.genre || beat.genre === filters.genre;
    const matchesBpm = beat.bpm >= filters.bpm.min && beat.bpm <= filters.bpm.max;
    const matchesPrice = beat.price >= filters.price.min && beat.price <= filters.price.max;
    const matchesMood = !filters.mood || beat.mood.includes(filters.mood);
    const matchesKey = !filters.key || beat.key === filters.key;

    return matchesSearch && matchesGenre && matchesBpm && matchesPrice && matchesMood && matchesKey;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'popular':
        return b.sales - a.sales;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
      default:
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
  });

  const renderBrowse = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search beats, producers, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.genre}
              onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Genres</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="R&B">R&B</option>
              <option value="Pop">Pop</option>
              <option value="Electronic">Electronic</option>
              <option value="Rock">Rock</option>
              <option value="Jazz">Jazz</option>
            </select>
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button
              onClick={() => setShowCartModal(true)}
              className="relative px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cart ({cart.length})
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Beat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBeats.map(beat => (
          <div key={beat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img
                src={beat.artwork || '/api/placeholder/300/200'}
                alt={beat.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => playBeat(beat)}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                >
                  {currentBeat?.id === beat.id && isPlaying ? '⏸️' : '▶️'}
                </button>
              </div>
              
              {beat.isExclusive && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                  Exclusive
                </div>
              )}
              
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  onClick={() => likeBeat(beat.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    beat.isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                  }`}
                >
                  ❤️
                </button>
              </div>
              
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center justify-between text-white text-sm">
                  <span>{Math.floor(beat.duration / 60)}:{(beat.duration % 60).toString().padStart(2, '0')}</span>
                  <span>{beat.bpm} BPM</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 truncate flex-1">{beat.title}</h3>
                <span className="text-lg font-bold text-green-600 ml-2">${beat.price}</span>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <img
                  src={beat.producer.avatar || '/api/placeholder/24/24'}
                  alt={beat.producer.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600">{beat.producer.displayName}</span>
                {beat.producer.verified && <span className="text-blue-500">✓</span>}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <span className="px-2 py-1 bg-gray-100 text-xs rounded">{beat.genre}</span>
                <span className="px-2 py-1 bg-gray-100 text-xs rounded">{beat.key}</span>
                {beat.mood.slice(0, 2).map(mood => (
                  <span key={mood} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">{mood}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{beat.sales} sales</span>
                <span>{beat.likes} likes</span>
              </div>

              <button
                onClick={() => {
                  setCurrentBeat(beat);
                  setShowLicenseModal(true);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={beat.isPurchased}
              >
                {beat.isPurchased ? 'Purchased' : 'License Beat'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBeats.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No beats found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderSell = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Sell Your Beats</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload Beat
        </button>
      </div>

      {/* Producer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-green-600 mb-1">$1,247</div>
          <div className="text-sm text-gray-500">Total Earnings</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-blue-600 mb-1">23</div>
          <div className="text-sm text-gray-500">Beats Sold</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-purple-600 mb-1">156</div>
          <div className="text-sm text-gray-500">Total Plays</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-orange-600 mb-1">12</div>
          <div className="text-sm text-gray-500">Active Beats</div>
        </div>
      </div>

      {/* My Beats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">My Beats</h3>
        <div className="space-y-4">
          {beats.filter(beat => beat.producer.id === user?.id).map(beat => (
            <div key={beat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={beat.artwork || '/api/placeholder/60/60'}
                  alt={beat.title}
                  className="w-15 h-15 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{beat.title}</h4>
                  <p className="text-sm text-gray-600">{beat.genre} • {beat.bpm} BPM • {beat.key}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-gray-900">{beat.sales}</div>
                  <div className="text-gray-500">Sales</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">${beat.sales * beat.price}</div>
                  <div className="text-gray-500">Earned</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-900">{beat.likes}</div>
                  <div className="text-gray-500">Likes</div>
                </div>
                <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Beat Marketplace</h1>
          <p className="text-gray-600">Discover, license, and sell professional beats</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'browse', label: 'Browse Beats', icon: '🎵' },
              { id: 'sell', label: 'Sell Beats', icon: '💰' },
              { id: 'purchases', label: 'My Purchases', icon: '📁' },
              { id: 'earnings', label: 'Earnings', icon: '📊' }
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
        {activeTab === 'browse' && renderBrowse()}
        {activeTab === 'sell' && renderSell()}
        {activeTab === 'purchases' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Purchases</h3>
            <p className="text-gray-600">Licensed beats and download history</p>
          </div>
        )}
        {activeTab === 'earnings' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Earnings Analytics</h3>
            <p className="text-gray-600">Detailed sales and revenue insights</p>
          </div>
        )}
      </div>

      {/* Audio Player */}
      <audio ref={audioRef} />

      {/* License Modal */}
      {showLicenseModal && currentBeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">License: {currentBeat.title}</h3>
              <button
                onClick={() => setShowLicenseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {currentBeat.licenses.map(license => (
                <div key={license.id} className={`border rounded-lg p-4 ${license.isPopular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{license.name}</h4>
                      {license.isPopular && <span className="text-xs text-blue-600 font-medium">MOST POPULAR</span>}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">${license.price}</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{license.description}</p>

                  <div className="space-y-2 mb-4">
                    {license.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.included ? '✓' : '✗'} {feature.name}
                        </span>
                        {feature.limit && <span className="text-gray-500">{feature.limit}</span>}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      addToCart(currentBeat, license);
                      setShowLicenseModal(false);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart - ${license.price}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Shopping Cart</h3>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {cart.length > 0 ? (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={`${item.beatId}-${item.licenseId}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.beat.title}</h4>
                      <p className="text-sm text-gray-600">{item.license.name}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600">${item.price}</span>
                      <button
                        onClick={() => removeFromCart(item.beatId, item.licenseId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      ${cart.reduce((sum, item) => sum + item.price, 0)}
                    </span>
                  </div>
                  <button
                    onClick={purchaseBeats}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Purchase All
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-gray-600">Your cart is empty</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}