import React, { useState, useRef } from 'react';
import { Search, Send, Loader2, RotateCcw, Copy, Check, ChevronRight, Telescope, Globe } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const FIELDS = [
  'Computer Science & AI', 'Public Health & Medicine', 'Engineering',
  'Social Sciences', 'Business & Economics', 'Environmental Science',
  'Education', 'Agriculture & Food Science', 'Law & Governance', 'Other',
];

const EXAMPLES = [
  { topic: 'Natural Language Processing for Bangla Language', field: 'Computer Science & AI' },
  { topic: 'Mental Health of University Students in Bangladesh', field: 'Public Health & Medicine' },
  { topic: 'Renewable Energy Adoption in Rural Bangladesh', field: 'Environmental Science' },
  { topic: 'E-commerce Growth in Developing Countries', field: 'Business & Economics' },
];

const T = {
  bn: {
    badge: 'Research Gap Finder',
    title: 'Research Gap Finder',
    subtitle: 'Topic দিন — PhD/Masters এর জন্য unexplored research gaps বের করে দেবে',
    examplesLabel: 'উদাহরণ topics',
    fieldLabel: 'Research Field',
    topicPlaceholder: 'Research topic লিখুন...',
    contextPlaceholder: '(ঐচ্ছিক) আপনার context বা focus area লিখুন — যেমন: Bangladesh context, mobile users, rural population...',
    searching: 'খুঁজছি...',
    search: 'Research Gaps খোঁজো',
    resultTitle: 'Research Gaps',
    nextLabel: 'পরবর্তী পদক্ষেপ',
    noInput: 'Research topic লিখুন।',
    success: 'Research gaps পাওয়া গেছে!',
    error: 'খুঁজে পাইনি। আবার চেষ্টা করুন।',
  },
  en: {
    badge: 'Research Gap Finder',
    title: 'Research Gap Finder',
    subtitle: 'Enter a topic — discover unexplored research gaps for your PhD or Masters',
    examplesLabel: 'Example Topics',
    fieldLabel: 'Research Field',
    topicPlaceholder: 'Enter your research topic...',
    contextPlaceholder: '(Optional) Describe your focus area — e.g. Bangladesh context, mobile users, rural population...',
    searching: 'Searching...',
    search: 'Find Research Gaps',
    resultTitle: 'Research Gaps',
    nextLabel: 'Next Steps',
    noInput: 'Please enter a research topic.',
    success: 'Research gaps found!',
    error: 'Could not find gaps. Please try again.',
  },
};

const ResearchGapFinder = () => {
  const [topic, setTopic]             = useState('');
  const [field, setField]             = useState('Computer Science & AI');
  const [context, setContext]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied]           = useState(false);
  const [lang, setLang]               = useState('bn');
  const resultRef                     = useRef(null);

  const t = T[lang];

  const findGaps = async (topicText, fieldText) => {
    const q = (topicText || topic).trim();
    if (!q) return toast.error(t.noInput);
    setLoading(true);
    setResult('');
    setSuggestions([]);
    try {
      const res = await API.post('/student-tools/research-gap-finder', {
        topic: q,
        field: fieldText || field,
        context: context.trim(),
      });
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

  const handleSubmit = (e) => { e.preventDefault(); findGaps(); };

  const handleExample = (ex) => {
    setTopic(ex.topic);
    setField(ex.field);
    findGaps(ex.topic, ex.field);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => { setTopic(''); setContext(''); setResult(''); setSuggestions([]); };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-3xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-teal-500/50 hover:bg-teal-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-teal-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-teal-500/10 border border-teal-500/20 rounded-full px-5 py-2 mb-4">
            <Telescope className="w-5 h-5 text-teal-400" />
            <span className="text-teal-300 text-sm font-medium">{t.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        {/* Examples */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.examplesLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex)}
                className="text-left p-4 rounded-xl bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 transition-all"
              >
                <p className="text-teal-300 font-medium text-sm mb-1">{ex.topic}</p>
                <p className="text-gray-600 text-xs">{ex.field}</p>
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
              className="w-full bg-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none border border-white/10 focus:border-teal-500/50 transition-all"
            >
              {FIELDS.map((f) => <option key={f} value={f} className="bg-[#020617]">{f}</option>)}
            </select>
          </div>

          {/* Topic */}
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicPlaceholder}
            className="w-full bg-transparent text-white placeholder-gray-500 text-base outline-none border-b border-white/10 pb-4 mb-4"
          />

          {/* Optional context */}
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={t.contextPlaceholder}
            rows={3}
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none border-b border-white/10 pb-4 mb-4"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? t.searching : t.search}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div ref={resultRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-teal-400 font-semibold flex items-center gap-2">
                <Telescope className="w-4 h-4" /> {t.resultTitle}
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
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.nextLabel}</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setTopic(s); findGaps(s); }}
                  className="flex items-center gap-2 text-left text-sm text-gray-300 bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 rounded-xl px-4 py-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-teal-400 shrink-0" />
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

export default ResearchGapFinder;
