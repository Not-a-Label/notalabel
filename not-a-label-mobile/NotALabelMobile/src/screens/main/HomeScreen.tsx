import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchTracks, fetchArtists } from '../../store/slices/musicSlice';
import { playTrack } from '../../store/slices/playerSlice';
import { Track, Artist } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { featuredTracks, trendingArtists, isLoading } = useSelector(
    (state: RootState) => state.music
  );

  useEffect(() => {
    dispatch(fetchTracks({ limit: 10 }));
    dispatch(fetchArtists({ limit: 10 }));
  }, [dispatch]);

  const handlePlayTrack = (track: Track) => {
    dispatch(playTrack({ track, queue: featuredTracks }));
  };

  const renderTrackItem = ({ item: track }: { item: Track }) => (
    <TouchableOpacity 
      style={styles.trackItem}
      onPress={() => handlePlayTrack(track)}
    >
      <Image 
        source={{ uri: track.coverUrl || 'https://via.placeholder.com/60' }}
        style={styles.trackImage}
      />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {track.artistName}
        </Text>
        <View style={styles.trackStats}>
          <Ionicons name="play" size={12} color="#999" />
          <Text style={styles.trackPlays}>{track.plays}</Text>
          <Ionicons name="heart" size={12} color="#999" style={{ marginLeft: 10 }} />
          <Text style={styles.trackLikes}>{track.likes}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={20} color="#00ffaa" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item: artist }: { item: Artist }) => (
    <TouchableOpacity 
      style={styles.artistItem}
      onPress={() => navigation.navigate('ArtistProfile', { artistId: artist.id })}
    >
      <Image 
        source={{ uri: artist.profilePicture || 'https://via.placeholder.com/80' }}
        style={styles.artistImage}
      />
      <Text style={styles.artistName} numberOfLines={1}>
        {artist.username}
      </Text>
      <Text style={styles.artistFollowers}>
        {artist.followerCount} followers
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {user?.username}
          </Text>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Discover')}
          >
            <Ionicons name="compass" size={24} color="#00ffaa" />
            <Text style={styles.quickActionText}>Discover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('Library')}
          >
            <Ionicons name="library" size={24} color="#00ffaa" />
            <Text style={styles.quickActionText}>Library</Text>
          </TouchableOpacity>

          {user?.role === 'artist' && (
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Upload')}
            >
              <Ionicons name="cloud-upload" size={24} color="#00ffaa" />
              <Text style={styles.quickActionText}>Upload</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Tracks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {featuredTracks.length > 0 ? (
            <FlatList
              data={featuredTracks.slice(0, 5)}
              keyExtractor={(item) => item.id}
              renderItem={renderTrackItem}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No featured tracks available</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Artists</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {trendingArtists.length > 0 ? (
            <FlatList
              data={trendingArtists.slice(0, 5)}
              keyExtractor={(item) => item.id}
              renderItem={renderArtistItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistsList}
            />
          ) : (
            <Text style={styles.emptyText}>No trending artists available</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchButton: {
    padding: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllText: {
    color: '#00ffaa',
    fontSize: 14,
    fontWeight: '600',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  trackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  trackStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackPlays: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  trackLikes: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  playButton: {
    padding: 8,
  },
  artistsList: {
    paddingHorizontal: 20,
  },
  artistItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 100,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistFollowers: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
});