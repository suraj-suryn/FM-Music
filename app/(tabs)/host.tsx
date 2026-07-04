/**
 * app/(tabs)/host.tsx
 * Host screen — start/stop a broadcast room for the currently playing live station.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { usePlayerStore } from '../../store/playerStore';
import { useRoomStore } from '../../store/roomStore';
import { getSocket } from '../../services/socketService';
import { createRoom, leaveRoom } from '../../services/roomService';
import RoomCard from '../../components/RoomCard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildShareUrl(roomId: string): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/room/${roomId}`;
  }
  return `musicroom://room/${roomId}`;
}

export default function HostScreen() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const playbackState = usePlayerStore((s) => s.playbackState);

  const activeRoom = useRoomStore((s) => s.activeRoom);
  const role = useRoomStore((s) => s.role);
  const listenerCount = useRoomStore((s) => s.listenerCount);
  const setListenerCount = useRoomStore((s) => s.setListenerCount);

  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  const canBroadcast =
    currentTrack !== null &&
    currentTrack.isLiveStream === true &&
    (playbackState === 'playing' || playbackState === 'loading');

  // Subscribe to listener count updates from server
  useEffect(() => {
    const socket = getSocket();
    const handler = ({ count }: { count: number }) => setListenerCount(count);
    socket.on('room:listenerCount', handler);
    return () => { socket.off('room:listenerCount', handler); };
  }, [setListenerCount]);

  const handleStart = async () => {
    if (!currentTrack) return;
    setIsStarting(true);
    try {
      await createRoom(
        currentTrack.url,
        currentTrack.title,
        currentTrack.artwork
      );
    } catch (err) {
      Alert.alert('Error', 'Could not create room. Is the server reachable?');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = () => {
    Alert.alert('Stop Broadcasting', 'All listeners will be disconnected.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Stop',
        style: 'destructive',
        onPress: () => leaveRoom(),
      },
    ]);
  };

  const handleShare = async () => {
    if (!activeRoom) return;
    const url = buildShareUrl(activeRoom.roomId);
    try {
      if (Platform.OS === 'web') {
        await Clipboard.setStringAsync(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        await Share.share({ message: `Join my radio room: ${url}`, url });
      }
    } catch {
      // user dismissed share sheet — ignore
    }
  };

  // ---------------------------------------------------------------------------
  // Render: active room
  // ---------------------------------------------------------------------------

  if (activeRoom && role === 'host') {
    const shareUrl = buildShareUrl(activeRoom.roomId);
    return (
      <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
        <View className="px-5 pt-4 pb-3">
          <Text className="text-white text-2xl font-bold">Host</Text>
        </View>

        <View className="flex-1 px-5 gap-5">
          <RoomCard
            room={activeRoom}
            role="host"
            listenerCount={listenerCount}
            onStop={handleStop}
          />

          {/* Share link */}
          <View className="gap-2">
            <Text className="text-zinc-400 text-xs uppercase tracking-wider">Share link</Text>
            <View className="bg-surface-DEFAULT border border-surface-border rounded-xl px-4 py-3 flex-row items-center gap-3">
              <Text
                className="flex-1 text-zinc-300 text-sm font-mono"
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {shareUrl}
              </Text>
              <TouchableOpacity
                onPress={handleShare}
                className="px-3 py-1.5 rounded-lg bg-brand/20 border border-brand/40"
                accessibilityLabel="Copy share link"
              >
                <Text className="text-brand-light text-xs font-semibold">
                  {copied ? '✓ Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-zinc-500 text-xs">
              Anyone with this link can listen to the same station in sync.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: idle / no active room
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-white text-2xl font-bold">Host</Text>
      </View>

      <View className="flex-1 items-center justify-center px-8 gap-6">
        <Text className="text-5xl">🎙</Text>

        <View className="items-center gap-2">
          <Text className="text-white text-xl font-bold text-center">
            Broadcast a Station
          </Text>
          <Text className="text-zinc-400 text-center text-sm leading-relaxed">
            Play a live radio station on the Radio tab, then come here to start
            broadcasting. Your listeners will hear the same stream in sync.
          </Text>
        </View>

        {canBroadcast ? (
          <TouchableOpacity
            onPress={handleStart}
            disabled={isStarting}
            className="w-full py-4 rounded-2xl bg-brand items-center"
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-base">
              {isStarting ? 'Starting…' : `Broadcast "${currentTrack!.title}"`}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-full py-4 rounded-2xl border border-surface-border items-center">
            <Text className="text-zinc-500 text-sm">
              Play a live station first to enable broadcasting
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
