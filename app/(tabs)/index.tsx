/**
 * app/(tabs)/index.tsx
 * Local Library screen — browse & play locally-picked audio files.
 */
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { pickAudioFiles } from '../../hooks/useFilePicker';
import * as AudioService from '../../services/audioService';
import TrackListItem from '../../components/TrackListItem';
import { usePlayerProgress } from '../../hooks/usePlayerProgress';
import type { Track } from '../../store/playerStore';

export default function LibraryScreen() {
  usePlayerProgress();

  const tracks = useLibraryStore((s) => s.tracks);
  const addTracks = useLibraryStore((s) => s.addTracks);
  const removeTrack = useLibraryStore((s) => s.removeTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const setQueue = usePlayerStore((s) => s.setQueue);
  const setCurrentTrack = usePlayerStore((s) => s.setCurrentTrack);

  const handleAddFiles = async () => {
    const { tracks: picked, cancelled } = await pickAudioFiles();
    if (!cancelled && picked.length > 0) {
      addTracks(picked);
    }
  };

  const handlePlay = async (track: Track, index: number) => {
    const queue = tracks.slice(index);
    setQueue(queue);
    setCurrentTrack(track);
    await AudioService.setQueue(queue);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">Library</Text>
        <TouchableOpacity
          onPress={handleAddFiles}
          className="w-10 h-10 rounded-full bg-brand items-center justify-center"
          accessibilityLabel="Add audio files"
        >
          <Text className="text-white text-xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      {tracks.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 px-10">
          <Text className="text-5xl">🎵</Text>
          <Text className="text-zinc-400 text-center text-base">
            Your library is empty.{'\n'}Tap + to add audio files from your device.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
          renderItem={({ item, index }) => (
            <TrackListItem
              track={item}
              isActive={currentTrack?.id === item.id}
              onPress={() => handlePlay(item, index)}
              onRemove={() => removeTrack(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
