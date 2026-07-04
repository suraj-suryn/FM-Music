import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const storage =
  Platform.OS === 'web'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => AsyncStorage);

type ColorScheme = 'system' | 'dark' | 'light';

interface SettingsState {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      colorScheme: 'system',
      setColorScheme: (colorScheme) => set({ colorScheme }),
    }),
    { name: 'fm-settings', storage }
  )
);
