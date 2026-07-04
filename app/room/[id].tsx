/**
 * app/room/[id].tsx
 * Listener screen — join a broadcast room via deep link or shared URL.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { joinRoom, leaveRoom } from '../../services/roomService';
import { useRoomStore } from '../../store/roomStore';
import { useRoomSync } from '../../hooks/useRoomSync';
import RoomCard from '../../components/RoomCard';

type Status = 'connecting' | 'listening' | 'error' | 'ended';

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('connecting');
  const [errorMsg, setErrorMsg] = useState('');

  const activeRoom = useRoomStore((s) => s.activeRoom);
  const role = useRoomStore((s) => s.role);

  // Subscribe to live room state updates (playback sync)
  useRoomSync();

  useEffect(() => {
    if (!id) { setStatus('error'); setErrorMsg('Invalid room link.'); return; }

    joinRoom(id)
      .then(() => setStatus('listening'))
      .catch((err: Error) => {
        setStatus('error');
        setErrorMsg(err.message ?? 'Room not found or already ended.');
      });

    return () => {
      leaveRoom();
    };
  }, [id]);

  // Handle room:ended event from server
  useEffect(() => {
    if (status === 'listening' && !activeRoom) {
      setStatus('ended');
    }
  }, [activeRoom, status]);

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (status === 'connecting') {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center gap-4" edges={['top']}>
        <ActivityIndicator color="#6366f1" size="large" />
        <Text className="text-zinc-400">Joining room…</Text>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center px-8 gap-6" edges={['top']}>
        <Text className="text-4xl">😕</Text>
        <Text className="text-white text-xl font-bold text-center">Room Not Found</Text>
        <Text className="text-zinc-400 text-center">{errorMsg}</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/radio')}
          className="px-6 py-3 rounded-xl bg-brand"
        >
          <Text className="text-white font-semibold">Go to Radio</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (status === 'ended') {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950 items-center justify-center px-8 gap-6" edges={['top']}>
        <Text className="text-4xl">👋</Text>
        <Text className="text-white text-xl font-bold text-center">Session Ended</Text>
        <Text className="text-zinc-400 text-center">The host ended this broadcast.</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/radio')}
          className="px-6 py-3 rounded-xl bg-brand"
        >
          <Text className="text-white font-semibold">Back to Radio</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // status === 'listening'
  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      {/* Back button */}
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2"
          accessibilityLabel="Go back"
        >
          <Text className="text-zinc-400 text-base">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Listening</Text>
      </View>

      <View className="flex-1 px-5 pt-4 gap-6">
        {activeRoom && role === 'listener' && (
          <RoomCard
            room={activeRoom}
            role="listener"
            onLeave={() => {
              leaveRoom();
              router.replace('/(tabs)/radio');
            }}
          />
        )}

        <View className="items-center gap-3 py-6">
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-red-500" />
            <Text className="text-red-400 text-sm font-bold uppercase tracking-widest">Live</Text>
          </View>
          <Text className="text-zinc-400 text-sm text-center">
            You are synced to the host's stream.{'\n'}Controls are read-only while listening.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
