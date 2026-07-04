# FM App 🎵

A cross-platform, open-source music player for **Android, iOS, and Web** — built with React Native + Expo. Features local file playback, internet radio streaming, and a real-time **host-listener broadcast** system where one user can share what they're listening to with others via a link.

---

## Features

| Feature | Description |
|---|---|
| 🎵 **Local Library** | Pick audio files from your device; persistent queue across sessions |
| 📻 **Internet Radio** | Stream live ICEcast/SHOUTcast stations; add custom URLs |
| 🎙 **Host Broadcast** | Start a room for any live station; share a link for others to join |
| 👂 **Listener Sync** | Join a room via link; hear the same stream in real-time sync |
| 🌙 **Dark Mode** | Full dark-mode UI; follows system preference with manual override |
| 🔒 **Background Audio** | Audio keeps playing when app is minimised or screen is locked |
| 🎛 **Lock Screen Controls** | Play/pause/next from notification shade and lock screen |
| 🌐 **Mobile + Web** | Single codebase; runs on Android, iOS, and any modern browser |

---

## Tech Stack

All tools are **free and open-source**.

### Frontend
| Package | Purpose | License |
|---|---|---|
| Expo SDK 53 + Expo Router v5 | Cross-platform scaffold & file-based routing | MIT |
| React Native 0.76 + React Native Web | Mobile + browser from one codebase | MIT |
| `react-native-track-player` v4 | Background audio on Android/iOS | Apache-2.0 |
| `howler.js` v2 | Background audio in the browser (Web Audio API) | MIT |
| `nativewind` v4 + Tailwind CSS | Dark-mode utility styling | MIT |
| `zustand` v5 | Lightweight state management | MIT |
| `socket.io-client` v4 | Real-time host-listener sync | MIT |
| `expo-document-picker` | Local file selection (native) | MIT |

### Backend (`server/`)
| Package | Purpose | License |
|---|---|---|
| Node.js 18+ | Runtime | MIT |
| Express v4 | HTTP server + health endpoint | MIT |
| Socket.io v4 | WebSocket room lifecycle | MIT |
| `uuid` v11 | Room ID generation | MIT |

---

## Project Structure

```
FM App/
├── app/
│   ├── _layout.tsx              # Root layout — audio setup, splash
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar (Library / Radio / Host)
│   │   ├── index.tsx            # Library screen
│   │   ├── radio.tsx            # Radio stations screen
│   │   └── host.tsx             # Host broadcast screen
│   ├── room/[id].tsx            # Listener join screen (deep link)
│   └── player.tsx               # Full-screen player modal
├── components/
│   ├── MiniPlayer.tsx           # Persistent mini-player above tab bar
│   ├── PlayerControls.tsx       # Play/pause, seek, prev/next
│   ├── TrackListItem.tsx        # Library list row
│   ├── RadioCard.tsx            # Radio station card
│   └── RoomCard.tsx             # Active room status card
├── services/
│   ├── audioService.native.ts   # RNTP implementation (Android/iOS)
│   ├── audioService.web.ts      # Howler.js implementation (browser)
│   ├── socketService.ts         # Socket.io singleton
│   └── roomService.ts           # Room create/join/leave helpers
├── store/
│   ├── playerStore.ts           # Playback state
│   ├── libraryStore.ts          # Persisted local tracks
│   ├── radioStore.ts            # Persisted stations list
│   ├── roomStore.ts             # Active room + role
│   └── settingsStore.ts         # Dark mode preference
├── hooks/
│   ├── usePlayerProgress.ts     # Progress polling (native)
│   ├── useRoomSync.ts           # Room state → audio sync
│   └── useFilePicker.ts         # Platform-split file picker
├── theme/
│   └── colors.ts                # Design tokens
└── server/
    ├── index.js                 # Express + Socket.io entry
    ├── rooms.js                 # In-memory room store (Map)
    ├── Dockerfile               # Container image
    └── docker-compose.yml       # Self-host setup
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (or yarn)
- For native builds: [Expo CLI](https://docs.expo.dev/get-started/installation/) + Android Studio / Xcode

### 1. Clone

```bash
git clone https://github.com/suraj-suryn/FM-Music.git
cd FM-Music
```

### 2. Install frontend dependencies

```bash
npm install
# .npmrc automatically applies --legacy-peer-deps for Expo peer conflicts
```

### 3. Install server dependencies

```bash
cd server && npm install && cd ..
```

### 4. Configure environment

Create a `.env.local` file in the root:

```env
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001
```

> Change this to your deployed server URL before building for production.

### 5. Start the backend server

```bash
cd server
node index.js
# Server running on http://localhost:3001
```

### 6. Start the Expo app

```bash
# Web browser
npx expo start --web

# Native (scan QR with Expo Go or dev client)
npx expo start

# Android emulator
npx expo run:android

# iOS simulator
npx expo run:ios
```

---

## Host-Listener: How It Works

```
Host (plays Radio Station)
  │
  ├── taps "Start Broadcasting"
  │     └── server creates room UUID, returns share URL
  │
  ├── shares link  →  musicroom://room/<id>  (native)
  │                    https://yourapp.com/room/<id>  (web)
  │
Listeners open link
  ├── app emits room:join → server sends room state
  └── audioService.play(streamUrl) → same live stream starts

Host pauses  →  server broadcasts room:state  →  all listeners pause
Host ends    →  server emits room:ended        →  listeners get toast + redirect
```

### Socket.io Events

| Event | Direction | Payload |
|---|---|---|
| `room:create` | Client → Server | `{ streamUrl, streamTitle, artwork? }` |
| `room:created` | Server → Host | `{ roomId }` |
| `room:join` | Client → Server | `roomId` |
| `room:state` | Server → Client | Full `RoomState` |
| `room:update` | Host → Server | `{ playbackState }` |
| `room:listenerCount` | Server → Host | `{ count }` |
| `room:leave` | Client → Server | `roomId` |
| `room:end` | Host → Server | `roomId` |
| `room:ended` | Server → Listeners | — |

---

## Deploying the Server

### Option A — Render.com (free tier)

1. Push `server/` contents to a GitHub repo (or use this monorepo)
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Start Command**: `node index.js`
4. Set env var: `CLIENT_ORIGIN=https://your-expo-web-url.netlify.app`
5. Copy the Render URL into your app's `.env.local`:
   ```env
   EXPO_PUBLIC_SOCKET_URL=https://your-server.onrender.com
   ```

> **Note:** Render free tier spins down after 15 min idle. Upgrade to Starter ($7/mo) for always-on.

### Option B — Self-host with Docker

```bash
cd server
docker-compose up -d
# Server available at http://localhost:3001
```

### Health check

```
GET /health  →  { "status": "ok", "rooms": 0 }
```

---

## Deploying the Web App

```bash
npx expo export --platform web
# Output in dist/ — deploy to Netlify, Vercel, or any static host
```

---

## Building for Android / iOS

```bash
# Configure EAS (first time only)
npx eas build:configure

# Development build (includes dev client)
npx eas build --profile development --platform android
npx eas build --profile development --platform ios

# Production build
npx eas build --profile production --platform all
```

---

## Default Radio Stations

10 free [SomaFM](https://somafm.com) stations are pre-loaded (no API key needed):

| Station | Genre |
|---|---|
| Groove Salad | Ambient |
| Drone Zone | Ambient |
| Lush | Jazz/Vocal |
| Indie Pop Rocks | Indie |
| Metal Detector | Metal |
| DEF CON Radio | Electronic |
| Folk Forward | Folk |
| Boot Liquor | Country/Americana |
| Left Coast 70s | 70s |
| Christmas Lounge | Holiday |

Add any custom ICEcast/SHOUTcast/HLS stream URL from the Radio tab.

---

## Roadmap

- [ ] Lyrics via [lrclib.net](https://lrclib.net) (no API key)
- [ ] Sleep timer
- [ ] Equalizer (Web Audio API / BiquadFilterNode)
- [ ] Crossfade between tracks
- [ ] Playback speed control
- [ ] F-Droid release (reproducible Android build)

---

## License

MIT — free to use, modify, and distribute.
