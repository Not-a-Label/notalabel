// Music Slice for Not a Label Mobile App

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Track, Artist } from '../../types';
import apiService from '../../services/api';

interface MusicState {
  tracks: Track[];
  artists: Artist[];
  featuredTracks: Track[];
  trendingArtists: Artist[];
  searchResults: {
    tracks: Track[];
    artists: Artist[];
  };
  isLoading: boolean;
  error: string | null;
  hasMoreTracks: boolean;
  hasMoreArtists: boolean;
}

// Async thunks
export const fetchTracks = createAsyncThunk(
  'music/fetchTracks',
  async (params?: {
    page?: number;
    limit?: number;
    genre?: string;
    search?: string;
  }) => {
    const response = await apiService.getTracks(params);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data!;
  }
);

export const fetchArtists = createAsyncThunk(
  'music/fetchArtists',
  async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const response = await apiService.getArtists(params);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data!;
  }
);

export const searchMusic = createAsyncThunk(
  'music/search',
  async ({ query, type }: { query: string; type?: 'all' | 'tracks' | 'artists' }) => {
    const response = await apiService.search(query, type);
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data!;
  }
);

export const likeTrack = createAsyncThunk(
  'music/likeTrack',
  async (trackId: string) => {
    const response = await apiService.likeTrack(trackId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return trackId;
  }
);

export const unlikeTrack = createAsyncThunk(
  'music/unlikeTrack',
  async (trackId: string) => {
    const response = await apiService.unlikeTrack(trackId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return trackId;
  }
);

export const followArtist = createAsyncThunk(
  'music/followArtist',
  async (artistId: string) => {
    const response = await apiService.followArtist(artistId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return artistId;
  }
);

export const unfollowArtist = createAsyncThunk(
  'music/unfollowArtist',
  async (artistId: string) => {
    const response = await apiService.unfollowArtist(artistId);
    if (!response.success) {
      throw new Error(response.error);
    }
    return artistId;
  }
);

const initialState: MusicState = {
  tracks: [],
  artists: [],
  featuredTracks: [],
  trendingArtists: [],
  searchResults: {
    tracks: [],
    artists: [],
  },
  isLoading: false,
  error: null,
  hasMoreTracks: true,
  hasMoreArtists: true,
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    clearSearchResults: (state) => {
      state.searchResults = {
        tracks: [],
        artists: [],
      };
    },

    updateTrackLike: (state, action: PayloadAction<{ trackId: string; isLiked: boolean }>) => {
      const { trackId, isLiked } = action.payload;
      
      // Update in tracks array
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].isLiked = isLiked;
        state.tracks[trackIndex].likes += isLiked ? 1 : -1;
      }
      
      // Update in featured tracks
      const featuredIndex = state.featuredTracks.findIndex(track => track.id === trackId);
      if (featuredIndex !== -1) {
        state.featuredTracks[featuredIndex].isLiked = isLiked;
        state.featuredTracks[featuredIndex].likes += isLiked ? 1 : -1;
      }
      
      // Update in search results
      const searchIndex = state.searchResults.tracks.findIndex(track => track.id === trackId);
      if (searchIndex !== -1) {
        state.searchResults.tracks[searchIndex].isLiked = isLiked;
        state.searchResults.tracks[searchIndex].likes += isLiked ? 1 : -1;
      }
    },

    updateArtistFollow: (state, action: PayloadAction<{ artistId: string; isFollowing: boolean }>) => {
      const { artistId, isFollowing } = action.payload;
      
      // Update in artists array
      const artistIndex = state.artists.findIndex(artist => artist.id === artistId);
      if (artistIndex !== -1) {
        state.artists[artistIndex].isFollowing = isFollowing;
        state.artists[artistIndex].followerCount += isFollowing ? 1 : -1;
      }
      
      // Update in trending artists
      const trendingIndex = state.trendingArtists.findIndex(artist => artist.id === artistId);
      if (trendingIndex !== -1) {
        state.trendingArtists[trendingIndex].isFollowing = isFollowing;
        state.trendingArtists[trendingIndex].followerCount += isFollowing ? 1 : -1;
      }
      
      // Update in search results
      const searchIndex = state.searchResults.artists.findIndex(artist => artist.id === artistId);
      if (searchIndex !== -1) {
        state.searchResults.artists[searchIndex].isFollowing = isFollowing;
        state.searchResults.artists[searchIndex].followerCount += isFollowing ? 1 : -1;
      }
    },

    addTracksToLibrary: (state, action: PayloadAction<Track[]>) => {
      const newTracks = action.payload.filter(
        newTrack => !state.tracks.some(track => track.id === newTrack.id)
      );
      state.tracks.push(...newTracks);
    },
  },

  extraReducers: (builder) => {
    // Fetch tracks
    builder
      .addCase(fetchTracks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTracks.fulfilled, (state, action) => {
        state.isLoading = false;
        const { tracks, total } = action.payload;
        
        // If this is a fresh fetch (page 1), replace tracks
        if (!action.meta.arg?.page || action.meta.arg.page === 1) {
          state.tracks = tracks;
        } else {
          // Append tracks for pagination
          state.tracks.push(...tracks);
        }
        
        // Check if there are more tracks to load
        state.hasMoreTracks = state.tracks.length < total;
        
        // Set featured tracks from the first batch
        if ((!action.meta.arg?.page || action.meta.arg.page === 1) && tracks.length > 0) {
          state.featuredTracks = tracks.slice(0, 10);
        }
      })
      .addCase(fetchTracks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tracks';
      });

    // Fetch artists
    builder
      .addCase(fetchArtists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArtists.fulfilled, (state, action) => {
        state.isLoading = false;
        const { artists, total } = action.payload;
        
        // If this is a fresh fetch (page 1), replace artists
        if (!action.meta.arg?.page || action.meta.arg.page === 1) {
          state.artists = artists;
        } else {
          // Append artists for pagination
          state.artists.push(...artists);
        }
        
        // Check if there are more artists to load
        state.hasMoreArtists = state.artists.length < total;
        
        // Set trending artists from the first batch
        if ((!action.meta.arg?.page || action.meta.arg.page === 1) && artists.length > 0) {
          state.trendingArtists = artists.slice(0, 10);
        }
      })
      .addCase(fetchArtists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch artists';
      });

    // Search
    builder
      .addCase(searchMusic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMusic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchMusic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Search failed';
      });

    // Like track
    builder
      .addCase(likeTrack.fulfilled, (state, action) => {
        musicSlice.caseReducers.updateTrackLike(state, {
          payload: { trackId: action.payload, isLiked: true },
          type: 'music/updateTrackLike',
        });
      });

    // Unlike track
    builder
      .addCase(unlikeTrack.fulfilled, (state, action) => {
        musicSlice.caseReducers.updateTrackLike(state, {
          payload: { trackId: action.payload, isLiked: false },
          type: 'music/updateTrackLike',
        });
      });

    // Follow artist
    builder
      .addCase(followArtist.fulfilled, (state, action) => {
        musicSlice.caseReducers.updateArtistFollow(state, {
          payload: { artistId: action.payload, isFollowing: true },
          type: 'music/updateArtistFollow',
        });
      });

    // Unfollow artist
    builder
      .addCase(unfollowArtist.fulfilled, (state, action) => {
        musicSlice.caseReducers.updateArtistFollow(state, {
          payload: { artistId: action.payload, isFollowing: false },
          type: 'music/updateArtistFollow',
        });
      });
  },
});

export const {
  clearError,
  clearSearchResults,
  updateTrackLike,
  updateArtistFollow,
  addTracksToLibrary,
} = musicSlice.actions;

export default musicSlice.reducer;