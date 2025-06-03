import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }: any) {
  const [settings, setSettings] = useState({
    notifications: true,
    autoPlay: true,
    highQuality: false,
    downloadOnWiFi: true,
    darkMode: true,
    analytics: true,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const settingSections = [
    {
      title: 'Playback',
      items: [
        {
          id: 'autoPlay',
          title: 'Auto-play',
          subtitle: 'Automatically play similar music when your music ends',
          type: 'switch',
          value: settings.autoPlay,
        },
        {
          id: 'highQuality',
          title: 'High Quality Audio',
          subtitle: 'Stream at 320kbps (uses more data)',
          type: 'switch',
          value: settings.highQuality,
        },
        {
          id: 'crossfade',
          title: 'Crossfade',
          subtitle: 'Seamless transitions between tracks',
          type: 'navigation',
          onPress: () => {},
        },
      ]
    },
    {
      title: 'Downloads',
      items: [
        {
          id: 'downloadOnWiFi',
          title: 'Download on Wi-Fi only',
          subtitle: 'Save mobile data by downloading only on Wi-Fi',
          type: 'switch',
          value: settings.downloadOnWiFi,
        },
        {
          id: 'downloadQuality',
          title: 'Download Quality',
          subtitle: 'Normal',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'storage',
          title: 'Storage',
          subtitle: 'Manage downloaded music',
          type: 'navigation',
          onPress: () => {},
        },
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Get notified about new releases and updates',
          type: 'switch',
          value: settings.notifications,
        },
        {
          id: 'newReleases',
          title: 'New Releases',
          subtitle: 'From artists you follow',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'concerts',
          title: 'Concerts',
          subtitle: 'Live events near you',
          type: 'navigation',
          onPress: () => {},
        },
      ]
    },
    {
      title: 'Privacy',
      items: [
        {
          id: 'analytics',
          title: 'Usage Analytics',
          subtitle: 'Help improve the app by sharing usage data',
          type: 'switch',
          value: settings.analytics,
        },
        {
          id: 'listening',
          title: 'Listening Activity',
          subtitle: 'Make your activity visible to followers',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'dataPrivacy',
          title: 'Data & Privacy',
          subtitle: 'Manage your data and privacy settings',
          type: 'navigation',
          onPress: () => {},
        },
      ]
    },
    {
      title: 'About',
      items: [
        {
          id: 'version',
          title: 'App Version',
          subtitle: '1.0.0',
          type: 'info',
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'licenses',
          title: 'Open Source Licenses',
          type: 'navigation',
          onPress: () => {},
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'contact',
          title: 'Contact Support',
          type: 'navigation',
          onPress: () => {},
        },
      ]
    },
    {
      title: 'Account',
      items: [
        {
          id: 'deleteAccount',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account and all data',
          type: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Account',
              'This action cannot be undone. All your data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {} },
              ]
            );
          },
        },
      ]
    }
  ];

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity 
        key={item.id}
        style={[
          styles.settingItem,
          item.type === 'destructive' && styles.destructiveItem
        ]}
        onPress={item.type === 'switch' ? () => toggleSetting(item.id) : item.onPress}
        disabled={item.type === 'info'}
      >
        <View style={styles.settingContent}>
          <Text style={[
            styles.settingTitle,
            item.type === 'destructive' && styles.destructiveText
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>

        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={() => toggleSetting(item.id)}
            trackColor={{ false: '#333', true: '#00ffaa' }}
            thumbColor={item.value ? '#fff' : '#999'}
          />
        )}

        {(item.type === 'navigation' || item.type === 'destructive') && (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={item.type === 'destructive' ? '#ff4757' : '#666'} 
          />
        )}
      </TouchableOpacity>
    );
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
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ♥ for independent artists
          </Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
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
  destructiveItem: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#999',
    lineHeight: 18,
  },
  destructiveText: {
    color: '#ff4757',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});