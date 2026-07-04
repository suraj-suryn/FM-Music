/**
 * audioService.native.ts
 * Native implementation — backed by react-native-track-player v4.
 * Background playback + lock-screen controls work automatically via RNTP.
 */
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';
import type { Track } from '../store/playerStore';

// ---------------------------------------------------------------------------
// PlaybackService — must be registered BEFORE setupPlayer
// Handles remote-control events (headphones, lock screen, car stereos).
// ---------------------------------------------------------------------------

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => TrackPlayer.seekTo(e.position));
}

// ---------------------------------------------------------------------------
// Player setup — call once from the root layout after registering the service
// ---------------------------------------------------------------------------

let _isSetup = false;

export async function setupPlayer(): Promise<void> {
  if (_isSetup) return;
  await TrackPlayer.setupPlayer({
    maxCacheSize: 1024 * 5, // 5 MB cache
  });
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
  });
  await TrackPlayer.setRepeatMode(RepeatMode.Off);
  _isSetup = true;
}

// ---------------------------------------------------------------------------
// Public API (same shape as audioService.web.ts)
// ---------------------------------------------------------------------------

export async function play(track: Track): Promise<void> {
  const rnTrack = {
    id: track.id,
    url: track.url,
    title: track.title,
    artist: track.artist ?? 'Unknown',
    album: track.album,
    artwork: track.artwork,
    duration: track.duration,
    isLiveStream: track.isLiveStream ?? false,
  };
  await TrackPlayer.reset();
  await TrackPlayer.add(rnTrack);
  await TrackPlayer.play();
}

export async function setQueue(tracks: Track[]): Promise<void> {
  const rnTracks = tracks.map((t) => ({
    id: t.id,
    url: t.url,
    title: t.title,
    artist: t.artist ?? 'Unknown',
    album: t.album,
    artwork: t.artwork,
    duration: t.duration,
    isLiveStream: t.isLiveStream ?? false,
  }));
  await TrackPlayer.reset();
  await TrackPlayer.add(rnTracks);
  await TrackPlayer.play();
}

export async function pause(): Promise<void> {
  await TrackPlayer.pause();
}

export async function resume(): Promise<void> {
  await TrackPlayer.play();
}

export async function stop(): Promise<void> {
  await TrackPlayer.stop();
  await TrackPlayer.reset();
}

export async function seekTo(position: number): Promise<void> {
  await TrackPlayer.seekTo(position);
}

export async function skipToNext(): Promise<void> {
  await TrackPlayer.skipToNext();
}

export async function skipToPrevious(): Promise<void> {
  await TrackPlayer.skipToPrevious();
}

export async function setVolume(volume: number): Promise<void> {
  await TrackPlayer.setVolume(volume);
}

export async function getState(): Promise<State> {
  return TrackPlayer.getState();
}
