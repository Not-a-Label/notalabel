import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ArtistProfileScreen({ navigation, route }: any) {
  const { artistId } = route.params;
  const [activeTab, setActiveTab] = useState<'tracks' | 'about'>('tracks');

  // Mock artist data
  const artist = {
    id: artistId,
    username: 'Alex Rivers',
    displayName: 'Alex Rivers',
    profilePicture: 'https://via.placeholder.com/200',
    coverImage: 'https://via.placeholder.com/400x200',
    bio: 'Independent artist crafting dreamy indie pop from my home studio in Portland. Inspired by late-night city walks and conversations that last until sunrise.',
    genre: 'Indie Pop',
    location: 'Portland, OR',
    followerCount: 12534,
    followingCount: 189,
    trackCount: 23,
    isFollowing: false,
    isVerified: true,
    joinDate: '2022-03-15',
    socialLinks: {
      instagram: '@alexrivers',
      twitter: '@alexriversmusic',
      website: 'alexrivers.com',
    },
  };

  const tracks = [
    {
      id: '1',
      title: 'Summer Nights',
      coverUrl: 'https://via.placeholder.com/60',
      duration: 245,
      plays: 12534,
      likes: 3421,
      releaseDate: '2024-03-15',
    },
    {
      id: '2',
      title: 'City Dreams',
      coverUrl: 'https://via.placeholder.com/60',
      duration: 198,
      plays: 8921,
      likes: 2156,
      releaseDate: '2024-02-28',
    },
    {
      id: '3',
      title: 'Lost in Time',
      coverUrl: 'https://via.placeholder.com/60',
      duration: 267,
      plays: 7543,
      likes: 1890,
      releaseDate: '2024-01-20',
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
    });
  };

  const renderTrackItem = ({ item: track }: { item: any }) => (
    <TouchableOpacity 
      style={styles.trackItem}
      onPress={() => navigation.navigate('TrackDetail', { trackId: track.id })}
    >
      <Image 
        source={{ uri: track.coverUrl }}
        style={styles.trackImage}
      />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.trackDate}>
          Released {formatDate(track.releaseDate)}
        </Text>
        <View style={styles.trackStats}>
          <View style={styles.trackStat}>
            <Ionicons name="play" size={12} color="#999" />
            <Text style={styles.trackStatText}>{formatNumber(track.plays)}</Text>
          </View>
          <View style={styles.trackStat}>
            <Ionicons name="heart" size={12} color="#999" />
            <Text style={styles.trackStatText}>{formatNumber(track.likes)}</Text>
          </View>
          <View style={styles.trackStat}>
            <Ionicons name="time" size={12} color="#999" />
            <Text style={styles.trackStatText}>{formatTime(track.duration)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.playTrackButton}>
        <Ionicons name="play" size={16} color="#00ffaa" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: artist.coverImage }}
            style={styles.coverImage}
          />
          
          <View style={styles.profileInfo}>
            <Image 
              source={{ uri: artist.profilePicture }}
              style={styles.profileImage}
            />
            
            <View style={styles.artistDetails}>
              <View style={styles.nameContainer}>
                <Text style={styles.artistName}>{artist.displayName}</Text>
                {artist.isVerified && (
                  <Ionicons name="checkmark-circle" size={20} color="#00ffaa" />
                )}
              </View>
              
              <Text style={styles.artistGenre}>{artist.genre}</Text>
              <Text style={styles.artistLocation}>📍 {artist.location}</Text>
              
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatNumber(artist.followerCount)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatNumber(artist.followingCount)}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{artist.trackCount}</Text>
                  <Text style={styles.statLabel}>Tracks</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.followButton, artist.isFollowing && styles.followingButton]}
          >
            <Text style={[
              styles.followButtonText,
              artist.isFollowing && styles.followingButtonText
            ]}>
              {artist.isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
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
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'tracks' ? (
          <View style={styles.tracksSection}>
            <FlatList
              data={tracks}
              keyExtractor={(item) => item.id}
              renderItem={renderTrackItem}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.aboutSection}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.bioText}>{artist.bio}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Social Links</Text>
              <View style={styles.socialLinks}>
                <TouchableOpacity style={styles.socialLink}>
                  <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                  <Text style={styles.socialLinkText}>{artist.socialLinks.instagram}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialLink}>
                  <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                  <Text style={styles.socialLinkText}>{artist.socialLinks.twitter}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialLink}>
                  <Ionicons name="globe-outline" size={20} color="#00ffaa" />
                  <Text style={styles.socialLinkText}>{artist.socialLinks.website}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailsList}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Member since</Text>
                  <Text style={styles.detailValue}>{formatDate(artist.joinDate)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Genre</Text>
                  <Text style={styles.detailValue}>{artist.genre}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{artist.location}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  moreButton: {
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
  },
  profileInfo: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    borderWidth: 4,
    borderColor: '#000',
    marginBottom: 16,
  },
  artistDetails: {
    marginBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  artistGenre: {
    fontSize: 16,
    color: '#00ffaa',
    marginBottom: 4,
  },
  artistLocation: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#00ffaa',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ffaa',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  followingButtonText: {
    color: '#00ffaa',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
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
  tracksSection: {
    paddingBottom: 20,
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
  trackDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  trackStats: {
    flexDirection: 'row',
    gap: 12,
  },
  trackStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackStatText: {
    fontSize: 10,
    color: '#999',
  },
  playTrackButton: {
    padding: 12,
  },
  aboutSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  socialLinks: {
    gap: 12,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  socialLinkText: {
    fontSize: 16,
    color: '#fff',
  },
  detailsList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});