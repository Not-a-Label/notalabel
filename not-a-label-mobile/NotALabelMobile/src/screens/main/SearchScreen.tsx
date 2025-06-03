import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { searchMusic, clearSearchResults } from '../../store/slices/musicSlice';
import { playTrack } from '../../store/slices/playerSlice';
import { Track, Artist } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'artists'>('all');
  const [recentSearches] = useState<string[]>([
    'indie rock',
    'electronic',
    'jazz fusion',
    'ambient',
  ]);

  const dispatch = useDispatch();
  const { searchResults, isLoading } = useSelector(
    (state: RootState) => state.music
  );

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  useEffect(() => {
    if (query.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        dispatch(searchMusic({ query: query.trim(), type: activeTab }));
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      dispatch(clearSearchResults());
    }
  }, [query, activeTab, dispatch]);

  const handlePlayTrack = (track: Track) => {
    dispatch(playTrack({ track, queue: searchResults.tracks }));
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const renderTrackItem = ({ item: track }: { item: Track }) => (
    <TouchableOpacity 
      style={styles.searchItem}
      onPress={() => handlePlayTrack(track)}
    >
      <Image 
        source={{ uri: track.coverUrl || 'https://via.placeholder.com/50' }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          Track • {track.artistName}
        </Text>
        <View style={styles.itemStats}>
          <Ionicons name="play" size={10} color="#999" />
          <Text style={styles.itemStat}>{track.plays}</Text>
          <Ionicons name="heart" size={10} color="#999" style={{ marginLeft: 8 }} />
          <Text style={styles.itemStat}>{track.likes}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={16} color="#00ffaa" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item: artist }: { item: Artist }) => (
    <TouchableOpacity 
      style={styles.searchItem}
      onPress={() => navigation.navigate('ArtistProfile', { artistId: artist.id })}
    >
      <Image 
        source={{ uri: artist.profilePicture || 'https://via.placeholder.com/50' }}
        style={[styles.itemImage, styles.artistImage]}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {artist.username}
        </Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          Artist • {artist.followerCount} followers
        </Text>
        <Text style={styles.itemGenre} numberOfLines={1}>
          {artist.genre || 'Independent'}
        </Text>
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

  const renderRecentSearchItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.recentItem}
      onPress={() => handleRecentSearch(item)}
    >
      <Ionicons name="time" size={20} color="#666" />
      <Text style={styles.recentText}>{item}</Text>
      <Ionicons name="arrow-up" size={16} color="#666" />
    </TouchableOpacity>
  );

  const getSearchData = () => {
    if (activeTab === 'tracks') {
      return searchResults.tracks;
    } else if (activeTab === 'artists') {
      return searchResults.artists;
    } else {
      // Combine tracks and artists for 'all' tab
      return [
        ...searchResults.tracks.map(item => ({ ...item, type: 'track' })),
        ...searchResults.artists.map(item => ({ ...item, type: 'artist' })),
      ];
    }
  };

  const renderSearchItem = ({ item }: { item: any }) => {
    if (item.type === 'artist' || (!item.type && item.username)) {
      return renderArtistItem({ item });
    } else {
      return renderTrackItem({ item });
    }
  };

  const hasSearchResults = searchResults.tracks.length > 0 || searchResults.artists.length > 0;
  const showRecentSearches = !query.trim() && !hasSearchResults;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for tracks, artists..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {query.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim().length > 0 && (
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          
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
      )}

      {showRecentSearches ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => `recent-${index}`}
            renderItem={renderRecentSearchItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <FlatList
          data={getSearchData()}
          keyExtractor={(item) => `${item.type || 'track'}-${item.id}`}
          renderItem={renderSearchItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            query.trim().length > 2 && !isLoading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={64} color="#333" />
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                  Try different keywords or check spelling
                </Text>
              </View>
            ) : null
          }
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    height: '100%',
  },
  clearButton: {
    marginLeft: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  list: {
    paddingBottom: 100,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#333',
    marginRight: 12,
  },
  artistImage: {
    borderRadius: 25,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  itemGenre: {
    fontSize: 12,
    color: '#666',
  },
  itemStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemStat: {
    fontSize: 10,
    color: '#999',
    marginLeft: 4,
  },
  playButton: {
    padding: 12,
  },
  followButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ffaa',
    borderRadius: 16,
    paddingHorizontal: 12,
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
    alignItems: 'center',
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