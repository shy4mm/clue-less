import React, { useEffect, useRef, useState } from 'react'
// Import preload - 3 levels up from renderer/components to src, then into preload
import { invoke } from '../../../preload/preload'

interface OverlayProps {
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
  transcript: string
  setTranscript: (text: string) => void
}

export const Overlay: React.FC<OverlayProps> = ({ isVisible, setIsVisible, transcript, setTranscript }) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [listening, setListening] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (overlayRef.current) {
        const { width, height } = overlayRef.current.getBoundingClientRect()
        overlayRef.current.style.left = `${e.clientX - width / 2}px`
        overlayRef.current.style.top = `${e.clientY - height}px`
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (!isVisible && listening) {
      invoke('get-suggestions', transcript).then((response: string) => {
        const lines = response.split('\n').filter(l => l.trim())
        setSuggestions(lines)
      })
    }
  }, [isVisible, listening, transcript])

  if (!isVisible) return null

  return (
    <div
      ref={overlayRef}
      className="cluely-overlay"
      role="dialog"
      aria-label="Cluely AI suggestions"
    >
      <div className="cluely-header">
        <span>Cluely AI</span>
        <button className="cluely-close" onClick={() => setIsVisible(false)}>&times;</button>
      </div>
      
      <div className="cluely-status">
        {listening ? 'Listening...' : 'Idle'}
      </div>

      {suggestions.length > 0 && (
        <div className="cluely-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="cluely-suggestion"
              onClick={() => {
                invoke('use-suggestion', suggestion)
                setIsVisible(false)
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      <div className="cluely-action">
        <button onClick={() => setIsVisible(false)}>Close</button>
      </div>
    </div>
  )
}