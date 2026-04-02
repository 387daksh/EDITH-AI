
import React from 'react';

const SettingsView: React.FC = () => {
  return (
    <div className="animate-fadeIn max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex items-center gap-6 mb-12">
        <div className="relative group">
           <img className="w-24 h-24 rounded-[32px] border-4 border-white shadow-xl" src="https://picsum.photos/seed/edith-user/96/96" alt="Profile" />
           <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-emerald-900 transition-colors">
              <span className="material-symbols-outlined text-sm">edit</span>
           </button>
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Alex Developer</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Lead Engineering Hub • San Francisco</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card space-y-8">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">person</span>
             Account Preferences
          </h3>
          <div className="space-y-4">
             {['Public Profile Visibility', 'Allow Mentions', 'Direct Messaging'].map((opt, i) => (
               <div key={opt} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-50 hover:border-emerald-100 transition-all cursor-pointer group">
                  <span className="text-sm font-bold text-gray-700">{opt}</span>
                  <div className={`w-10 h-5 rounded-full p-1 transition-colors ${i < 2 ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${i < 2 ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card space-y-8">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">security</span>
             Security & Access
          </h3>
          <div className="space-y-4">
             <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group">
                <span className="text-sm font-bold text-gray-700">Two-Factor Auth</span>
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Active</span>
             </button>
             <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group">
                <span className="text-sm font-bold text-gray-700">Rotate API Keys</span>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">refresh</span>
             </button>
             <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group">
                <span className="text-sm font-bold text-gray-700">Device Management</span>
                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">chevron_right</span>
             </button>
          </div>
        </div>
      </div>

      {/* System Theme */}
      <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-card">
         <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">System Interface</h3>
              <p className="text-gray-400 text-xs font-medium mt-1">Configure your workspace look and feel.</p>
            </div>
            <button className="bg-primary text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Changes</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Light Mode', 'Deep Forest', 'High Contrast'].map((theme, i) => (
              <div key={theme} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${i === 1 ? 'border-primary bg-emerald-50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}>
                 <div className={`w-full h-24 rounded-xl mb-4 shadow-inner ${i === 0 ? 'bg-white' : i === 1 ? 'bg-primary' : 'bg-black'}`}></div>
                 <p className="text-center text-xs font-black uppercase tracking-widest text-gray-900">{theme}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SettingsView;
