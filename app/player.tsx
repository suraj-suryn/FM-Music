/**
 * app/player.tsx
 * Full-screen player modal — opened by tapping the MiniPlayer.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../store/playerStore';
import PlayerControls from '../components/PlayerControls';
import { usePlayerProgress } from '../hooks/usePlayerProgress';

export default function PlayerModal() {
  const router = useRouter();
  usePlayerProgress();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const playbackState = usePlayerStore((s) => s.playbackState);

  if (!currentTrack) {
    router.back();
    return null;
  }

  const isLive = currentTrack.isLiveStream ?? false;

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top', 'bottom']}>
      {/* Drag handle / close button */}
      <View className="items-center pt-3 pb-2">
        <View className="w-10 h-1 rounded-full bg-zinc-700" />
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-10 right-5 z-10 p-2"
        accessibilityLabel="Close player"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text className="text-zinc-400 text-lg">✕</Text>
      </TouchableOpacity>

      <View className="flex-1 px-8 items-center justify-between py-6">
        {/* Artwork */}
        <View className="w-full aspect-square max-h-72 rounded-3xl overflow-hidden bg-surface-DEFAULT items-center justify-center shadow-2xl">
          {currentTrack.artwork ? (
            <Image
              source={{ uri: currentTrack.artwork }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Text className="text-8xl">{isLive ? '📻' : '🎵'}</Text>
          )}
        </View>

        {/* Track info */}
        <View className="w-full items-center gap-1">
          <Text className="text-white text-xl font-bold text-center" numberOfLines={2}>
            {currentTrack.title}
          </Text>
          <Text className="text-zinc-400 text-sm text-center">
            {currentTrack.artist ?? 'Unknown Artist'}
          </Text>
          {currentTrack.album && (
            <Text className="text-zinc-500 text-xs text-center">{currentTrack.album}</Text>
          )}
        </View>

        {/* Controls */}
        <View className="w-full">
          <PlayerControls isLive={isLive} />
        </View>
      </View>
    </SafeAreaView>
  );
}
