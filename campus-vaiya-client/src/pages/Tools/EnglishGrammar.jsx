import React, { useState, useRef } from 'react';
import { Languages, Send, Loader2, RotateCcw, Copy, Check, ChevronRight, Globe } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const MODES = [
  { value: 'fix',       labelBn: 'Grammar Fix',       labelEn: 'Grammar Fix',       descBn: 'English text এর ভুল ঠিক করবে',        descEn: 'Fix errors in your English text' },
  { value: 'translate', labelBn: 'Bangla to English', labelEn: 'Bangla to English', descBn: 'বাংলা থেকে ইংরেজিতে অনুবাদ করবে',     descEn: 'Translate Bangla text into English' },
  { value: 'both',      labelBn: 'Translate + Tips',  labelEn: 'Translate + Tips',  descBn: 'অনুবাদ + common mistake দেখাবে',       descEn: 'Translation with common mistake tips' },
];

const EXAMPLES = {
  fix: [
    'I am go to school yesterday with my friends.',
    "She don't know the answer of this question.",
    'We was playing football in the field when it start raining.',
  ],
  translate: [
    'বাংলাদেশ একটি সুন্দর দেশ যেখানে অনেক নদী আছে।',
    'আমি প্রতিদিন সকালে উঠে পড়াশোনা করি।',
    'পরিবেশ দূষণ আমাদের দেশের একটি বড় সমস্যা।',
  ],
  both: [
    'বায়ু দূষণ মানুষের স্বাস্থ্যের জন্য খুবই ক্ষতিকর।',
    'শিক্ষা জাতির মেরুদণ্ড।',
    'প্রযুক্তি আমাদের জীবনকে সহজ করে তুলেছে।',
  ],
};

const T = {
  bn: {
    title: 'English Grammar & Translator',
    subtitle: 'Grammar ঠিক করুন বা বাংলা থেকে ইংরেজিতে অনুবাদ করুন — SSC/HSC English 2nd Paper',
    examplesLabel: 'উদাহরণ',
    inputLabel: (mode) => mode === 'fix' ? 'আপনার English text লিখুন:' : 'আপনার বাংলা text লিখুন:',
    placeholder: (mode) => mode === 'fix' ? 'English text লিখুন...' : 'বাংলা text লিখুন...',
    processing: 'প্রসেস করছি...',
    resultTitle: 'ফলাফল',
    moreLabel: 'আরও সাহায্য',
    noInput: 'Text লিখুন!',
    success: 'সম্পন্ন!',
    error: 'আবার চেষ্টা করুন।',
  },
  en: {
    title: 'English Grammar & Translator',
    subtitle: 'Fix grammar errors or translate Bangla to English — perfect for SSC/HSC English 2nd Paper',
    examplesLabel: 'Examples',
    inputLabel: (mode) => mode === 'fix' ? 'Enter your English text:' : 'Enter your Bangla text:',
    placeholder: (mode) => mode === 'fix' ? 'Type your English text here...' : 'Type your Bangla text here...',
    processing: 'Processing...',
    resultTitle: 'Result',
    moreLabel: 'More Help',
    noInput: 'Please enter some text!',
    success: 'Done!',
    error: 'Please try again.',
  },
};

const EnglishGrammar = () => {
  const [text, setText]               = useState('');
  const [mode, setMode]               = useState('fix');
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied]           = useState(false);
  const [lang, setLang]               = useState('bn');
  const resultRef                     = useRef(null);

  const t = T[lang];

  const process = async (inputText) => {
    const q = (inputText || text).trim();
    if (!q) return toast.error(t.noInput);
    setLoading(true);
    setResult('');
    setSuggestions([]);
    try {
      const res = await API.post('/student-tools/grammar-fixer', { text: q, mode });
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

  const handleSubmit = (e) => { e.preventDefault(); process(); };
  const handleExample = (ex) => { setText(ex); process(ex); };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => { setText(''); setResult(''); setSuggestions([]); };

  const currentMode = MODES.find((m) => m.value === mode);

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-3xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-purple-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-full px-5 py-2 mb-4">
            <Languages className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">English Grammar Fixer + Translator</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); setResult(''); setSuggestions([]); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                mode === m.value
                  ? 'bg-purple-500/20 border-purple-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="font-medium text-sm mb-1">{lang === 'en' ? m.labelEn : m.labelBn}</div>
              <div className="text-xs opacity-70">{lang === 'en' ? m.descEn : m.descBn}</div>
            </button>
          ))}
        </div>

        {/* Examples */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.examplesLabel}</p>
          <div className="flex flex-col gap-2">
            {EXAMPLES[mode].map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex)}
                className="text-left text-sm text-gray-300 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-xl px-4 py-3 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <p className="text-gray-400 text-xs mb-3">{t.inputLabel(mode)}</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder(mode)}
            rows={5}
            className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none outline-none border-b border-white/10 pb-4 mb-4"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? t.processing : (lang === 'en' ? currentMode?.labelEn : currentMode?.labelBn)}
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div ref={resultRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-400 font-semibold flex items-center gap-2">
                <Languages className="w-4 h-4" /> {t.resultTitle}
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
                  onClick={() => { setText(s); process(s); }}
                  className="flex items-center gap-2 text-left text-sm text-gray-300 bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 rounded-xl px-4 py-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
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

export default EnglishGrammar;
