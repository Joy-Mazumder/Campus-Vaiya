import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Sparkles, Target, Zap, ChevronRight, Loader2, Send, Map as MapIcon } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown'; // npm install react-markdown (রোডম্যাপ সুন্দর দেখানোর জন্য)

const AiRoadmap = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [targetGoal, setTargetGoal] = useState('');
  const [roadmap, setRoadmap] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetGoal) return toast.error("Please enter your career goal!");
    
    setLoading(true);
    setRoadmap("");
    try {
      const res = await API.post('/tools/generate-roadmap', { targetGoal });
      setRoadmap(res.data.roadmap);
      toast.success("Your personalized roadmap is ready!");
    } catch (err) {
      toast.error("AI is busy, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} /> AI Powered Advisor
           </div>
           <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              Academic <span className="text-indigo-500">Roadmap</span>
           </h1>
           <p className="text-slate-400 max-w-2xl mx-auto font-medium">
              Our AI analyzes your current <span className="text-white">CGPA ({user?.currentClass} class)</span> and <span className="text-white">Skills</span> to build a step-by-step path to your dream career.
           </p>
        </div>

        {/* Input Box */}
        <div className="max-w-3xl mx-auto bg-slate-900/40 border border-slate-800 p-2 rounded-[32px] shadow-2xl backdrop-blur-xl">
           <form onSubmit={handleGenerate} className="flex flex-col md:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                 <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                 <input 
                    type="text" 
                    placeholder="What is your goal? (e.g. Software Engineer, IAS, Data Scientist)"
                    className="w-full bg-transparent border-none p-5 pl-16 text-white font-bold outline-none placeholder:text-slate-600"
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value)}
                 />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 px-10 py-5 rounded-[26px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={16}/> Build Roadmap</>}
              </button>
           </form>
        </div>

        {/* Roadmap Display Area */}
        {roadmap && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 bg-slate-900/40 border border-slate-800 p-8 md:p-12 rounded-[48px] shadow-3xl prose prose-invert prose-indigo max-w-none">
             <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-6">
                <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-600/20"><MapIcon size={24}/></div>
                <div>
                   <h2 className="text-2xl font-black italic m-0 tracking-tight">THE MASTER PLAN</h2>
                   <p className="text-slate-500 text-xs font-black uppercase tracking-widest m-0">Generated for {user?.fullName}</p>
                </div>
             </div>
             
             {/* Markdown Content (AI Output) */}
             <div className="text-slate-300 leading-relaxed font-medium">
                <ReactMarkdown>{roadmap}</ReactMarkdown>
             </div>

             <div className="mt-12 p-8 bg-indigo-600/5 border border-dashed border-indigo-500/20 rounded-3xl text-center">
                <p className="text-indigo-400 text-sm font-bold italic">"Consistency is the key. Follow this plan and update your CGPA tracker regularly."</p>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiRoadmap;