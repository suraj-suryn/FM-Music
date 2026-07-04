/**
 * useFilePicker.ts
 * Cross-platform file picker.
 *   Native: expo-document-picker (returns file URI usable by RNTP)
 *   Web:    HTML <input type="file"> (returns object URL for Howler.js)
 */
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import type { Track } from '../store/playerStore';

interface FilePickResult {
  tracks: Track[];
  cancelled: boolean;
}

export async function pickAudioFiles(): Promise<FilePickResult> {
  if (Platform.OS === 'web') {
    return pickWeb();
  }
  return pickNative();
}

// ---------------------------------------------------------------------------
// Native
// ---------------------------------------------------------------------------

async function pickNative(): Promise<FilePickResult> {
  const { getDocumentAsync } = await import('expo-document-picker');

  const result = await getDocumentAsync({
    type: 'audio/*',
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets) return { tracks: [], cancelled: true };

  const tracks: Track[] = result.assets.map((asset) => ({
    id: uuidv4(),
    url: asset.uri,
    title: stripExtension(asset.name),
    artist: 'Local File',
    duration: undefined,
    isLiveStream: false,
  }));

  return { tracks, cancelled: false };
}

// ---------------------------------------------------------------------------
// Web
// ---------------------------------------------------------------------------

function pickWeb(): Promise<FilePickResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;

    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) {
        resolve({ tracks: [], cancelled: true });
        return;
      }

      const tracks: Track[] = files.map((file) => ({
        id: uuidv4(),
        url: URL.createObjectURL(file),
        title: stripExtension(file.name),
        artist: 'Local File',
        duration: undefined,
        isLiveStream: false,
      }));

      resolve({ tracks, cancelled: false });
    };

    // Cancelled (dialog closed without selection)
    input.addEventListener('cancel', () => resolve({ tracks: [], cancelled: true }));

    input.click();
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, '');
}
