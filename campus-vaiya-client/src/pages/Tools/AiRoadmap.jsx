import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  Sparkles, Target, Send, Loader2, Map as MapIcon,
  ChevronRight, RotateCcw, Copy, Check, Zap
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const QUICK_GOALS = [
  'Software Engineer', 'Data Scientist', 'Product Manager',
  'IAS Officer', 'Doctor (MBBS)', 'Cybersecurity Analyst',
];

const AiRoadmap = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading]       = useState(false);
  const [targetGoal, setTargetGoal] = useState('');
  const [roadmap, setRoadmap]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied]         = useState(false);
  const roadmapRef                  = useRef(null);

  const generate = async (goal) => {
    const q = (goal || targetGoal).trim();
    if (!q) return toast.error('Please enter your career goal!');
    setLoading(true);
    setRoadmap('');
    setSuggestions([]);
    try {
      const res = await API.post('/tools/generate-roadmap', { targetGoal: q });
      setRoadmap(res.data.roadmap);
      setSuggestions(res.data.suggestions || []);
      toast.success('Your personalized roadmap is ready!');
      setTimeout(() => roadmapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } catch (err) {
      console.error('Roadmap error:', err.response || err);
      toast.error(err.response?.data?.message || 'AI is busy, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); generate(); };

  const handleSuggestion = (text) => {
    setTargetGoal(text);
    generate(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(roadmap).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Header ── */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[11px] font-black uppercase tracking-widest">
            <Sparkles size={13} /> AI-Powered Career Advisor
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              Roadmap
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm font-medium leading-relaxed">
            Powered by your real CGPA
            {user?.currentClass ? ` (${user.currentClass})` : ''} and skills.
            Not generic advice — a plan built for <span className="text-white font-bold">you</span>.
          </p>
        </div>

        {/* ── Quick-goal chips ── */}
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_GOALS.map(g => (
            <button
              key={g}
              onClick={() => { setTargetGoal(g); generate(g); }}
              disabled={loading}
              className="px-4 py-1.5 bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/40 rounded-full text-xs font-semibold text-slate-300 hover:text-indigo-300 transition-all disabled:opacity-40"
            >
              {g}
            </button>
          ))}
        </div>

        {/* ── Input bar ── */}
        <div className="max-w-3xl mx-auto bg-slate-900/60 border border-slate-700/60 p-2 rounded-[32px] shadow-2xl shadow-indigo-950/40 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Target className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="e.g. Software Engineer, Data Scientist, IAS Officer…"
                className="w-full bg-transparent border-none p-4 pl-14 text-white font-semibold outline-none placeholder:text-slate-600 text-sm"
                value={targetGoal}
                onChange={e => setTargetGoal(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-8 py-4 rounded-[26px] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</>
                : <><Send size={14} /> Build Roadmap</>
              }
            </button>
          </form>
        </div>

        {/* ── Loading state ── */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-slate-500">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-indigo-600/30 border-t-indigo-500 animate-spin" />
              <Sparkles size={20} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
            </div>
            <p className="text-sm font-semibold">Analyzing your real academic profile…</p>
          </div>
        )}

        {/* ── Roadmap output ── */}
        {roadmap && !loading && (
          <div ref={roadmapRef} className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">

            {/* Card header */}
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-950/30 backdrop-blur-xl">

              {/* Top bar */}
              <div className="flex items-center justify-between gap-4 px-8 pt-8 pb-6 border-b border-slate-800/60">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-600/25">
                    <MapIcon size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic tracking-tight m-0">THE MASTER PLAN</h2>
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest m-0">
                      Built for {user?.fullName || 'you'} · Based on real data
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
                    title="Copy roadmap"
                  >
                    {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                  </button>
                  <button
                    onClick={() => { setRoadmap(''); setSuggestions([]); setTargetGoal(''); }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
                    title="Start over"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>

              {/* Markdown content */}
              <div className="px-8 md:px-12 py-8 prose prose-invert prose-indigo max-w-none
                prose-h2:text-lg prose-h2:font-black prose-h2:tracking-tight prose-h2:mt-8 prose-h2:mb-3
                prose-h3:text-base prose-h3:font-bold prose-h3:text-indigo-300 prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm
                prose-li:text-slate-300 prose-li:text-sm prose-li:leading-relaxed prose-li:marker:text-indigo-500
                prose-strong:text-white prose-strong:font-bold
                prose-hr:border-slate-800">
                <ReactMarkdown>{roadmap}</ReactMarkdown>
              </div>

              {/* Closing quote */}
              <div className="mx-8 mb-8 p-6 bg-gradient-to-r from-indigo-600/5 to-violet-600/5 border border-dashed border-indigo-500/20 rounded-2xl text-center">
                <p className="text-indigo-400 text-xs font-bold italic m-0">
                  "Consistency beats talent when talent doesn't show up. Execute this plan daily."
                </p>
              </div>
            </div>

            {/* ── Follow-up suggestion chips ── */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Zap size={13} className="text-indigo-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Ask a follow-up
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(s)}
                      disabled={loading}
                      className="group flex items-center gap-3 w-full text-left px-5 py-3.5 bg-slate-900/40 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/30 rounded-2xl transition-all disabled:opacity-40"
                    >
                      <ChevronRight
                        size={15}
                        className="shrink-0 text-slate-600 group-hover:text-indigo-400 transition-colors"
                      />
                      <span className="text-sm text-slate-400 group-hover:text-slate-200 font-medium transition-colors">
                        {s}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default AiRoadmap;
