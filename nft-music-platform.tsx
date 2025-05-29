'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';

interface MusicNFT {
  id: string;
  title: string;
  artist: Artist;
  description: string;
  artwork: string;
  audioPreview: string;
  fullTrack?: string;
  duration: number;
  genre: string;
  releaseDate: string;
  tokenId: string;
  contractAddress: string;
  blockchain: 'ethereum' | 'polygon' | 'solana' | 'bsc';
  price: number;
  currency: 'ETH' | 'MATIC' | 'SOL' | 'BNB';
  royaltyPercentage: number;
  totalSupply: number;
  availableSupply: number;
  mintedCount: number;
  holders: number;
  floorPrice: number;
  lastSalePrice?: number;
  volume24h: number;
  isLimited: boolean;
  isAuction: boolean;
  auctionEndTime?: string;
  highestBid?: number;
  utility: NFTUtility[];
  metadata: NFTMetadata;
  transactions: NFTTransaction[];
  collaborators: Collaborator[];
  splits: RoyaltySplit[];
  isVerified: boolean;
  isPinned: boolean;
}

interface Artist {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  walletAddress: string;
  followers: number;
  totalNFTs: number;
  totalVolume: number;
  bio: string;
  website?: string;
  socialLinks: SocialLink[];
}

interface NFTUtility {
  type: 'exclusive-content' | 'concert-access' | 'meet-greet' | 'merchandise' | 'voting-rights' | 'commercial-license';
  title: string;
  description: string;
  isActive: boolean;
  expiryDate?: string;
  metadata?: any;
}

interface NFTMetadata {
  format: string;
  bitrate: string;
  sampleRate: string;
  fileSize: number;
  duration: number;
  lyrics?: string;
  credits: Credit[];
  recordingDate: string;
  studio?: string;
  producer?: string;
  engineer?: string;
  instruments: Instrument[];
  isExplicit: boolean;
  tags: string[];
  mood: string[];
  energy: number; // 1-10
  danceability: number; // 1-10
  valence: number; // 1-10
}

interface Credit {
  role: string;
  name: string;
  contribution: string;
}

interface Instrument {
  name: string;
  player: string;
  type: 'acoustic' | 'electric' | 'digital';
}

interface NFTTransaction {
  id: string;
  type: 'mint' | 'sale' | 'transfer' | 'auction' | 'bid';
  from: string;
  to: string;
  price: number;
  currency: string;
  txHash: string;
  timestamp: string;
  gasUsed?: number;
  gasFee?: number;
}

interface Collaborator {
  id: string;
  name: string;
  role: string;
  percentage: number;
  walletAddress: string;
}

interface RoyaltySplit {
  address: string;
  percentage: number;
  role: string;
  name: string;
}

interface SocialLink {
  platform: string;
  url: string;
  username: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  artist: Artist;
  artwork: string;
  totalItems: number;
  mintedItems: number;
  floorPrice: number;
  volume: number;
  holders: number;
  category: 'album' | 'single' | 'ep' | 'remix' | 'live' | 'demo';
  releaseDate: string;
  isVerified: boolean;
  theme: CollectionTheme;
}

interface CollectionTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundImage?: string;
  logoImage?: string;
  bannerImage?: string;
}

interface Marketplace {
  trending: MusicNFT[];
  featured: MusicNFT[];
  newReleases: MusicNFT[];
  topSelling: MusicNFT[];
  upcomingDrops: Drop[];
}

interface Drop {
  id: string;
  title: string;
  artist: Artist;
  description: string;
  artwork: string;
  dropDate: string;
  price: number;
  currency: string;
  totalSupply: number;
  isPresale: boolean;
  presaleDate?: string;
  whitelistSpots?: number;
  isWhitelisted?: boolean;
  type: 'fixed-price' | 'auction' | 'dutch-auction';
}

export default function NFTMusicPlatform() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'collections' | 'create' | 'portfolio' | 'analytics'>('explore');
  const [musicNFTs, setMusicNFTs] = useState<MusicNFT[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null);
  const [userPortfolio, setUserPortfolio] = useState<MusicNFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<MusicNFT | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicNFT | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    genre: '',
    blockchain: '',
    price: { min: 0, max: 10 },
    sortBy: 'newest',
    currency: '',
    isAuction: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMarketplace();
    fetchCollections();
    fetchUserPortfolio();
    checkWalletConnection();
  }, []);

  const fetchMarketplace = async () => {
    try {
      const response = await fetch('/api/nft/marketplace', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMarketplace(data.marketplace);
      setMusicNFTs([...data.marketplace.trending, ...data.marketplace.featured, ...data.marketplace.newReleases]);
    } catch (error) {
      console.error('Error fetching marketplace:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/nft/collections', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchUserPortfolio = async () => {
    try {
      const response = await fetch('/api/nft/portfolio', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUserPortfolio(data.nfts || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnectedWallet(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  const mintNFT = async (nftData: any) => {
    try {
      const response = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...nftData,
          walletAddress: connectedWallet
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchUserPortfolio();
        fetchMarketplace();
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
    }
  };

  const buyNFT = async (nftId: string, price: number) => {
    try {
      const response = await fetch(`/api/nft/${nftId}/buy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price,
          walletAddress: connectedWallet
        })
      });

      if (response.ok) {
        setShowBuyModal(false);
        fetchUserPortfolio();
        fetchMarketplace();
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
    }
  };

  const placeBid = async (nftId: string, bidAmount: number) => {
    try {
      const response = await fetch(`/api/nft/${nftId}/bid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: bidAmount,
          walletAddress: connectedWallet
        })
      });

      if (response.ok) {
        setShowBidModal(false);
        fetchMarketplace();
      }
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  const playTrack = (nft: MusicNFT) => {
    if (currentTrack?.id === nft.id && isPlaying) {
      setIsPlaying(false);
      setCurrentTrack(null);
    } else {
      setCurrentTrack(nft);
      setIsPlaying(true);
    }
  };

  const filteredNFTs = musicNFTs.filter(nft => {
    const matchesSearch = !searchQuery || 
      nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.genre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = !filters.genre || nft.genre === filters.genre;
    const matchesBlockchain = !filters.blockchain || nft.blockchain === filters.blockchain;
    const matchesPrice = nft.price >= filters.price.min && nft.price <= filters.price.max;
    const matchesCurrency = !filters.currency || nft.currency === filters.currency;
    const matchesAuction = !filters.isAuction || nft.isAuction;

    return matchesSearch && matchesGenre && matchesBlockchain && matchesPrice && matchesCurrency && matchesAuction;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.volume24h - a.volume24h;
      case 'ending-soon':
        if (!a.auctionEndTime || !b.auctionEndTime) return 0;
        return new Date(a.auctionEndTime).getTime() - new Date(b.auctionEndTime).getTime();
      case 'newest':
      default:
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    }
  });

  const renderExplore = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      {marketplace?.featured && marketplace.featured.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={marketplace.featured[0].artwork}
            alt={marketplace.featured[0].title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
            <div className="max-w-2xl px-8">
              <h2 className="text-4xl font-bold text-white mb-4">{marketplace.featured[0].title}</h2>
              <p className="text-xl text-gray-200 mb-2">by {marketplace.featured[0].artist.displayName}</p>
              <p className="text-gray-300 mb-6">{marketplace.featured[0].description}</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => playTrack(marketplace.featured[0])}
                  className="px-6 py-3 bg-white text-black rounded-full hover:bg-gray-100 transition-colors"
                >
                  {currentTrack?.id === marketplace.featured[0].id && isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => {
                    setSelectedNFT(marketplace.featured[0]);
                    setShowBuyModal(true);
                  }}
                  className="px-6 py-3 border border-white text-white rounded-full hover:bg-white hover:text-black transition-colors"
                >
                  Own for {marketplace.featured[0].price} {marketplace.featured[0].currency}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search music NFTs, artists, collections..."
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
              <option value="Electronic">Electronic</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Classical">Classical</option>
              <option value="Jazz">Jazz</option>
            </select>
            
            <select
              value={filters.blockchain}
              onChange={(e) => setFilters(prev => ({ ...prev, blockchain: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Blockchains</option>
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="solana">Solana</option>
              <option value="bsc">BSC</option>
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
              <option value="ending-soon">Ending Soon</option>
            </select>

            {!connectedWallet ? (
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                {connectedWallet.substring(0, 6)}...{connectedWallet.substring(connectedWallet.length - 4)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNFTs.map(nft => (
          <div key={nft.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={nft.artwork}
                alt={nft.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => playTrack(nft)}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl hover:scale-110 transition-transform"
                >
                  {currentTrack?.id === nft.id && isPlaying ? '⏸️' : '▶️'}
                </button>
              </div>
              
              {nft.isLimited && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  Limited
                </div>
              )}
              
              {nft.isAuction && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                  Auction
                </div>
              )}
              
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center justify-between text-white text-sm">
                  <span>{Math.floor(nft.duration / 60)}:{(nft.duration % 60).toString().padStart(2, '0')}</span>
                  <span className="capitalize">{nft.blockchain}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 truncate flex-1">{nft.title}</h3>
                {nft.isVerified && <span className="text-blue-500 ml-2">✓</span>}
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <img
                  src={nft.artist.avatar || '/api/placeholder/24/24'}
                  alt={nft.artist.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600">{nft.artist.displayName}</span>
                {nft.artist.verified && <span className="text-blue-500">✓</span>}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Price:</span>
                  <span className="font-bold text-gray-900">{nft.price} {nft.currency}</span>
                </div>
                
                {nft.isAuction && nft.highestBid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Highest Bid:</span>
                    <span className="font-bold text-green-600">{nft.highestBid} {nft.currency}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Supply:</span>
                  <span className="text-gray-900">{nft.availableSupply}/{nft.totalSupply}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Royalty:</span>
                  <span className="text-gray-900">{nft.royaltyPercentage}%</span>
                </div>
              </div>

              {/* Utility Icons */}
              {nft.utility.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {nft.utility.slice(0, 3).map((util, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded"
                      title={util.title}
                    >
                      {util.type === 'exclusive-content' ? '🎵' :
                       util.type === 'concert-access' ? '🎤' :
                       util.type === 'meet-greet' ? '🤝' :
                       util.type === 'merchandise' ? '👕' :
                       util.type === 'voting-rights' ? '🗳️' :
                       util.type === 'commercial-license' ? '💼' : '⭐'}
                    </span>
                  ))}
                  {nft.utility.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{nft.utility.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex space-x-2">
                {nft.isAuction ? (
                  <button
                    onClick={() => {
                      setSelectedNFT(nft);
                      setShowBidModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    disabled={!connectedWallet}
                  >
                    Place Bid
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedNFT(nft);
                      setShowBuyModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    disabled={!connectedWallet || nft.availableSupply === 0}
                  >
                    {nft.availableSupply === 0 ? 'Sold Out' : 'Buy Now'}
                  </button>
                )}
                
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNFTs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No music NFTs found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderCollections = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Featured Collections</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map(collection => (
          <div key={collection.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <img
              src={collection.artwork}
              alt={collection.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900">{collection.name}</h3>
                {collection.isVerified && <span className="text-blue-500">✓</span>}
              </div>

              <p className="text-sm text-gray-600 mb-4">{collection.description}</p>

              <div className="flex items-center space-x-2 mb-4">
                <img
                  src={collection.artist.avatar || '/api/placeholder/24/24'}
                  alt={collection.artist.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600">{collection.artist.displayName}</span>
                {collection.artist.verified && <span className="text-blue-500">✓</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Items:</span>
                  <span className="ml-2 font-medium">{collection.mintedItems}/{collection.totalItems}</span>
                </div>
                <div>
                  <span className="text-gray-500">Floor:</span>
                  <span className="ml-2 font-medium">{collection.floorPrice} ETH</span>
                </div>
                <div>
                  <span className="text-gray-500">Volume:</span>
                  <span className="ml-2 font-medium">{collection.volume} ETH</span>
                </div>
                <div>
                  <span className="text-gray-500">Holders:</span>
                  <span className="ml-2 font-medium">{collection.holders}</span>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Collection
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Music NFT Marketplace</h1>
          <p className="text-gray-600">Discover, collect, and trade unique music NFTs</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'explore', label: 'Explore', icon: '🔍' },
              { id: 'collections', label: 'Collections', icon: '📦' },
              { id: 'create', label: 'Create', icon: '✨' },
              { id: 'portfolio', label: 'My NFTs', icon: '💎' },
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
        {activeTab === 'explore' && renderExplore()}
        {activeTab === 'collections' && renderCollections()}
        {activeTab === 'create' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Create Music NFTs</h3>
            <p className="text-gray-600">Mint your music as unique digital collectibles</p>
          </div>
        )}
        {activeTab === 'portfolio' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💎</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your NFT Collection</h3>
            <p className="text-gray-600">Manage your owned and created music NFTs</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">NFT Analytics</h3>
            <p className="text-gray-600">Track performance and market trends</p>
          </div>
        )}
      </div>
    </div>
  );
}