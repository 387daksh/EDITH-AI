import React from 'react'

// Very small, resilient graph viewer. Expects graphData in the shape:
// { nodes: [{ id, label? }], edges: [{ source, target }] }
// If input is missing or unexpected, component fails gracefully.
export default function GraphView({ graphData }) {
  if (!graphData) return <div className="text-sm text-gray-500">No graph data available.</div>

  const nodes = graphData.nodes || []
  const edges = graphData.edges || []

  if (nodes.length === 0) return <div className="text-sm text-gray-500">Graph is empty.</div>

  // simple circular layout
  const R = 120
  const cx = 150
  const cy = 150
  const angleStep = (2 * Math.PI) / nodes.length

  const positioned = nodes.map((n, i) => {
    const angle = i * angleStep
    return { ...n, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) }
  })

  const nodeById = {}
  positioned.forEach((n) => (nodeById[n.id] = n))

  return (
    <div className="w-full overflow-auto">
      <svg viewBox="0 0 300 300" className="w-full h-64">
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#9ca3af" />
          </marker>
        </defs>

        {/* edges */}
        {edges.map((e, i) => {
          const s = nodeById[e.source]
          const t = nodeById[e.target]
          if (!s || !t) return null
          return (
            <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#cbd5e1" strokeWidth={1.5} markerEnd="url(#arrow)" />
          )
        })}

        {/* nodes */}
        {positioned.map((n, i) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={20} fill="#fff" stroke="#94a3b8" />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#1f2937">{n.label || n.id}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
