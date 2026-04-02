import React from 'react';

const ShowWorkView: React.FC = () => {
  // Recent Activity Data
  const activities = [
    {
      id: 1,
      type: 'merge',
      title: 'Merged PR #402: Authentication Refactor',
      time: '2h ago',
      desc: 'Refactored the JWT handling logic and updated the session middleware for better performance.',
      tags: ['Backend', 'Security'],
      icon: 'merge_type',
      color: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white'
    },
    {
      id: 2,
      type: 'comment',
      title: 'Commented on Design System RFC',
      time: '5h ago',
      desc: 'Suggested using CSS variables for thematic consistency across the dashboard modules.',
      icon: 'comment',
      color: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white'
    },
    {
      id: 3,
      type: 'check',
      title: 'Completed Onboarding Module 3',
      time: 'Yesterday',
      desc: 'Finished "Advanced Security Practices" training with a score of 95%.',
      icon: 'check_circle',
      color: 'bg-emerald-50 text-green-600 border-emerald-100 group-hover:bg-green-600 group-hover:text-white'
    }
  ];

  // Tasks
  const tasks = [
    { id: 1, title: 'Update API Documentation', priority: 'High', due: 'Due Today', completed: false },
    { id: 2, title: 'Fix Layout Bug in Mobile', priority: 'Medium', due: 'Due Tomorrow', completed: false },
    { id: 3, title: 'Review Frontend PRs', priority: 'Low', due: 'Due Oct 30', completed: false },
    { id: 4, title: 'Setup Dev Environment', priority: 'Done', completed: true },
  ];

  // Projects
  const projects = [
    { title: 'Database Migration', desc: 'Migrating legacy SQL to PostgreSQL clusters.', icon: 'storage', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600', status: 'In Progress', statusColor: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
    { title: 'UI Refresh Phase 2', desc: 'Implementing new dashboard components.', icon: 'brush', color: 'bg-pink-50 text-pink-600 border-pink-100 group-hover:bg-pink-600', status: 'Review', statusColor: 'text-pink-700 bg-pink-50 border-pink-100' },
    { title: 'Auth 2.0', desc: 'Security audits and MFA implementation.', icon: 'security', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600', status: 'Done', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  ];

  return (
    <div className="animate-fadeIn pb-12">
      {/* Portfolio Sub-Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Portfolio Overview</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">Welcome back, Alex. Here is your weekly contribution summary.</p>
        </div>
        <button className="bg-primary hover:bg-emerald-900 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 uppercase tracking-widest text-[11px]">
          <span className="material-symbols-outlined text-lg">add</span> New Entry
        </button>
      </div>

      {/* Top Grid: Weekly Summary & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Summary Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 relative overflow-hidden group shadow-card">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-all duration-500 opacity-50"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-gray-900 font-bold">Weekly Summary</h3>
              <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-widest">Oct 24 - Oct 31</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl text-primary border border-emerald-100 shadow-sm">
              <span className="material-symbols-outlined text-xl">insights</span>
            </div>
          </div>
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">42</span>
                <span className="text-emerald-600 text-[10px] font-black flex items-center bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm mr-0.5">trending_up</span> 12%
                </span>
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Contributions</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                <span className="block text-2xl font-black text-gray-900">8</span>
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Pull Requests</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                <span className="block text-2xl font-black text-gray-900">34</span>
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Commits</span>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
                <span className="text-gray-400">Weekly Goal</span>
                <span className="text-primary">75%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-card flex flex-col group">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-900 font-bold">Contribution Activity</h3>
            <div className="flex gap-2 text-[9px] items-center font-black uppercase tracking-widest">
              <span className="text-gray-400">Less</span>
              <div className="w-3 h-3 bg-gray-100 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-emerald-200 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-emerald-600 rounded-[2px]"></div>
              <div className="w-3 h-3 bg-emerald-800 rounded-[2px]"></div>
              <span className="text-gray-400">More</span>
            </div>
          </div>
          <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="min-w-max flex gap-1">
              {Array.from({ length: 40 }).map((_, w) => (
                <div key={w} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, d) => {
                     const intensity = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
                     const colors = ['bg-gray-100', 'bg-emerald-100', 'bg-emerald-300', 'bg-emerald-500', 'bg-emerald-700'];
                     return (
                       <div key={d} className={`w-3 h-3 rounded-[2px] ${colors[intensity]} hover:ring-2 ring-emerald-400 ring-offset-1 transition-all cursor-pointer`}></div>
                     );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex gap-10">
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Longest Streak</p>
                <p className="text-lg font-black text-gray-900 tracking-tighter">14 Days</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Current Streak</p>
                <p className="text-lg font-black text-gray-900 tracking-tighter">3 Days</p>
              </div>
            </div>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-emerald-800 transition-colors flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
              Detailed Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid: Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-xs font-bold text-gray-400 hover:text-primary uppercase tracking-widest transition-colors">View All</button>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card divide-y divide-gray-50">
            {activities.map((act) => (
              <div key={act.id} className="p-6 flex gap-5 hover:bg-gray-50 transition-colors group cursor-pointer">
                <div className="mt-1">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all shadow-sm ${act.color} group-hover:shadow-lg`}>
                    <span className="material-symbols-outlined text-xl transition-colors">{act.icon}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{act.title}</h4>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest shrink-0">{act.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">{act.desc}</p>
                  {act.tags && (
                    <div className="flex gap-2 mt-4">
                      {act.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-200 group-hover:bg-white transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Tasks */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Active Tasks</h3>
            <button className="bg-emerald-50 hover:bg-emerald-100 text-primary p-2 rounded-xl transition-colors border border-emerald-100 shadow-sm">
              <span className="material-symbols-outlined text-lg block">add</span>
            </button>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card max-h-[464px] overflow-y-auto">
            <ul className="space-y-5">
              {tasks.map((task) => (
                <li key={task.id} className={`flex items-start gap-4 pb-5 border-b border-gray-50 last:border-0 last:pb-0 group ${task.completed ? 'opacity-50' : ''}`}>
                  <div className="relative flex items-center">
                     <input 
                       defaultChecked={task.completed}
                       className="w-5 h-5 rounded-md border-gray-300 text-primary focus:ring-primary/20 cursor-pointer transition-all" 
                       type="checkbox"
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold text-gray-900 group-hover:text-primary transition-colors ${task.completed ? 'line-through decoration-gray-400' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {task.priority !== 'Done' && (
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                          task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {task.priority} Priority
                        </span>
                      )}
                      {task.completed ? (
                         <span className="text-[9px] text-emerald-600 font-black bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Done</span>
                      ) : (
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{task.due}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section: Current Projects */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6">Current Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((proj) => (
            <div key={proj.title} className="bg-white p-6 rounded-[28px] border border-gray-200 shadow-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group">
              <div className="flex justify-between items-start mb-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all group-hover:shadow-lg ${proj.color}`}>
                  <span className="material-symbols-outlined text-2xl group-hover:text-white transition-colors">{proj.icon}</span>
                </div>
                <button className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-xl">more_horiz</span>
                </button>
              </div>
              <h4 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{proj.title}</h4>
              <p className="text-xs text-gray-400 mb-6 font-medium leading-relaxed line-clamp-2">{proj.desc}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div className="flex -space-x-2">
                  {[1, 2].map(u => (
                    <img key={u} alt="" className="w-7 h-7 rounded-full border-2 border-white ring-1 ring-gray-100 shadow-sm" src={`https://picsum.photos/seed/proj-${u}/28/28`} />
                  ))}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${proj.statusColor}`}>
                  {proj.status}
                </span>
              </div>
            </div>
          ))}
          <button className="border-2 border-dashed border-gray-200 rounded-[28px] p-6 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary/40 hover:bg-emerald-50/30 transition-all group min-h-[180px]">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest">New Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowWorkView;