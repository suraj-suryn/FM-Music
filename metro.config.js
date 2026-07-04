const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// On web: mock RNTP (uses Howler.js instead) and react-native-worklets
// (bundled inside reanimated on native, not needed on web).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (
      moduleName === 'react-native-track-player' ||
      moduleName.startsWith('react-native-track-player/') ||
      moduleName === 'react-native-worklets' ||
      moduleName.startsWith('react-native-worklets/')
    ) {
      return { type: 'empty' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
