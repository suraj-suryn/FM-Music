/**
 * PlayerControls.tsx
 * Play/pause, prev/next, seek bar. Disabled for live streams.
 */
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, GestureResponderEvent } from 'react-native';
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
  const seekBarRef = useRef<View>(null);

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

  const handleSeek = (e: GestureResponderEvent) => {
    if (isLive || duration <= 0) return;
    seekBarRef.current?.measure((_x, _y, width, _h, pageX) => {
      const touchX = e.nativeEvent.pageX - pageX;
      const ratio = Math.max(0, Math.min(1, touchX / width));
      AudioService.seekTo(ratio * duration);
    });
  };

  const progressPct = duration > 0 ? `${Math.min(100, (progress / duration) * 100)}%` : '0%';

  return (
    <View className="w-full items-center">
      {/* Seek bar */}
      {!isLive && !compact && (
        <View className="w-full flex-row items-center gap-2 mb-3">
          <Text className="text-xs text-zinc-400 w-10 text-right">
            {formatTime(progress)}
          </Text>
          {/* Custom seek bar — works on web + native, no extra dependency */}
          <View
            ref={seekBarRef}
            className="flex-1 h-9 justify-center"
            onStartShouldSetResponder={() => !isLive}
            onResponderGrant={handleSeek}
            onResponderMove={handleSeek}
            accessibilityRole="adjustable"
            accessibilityLabel="Seek"
          >
            <View className="w-full h-1 rounded-full bg-zinc-700">
              <View
                style={{ width: progressPct }}
                className="h-full rounded-full bg-brand"
              />
            </View>
          </View>
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
