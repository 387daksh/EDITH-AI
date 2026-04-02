import React, { useState, useEffect } from 'react';
import { getOnboardingTasks, toggleOnboardingTask, OnboardingTask, getStoredUser } from '../services/edith';

const OnboardingView: React.FC = () => {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  const user = getStoredUser();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getOnboardingTasks();
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleToggle = async (id: number) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await toggleOnboardingTask(id);
    } catch (err) {
      console.error("Failed to sync toggle", err);
      // Revert if failed
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (loading) return <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-emerald-500">sync</span></div>;

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto space-y-8 pb-12">
       <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex justify-between items-end">
             <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="material-symbols-outlined text-amber-400">waving_hand</span>
                   <span className="text-xs font-black uppercase tracking-widest text-gray-400">Welcome Aboard</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-4">Let's get you set up, <span className="text-emerald-400">{user?.name?.split(' ')[0] || 'there'}</span>!</h1>
                <p className="text-gray-400 font-medium max-w-md text-sm">Complete these essential steps to unlock your full access to EDITH systems.</p>
             </div>
             <div className="text-right">
                <span className="text-5xl font-black tracking-tighter">{Math.round(progress)}%</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Completed</p>
             </div>
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-700/50">
             <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
       </div>

       <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="p-8 border-b border-gray-100">
             <h3 className="text-lg font-black text-gray-900 tracking-tight">Your Checklist</h3>
          </div>
          <div className="divide-y divide-gray-50">
             {tasks.map(task => (
                <div 
                   key={task.id} 
                   className={`p-6 flex items-center gap-6 group transition-all hover:bg-gray-50 cursor-pointer ${task.completed ? 'opacity-50 grayscale' : ''}`}
                   onClick={() => handleToggle(task.id)}
                >
                   <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                     task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200 group-hover:border-emerald-400'
                   }`}>
                      {task.completed && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                   </div>
                   
                   <div className="flex-1">
                      <h4 className={`font-bold text-gray-900 text-sm transition-all ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{task.category}</span>
                   </div>

                   <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-gray-300 group-hover:text-emerald-500">chevron_right</span>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default OnboardingView;
