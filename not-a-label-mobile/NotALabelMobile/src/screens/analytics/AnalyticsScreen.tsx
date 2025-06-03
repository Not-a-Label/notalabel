import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }: any) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock analytics data
  const analyticsData = {
    totalPlays: 12534,
    totalLikes: 3421,
    totalFollowers: 892,
    totalRevenue: 234.56,
    topTracks: [
      { id: '1', title: 'Summer Nights', plays: 3421, likes: 892 },
      { id: '2', title: 'City Dreams', plays: 2134, likes: 567 },
      { id: '3', title: 'Lost in Time', plays: 1876, likes: 445 },
    ],
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 35 },
        { range: '25-34', percentage: 28 },
        { range: '35-44', percentage: 22 },
        { range: '45+', percentage: 15 },
      ],
      topCountries: [
        { country: 'United States', percentage: 42 },
        { country: 'United Kingdom', percentage: 18 },
        { country: 'Canada', percentage: 15 },
        { country: 'Australia', percentage: 12 },
        { country: 'Germany', percentage: 8 },
      ],
    },
    recentActivity: [
      { type: 'play', track: 'Summer Nights', count: 25, timeAgo: '2 hours ago' },
      { type: 'like', track: 'City Dreams', count: 12, timeAgo: '4 hours ago' },
      { type: 'follow', count: 3, timeAgo: '6 hours ago' },
    ],
  };

  const timeRanges = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '3 Months' },
    { key: '1y', label: '1 Year' },
  ];

  const StatCard = ({ title, value, subtitle, icon, color = '#00ffaa' }: any) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (user?.role !== 'artist') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedContainer}>
          <Ionicons name="bar-chart-outline" size={64} color="#333" />
          <Text style={styles.restrictedTitle}>Artist Analytics</Text>
          <Text style={styles.restrictedText}>
            Analytics are only available for artist accounts.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.timeRangeContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.key}
              style={[
                styles.timeRangeButton,
                timeRange === range.key && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(range.key as any)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range.key && styles.timeRangeTextActive
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Plays"
            value={formatNumber(analyticsData.totalPlays)}
            subtitle="+12% from last period"
            icon="play"
          />
          <StatCard
            title="Total Likes"
            value={formatNumber(analyticsData.totalLikes)}
            subtitle="+8% from last period"
            icon="heart"
            color="#ff4757"
          />
          <StatCard
            title="Followers"
            value={formatNumber(analyticsData.totalFollowers)}
            subtitle="+15% from last period"
            icon="people"
            color="#3742fa"
          />
          <StatCard
            title="Revenue"
            value={`$${analyticsData.totalRevenue}`}
            subtitle="+23% from last period"
            icon="cash"
            color="#2ed573"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Tracks</Text>
          <View style={styles.sectionContent}>
            {analyticsData.topTracks.map((track, index) => (
              <View key={track.id} style={styles.trackItem}>
                <View style={styles.trackRank}>
                  <Text style={styles.trackRankText}>{index + 1}</Text>
                </View>
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <View style={styles.trackStats}>
                    <View style={styles.trackStat}>
                      <Ionicons name="play" size={12} color="#999" />
                      <Text style={styles.trackStatText}>{formatNumber(track.plays)}</Text>
                    </View>
                    <View style={styles.trackStat}>
                      <Ionicons name="heart" size={12} color="#999" />
                      <Text style={styles.trackStatText}>{formatNumber(track.likes)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audience Demographics</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.subsectionTitle}>Age Groups</Text>
            {analyticsData.demographics.ageGroups.map((group) => (
              <View key={group.range} style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>{group.range}</Text>
                <View style={styles.demographicBar}>
                  <View 
                    style={[
                      styles.demographicFill, 
                      { width: `${group.percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.demographicPercentage}>{group.percentage}%</Text>
              </View>
            ))}

            <Text style={[styles.subsectionTitle, styles.subsectionTitleSpaced]}>
              Top Countries
            </Text>
            {analyticsData.demographics.topCountries.map((country) => (
              <View key={country.country} style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>{country.country}</Text>
                <View style={styles.demographicBar}>
                  <View 
                    style={[
                      styles.demographicFill, 
                      { width: `${country.percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.demographicPercentage}>{country.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.sectionContent}>
            {analyticsData.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons 
                    name={activity.type === 'play' ? 'play' : activity.type === 'like' ? 'heart' : 'person-add'} 
                    size={16} 
                    color="#00ffaa" 
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityText}>
                    {activity.track ? `${activity.count} ${activity.type}s on "${activity.track}"` : `${activity.count} new followers`}
                  </Text>
                  <Text style={styles.activityTime}>{activity.timeAgo}</Text>
                </View>
              </View>
            ))}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  moreButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: '#00ffaa',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  timeRangeTextActive: {
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#00ffaa',
    fontWeight: '500',
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  subsectionTitleSpaced: {
    marginTop: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  trackRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00ffaa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trackRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
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
    fontSize: 12,
    color: '#999',
  },
  demographicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demographicLabel: {
    fontSize: 14,
    color: '#fff',
    width: 80,
  },
  demographicBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  demographicFill: {
    height: '100%',
    backgroundColor: '#00ffaa',
    borderRadius: 4,
  },
  demographicPercentage: {
    fontSize: 12,
    color: '#999',
    width: 40,
    textAlign: 'right',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  restrictedText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
});