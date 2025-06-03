// API Service for Not a Label Mobile App

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { APIResponse, User, Track, Artist, AnalyticsData } from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'https://not-a-label.art/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear stored auth
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string): Promise<APIResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      // Store token and user data securely
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      
      return { success: true, data: { user, token } };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }): Promise<APIResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/register', userData);
      const { user, token } = response.data;
      
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      
      return { success: true, data: { user, token } };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  }

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Music endpoints
  async getTracks(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    search?: string;
  }): Promise<APIResponse<{ tracks: Track[]; total: number }>> {
    try {
      const response = await this.api.get('/music/tracks', { params });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch tracks' 
      };
    }
  }

  async getTrack(trackId: string): Promise<APIResponse<Track>> {
    try {
      const response = await this.api.get(`/music/tracks/${trackId}`);
      return { success: true, data: response.data.track };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch track' 
      };
    }
  }

  async likeTrack(trackId: string): Promise<APIResponse<void>> {
    try {
      await this.api.post(`/music/tracks/${trackId}/like`);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to like track' 
      };
    }
  }

  async unlikeTrack(trackId: string): Promise<APIResponse<void>> {
    try {
      await this.api.delete(`/music/tracks/${trackId}/like`);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to unlike track' 
      };
    }
  }

  // Artist endpoints
  async getArtists(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<APIResponse<{ artists: Artist[]; total: number }>> {
    try {
      const response = await this.api.get('/artists', { params });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch artists' 
      };
    }
  }

  async getArtist(artistId: string): Promise<APIResponse<Artist>> {
    try {
      const response = await this.api.get(`/artists/${artistId}`);
      return { success: true, data: response.data.artist };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch artist' 
      };
    }
  }

  async followArtist(artistId: string): Promise<APIResponse<void>> {
    try {
      await this.api.post(`/social/follow/${artistId}`);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to follow artist' 
      };
    }
  }

  async unfollowArtist(artistId: string): Promise<APIResponse<void>> {
    try {
      await this.api.delete(`/social/follow/${artistId}`);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to unfollow artist' 
      };
    }
  }

  // Search
  async search(query: string, type: 'all' | 'tracks' | 'artists' = 'all'): Promise<APIResponse<{
    tracks: Track[];
    artists: Artist[];
  }>> {
    try {
      const response = await this.api.get('/search', { 
        params: { q: query, type } 
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Search failed' 
      };
    }
  }

  // Analytics (for artists)
  async getAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<APIResponse<AnalyticsData>> {
    try {
      const response = await this.api.get('/analytics/overview', { 
        params: { timeRange } 
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch analytics' 
      };
    }
  }

  // Track play analytics
  async recordTrackPlay(trackId: string): Promise<void> {
    try {
      await this.api.post('/analytics/track-play', { trackId });
    } catch (error) {
      // Silently fail for analytics
      console.warn('Failed to record track play:', error);
    }
  }

  // Upload track
  async uploadTrack(trackData: FormData): Promise<APIResponse<Track>> {
    try {
      const response = await this.api.post('/music/upload', trackData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute for uploads
      });
      return { success: true, data: response.data.track };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Upload failed' 
      };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;