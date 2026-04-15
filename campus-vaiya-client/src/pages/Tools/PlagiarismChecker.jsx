import React, { useState, useRef } from 'react';
import { ShieldCheck, Send, Loader2, RotateCcw, Copy, Check, ChevronRight, AlertTriangle, Globe } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const T = {
  bn: {
    badge: 'Assignment Plagiarism Checker',
    title: 'Plagiarism Checker',
    subtitle: 'Assignment submit করার আগে নিজেই check করুন — AI-based originality analysis',
    disclaimer: 'এটি একটি AI-based self-check tool। Turnitin এর বিকল্প নয়, তবে submit করার আগে নিজের লেখা পরীক্ষা করার জন্য উপকারী।',
    inputLabel: 'আপনার assignment এর text paste করুন',
    placeholder: 'এখানে আপনার assignment, essay বা paragraph paste করুন...',
    checking: 'বিশ্লেষণ করছি...',
    check: 'Plagiarism Check করো',
    resultTitle: 'বিশ্লেষণ ফলাফল',
    nextLabel: 'পরবর্তী পদক্ষেপ',
    noInput: 'Text paste করুন।',
    tooShort: 'কমপক্ষে একটি paragraph লিখুন।',
    success: 'বিশ্লেষণ সম্পন্ন!',
    error: 'বিশ্লেষণ করতে পারিনি। আবার চেষ্টা করুন।',
  },
  en: {
    badge: 'Assignment Plagiarism Checker',
    title: 'Plagiarism Checker',
    subtitle: 'Self-check before submitting your assignment — AI-based originality analysis',
    disclaimer: 'This is an AI-based self-check tool. It is not a replacement for Turnitin, but it is useful for reviewing your writing before submission.',
    inputLabel: 'Paste your assignment text here',
    placeholder: 'Paste your assignment, essay, or paragraph here...',
    checking: 'Analyzing...',
    check: 'Check for Plagiarism',
    resultTitle: 'Analysis Result',
    nextLabel: 'Next Steps',
    noInput: 'Please paste some text.',
    tooShort: 'Please provide at least one paragraph.',
    success: 'Analysis complete!',
    error: 'Could not analyze. Please try again.',
  },
};

const PlagiarismChecker = () => {
  const [text, setText]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied]           = useState(false);
  const [lang, setLang]               = useState('bn');
  const resultRef                     = useRef(null);

  const t = T[lang];

  const check = async () => {
    const q = text.trim();
    if (!q) return toast.error(t.noInput);
    if (q.length < 100) return toast.error(t.tooShort);
    setLoading(true);
    setResult('');
    setSuggestions([]);
    try {
      const res = await API.post('/student-tools/plagiarism-checker', { text: q });
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

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => { setText(''); setResult(''); setSuggestions([]); };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-3xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-red-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-red-400" />
            <span className="text-red-300 text-sm font-medium">{t.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-300/80 text-sm">{t.disclaimer}</p>
        </div>

        {/* Input */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">{t.inputLabel}</p>
            <span className="text-gray-600 text-xs">{wordCount} words</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            rows={10}
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none border-b border-white/10 pb-4 mb-4"
          />
          <div className="flex justify-end">
            <button
              onClick={check}
              disabled={loading || text.trim().length < 100}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? t.checking : t.check}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div ref={resultRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-400 font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {t.resultTitle}
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
                  onClick={() => { setText(s); }}
                  className="flex items-center gap-2 text-left text-sm text-gray-300 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl px-4 py-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
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

export default PlagiarismChecker;
