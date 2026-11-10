import React, { useEffect } from 'react'
// Import preload - 3 levels up from renderer/components to src, then into preload
import { invoke } from '../../../preload/preload'

// Global hotkey: CmdOrCtrl + Enter
const HOTKEY = 'ControlOrMeta+Enter'

export const Hotkey: React.FC = () => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        invoke('toggle-overlay').then(() => {})
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return null
}