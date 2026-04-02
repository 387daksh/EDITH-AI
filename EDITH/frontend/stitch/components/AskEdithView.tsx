import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { askEdith, askAdminEdith, checkStatus, getRole } from '../services/edith';

const AskEdithView: React.FC = () => {
  const role = getRole();
  const isAdmin = role === 'admin';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: isAdmin 
        ? "Hello! I'm EDITH, your Organizational Intelligence Engine. Ask me anything about employees, HR policies, team structures, OR the codebase - I can handle it all! Try: 'Who reports to Ayush?', 'What is the leave policy?', or 'Explain the auth system in the codebase'."
        : "Hello! I'm EDITH, your codebase intelligence engine. I analyze repositories and answer questions about architecture, dependencies, and code patterns. Ask me anything about your ingested codebase!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // Check backend connection on mount
  useEffect(() => {
    checkStatus()
      .then((status) => {
        setIsConnected(true);
        if (isAdmin) {
          setMessages(prev => [...prev, {
            id: 'status',
            role: 'assistant',
            content: `✅ Backend connected! As an admin, I have access to employee data, performance metrics, leave records, and organizational structure.`,
            timestamp: new Date(),
          }]);
        } else if (status.ingested) {
          setMessages(prev => [...prev, {
            id: 'status',
            role: 'assistant',
            content: `✅ Backend connected! I have ${status.chunks_count} code chunks ready to analyze.`,
            timestamp: new Date(),
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: 'status',
            role: 'assistant',
            content: `⚠️ Backend connected, but no repository has been ingested yet. Please ingest a repository first using the Code Domain view.`,
            timestamp: new Date(),
          }]);
        }
      })
      .catch(() => {
        setIsConnected(false);
        setMessages(prev => [...prev, {
          id: 'error',
          role: 'assistant',
          content: `❌ Cannot connect to EDITH backend at http://127.0.0.1:8000. Please ensure the backend server is running.`,
          timestamp: new Date(),
        }]);
      });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Route admins to HR-aware endpoint, others to code analysis
      const result = isAdmin 
        ? await askAdminEdith(input)
        : await askEdith(input);
        
      setMessages(prev => [...prev, { 
        id: (Date.now()+1).toString(), 
        role: 'assistant', 
        content: result || "I couldn't find relevant information.", 
        timestamp: new Date() 
      }]);
    } catch (e: any) { 
      console.error(e); 
      setMessages(prev => [...prev, { 
        id: (Date.now()+1).toString(), 
        role: 'assistant', 
        content: `Error: ${e.message || "Failed to get response from EDITH backend."}`, 
        timestamp: new Date() 
      }]);
    }
    finally { setIsTyping(false); }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-transparent animate-fadeIn relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 max-w-5xl mx-auto w-full scrollbar-hide" ref={scrollRef}>
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-emerald-50 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm relative group">
            <div className="absolute inset-0 bg-primary rounded-[32px] opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="material-symbols-outlined text-4xl">psychology</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">EDITH Intelligence</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4 leading-relaxed max-w-sm mx-auto">
            {isConnected === null ? "Connecting..." : isConnected ? "Connected to Backend" : "Backend Offline"}
          </p>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mb-1">
                <span className="material-symbols-outlined text-white text-xs">memory</span>
              </div>
            )}
            <div className={`max-w-[80%] px-8 py-5 shadow-card border ${
              msg.role === 'user' 
                ? 'bg-primary text-white border-primary rounded-[28px] rounded-br-none font-medium' 
                : 'bg-white text-gray-800 border-gray-100 rounded-[28px] rounded-bl-none'
            }`}>
              {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">EDITH RAG</span>
                  </div>
              )}
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              <div className={`mt-3 text-[10px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-white/50' : 'text-gray-300'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined text-white text-xs animate-spin">sync</span>
            </div>
            <div className="bg-white px-8 py-5 rounded-[28px] rounded-bl-none border border-gray-100 shadow-sm flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-duration:0.6s]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.1s]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Hub */}
      <div className="p-8 max-w-5xl mx-auto w-full shrink-0">
        <form onSubmit={handleSend} className="bg-white border-2 border-gray-100 rounded-pill p-3 shadow-2xl flex gap-3 hover:border-primary transition-all group">
          <div className="flex items-center pl-4 text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent px-2 border-none focus:ring-0 text-sm font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium"
            placeholder="Ask about code architecture, dependencies, or functions..."
            disabled={isConnected === false}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping || isConnected === false}
            className="bg-primary hover:bg-emerald-900 disabled:bg-gray-200 text-white px-8 py-3 rounded-full transition-all shadow-lg active:scale-95 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest"
          >
            Ask EDITH
            <span className="material-symbols-outlined text-base">send</span>
          </button>
        </form>
        <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-widest mt-4">
          Powered by BGE Embeddings • Groq LLM • Agentic RAG
        </p>
      </div>
    </div>
  );
};

export default AskEdithView;