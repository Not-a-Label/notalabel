import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Track, Playlist } from '../../types';
import { Ionicons } from '@expo/vector-icons';

export default function LibraryScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'artists'>('tracks');
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Mock data for demonstration
  const likedTracks: Track[] = [];
  const playlists: Playlist[] = [];
  const followedArtists: any[] = [];

  const libraryData = [
    {
      title: 'Quick Access',
      data: [
        { id: 'liked', title: 'Liked Songs', icon: 'heart', color: '#ff4757', count: likedTracks.length },
        { id: 'recent', title: 'Recently Played', icon: 'time', color: '#3742fa', count: 0 },
        { id: 'downloaded', title: 'Downloaded', icon: 'download', color: '#2ed573', count: 0 },
      ]
    },
    {
      title: 'Made for You',
      data: [
        { id: 'discover', title: 'Discover Weekly', icon: 'compass', color: '#ff6b6b', count: 30 },
        { id: 'mix', title: 'Your Mix', icon: 'musical-notes', color: '#4834d4', count: 25 },
      ]
    }
  ];

  const renderQuickAccessItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.quickAccessItem}>
      <View style={[styles.quickAccessIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={24} color="#fff" />
      </View>
      <View style={styles.quickAccessInfo}>
        <Text style={styles.quickAccessTitle}>{item.title}</Text>
        <Text style={styles.quickAccessCount}>{item.count} songs</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  const renderTrackItem = ({ item }: { item: Track }) => (
    <TouchableOpacity style={styles.trackItem}>
      <Image 
        source={{ uri: item.coverUrl || 'https://via.placeholder.com/50' }}
        style={styles.trackImage}
      />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artistName}
        </Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity style={styles.playlistItem}>
      <View style={styles.playlistImage}>
        <Ionicons name="musical-notes" size={30} color="#666" />
      </View>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.playlistCount}>
          {item.trackCount} songs
        </Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.artistItem}>
      <Image 
        source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
        style={styles.artistImage}
      />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.username}
        </Text>
        <Text style={styles.artistFollowers}>
          {item.followerCount} followers
        </Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Following</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tracks':
        return (
          <SectionList
            sections={libraryData}
            keyExtractor={(item) => item.id}
            renderItem={renderQuickAccessItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              likedTracks.length > 0 ? (
                <View style={styles.tracksSection}>
                  <Text style={styles.sectionHeader}>Recent Tracks</Text>
                  <FlatList
                    data={likedTracks.slice(0, 10)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTrackItem}
                    scrollEnabled={false}
                  />
                </View>
              ) : null
            }
          />
        );
      
      case 'playlists':
        return (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={renderPlaylistItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="musical-notes-outline" size={64} color="#333" />
                <Text style={styles.emptyText}>No playlists yet</Text>
                <Text style={styles.emptySubtext}>
                  Create your first playlist to organize your music
                </Text>
                <TouchableOpacity style={styles.createButton}>
                  <Text style={styles.createButtonText}>Create Playlist</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      
      case 'artists':
        return (
          <FlatList
            data={followedArtists}
            keyExtractor={(item) => item.id}
            renderItem={renderArtistItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#333" />
                <Text style={styles.emptyText}>No followed artists</Text>
                <Text style={styles.emptySubtext}>
                  Follow artists to see them here
                </Text>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => navigation.navigate('Discover')}
                >
                  <Text style={styles.createButtonText}>Discover Artists</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tracks' && styles.activeTab]}
          onPress={() => setActiveTab('tracks')}
        >
          <Text style={[styles.tabText, activeTab === 'tracks' && styles.activeTabText]}>
            Music
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
          onPress={() => setActiveTab('playlists')}
        >
          <Text style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]}>
            Playlists
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

      {renderContent()}
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
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
  },
  list: {
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quickAccessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quickAccessIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  quickAccessInfo: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  quickAccessCount: {
    fontSize: 14,
    color: '#999',
  },
  tracksSection: {
    marginTop: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#333',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
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
  },
  moreButton: {
    padding: 8,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  playlistImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 14,
    color: '#999',
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    marginRight: 12,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  artistFollowers: {
    fontSize: 14,
    color: '#999',
  },
  followButton: {
    backgroundColor: '#00ffaa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
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
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#00ffaa',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});