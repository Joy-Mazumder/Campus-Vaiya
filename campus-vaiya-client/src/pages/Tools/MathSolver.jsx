import React, { useState, useRef } from 'react';
import { Calculator, Send, Loader2, RotateCcw, Copy, Check, ChevronRight, Globe } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const LEVELS = ['Class 8', 'Class 9-10', 'HSC / Class 11-12'];

const EXAMPLE_PROBLEMS = [
  'একটি ত্রিভুজের তিনটি বাহুর দৈর্ঘ্য ৩, ৪, এবং ৫ সেমি। ত্রিভুজটির ক্ষেত্রফল নির্ণয় করো।',
  'যদি 2x + 5 = 17 হয়, তাহলে x এর মান কত?',
  'একটি বৃত্তের ব্যাসার্ধ ৭ সেমি হলে এর পরিধি ও ক্ষেত্রফল নির্ণয় করো।',
  'একটি দোকানদার ৫০০ টাকায় একটি জিনিস কিনে ২০% লাভে বিক্রি করলে বিক্রয়মূল্য কত?',
];

const EXAMPLE_PROBLEMS_EN = [
  'A triangle has sides of length 3, 4, and 5 cm. Find the area of the triangle.',
  'If 2x + 5 = 17, what is the value of x?',
  'If the radius of a circle is 7 cm, find its circumference and area.',
  'A shopkeeper buys an item for 500 taka and sells it at a 20% profit. What is the selling price?',
];

const T = {
  bn: {
    badge: 'Math Word Problem Solver',
    title: 'গণিত সমাধানকারী',
    subtitle: 'বাংলা বা ইংরেজিতে যেকোনো অঙ্ক লিখুন — step-by-step সমাধান পাবেন',
    examplesLabel: 'উদাহরণ সমস্যা',
    placeholder: 'এখানে আপনার গণিতের সমস্যা লিখুন... (বাংলা বা ইংরেজি)',
    solving: 'সমাধান করছি...',
    solve: 'সমাধান করো',
    resultTitle: 'সমাধান',
    moreLabel: 'আরও জিজ্ঞেস করুন',
    noInput: 'অঙ্কটি লিখুন!',
    success: 'সমাধান প্রস্তুত!',
    error: 'সমাধান করতে পারিনি। আবার চেষ্টা করুন।',
  },
  en: {
    badge: 'Math Word Problem Solver',
    title: 'Math Problem Solver',
    subtitle: 'Write any problem in Bangla or English — get a step-by-step solution',
    examplesLabel: 'Example Problems',
    placeholder: 'Type your math problem here... (Bangla or English)',
    solving: 'Solving...',
    solve: 'Solve',
    resultTitle: 'Solution',
    moreLabel: 'Ask More',
    noInput: 'Please enter a problem!',
    success: 'Solution ready!',
    error: 'Could not solve. Please try again.',
  },
};

const MathSolver = () => {
  const [problem, setProblem]         = useState('');
  const [level, setLevel]             = useState('Class 9-10');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied]           = useState(false);
  const [lang, setLang]               = useState('bn');
  const resultRef                     = useRef(null);

  const t = T[lang];
  const examples = lang === 'en' ? EXAMPLE_PROBLEMS_EN : EXAMPLE_PROBLEMS;

  const solve = async (problemText) => {
    const q = (problemText || problem).trim();
    if (!q) return toast.error(t.noInput);
    setLoading(true);
    setResult('');
    setSuggestions([]);
    try {
      const res = await API.post('/student-tools/math-solver', { problem: q, level });
      setResult(res.data.result);
      setSuggestions(res.data.suggestions || []);
      toast.success(t.success);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } catch (err) {
      toast.error(err.response?.data?.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); solve(); };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => { setProblem(''); setResult(''); setSuggestions([]); };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-3xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-4">
            <Calculator className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">{t.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        {/* Example problems */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.examplesLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => { setProblem(ex); solve(ex); }}
                className="text-left text-sm text-gray-300 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 rounded-xl px-4 py-3 transition-all duration-200"
              >
                {ex.length > 70 ? ex.slice(0, 70) + '...' : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  level === l
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder={t.placeholder}
            rows={4}
            className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none outline-none border-b border-white/10 pb-4 mb-4"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !problem.trim()}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? t.solving : t.solve}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div ref={resultRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-400 font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" /> {t.resultTitle}
              </h3>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.moreLabel}</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setProblem(s); solve(s); }}
                  className="flex items-center gap-2 text-left text-sm text-gray-300 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 rounded-xl px-4 py-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathSolver;
