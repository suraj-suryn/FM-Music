/**
 * TrackListItem.tsx
 * Single row in the local library list.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { Track } from '../store/playerStore';

interface Props {
  track: Track;
  isActive?: boolean;
  onPress: () => void;
  onRemove?: () => void;
}

export default function TrackListItem({ track, isActive, onPress, onRemove }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
        isActive ? 'bg-brand/20' : 'bg-transparent active:bg-surface-muted'
      }`}
      accessibilityRole="button"
      accessibilityLabel={`Play ${track.title}`}
    >
      {/* Artwork / placeholder */}
      {track.artwork ? (
        <Image source={{ uri: track.artwork }} className="w-12 h-12 rounded-lg" resizeMode="cover" />
      ) : (
        <View className="w-12 h-12 rounded-lg bg-surface-muted items-center justify-center">
          <Text className="text-2xl">🎵</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1 min-w-0">
        <Text
          className={`text-sm font-medium ${isActive ? 'text-brand-light' : 'text-white'}`}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text className="text-xs text-zinc-400" numberOfLines={1}>
          {track.artist ?? 'Unknown'}
        </Text>
      </View>

      {/* Remove button */}
      {onRemove && (
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-2"
          accessibilityLabel="Remove track"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-zinc-500 text-lg">✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
