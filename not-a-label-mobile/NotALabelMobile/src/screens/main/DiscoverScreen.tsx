import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchTracks, fetchArtists } from '../../store/slices/musicSlice';
import { playTrack } from '../../store/slices/playerSlice';
import { Track, Artist } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function DiscoverScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists'>('tracks');
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();
  const { tracks, artists, isLoading } = useSelector(
    (state: RootState) => state.music
  );

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchTracks({ limit: 20 }));
    dispatch(fetchArtists({ limit: 20 }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePlayTrack = (track: Track) => {
    dispatch(playTrack({ track, queue: tracks }));
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
        <Text style={styles.trackTitle} numberOfLines={2}>
          {track.title}
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ArtistProfile', { artistId: track.artistId })}
        >
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artistName}
          </Text>
        </TouchableOpacity>
        <View style={styles.trackStats}>
          <View style={styles.statItem}>
            <Ionicons name="play" size={12} color="#999" />
            <Text style={styles.statText}>{track.plays}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={12} color="#999" />
            <Text style={styles.statText}>{track.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={12} color="#999" />
            <Text style={styles.statText}>
              {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => navigation.navigate('TrackDetail', { trackId: track.id })}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item: artist }: { item: Artist }) => (
    <TouchableOpacity 
      style={styles.artistItem}
      onPress={() => navigation.navigate('ArtistProfile', { artistId: artist.id })}
    >
      <Image 
        source={{ uri: artist.profilePicture || 'https://via.placeholder.com/60' }}
        style={styles.artistImage}
      />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>
          {artist.username}
        </Text>
        <Text style={styles.artistGenre} numberOfLines={1}>
          {artist.genre || 'Independent Artist'}
        </Text>
        <View style={styles.artistStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={12} color="#999" />
            <Text style={styles.statText}>{artist.followerCount} followers</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="musical-notes" size={12} color="#999" />
            <Text style={styles.statText}>{artist.trackCount || 0} tracks</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={[
          styles.followButton,
          artist.isFollowing && styles.followButtonActive
        ]}
      >
        <Text style={[
          styles.followButtonText,
          artist.isFollowing && styles.followButtonTextActive
        ]}>
          {artist.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
          onPress={() => setActiveTab('tracks')}
        >
          <Text style={[styles.tabText, activeTab === 'tracks' && styles.activeTabText]}>
            Tracks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'artists' && styles.activeTab]}
          onPress={() => setActiveTab('artists')}
        >
          <Text style={[styles.tabText, activeTab === 'artists' && styles.activeTabText]}>
            Artists
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'tracks' ? tracks : artists}
        keyExtractor={(item) => item.id}
        renderItem={activeTab === 'tracks' ? renderTrackItem : renderArtistItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00ffaa"
            colors={['#00ffaa']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={64} color="#333" />
            <Text style={styles.emptyText}>
              {activeTab === 'tracks' ? 'No tracks found' : 'No artists found'}
            </Text>
            <Text style={styles.emptySubtext}>
              Pull down to refresh or try searching
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#00ffaa',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
  },
  list: {
    paddingBottom: 100,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
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
    color: '#00ffaa',
    marginBottom: 6,
  },
  trackStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 8,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  artistGenre: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
  },
  artistStats: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ffaa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  followButtonActive: {
    backgroundColor: '#00ffaa',
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00ffaa',
  },
  followButtonTextActive: {
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});