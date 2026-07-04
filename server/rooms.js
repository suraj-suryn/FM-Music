/**
 * rooms.js
 * In-memory room store.
 * Intentionally simple — swap the Map for Redis for multi-instance scale-out.
 *
 * RoomState shape:
 * {
 *   roomId:        string   — UUID v4
 *   hostSocketId:  string   — socket.id of the host
 *   streamUrl:     string   — ICEcast / SHOUTcast / HLS URL
 *   streamTitle:   string
 *   artwork?:      string
 *   startedAt:     number   — Date.now() ms
 *   playbackState: 'playing' | 'paused'
 *   listenerIds:   Set<string>  — socket.ids of listeners (not serialised)
 * }
 */

/** @type {Map<string, object>} */
const rooms = new Map();

// TTL cleanup — remove rooms inactive for > 4 hours
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms.entries()) {
    if (now - room.startedAt > FOUR_HOURS_MS) {
      rooms.delete(id);
    }
  }
}, 60 * 60 * 1000); // check every hour

module.exports = rooms;
