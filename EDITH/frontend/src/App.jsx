import React, { useState } from 'react'
import RepoInput from './components/RepoInput'
import ChatPanel from './components/ChatPanel'
import GraphView from './components/GraphView'
import HRUpload from './components/HRUpload'
import HRPanel from './components/HRPanel'

export default function App() {
  const [repo, setRepo] = useState(null) // { repo_id, structure, graph }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto gap-4 flex flex-col">
        <header className="rounded-xl shadow-md bg-white p-6">
          <h1 className="text-2xl font-semibold">EDITH — Repository Intelligence</h1>
          <p className="text-sm text-gray-600 mt-1">Ask natural language questions about a GitHub repository.</p>
        </header>

        <section className="rounded-xl shadow-md bg-white p-6">
          <RepoInput onIngest={(data) => setRepo(data)} />
        </section>

        <section className="rounded-xl shadow-md bg-white p-6">
          <ChatPanel repo={repo} />
        </section>

        <section className="rounded-xl shadow-md bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <HRUpload onUploaded={() => {}} />
            </div>
            <div>
              <HRPanel />
            </div>
          </div>
        </section>

        {repo && repo.graph && (
          <section className="rounded-xl shadow-md bg-white p-6">
            <h2 className="text-lg font-medium mb-2">View Graph</h2>
            <GraphView graphData={repo.graph} />
          </section>
        )}

        <footer className="text-center text-sm text-gray-500 py-6">Backend: configurable at <code className="bg-gray-100 px-2 py-1 rounded">window.EDITH_API_BASE</code> or VITE_API_BASE</footer>
      </div>
    </div>
  )
}
