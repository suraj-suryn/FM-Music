/**
 * RadioCard.tsx
 * Card for a single radio station.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import type { RadioStation } from '../store/radioStore';
import { usePlayerStore } from '../store/playerStore';

interface Props {
  station: RadioStation;
  onPress: () => void;
  onRemove?: () => void;
}

export default function RadioCard({ station, onPress, onRemove }: Props) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isActive = currentTrack?.id === station.id;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3 rounded-2xl mb-2 border ${
        isActive
          ? 'bg-brand/20 border-brand'
          : 'bg-surface-DEFAULT border-surface-border active:bg-surface-muted'
      }`}
      accessibilityRole="button"
      accessibilityLabel={`Play ${station.name}`}
    >
      {/* Logo */}
      {station.favicon ? (
        <Image source={{ uri: station.favicon }} className="w-12 h-12 rounded-xl" resizeMode="cover" />
      ) : (
        <View className="w-12 h-12 rounded-xl bg-surface-muted items-center justify-center">
          <Text className="text-2xl">📻</Text>
        </View>
      )}

      {/* Info */}
      <View className="flex-1 min-w-0">
        <Text
          className={`text-sm font-semibold ${isActive ? 'text-brand-light' : 'text-white'}`}
          numberOfLines={1}
        >
          {station.name}
        </Text>
        <View className="flex-row items-center gap-2 mt-0.5">
          {station.genre && (
            <Text className="text-xs text-zinc-400">{station.genre}</Text>
          )}
          {station.country && (
            <Text className="text-xs text-zinc-500">· {station.country}</Text>
          )}
        </View>
      </View>

      {/* Live badge */}
      {isActive && (
        <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-red-500/20">
          <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <Text className="text-red-400 text-xs font-bold">LIVE</Text>
        </View>
      )}

      {/* Remove */}
      {onRemove && (
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Remove station"
        >
          <Text className="text-zinc-500">✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
