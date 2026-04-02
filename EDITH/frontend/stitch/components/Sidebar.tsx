import React from 'react';
import { ViewType } from '../types';
import { Role } from '../services/edith';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  userRole: Role;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, userRole, onLogout }) => {
  // Role-based menu items
  const getCoreDomains = () => {
    const all = [
      { label: 'Code Domain', icon: 'code', view: 'CodeDomain' as ViewType, roles: ['admin', 'employee'] },
      { label: 'HR & People', icon: 'badge', view: 'HRDomain' as ViewType, roles: ['admin', 'hr', 'employee'] },
      { label: 'Team', icon: 'groups', view: 'Team' as ViewType, roles: ['admin', 'hr'] },
      { label: 'Ask EDITH', icon: 'question_answer', view: 'AskEdith' as ViewType, roles: ['admin', 'employee'] },
      { label: 'Performance', icon: 'trending_up', view: 'Performance' as ViewType, roles: ['admin', 'employee'] },
      { label: 'Show Work', icon: 'visibility', view: 'ShowWork' as ViewType, roles: ['admin', 'employee'] },
    ];
    return all.filter(item => item.roles.includes(userRole));
  };

  const systemItems = [
    { label: 'Settings', icon: 'settings', view: 'Settings' as ViewType },
    { label: 'Notifications', icon: 'notifications', badge: true, view: 'Notifications' as ViewType },
    { label: 'Help Center', icon: 'help_outline', view: 'HelpCenter' as ViewType },
  ];

  const roleLabels = {
    admin: 'Administrator',
    employee: 'Developer',
    hr: 'HR Manager',
  };

  const roleColors = {
    admin: 'from-emerald-500 to-teal-600',
    employee: 'from-blue-500 to-indigo-600',
    hr: 'from-violet-500 to-purple-600',
  };

  return (
    <aside className="w-64 bg-surface border-r border-gray-200 flex flex-col h-full shrink-0 relative z-20">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveView('Dashboard')}>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColors[userRole]} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined text-white text-lg">memory</span>
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-primary transition-colors">EDITH</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div>
          <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Core Domains</h3>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveView('Dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-pill transition-all ${
                activeView === 'Dashboard' 
                  ? 'bg-primary text-white shadow-soft' 
                  : 'text-gray-600 hover:bg-white hover:shadow-card group'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activeView === 'Dashboard' ? 'text-white' : 'group-hover:text-primary'}`}>dashboard</span>
              <span className={`text-sm ${activeView === 'Dashboard' ? 'font-semibold' : 'font-medium'}`}>Dashboard</span>
            </button>
            {getCoreDomains().map((item) => (
              <div key={item.view}>
                <button
                  onClick={() => setActiveView(item.view)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-pill transition-all ${
                    activeView === item.view 
                      ? 'bg-primary text-white shadow-soft' 
                      : 'text-gray-600 hover:bg-white hover:shadow-card group'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${activeView === item.view ? 'text-white' : 'group-hover:text-primary'}`}>
                    {item.icon}
                  </span>
                  <span className={`text-sm ${activeView === item.view ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                </button>
                
                {/* HR Sub-menu */}
                {item.view === 'HRDomain' && activeView === 'HRDomain' && (
                  <div className="pl-4 mt-2 space-y-1 animate-fadeIn">
                     <div className="pl-4 border-l-2 border-primary/20 space-y-1">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-primary bg-primary/5 cursor-default">
                           <span className="material-symbols-outlined text-sm">person_search</span>
                           <span className="text-xs font-bold uppercase tracking-wide">Recruitment</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-default opacity-50">
                           <span className="material-symbols-outlined text-sm">chat</span>
                           <span className="text-xs font-bold uppercase tracking-wide">Ask HR</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-default opacity-50">
                           <span className="material-symbols-outlined text-sm">folder</span>
                           <span className="text-xs font-bold uppercase tracking-wide">Documents</span>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">System</h3>
          <nav className="space-y-1">
            {systemItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-pill transition-all relative ${
                  activeView === item.view 
                    ? 'bg-primary text-white shadow-soft' 
                    : 'text-gray-600 hover:bg-white hover:shadow-card group'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeView === item.view ? 'text-white' : 'group-hover:text-primary'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${activeView === item.view ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                {item.badge && activeView !== item.view && <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColors[userRole]} flex items-center justify-center text-white text-sm font-bold`}>
            {userRole[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate capitalize">{userRole}</p>
            <p className="text-xs text-gray-500 truncate">{roleLabels[userRole]}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
