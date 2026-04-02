
import React from 'react';

const ProjectsView: React.FC = () => {
  const projects = [
    { title: 'Core API v3', status: 'In Progress', progress: 75, team: 8, priority: 'High', color: 'bg-emerald-500' },
    { title: 'Design System Refactor', status: 'Review', progress: 92, team: 4, priority: 'Medium', color: 'bg-primary' },
    { title: 'Auth Service Audit', status: 'Planning', progress: 15, team: 3, priority: 'Critical', color: 'bg-rose-500' },
    { title: 'Onboarding Modules', status: 'Testing', progress: 60, team: 2, priority: 'Low', color: 'bg-blue-500' },
    { title: 'Billing Migration', status: 'In Progress', progress: 45, team: 5, priority: 'High', color: 'bg-emerald-600' },
    { title: 'Docs Overhaul', status: 'Done', progress: 100, team: 2, priority: 'Low', color: 'bg-gray-400' },
  ];

  return (
    <div className="animate-fadeIn pb-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Global Projects Hub</h2>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Cross-domain development initiatives</p>
        </div>
        <div className="flex gap-3 bg-gray-100 p-1 rounded-full">
           <button className="px-5 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Active</button>
           <button className="px-5 py-2 text-gray-500 hover:text-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest">Archived</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(proj => (
          <div key={proj.title} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
             <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                   <span className="material-symbols-outlined text-3xl">rocket</span>
                </div>
                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  proj.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  proj.priority === 'High' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {proj.priority} Priority
                </span>
             </div>
             
             <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-primary transition-colors">{proj.title}</h3>
             <div className="flex items-center gap-2 mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-emerald-50 px-2.5 py-1 rounded-full">{proj.status}</span>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">• {proj.team} Contributors</span>
             </div>

             <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                   <span>Execution Progress</span>
                   <span className="text-gray-900">{proj.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div className={`${proj.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${proj.progress}%` }}></div>
                </div>
             </div>

             <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                   {[1, 2, 3].map(u => (
                      <img key={u} className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-100" src={`https://picsum.photos/seed/p-${u}/32/32`} alt="Team" />
                   ))}
                   <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[9px] font-black text-gray-400">+{proj.team-3}</div>
                </div>
                <button className="p-2 hover:bg-emerald-50 rounded-full text-gray-300 hover:text-primary transition-all">
                   <span className="material-symbols-outlined">more_vert</span>
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsView;
