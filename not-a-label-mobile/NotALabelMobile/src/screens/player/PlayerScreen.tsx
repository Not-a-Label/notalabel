import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  pauseTrack, 
  resumeTrack, 
  nextTrack, 
  previousTrack,
  setRepeatMode,
  toggleShuffle,
  seekTo,
} from '../../store/slices/playerSlice';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration, 
    repeatMode, 
    shuffleMode 
  } = useSelector((state: RootState) => state.player);

  const [isDragging, setIsDragging] = useState(false);
  const [tempPosition, setTempPosition] = useState(0);

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

  const handleSeek = (value: number) => {
    dispatch(seekTo(value));
  };

  const handleRepeat = () => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    dispatch(setRepeatMode(nextMode));
  };

  const handleShuffle = () => {
    dispatch(toggleShuffle());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return 'repeat-outline';
      case 'all':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  const handleSwipeDown = () => {
    navigation.goBack();
  };

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>No track playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentPosition = isDragging ? tempPosition : position;
  const progressPercentage = duration > 0 ? (currentPosition / duration) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Now Playing</Text>
              <Text style={styles.headerSubtitle}>From {currentTrack.artistName}</Text>
            </View>

            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.artworkContainer}>
            <Image 
              source={{ uri: currentTrack.coverUrl || 'https://via.placeholder.com/300' }}
              style={styles.artwork}
            />
          </View>

          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle} numberOfLines={2}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {currentTrack.artistName}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
              />
            </View>
            <Slider
              style={styles.slider}
              value={currentPosition}
              minimumValue={0}
              maximumValue={duration}
              onSlidingStart={() => setIsDragging(true)}
              onValueChange={setTempPosition}
              onSlidingComplete={(value) => {
                setIsDragging(false);
                handleSeek(value);
              }}
              minimumTrackTintColor="#00ffaa"
              maximumTrackTintColor="#333"
              thumbTintColor="#00ffaa"
            />
            
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, shuffleMode && styles.activeControl]}
              onPress={handleShuffle}
            >
              <Ionicons 
                name="shuffle" 
                size={24} 
                color={shuffleMode ? "#00ffaa" : "#666"} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handlePrevious}
            >
              <Ionicons name="play-skip-back" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={36} 
                color="#000" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={handleNext}
            >
              <Ionicons name="play-skip-forward" size={32} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, repeatMode !== 'off' && styles.activeControl]}
              onPress={handleRepeat}
            >
              <Ionicons 
                name={getRepeatIcon()} 
                size={24} 
                color={repeatMode !== 'off' ? "#00ffaa" : "#666"} 
              />
              {repeatMode === 'one' && (
                <View style={styles.repeatOneIndicator}>
                  <Text style={styles.repeatOneText}>1</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="list-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: -2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ffaa',
    borderRadius: 2,
  },
  slider: {
    height: 40,
    marginHorizontal: -12,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  controlButton: {
    padding: 12,
    position: 'relative',
  },
  activeControl: {
    // Active state styling handled by icon color
  },
  playButton: {
    backgroundColor: '#00ffaa',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00ffaa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  actionButton: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
});