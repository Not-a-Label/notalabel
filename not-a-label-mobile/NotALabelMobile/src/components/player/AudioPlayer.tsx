import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  pauseTrack, 
  resumeTrack, 
  nextTrack, 
  previousTrack 
} from '../../store/slices/playerSlice';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

export default function AudioPlayer({ navigation }: any) {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, position, duration } = useSelector(
    (state: RootState) => state.player
  );
  
  const sound = useRef<Audio.Sound | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isVisible = !!currentTrack;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  useEffect(() => {
    if (currentTrack) {
      loadAudio();
    }
    
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    if (sound.current) {
      if (isPlaying) {
        sound.current.playAsync();
      } else {
        sound.current.pauseAsync();
      }
    }
  }, [isPlaying]);

  const loadAudio = async () => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: currentTrack!.audioUrl },
        { 
          shouldPlay: isPlaying,
          isLooping: false,
          volume: 1.0,
        }
      );

      sound.current = newSound;

      // Set up status update callback
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          // Update position and duration in Redux store
          // This would typically be done with dispatch actions
        }
      });

    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch(pauseTrack());
    } else {
      dispatch(resumeTrack());
    }
  };

  const handleNext = () => {
    dispatch(nextTrack());
  };

  const handlePrevious = () => {
    dispatch(previousTrack());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  const handleSwipeUp = () => {
    // Handle tap to open full player
    navigation?.navigate('Player');
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          }],
        },
      ]}
    >
        <TouchableOpacity 
          style={styles.playerContent}
          onPress={handleSwipeUp}
          activeOpacity={0.8}
        >
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
            />
          </View>

          <View style={styles.trackInfo}>
            <View style={styles.textContainer}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {currentTrack.artistName}
              </Text>
            </View>
            
            <Text style={styles.timeInfo}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handlePrevious}
            >
              <Ionicons name="play-skip-back" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="#000" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleNext}
            >
              <Ionicons name="play-skip-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 34, // Account for home indicator on iOS
  },
  playerContent: {
    padding: 12,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#333',
    marginBottom: 12,
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffaa',
    borderRadius: 1,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  artistName: {
    fontSize: 12,
    color: '#999',
  },
  timeInfo: {
    fontSize: 10,
    color: '#999',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    backgroundColor: '#00ffaa',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});