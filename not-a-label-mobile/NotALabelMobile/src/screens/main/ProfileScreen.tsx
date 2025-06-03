import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logoutUser()) },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { id: 'profile-edit', title: 'Edit Profile', icon: 'person-outline', onPress: () => {} },
        { id: 'subscription', title: 'Subscription', icon: 'card-outline', onPress: () => {} },
        { id: 'privacy', title: 'Privacy Settings', icon: 'shield-outline', onPress: () => {} },
      ]
    },
    {
      title: 'Music',
      items: [
        { id: 'downloads', title: 'Downloaded Music', icon: 'download-outline', onPress: () => {} },
        { id: 'quality', title: 'Audio Quality', icon: 'musical-notes-outline', onPress: () => {} },
        { id: 'recommendations', title: 'Music Preferences', icon: 'heart-outline', onPress: () => {} },
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', onPress: () => {} },
        { id: 'feedback', title: 'Send Feedback', icon: 'chatbubble-outline', onPress: () => {} },
        { id: 'about', title: 'About', icon: 'information-circle-outline', onPress: () => {} },
      ]
    }
  ];

  if (user?.role === 'artist') {
    profileSections.splice(1, 0, {
      title: 'Artist Tools',
      items: [
        { id: 'analytics', title: 'Analytics', icon: 'bar-chart-outline', onPress: () => navigation.navigate('Analytics') },
        { id: 'upload', title: 'Upload Music', icon: 'cloud-upload-outline', onPress: () => navigation.navigate('Upload') },
        { id: 'profile-page', title: 'Your Artist Page', icon: 'person-circle-outline', onPress: () => {} },
      ]
    });
  }

  const renderSectionItem = (item: any) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={item.icon} size={24} color="#00ffaa" />
      </View>
      <Text style={styles.settingTitle}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ 
              uri: user?.profilePicture || 'https://via.placeholder.com/120' 
            }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          {user?.role === 'artist' && (
            <View style={styles.artistBadge}>
              <Ionicons name="musical-note" size={16} color="#000" />
              <Text style={styles.artistBadgeText}>Artist</Text>
            </View>
          )}

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {user?.role === 'artist' && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Tracks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Plays</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionsContainer}>
          {profileSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderSectionItem)}
              </View>
            </View>
          ))}

          <View style={styles.section}>
            <View style={styles.sectionContent}>
              <TouchableOpacity 
                style={[styles.settingItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name="log-out-outline" size={24} color="#ff4757" />
                </View>
                <Text style={[styles.settingTitle, styles.logoutText]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Not a Label v1.0.0</Text>
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
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#999',
    marginBottom: 12,
  },
  artistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ffaa',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
    gap: 4,
  },
  artistBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  editProfileButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ffaa',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  editProfileText: {
    color: '#00ffaa',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffaa',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
  },
  sectionsContainer: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#ff4757',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },
});