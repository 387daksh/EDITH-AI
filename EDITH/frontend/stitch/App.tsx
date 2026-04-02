import React, { useState, useEffect } from 'react';
import { ViewType } from './types';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import DashboardView from './components/DashboardView';
import CodeDomainView from './components/CodeDomainView';
import PerformanceView from './components/PerformanceView';
import ShowWorkView from './components/ShowWorkView';
import AskEdithView from './components/AskEdithView';
import HRView from './components/HRView';
import TeamView from './components/TeamView';
import SettingsView from './components/SettingsView';
import NotificationsView from './components/NotificationsView';
import HelpCenterView from './components/HelpCenterView';
import ProjectsView from './components/ProjectsView';
import AnalyticsView from './components/AnalyticsView';
import LoginView from './components/LoginView';
import { getStoredUser, logout, User, Role } from './services/edith';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('Dashboard');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      // Set default view based on role
      if (stored.role === 'hr') {
        setActiveView('HRDomain');
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Navigate to appropriate default view
    if (loggedInUser.role === 'hr') {
      setActiveView('HRDomain');
    } else {
      setActiveView('Dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setActiveView('Dashboard');
  };

  // Check if user can access a view based on role
  const canAccessView = (view: ViewType, role: Role): boolean => {
    if (role === 'admin') return true; // Admin can access everything
    
    const hrOnlyViews: ViewType[] = ['HRDomain', 'Team'];
    const codeViews: ViewType[] = ['CodeDomain', 'AskEdith', 'ShowWork'];
    
    if (role === 'hr') {
      // HR can only access HR-related views and dashboard
      return hrOnlyViews.includes(view) || view === 'Dashboard' || view === 'Settings' || view === 'HelpCenter';
    }
    
    if (role === 'employee') {
      // Employee can access everything except Admin specific settings (if any)
      // For now, allow access to HRDomain (for personal stats) and Team
      return true; 
    }
    
    return false;
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-emerald-900 to-teal-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderView = () => {
    // Check access
    if (!canAccessView(activeView, user.role)) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300">lock</span>
          <h2 className="text-xl font-bold text-gray-500 mt-4">Access Denied</h2>
          <p className="text-gray-400 mt-2">You don't have permission to view this page.</p>
        </div>
      );
    }

    switch (activeView) {
      case 'Dashboard': return <DashboardView />;
      case 'CodeDomain': return <CodeDomainView />;
      case 'Performance': return <PerformanceView />;
      case 'ShowWork': return <ShowWorkView />;
      case 'AskEdith': return <AskEdithView />;
      case 'HRDomain': return <HRView />;
      case 'Team': return <TeamView />;
      case 'Settings': return <SettingsView />;
      case 'Notifications': return <NotificationsView />;
      case 'HelpCenter': return <HelpCenterView />;
      case 'Projects': return <ProjectsView />;
      case 'Analytics': return <AnalyticsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#FAFAF9] font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        userRole={user.role}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav 
          activeView={activeView} 
          setActiveView={setActiveView}
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
