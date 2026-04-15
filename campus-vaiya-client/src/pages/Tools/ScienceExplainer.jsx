import React, { useState, useRef } from 'react';
import { FlaskConical, Send, Loader2, RotateCcw, Copy, Check, ChevronRight, Globe } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'General Science'];
const LEVELS   = ['Class 8', 'Class 9-10', 'HSC / Class 11-12'];

const POPULAR_CONCEPTS = [
  'Photosynthesis',
  "Newton's Laws of Motion",
  "Ohm's Law",
  'Osmosis and Diffusion',
  'Chemical Bonding',
  'Heredity and Genetics',
  'Electromagnetic Induction',
  'Acid-Base Reaction',
];

const T = {
  bn: {
    badge: 'Science Concept Explainer',
    title: 'বিজ্ঞান ব্যাখ্যাকারী',
    subtitle: 'যেকোনো বিজ্ঞানের concept লিখুন — সহজ বাংলায় ব্যাখ্যা পাবেন',
    popularLabel: 'জনপ্রিয় টপিক',
    subjectLabel: 'বিষয়',
    levelLabel: 'ক্লাস / লেভেল',
    placeholder: 'Concept লিখুন... (যেমন: Photosynthesis, তড়িৎপ্রবাহ, অভিস্রবণ)',
    explaining: 'ব্যাখ্যা করছি...',
    explain: 'ব্যাখ্যা করো',
    resultTitle: 'ব্যাখ্যা',
    moreLabel: 'আরও জানুন',
    noInput: 'Concept লিখুন!',
    success: 'ব্যাখ্যা প্রস্তুত!',
    error: 'ব্যাখ্যা করতে পারিনি। আবার চেষ্টা করুন।',
  },
  en: {
    badge: 'Science Concept Explainer',
    title: 'Science Explainer',
    subtitle: 'Enter any science concept — get a clear, simple explanation',
    popularLabel: 'Popular Topics',
    subjectLabel: 'Subject',
    levelLabel: 'Class / Level',
    placeholder: 'Enter a concept... (e.g. Photosynthesis, Electric Current, Osmosis)',
    explaining: 'Explaining...',
    explain: 'Explain',
    resultTitle: 'Explanation',
    moreLabel: 'Learn More',
    noInput: 'Please enter a concept!',
    success: 'Explanation ready!',
    error: 'Could not explain. Please try again.',
  },
};

const ScienceExplainer = () => {
  const [concept, setConcept]         = useState('');
  const [subject, setSubject]         = useState('General Science');
  const [level, setLevel]             = useState('Class 9-10');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied]           = useState(false);
  const [lang, setLang]               = useState('bn');
  const resultRef                     = useRef(null);

  const t = T[lang];

  const explain = async (conceptText) => {
    const q = (conceptText || concept).trim();
    if (!q) return toast.error(t.noInput);
    setLoading(true);
    setResult('');
    setSuggestions([]);
    try {
      const res = await API.post('/student-tools/science-explainer', { concept: q, subject, level });
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

  const handleSubmit = (e) => { e.preventDefault(); explain(); };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => { setConcept(''); setResult(''); setSuggestions([]); };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-3xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-green-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 mb-4">
            <FlaskConical className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm font-medium">{t.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        {/* Popular concepts */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.popularLabel}</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CONCEPTS.map((c) => (
              <button
                key={c}
                onClick={() => { setConcept(c); explain(c); }}
                className="text-sm text-gray-300 bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-full px-4 py-1.5 transition-all"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">

          {/* Subject selector */}
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">{t.subjectLabel}</p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    subject === s
                      ? 'bg-green-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Level selector */}
          <div className="mb-5">
            <p className="text-gray-400 text-xs mb-2">{t.levelLabel}</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    level === l
                      ? 'bg-green-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder={t.placeholder}
            className="w-full bg-transparent text-white placeholder-gray-500 text-base outline-none border-b border-white/10 pb-4 mb-4"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !concept.trim()}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? t.explaining : t.explain}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div ref={resultRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-400 font-semibold flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> {t.resultTitle}
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
                  onClick={() => { setConcept(s); explain(s); }}
                  className="flex items-center gap-2 text-left text-sm text-gray-300 bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 rounded-xl px-4 py-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-green-400 shrink-0" />
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

export default ScienceExplainer;
