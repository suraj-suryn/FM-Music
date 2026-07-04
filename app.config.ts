import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FM App',
  slug: 'fm-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'musicroom',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#09090b',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.fmapp.musicplayer',
    infoPlist: {
      UIBackgroundModes: ['audio'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#09090b',
    },
    package: 'com.fmapp.musicplayer',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'musicroom' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
    name: 'FM App',
    themeColor: '#09090b',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'react-native-track-player',
      {
        enableBackgroundRemoteEvents: ['play', 'pause', 'stop', 'next', 'previous'],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:3001',
  },
});
