import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TrackDetailScreen({ navigation, route }: any) {
  const { trackId } = route.params;

  // Mock track data
  const track = {
    id: trackId,
    title: 'Summer Nights',
    artistName: 'Alex Rivers',
    artistId: '1',
    coverUrl: 'https://via.placeholder.com/300',
    duration: 245,
    plays: 12534,
    likes: 3421,
    isLiked: false,
    releaseDate: '2024-03-15',
    genre: 'Indie Pop',
    description: 'A dreamy indie pop track about those perfect summer evenings when time seems to stand still. Written during a late-night session in my home studio.',
    tags: ['indie', 'summer', 'chill', 'dreamy'],
    bpm: 124,
    key: 'C Major',
    lyrics: `[Verse 1]
Walking down these empty streets tonight
City lights are dancing in your eyes
Summer breeze is whispering our name
Nothing here will ever be the same

[Chorus]
These summer nights
They feel so right
When you're here with me
Under starlit skies
Time just flies
This is where we're meant to be

[Verse 2]
Every moment feels like destiny
You and I were made for nights like these
Hold me close and never let me go
In this moment, this is all I know

[Chorus]
These summer nights
They feel so right
When you're here with me
Under starlit skies
Time just flies
This is where we're meant to be`,
  };

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
      month: 'long', 
      day: 'numeric' 
    });
  };

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
        <View style={styles.trackHeader}>
          <Image 
            source={{ uri: track.coverUrl }}
            style={styles.coverImage}
          />
          
          <View style={styles.trackInfo}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ArtistProfile', { artistId: track.artistId })}
            >
              <Text style={styles.artistName}>{track.artistName}</Text>
            </TouchableOpacity>
            
            <View style={styles.trackStats}>
              <View style={styles.statItem}>
                <Ionicons name="play" size={16} color="#999" />
                <Text style={styles.statText}>{formatNumber(track.plays)}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={16} color="#999" />
                <Text style={styles.statText}>{formatNumber(track.likes)}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color="#999" />
                <Text style={styles.statText}>{formatTime(track.duration)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={24} color="#000" />
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons 
              name={track.isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={track.isLiked ? "#ff4757" : "#fff"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Track Details</Text>
          <View style={styles.sectionContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Release Date</Text>
              <Text style={styles.detailValue}>{formatDate(track.releaseDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Genre</Text>
              <Text style={styles.detailValue}>{track.genre}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>BPM</Text>
              <Text style={styles.detailValue}>{track.bpm}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Key</Text>
              <Text style={styles.detailValue}>{track.key}</Text>
            </View>
          </View>
        </View>

        {track.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.descriptionText}>{track.description}</Text>
            </View>
          </View>
        )}

        {track.tags && track.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {track.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {track.lyrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lyrics</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.lyricsText}>{track.lyrics}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <View style={styles.sectionContent}>
            <View style={styles.creditRow}>
              <Text style={styles.creditRole}>Artist</Text>
              <Text style={styles.creditName}>{track.artistName}</Text>
            </View>
            <View style={styles.creditRow}>
              <Text style={styles.creditRole}>Producer</Text>
              <Text style={styles.creditName}>{track.artistName}</Text>
            </View>
            <View style={styles.creditRow}>
              <Text style={styles.creditRole}>Songwriter</Text>
              <Text style={styles.creditName}>{track.artistName}</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  trackHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  coverImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    backgroundColor: '#333',
    marginBottom: 20,
  },
  trackInfo: {
    alignItems: 'center',
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
    color: '#00ffaa',
    marginBottom: 16,
  },
  trackStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  playButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ffaa',
    borderRadius: 25,
    paddingVertical: 12,
    gap: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
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
  descriptionText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
  },
  tag: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#00ffaa',
    fontWeight: '500',
  },
  lyricsText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  creditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  creditRole: {
    fontSize: 14,
    color: '#999',
  },
  creditName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});