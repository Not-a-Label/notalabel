// Mobile App Types for Not a Label

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'artist' | 'fan' | 'admin' | 'founder';
  bio?: string;
  profilePicture?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStatus: 'active' | 'inactive';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  artistName: string;
  description?: string;
  genre?: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  coverArt?: string;
  waveformData?: number[];
  plays: number;
  likes: number;
  createdAt: string;
  isLiked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  trackCount: number;
  coverImage?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Artist {
  id: string;
  name: string;
  username: string;
  bio?: string;
  profilePicture?: string;
  avatarUrl?: string;
  followerCount: number;
  trackCount: number;
  isFollowing?: boolean;
  genre?: string;
  genres: string[];
  location?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Track[];
  currentIndex: number;
  repeatMode: 'off' | 'one' | 'all';
  shuffleMode: boolean;
  volume: number;
}

export interface NavigationParams extends Record<string, object | undefined> {
  Home: undefined;
  Discover: undefined;
  Library: undefined;
  Profile: { userId?: string };
  Player: { track: Track };
  TrackDetail: { trackId: string };
  ArtistProfile: { artistId: string };
  Playlist: { playlistId: string };
  Search: undefined;
  Settings: undefined;
  Login: undefined;
  Register: undefined;
  Upload: undefined;
  Analytics: undefined;
  MainTabs: undefined;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalyticsData {
  totalPlays: number;
  uniqueListeners: number;
  totalTracks: number;
  totalRevenue: number;
  recentPlays: Array<{
    date: string;
    plays: number;
  }>;
  topTracks: Track[];
  demographics: {
    countries: Array<{
      country: string;
      listeners: number;
    }>;
    ageGroups: Array<{
      ageGroup: string;
      percentage: number;
    }>;
  };
}

export interface NotificationData {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'upload' | 'revenue';
  title: string;
  body: string;
  data?: any;
  timestamp: string;
  isRead: boolean;
}