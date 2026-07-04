/**
 * app/_layout.tsx
 * Root layout — initialises the audio player, registers the RNTP service,
 * and renders the persistent MiniPlayer above the tab bar on every screen.
 */
import '../global.css';

import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';

// Keep splash visible until fonts + player are ready
SplashScreen.preventAutoHideAsync();

// ---------------------------------------------------------------------------
// RNTP service registration (native only)
// ---------------------------------------------------------------------------
if (Platform.OS !== 'web') {
  const TrackPlayer = require('react-native-track-player').default;
  const { PlaybackService } = require('../services/audioService');
  TrackPlayer.registerPlaybackService(() => PlaybackService);
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  // Setup audio player
  useEffect(() => {
    (async () => {
      try {
        const { setupPlayer } = await import('../services/audioService');
        await setupPlayer();
      } catch (e) {
        console.warn('[FM App] Audio setup error:', e);
      } finally {
        SplashScreen.hideAsync();
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#09090b' },
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="player"
            options={{
              presentation: 'modal',
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="room/[id]"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
