/**
 * usePlayerProgress.ts
 * Polls RNTP (native) or reads from playerStore (web — web service updates it directly).
 */
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { usePlayerStore } from '../store/playerStore';

export function usePlayerProgress(intervalMs = 500) {
  const setProgress = usePlayerStore((s) => s.setProgress);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const playbackState = usePlayerStore((s) => s.playbackState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // On web, audioService.web.ts handles polling — nothing to do here.
    if (Platform.OS === 'web') return;

    if (playbackState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Native: poll RNTP progress
    const poll = async () => {
      try {
        const TrackPlayer = (await import('react-native-track-player')).default;
        const pos = await TrackPlayer.getPosition();
        const dur = await TrackPlayer.getDuration();
        setProgress(pos);
        if (isFinite(dur) && dur > 0) setDuration(dur);
      } catch {
        // player not yet ready — ignore
      }
    };

    timerRef.current = setInterval(poll, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playbackState, intervalMs, setProgress, setDuration]);
}
