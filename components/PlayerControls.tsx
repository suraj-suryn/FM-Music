/**
 * PlayerControls.tsx
 * Play/pause, prev/next, seek bar. Disabled for live streams.
 */
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../store/playerStore';
import * as AudioService from '../services/audioService';

interface Props {
  isLive?: boolean;
  compact?: boolean;
}

export default function PlayerControls({ isLive = false, compact = false }: Props) {
  const playbackState = usePlayerStore((s) => s.playbackState);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';

  const togglePlay = () => {
    if (isPlaying) AudioService.pause();
    else AudioService.resume();
  };

  const formatTime = (secs: number) => {
    if (!isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View className="w-full items-center">
      {/* Seek bar */}
      {!isLive && !compact && (
        <View className="w-full flex-row items-center gap-2 mb-3">
          <Text className="text-xs text-zinc-400 w-10 text-right">
            {formatTime(progress)}
          </Text>
          <Slider
            style={{ flex: 1, height: 36 }}
            minimumValue={0}
            maximumValue={duration > 0 ? duration : 1}
            value={progress}
            onSlidingComplete={(val) => AudioService.seekTo(val)}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#3f3f46"
            thumbTintColor="#6366f1"
          />
          <Text className="text-xs text-zinc-400 w-10">
            {formatTime(duration)}
          </Text>
        </View>
      )}

      {/* Buttons */}
      <View className={`flex-row items-center ${compact ? 'gap-4' : 'gap-8'}`}>
        {!compact && (
          <TouchableOpacity
            onPress={() => AudioService.skipToPrevious()}
            className="p-2 rounded-full"
            accessibilityLabel="Previous track"
          >
            <Text className="text-white text-2xl">⏮</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={togglePlay}
          disabled={isLoading}
          className="w-14 h-14 rounded-full bg-brand items-center justify-center"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          <Text className="text-white text-2xl">
            {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {!compact && (
          <TouchableOpacity
            onPress={() => AudioService.skipToNext()}
            className="p-2 rounded-full"
            accessibilityLabel="Next track"
          >
            <Text className="text-white text-2xl">⏭</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLive && (
        <View className="mt-3 flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <Text className="text-red-400 text-xs font-semibold tracking-widest uppercase">
            Live
          </Text>
        </View>
      )}
    </View>
  );
}
