import React, { useState, useRef } from 'react'
import { ask } from '../api'
import AnswerBubble from './AnswerBubble'

export default function ChatPanel({ repo }) {
  const [messages, setMessages] = useState([]) // { role: 'user'|'assistant', text, sources }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  async function sendQuestion() {
    if (!input || !repo || !repo.repo_id) return
    const question = input.trim()
    setInput('')
    setError(null)

    // push user message
    setMessages((m) => [...m, { role: 'user', text: question }])

    // push empty assistant message to stream into
    const assistantIndex = messages.length + 1
    setMessages((m) => [...m, { role: 'assistant', text: '', sources: [] }])
    setLoading(true)

    try {
      const data = await ask(repo.repo_id, question)
      // data: { answer: string, sources?: [], graph?: {} }
      const full = (data && (data.answer || data.text)) || ''
      const sources = data && data.sources ? data.sources : []

      // simulate streaming by chunking
      const chunkSize = 30
      let pos = 0
      const interval = 25

      await new Promise((resolve) => {
        const id = setInterval(() => {
          pos += chunkSize
          const nextText = full.slice(0, pos)
          setMessages((prev) => {
            const copy = [...prev]
            // safe guard last assistant message
            let idx = copy.findIndex((x) => x.role === 'assistant' && x.text === '')
            if (idx === -1) idx = copy.length - 1
            copy[idx] = { ...copy[idx], text: nextText }
            return copy
          })
          if (pos >= full.length) {
            clearInterval(id)
            resolve()
          }
        }, interval)
      })

      // attach sources to last assistant message
      setMessages((prev) => {
        const copy = [...prev]
        const lastIdx = copy.map((x) => x.role).lastIndexOf('assistant')
        if (lastIdx >= 0) copy[lastIdx] = { ...copy[lastIdx], sources }
        return copy
      })

      // if backend returned graph update repo.graph (best-effort)
      if (data && data.graph && repo && repo.setGraph) {
        try { repo.setGraph(data.graph) } catch (e) {}
      }

    } catch (err) {
      console.error(err)
      setError(err && err.detail ? err.detail : (err.message || JSON.stringify(err)))
      setMessages((m) => [...m, { role: 'assistant', text: 'Error: ' + (err.message || 'Request failed'), sources: [] }])
    } finally {
      setLoading(false)
      // focus input
      inputRef.current && inputRef.current.focus()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 max-h-96 overflow-auto">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500">No questions yet — ask something about the ingested repository.</div>
        )}

        {messages.map((m, i) => (
          <AnswerBubble key={i} message={m} />
        ))}
      </div>

      <div className="flex gap-3">
        <input
          ref={inputRef}
          className="flex-1 rounded-xl border-gray-200 p-3 shadow-sm"
          placeholder={repo && repo.repo_id ? 'Ask a question about the repository...' : 'Ingest a repository first'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!repo || !repo.repo_id}
          onKeyDown={(e) => { if (e.key === 'Enter') sendQuestion() }}
        />
        <button
          onClick={sendQuestion}
          disabled={!repo || !repo.repo_id || !input || loading}
          className="bg-green-600 text-white rounded-xl px-4 py-2 shadow-md disabled:opacity-60"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
