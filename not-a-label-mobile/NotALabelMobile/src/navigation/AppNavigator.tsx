// App Navigator for Not a Label Mobile App

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { NavigationParams } from '../types';

// Import screens (we'll create these next)
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/main/HomeScreen';
import DiscoverScreen from '../screens/main/DiscoverScreen';
import LibraryScreen from '../screens/main/LibraryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import PlayerScreen from '../screens/player/PlayerScreen';
import SearchScreen from '../screens/main/SearchScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import TrackDetailScreen from '../screens/track/TrackDetailScreen';
import ArtistProfileScreen from '../screens/artist/ArtistProfileScreen';
import UploadScreen from '../screens/upload/UploadScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';

// Icon imports (placeholder - will need actual icons)
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator<NavigationParams>();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isArtist = user?.role === 'artist';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Discover':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Library':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'Upload':
              iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00ffaa',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
        },
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      {isArtist && (
        <>
          <Tab.Screen name="Upload" component={UploadScreen} />
          <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        </>
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Stack
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Player" 
        component={PlayerScreen} 
        options={{ 
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="TrackDetail" 
        component={TrackDetailScreen}
        options={{ 
          title: 'Track Details',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="ArtistProfile" 
        component={ArtistProfileScreen}
        options={{ 
          title: 'Artist Profile',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{ 
          title: 'Search',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    // You can return a loading screen component here
    return null;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}