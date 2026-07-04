/**
 * socketService.ts
 * Singleton Socket.io client — used by both Host and Listener flows.
 * Lazy-connects: call connect() explicitly; auto-reconnects on drop.
 */
import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ---------------------------------------------------------------------------
// Server URL — override via EXPO_PUBLIC_SOCKET_URL env var
// ---------------------------------------------------------------------------

const SERVER_URL: string =
  (Constants.expoConfig?.extra?.socketUrl as string | undefined) ?? 'http://localhost:3001';

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(SERVER_URL, {
      // Force WebSocket on native to avoid long-polling RN issues
      transports: Platform.OS === 'web' ? ['polling', 'websocket'] : ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10_000,
    });
  }
  return _socket;
}

export function connect(): void {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
}

export function disconnect(): void {
  _socket?.disconnect();
}

export function isConnected(): boolean {
  return _socket?.connected ?? false;
}
