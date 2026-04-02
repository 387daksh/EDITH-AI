// Small fetch wrapper for EDITH backend.
// API base is configurable via window.EDITH_API_BASE or Vite env VITE_API_BASE.
export const API_BASE = window.EDITH_API_BASE || (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://127.0.0.1:8000'

async function safeJson(resp) {
  const text = await resp.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    return { raw: text }
  }
}

export async function ingestRepo(repoUrl) {
  const resp = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_url: repoUrl }),
  })
  const data = await safeJson(resp)
  if (!resp.ok) throw data
  return data
}

export async function ask(repoId, question) {
  const resp = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repo_id: repoId, question }),
  })
  const data = await safeJson(resp)
  if (!resp.ok) throw data
  return data
}

// ---------------- HR domain API helpers ----------------
export async function uploadHRDoc(title, content) {
  const resp = await fetch(`${API_BASE}/upload-hr-doc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  })
  const data = await safeJson(resp)
  if (!resp.ok) throw data
  return data
}

export async function askHR(question) {
  const resp = await fetch(`${API_BASE}/ask-hr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  const data = await safeJson(resp)
  if (!resp.ok) throw data
  return data
}

export async function listHRDocs() {
  const resp = await fetch(`${API_BASE}/hr-docs`)
  const data = await safeJson(resp)
  if (!resp.ok) throw data
  return data
}
