import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, TrendingUp, BrainCircuit, ChevronRight, Zap,
  Calculator, FlaskConical, Languages, Camera, GitBranch,
  BookOpen, ShieldCheck, Library, Telescope,
  Sparkles, GraduationCap, Microscope, Star, Globe
} from 'lucide-react';

// ── Galaxy color palette ───────────────────────────────────────────────────────
const STAR_COLORS = [
  '#ffffff', '#67e8f9', '#a5b4fc', '#f9a8d4',
  '#fcd34d', '#6ee7b7', '#c4b5fd', '#7dd3fc',
  '#f0abfc', '#86efac', '#fdba74', '#fb7185',
  '#e0f2fe', '#ddd6fe', '#bbf7d0',
];

// ── Layer 1: 210 tiny rapid-twinkle SVG stars ─────────────────────────────────
const TINY_STARS = Array.from({ length: 210 }, (_, i) => ({
  id: i,
  x: (i * 7.31 + 2.5) % 100,
  y: (i * 13.71 + 5.3) % 100,
  r: 0.25 + (i % 6) * 0.18,
  dur: 0.55 + (i % 7) * 0.3,    // fast: 0.55s - 2.35s
  delay: (i % 13) * 0.4,
  color: STAR_COLORS[i % STAR_COLORS.length],
}));

// ── Layer 2: 34 medium drifting + glowing div stars ───────────────────────────
const DRIFT_NAMES = ['sdrift-a', 'sdrift-b', 'sdrift-c', 'sdrift-d', 'sdrift-e'];
const MED_STARS = Array.from({ length: 34 }, (_, i) => ({
  id: i,
  x: (i * 37.13 + 10.4) % 98,
  y: (i * 19.37 + 15.2) % 96,
  r: 1.3 + (i % 5) * 0.42,
  pulseDur: 1.0 + (i % 5) * 0.45,   // faster pulse: 1.0s - 2.8s
  pulseDelay: (i % 9) * 0.55,
  drift: DRIFT_NAMES[i % 5],
  driftDur: 11 + (i % 7) * 2.2,
  driftDelay: (i % 8) * 1.3,
  color: STAR_COLORS[(i + 2) % STAR_COLORS.length],
}));

// ── Layer 3: 13 big glow-pulse drifting div stars ─────────────────────────────
const BIG_DRIFT_NAMES = ['bdrift-a', 'bdrift-b', 'bdrift-c'];
const BIG_STARS = Array.from({ length: 13 }, (_, i) => ({
  id: i,
  x: (i * 31.41 + 18.5) % 90,
  y: (i * 27.83 + 9.7) % 88,
  r: 2.6 + (i % 5) * 0.8,
  glowDur: 2.8 + (i % 4) * 0.9,
  glowDelay: (i % 6) * 1.2,
  drift: BIG_DRIFT_NAMES[i % 3],
  driftDur: 18 + (i % 5) * 4.5,
  driftDelay: (i % 7) * 2,
  color: STAR_COLORS[(i + 5) % STAR_COLORS.length],
}));

// ── Layer 4: Shooting stars ────────────────────────────────────────────────────
const SHOOTING = [
  { id: 0, top: '7%',   left: '12%',  delay: '1.5s', dur: '4s',   color: '#67e8f9' },
  { id: 1, top: '20%',  left: '58%',  delay: '6.5s', dur: '5s',   color: '#a5b4fc' },
  { id: 2, top: '46%',  left: '2%',   delay: '12s',  dur: '4.5s', color: '#7dd3fc' },
  { id: 3, top: '63%',  left: '70%',  delay: '17s',  dur: '5.5s', color: '#f9a8d4' },
  { id: 4, top: '32%',  left: '82%',  delay: '22s',  dur: '4s',   color: '#6ee7b7' },
  { id: 5, top: '80%',  left: '30%',  delay: '28s',  dur: '5s',   color: '#c4b5fd' },
];

// ── StarField component (all layers) ──────────────────────────────────────────
const StarField = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">

    {/* Tiny rapid-twinkle SVG stars */}
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {TINY_STARS.map((s) => (
        <circle
          key={s.id}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill={s.color}
          style={{ opacity: 0, animation: `starTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite` }}
        />
      ))}
    </svg>

    {/* Medium drifting stars */}
    {MED_STARS.map((s) => (
      <div
        key={s.id}
        style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${s.r * 2}px`,
          height: `${s.r * 2}px`,
          borderRadius: '50%',
          background: s.color,
          boxShadow: `0 0 ${s.r * 5}px ${s.r * 2}px ${s.color}55`,
          opacity: 0,
          animation: `starTwinkle ${s.pulseDur}s ${s.pulseDelay}s ease-in-out infinite, ${s.drift} ${s.driftDur}s ${s.driftDelay}s ease-in-out infinite`,
        }}
      />
    ))}

    {/* Big glow-pulse drifting stars */}
    {BIG_STARS.map((s) => (
      <div
        key={s.id}
        style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: `${s.r * 2}px`,
          height: `${s.r * 2}px`,
          borderRadius: '50%',
          background: s.color,
          boxShadow: `0 0 ${s.r * 7}px ${s.r * 3}px ${s.color}70, 0 0 ${s.r * 14}px ${s.r * 5}px ${s.color}30`,
          opacity: 0,
          animation: `starGlowPulse ${s.glowDur}s ${s.glowDelay}s ease-in-out infinite, ${s.drift} ${s.driftDur}s ${s.driftDelay}s ease-in-out infinite`,
        }}
      />
    ))}

    {/* Shooting stars */}
    {SHOOTING.map((s) => (
      <div
        key={s.id}
        style={{
          position: 'absolute',
          top: s.top,
          left: s.left,
          transform: 'rotate(28deg)',
          transformOrigin: 'left center',
        }}
      >
        <div
          style={{
            height: '1.5px',
            width: '0px',
            background: `linear-gradient(90deg, transparent 0%, ${s.color} 50%, #ffffff 100%)`,
            borderRadius: '999px',
            boxShadow: `0 0 6px 2px ${s.color}90`,
            opacity: 0,
            animation: `shootStar ${s.dur} ${s.delay} ease-in infinite`,
          }}
        />
      </div>
    ))}
  </div>
);

// ── Tool + Category data ───────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'school',
    label:    'SSC / HSC ছাত্রছাত্রী',
    labelEn:  'SSC / HSC Students',
    sublabel:   'Class 8 থেকে Intermediate পর্যন্ত',
    sublabelEn: 'From Class 8 to Intermediate Level',
    icon: <GraduationCap className="w-5 h-5" />,
    accentFrom: 'from-cyan-400',
    accentTo: 'to-blue-500',
    tools: [
      {
        id: 'math-solver',
        title:   'গণিত সমাধানকারী',
        titleEn: 'Math Problem Solver',
        subtitle: 'Math Word Problem Solver',
        why:   'SSC/HSC এর অঙ্ক বুঝতে পারছ না? বাংলায় সমস্যা লিখলেই step-by-step সমাধান পাবে। শুধু উত্তর নয়, কেন এভাবে করতে হলো সেটাও বোঝাবে।',
        whyEn: 'Struggling with SSC/HSC math? Write your problem and get a step-by-step solution. Not just the answer, it explains the reasoning behind every single step.',
        icon: <Calculator className="w-7 h-7" />,
        link: '/tools/math-solver',
        gradient: 'from-blue-500 to-cyan-500',
        shadowColor: 'rgba(59,130,246,0.35)',
        borderHover: 'hover:border-blue-500/40',
        badge: 'Class 8-12',
        badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        stats: 'Algebra · Geometry · Trigonometry',
      },
      {
        id: 'science-explainer',
        title:   'বিজ্ঞান ব্যাখ্যাকারী',
        titleEn: 'Science Explainer',
        subtitle: 'Science Concept Explainer',
        why:   'পদার্থ, রসায়ন, জীববিজ্ঞান, যেকোনো concept জিজ্ঞেস করো। সহজ বাংলায়, বাস্তব উদাহরণ সহ ব্যাখ্যা পাবে। পরীক্ষায় কীভাবে আসে সেটাও বলবে।',
        whyEn: 'Physics, Chemistry, Biology: ask about any concept. Get clear explanations with real-life examples and exam question patterns specific to your board.',
        icon: <FlaskConical className="w-7 h-7" />,
        link: '/tools/science-explainer',
        gradient: 'from-emerald-500 to-teal-500',
        shadowColor: 'rgba(16,185,129,0.35)',
        borderHover: 'hover:border-emerald-500/40',
        badge: 'NCTB Syllabus',
        badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        stats: 'Physics · Chemistry · Biology',
      },
      {
        id: 'english-grammar',
        title:   'English Grammar & Translator',
        titleEn: 'English Grammar & Translator',
        subtitle: 'Grammar Fixer + Translator',
        why:   'SSC English 2nd Paper এর সবচেয়ে বড় ভয়, grammar ভুল। তোমার English text দাও, ভুল ধরে explain করবে। বাংলা থেকে সুন্দর English এও করে দেবে।',
        whyEn: 'Grammar mistakes are the biggest fear in SSC English 2nd Paper. Submit your text, get every error explained clearly. Also translates Bangla into natural, correct English.',
        icon: <Languages className="w-7 h-7" />,
        link: '/tools/english-grammar',
        gradient: 'from-purple-500 to-violet-500',
        shadowColor: 'rgba(168,85,247,0.35)',
        borderHover: 'hover:border-purple-500/40',
        badge: 'SSC / HSC',
        badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
        stats: 'Fix · Translate · Explain',
      },
      {
        id: 'notes-digitizer',
        title:   'Notes Digitizer',
        titleEn: 'Notes Digitizer',
        subtitle: 'Handwritten Notes to Digital + Summary',
        why:   'হাতে লেখা notes type করা সময়ের অপচয়। ছবি তুললেই AI সব text type করে দেবে এবং সারাংশও বানাবে। পরীক্ষার আগে revision আরও সহজ হবে।',
        whyEn: 'Typing up handwritten notes wastes precious time. Snap a photo and AI types everything for you, complete with a structured summary. Revision before exams becomes effortless.',
        icon: <Camera className="w-7 h-7" />,
        link: '/tools/notes-digitizer',
        gradient: 'from-orange-500 to-amber-500',
        shadowColor: 'rgba(249,115,22,0.35)',
        borderHover: 'hover:border-orange-500/40',
        badge: 'AI Vision',
        badgeClass: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
        stats: 'Photo > Text > Summary',
      },
    ],
  },
  {
    id: 'university',
    label:    'University / Undergraduate',
    labelEn:  'University / Undergraduate',
    sublabel:   'Assignment থেকে Career পর্যন্ত',
    sublabelEn: 'From Assignments to Career Planning',
    icon: <BookOpen className="w-5 h-5" />,
    accentFrom: 'from-indigo-400',
    accentTo: 'to-purple-500',
    tools: [
      {
        id: 'lab-gen',
        title:   'Auto Lab Report',
        titleEn: 'Auto Lab Report',
        subtitle: 'PDF Lab Report Generator',
        why:   'Lab report ফরম্যাট করতে ঘণ্টার পর ঘণ্টা নষ্ট হয়। তথ্য দিলেই professional PDF তৈরি হয়ে যাবে, cover page, sections, formatting সব সহ। একবার ব্যবহার করলেই বুঝবে কতটা দরকার ছিল।',
        whyEn: 'Formatting lab reports takes hours you do not have. Enter your data and a professional PDF is generated instantly, cover page, sections, and formatting all included. Use it once and you will never go back.',
        icon: <FileText className="w-7 h-7" />,
        link: '/tools/lab-gen',
        gradient: 'from-teal-500 to-emerald-500',
        shadowColor: 'rgba(20,184,166,0.35)',
        borderHover: 'hover:border-teal-500/40',
        badge: 'Time Saver',
        badgeClass: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
        stats: 'PDF · Cover Page · Formatted',
      },
      {
        id: 'cgpa-tracker',
        title:   'CGPA Tracker & Predictor',
        titleEn: 'CGPA Tracker & Predictor',
        subtitle: 'Semester GPA Tracker',
        why:   'CGPA কত হলে scholarship পাবে? কত পেলে target university তে ভর্তি হওয়া যাবে? Semester দিয়ে দিলে automatic calculate করবে এবং target CGPA পেতে কী করতে হবে বলে দেবে।',
        whyEn: 'What CGPA do you need for a scholarship? How much to get into your target university? Enter your semesters and it calculates automatically, telling you exactly what grades you need to hit your goal.',
        icon: <TrendingUp className="w-7 h-7" />,
        link: '/tools/cgpa',
        gradient: 'from-cyan-500 to-blue-500',
        shadowColor: 'rgba(6,182,212,0.35)',
        borderHover: 'hover:border-cyan-500/40',
        badge: 'Essential',
        badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        stats: 'Track · Predict · Plan',
      },
      {
        id: 'ai-roadmap',
        title:   'AI Career Roadmap',
        titleEn: 'AI Career Roadmap',
        subtitle: 'Personalized Career Planner',
        why:   'কোথায় যেতে চাও জানো, কিন্তু কীভাবে যাবে বুঝতে পারছ না? তোমার CGPA, skills, এবং dream career দিলে AI তোমার জন্য step-by-step roadmap বানাবে, honest এবং data-driven।',
        whyEn: 'You know where you want to go but not how to get there. Give your CGPA, skills, and dream career and AI builds a step-by-step roadmap tailored to you, honest and fully data-driven.',
        icon: <BrainCircuit className="w-7 h-7" />,
        link: '/roadmaps',
        gradient: 'from-indigo-500 to-purple-500',
        shadowColor: 'rgba(99,102,241,0.35)',
        borderHover: 'hover:border-indigo-500/40',
        badge: 'AI Powered',
        badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        stats: '5-Phase Plan · Skill Gaps · Resources',
      },
      {
        id: 'plagiarism-checker',
        title:   'Plagiarism Checker',
        titleEn: 'Plagiarism Checker',
        subtitle: 'Assignment Originality Analyzer',
        why:   'Turnitin expensive, কিন্তু submit করার আগে একবার check না করলে নম্বর কাটা যায়। এই tool দিয়ে নিজেই দেখো, কোন অংশ risky, কীভাবে original করতে হবে।',
        whyEn: 'Turnitin is expensive, but submitting without checking can cost you marks. Use this to self-check your assignment, see which parts are risky, and learn how to make it genuinely original.',
        icon: <ShieldCheck className="w-7 h-7" />,
        link: '/tools/plagiarism-checker',
        gradient: 'from-rose-500 to-red-500',
        shadowColor: 'rgba(244,63,94,0.35)',
        borderHover: 'hover:border-rose-500/40',
        badge: 'Pre-Submit',
        badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        stats: 'AI Analysis · Red Flags · Suggestions',
      },
    ],
  },
  {
    id: 'research',
    label:    'Masters / PhD / Research',
    labelEn:  'Masters / PhD / Research',
    sublabel:   'Literature Review থেকে Gap Analysis পর্যন্ত',
    sublabelEn: 'From Literature Review to Gap Analysis',
    icon: <Microscope className="w-5 h-5" />,
    accentFrom: 'from-violet-400',
    accentTo: 'to-fuchsia-500',
    tools: [
      {
        id: 'research-summarizer',
        title:   'Research Paper Summarizer',
        titleEn: 'Research Paper Summarizer',
        subtitle: 'Journal Paper to Simple Language',
        why:   'Research paper পড়তে গেলে jargon এ আটকে যাও? Abstract paste করলেই সহজ ভাষায় বলে দেবে, কী নিয়ে গবেষণা, কী পেয়েছে, কেন গুরুত্বপূর্ণ। Literature review এর সময় অর্ধেক বাঁচাও।',
        whyEn: 'Getting lost in research paper jargon? Paste the abstract and get a plain-language breakdown of the study, what it researched, what it found, and why it matters. Cut your literature review time in half.',
        icon: <BookOpen className="w-7 h-7" />,
        link: '/tools/research-summarizer',
        gradient: 'from-sky-500 to-cyan-500',
        shadowColor: 'rgba(14,165,233,0.35)',
        borderHover: 'hover:border-sky-500/40',
        badge: 'PhD Essential',
        badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
        stats: 'Abstract > Findings > Limitations',
      },
      {
        id: 'literature-review',
        title:   'Literature Review Assistant',
        titleEn: 'Literature Review Assistant',
        subtitle: 'Structured Lit Review Generator',
        why:   'Literature review লেখা PhD এর সবচেয়ে কঠিন এবং সময়সাপেক্ষ অংশ। Topic দিলে themes, schools of thought, debates, gaps, সব structured ভাবে পাবে। শুরু করার জায়গা দেবে।',
        whyEn: 'Writing a literature review is the hardest and most time-consuming part of a PhD. Enter your topic and get themes, schools of thought, debates, and gaps, all structured and ready to build on.',
        icon: <Library className="w-7 h-7" />,
        link: '/tools/literature-review',
        gradient: 'from-violet-500 to-indigo-500',
        shadowColor: 'rgba(139,92,246,0.35)',
        borderHover: 'hover:border-violet-500/40',
        badge: 'Masters / PhD',
        badgeClass: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
        stats: 'Themes · Debates · Search Keywords',
      },
      {
        id: 'research-gap-finder',
        title:   'Research Gap Finder',
        titleEn: 'Research Gap Finder',
        subtitle: 'Find Unexplored Research Areas',
        why:   'Supervisor বলে "তোমার research gap টা কী?", এই প্রশ্নের উত্তর দেওয়াটাই সবচেয়ে কঠিন। Topic দিলে ৫টা genuine unexplored gap বের করে দেবে, কোনটা তোমার জন্য feasible সেটাও বলবে।',
        whyEn: 'Your supervisor asks "What is your research gap?" and that is the hardest question to answer. Enter a topic and get 5 genuine unexplored gaps, each rated by difficulty and feasibility for your level.',
        icon: <Telescope className="w-7 h-7" />,
        link: '/tools/research-gap-finder',
        gradient: 'from-fuchsia-500 to-pink-500',
        shadowColor: 'rgba(217,70,239,0.35)',
        borderHover: 'hover:border-fuchsia-500/40',
        badge: 'PhD Must-Have',
        badgeClass: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
        stats: '5 Gaps · Difficulty Level · Journals',
      },
    ],
  },
  {
    id: 'dev',
    label:    'CS / Developer Students',
    labelEn:  'CS / Developer Students',
    sublabel:   'Programming ও Technical Tools',
    sublabelEn: 'Programming & Technical Tools',
    icon: <GitBranch className="w-5 h-5" />,
    accentFrom: 'from-green-400',
    accentTo: 'to-emerald-500',
    tools: [
      {
        id: 'er-diagram',
        title:   'ER Diagram Generator',
        titleEn: 'ER Diagram Generator',
        subtitle: 'MongoDB Schema to Visual Diagram',
        why:   'Database design বোঝাতে হলে diagram আঁকতে হয়, কিন্তু Mongoose code থেকে manually করা সময় নষ্ট। Schema code paste করলেই automatically diagram তৈরি হবে, relationships, field types সব সহ। SVG download করা যাবে।',
        whyEn: 'Explaining database design requires a diagram, but drawing one manually from Mongoose code wastes time. Paste your schema and an ER diagram generates automatically with relationships and field types. Export as SVG.',
        icon: <GitBranch className="w-7 h-7" />,
        link: '/tools/er-diagram',
        gradient: 'from-green-500 to-emerald-500',
        shadowColor: 'rgba(34,197,94,0.35)',
        borderHover: 'hover:border-green-500/40',
        badge: 'No Backend',
        badgeClass: 'bg-green-500/10 text-green-300 border-green-500/20',
        stats: 'Mongoose > SVG > Download',
      },
    ],
  },
];

// ── Tool Card ──────────────────────────────────────────────────────────────────
const ToolCard = ({ tool, lang }) => {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const displayTitle = lang === 'en' ? tool.titleEn : tool.title;
  const displayWhy   = lang === 'en' ? tool.whyEn   : tool.why;

  return (
    <Link
      to={tool.link}
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      className={`group relative flex flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-800/70 rounded-[28px] p-7 overflow-hidden ${tool.borderHover}`}
      style={{
        boxShadow: hovered ? `0 25px 60px -15px ${tool.shadowColor}` : '0 0 0 0 transparent',
        transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(280px circle at ${mousePos.x}% ${mousePos.y}%, ${tool.shadowColor} 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-700 group-hover:scale-150`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${tool.gradient} shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
            style={{ boxShadow: hovered ? `0 8px 30px -5px ${tool.shadowColor}` : '' }}
          >
            {React.cloneElement(tool.icon, { className: 'text-white drop-shadow-md' })}
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${tool.badgeClass} transition-transform duration-300 group-hover:scale-105`}>
            {tool.badge}
          </span>
        </div>

        <div className="flex-grow space-y-3">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight leading-tight mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
              {displayTitle}
            </h2>
            <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-widest">{tool.subtitle}</p>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed font-medium">
            {displayWhy}
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <Sparkles className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-semibold">{tool.stats}</span>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-white transition-colors duration-300">
            {lang === 'en' ? 'Use Now' : 'এখনই ব্যবহার করো'}
          </span>
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center bg-slate-800 transition-all duration-500 group-hover:bg-gradient-to-br ${tool.gradient}`}
            style={{ boxShadow: hovered ? `0 4px 15px -3px ${tool.shadowColor}` : '' }}
          >
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ── Category Section ───────────────────────────────────────────────────────────
const CategorySection = ({ cat, lang }) => (
  <section className="mb-24">
    <div className="flex items-center gap-4 mb-10">
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${cat.accentFrom} ${cat.accentTo} text-white shadow-lg`}
        style={{ boxShadow: `0 0 20px -5px rgba(99,102,241,0.5)` }}>
        {cat.icon}
      </div>
      <div>
        <h2 className={`text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${cat.accentFrom} ${cat.accentTo}`}>
          {lang === 'en' ? cat.labelEn : cat.label}
        </h2>
        <p className="text-slate-600 text-sm font-medium">
          {lang === 'en' ? cat.sublabelEn : cat.sublabel}
        </p>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-700/80 via-slate-800/40 to-transparent ml-2" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cat.tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} lang={lang} />
      ))}
    </div>
  </section>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const ToolsPage = () => {
  const [lang, setLang] = useState('bn');
  const totalTools = CATEGORIES.reduce((s, c) => s + c.tools.length, 0);
  const isBn = lang === 'bn';

  return (
    <>
      <style>{`
        /* ── Tiny star twinkle (fast) ─────────────────── */
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.03; }
          50%       { opacity: 0.95; }
        }
        /* ── Big star glow pulse ─────────────────────── */
        @keyframes starGlowPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.8); }
        }
        /* ── Shooting star ───────────────────────────── */
        @keyframes shootStar {
          0%   { opacity: 0;   width: 0px; }
          8%   { opacity: 1;   width: 140px; }
          88%  { opacity: 0.7; width: 100px; }
          100% { opacity: 0;   width: 20px; transform: translateX(440px); }
        }
        /* ── Medium star drifts ──────────────────────── */
        @keyframes sdrift-a {
          0%,100% { transform: translate(0px,0px); }
          50%     { transform: translate(13px,-9px); }
        }
        @keyframes sdrift-b {
          0%,100% { transform: translate(0px,0px); }
          50%     { transform: translate(-11px,15px); }
        }
        @keyframes sdrift-c {
          0%,100% { transform: translate(0px,0px); }
          33%     { transform: translate(9px,12px); }
          66%     { transform: translate(-13px,5px); }
        }
        @keyframes sdrift-d {
          0%,100% { transform: translate(0px,0px); }
          50%     { transform: translate(-10px,-13px); }
        }
        @keyframes sdrift-e {
          0%,100% { transform: translate(0px,0px); }
          50%     { transform: translate(17px,8px); }
        }
        /* ── Big star drifts ─────────────────────────── */
        @keyframes bdrift-a {
          0%,100% { transform: translate(0px,0px); }
          33%     { transform: translate(26px,-17px); }
          66%     { transform: translate(-20px,26px); }
        }
        @keyframes bdrift-b {
          0%,100% { transform: translate(0px,0px); }
          50%     { transform: translate(-32px,22px); }
        }
        @keyframes bdrift-c {
          0%,100% { transform: translate(0px,0px); }
          33%     { transform: translate(24px,28px); }
          66%     { transform: translate(-28px,-18px); }
        }
        /* ── Nebula + page animations ────────────────── */
        @keyframes nebulaDrift {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(30px,-20px) scale(1.05); }
          66%       { transform: translate(-20px,30px) scale(0.97); }
        }
        @keyframes auroraShift {
          0%, 100% { opacity: 0.18; transform: scaleX(1) translateY(0px); }
          50%       { opacity: 0.32; transform: scaleX(1.08) translateY(18px); }
        }
        @keyframes toolsFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerFlow {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .tools-fade-up { animation: toolsFadeUp 0.7s ease-out forwards; opacity: 0; }
        .shimmer-tools { background-size: 200% auto; animation: shimmerFlow 4s linear infinite; }
        .nebula-drift  { animation: nebulaDrift 18s ease-in-out infinite; }
      `}</style>

      <div className="relative min-h-screen pt-28 pb-24 px-4 sm:px-8 bg-[#020617] text-white overflow-hidden">

        {/* Galaxy star field */}
        <StarField />

        {/* Deep nebula blobs */}
        <div className="nebula-drift absolute -top-40 left-[5%]   w-[800px] h-[800px] rounded-full bg-blue-700/[0.11]   blur-[160px] pointer-events-none" />
        <div className="nebula-drift absolute top-1/3  right-[-10%] w-[700px] h-[700px] rounded-full bg-purple-700/[0.10] blur-[150px] pointer-events-none" style={{ animationDelay: '6s' }} />
        <div className="nebula-drift absolute bottom-0 left-[30%]  w-[600px] h-[600px] rounded-full bg-indigo-600/[0.09] blur-[140px] pointer-events-none" style={{ animationDelay: '12s' }} />
        <div className="nebula-drift absolute top-[58%] left-[-8%] w-[550px] h-[550px] rounded-full bg-cyan-700/[0.07]   blur-[130px] pointer-events-none" style={{ animationDelay: '4s' }} />
        <div className="nebula-drift absolute top-[18%] right-[12%] w-[450px] h-[450px] rounded-full bg-fuchsia-700/[0.07] blur-[120px] pointer-events-none" style={{ animationDelay: '9s' }} />
        <div className="nebula-drift absolute top-[75%] right-[35%] w-[400px] h-[400px] rounded-full bg-violet-700/[0.06]  blur-[110px] pointer-events-none" style={{ animationDelay: '15s' }} />

        {/* Aurora band - top atmospheric glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[380px] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(99,102,241,0.10) 0%, rgba(14,165,233,0.06) 45%, transparent 100%)',
            animation: 'auroraShift 12s ease-in-out infinite',
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#94a3b8 1px,transparent 1px),linear-gradient(90deg,#94a3b8 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Language toggle */}
        <button
          onClick={() => setLang(isBn ? 'en' : 'bn')}
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md text-sm font-bold text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 shadow-lg"
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          {isBn ? 'English' : 'বাংলা'}
        </button>

        <div className="relative z-10 max-w-7xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-20 tools-fade-up" style={{ animationDelay: '0.1s' }}>

            {/* Hero radial glow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[700px] h-[400px] pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 70% 55% at 50% 30%, rgba(99,102,241,0.13) 0%, rgba(14,165,233,0.06) 55%, transparent 100%)',
              }}
            />

            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">
                {totalTools} {isBn ? 'টি AI-Powered Tools' : 'AI-Powered Tools'}
              </span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-6">
              <span className="text-white">{isBn ? 'তোমার' : 'Your'}</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 via-indigo-400 to-purple-400 shimmer-tools">
                Academic
              </span>
              <br className="hidden md:block" />
              <span className="text-white">Arsenal</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
              {isBn
                ? <>Class 8 থেকে PhD, প্রতিটা level এর জন্য আলাদা tool।<br />কম সময়ে বেশি শেখো, boring কাজ AI কে দাও।</>
                : <>From Class 8 to PhD, a dedicated tool for every level.<br />Learn more in less time. Let AI handle the boring work.</>
              }
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'SSC / HSC',  count: isBn ? '4 টি tool' : '4 tools', color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' },
                { label: 'University', count: isBn ? '4 টি tool' : '4 tools', color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' },
                { label: 'Research',   count: isBn ? '3 টি tool' : '3 tools', color: 'text-violet-400 border-violet-500/20 bg-violet-500/5' },
                { label: 'CS / Dev',   count: isBn ? '1 টি tool' : '1 tool',  color: 'text-green-400 border-green-500/20 bg-green-500/5' },
              ].map((p) => (
                <span key={p.label} className={`px-4 py-1.5 rounded-full border text-sm font-bold ${p.color}`}>
                  {p.label} · {p.count}
                </span>
              ))}
            </div>
          </div>

          {/* Tool Categories */}
          {CATEGORIES.map((cat) => (
            <CategorySection key={cat.id} cat={cat} lang={lang} />
          ))}

          {/* Bottom Banner */}
          <div className="tools-fade-up relative rounded-[40px] border border-indigo-500/15 overflow-hidden" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/35 via-slate-900/60 to-purple-900/35 backdrop-blur-2xl" />
            <StarField />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />

            <div className="relative z-10 p-10 md:p-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-5">
                  <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    {isBn
                      ? <>কেন এখানে এসেছ{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">সঠিক সিদ্ধান্ত</span> নিয়েছ</>
                      : <>Coming here was{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">the right decision</span></>
                    }
                  </h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {isBn
                      ? 'পড়াশোনার চাপ কমাও, সময় বাঁচাও, এবং সেই extra time টা দিয়ে নিজেকে build করো। আমাদের tools তোমার boring tasks গুলো নিজে করে দেবে।'
                      : 'Reduce study stress, save time, and use that extra time to build yourself. Our tools handle your boring tasks automatically so you can focus on what actually matters.'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: '⚡',
                      title: isBn ? 'ঘণ্টার কাজ মিনিটে' : 'Hours of Work in Minutes',
                      desc:  isBn ? 'Lab report, notes digitize, citation, সব কিছু AI করে দেয়' : 'Lab reports, notes, citations: AI handles all of it instantly',
                      color: 'border-amber-500/20 bg-amber-500/5',
                    },
                    {
                      icon: '🎯',
                      title: isBn ? 'Syllabus অনুযায়ী' : 'Curriculum-Aligned',
                      desc:  isBn ? 'NCTB, SSC, HSC, University, প্রতিটা level এর জন্য আলাদা ভাবে optimize' : 'NCTB, SSC, HSC, University: optimized separately for every level',
                      color: 'border-emerald-500/20 bg-emerald-500/5',
                    },
                    {
                      icon: '🔒',
                      title: isBn ? 'সম্পূর্ণ নিরাপদ' : 'Completely Secure',
                      desc:  isBn ? 'তোমার data encrypted। শুধু তুমিই দেখতে পাবে' : 'Your data is encrypted. Only you can see it.',
                      color: 'border-blue-500/20 bg-blue-500/5',
                    },
                    {
                      icon: '🆓',
                      title: isBn ? 'কোনো hidden cost নেই' : 'No Hidden Costs',
                      desc:  isBn ? 'ব্যবহার করো, শেখো, কোনো credit card লাগবে না' : 'Use it, learn from it. No credit card required.',
                      color: 'border-purple-500/20 bg-purple-500/5',
                    },
                  ].map((item) => (
                    <div key={item.title} className={`p-5 rounded-2xl border ${item.color} flex gap-3 items-start`}>
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link
                  to="/tools/math-solver"
                  className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full font-black text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)]"
                >
                  <Sparkles className="w-5 h-5" />
                  {isBn ? 'যেকোনো tool দিয়ে শুরু করো' : 'Start with any tool'}
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <p className="text-slate-600 text-sm mt-3">
                  {isBn ? 'Registration ছাড়াও কিছু tool ব্যবহার করা যায়' : 'Some tools are accessible without registration'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ToolsPage;
