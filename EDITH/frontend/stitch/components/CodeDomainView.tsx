import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ingestRepository, getGraph, checkStatus, getArchitectureDiagram } from '../services/edith';

// Dynamically import mermaid
declare global {
  interface Window {
    mermaid: any;
  }
}

const CodeDomainView: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/psf/requests');
  const [isIngesting, setIsIngesting] = useState(false);
  const [status, setStatus] = useState<{ ingested: boolean; chunks_count: number } | null>(null);
  const [mermaidCode, setMermaidCode] = useState('');
  const [message, setMessage] = useState('');
  const [renderedSvg, setRenderedSvg] = useState('');
  const [exportMessage, setExportMessage] = useState('');
  const [isGeneratingArchitecture, setIsGeneratingArchitecture] = useState(false);
  const [diagramSource, setDiagramSource] = useState<'local' | 'gitdiagram' | 'error'>('local');
  const graphRef = useRef<HTMLDivElement>(null);

  // Check status on mount
  useEffect(() => {
    checkStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  // Load graph
  useEffect(() => {
    getGraph()
      .then(setMermaidCode)
      .catch(() => setMermaidCode(''));
  }, [status]);

  // Sanitize Mermaid code from GitDiagram (fixes common syntax issues)
  const sanitizeMermaidCode = (code: string): string => {
    let sanitized = code;
    
    // Fix edge labels with quotes inside: -.->| "text" | becomes -.->|text|
    // Also handles -->| "text" | format
    sanitized = sanitized.replace(/(\|)\s*"([^"]+)"\s*(\|)/g, '$1$2$3');
    
    // Fix edge labels with escaped quotes
    sanitized = sanitized.replace(/(\|)\s*\\?"([^"]+)\\?"\s*(\|)/g, '$1$2$3');
    
    // Remove spaces around edge label text: |  text  | becomes |text|
    sanitized = sanitized.replace(/\|\s+([^|]+?)\s+\|/g, '|$1|');
    
    // Fix double quotes in node labels
    sanitized = sanitized.replace(/\["([^"]+)"\]/g, '[$1]');
    
    // Handle classDef lines with special chars
    // Sometimes GitDiagram outputs malformed classDef
    
    return sanitized;
  };

  // Render mermaid diagram
  const renderMermaid = useCallback(async () => {
    if (!mermaidCode || mermaidCode === 'graph TD; A[No Graph Found]') {
      setRenderedSvg('');
      return;
    }

    try {
      // Load mermaid from CDN if not already loaded
      if (!window.mermaid) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
        script.async = true;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose', // Allow click events
        themeVariables: {
          primaryColor: '#10b981',
          primaryTextColor: '#1f2937', // Dark text for visibility
          primaryBorderColor: '#059669',
          lineColor: '#374151',
          secondaryColor: '#3b82f6',
          secondaryTextColor: '#1f2937',
          tertiaryColor: '#e0f2fe',
          tertiaryTextColor: '#1f2937',
          background: '#ffffff',
          mainBkg: '#d1fae5', // Light green background
          nodeBorder: '#059669',
          nodeTextColor: '#1f2937', // Dark node text
          clusterBkg: '#f0fdf4',
          clusterBorder: '#86efac',
          titleColor: '#1f2937',
          edgeLabelBackground: '#ffffff',
          textColor: '#1f2937', // Default text color
        },
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
          nodeSpacing: 50,
          rankSpacing: 80,
          padding: 20,
          useMaxWidth: true,
        },
      });

      // Use unique ID to avoid conflicts
      const uniqueId = `mermaid-graph-${Date.now()}`;
      // Sanitize the code to fix GitDiagram syntax issues
      const cleanCode = sanitizeMermaidCode(mermaidCode);
      const { svg } = await window.mermaid.render(uniqueId, cleanCode);
      setRenderedSvg(svg);
    } catch (error: any) {
      console.error('Mermaid render error:', error);
      // Show error in the SVG area
      setRenderedSvg(`
        <div style="background: #fee2e2; border: 1px solid #f87171; border-radius: 12px; padding: 16px; color: #b91c1c; font-family: monospace; max-width: 100%; overflow: auto;">
          <strong>⚠️ Diagram Render Error</strong><br/>
          <small>${error?.message || 'Unknown error'}</small>
          <pre style="margin-top: 8px; font-size: 10px; white-space: pre-wrap; max-height: 200px; overflow: auto; background: #fef2f2; padding: 8px; border-radius: 6px;">${mermaidCode.slice(0, 500)}...</pre>
        </div>
      `);
    }
  }, [mermaidCode]);

  useEffect(() => {
    renderMermaid();
  }, [renderMermaid]);

  // Generate professional architecture diagram from GitDiagram
  const handleGenerateArchitecture = async () => {
    if (!repoUrl) return;
    setIsGeneratingArchitecture(true);
    setMessage('🎨 Generating architecture diagram from GitDiagram (may take 30-60s)...');
    try {
      const result = await getArchitectureDiagram(repoUrl);
      setMermaidCode(result.mermaid);
      setDiagramSource(result.source);
      setMessage(result.source === 'gitdiagram' 
        ? '✅ Professional architecture diagram loaded!' 
        : '⚠️ GitDiagram failed, showing basic diagram');
    } catch (error) {
      setMessage('❌ Failed to generate architecture diagram');
    } finally {
      setIsGeneratingArchitecture(false);
    }
  };

  const handleIngest = async () => {
    setIsIngesting(true);
    setMessage('Cloning & analyzing repository...');
    try {
      const result = await ingestRepository(repoUrl, true);
      setMessage(`✅ ${result.message}`);
      setDiagramSource('local');
      const newStatus = await checkStatus();
      setStatus(newStatus);
    } catch (e: any) {
      setMessage(`❌ Error: ${e.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  // Export functions
  const exportAsSVG = () => {
    if (!renderedSvg) return;
    const blob = new Blob([renderedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dependency-graph.svg';
    a.click();
    URL.revokeObjectURL(url);
    setExportMessage('✅ SVG exported!');
    setTimeout(() => setExportMessage(''), 2000);
  };

  const exportAsPNG = async () => {
    if (!renderedSvg) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const svgBlob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = 'dependency-graph.png';
          a.click();
          URL.revokeObjectURL(pngUrl);
        }
      }, 'image/png');
      
      URL.revokeObjectURL(url);
      setExportMessage('✅ PNG exported!');
      setTimeout(() => setExportMessage(''), 2000);
    };
    
    img.src = url;
  };

  const copyMermaidCode = () => {
    navigator.clipboard.writeText(mermaidCode);
    setExportMessage('✅ Copied to clipboard!');
    setTimeout(() => setExportMessage(''), 2000);
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full bg-white overflow-hidden relative animate-fadeIn flex">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none opacity-60"></div>

      {/* Control Pane */}
      <div className="w-80 bg-white border-r border-gray-100 p-6 flex flex-col gap-6 relative z-20 shadow-sm overflow-y-auto">
        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Repository</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
            />
            <button
              onClick={handleIngest}
              disabled={isIngesting || !repoUrl}
              className="w-full py-3 bg-forest hover:bg-emerald-900 disabled:bg-gray-300 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            >
              {isIngesting ? 'Ingesting...' : 'Ingest Repository'}
            </button>
            <button
              onClick={handleGenerateArchitecture}
              disabled={isGeneratingArchitecture || !repoUrl}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            >
              {isGeneratingArchitecture ? '🎨 Generating...' : '🎨 Architecture Diagram'}
            </button>
            {message && (
              <div className={`p-3 rounded-xl text-xs font-medium ${message.includes('✅') ? 'bg-emerald-50 text-emerald-700' : message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Status</h3>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            {status ? (
              <>
                <h4 className="text-forest font-bold text-sm mb-1">
                  {status.ingested ? '✅ Ready' : '⚠️ No Data'}
                </h4>
                <p className="text-emerald-700/80 text-xs font-medium">
                  {status.chunks_count} chunks embedded
                </p>
              </>
            ) : (
              <>
                <h4 className="text-gray-600 font-bold text-sm mb-1">⏳ Connecting...</h4>
                <p className="text-gray-500 text-xs">Checking backend</p>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Export Graph</h3>
          <div className="space-y-2">
            {[
              { label: 'Download SVG', icon: 'image', onClick: exportAsSVG, disabled: !renderedSvg },
              { label: 'Download PNG', icon: 'photo_camera', onClick: exportAsPNG, disabled: !renderedSvg },
              { label: 'Copy Mermaid Code', icon: 'content_copy', onClick: copyMermaidCode, disabled: !mermaidCode },
              { label: 'Refresh Graph', icon: 'refresh', onClick: () => getGraph().then(setMermaidCode), disabled: false },
            ].map((action) => (
              <button 
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
                className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors border border-gray-100 text-left"
              >
                <span className="material-symbols-outlined text-emerald-600 text-lg">{action.icon}</span>
                <span className="text-xs font-semibold text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
          {exportMessage && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium text-center">
              {exportMessage}
            </div>
          )}
        </div>
      </div>

      {/* Graph Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-white">
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg min-h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">account_tree</span>
                <h3 className="text-lg font-bold text-gray-900">Dependency Graph</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {status?.ingested ? 'Live' : 'No Data'}
              </div>
            </div>

            {/* Graph Container */}
            <div 
              ref={graphRef}
              className="p-8 min-h-[600px] flex items-start justify-center overflow-auto"
              style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)' }}
            >
              {renderedSvg ? (
                <div 
                  className="mermaid-container"
                  dangerouslySetInnerHTML={{ __html: renderedSvg }}
                  style={{
                    minWidth: '800px',
                    width: 'max-content',
                    transform: 'scale(1.2)',
                    transformOrigin: 'top center',
                    padding: '20px',
                  }}
                />
              ) : mermaidCode && mermaidCode !== 'graph TD; A[No Graph Found]' ? (
                <div className="text-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2 animate-spin">sync</span>
                  <p className="text-sm font-medium">Rendering diagram...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4">schema</span>
                  <p className="text-sm font-medium">No dependency graph available</p>
                  <p className="text-xs mt-1">Ingest a repository to generate the graph</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Stats Card */}
      <div className="absolute top-6 right-6 w-56 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-xl p-4 z-30">
        <div className="flex gap-3 items-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg">hub</span>
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-sm">EDITH</h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              {status ? 'Connected' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <p className="text-emerald-700 text-[8px] font-bold uppercase tracking-wider mb-0.5">Chunks</p>
            <p className="text-forest font-bold text-lg">{status?.chunks_count || 0}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <p className="text-emerald-700 text-[8px] font-bold uppercase tracking-wider mb-0.5">Status</p>
            <p className="text-emerald-600 font-bold text-xs">{status?.ingested ? 'Ready' : 'Empty'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDomainView;
