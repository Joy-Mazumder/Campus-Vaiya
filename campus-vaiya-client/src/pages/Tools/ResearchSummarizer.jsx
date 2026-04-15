import React, { useState, useRef } from 'react';
import { BookOpen, Send, Loader2, RotateCcw, Copy, Check, ChevronRight, Globe } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const EXAMPLE_ABSTRACTS = [
  {
    title: 'Climate Change and Agriculture',
    text: 'This study examines the impact of climate change on agricultural productivity in South Asia. Using panel data from 1990-2020 across five countries, we find that rising temperatures have reduced crop yields by an average of 8.3% per decade. The research employs fixed-effects regression models and satellite-derived vegetation indices to quantify these effects. Our findings suggest that without immediate adaptation strategies, food security in the region could be severely compromised by 2050.',
  },
  {
    title: 'Machine Learning in Healthcare',
    text: 'We present a deep learning framework for early detection of diabetic retinopathy using fundus photographs. The proposed convolutional neural network was trained on 80,000 retinal images and achieved 94.5% sensitivity and 93.2% specificity. The model was validated across three clinical sites in Bangladesh, India, and Thailand, demonstrating robust cross-site generalizability. This approach could enable large-scale screening in resource-limited settings where ophthalmologists are scarce.',
  },
];

const T = {
  bn: {
    badge: 'Research Paper Summarizer',
    title: 'Research Paper Summarizer',
    subtitle: 'Journal paper বা abstract paste করুন — সহজ ভাষায় বুঝিয়ে দেবে',
    examplesLabel: 'উদাহরণ দিয়ে চেষ্টা করুন',
    titlePlaceholder: 'Paper এর শিরোনাম (ঐচ্ছিক)',
    textPlaceholder: 'এখানে research paper এর abstract বা যেকোনো অংশ paste করুন... (সর্বোচ্চ ~৩০০০ শব্দ)',
    summarizing: 'Summarize করছি...',
    summarize: 'Summarize করো',
    resultTitle: 'সারাংশ',
    moreLabel: 'আরও জানুন',
    noInput: 'Paper এর text বা abstract paste করুন।',
    success: 'Summary প্রস্তুত!',
    error: 'Summary করতে পারিনি। আবার চেষ্টা করুন।',
  },
  en: {
    badge: 'Research Paper Summarizer',
    title: 'Research Paper Summarizer',
    subtitle: 'Paste a journal paper or abstract — get a clear, simple explanation',
    examplesLabel: 'Try with an Example',
    titlePlaceholder: 'Paper title (optional)',
    textPlaceholder: 'Paste the abstract or any section of a research paper here... (max ~3000 words)',
    summarizing: 'Summarizing...',
    summarize: 'Summarize',
    resultTitle: 'Summary',
    moreLabel: 'Learn More',
    noInput: 'Please paste the paper text or abstract.',
    success: 'Summary ready!',
    error: 'Could not summarize. Please try again.',
  },
};

const ResearchSummarizer = () => {
  const [text, setText]               = useState('');
  const [title, setTitle]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied]           = useState(false);
  const [lang, setLang]               = useState('bn');
  const resultRef                     = useRef(null);

  const t = T[lang];

  const summarize = async (inputText, inputTitle) => {
    const q = (inputText || text).trim();
    if (!q) return toast.error(t.noInput);
    setLoading(true);
    setResult('');
    setSuggestions([]);
    try {
      const res = await API.post('/student-tools/research-summarizer', {
        text: q,
        title: inputTitle !== undefined ? inputTitle : title,
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

  const handleSubmit = (e) => { e.preventDefault(); summarize(); };

  const handleExample = (ex) => {
    setText(ex.text);
    setTitle(ex.title);
    summarize(ex.text, ex.title);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => { setText(''); setTitle(''); setResult(''); setSuggestions([]); };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-3xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-5 py-2 mb-4">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">{t.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        {/* Examples */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.examplesLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAMPLE_ABSTRACTS.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex)}
                className="text-left p-4 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 transition-all"
              >
                <p className="text-cyan-300 font-medium text-sm mb-1">{ex.title}</p>
                <p className="text-gray-500 text-xs line-clamp-2">{ex.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm outline-none border-b border-white/10 pb-3 mb-4"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.textPlaceholder}
            rows={8}
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none border-b border-white/10 pb-4 mb-4"
          />
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-xs">{text.length} / ~15000 characters</p>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? t.summarizing : t.summarize}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div ref={resultRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-cyan-400 font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {t.resultTitle}
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
                  onClick={() => { setText(s); summarize(s, ''); }}
                  className="flex items-center gap-2 text-left text-sm text-gray-300 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 rounded-xl px-4 py-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
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

export default ResearchSummarizer;
