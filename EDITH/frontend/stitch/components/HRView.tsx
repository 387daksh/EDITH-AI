import React, { useState, useEffect } from 'react';
import { uploadHRDoc, askHR, listHRDocs, HRDoc, HRAskResponse, getRole } from '../services/edith';
import RecruitmentView from './RecruitmentView';
import PerformanceView from './PerformanceView';
import LeaveView from './LeaveView';
import OnboardingView from './OnboardingView';
import InnovationView from './InnovationView';

const HRView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recruitment' | 'performance' | 'leave' | 'onboarding' | 'chat' | 'documents' | 'upload' | 'innovation'>('recruitment');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<HRAskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Documents
  const [docs, setDocs] = useState<HRDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  
  // Upload
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const role = getRole();
  
  // Set default tab based on role
  useEffect(() => {
    if (role !== 'hr' && role !== 'admin') {
      setActiveTab('performance');
    }
  }, []);

  const availableTabs = [
    { id: 'recruitment', label: 'Recruitment', icon: 'person_search', roles: ['hr', 'admin'] },
    { id: 'performance', label: 'Performance', icon: 'insights', roles: ['hr', 'admin', 'employee'] },
    { id: 'leave', label: 'Time Off', icon: 'beach_access', roles: ['hr', 'admin', 'employee'] },
    { id: 'onboarding', label: 'Onboarding', icon: 'waving_hand', roles: ['hr', 'admin', 'employee'] },
    { id: 'innovation', label: 'Project Oracle', icon: 'offline_bolt', roles: ['hr', 'admin'] },
    { id: 'chat', label: 'Ask HR', icon: 'chat', roles: ['hr', 'admin', 'employee'] },
    { id: 'documents', label: 'Docs', icon: 'folder', roles: ['hr', 'admin', 'employee'] },
    { id: 'upload', label: 'Upload', icon: 'upload_file', roles: ['hr', 'admin'] },
  ];

  const visibleTabs = availableTabs.filter(tab => tab.roles.includes(role));

  const loadDocs = async () => {
    setDocsLoading(true);
    try {
      const documents = await listHRDocs();
      setDocs(documents);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    setError('');
    setAnswer(null);
    
    try {
      const response = await askHR(question);
      setAnswer(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    
    setLoading(true);
    setError('');
    setUploadSuccess('');
    
    try {
      await uploadHRDoc(docTitle, docContent);
      setUploadSuccess(`✅ "${docTitle}" uploaded successfully!`);
      setDocTitle('');
      setDocContent('');
      loadDocs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-gray-50 overflow-hidden flex flex-col relative animate-fadeIn">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Top Navigation Tabs */}
      <div className="z-20 bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-4 overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative py-4 px-3 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${
                   activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-transparent group-hover:bg-gray-100'
                }`}>
                  <span className={`material-symbols-outlined text-[20px] ${
                     activeTab === tab.id ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'
                  }`}>{tab.icon}</span>
                </div>
                <span className={`text-sm font-bold tracking-wide ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
                
                {/* Active Tab Indicator */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full shadow-[0_-2px_6px_rgba(16,185,129,0.2)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-10 pb-10 z-10 scrollbar-hide">
        
        {/* Recruitment Tab */}
        {activeTab === 'recruitment' && <RecruitmentView />}
        
        {/* Performance Tab */}
        {activeTab === 'performance' && <PerformanceView />}
        
        {/* Leave Tab */}
        {activeTab === 'leave' && <LeaveView />}
        
        {/* Onboarding Tab */}
        {activeTab === 'onboarding' && <OnboardingView />}

        {/* Innovation Tab */}
        {activeTab === 'innovation' && <InnovationView />}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn py-4">
            <div className="text-center space-y-2 mb-8">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">Policy Assistant</h3>
               <p className="text-gray-500 font-medium">Ask questions about company holidays, benefits, and guidelines.</p>
            </div>
            
            <form onSubmit={handleAsk} className="relative group max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                   <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                </div>
               <input
                 type="text"
                 value={question}
                 onChange={(e) => setQuestion(e.target.value)}
                 placeholder="e.g., 'What is the travel reimbursement policy?'"
                  className="w-full pl-14 pr-32 py-5 rounded-3xl bg-white border-2 border-gray-100 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-xl shadow-gray-100/50 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400"
               />
               <div className="absolute inset-y-2 right-2">
                 <button
                   type="submit"
                   disabled={loading || !question.trim()}
                   className="h-full px-6 bg-primary hover:bg-emerald-700 disabled:bg-gray-200 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-primary/20"
                 >
                   {loading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Ask AI'}
                 </button>
               </div>
            </form>

            <div className="flex justify-center flex-wrap gap-2 max-w-2xl mx-auto">
               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest py-2">Suggested:</span>
              {[
                'Maternity leave',
                'Health insurance',
                'Performance reviews',
                'WFH policy',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-4 py-1.5 bg-white border border-gray-100 hover:border-primary/30 hover:bg-primary/5 text-gray-500 hover:text-primary rounded-lg text-xs font-bold transition-all"
                >
                  {q}
                </button>
              ))}
            </div>

            {error && (
              <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {answer && (
              <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-100/50 overflow-hidden">
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                       <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                    </div>
                    <span className="font-black text-gray-900 text-sm">EDITH Answer</span>
                    {answer.intent && (
                      <span className="ml-auto text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-widest">
                        {answer.intent}
                      </span>
                    )}
                  </div>
                  
                  <div className="prose prose-sm prose-emerald max-w-none">
                     <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
                  </div>
                </div>

                {answer.sources && answer.sources.length > 0 && (
                  <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {answer.sources.map((source, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-gray-200 text-gray-500 rounded text-[10px] font-bold">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Knowledge Base</h3>
              <button
                onClick={loadDocs}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary rounded-xl font-bold transition-all shadow-sm text-xs uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {docsLoading ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-4xl text-primary/20 animate-spin">sync</span>
              </div>
            ) : docs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <span className="material-symbols-outlined text-5xl text-gray-200">folder_off</span>
                <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-[10px]">No Documents</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {docs.map((doc) => (
                  <div key={doc.id} className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-100/50 hover:border-primary/20 transition-all cursor-pointer h-56 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <span className="material-symbols-outlined text-6xl">article</span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <span className="material-symbols-outlined text-gray-400 group-hover:text-white text-xl">description</span>
                       </div>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {doc.title}
                    </h4>
                    
                    <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed mb-auto bg-gray-50/50 p-2 rounded-lg">
                        {doc.content}
                    </p>

                    <div className="pt-3 mt-2 border-t border-gray-50 flex items-center justify-between">
                       <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-xl mx-auto space-y-6 animate-fadeIn py-8">
            <div className="text-center space-y-1">
               <h3 className="text-2xl font-black text-gray-900 tracking-tight">Add Knowledge</h3>
               <p className="text-gray-500 font-medium text-sm">Upload a text-based policy or procedure.</p>
            </div>
            
            <form onSubmit={handleUpload} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. '2024 Remote Work Policy'"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-900 text-sm placeholder:text-gray-300"
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Content</label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste text content..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-gray-700 text-sm placeholder:text-gray-300 resize-none"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 font-bold text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {uploadSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !docTitle.trim() || !docContent.trim()}
                className="w-full py-4 bg-primary hover:bg-emerald-700 disabled:bg-gray-200 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2 text-xs"
              >
                {loading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Publish to Intelligence'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRView;
