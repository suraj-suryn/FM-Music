/**
 * RoomCard.tsx
 * Shows the current broadcast room status (host or listener view).
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { RoomState } from '../store/roomStore';

interface Props {
  room: RoomState;
  role: 'host' | 'listener';
  listenerCount?: number;
  onStop?: () => void;
  onLeave?: () => void;
}

export default function RoomCard({ room, role, listenerCount = 0, onStop, onLeave }: Props) {
  return (
    <View className="bg-surface-DEFAULT border border-brand/40 rounded-2xl p-4 gap-3">
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <View className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <Text className="text-brand-light text-xs font-bold uppercase tracking-widest">
          {role === 'host' ? 'Broadcasting' : 'Listening'}
        </Text>
      </View>

      {/* Track info */}
      <Text className="text-white font-semibold text-base" numberOfLines={1}>
        {room.streamTitle}
      </Text>

      {/* Room ID */}
      <Text className="text-zinc-500 text-xs font-mono">Room · {room.roomId.slice(0, 8)}…</Text>

      {/* Listener count (host only) */}
      {role === 'host' && (
        <Text className="text-zinc-400 text-sm">
          👂 {listenerCount} {listenerCount === 1 ? 'listener' : 'listeners'}
        </Text>
      )}

      {/* Action button */}
      {role === 'host' && onStop && (
        <TouchableOpacity
          onPress={onStop}
          className="mt-1 py-2 px-4 rounded-xl bg-red-500/20 border border-red-500/40 items-center"
          accessibilityRole="button"
          accessibilityLabel="Stop broadcasting"
        >
          <Text className="text-red-400 font-semibold text-sm">Stop Broadcasting</Text>
        </TouchableOpacity>
      )}

      {role === 'listener' && onLeave && (
        <TouchableOpacity
          onPress={onLeave}
          className="mt-1 py-2 px-4 rounded-xl bg-zinc-700/50 border border-zinc-600 items-center"
          accessibilityRole="button"
          accessibilityLabel="Leave room"
        >
          <Text className="text-zinc-300 font-semibold text-sm">Leave Room</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
