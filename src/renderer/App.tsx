import React, { useState, useEffect } from 'react'

// Use window.electron API exposed by the preload script
const { invoke, send } = (window as any).electron || {}

// Check if electron API is available
const isElectronAvailable = !!invoke

const App: React.FC = () => {
  // State management
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  // Toggle overlay visibility
  const toggleOverlay = async () => {
    setIsOverlayVisible(prev => !prev)
  }

  // Handle transcript updates from transcription service
  useEffect(() => {
    if (!isElectronAvailable) return
    const unsubscribe = invoke('on-transcript', (text: string) => {
      setTranscript(text)
    })
    return () => unsubscribe()
  }, [isElectronAvailable])

  // Get suggestions when transcript changes or overlay becomes visible
  useEffect(() => {
    if (!isElectronAvailable) return
    if (isOverlayVisible && transcript.length > 0) {
      invoke('get-suggestions', transcript).then((response: string) => {
        const lines = response.split('\n').filter(l => l.trim())
        setSuggestions(lines)
      })
    }
  }, [isOverlayVisible, transcript, isElectronAvailable])

  return (
    <div className="cluely-app">
      {/* Hotkey listener - will use document addEventListener */}
      <div
        onClick={toggleOverlay}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '8px 16px',
          background: '#4a90e2',
          color: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 999999
        }}
      >
        Toggle Overlay
      </div>
      
      {/* Transcription status */}
      <div
        style={{
          position: 'fixed',
          bottom: 60,
          right: 20,
          padding: '8px 16px',
          background: '#1a1a2e',
          color: '#e0e0e0',
          borderRadius: '4px',
          zIndex: 999999
        }}
      >
        {isRecording ? 'Recording...' : 'Click Toggle Overlay to start'}
      </div>
    </div>
  )
}

export default App