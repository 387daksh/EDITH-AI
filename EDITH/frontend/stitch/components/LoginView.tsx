import React, { useState } from 'react';
import { login, User } from '../services/edith';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Use real login service instead of simulation
      const user = await login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (demoEmail: string, demoPass: string) => {
    setIsLoading(true);
    setError('');
    try {
      const user = await login(demoEmail, demoPass);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* Left Side: Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 bg-primary relative items-center justify-center p-20 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500 opacity-20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900 opacity-40 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10 max-w-lg space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
              <span className="material-symbols-outlined text-primary text-4xl font-bold">memory</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">EDITH</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-emerald-50 leading-tight tracking-tight">
              Centralized Intelligence for the <span className="text-emerald-400">Modern Engineer.</span>
            </h2>
            <p className="text-emerald-100/70 text-lg font-medium leading-relaxed">
              Visualize code architecture, track team metrics, and interact with company documentation through a unified AI-powered hub.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
              <span className="block text-3xl font-black text-white mb-1">94%</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Compliance Avg</span>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
              <span className="block text-3xl font-black text-white mb-1">1.2k</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Daily Commits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-white relative">
        <div className="w-full max-w-md space-y-12 animate-fadeIn">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
               <span className="material-symbols-outlined text-white text-xl">memory</span>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">EDITH</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Access the Hub</h3>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Internal Employee Gateway</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="group space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-primary transition-colors">Work Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">mail</span>
                  <input 
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.tech"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="group space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-primary transition-colors">Security Key</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors uppercase tracking-widest">Remember device</span>
              </label>
              <button type="button" className="text-xs font-black text-primary hover:text-emerald-900 uppercase tracking-widest transition-colors">Forgot key?</button>
            </div>

            <button 
              disabled={isLoading}
              type="submit" 
              className="w-full py-5 bg-primary hover:bg-emerald-900 disabled:bg-gray-200 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <>
                  Initialize System
                  <span className="material-symbols-outlined">bolt</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access - Integrated seamlessly */}
          <div className="space-y-6">
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Or authenticate with</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => demoLogin('daksh@edith.ai', 'admin123')} className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-50 hover:border-primary/20 hover:bg-emerald-50 transition-all group">
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-lg">admin_panel_settings</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Daksh (CEO)</span>
              </button>
              <button onClick={() => demoLogin('kanav@edith.ai', 'edith123')} className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-50 hover:border-blue-400/20 hover:bg-blue-50 transition-all group">
                <span className="material-symbols-outlined text-gray-400 group-hover:text-blue-600 transition-colors text-lg">code</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Kanav (Dev)</span>
              </button>
              <button onClick={() => demoLogin('somya@edith.ai', 'edith123')} className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-50 hover:border-violet-400/20 hover:bg-violet-50 transition-all group">
                <span className="material-symbols-outlined text-gray-400 group-hover:text-violet-600 transition-colors text-lg">badge</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Somya (HR)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
           <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">EDITH v3.1 Intelligence Hub</span>
           <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">•</span>
           <button className="text-[9px] font-black text-gray-400 hover:text-primary uppercase tracking-widest transition-colors">Legal & Compliance</button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
