import React, { useState, useRef } from 'react';
import { Library, Send, Loader2, RotateCcw, Copy, Check, ChevronRight, Globe } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const LEVELS = ['Undergraduate', 'Masters', 'PhD'];

const FIELDS = [
  'Computer Science', 'Engineering', 'Medicine / Health Sciences',
  'Business & Economics', 'Social Sciences', 'Education',
  'Environmental Science', 'Agriculture', 'Law', 'Other',
];

const POPULAR_TOPICS = [
  'Machine Learning in Healthcare',
  'Climate Change and Food Security',
  'E-learning Effectiveness',
  'Microfinance and Poverty Reduction',
  'Cybersecurity Threats in Developing Countries',
  'Urban Air Pollution in South Asia',
];

const T = {
  bn: {
    badge: 'Literature Review Assistant',
    title: 'Literature Review Assistant',
    subtitle: 'Research topic দিন — structured literature review, themes, gaps সহ পাবেন',
    popularLabel: 'জনপ্রিয় টপিক',
    fieldLabel: 'Research Field',
    levelLabel: 'Academic Level',
    placeholder: 'Research topic লিখুন... (যেমন: AI in Education, Climate Change in Bangladesh)',
    generating: 'তৈরি করছি...',
    generate: 'Literature Review তৈরি করো',
    resultTitle: 'Literature Review',
    moreLabel: 'আরও জানুন',
    noInput: 'Research topic লিখুন।',
    success: 'Literature review প্রস্তুত!',
    error: 'তৈরি করতে পারিনি। আবার চেষ্টা করুন।',
  },
  en: {
    badge: 'Literature Review Assistant',
    title: 'Literature Review Assistant',
    subtitle: 'Enter a research topic — get a structured literature review with themes and gaps',
    popularLabel: 'Popular Topics',
    fieldLabel: 'Research Field',
    levelLabel: 'Academic Level',
    placeholder: 'Enter your research topic... (e.g. AI in Education, Climate Change in Bangladesh)',
    generating: 'Generating...',
    generate: 'Generate Literature Review',
    resultTitle: 'Literature Review',
    moreLabel: 'Learn More',
    noInput: 'Please enter a research topic.',
    success: 'Literature review ready!',
    error: 'Could not generate. Please try again.',
  },
};

const LiteratureReview = () => {
  const [topic, setTopic]             = useState('');
  const [field, setField]             = useState('Computer Science');
  const [level, setLevel]             = useState('Undergraduate');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied]           = useState(false);
  const [lang, setLang]               = useState('bn');
  const resultRef                     = useRef(null);

  const t = T[lang];

  const generate = async (topicText) => {
    const q = (topicText || topic).trim();
    if (!q) return toast.error(t.noInput);
    setLoading(true);
    setResult('');
    setSuggestions([]);
    try {
      const res = await API.post('/student-tools/literature-review', { topic: q, field, level });
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

  const handleSubmit = (e) => { e.preventDefault(); generate(); };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => { setTopic(''); setResult(''); setSuggestions([]); };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-3xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-5 py-2 mb-4">
            <Library className="w-5 h-5 text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium">{t.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        {/* Popular topics */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.popularLabel}</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TOPICS.map((tp) => (
              <button
                key={tp}
                onClick={() => { setTopic(tp); generate(tp); }}
                className="text-sm text-gray-300 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 rounded-full px-4 py-1.5 transition-all"
              >
                {tp}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">

          {/* Field */}
          <div className="mb-5">
            <p className="text-gray-400 text-xs mb-2">{t.fieldLabel}</p>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full bg-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-white/10 focus:border-indigo-500/50 transition-all"
            >
              {FIELDS.map((f) => <option key={f} value={f} className="bg-[#020617]">{f}</option>)}
            </select>
          </div>

          {/* Level */}
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
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.placeholder}
            className="w-full bg-transparent text-white placeholder-gray-500 text-base outline-none border-b border-white/10 pb-4 mb-4"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? t.generating : t.generate}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div ref={resultRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-indigo-400 font-semibold flex items-center gap-2">
                <Library className="w-4 h-4" /> {t.resultTitle}
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
                  onClick={() => { setTopic(s); generate(s); }}
                  className="flex items-center gap-2 text-left text-sm text-gray-300 bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 rounded-xl px-4 py-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
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

export default LiteratureReview;
