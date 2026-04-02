
import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, AreaChart, Area, CartesianGrid, YAxis } from 'recharts';

const data = [
  { name: 'Mon', technical: 400, hr: 240 },
  { name: 'Tue', technical: 300, hr: 139 },
  { name: 'Wed', technical: 600, hr: 980 },
  { name: 'Thu', technical: 278, hr: 390 },
  { name: 'Fri', technical: 189, hr: 480 },
  { name: 'Sat', technical: 239, hr: 380 },
  { name: 'Sun', technical: 349, hr: 430 },
];

const AnalyticsView: React.FC = () => {
  return (
    <div className="animate-fadeIn pb-12 space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Global Intelligence Hub</h2>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Real-time performance and compliance aggregation</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-2.5 bg-primary text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base">download</span> Export Dataset
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { label: 'System Uptime', val: '99.98%', change: '+0.02%', trend: 'up', color: 'text-emerald-500' },
          { label: 'Compliance Score', val: '94.2%', change: '-0.4%', trend: 'down', color: 'text-rose-500' },
          { label: 'Avg Velocity', val: '4.2d', change: '+1.2d', trend: 'up', color: 'text-blue-500' },
          { label: 'Team Sentiment', val: '8.4/10', change: '+0.2', trend: 'up', color: 'text-amber-500' },
        ].map(metric => (
          <div key={metric.label} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{metric.label}</p>
             <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900 tracking-tighter">{metric.val}</span>
                <span className={`text-[10px] font-black ${metric.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>{metric.change}</span>
             </div>
             <div className="mt-4 w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                <div className={`h-full opacity-60 ${metric.color.replace('text', 'bg')} transition-all duration-1000`} style={{ width: '65%' }}></div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-100 shadow-card">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Cross-Domain Activity</h3>
                  <p className="text-gray-400 text-xs font-medium mt-1">Weekly volume comparing Technical vs HR operations</p>
               </div>
               <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Technical</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-300"></div>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HR & Ops</span>
                  </div>
               </div>
            </div>
            
            <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                     <defs>
                        <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#0B3D2E" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#0B3D2E" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                     />
                     <Area type="monotone" dataKey="technical" stroke="#0B3D2E" strokeWidth={3} fillOpacity={1} fill="url(#colorTech)" />
                     <Area type="monotone" dataKey="hr" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-gray-900 rounded-[32px] p-10 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
               <h3 className="text-sm font-black uppercase tracking-widest mb-2">Efficiency Goal</h3>
               <p className="text-5xl font-black tracking-tighter mb-4">8.4<span className="text-primary text-2xl">/10</span></p>
               <p className="text-gray-400 text-xs leading-relaxed font-medium">Your hub's overall operational efficiency is currently higher than 84% of internal benchmarks.</p>
            </div>
            
            <div className="space-y-6 relative z-10">
               {[
                  { l: 'PR Turnaround', v: '92%' },
                  { l: 'Policy Engagement', v: '68%' },
                  { l: 'System Health', v: '100%' }
               ].map(row => (
                  <div key={row.l} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400">{row.l}</span>
                        <span>{row.v}</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: row.v }}></div>
                     </div>
                  </div>
               ))}
            </div>

            <button className="w-full py-4 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-900 transition-all mt-10">Generate Detailed Report</button>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
