/**
 * app/(tabs)/radio.tsx
 * Internet Radio screen — browse stations and play live streams.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { useRadioStore } from '../../store/radioStore';
import { usePlayerStore } from '../../store/playerStore';
import * as AudioService from '../../services/audioService';
import RadioCard from '../../components/RadioCard';
import type { RadioStation } from '../../store/radioStore';

export default function RadioScreen() {
  const stations = useRadioStore((s) => s.stations);
  const addStation = useRadioStore((s) => s.addStation);
  const removeStation = useRadioStore((s) => s.removeStation);
  const setCurrentTrack = usePlayerStore((s) => s.setCurrentTrack);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [genre, setGenre] = useState('');
  const [urlError, setUrlError] = useState('');

  const handlePlay = async (station: RadioStation) => {
    const track = {
      id: station.id,
      url: station.url,
      title: station.name,
      artist: station.genre ?? 'Internet Radio',
      artwork: station.favicon,
      isLiveStream: true,
    };
    setCurrentTrack(track);
    await AudioService.play(track);
  };

  const validateUrl = (raw: string): boolean => {
    try {
      const u = new URL(raw.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAddStation = () => {
    if (!name.trim()) { setUrlError('Station name is required.'); return; }
    if (!validateUrl(url)) { setUrlError('Enter a valid http/https stream URL.'); return; }
    addStation({ id: uuidv4(), name: name.trim(), url: url.trim(), genre: genre.trim() || undefined });
    setName(''); setUrl(''); setGenre(''); setUrlError('');
    setModalVisible(false);
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove station', 'Remove this station from your list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeStation(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">Radio</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="w-10 h-10 rounded-full bg-brand items-center justify-center"
          accessibilityLabel="Add radio station"
        >
          <Text className="text-white text-xl font-bold">+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stations}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <RadioCard
            station={item}
            onPress={() => handlePlay(item)}
            onRemove={() => handleRemove(item.id)}
          />
        )}
      />

      {/* Add Station Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-zinc-950"
        >
          <View className="flex-1 px-5 pt-6">
            <Text className="text-white text-xl font-bold mb-6">Add Station</Text>

            <Text className="text-zinc-400 text-xs mb-1 uppercase tracking-wider">Station Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Jazz FM"
              placeholderTextColor="#71717a"
              className="bg-surface-DEFAULT border border-surface-border rounded-xl px-4 py-3 text-white mb-4"
              autoCapitalize="words"
            />

            <Text className="text-zinc-400 text-xs mb-1 uppercase tracking-wider">Stream URL *</Text>
            <TextInput
              value={url}
              onChangeText={(v) => { setUrl(v); setUrlError(''); }}
              placeholder="https://stream.example.com/live.mp3"
              placeholderTextColor="#71717a"
              className="bg-surface-DEFAULT border border-surface-border rounded-xl px-4 py-3 text-white mb-1"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {urlError ? <Text className="text-red-400 text-xs mb-3">{urlError}</Text> : <View className="mb-4" />}

            <Text className="text-zinc-400 text-xs mb-1 uppercase tracking-wider">Genre (optional)</Text>
            <TextInput
              value={genre}
              onChangeText={setGenre}
              placeholder="e.g. Jazz"
              placeholderTextColor="#71717a"
              className="bg-surface-DEFAULT border border-surface-border rounded-xl px-4 py-3 text-white mb-6"
              autoCapitalize="words"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => { setModalVisible(false); setUrlError(''); }}
                className="flex-1 py-3 rounded-xl border border-surface-border items-center"
              >
                <Text className="text-zinc-300 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddStation}
                className="flex-1 py-3 rounded-xl bg-brand items-center"
              >
                <Text className="text-white font-semibold">Add Station</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
