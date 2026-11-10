import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'

// Electron-store data
const { default: Store } = await import('electron-store')
const store = new Store({
  encryptionKey: process.env.ENCRYPTION_KEY || 'cluely-default-key',
})

// FFmpeg import (dynamic import for bundler compatibility)
let ffmpegInstance: any = null

async function getFFmpeg(): Promise<any> {
  if (!ffmpegInstance) {
    // Dynamic import to avoid static analysis issues
    const FFTModule: any = await import('@ffmpeg/ffmpeg')
    ffmpegInstance = new FFTModule.default({
      corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
    })
    await ffmpegInstance.load()
  }
  return ffmpegInstance
}

// Audio recording state
let recording = false
let audioChunks: Buffer[] = []
let recordingPath: string | null = null

// Overlay window
let overlayWindow: BrowserWindow | null = null

// Tray icon
let tray: Tray | null = null

// Transcription service constants
const TRANSCRIPTION_API = 'https://api.openai.com/v1/audio/transcriptions'
const LLM_API = 'https://api.openai.com/v1/chat/completions'

// Track meeting state
let meetingId: string | null = null
let isInMeeting = false

async function handleStartRecording() {
  if (recording) return

  // Get current date for filename
  const now = new Date()
  const filename = `recording-${now.getTime()}.raw`
  recordingPath = path.join(os.tmpdir(), filename)

  recording = true
  audioChunks = []

  console.log('Recording started', recordingPath)
}

async function handleStopRecording(): Promise<string | null> {
  if (!recording || audioChunks.length === 0) return null

  recording = false

  try {
    const ffmpeg = await getFFmpeg()

    // Write chunks to a temporary file
    const buffer = Buffer.concat(audioChunks)
    const audioBlob = new Blob([buffer], { type: 'audio/webm' })

    // Upload to transcription service
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('model', 'whisper-1')

    const response = await fetch(TRANSCRIPTION_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`)
    }

    const transcript = await response.json()
    return transcript.text
  } catch (error) {
    console.error('Error during recording/transcription:', error)
    return null
  }
}

// IPC handlers
ipcMain.handle('get-audio-inputs', async () => {
  // Return default audio input device
  return [{ label: 'Default Microphone', value: 'default' }]
})

ipcMain.handle('get-audio-outputs', async () => {
  // Return default audio output device
  return [{ label: 'Default Speaker', value: 'default' }]
})

ipcMain.handle('start-recording', async () => {
  await handleStartRecording()
  return { success: true }
})

ipcMain.handle('stop-recording', async () => {
  const transcript = await handleStopRecording()
  return { success: true, transcript }
})

ipcMain.handle('toggle-overlay', async () => {
  if (!overlayWindow) {
    createOverlayWindow()
  } else {
    overlayWindow.destroy()
    overlayWindow = null
  }
  return { success: true }
})

ipcMain.handle('set-overlay-position', async (_, position: { x: number; y: number }) => {
  if (overlayWindow) {
    overlayWindow.setPosition(position.x, position.y)
  }
  return { success: true }
})

ipcMain.handle('open-settings', async () => {
  // Open settings window or redirect to URL
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  win.loadFile('index.html')
  win.show()
  return { success: true }
})

// Create overlay window function
function createOverlayWindow() {
  if (overlayWindow) {
    overlayWindow.destroy()
    overlayWindow = null
  }

  overlayWindow = new BrowserWindow({
    width: 300,
    height: 200,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  overlayWindow.loadFile('index.html')

  // Make window follow mouse position (simple implementation)
  // In production, use cursor tracking
  overlayWindow.on('focus', () => {
    if (overlayWindow) {
      const { x, y } = getMousePosition()
      overlayWindow.setPosition(x - 150, y - 100)
    }
  })
}

// Get mouse position
function getMousePosition(): { x: number; y: number } {
  const { default: screen } = require('screen')
  const mousePos = screen.getCursorScreenPoint()
  return { x: mousePos.x, y: mousePos.y }
}

// Create tray icon
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  icon.resize({ width: 16, height: 16 })

  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Overlay',
      click: () => {
        if (overlayWindow) {
          overlayWindow.show()
        }
      },
    },
    {
      label: 'Toggle Recording',
      click: () => {
        ipcMain.handle('toggle-recording', () => {})
      },
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      },
    },
  ])
  tray.setToolTip('Cluely AI Assistant')
  tray.setContextMenu(contextMenu)
}

// Handle app ready
app.whenReady().then(() => {
  // Initialize store with persisted data
  const savedSettings = store.get('settings') || {}
  Object.assign(store, savedSettings)

  createOverlayWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlayWindow()
    }
  })
})

// Handle window close
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})