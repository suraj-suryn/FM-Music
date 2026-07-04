/**
 * MiniPlayer.tsx
 * Persistent mini-player anchored above the tab bar.
 * Tapping it navigates to the full-screen player modal.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../store/playerStore';
import * as AudioService from '../services/audioService';
import PlayerControls from './PlayerControls';

export default function MiniPlayer() {
  const router = useRouter();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const playbackState = usePlayerStore((s) => s.playbackState);

  if (!currentTrack || playbackState === 'idle' || playbackState === 'stopped') {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={() => router.push('/player')}
      activeOpacity={0.95}
      className="mx-3 mb-2 px-4 py-3 rounded-2xl bg-surface-DEFAULT dark:bg-surface-DEFAULT border border-surface-border flex-row items-center gap-3"
      accessibilityLabel="Open full player"
      accessibilityRole="button"
    >
      {/* Artwork */}
      {currentTrack.artwork ? (
        <Image
          source={{ uri: currentTrack.artwork }}
          className="w-10 h-10 rounded-lg"
          resizeMode="cover"
        />
      ) : (
        <View className="w-10 h-10 rounded-lg bg-surface-muted items-center justify-center">
          <Text className="text-xl">🎵</Text>
        </View>
      )}

      {/* Track info */}
      <View className="flex-1 min-w-0">
        <Text
          className="text-white text-sm font-semibold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {currentTrack.title}
        </Text>
        <Text className="text-zinc-400 text-xs" numberOfLines={1}>
          {currentTrack.artist ?? 'Unknown artist'}
        </Text>
      </View>

      {/* Compact controls — stop propagation so taps don't open full player */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          if (playbackState === 'playing') AudioService.pause();
          else AudioService.resume();
        }}
        className="w-9 h-9 rounded-full bg-brand items-center justify-center"
        accessibilityLabel={playbackState === 'playing' ? 'Pause' : 'Play'}
      >
        <Text className="text-white text-base">
          {playbackState === 'playing' ? '⏸' : '▶'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
