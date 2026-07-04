import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RadioStation {
  id: string;
  name: string;
  url: string;         // stream URL (ICEcast / SHOUTcast / HLS)
  genre?: string;
  country?: string;
  favicon?: string;    // station logo URL
}

// ---------------------------------------------------------------------------
// Default stations — 10 free, public-domain ICEcast / SHOUTcast streams
// ---------------------------------------------------------------------------

const DEFAULT_STATIONS: RadioStation[] = [
  { id: 'soma-groovesalad', name: 'SomaFM Groove Salad', url: 'https://ice1.somafm.com/groovesalad-256-mp3', genre: 'Ambient', country: 'US' },
  { id: 'soma-dronezone', name: 'SomaFM Drone Zone', url: 'https://ice1.somafm.com/dronezone-256-mp3', genre: 'Ambient', country: 'US' },
  { id: 'soma-jazz', name: 'SomaFM Lush', url: 'https://ice1.somafm.com/lush-128-mp3', genre: 'Jazz/Vocal', country: 'US' },
  { id: 'soma-indie', name: 'SomaFM Indie Pop Rocks', url: 'https://ice1.somafm.com/indiepop-128-mp3', genre: 'Indie', country: 'US' },
  { id: 'soma-metal', name: 'SomaFM Metal Detector', url: 'https://ice1.somafm.com/metal-128-mp3', genre: 'Metal', country: 'US' },
  { id: 'soma-lofi', name: 'SomaFM DEF CON Radio', url: 'https://ice1.somafm.com/defcon-128-mp3', genre: 'Electronic', country: 'US' },
  { id: 'soma-folk', name: 'SomaFM Folk Forward', url: 'https://ice1.somafm.com/folkfwd-128-mp3', genre: 'Folk', country: 'US' },
  { id: 'soma-country', name: 'SomaFM Boot Liquor', url: 'https://ice1.somafm.com/bootliquor-128-mp3', genre: 'Country/Americana', country: 'US' },
  { id: 'soma-left', name: 'SomaFM Left Coast 70s', url: 'https://ice1.somafm.com/seventies-128-mp3', genre: '70s', country: 'US' },
  { id: 'soma-christmas', name: 'SomaFM Christmas Lounge', url: 'https://ice1.somafm.com/christmas-128-mp3', genre: 'Holiday', country: 'US' },
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const storage =
  Platform.OS === 'web'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => AsyncStorage);

interface RadioState {
  stations: RadioStation[];
  addStation: (station: RadioStation) => void;
  removeStation: (id: string) => void;
  resetToDefaults: () => void;
}

export const useRadioStore = create<RadioState>()(
  persist(
    (set) => ({
      stations: DEFAULT_STATIONS,

      addStation: (station) =>
        set((state) => ({
          stations: state.stations.some((s) => s.id === station.id)
            ? state.stations
            : [...state.stations, station],
        })),

      removeStation: (id) =>
        set((state) => ({ stations: state.stations.filter((s) => s.id !== id) })),

      resetToDefaults: () => set({ stations: DEFAULT_STATIONS }),
    }),
    {
      name: 'fm-radio',
      storage,
    }
  )
);
