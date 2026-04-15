import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, RotateCcw, Copy, Check, ChevronRight, ImageIcon, Globe } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const SUBJECTS = ['General', 'Math', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'English'];

const T = {
  bn: {
    badge: 'Handwritten Notes Digitizer',
    title: 'Notes Digitizer & Summarizer',
    subtitle: 'হাতে লেখা notes এর ছবি তুলুন — AI টাইপ করে দেবে + সারাংশ তৈরি করবে',
    subjectLabel: 'বিষয়',
    uploadTitle: 'ছবি আপলোড করুন বা drag করুন',
    uploadSub: 'JPG, PNG, WEBP — সর্বোচ্চ ৫MB',
    uploadBtn: 'ছবি বেছে নিন',
    digitizeBtn: 'Notes Digitize করো',
    digitizing: 'Digitize করছি...',
    resultTitle: 'Digitized Notes',
    nextLabel: 'পরবর্তী পদক্ষেপ',
    noImage: 'প্রথমে একটি ছবি আপলোড করুন।',
    success: 'Notes digitize হয়ে গেছে!',
    error: 'Digitize করতে পারিনি। আবার চেষ্টা করুন।',
    typeError: 'শুধু JPG, PNG, WEBP ছবি আপলোড করুন।',
    sizeError: 'ছবির সাইজ ৫MB এর বেশি হওয়া যাবে না।',
  },
  en: {
    badge: 'Handwritten Notes Digitizer',
    title: 'Notes Digitizer & Summarizer',
    subtitle: 'Take a photo of handwritten notes — AI types it all out and creates a summary',
    subjectLabel: 'Subject',
    uploadTitle: 'Upload an image or drag and drop',
    uploadSub: 'JPG, PNG, WEBP — max 5MB',
    uploadBtn: 'Choose Image',
    digitizeBtn: 'Digitize Notes',
    digitizing: 'Digitizing...',
    resultTitle: 'Digitized Notes',
    nextLabel: 'Next Steps',
    noImage: 'Please upload an image first.',
    success: 'Notes digitized successfully!',
    error: 'Could not digitize. Please try again.',
    typeError: 'Only JPG, PNG, WEBP images are allowed.',
    sizeError: 'Image size must not exceed 5MB.',
  },
};

const HandwrittenNotes = () => {
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64]   = useState('');
  const [mimeType, setMimeType]         = useState('image/jpeg');
  const [subject, setSubject]           = useState('General');
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState('');
  const [suggestions, setSuggestions]   = useState([]);
  const [copied, setCopied]             = useState(false);
  const [lang, setLang]                 = useState('bn');
  const fileInputRef                    = useRef(null);
  const resultRef                       = useRef(null);

  const t = T[lang];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error(t.typeError);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.sizeError);
      return;
    }

    setImageFile(file);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  };

  const digitize = async () => {
    if (!imageBase64) return toast.error(t.noImage);
    setLoading(true);
    setResult('');
    setSuggestions([]);
    try {
      const res = await API.post('/student-tools/digitize-notes', {
        imageBase64: `data:${mimeType};base64,${imageBase64}`,
        mimeType,
        subject,
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

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview('');
    setImageBase64('');
    setResult('');
    setSuggestions([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-3xl mx-auto">

        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300 shadow-lg"
          >
            <Globe className="w-4 h-4 text-orange-400" />
            {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-full px-5 py-2 mb-4">
            <Camera className="w-5 h-5 text-orange-400" />
            <span className="text-orange-300 text-sm font-medium">{t.badge}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-3">
            {t.title}
          </h1>
          <p className="text-gray-400 text-base">{t.subtitle}</p>
        </div>

        {/* Subject selector */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{t.subjectLabel}</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  subject === s
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Upload area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="mb-6"
        >
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={imagePreview} alt="Notes preview" className="w-full max-h-80 object-contain bg-black/30" />
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="notes-upload"
              className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/20 hover:border-orange-500/40 rounded-2xl p-12 cursor-pointer transition-all bg-white/5 hover:bg-orange-500/5"
            >
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium mb-1">{t.uploadTitle}</p>
                <p className="text-gray-500 text-sm">{t.uploadSub}</p>
              </div>
              <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-5 py-2 rounded-full text-sm font-medium">
                <Upload className="w-4 h-4" />
                {t.uploadBtn}
              </div>
            </label>
          )}
          <input
            id="notes-upload"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {imageBase64 && (
          <div className="flex justify-end mb-8">
            <button
              onClick={digitize}
              disabled={loading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {loading ? t.digitizing : t.digitizeBtn}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-orange-400 font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4" /> {t.resultTitle}
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
                  className="flex items-center gap-2 text-left text-sm text-gray-300 bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-xl px-4 py-3 transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" />
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

export default HandwrittenNotes;
