import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Track } from './playerStore';

// ---------------------------------------------------------------------------
// Persist adapter — AsyncStorage on native, localStorage on web
// ---------------------------------------------------------------------------

const storage =
  Platform.OS === 'web'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => AsyncStorage);

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface LibraryState {
  tracks: Track[];
  addTrack: (track: Track) => void;
  addTracks: (tracks: Track[]) => void;
  removeTrack: (id: string) => void;
  clearLibrary: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      tracks: [],

      addTrack: (track) =>
        set((state) => ({
          tracks: state.tracks.some((t) => t.id === track.id)
            ? state.tracks
            : [...state.tracks, track],
        })),

      addTracks: (newTracks) =>
        set((state) => {
          const existingIds = new Set(state.tracks.map((t) => t.id));
          const unique = newTracks.filter((t) => !existingIds.has(t.id));
          return { tracks: [...state.tracks, ...unique] };
        }),

      removeTrack: (id) =>
        set((state) => ({ tracks: state.tracks.filter((t) => t.id !== id) })),

      clearLibrary: () => set({ tracks: [] }),
    }),
    {
      name: 'fm-library',
      storage,
    }
  )
);
