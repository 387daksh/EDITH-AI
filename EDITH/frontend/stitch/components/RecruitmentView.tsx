
import React, { useState } from 'react';
import { parseResume, generateQuestions, evaluateCandidate, ResumeData, QuestionSet, Evaluation } from '../services/edith';

const RecruitmentView: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState('');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [questions, setQuestions] = useState<QuestionSet | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  
  const [loading, setLoading] = useState<'parsing' | 'questions' | 'eval' | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setLoading('parsing');
    setError('');
    try {
      const data = await parseResume(file);
      setResumeData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!resumeData || !jobDesc) return;
    setLoading('questions');
    try {
      const qs = await generateQuestions(resumeData, jobDesc);
      setQuestions(qs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleEvaluate = async () => {
    if (!resumeData || !jobDesc) return;
    setLoading('eval');
    try {
      const ev = await evaluateCandidate(resumeData, jobDesc);
      setEvaluation(ev);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const isAnalyzed = !!(evaluation || questions);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-8 animate-fadeIn pb-20">
      
      {/* Intro Banner (Only show if no results yet) */}
      {!isAnalyzed && (
        <div className="text-center space-y-4 py-12">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
              Recruitment <span className="text-primary">Intelligence</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
               Upload a resume and job description to instantly generate interview guides, fit scores, and deep candidate analysis.
            </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Control Panel */}
        <div className={`lg:col-span-${isAnalyzed ? '4' : '12 max-w-4xl mx-auto w-full'} space-y-6 transition-all duration-500 ease-in-out`}>
          
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
             
             {/* 1. Resume Upload */}
             <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    Candidate Resume
                  </h2>
                  {resumeData && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full uppercase tracking-wider">Parsed</span>}
                </div>
                
                <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all group ${
                  file ? 'border-primary/30 bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-3 pointer-events-none">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-colors ${
                      file ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400 group-hover:scale-110'
                    }`}>
                       <span className="material-symbols-outlined text-2xl">
                         {file ? 'description' : 'cloud_upload'}
                       </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {file ? file.name : "Drop PDF Resume Here"}
                      </p>
                      {!file && <p className="text-xs text-gray-400 font-medium mt-1">or click to browse</p>}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                   <button 
                    onClick={handleParse}
                    disabled={!file || loading === 'parsing'}
                    className="flex-1 py-3 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
                  >
                    {loading === 'parsing' ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Parse Data'}
                  </button>
                </div>
             </div>

             {/* Resume Summary Logic (Mini View) */}
             {resumeData && (
                <div className="p-6 bg-gray-50/50 border-b border-gray-100 space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                         {resumeData.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                         <h3 className="font-bold text-gray-900 text-sm">{resumeData.name}</h3>
                         <p className="text-[10px] text-gray-500 font-medium truncate">{resumeData.email}</p>
                      </div>
                   </div>
                   <div className="flex flex-wrap gap-1">
                      {resumeData.skills?.slice(0, 5).map((s, i) => (
                        <span key={i} className="text-[9px] font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                          {s}
                        </span>
                      ))}
                      {(resumeData.skills?.length || 0) > 5 && (
                         <span className="text-[9px] font-bold text-gray-400 px-1.5 py-0.5">+{(resumeData.skills?.length || 0) - 5}</span>
                      )}
                   </div>
                </div>
             )}

             {/* 2. Job Description */}
             <div className="p-8 bg-white">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">work</span>
                  Role Context
                </h2>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste job description..."
                  className="w-full h-32 p-4 text-xs font-medium border-2 border-gray-100 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none resize-none transition-all placeholder:text-gray-300"
                />
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={handleEvaluate}
                    disabled={!resumeData || !jobDesc || loading === 'eval'}
                    className="py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:bg-gray-100 disabled:text-gray-300 font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-violet-600/20 active:scale-95 transition-all flex justify-center items-center gap-2"
                  >
                    {loading === 'eval' ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Run Analysis'}
                  </button>
                  <button
                    onClick={handleGenerateQuestions}
                    disabled={!resumeData || !jobDesc || loading === 'questions'}
                    className="py-3 bg-white text-gray-700 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 rounded-xl font-bold uppercase tracking-wider text-[10px] active:scale-95 transition-all flex justify-center items-center gap-2"
                  >
                    {loading === 'questions' ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Gen Questions'}
                  </button>
                </div>
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-xs animate-slideIn">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Results Dashboard */}
        {isAnalyzed && (
          <div className="lg:col-span-8 space-y-6 animate-fadeInStagger">
             
             {/* Scorecard */}
             {evaluation && (
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <span className="material-symbols-outlined text-9xl">analytics</span>
                   </div>
                   
                   <div className="p-8 border-b border-gray-100 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                      <div>
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Recommendation</span>
                         <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-4">{evaluation.recommendation}</h2>
                         <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-2xl">
                            {evaluation.reasoning}
                         </p>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                         <div className="relative w-24 h-24 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                className={`${evaluation.match_score > 75 ? 'text-emerald-500' : evaluation.match_score > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * evaluation.match_score) / 100}
                              />
                            </svg>
                            <span className="absolute text-2xl font-black text-gray-900">{evaluation.match_score}</span>
                         </div>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match Score</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-8 border-r border-gray-100 bg-emerald-50/10">
                         <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">thumb_up</span>
                            Key Strengths
                         </h4>
                         <ul className="space-y-3">
                            {evaluation.pros.map((pro, i) => (
                               <li key={i} className="flex gap-3 text-sm font-medium text-gray-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                                  {pro}
                               </li>
                            ))}
                         </ul>
                      </div>
                      <div className="p-8 bg-red-50/10">
                         <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">thumb_down</span>
                            Potential Concerns
                         </h4>
                         <ul className="space-y-3">
                            {evaluation.cons.map((con, i) => (
                               <li key={i} className="flex gap-3 text-sm font-medium text-gray-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                                  {con}
                               </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </div>
             )}

             {/* Interview Guide */}
             {questions && (
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                   <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <div>
                         <h3 className="text-xl font-black text-gray-900 tracking-tight">Interview Guide</h3>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">AI-Generated Assessment Questions</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                         <span className="material-symbols-outlined text-gray-500">quiz</span>
                      </div>
                   </div>

                   <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 bg-indigo-50 inline-block px-3 py-1 rounded-full">
                           Technical Assessment
                         </h4>
                         <div className="space-y-3">
                            {questions.technical.map((q, i) => (
                               <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors group cursor-copy">
                                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{q}</p>
                                  <span className="text-[9px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2 block">Click to copy</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div>
                         <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 bg-purple-50 inline-block px-3 py-1 rounded-full">
                           Behavioral & Culture
                         </h4>
                         <div className="space-y-3">
                            {questions.behavioral.map((q, i) => (
                               <div key={i} className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-purple-100 hover:bg-purple-50/30 transition-colors group cursor-copy">
                                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{q}</p>
                                  <span className="text-[9px] font-bold text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2 block">Click to copy</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             )}
             
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitmentView;
