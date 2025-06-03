# Not a Label Mobile App

## Status Overview

The Not a Label mobile app is a React Native/Expo application that provides artists and fans with mobile access to the platform. The app is partially implemented with core infrastructure in place.

### ✅ What's Already Implemented

1. **Core Setup**
   - React Native 0.79.2 with Expo SDK 53
   - TypeScript configuration
   - Redux Toolkit for state management
   - React Navigation for routing

2. **Authentication System**
   - Login/Register screens (partially implemented)
   - JWT token management with expo-secure-store
   - Auth state management in Redux

3. **Navigation Structure**
   - Bottom tab navigation (Home, Discover, Library, Profile)
   - Additional tabs for artists (Upload, Analytics)
   - Stack navigation for detailed screens

4. **API Integration**
   - Complete API service layer with axios
   - Automatic token attachment to requests
   - Error handling and token refresh logic
   - Backend URL: https://not-a-label.art/api

5. **Key Screens Started**
   - HomeScreen with featured tracks and trending artists
   - Basic layout for other main screens
   - Audio player component structure

6. **State Management**
   - Auth slice with login/register/logout actions
   - Music slice for tracks and artists
   - Player slice for audio playback state

### ❌ What Needs to Be Done

1. **Missing Dependencies**
   - Add @expo/vector-icons for icons
   - Add AsyncStorage for persistent data
   - Configure react-native-reanimated for animations

2. **Complete Screen Implementations**
   - Finish LoginScreen (only partially shown)
   - Implement RegisterScreen
   - Build out DiscoverScreen
   - Complete LibraryScreen
   - Implement ProfileScreen and SettingsScreen
   - Create UploadScreen for artists
   - Build AnalyticsScreen with charts

3. **Audio Player**
   - Complete AudioPlayer component implementation
   - Add player controls (play, pause, seek, skip)
   - Implement queue management
   - Add mini-player overlay

4. **Upload Functionality**
   - Implement track upload with expo-document-picker
   - Add metadata editing
   - Progress tracking for uploads

5. **Offline Support**
   - Implement track downloading
   - Local storage management
   - Offline playback

6. **Push Notifications**
   - Set up push notification service
   - Handle notification permissions
   - Implement notification handlers

7. **Testing**
   - Add Jest configuration
   - Write unit tests for components
   - Add integration tests for API calls

8. **Build Configuration**
   - Configure app icons and splash screens
   - Set up proper bundle identifiers
   - Configure build settings for iOS/Android

## Quick Start

### Prerequisites
```bash
# Install Node.js 18+ and npm
# Install Expo CLI globally (optional)
npm install -g expo-cli
```

### Development Setup
```bash
cd /Users/kentino/Not\ a\ Label/not-a-label-mobile/NotALabelMobile

# Install dependencies
npm install

# Install missing dependencies
npm install @expo/vector-icons @react-native-async-storage/async-storage

# Start the development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

### Environment Setup
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_API_URL=https://not-a-label.art/api
```

## Project Structure
```
NotALabelMobile/
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── assets/                # Images and icons
└── src/
    ├── components/        # Reusable components
    │   ├── common/       # Generic UI components
    │   └── player/       # Audio player components
    ├── navigation/        # Navigation configuration
    ├── screens/          # Screen components
    │   ├── auth/         # Login/Register screens
    │   ├── main/         # Main app screens
    │   ├── player/       # Full player screen
    │   └── upload/       # Upload screens
    ├── services/         # API and external services
    ├── store/            # Redux store setup
    │   └── slices/       # Redux slices
    ├── types/            # TypeScript type definitions
    └── utils/            # Utility functions
```

## Next Steps

1. **Fix Missing Dependencies**
   ```bash
   npm install @expo/vector-icons @react-native-async-storage/async-storage
   ```

2. **Complete Authentication Flow**
   - Finish LoginScreen implementation
   - Add form validation
   - Implement proper error handling
   - Add loading states

3. **Build Core Screens**
   - Start with DiscoverScreen for browsing music
   - Implement LibraryScreen for saved tracks
   - Build ProfileScreen with user info

4. **Implement Audio Playback**
   - Complete AudioPlayer component
   - Add playback controls
   - Implement background audio

5. **Testing**
   - Add basic component tests
   - Test authentication flow
   - Test API integration

## API Endpoints

The app connects to the Not a Label backend at `https://not-a-label.art/api`. Key endpoints:

- **Auth**: `/auth/login`, `/auth/register`
- **Music**: `/music/tracks`, `/music/upload`
- **Artists**: `/artists`, `/artists/:id`
- **Analytics**: `/analytics/overview`
- **Social**: `/social/follow/:artistId`

## Building for Production

### iOS
```bash
# Build for iOS
npx expo build:ios

# Or use EAS Build
npx eas build --platform ios
```

### Android
```bash
# Build for Android
npx expo build:android

# Or use EAS Build
npx eas build --platform android
```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper types to the types/ directory
4. Test on both iOS and Android
5. Follow React Native best practices

## Support

For issues or questions about the mobile app, refer to the main Not a Label documentation or contact the development team.