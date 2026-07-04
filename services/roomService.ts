/**
 * roomService.ts
 * High-level helpers that wrap Socket.io events for room lifecycle.
 */
import { getSocket, connect, disconnect } from './socketService';
import { useRoomStore } from '../store/roomStore';
import type { RoomState } from '../store/roomStore';

// ---------------------------------------------------------------------------
// Host — create a room for a live stream
// ---------------------------------------------------------------------------

export function createRoom(
  streamUrl: string,
  streamTitle: string,
  artwork?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    connect();
    const socket = getSocket();

    const timeout = setTimeout(() => reject(new Error('room:created timeout')), 10_000);

    socket.once('room:created', ({ roomId }: { roomId: string }) => {
      clearTimeout(timeout);
      useRoomStore.getState().setRole('host');
      useRoomStore.getState().setRoom({
        roomId,
        streamUrl,
        streamTitle,
        artwork,
        startedAt: Date.now(),
        playbackState: 'playing',
      });
      resolve(roomId);
    });

    socket.emit('room:create', { streamUrl, streamTitle, artwork });
  });
}

// ---------------------------------------------------------------------------
// Listener — join an existing room
// ---------------------------------------------------------------------------

export function joinRoom(roomId: string): Promise<RoomState> {
  return new Promise((resolve, reject) => {
    connect();
    const socket = getSocket();

    const timeout = setTimeout(() => reject(new Error('room:state timeout')), 10_000);

    socket.once('room:state', (state: RoomState) => {
      clearTimeout(timeout);
      useRoomStore.getState().setRole('listener');
      useRoomStore.getState().setRoom(state);
      resolve(state);
    });

    socket.once('room:error', (msg: string) => {
      clearTimeout(timeout);
      reject(new Error(msg));
    });

    socket.emit('room:join', roomId);
  });
}

// ---------------------------------------------------------------------------
// Host — push a playback state update to all listeners
// ---------------------------------------------------------------------------

export function updateRoomState(partial: Partial<RoomState>): void {
  const socket = getSocket();
  socket.emit('room:update', partial);
  useRoomStore.getState().updateRoom(partial);
}

// ---------------------------------------------------------------------------
// Leave / end
// ---------------------------------------------------------------------------

export function leaveRoom(): void {
  const { activeRoom, role } = useRoomStore.getState();
  if (!activeRoom) return;

  const socket = getSocket();
  if (role === 'host') {
    socket.emit('room:end', activeRoom.roomId);
  } else {
    socket.emit('room:leave', activeRoom.roomId);
  }

  useRoomStore.getState().clearRoom();
  disconnect();
}
