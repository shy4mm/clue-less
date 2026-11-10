# clueless

**Cluely AI Meeting Assistant** - A desktop application that listens to meetings, transcribes speech, and provides AI-powered suggestions in real-time.

## Overview

**clueless** is an Electron-based desktop application that functions as an AI meeting assistant. It records audio, transcribes it using OpenAI's Whisper model, and generates real-time suggestions using OpenAI's Chat Completions API. The assistant displays an always-on-top overlay window with suggestions that follow your mouse position.

## Core Functionality

### 1. Audio Recording
- Captures microphone input using the Web Audio API
- Uses FFmpeg to process and buffer audio chunks
- Records in WebM format to temporary files

### 2. Speech-to-Text
- Sends recorded audio to OpenAI's Whisper API (`whisper-1` model)
- Returns transcribed text for further processing

### 3. AI-Powered Suggestions
- Transmitted transcript is sent to OpenAI's Chat Completions API
- Generates context-aware suggestions based on meeting content
- Suggestions appear in the overlay window

### 4. Always-On-Top Overlay
- Floating window that stays above all other applications
- Automatically positions itself near the mouse cursor
- Can be toggled hidden/shown via the tray menu or keyboard

### 5. System Integration
- **Tray icon** in the system/menubar for quick access
- **Context menu** with options to show overlay, toggle recording, and quit
- **Hotkey support** for rapid activation/deactivation

## How It Works

1. **Startup**: When Electron app launches, it creates:
   - An always-on-top overlay window
   - A system tray icon with context menu
   - Persistent storage via `electron-store`

2. **Recording Flow**:
   - User clicks "Toggle Recording" from tray menu or hotkey
   - Audio starts capturing from default microphone
   - Chunks are buffered and periodically sent to Whisper for transcription
   - Transcript is sent to LLM for suggestion generation

3. **Suggestion Flow**:
   - Transcribed text is sent to OpenAI's Chat Completions
   - LLM generates relevant suggestions/continuations
   - Suggestions appear in the overlay window
   - Overlay follows mouse position for easy reference

4. **Control**:
   - Tray menu: Show/Hide overlay, Toggle recording, Quit
   - Overlay close button: Hide the suggestions panel
   - Mouse movement: Overlay auto-follows cursor

## Prerequisites

### Environment Variables

Create a `.env` file in the project root with:

```
OPENAI_API_KEY=your_openai_api_key_here
ENCRYPTION_KEY=your_encryption_key_here (optional)
```

### Installation

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Start Electron
npm run electron:dev
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts Vite dev server for the React frontend.

### Electron Mode

```bash
npm run electron:dev
```

This concurrently starts the Vite dev server and launches Electron with the React app.

### Production Build

```bash
npm run build     # Build the Vite React app
npm run electron:build  # Package as executable
```

## Project Structure

```
cluely-assistant/
├── src/                    # Source code
│   ├── electron-main.ts   # Electron main process
│   ├── preload/           # Preload scripts (bridge between main/renderer)
│   ├── renderer/          # React frontend
│   │   ├── components/    # React components
│   │   ├── main.tsx      # Entry point
│   │   └── pages/         # Page components
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── services/          # Service integrations
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies and scripts
└── .gitignore            # Git ignore rules
```

## Key Components

- **Overlay.tsx** - The floating window component that displays AI suggestions
- **electron-main.ts** - Main Electron process handling IPC, recording, and FFmpeg
- **preload.ts** - Security bridge exposing selected IPC methods to renderer
- **Tray menu** - System tray icon with recording control and overlay toggle

## Technical Details

- **Framework**: React + Vite + Electron 30
- **Audio**: Web Audio API + FFmpeg (@ffmpeg/ffmpeg)
- **AI**: OpenAI Whisper (speech-to-text) + GPT-4o/Chat Completions
- **Storage**: electron-store (persistent JSON storage)
- **Styling**: CSS modules with custom properties

## Future Enhancements

- [ ] Local speech recognition (no API dependency)
- [ ] Multiple language support
- [ ] Custom hotkey configuration
- [ ] Suggestion history and persistence
- [ ] Integration with Zoom/Teams/Meet APIs
- [ ] Offline mode with local models