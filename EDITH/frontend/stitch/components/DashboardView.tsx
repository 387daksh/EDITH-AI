import React, { useState, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts';
import { getDashboardStats, checkStatus, DashboardStats } from '../services/edith';

const commitData = [
  { name: 'M', value: 45 },
  { name: 'T', value: 58 },
  { name: 'W', value: 84 },
  { name: 'T', value: 61 },
  { name: 'F', value: 73 },
];

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  // Derive metric cards from live stats
  const metricCards = [
    { 
      title: 'Code Chunks', 
      val: stats?.chunks_count?.toLocaleString() || '0', 
      change: stats?.is_connected ? 'Live' : 'Offline', 
      sub: 'embedded', 
      icon: 'data_object', 
      color: 'text-emerald-600',
      badgeBg: stats?.is_connected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500',
      chartColor: 'bg-emerald-500',
      data: [40, 60, 80, 50, 70]
    },
    { 
      title: 'Repositories', 
      val: String(stats?.repositories || 0), 
      change: stats?.repositories ? 'Ingested' : 'None', 
      sub: 'analyzed', 
      icon: 'folder_copy', 
      color: 'text-blue-500',
      badgeBg: stats?.repositories ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500',
      chartColor: 'bg-blue-500',
      data: [30, 40, 20, 60, 40]
    },
    { 
      title: 'HR Documents', 
      val: String(stats?.hr_docs_count || 0), 
      change: stats?.hr_docs_count ? 'Active' : 'Empty', 
      sub: 'uploaded', 
      icon: 'description', 
      color: 'text-violet-500',
      badgeBg: stats?.hr_docs_count ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500',
      chartColor: 'bg-violet-500',
      data: [50, 90, 60, 40, 70]
    },
  ];

  return (
    <div className="animate-fadeIn pb-12">
      {/* Connection Status Banner */}
      {!loading && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${stats?.is_connected ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
          <span className={`material-symbols-outlined ${stats?.is_connected ? 'text-emerald-600' : 'text-red-500'}`}>
            {stats?.is_connected ? 'check_circle' : 'error'}
          </span>
          <span className={`font-medium ${stats?.is_connected ? 'text-emerald-700' : 'text-red-700'}`}>
            {stats?.is_connected ? 'Backend Connected' : 'Backend Offline - Start server at port 8000'}
          </span>
        </div>
      )}

      {/* Top Grid: Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl p-8 relative overflow-hidden group shadow-card border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B3D2E] to-[#14533E] z-0"></div>
          <div className="absolute inset-0 opacity-10 z-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-emerald-100 text-sm font-semibold mb-1 uppercase tracking-wide">EDITH Intelligence Hub</h2>
                <div className="text-4xl font-bold mb-2 tracking-tight">
                  {loading ? 'Loading...' : stats?.is_connected ? 'Online' : 'Offline'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold backdrop-blur-sm">
                    <span className="material-symbols-outlined text-[14px]">memory</span>
                    {stats?.chunks_count || 0} chunks
                  </span>
                  <span className="text-emerald-100/80 text-xs font-medium">Ready for queries</span>
                </div>
              </div>
              <button 
                onClick={() => getDashboardStats().then(setStats)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-sm transition-all text-white"
              >
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
              <div className="space-y-5">
                {[
                  { label: 'Code Search', val: stats?.chunks_count ? 100 : 0, count: stats?.chunks_count ? 'Active' : 'Inactive', icon: 'search', color: 'bg-emerald-400' },
                  { label: 'HR Assistant', val: stats?.hr_docs_count ? 100 : 0, count: stats?.hr_docs_count ? 'Active' : 'Inactive', icon: 'support_agent', color: 'bg-teal-300' },
                  { label: 'Graph Analysis', val: stats?.repositories ? 100 : 0, count: stats?.repositories ? 'Active' : 'Inactive', icon: 'account_tree', color: 'bg-white' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2 text-emerald-100">
                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className="text-white font-mono text-xs">{item.count}</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-500`} 
                        style={{ width: `${item.val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative h-40 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 p-4 overflow-hidden">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white mb-2">{stats?.chunks_count || 0}</div>
                  <div className="text-emerald-200 text-sm font-medium">Total Embeddings</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart Card */}
        <div className="bg-surface rounded-2xl p-6 flex flex-col border border-gray-100 shadow-sm overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-900 font-bold text-lg">Activity</h3>
            <span className="text-emerald-600 bg-emerald-50 text-xs font-bold px-2 py-1 rounded-full">This Week</span>
          </div>
          <div className="flex-1 min-h-[200px] h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commitData} margin={{ top: 10, bottom: 0, left: 0, right: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#e5e7eb', radius: 4 }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={36}>
                  {commitData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'W' ? '#0B3D2E' : '#D1D5DB'} 
                      className="transition-all duration-300 cursor-pointer hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Grid: Live Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metricCards.map((card) => (
          <div key={card.title} className="bg-surface rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              </div>
              <h3 className="text-gray-900 font-semibold">{card.title}</h3>
            </div>
            <div className="mt-2">
              <div className="text-3xl font-bold text-gray-900 mb-1">{card.val}</div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className={`${card.badgeBg} px-2 py-0.5 rounded-full font-bold`}>{card.change}</span>
                <span className="text-gray-400">{card.sub}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-1 h-12 items-end opacity-80">
              {card.data.map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1/5 rounded-t transition-all duration-500 ${i === 2 ? card.chartColor : 'bg-gray-200'}`} 
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: Quick Actions */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Ingest Repository', icon: 'cloud_upload', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', desc: 'Analyze a GitHub codebase' },
            { name: 'Ask EDITH', icon: 'psychology', color: 'bg-blue-50 text-blue-600 border-blue-100', desc: 'Query your code intelligence' },
            { name: 'View Graph', icon: 'account_tree', color: 'bg-violet-50 text-violet-600 border-violet-100', desc: 'Explore dependencies' },
          ].map((action) => (
            <div key={action.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group">
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined">{action.icon}</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{action.name}</h4>
              <p className="text-sm text-gray-500">{action.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;