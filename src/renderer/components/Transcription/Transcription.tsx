import React, { useEffect, useState } from 'react'
// Import preload - 3 levels up from renderer/components to src, then into preload
import { invoke } from '../../../preload/preload'

interface TranscriptionProps {
  onTranscriptUpdate: (text: string) => void
}

export const Transcription: React.FC<TranscriptionProps> = ({
  onTranscriptUpdate
}: TranscriptionProps) => {
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    invoke('get-audio-inputs').then((inputs: any) => {
      console.log('Available audio inputs:', inputs)
    })
  }, [])

  const start = async () => {
    try {
      setIsListening(true)
      await invoke('start-recording')
      const unsubscribe = invoke('on-transcript', (text: string) => {
        onTranscriptUpdate(text)
      })
      return unsubscribe
    } catch (error) {
      console.error('Failed to start transcription:', error)
      setIsListening(false)
      return false
    }
  }

  const stop = async () => {
    await invoke('stop-recording')
    setIsListening(false)
  }

  return null
}