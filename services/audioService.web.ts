/**
 * audioService.web.ts
 * Web implementation — backed by Howler.js + Media Session API.
 * Background tab audio: Web Audio API keeps playing when tab is inactive.
 * Lock-screen / media keys: navigator.mediaSession.
 */
import { Howl, Howler } from 'howler';
import type { Track } from '../store/playerStore';
import { usePlayerStore } from '../store/playerStore';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let _howl: Howl | null = null;
let _currentTrack: Track | null = null;

// ---------------------------------------------------------------------------
// Media Session helpers
// ---------------------------------------------------------------------------

function updateMediaSession(track: Track) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist ?? 'Unknown',
    album: track.album ?? '',
    artwork: track.artwork ? [{ src: track.artwork, sizes: '512x512', type: 'image/jpeg' }] : [],
  });
  navigator.mediaSession.setActionHandler('play', () => resume());
  navigator.mediaSession.setActionHandler('pause', () => pause());
  navigator.mediaSession.setActionHandler('stop', () => stop());
  navigator.mediaSession.setActionHandler('nexttrack', () => skipToNext());
  navigator.mediaSession.setActionHandler('previoustrack', () => skipToPrevious());
  if (!track.isLiveStream) {
    navigator.mediaSession.setActionHandler('seekto', (d) => {
      if (d.seekTime != null) seekTo(d.seekTime);
    });
  }
}

// ---------------------------------------------------------------------------
// Internal: sync playback events → zustand store
// ---------------------------------------------------------------------------

function attachHowlListeners(howl: Howl) {
  const store = usePlayerStore.getState();
  howl.on('play', () => {
    store.setPlaybackState('playing');
    if (_currentTrack) updateMediaSession(_currentTrack);
  });
  howl.on('pause', () => store.setPlaybackState('paused'));
  howl.on('stop', () => store.setPlaybackState('stopped'));
  howl.on('end', () => store.setPlaybackState('idle'));
  howl.on('loaderror', () => store.setPlaybackState('error'));
  howl.on('playerror', () => store.setPlaybackState('error'));
  howl.on('load', () => {
    const dur = howl.duration();
    if (dur && isFinite(dur)) store.setDuration(dur);
  });
}

// ---------------------------------------------------------------------------
// Progress polling (every 500 ms while playing)
// ---------------------------------------------------------------------------

let _progressInterval: ReturnType<typeof setInterval> | null = null;

function startProgressPolling() {
  stopProgressPolling();
  _progressInterval = setInterval(() => {
    if (_howl && _howl.playing()) {
      usePlayerStore.getState().setProgress(_howl.seek() as number);
    }
  }, 500);
}

function stopProgressPolling() {
  if (_progressInterval !== null) {
    clearInterval(_progressInterval);
    _progressInterval = null;
  }
}

// ---------------------------------------------------------------------------
// Noop stub for setupPlayer — RNTP calls this on native, web has nothing to init
// ---------------------------------------------------------------------------

export async function setupPlayer(): Promise<void> {
  /* no-op on web */
}

export function PlaybackService() {
  /* no-op on web */
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function play(track: Track): Promise<void> {
  // Tear down previous instance
  if (_howl) {
    _howl.unload();
    _howl = null;
  }
  stopProgressPolling();

  _currentTrack = track;
  usePlayerStore.getState().setCurrentTrack(track);
  usePlayerStore.getState().setPlaybackState('loading');

  _howl = new Howl({
    src: [track.url],
    html5: true,            // required for streaming — avoids full download
    format: ['mp3', 'aac', 'ogg'],
    autoplay: true,
    volume: usePlayerStore.getState().volume,
  });

  attachHowlListeners(_howl);
  startProgressPolling();
}

export async function setQueue(tracks: Track[]): Promise<void> {
  // Web doesn't manage a full queue via Howler; play first track and expose remaining in store
  if (tracks.length === 0) return;
  usePlayerStore.getState().setQueue(tracks);
  await play(tracks[0]);
}

export async function pause(): Promise<void> {
  _howl?.pause();
  stopProgressPolling();
}

export async function resume(): Promise<void> {
  if (!_howl) return;
  _howl.play();
  startProgressPolling();
}

export async function stop(): Promise<void> {
  _howl?.stop();
  _howl?.unload();
  _howl = null;
  _currentTrack = null;
  stopProgressPolling();
  usePlayerStore.getState().setPlaybackState('stopped');
  usePlayerStore.getState().setProgress(0);
}

export async function seekTo(position: number): Promise<void> {
  if (_howl) {
    _howl.seek(position);
    usePlayerStore.getState().setProgress(position);
  }
}

export async function skipToNext(): Promise<void> {
  const { queue, currentTrack } = usePlayerStore.getState();
  if (!currentTrack || queue.length === 0) return;
  const idx = queue.findIndex((t) => t.id === currentTrack.id);
  const next = queue[idx + 1];
  if (next) await play(next);
}

export async function skipToPrevious(): Promise<void> {
  const { queue, currentTrack } = usePlayerStore.getState();
  if (!currentTrack || queue.length === 0) return;
  const idx = queue.findIndex((t) => t.id === currentTrack.id);
  const prev = queue[idx - 1];
  if (prev) await play(prev);
}

export async function setVolume(volume: number): Promise<void> {
  Howler.volume(volume);
  usePlayerStore.getState().setVolume(volume);
}
