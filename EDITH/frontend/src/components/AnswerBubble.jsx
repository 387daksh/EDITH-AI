import React, { useState } from 'react'

export default function AnswerBubble({ message }) {
  const [open, setOpen] = useState(false)
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} max-w-[85%] rounded-xl shadow-md p-4`}> 
        {isUser ? (
          <div className="text-sm">{message.text}</div>
        ) : (
          <div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3">
                <button className="text-xs text-blue-600 underline" onClick={() => setOpen((s) => !s)}>
                  {open ? 'Hide Evidence' : 'Show Evidence'} ({message.sources.length})
                </button>
                {open && (
                  <div className="mt-2 bg-white border border-gray-200 rounded p-3">
                    <ul className="text-xs list-disc list-inside space-y-1">
                      {message.sources.map((s, i) => (
                        <li key={i} className="text-gray-700">{typeof s === 'string' ? s : JSON.stringify(s)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
