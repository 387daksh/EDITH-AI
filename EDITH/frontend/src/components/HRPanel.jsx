import React, { useState, useEffect } from 'react'
import { askHR, listHRDocs } from '../api'

export default function HRPanel() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [sources, setSources] = useState([])
  const [confidence, setConfidence] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [docs, setDocs] = useState([])

  useEffect(() => { fetchDocs() }, [])

  async function fetchDocs() {
    try {
      const res = await listHRDocs()
      setDocs(res.docs || [])
    } catch (err) {
      console.error('Could not list HR docs', err)
    }
  }

  async function handleAsk() {
    setError(null)
    setAnswer(null)
    setSources([])
    setConfidence(null)
    if (!question.trim()) return
    setLoading(true)
    try {
      const res = await askHR(question.trim())
      setAnswer(res.answer || res.ANSWER || '')
      setSources(res.sources || [])
      setConfidence(res.confidence || 'low')
    } catch (err) {
      console.error(err)
      setError(err && err.detail ? err.detail : (err.message || JSON.stringify(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium">HR Questions</label>
        <div className="flex gap-3 mt-2">
          <input
            className="flex-1 rounded-xl border-gray-200 p-3 shadow-sm"
            placeholder={docs.length ? 'Ask an HR question...' : 'Upload HR docs first'}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={docs.length === 0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAsk() }}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || loading || docs.length === 0}
            className="bg-emerald-600 text-white rounded-xl px-4 py-2 shadow-md disabled:opacity-60"
          >{loading ? 'Thinking...' : 'Ask HR'}</button>
        </div>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

      <div>
        <label className="text-sm font-medium">Answer</label>
        <div className="mt-2 p-4 rounded-xl bg-gray-50 border border-gray-100 min-h-[80px]">
          {answer ? (
            <div>
              <div className="whitespace-pre-wrap text-sm text-gray-800">{answer}</div>
              <div className="mt-3 text-xs text-gray-600">Confidence: {confidence}</div>
              {sources && sources.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-medium">Sources</div>
                  <ul className="list-disc list-inside text-xs text-gray-700">
                    {sources.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">No answer yet.</div>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Uploaded HR Docs</label>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {docs.length === 0 && <div className="text-sm text-gray-500">No HR documents uploaded yet.</div>}
          {docs.map(d => (
            <div key={d.id} className="rounded-xl p-3 bg-white border border-gray-100 shadow-sm text-sm">
              <div className="font-medium">{d.title}</div>
              <div className="text-xs text-gray-600 mt-1 line-clamp-3">{d.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
