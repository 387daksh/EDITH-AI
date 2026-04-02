import React, { useState, useEffect } from 'react';
import { getMyLeaves, submitLeave, getAllLeaves, updateLeaveStatus, LeaveInfo, getRole } from '../services/edith';

const LeaveView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [info, setInfo] = useState<LeaveInfo | null>(null);
  const [teamRequests, setTeamRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  const role = getRole();
  const isManager = role === 'hr' || role === 'admin';

  // Form State
  const [type, setType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchInfo = async () => {
    try {
      const data = await getMyLeaves();
      setInfo(data);
      
      if (isManager) {
        const all = await getAllLeaves();
        setTeamRequests(all);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, [activeTab]); // Refresh when switching tabs

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitLeave(type, startDate, endDate, reason);
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      // Refresh data
      await fetchInfo();
      alert("Leave requested successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (id: number, status: 'Approved' | 'Rejected') => {
    setProcessingId(id);
    try {
      await updateLeaveStatus(id, status);
      // Refresh list
      const all = await getAllLeaves();
      setTeamRequests(all);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-emerald-500">sync</span></div>;

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Time Off</h2>
           <p className="text-gray-500 font-medium mt-1">Manage your leave balance and requests.</p>
        </div>
        
        {isManager && (
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === 'my' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              My Leaves
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === 'team' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Team Requests
              {teamRequests.filter(r => r.status === 'Pending').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'my' ? (
        <>
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Annual Leave', val: info?.balance.annual, total: 20, color: 'bg-blue-600', icon: 'beach_access' },
              { label: 'Sick Leave', val: info?.balance.sick, total: 10, color: 'bg-rose-500', icon: 'sick' },
              { label: 'Casual Leave', val: info?.balance.casual, total: 5, color: 'bg-amber-500', icon: 'event_available' },
            ].map(item => (
              <div key={item.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card flex items-center justify-between group hover:border-gray-200 transition-all">
                <div>
                   <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                   <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-black text-gray-900 tracking-tighter">{item.val}</span>
                     <span className="text-gray-400 font-bold text-sm">/ {item.total}</span>
                   </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${item.color} bg-opacity-10 flex items-center justify-center`}>
                   <span className={`material-symbols-outlined text-xl ${item.color.replace('bg-', 'text-')}`}>{item.icon}</span>
                </div>
              </div>
            ))}
          </div>
    
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Request Form */}
             <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-card h-fit">
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary">add_circle</span>
                   New Request
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Leave Type</label>
                      <select 
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-700 text-sm"
                      >
                         <option value="annual">Annual Leave</option>
                         <option value="sick">Sick Leave</option>
                         <option value="casual">Casual Leave</option>
                      </select>
                   </div>
    
                   <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start</label>
                         <input 
                           type="date" 
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           required
                           className="w-full px-3 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-700 text-sm"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End</label>
                         <input 
                           type="date" 
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                           required
                           className="w-full px-3 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-700 text-sm"
                         />
                      </div>
                   </div>
    
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason</label>
                      <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Brief description..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-gray-700 text-sm resize-none"
                      />
                   </div>
    
                   <button 
                     type="submit" 
                     disabled={submitting}
                     className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex justify-center items-center gap-2"
                   >
                     {submitting ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Submit Request'}
                   </button>
                </form>
             </div>
    
             {/* History List */}
             <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-card flex flex-col">
                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-6">Request History</h3>
                
                <div className="flex-1 overflow-auto">
                   {info?.requests.length === 0 ? (
                     <div className="text-center py-12">
                       <span className="material-symbols-outlined text-4xl text-gray-200">event_busy</span>
                       <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">No requests yet</p>
                     </div>
                   ) : (
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-50">
                              <th className="pb-4 pl-2 font-black">Period</th>
                              <th className="pb-4 font-black">Type</th>
                              <th className="pb-4 font-black">Reason</th>
                              <th className="pb-4 pr-2 text-right font-black">Status</th>
                           </tr>
                        </thead>
                        <tbody className="text-sm">
                           {info?.requests.map(req => (
                              <tr key={req.id} className="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-sm font-medium text-gray-600">
                                 <td className="py-4 pl-2 font-bold text-gray-800">
                                    {req.start_date} <span className="text-gray-400 mx-1">→</span> {req.end_date}
                                 </td>
                                 <td className="py-4 capitalize">{req.type}</td>
                                 <td className="py-4 truncate max-w-[200px] text-gray-400">{req.reason}</td>
                                 <td className="py-4 pr-2 text-right">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                      req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                      req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                      'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                       {req.status}
                                    </span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   )}
                </div>
             </div>
          </div>
        </>
      ) : (
        /* Team Requests Tab (Manager Only) */
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-card">
           <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Team Leave Requests</h3>
                <p className="text-gray-500 text-sm font-medium mt-1">Approve or reject leave applications from your team.</p>
             </div>
             <button onClick={fetchInfo} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-primary transition-all">
                <span className="material-symbols-outlined">refresh</span>
             </button>
           </div>

           {teamRequests.length === 0 ? (
             <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
                <span className="material-symbols-outlined text-5xl text-gray-200">inbox</span>
                <p className="text-gray-400 font-bold mt-4 uppercase tracking-widest text-xs">No pending requests</p>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                        <th className="py-4 pl-4 font-black rounded-l-xl">Employee</th>
                        <th className="py-4 font-black">Type</th>
                        <th className="py-4 font-black">Dates</th>
                        <th className="py-4 font-black">Reason</th>
                        <th className="py-4 font-black">Applied On</th>
                        <th className="py-4 font-black">Status</th>
                        <th className="py-4 pr-4 font-black text-right rounded-r-xl">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm">
                     {teamRequests.map(req => (
                        <tr key={req.id} className="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-gray-600">
                           <td className="py-5 pl-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                    {req.email[0].toUpperCase()}
                                 </div>
                                 <div>
                                   <p className="font-bold text-gray-900">{req.email.split('@')[0]}</p>
                                   <p className="text-[10px] text-gray-400">{req.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-5 capitalize font-medium">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                req.type === 'sick' ? 'bg-rose-50 text-rose-600' :
                                req.type === 'casual' ? 'bg-amber-50 text-amber-600' :
                                'bg-blue-50 text-blue-600'
                              }`}>
                                {req.type}
                              </span>
                           </td>
                           <td className="py-5 font-bold text-gray-800">
                              {req.start_date} <span className="text-gray-300 mx-1">→</span> {req.end_date}
                           </td>
                           <td className="py-5 max-w-[250px] truncate text-gray-500" title={req.reason}>{req.reason}</td>
                           <td className="py-5 text-gray-400 text-xs font-medium">{req.applied_on}</td>
                           <td className="py-5">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                'bg-red-50 text-red-600 border-red-100'
                              }`}>
                                 {req.status}
                              </span>
                           </td>
                           <td className="py-5 pr-4 text-right">
                              {req.status === 'Pending' && (
                                <div className="flex items-center justify-end gap-2">
                                   <button 
                                     onClick={() => handleApproval(req.id, 'Approved')}
                                     disabled={processingId === req.id}
                                     className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                                     title="Approve"
                                   >
                                     <span className="material-symbols-outlined text-lg">check</span>
                                   </button>
                                   <button 
                                     onClick={() => handleApproval(req.id, 'Rejected')}
                                     disabled={processingId === req.id}
                                     className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                                     title="Reject"
                                   >
                                     <span className="material-symbols-outlined text-lg">close</span>
                                   </button>
                                </div>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default LeaveView;
