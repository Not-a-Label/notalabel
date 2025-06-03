// Main App Component for Not a Label Mobile

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { loadUser } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';
import AudioPlayer from './src/components/player/AudioPlayer';
import { StyleSheet } from 'react-native';

// App initialization component
function AppInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load user from secure storage on app start
    dispatch(loadUser() as any);
  }, [dispatch]);

  return (
    <>
      <AppNavigator />
      {/* Global audio player overlay */}
      <AudioPlayer />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <StatusBar style="light" backgroundColor="#1a1a1a" />
          <AppInitializer />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});