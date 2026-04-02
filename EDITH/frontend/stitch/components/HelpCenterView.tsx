
import React from 'react';

const HelpCenterView: React.FC = () => {
  const categories = [
    { title: 'Getting Started', icon: 'rocket_launch', items: 12 },
    { title: 'Tech Architecture', icon: 'account_tree', items: 45 },
    { title: 'HR & Benefits', icon: 'volunteer_activism', items: 28 },
    { title: 'Security Guides', icon: 'admin_panel_settings', items: 15 },
  ];

  const faqs = [
    { q: 'How do I request a CI/CD pipeline expansion?', a: 'Visit the Platform-Infra domain and use the /expand command in the console.' },
    { q: 'Where can I find my W2 forms?', a: 'All tax documentation is located in HR Domain > Finance > Documents.' },
    { q: 'What is the standard PR review SLA?', a: 'The company-wide target is 4 business hours for high-priority features.' },
  ];

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto py-8 space-y-12">
      <div className="text-center py-12 bg-white rounded-[40px] border border-gray-100 shadow-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 opacity-40 blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-6">How can we help?</h2>
          <div className="max-w-xl mx-auto relative group">
             <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
             <input className="w-full pl-12 pr-6 py-4 rounded-full bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-primary text-sm font-bold shadow-inner outline-none transition-all" placeholder="Search documentation, wikis, and guides..." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {categories.map(cat => (
          <div key={cat.title} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:border-primary hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer text-center">
             <div className="w-16 h-16 rounded-[24px] bg-emerald-50 text-primary flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
             </div>
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">{cat.title}</h3>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{cat.items} Articles</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Frequently Asked Questions</h3>
           <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                   <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black">Q</span>
                      {faq.q}
                   </h4>
                   <p className="text-sm text-gray-500 leading-relaxed pl-9 font-medium">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Support Hub</h3>
           <div className="bg-gray-900 p-8 rounded-[32px] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-20 blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
              <h4 className="font-black text-lg tracking-tight mb-2">Instant AI Support</h4>
              <p className="text-gray-400 text-xs font-medium mb-8 leading-relaxed">Ask EDITH for real-time answers based on your unique company context.</p>
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Start AI Chat</button>
           </div>
           
           <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm border-l-4 border-l-primary">
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Live Support</h4>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Mon-Fri • 9am-6pm PT</p>
              <button className="flex items-center gap-3 text-primary text-[11px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform">
                 Contact Engineering On-Call <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterView;
