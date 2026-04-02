import React, { useState } from 'react'
import { ingestRepo } from '../api'

export default function RepoInput({ onIngest }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function handleIngest() {
    if (!repoUrl) return
    setLoading(true)
    setError(null)
    setMessage('Cloning & ingesting... this may take a moment')
    try {
      const data = await ingestRepo(repoUrl)
      // Expecting { repo_id, structure?, graph? }
      setMessage('Ingest succeeded')
      onIngest(data)
    } catch (err) {
      console.error(err)
      setError(err && err.detail ? err.detail : (err.message || JSON.stringify(err)))
      setMessage(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">GitHub Repository URL</label>
        <input
          className="mt-1 block w-full rounded-xl border-gray-200 shadow-sm p-3"
          type="text"
          placeholder="https://github.com/owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleIngest}
          disabled={loading}
          className="bg-blue-600 text-white rounded-xl px-4 py-2 shadow-md disabled:opacity-60"
        >
          {loading ? 'Ingesting...' : 'Ingest Repository'}
        </button>
        <span className="text-sm text-gray-600">Provide a public GitHub repo URL</span>
      </div>

      {message && <div className="text-sm text-amber-600">{message}</div>}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}
    </div>
  )
}
