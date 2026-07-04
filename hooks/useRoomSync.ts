/**
 * useRoomSync.ts
 * Subscribes to socket events and applies room state changes to the audio engine.
 * Attach this hook inside the listener screen (room/[id].tsx).
 */
import { useEffect } from 'react';
import { getSocket } from '../services/socketService';
import { useRoomStore, type RoomState } from '../store/roomStore';
import * as AudioService from '../services/audioService';

export function useRoomSync() {
  const { setRoom, updateRoom, clearRoom } = useRoomStore();

  useEffect(() => {
    const socket = getSocket();

    const onRoomState = async (state: RoomState) => {
      setRoom(state);

      if (state.playbackState === 'playing') {
        // For live radio, just start the stream — no seek offset needed
        await AudioService.play({
          id: `room-${state.roomId}`,
          url: state.streamUrl,
          title: state.streamTitle,
          artwork: state.artwork,
          isLiveStream: true,
        });
      } else {
        await AudioService.pause();
      }
    };

    const onRoomEnded = async () => {
      await AudioService.stop();
      clearRoom();
    };

    socket.on('room:state', onRoomState);
    socket.on('room:ended', onRoomEnded);

    // Re-request state on reconnect (handles brief drops)
    socket.on('connect', () => {
      const { activeRoom } = useRoomStore.getState();
      if (activeRoom) {
        socket.emit('room:join', activeRoom.roomId);
      }
    });

    return () => {
      socket.off('room:state', onRoomState);
      socket.off('room:ended', onRoomEnded);
    };
  }, [setRoom, updateRoom, clearRoom]);
}
