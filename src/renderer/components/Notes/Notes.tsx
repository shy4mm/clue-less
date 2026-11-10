import React, { useEffect, useState } from 'react'

interface NotesProps {
  transcript: string
  onExport: (text: string) => void
}

export const Notes: React.FC<NotesProps> = ({ transcript, onExport }) => {
  const [highlights, setHighlights] = useState<string[]>([])
  const [actionItems, setActionItems] = useState<string[]>([])

  useEffect(() => {
    if (!transcript) return

    const lines = transcript.split('\n')
    const keywordPatterns = ['important', 'key', 'note', 'action', 'next', 'should', 'need to']
    
    const foundHighlights: string[] = []
    const foundActions: string[] = []

    lines.forEach(line => {
      const lowerLine = line.toLowerCase()
      keywordPatterns.forEach(kw => {
        if (lowerLine.includes(kw)) {
          foundHighlights.push(line.trim())
        }
      })
      const actionKeywords = ['do', 'action', 'follow up', 'task']
      actionKeywords.forEach(ak => {
        if (lowerLine.includes(ak)) {
          foundActions.push(line.trim())
        }
      })
    })

    setHighlights(foundHighlights.length > 0 ? foundHighlights : ['No highlights extracted'])
    setActionItems(foundActions.length > 0 ? foundActions : ['No action items extracted'])
  }, [transcript])

  const exportNotes = () => {
    const notesText = [
      '=== Meeting Notes ===',
      '',
      'Transcript highlights:',
      ...highlights.map(h => `- ${h}`),
      '',
      'Action items:',
      ...actionItems.map(a => `- ${a}`),
      '',
      '---',
      '',
      'Full transcript:',
      transcript
    ].join('\n')
    
    onExport(notesText)
  }

  return (
    <div className="cluely-notes">
      <div className="cluely-notes-header">
        <h2>Meeting Notes</h2>
        <button className="cluely-close" onClick={() => exportNotes()}>Export</button>
      </div>

      {highlights.length > 0 && (
        <div className="cluely-highlights">
          <h3>Highlights</h3>
          <ul>
            {highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}

      {actionItems.length > 0 && (
        <div className="cluely-action-items">
          <h3>Action Items</h3>
          <ul>
            {actionItems.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      <div className="cluely-full-transcript">
        <h3>Full Transcript</h3>
        <pre>{transcript}</pre>
      </div>
    </div>
  )
}