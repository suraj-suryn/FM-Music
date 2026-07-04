import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RoomRole = 'host' | 'listener' | null;

export interface RoomState {
  roomId: string;
  streamUrl: string;
  streamTitle: string;
  artwork?: string;
  startedAt: number;   // Date.now() ms — used for offset calculation
  playbackState: 'playing' | 'paused';
}

interface RoomStore {
  activeRoom: RoomState | null;
  role: RoomRole;
  listenerCount: number;

  setRoom: (room: RoomState) => void;
  updateRoom: (partial: Partial<RoomState>) => void;
  setRole: (role: RoomRole) => void;
  setListenerCount: (count: number) => void;
  clearRoom: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useRoomStore = create<RoomStore>((set) => ({
  activeRoom: null,
  role: null,
  listenerCount: 0,

  setRoom: (room) => set({ activeRoom: room }),

  updateRoom: (partial) =>
    set((state) =>
      state.activeRoom
        ? { activeRoom: { ...state.activeRoom, ...partial } }
        : {}
    ),

  setRole: (role) => set({ role }),

  setListenerCount: (listenerCount) => set({ listenerCount }),

  clearRoom: () => set({ activeRoom: null, role: null, listenerCount: 0 }),
}));
