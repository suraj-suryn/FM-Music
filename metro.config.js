const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// On web, RNTP is not used (Howler.js handles audio via audioService.web.ts).
// Return an empty module so Metro doesn't try to bundle shaka-player.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    (moduleName === 'react-native-track-player' ||
      moduleName.startsWith('react-native-track-player/'))
  ) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
