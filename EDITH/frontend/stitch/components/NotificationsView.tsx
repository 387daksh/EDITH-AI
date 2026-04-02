
import React from 'react';

const NotificationsView: React.FC = () => {
  const notifications = [
    { id: 1, title: 'Architecture Update', msg: 'The User-Service-v2 mesh has been merged into master.', time: '12m ago', icon: 'schema', color: 'bg-emerald-100 text-emerald-700' },
    { id: 2, title: 'Policy Update', msg: 'The Q4 Remote Work guidelines have been updated. Please review.', time: '2h ago', icon: 'description', color: 'bg-blue-100 text-blue-700' },
    { id: 3, title: 'PR Mention', msg: 'Sarah mentioned you in PR #405: " Alex, can you check the JWT logic?"', time: '5h ago', icon: 'alternate_email', color: 'bg-purple-100 text-purple-700' },
    { id: 4, title: 'System Security', msg: 'New login detected from San Jose, CA. (Chrome on MacOS)', time: 'Yesterday', icon: 'security', color: 'bg-rose-100 text-rose-700' },
    { id: 5, title: 'Performance Milestone', msg: 'Congratulations! You reached Top 5% in Code Quality this month.', time: '2d ago', icon: 'military_tech', color: 'bg-amber-100 text-amber-700' },
  ];

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Notifications</h2>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors">Mark all read</button>
           <button className="p-2 bg-white border border-gray-100 rounded-full shadow-sm hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-lg">settings</span>
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex gap-6 hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white transition-transform group-hover:scale-110 ${n.color}`}>
              <span className="material-symbols-outlined text-2xl">{n.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{n.title}</h3>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{n.time}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{n.msg}</p>
            </div>
            <div className="flex items-center">
               <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsView;
