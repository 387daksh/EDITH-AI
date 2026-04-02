import React, { useState, useEffect } from 'react';
import { getRiskRadar, RiskReport, getRole, getUserHistory, Commit } from '../services/edith';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';

const CustomNode = (props: any) => {
    const { cx, cy, payload } = props;
    const color = payload.status === 'CRITICAL' ? '#ef4444' : payload.status === 'WARNING' ? '#f59e0b' : '#10b981';
    
    return (
        <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 20 20">
            <defs>
                <filter id={`glow-${payload.name}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <circle cx="10" cy="10" r={payload.z / 80} fill={color} filter={`url(#glow-${payload.name})`} opacity={0.8} />
            <circle cx="10" cy="10" r={2} fill="#fff" />
        </svg>
    );
};

const InnovationView: React.FC = () => {
  const [data, setData] = useState<RiskReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [history, setHistory] = useState<Commit[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (selectedNode) {
        setLoadingHistory(true);
        getUserHistory(selectedNode.owner).then(setHistory).finally(() => setLoadingHistory(false));
    }
  }, [selectedNode]);

  const role = getRole();

  useEffect(() => {
    if (role !== 'admin' && role !== 'hr') {
        setError("Access Restricted: This module requires Admin or HR privileges.");
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      try {
        const report = await getRiskRadar();
        setData(report);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-emerald-700 border-l-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-emerald-400 border-b-transparent border-l-emerald-600 animate-spin-reverse"></div>
        </div>
        <p className="text-emerald-400 font-mono text-sm tracking-[0.2em] animate-pulse">INITIALIZING ORACLE...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
        <div className="bg-red-950/30 text-red-400 p-8 rounded-3xl border border-red-900/50 flex flex-col items-center gap-6 max-w-md text-center backdrop-blur-md">
            <span className="material-symbols-outlined text-5xl">gpp_bad</span>
            <div>
                <h3 className="font-bold text-xl mb-2 text-white">Access Denied</h3>
                <p className="text-sm font-mono opacity-80">{error}</p>
            </div>
        </div>
    </div>
  );

  if (!data) return null;

  // Prepare data for Scatter Chart
  const chartData = data.report.map((item, index) => ({
    ...item,
    x: item.complexity,
    y: item.ownership_percent,
    z: item.risk_score,
    name: item.module,
    owner: item.owner.name,
    status: item.risk_label,
  }));

  return (
    <div className="h-full w-full bg-[#0a0f1c] text-white overflow-hidden flex flex-col relative animate-fadeIn selection:bg-emerald-500/30">
        {/* Futuristic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-20"></div>
        
        <div className="p-6 z-10 flex-1 flex flex-col h-full">
            <header className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <span className="material-symbols-outlined text-emerald-400">psychology</span>
                    </div>
                    <div>
                         <h1 className="text-3xl font-bold tracking-tight text-white mb-0.5 flex items-center gap-3">
                            Project Oracle 
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono tracking-wider">BETA</span>
                         </h1>
                         <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Organizational Risk Topology</p>
                    </div>
                </div>

                <div className="flex gap-8">
                     <div className="text-right">
                        <div className="text-3xl font-bold text-white font-mono">{data.system_health}%</div>
                        <div className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-bold">Health Score</div>
                     </div>
                     <div className="w-px h-10 bg-white/10"></div>
                     <div className="text-right">
                        <div className="text-3xl font-bold text-white font-mono">{data.total_modules}</div>
                        <div className="text-[10px] uppercase tracking-widest text-blue-400/80 font-bold">Active Nodes</div>
                     </div>
                </div>
            </header>

            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* Chart Area */}
                <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 p-1 relative backdrop-blur-sm flex flex-col shadow-2xl">
                    <div className="absolute top-5 left-5 z-20 flex gap-4">
                        {['Stable', 'Warning', 'Critical'].map((status) => (
                            <div key={status} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/5 backdrop-blur-md">
                                <div className={`w-2 h-2 rounded-full ${status === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">{status}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 w-full h-full rounded-[20px] overflow-hidden bg-black/20 border border-white/5">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 60, right: 30, bottom: 30, left: 30 }}>
                                <defs>
                                    <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    type="number" 
                                    dataKey="x" 
                                    name="Complexity" 
                                    domain={[0, 12]} 
                                    stroke="#334155" 
                                    tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} 
                                    tickLine={{stroke: '#334155'}}
                                    axisLine={{stroke: '#334155'}}
                                />
                                <YAxis 
                                    type="number" 
                                    dataKey="y" 
                                    name="Ownership" 
                                    domain={[0, 100]} 
                                    stroke="#334155" 
                                    tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} 
                                    tickLine={{stroke: '#334155'}}
                                    axisLine={{stroke: '#334155'}}
                                />
                                <ZAxis type="number" dataKey="z" range={[50, 600]} name="Risk" />
                                <Tooltip 
                                    cursor={{ strokeDasharray: '4 4', stroke: '#ffffff30' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            return (
                                                <div className="bg-[#0f172a]/95 border border-white/10 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl min-w-[200px]">
                                                    <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-white/5">
                                                        <span className="font-bold text-white text-sm tracking-wide">{d.name}</span>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${d.status === 'CRITICAL' ? 'bg-red-500 text-white shadow-sm' : d.status === 'WARNING' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'}`}>{d.status}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                                                        <div className="text-gray-500">Owner</div>
                                                        <div className="text-right text-emerald-400 font-mono">{d.owner}</div>
                                                        
                                                        <div className="text-gray-500">Complexity</div>
                                                        <div className="text-right text-indigo-400 font-mono">{d.x}/10</div>
                                                        
                                                        <div className="text-gray-500">Bus Factor</div>
                                                        <div className="text-right text-rose-400 font-mono">{d.y}%</div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter name="Modules" data={chartData} onClick={(node) => setSelectedNode(node)} shape={<CustomNode />} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Details Side Panel */}
                <div className="w-80 flex flex-col gap-4 shrink-0 transition-all duration-500">
                    {selectedNode ? (
                         <div className="flex-1 flex flex-col bg-white/5 rounded-2xl border border-white/10 overflow-hidden animate-fadeInRight">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
                                    <p className="text-[10px] text-emerald-400 font-mono">OWNER: {(typeof selectedNode.owner === 'string' ? selectedNode.owner : selectedNode.owner?.name || '').toUpperCase()}</p>
                                </div>
                                <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-gray-400 text-sm">close</span>
                                </button>
                            </div>

                            <div className="p-4 border-b border-white/10 bg-black/20">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-400">Risk Score</span>
                                    <span className={`text-lg font-bold font-mono ${selectedNode.z > 80 ? 'text-red-500' : selectedNode.z > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>{selectedNode.z}</span>
                                </div>
                                <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                                    <div className={`h-full ${selectedNode.z > 80 ? 'bg-red-500' : selectedNode.z > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${selectedNode.z}%` }}></div>
                                </div>
                                <p className="mt-3 text-[10px] text-gray-400 leading-relaxed font-mono border-l-2 border-white/20 pl-3">
                                    {selectedNode.action_item}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 min-h-0 scrollbar-hide">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 sticky top-0 bg-[#151c2f] py-2 z-10">
                                    Commit History
                                </h4>
                                
                                {loadingHistory ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : history.length > 0 ? (
                                    <div className="space-y-4 relative">
                                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10"></div>
                                        {history.map((commit, i) => (
                                            <div key={i} className="pl-6 relative group">
                                                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-[#0a0f1c] border border-emerald-500/50 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all"></div>
                                                <div className="text-[10px] text-emerald-500 font-mono mb-0.5">{commit.date}</div>
                                                <div className="text-xs text-gray-300 leading-snug group-hover:text-white transition-colors">
                                                    {commit.message}
                                                </div>
                                                <div className="text-[9px] text-gray-600 font-mono mt-1 opacity-60">{commit.hash}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 text-xs">
                                        No recent history found.
                                    </div>
                                )}
                            </div>
                         </div>
                    ) : (
                        <>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 shrink-0">
                                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Threat Detection</h3>
                                 <div className="flex gap-2">
                                    <div className="flex-1 bg-red-500/10 rounded-lg p-3 border border-red-500/20 text-center">
                                        <div className="text-2xl font-bold text-red-500 font-mono">{data.report.filter(i => i.risk_label === 'CRITICAL').length}</div>
                                        <div className="text-[9px] text-red-400/70 font-bold uppercase">Critical</div>
                                    </div>
                                    <div className="flex-1 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20 text-center">
                                        <div className="text-2xl font-bold text-amber-500 font-mono">{data.report.filter(i => i.risk_label === 'WARNING').length}</div>
                                        <div className="text-[9px] text-amber-400/70 font-bold uppercase">Warnings</div>
                                    </div>
                                 </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide min-h-0">
                        {[...chartData].sort((a,b) => b.z - a.z).map((item, i) => (
                            <div 
                                key={i} 
                                onClick={() => setSelectedNode(item)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                                    selectedNode?.name === item.name 
                                    ? 'bg-white/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                                {item.status === 'CRITICAL' && (
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/20 to-transparent -mr-8 -mt-8 rounded-full blur-xl pointer-events-none"></div>
                                )}

                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <h4 className="font-bold text-gray-200 text-sm">{item.name}</h4>
                                    <div className={`w-2 h-2 rounded-full ${item.status === 'CRITICAL' ? 'bg-red-500 animate-pulse' : item.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-300 font-mono">
                                        {item.owner.substring(0,2).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Owner</p>
                                        <p className="text-xs font-bold text-emerald-100">{item.owner}</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/5 relative z-10">
                                    <p className="text-[10px] text-indigo-300/80 font-mono leading-relaxed">{item.action_item}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default InnovationView;
