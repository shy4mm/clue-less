import React, { useState } from 'react'
// Import preload - 3 levels up from renderer/components to src, then into preload
import { invoke } from '../../../preload/preload'

interface SettingsProps {
  onClose: () => void
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState<'gpt-4' | 'gpt-3.5-turbo'>('gpt-4')
  const [knowledgeBaseSize, setKnowledgeBaseSize] = useState<'small' | 'medium' | 'large'>('small')

  const saveSettings = async () => {
    await invoke('save-settings', {
      apiKey,
      selectedModel,
      knowledgeBaseSize
    })
    onClose()
  }

  return (
    <div className="cluely-settings">
      <div className="cluely-settings-header">
        <h2>Cluely Settings</h2>
        <button className="cluely-close" onClick={onClose}>×</button>
      </div>

      <div className="cluely-settings-section">
        <h3>API Configuration</h3>
        <div>
          <label>OpenAI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            disabled={!apiKey}
          />
        </div>

        <div>
          <label>Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>
      </div>

      <div className="cluely-settings-section">
        <h3>Knowledge Base</h3>
        <p>Size: {knowledgeBaseSize}</p>
        <select
          value={knowledgeBaseSize}
          onChange={(e) => setKnowledgeBaseSize(e.target.value as any)}
        >
          <option value="small">Small (400k tokens)</option>
          <option value="medium">Medium (800k tokens)</option>
          <option value="large">Large (1M tokens)</option>
        </select>
      </div>

      <div className="cluely-settings-actions">
        <button onClick={saveSettings} className="primary-btn">Save</button>
        <button onClick={onClose} className="secondary-btn">Cancel</button>
      </div>
    </div>
  )
}