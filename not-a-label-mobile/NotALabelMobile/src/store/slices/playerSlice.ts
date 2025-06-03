// Player Slice for Not a Label Mobile App

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlayerState, Track } from '../../types';

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  currentIndex: -1,
  repeatMode: 'off',
  shuffleMode: false,
  volume: 1.0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    playTrack: (state, action: PayloadAction<{ track: Track; queue?: Track[] }>) => {
      const { track, queue = [track] } = action.payload;
      state.currentTrack = track;
      state.queue = queue;
      state.currentIndex = queue.findIndex(t => t.id === track.id);
      state.isPlaying = true;
      state.position = 0;
    },

    pauseTrack: (state) => {
      state.isPlaying = false;
    },

    resumeTrack: (state) => {
      if (state.currentTrack) {
        state.isPlaying = true;
      }
    },

    stopTrack: (state) => {
      state.isPlaying = false;
      state.position = 0;
    },

    nextTrack: (state) => {
      if (state.shuffleMode) {
        // Random next track
        const availableIndices = state.queue
          .map((_, index) => index)
          .filter(index => index !== state.currentIndex);
        
        if (availableIndices.length > 0) {
          const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          state.currentIndex = randomIndex;
          state.currentTrack = state.queue[randomIndex];
          state.position = 0;
        }
      } else {
        // Sequential next track
        if (state.currentIndex < state.queue.length - 1) {
          state.currentIndex += 1;
          state.currentTrack = state.queue[state.currentIndex];
          state.position = 0;
        } else if (state.repeatMode === 'all') {
          state.currentIndex = 0;
          state.currentTrack = state.queue[0];
          state.position = 0;
        } else {
          state.isPlaying = false;
        }
      }
    },

    previousTrack: (state) => {
      if (state.position > 3) {
        // If more than 3 seconds in, restart current track
        state.position = 0;
      } else if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.currentTrack = state.queue[state.currentIndex];
        state.position = 0;
      } else if (state.repeatMode === 'all') {
        state.currentIndex = state.queue.length - 1;
        state.currentTrack = state.queue[state.currentIndex];
        state.position = 0;
      }
    },

    seekTo: (state, action: PayloadAction<number>) => {
      state.position = Math.max(0, Math.min(action.payload, state.duration));
    },

    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },

    updatePosition: (state, action: PayloadAction<number>) => {
      state.position = action.payload;
      
      // Auto-advance to next track when current track ends
      if (state.position >= state.duration && state.duration > 0) {
        if (state.repeatMode === 'one') {
          state.position = 0;
        } else {
          // Trigger next track logic
          playerSlice.caseReducers.nextTrack(state);
        }
      }
    },

    setRepeatMode: (state, action: PayloadAction<'off' | 'one' | 'all'>) => {
      state.repeatMode = action.payload;
    },

    toggleShuffle: (state) => {
      state.shuffleMode = !state.shuffleMode;
      
      if (state.shuffleMode) {
        // Shuffle the queue but keep current track at current position
        const currentTrack = state.currentTrack;
        const otherTracks = state.queue.filter(track => track.id !== currentTrack?.id);
        
        // Fisher-Yates shuffle
        for (let i = otherTracks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
        }
        
        if (currentTrack) {
          state.queue = [currentTrack, ...otherTracks];
          state.currentIndex = 0;
        }
      }
      // Note: Un-shuffling would require storing original queue order
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },

    addToQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue.push(...action.payload);
    },

    removeFromQueue: (state, action: PayloadAction<string>) => {
      const trackId = action.payload;
      const trackIndex = state.queue.findIndex(track => track.id === trackId);
      
      if (trackIndex !== -1) {
        state.queue.splice(trackIndex, 1);
        
        // Adjust current index if necessary
        if (trackIndex < state.currentIndex) {
          state.currentIndex -= 1;
        } else if (trackIndex === state.currentIndex) {
          // Currently playing track was removed
          if (state.queue.length === 0) {
            state.currentTrack = null;
            state.currentIndex = -1;
            state.isPlaying = false;
          } else {
            // Play next track or wrap to first
            if (state.currentIndex >= state.queue.length) {
              state.currentIndex = 0;
            }
            state.currentTrack = state.queue[state.currentIndex];
          }
        }
      }
    },

    clearQueue: (state) => {
      state.queue = [];
      state.currentIndex = -1;
      state.currentTrack = null;
      state.isPlaying = false;
      state.position = 0;
    },

    replaceQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue = action.payload;
      state.currentIndex = -1;
      state.currentTrack = null;
      state.isPlaying = false;
      state.position = 0;
    },
  },
});

export const {
  playTrack,
  pauseTrack,
  resumeTrack,
  stopTrack,
  nextTrack,
  previousTrack,
  seekTo,
  setDuration,
  updatePosition,
  setRepeatMode,
  toggleShuffle,
  setVolume,
  addToQueue,
  removeFromQueue,
  clearQueue,
  replaceQueue,
} = playerSlice.actions;

export default playerSlice.reducer;