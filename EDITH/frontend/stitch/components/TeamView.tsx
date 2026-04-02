import React, { useState, useEffect } from 'react';
import { UserInfo, listUsers } from '../services/edith';

const OrgNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg shadow-gray-200/50 group-hover:scale-105 transition-transform z-10 relative bg-white">
          <img 
            src={`https://ui-avatars.com/api/?name=${data.name}&background=random&color=fff`} 
            alt={data.name} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 bg-white p-3 rounded-xl border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
            <h4 className="font-bold text-gray-900 text-sm">{data.name}</h4>
            <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">{data.title || data.role}</p>
        </div>
        
        {/* Visible Label */}
        <div className="mt-3 text-center bg-white/80 backdrop-blur px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
           <p className="font-bold text-gray-800 text-xs">{data.name}</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase">{data.title || data.role}</p>
        </div>
      </div>

      {data.children && data.children.length > 0 && (
        <>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="relative flex justify-center gap-8 pt-4 border-t border-gray-300">
             {/* Connector Logic for visuals */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-2 h-2 rounded-full bg-gray-300"></div>
             
             {data.children.map((child: any, idx: number) => (
                <div key={idx} className="relative flex flex-col items-center">
                   {/* Vertical line to child */}
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300"></div>
                   <OrgNode data={child} />
                </div>
             ))}
          </div>
        </>
      )}
    </div>
  );
};

const TeamView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'org-chart' | 'directory'>('org-chart');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await listUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to load team data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Construct Org Tree
  const buildTree = (users: UserInfo[]) => {
    const map = new Map<string, any>();
    const roots: any[] = [];

    // Initialize map
    users.forEach(u => {
      map.set(u.email, { ...u, children: [] });
    });

    // Build hierarchy
    users.forEach(u => {
      if (u.manager_email && map.has(u.manager_email)) {
        map.get(u.manager_email).children.push(map.get(u.email));
      } else {
        roots.push(map.get(u.email));
      }
    });

    return roots[0]; 
  };

  const orgTree = buildTree(users);

  const filteredEmployees = users.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (emp.title && emp.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full w-full bg-gray-50 overflow-hidden flex flex-col relative animate-fadeIn">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Top Navigation Tabs - Matching HR View Style */}
      <div className="z-20 bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-8">
            {[
              { id: 'org-chart', label: 'Organization', icon: 'account_tree' },
              { id: 'directory', label: 'Directory', icon: 'contact_page' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative py-4 px-2 flex items-center gap-2.5 transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                   activeTab === tab.id ? 'bg-blue-600/10 text-blue-600' : 'bg-transparent group-hover:bg-gray-100'
                }`}>
                  <span className={`material-symbols-outlined text-[20px] ${
                     activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}>{tab.icon}</span>
                </div>
                <span className={`text-sm font-bold tracking-wide ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
                
                {/* Active Tab Indicator */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full shadow-[0_-2px_6px_rgba(37,99,235,0.2)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="max-w-7xl mx-auto">
           {loading ? (
             <div className="flex items-center justify-center h-64">
                <span className="material-symbols-outlined animate-spin text-4xl text-gray-300">sync</span>
             </div>
           ) : error ? (
             <div className="text-center py-12 text-red-500 font-bold">{error}</div>
           ) : activeTab === 'org-chart' ? (
             <div className="flex flex-col items-center justify-center min-h-[600px] bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-12 overflow-x-auto relative animate-fadeIn">
                <div className="absolute top-6 left-8">
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Organization Structure</h2>
                   <p className="text-gray-400 text-sm font-medium mt-1">Interactive visual hierarchy of the team.</p>
                </div>
                
                <div className="mt-12 scale-100 origin-top transition-transform hover:scale-[1.02]">
                   {orgTree ? <OrgNode data={orgTree} /> : <div className="text-gray-400">No hierarchy data found</div>}
                </div>
             </div>
           ) : (
             <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn py-4">
                <div className="flex items-center justify-between">
                   <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">Team Directory</h3>
                      <p className="text-gray-500 font-medium text-sm mt-1">{users.length} Active Team Members</p>
                   </div>
                   <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Member
                   </button>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden flex flex-col">
                   {/* Search Bar */}
                   <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/30">
                      <div className="relative flex-1">
                         <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                         <input 
                           type="text" 
                           placeholder="Search by name, role, or department..." 
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all text-sm font-bold text-gray-700 bg-white"
                         />
                      </div>
                      <div className="flex items-center gap-2">
                         <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
                            <span className="material-symbols-outlined">filter_list</span>
                         </button>
                         <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
                            <span className="material-symbols-outlined">download</span>
                         </button>
                      </div>
                   </div>

                   {/* Directory Table */}
                   <div className="overflow-x-auto">
                      <table className="w-full text-left">
                         <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                            <tr>
                               <th className="px-8 py-4 font-black text-gray-300">Employee</th>
                               <th className="px-8 py-4 font-black text-gray-300">Role / Title</th>
                               <th className="px-8 py-4 font-black text-gray-300">Department</th>
                               <th className="px-8 py-4 font-black text-gray-300">Status</th>
                               <th className="px-8 py-4 text-right font-black text-gray-300">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {filteredEmployees.map((emp) => (
                               <tr key={emp.email} className="group hover:bg-blue-50/30 transition-colors">
                                  <td className="px-8 py-5">
                                     <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-md shadow-gray-200/50 group-hover:scale-105 transition-transform">
                                           <img src={`https://ui-avatars.com/api/?name=${emp.name}&background=random`} alt={emp.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                           <p className="font-bold text-gray-900 text-sm">{emp.name}</p>
                                           <p className="text-[11px] text-gray-400 font-bold">{emp.email}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-5">
                                     <span className="font-bold text-gray-600 text-sm">{emp.title || emp.role}</span>
                                  </td>
                                  <td className="px-8 py-5">
                                     <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wide border border-gray-200">
                                        {emp.department || 'General'}
                                     </span>
                                  </td>
                                  <td className="px-8 py-5">
                                     <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                                           Active
                                        </span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-5 text-right">
                                     <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                        <span className="material-symbols-outlined text-lg">more_vert</span>
                                     </button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      {filteredEmployees.length === 0 && (
                         <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                               <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                            </div>
                            <h4 className="text-gray-900 font-bold">No employees found</h4>
                            <p className="text-gray-400 text-xs mt-1">Try adjusting your search terms</p>
                         </div>
                      )}
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TeamView;
