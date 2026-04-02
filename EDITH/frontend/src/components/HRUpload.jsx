import React, { useState } from 'react'
import { uploadHRDoc } from '../api'

export default function HRUpload({ onUploaded }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleUpload() {
    setError(null)
    setSuccess(null)
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }
    setLoading(true)
    try {
      const res = await uploadHRDoc(title.trim(), content.trim())
      setSuccess('Uploaded')
      setTitle('')
      setContent('')
      onUploaded && onUploaded(res.doc)
    } catch (err) {
      console.error(err)
      setError(err && err.detail ? err.detail : (err.message || JSON.stringify(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">Upload HR Document</label>
      <input
        className="rounded-xl border-gray-200 p-2 shadow-sm"
        placeholder="Title (e.g., Leave Policy)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="rounded-xl border-gray-200 p-3 shadow-sm min-h-[120px]"
        placeholder="Paste HR text, handbook sections, SOPs..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-indigo-600 text-white rounded-xl px-4 py-2 shadow-md disabled:opacity-60"
        >{loading ? 'Uploading...' : 'Upload HR Doc'}</button>
        {success && <span className="text-sm text-green-600">{success}</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
