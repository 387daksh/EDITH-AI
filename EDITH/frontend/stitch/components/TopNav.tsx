import React from 'react';
import { ViewType } from '../types';
import { User } from '../services/edith';

interface TopNavProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  user: User;
  onLogout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ activeView, setActiveView, user, onLogout }) => {
  const tabs: { label: string; view: ViewType }[] = [
    { label: 'Overview', view: 'Dashboard' },
    { label: 'Projects', view: 'Projects' },
    { label: 'Analytics', view: 'Analytics' }
  ];

  const roleColors = {
    admin: 'bg-emerald-100 text-emerald-700',
    employee: 'bg-blue-100 text-blue-700',
    hr: 'bg-violet-100 text-violet-700',
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white z-10 shrink-0 relative">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {activeView === 'Dashboard' ? 'Dashboard' : activeView.replace(/([A-Z])/g, ' $1').trim()}
        </h1>
      </div>

      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-100 p-1 rounded-full border border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveView(tab.view)}
            className={`px-5 py-1.5 rounded-full text-sm transition-all ${
              activeView === tab.view 
                ? 'bg-primary text-white font-semibold shadow-sm' 
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${roleColors[user.role]}`}>
            {user.role}
          </span>
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </div>

        <div className="relative group hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-primary transition-colors">search</span>
          <input 
            className="pl-10 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm w-48 text-gray-900 placeholder-gray-400 transition-all outline-none" 
            placeholder="Search..." 
            type="text"
          />
        </div>

        <button 
          onClick={() => setActiveView('Notifications')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-primary relative"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <button
          onClick={onLogout}
          className="p-2 rounded-full hover:bg-red-50 transition-colors text-gray-500 hover:text-red-500"
          title="Logout"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
