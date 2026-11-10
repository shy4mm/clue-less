import { contextBridge, ipcRenderer } from 'electron'

// Expose protected APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data: unknown) => {
    // whitelist channels
    ipcRenderer.send(channel, data)
  },
  receive: (channel: string, func: (...args: unknown[]) => void) => {
    // whitelist channels
    ipcRenderer.on(channel, (_event, ...args) => func(...args))
  },
  store: null as any,
  getAudioInputs: () => ipcRenderer.invoke('get-audio-inputs'),
  getAudioOutputs: () => ipcRenderer.invoke('get-audio-outputs'),
  startRecording: () => ipcRenderer.invoke('start-recording'),
  stopRecording: () => ipcRenderer.invoke('stop-recording'),
  toggleOverlay: () => ipcRenderer.invoke('toggle-overlay'),
  setOverlayPosition: (position: { x: number; y: number }) =>
    ipcRenderer.invoke('set-overlay-position', position),
  onTranscript: (func: (text: string) => void) => {
    ipcRenderer.on('transcript', (_event, text) => func(text))
  },
  onLLMResponse: (func: (response: string) => void) => {
    ipcRenderer.on('llm-response', (_event, response) => func(response))
  },
  openSettings: () => ipcRenderer.invoke('open-settings'),
})

// Named exports for TypeScript consumers
export const invoke = (channel: string, data?: unknown) =>
  ipcRenderer.invoke(channel, data)

// Default export for convenience
export default {
  invoke,
  send: (channel: string, data: unknown) => ipcRenderer.send(channel, data),
}