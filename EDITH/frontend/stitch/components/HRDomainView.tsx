import React from 'react';

const HRDomainView: React.FC = () => {
  return (
    <div className="animate-fadeIn space-y-8 pb-12">
      {/* Overview Banner */}
      <div className="relative w-full rounded-2xl p-8 overflow-hidden bg-white border border-gray-200 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light opacity-30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-primary border border-emerald-200 uppercase tracking-wide">
                HR Intelligence
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Overview: Quarter 3</h2>
            <p className="text-gray-500 max-w-xl leading-relaxed">
              Track your team's compliance, leave balances, and upcoming appraisal cycles. 
              Your department compliance score is <span className="text-primary font-bold bg-emerald-50 px-1 rounded">94%</span>.
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <span className="material-symbols-outlined text-primary bg-emerald-50 p-1.5 rounded-full text-base">location_on</span>
                San Francisco HQ
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <span className="material-symbols-outlined text-primary bg-emerald-50 p-1.5 rounded-full text-base">groups</span>
                Engineering Dept
              </div>
            </div>
          </div>
          <div className="hidden lg:block relative w-40 h-40 flex-shrink-0 opacity-80">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-primary/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="w-24 h-24 border-2 border-primary/20 rounded-full absolute"></div>
              <div className="w-16 h-16 bg-emerald-50 rounded-full absolute flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
              </div>
            </div>
            <div className="absolute top-0 right-8 w-2 h-2 bg-secondary rounded-full"></div>
            <div className="absolute bottom-8 left-2 w-3 h-3 bg-primary rounded-full opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Balance */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-all hover:border-emerald-300 group cursor-pointer border-t-4 border-t-transparent hover:border-t-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-emerald-100">
              <span className="material-symbols-outlined text-2xl">event_available</span>
            </div>
            <span className="text-[10px] font-bold text-primary bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">+2 Days accrued</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Leave Balance</h3>
          <p className="text-sm text-gray-500 mb-6">14 days remaining this year</p>
          <div className="flex items-end gap-2 h-16 mt-auto mb-2 px-2">
            <div className="w-1/5 bg-gray-100 rounded-t-sm h-[40%] group-hover:bg-gray-200 transition-colors"></div>
            <div className="w-1/5 bg-gray-100 rounded-t-sm h-[60%] group-hover:bg-gray-200 transition-colors"></div>
            <div className="w-1/5 bg-gray-100 rounded-t-sm h-[30%] group-hover:bg-gray-200 transition-colors"></div>
            <div className="w-1/5 bg-emerald-200/60 rounded-t-sm h-[80%]"></div>
            <div className="w-1/5 bg-primary rounded-t-sm h-full shadow-lg"></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-400">Last used: Aug 12</span>
            <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              Apply Leave <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Org Hierarchy */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-all hover:border-emerald-300 group cursor-pointer border-t-4 border-t-transparent hover:border-t-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-emerald-100">
              <span className="material-symbols-outlined text-2xl">account_tree</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Org Hierarchy</h3>
          <p className="text-sm text-gray-500 mb-4">View reporting lines & teams</p>
          <div className="relative h-20 mb-2 w-full flex justify-center">
            <div className="absolute top-0 w-8 h-8 rounded-full bg-white border-2 border-primary z-10 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <div className="absolute top-4 w-px h-8 bg-primary"></div> 
            <div className="absolute top-12 w-32 h-px bg-primary"></div> 
            <div className="absolute top-12 left-[calc(50%-4rem)] w-px h-4 bg-primary"></div>
            <div className="absolute top-12 left-[calc(50%+4rem)] w-px h-4 bg-primary"></div>
            <div className="absolute top-16 left-[calc(50%-4rem)] w-6 h-6 rounded-full bg-primary border-2 border-white shadow-sm z-10"></div>
            <div className="absolute top-16 left-[calc(50%+4rem)] w-6 h-6 rounded-full bg-white border-2 border-primary shadow-sm z-10"></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-400">12 Direct Reports</span>
            <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              View Chart <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Appraisal Cycle */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm transition-all hover:border-emerald-300 group cursor-pointer border-t-4 border-t-transparent hover:border-t-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-emerald-100">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">Pending Action</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Appraisal Cycle</h3>
          <p className="text-sm text-gray-500 mb-6">Q3 Performance Review</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
            <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 mb-4 font-bold uppercase tracking-wider">
            <span>Self Review</span>
            <span className="text-primary font-bold">75% Complete</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-400">Due in 5 days</span>
            <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              Continue <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Reference Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Policy Reference</h3>
            <button className="text-sm text-primary hover:text-emerald-700 font-bold px-3 py-1 hover:bg-emerald-50 rounded-full transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="py-3 font-black pl-2">Document Name</th>
                  <th className="py-3 font-black">Last Updated</th>
                  <th className="py-3 font-black">Category</th>
                  <th className="py-3 font-black text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'Employee Handbook 2024', date: 'Oct 24, 2023', category: 'General', catColor: 'bg-blue-50 text-blue-600 border-blue-100', icon: 'description', iconColor: 'bg-red-50 text-red-500' },
                  { name: 'Remote Work Guidelines', date: 'Sep 12, 2023', category: 'Operations', catColor: 'bg-purple-50 text-purple-600 border-purple-100', icon: 'cloud_done', iconColor: 'bg-blue-50 text-blue-500' },
                  { name: 'Code of Conduct', date: 'Aug 01, 2023', category: 'Compliance', catColor: 'bg-orange-50 text-orange-600 border-orange-100', icon: 'gavel', iconColor: 'bg-emerald-50 text-primary' },
                ].map((doc, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border flex items-center justify-center ${doc.iconColor} border-gray-100 shadow-sm`}>
                          <span className="material-symbols-outlined text-lg">{doc.icon}</span>
                        </div>
                        <span className="font-semibold text-gray-700">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-500 font-medium">{doc.date}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${doc.catColor}`}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-100">
                        <span className="material-symbols-outlined text-lg">download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar content: Events & Help */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Upcoming Events</h3>
            <div className="space-y-6">
              {[
                { day: '24', month: 'OCT', title: 'All Hands Meeting', time: '10:00 AM - 11:30 AM', users: 5 },
                { day: '28', month: 'OCT', title: 'Benefits Enrollment', time: 'Deadline: 5:00 PM', action: 'Enroll Now' },
              ].map((event, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 shrink-0 group-hover:border-emerald-200 transition-colors">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{event.month}</span>
                    <span className="text-lg font-bold text-gray-900 leading-none">{event.day}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{event.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{event.time}</p>
                    {event.users && (
                      <div className="flex -space-x-2 mt-2">
                        {[1, 2, 3].map(u => (
                          <img key={u} alt="" className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-gray-100" src={`https://picsum.photos/seed/ev-${u}/24/24`} />
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-gray-100 bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-600">+{event.users}</div>
                      </div>
                    )}
                    {event.action && (
                      <button className="mt-2 text-[10px] bg-primary text-white px-3 py-1.5 rounded-full font-black uppercase tracking-widest hover:bg-emerald-800 transition shadow-sm">
                        {event.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-50">
              <div className="bg-gray-900 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-30 blur-2xl rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform"></div>
                <h4 className="text-white font-bold text-sm relative z-10">Need HR Help?</h4>
                <p className="text-gray-400 text-xs mt-1 mb-4 relative z-10 leading-relaxed font-medium">
                  Chat with the EDITH HR bot for instant answers to policy questions.
                </p>
                <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-[11px] font-bold uppercase tracking-widest transition-all backdrop-blur-sm relative z-10">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDomainView;