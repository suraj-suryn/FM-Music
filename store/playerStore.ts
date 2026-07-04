import { create } from 'zustand';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Track {
  id: string;
  url: string;
  title: string;
  artist?: string;
  album?: string;
  artwork?: string;
  duration?: number;
  isLiveStream?: boolean;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  playbackState: PlaybackState;
  progress: number;       // seconds elapsed
  duration: number;       // seconds total (0 for live streams)
  volume: number;         // 0–1

  // Actions
  setCurrentTrack: (track: Track | null) => void;
  setQueue: (queue: Track[]) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  queue: [],
  playbackState: 'idle',
  progress: 0,
  duration: 0,
  volume: 1,

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setQueue: (queue) => set({ queue }),
  setPlaybackState: (playbackState) => set({ playbackState }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  reset: () =>
    set({ currentTrack: null, queue: [], playbackState: 'idle', progress: 0, duration: 0 }),
}));
