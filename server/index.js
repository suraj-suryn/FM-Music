'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const rooms = require('./rooms');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PORT = process.env.PORT ?? 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? '*'; // tighten in production

// ---------------------------------------------------------------------------
// Express + HTTP server
// ---------------------------------------------------------------------------

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Health-check endpoint (used by Render.com + Docker health checks)
app.get('/health', (_req, res) => res.json({ status: 'ok', rooms: rooms.size }));

const httpServer = http.createServer(app);

// ---------------------------------------------------------------------------
// Socket.io
// ---------------------------------------------------------------------------

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
  pingInterval: 25_000,
  pingTimeout: 60_000,
});

// ---------------------------------------------------------------------------
// Helper — emit listener count to host
// ---------------------------------------------------------------------------

function emitListenerCount(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const count = room.listenerIds.size;
  io.to(room.hostSocketId).emit('room:listenerCount', { count });
}

// ---------------------------------------------------------------------------
// Serialisable room state (strip listenerIds Set before emitting)
// ---------------------------------------------------------------------------

function publicState(room) {
  const { listenerIds, ...rest } = room;
  return rest;
}

// ---------------------------------------------------------------------------
// Connection handler
// ---------------------------------------------------------------------------

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id} connected`);

  // -------------------------------------------------------------------------
  // room:create  — host starts a broadcast
  // Payload: { streamUrl: string, streamTitle: string, artwork?: string }
  // -------------------------------------------------------------------------
  socket.on('room:create', ({ streamUrl, streamTitle, artwork } = {}) => {
    if (!streamUrl || typeof streamUrl !== 'string') {
      socket.emit('room:error', 'streamUrl is required');
      return;
    }
    if (!streamTitle || typeof streamTitle !== 'string') {
      socket.emit('room:error', 'streamTitle is required');
      return;
    }

    // Sanitise: only allow http/https URLs
    let parsedUrl;
    try {
      parsedUrl = new URL(streamUrl);
    } catch {
      socket.emit('room:error', 'Invalid streamUrl');
      return;
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      socket.emit('room:error', 'streamUrl must use http or https');
      return;
    }

    const roomId = uuidv4();
    const room = {
      roomId,
      hostSocketId: socket.id,
      streamUrl: parsedUrl.toString(), // normalised
      streamTitle: streamTitle.slice(0, 200),
      artwork: typeof artwork === 'string' ? artwork.slice(0, 500) : undefined,
      startedAt: Date.now(),
      playbackState: 'playing',
      listenerIds: new Set(),
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('room:created', { roomId });
    console.log(`[room] ${roomId} created by ${socket.id} — "${streamTitle}"`);
  });

  // -------------------------------------------------------------------------
  // room:join  — listener joins a room
  // Payload: roomId string
  // -------------------------------------------------------------------------
  socket.on('room:join', (roomId) => {
    if (typeof roomId !== 'string') {
      socket.emit('room:error', 'Invalid roomId');
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('room:error', `Room ${roomId} not found`);
      return;
    }

    room.listenerIds.add(socket.id);
    socket.join(roomId);
    socket.emit('room:state', publicState(room));
    emitListenerCount(roomId);
    console.log(`[room] ${roomId} — ${socket.id} joined (${room.listenerIds.size} listeners)`);
  });

  // -------------------------------------------------------------------------
  // room:update  — host updates playback state
  // Payload: partial RoomState (playbackState only, for now)
  // -------------------------------------------------------------------------
  socket.on('room:update', (partial) => {
    if (typeof partial !== 'object' || partial === null) return;

    // Find room where this socket is the host
    for (const [roomId, room] of rooms.entries()) {
      if (room.hostSocketId === socket.id) {
        // Only allow updating safe fields
        if (partial.playbackState === 'playing' || partial.playbackState === 'paused') {
          room.playbackState = partial.playbackState;
        }
        // Broadcast updated state to all in room (host included)
        io.to(roomId).emit('room:state', publicState(room));
        return;
      }
    }
  });

  // -------------------------------------------------------------------------
  // room:leave  — listener voluntarily leaves
  // Payload: roomId string
  // -------------------------------------------------------------------------
  socket.on('room:leave', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.listenerIds.delete(socket.id);
    socket.leave(roomId);
    emitListenerCount(roomId);
    console.log(`[room] ${roomId} — ${socket.id} left (${room.listenerIds.size} listeners)`);
  });

  // -------------------------------------------------------------------------
  // room:end  — host explicitly ends the broadcast
  // Payload: roomId string
  // -------------------------------------------------------------------------
  socket.on('room:end', (roomId) => {
    const room = rooms.get(roomId);
    if (!room || room.hostSocketId !== socket.id) return;
    io.to(roomId).emit('room:ended');
    rooms.delete(roomId);
    io.socketsLeave(roomId);
    console.log(`[room] ${roomId} ended by host ${socket.id}`);
  });

  // -------------------------------------------------------------------------
  // disconnect  — clean up host rooms automatically
  // -------------------------------------------------------------------------
  socket.on('disconnect', () => {
    console.log(`[-] ${socket.id} disconnected`);

    for (const [roomId, room] of rooms.entries()) {
      if (room.hostSocketId === socket.id) {
        // Host disconnected — notify listeners and delete room
        io.to(roomId).emit('room:ended');
        rooms.delete(roomId);
        io.socketsLeave(roomId);
        console.log(`[room] ${roomId} deleted (host disconnected)`);
      } else if (room.listenerIds.has(socket.id)) {
        room.listenerIds.delete(socket.id);
        emitListenerCount(roomId);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

httpServer.listen(PORT, () => {
  console.log(`FM App server listening on http://0.0.0.0:${PORT}`);
});
