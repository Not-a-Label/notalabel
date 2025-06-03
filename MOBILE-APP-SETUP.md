# 📱 Not a Label Mobile App Setup Guide

## 🚀 Quick Start

### 1. Navigate to Mobile App Directory
```bash
cd "/Users/kentino/Not a Label/not-a-label-mobile/NotALabelMobile"
```

### 2. Install Dependencies (Already Done ✅)
```bash
npm install
```

### 3. Start Development Server
```bash
npx expo start
```

This will open Expo Dev Tools in your browser.

## 📲 Testing Options

### Option 1: Expo Go App (Easiest)
1. Download "Expo Go" from App Store (iOS) or Play Store (Android)
2. Scan the QR code from Expo Dev Tools
3. App will load on your phone

### Option 2: iOS Simulator (Mac only)
```bash
npm run ios
```

### Option 3: Android Emulator
```bash
npm run android
```

### Option 4: Web Browser (Limited)
```bash
npm run web
```

## 🎨 App Features

### For All Users:
- ✅ User authentication (login/register)
- ✅ Browse and discover music
- ✅ Play tracks with built-in player
- ✅ Create playlists
- ✅ Follow artists
- ✅ View analytics

### For Artists:
- ✅ Upload tracks directly from phone
- ✅ View real-time analytics
- ✅ Manage profile
- ✅ Interact with fans

## 🔧 Configuration

### API Connection
The app is configured to connect to your live platform:
- API URL: `https://not-a-label.art/api`
- WebSocket: `wss://not-a-label.art`

### Environment Setup
Create `.env` file in mobile app directory:
```
EXPO_PUBLIC_API_URL=https://not-a-label.art/api
EXPO_PUBLIC_WS_URL=wss://not-a-label.art
```

## 📦 Building for Production

### iOS App Store
```bash
npx expo prebuild --platform ios
npx expo run:ios --configuration Release
```

### Android Play Store
```bash
npx expo prebuild --platform android
npx expo run:android --variant release
```

### Over-the-Air Updates
```bash
npx expo publish
```

## 🎯 Next Steps

1. **Test Core Features**
   - Login with test account
   - Browse music
   - Play tracks
   - Upload content (artists)

2. **Customize Branding**
   - Update colors in theme
   - Add app icon
   - Create splash screen

3. **Add Premium Features**
   - Offline downloads
   - Push notifications
   - Social sharing
   - In-app purchases

## 🐛 Troubleshooting

### "Metro bundler not found"
```bash
npx expo start --clear
```

### "Module not found" errors
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### iOS Simulator issues
```bash
sudo xcode-select --reset
```

## 📊 Mobile Analytics

Track mobile app usage:
- User sessions
- Screen views
- Feature usage
- Crash reports

## 🔐 Security

The mobile app includes:
- Secure token storage
- API authentication
- SSL pinning (optional)
- Biometric login (optional)

---

## 🎉 Ready to Test!

Run `npx expo start` and scan the QR code with your phone to see your mobile app in action!