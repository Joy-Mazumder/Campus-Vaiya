import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";

const customStyles = `
  @keyframes float_amb { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(2deg); } }
  @keyframes shimmer_text { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes fade_up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes rotate_icon { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  
  @keyframes mesh_flow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes status_pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ─── Three-color convergence background animation ─── */
  @keyframes blob_left {
    0%   { transform: translate(-120%, 30%) scale(1);   opacity: 0.55; }
    30%  { transform: translate(-30%,  20%) scale(1.1); opacity: 0.65; }
    55%  { transform: translate(10%,   0%)  scale(1.3); opacity: 0.75; }
    70%  { transform: translate(0%,    0%)  scale(0.9); opacity: 0.9;  }
    80%  { transform: translate(0%,    0%)  scale(0.5); opacity: 0.6;  }
    90%  { transform: translate(0%,    0%)  scale(0.2); opacity: 0.3;  }
    100% { transform: translate(-120%, 30%) scale(1);   opacity: 0.55; }
  }
  @keyframes blob_right {
    0%   { transform: translate(120%, -20%) scale(1);   opacity: 0.55; }
    30%  { transform: translate(30%,  -10%) scale(1.1); opacity: 0.65; }
    55%  { transform: translate(-10%, 0%)   scale(1.3); opacity: 0.75; }
    70%  { transform: translate(0%,   0%)   scale(0.9); opacity: 0.9;  }
    80%  { transform: translate(0%,   0%)   scale(0.5); opacity: 0.6;  }
    90%  { transform: translate(0%,   0%)   scale(0.2); opacity: 0.3;  }
    100% { transform: translate(120%, -20%) scale(1);   opacity: 0.55; }
  }
  @keyframes blob_top {
    0%   { transform: translate(0%, -120%) scale(1);   opacity: 0.55; }
    30%  { transform: translate(0%, -30%)  scale(1.1); opacity: 0.65; }
    55%  { transform: translate(0%, 10%)   scale(1.3); opacity: 0.75; }
    70%  { transform: translate(0%, 0%)    scale(0.9); opacity: 0.9;  }
    80%  { transform: translate(0%, 0%)    scale(0.5); opacity: 0.6;  }
    90%  { transform: translate(0%, 0%)    scale(0.2); opacity: 0.3;  }
    100% { transform: translate(0%, -120%) scale(1);   opacity: 0.55; }
  }
  @keyframes collapse_flash {
    0%   { opacity: 0; transform: scale(0.1); }
    10%  { opacity: 0.9; transform: scale(2.5); }
    30%  { opacity: 0.6; transform: scale(1.8); }
    60%  { opacity: 0.3; transform: scale(1.2); }
    100% { opacity: 0; transform: scale(0.1); }
  }

  .color-blob-left  { animation: blob_left  8s ease-in-out infinite; }
  .color-blob-right { animation: blob_right 8s ease-in-out infinite; }
  .color-blob-top   { animation: blob_top   8s ease-in-out infinite; }
  .collapse-flash   { animation: collapse_flash 8s ease-in-out infinite; animation-delay: 4.5s; }

  /* ─── Terminal flip animation ─── */
  @keyframes terminal_flip_in {
    0%   { transform: perspective(800px) rotateX(0deg);   opacity: 1; }
    40%  { transform: perspective(800px) rotateX(90deg);  opacity: 0.2; }
    60%  { transform: perspective(800px) rotateX(-90deg); opacity: 0.2; }
    100% { transform: perspective(800px) rotateX(0deg);   opacity: 1; }
  }
  @keyframes terminal_flip_out {
    0%   { transform: perspective(800px) rotateX(0deg);   opacity: 1; }
    40%  { transform: perspective(800px) rotateX(90deg);  opacity: 0.2; }
    60%  { transform: perspective(800px) rotateX(-90deg); opacity: 0.2; }
    100% { transform: perspective(800px) rotateX(0deg);   opacity: 1; }
  }
  .terminal-flip { animation: terminal_flip_in 0.7s cubic-bezier(0.4, 0, 0.2, 1); }

  /* ─── Terminal browser bar fade ─── */
  @keyframes bar_enter {
    0%   { opacity: 0; transform: translateY(-6px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .bar-enter { animation: bar_enter 0.5s ease-out forwards; }

  /* ─── Website shimmer skeleton ─── */
  @keyframes skeleton_shine {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton-shine {
    background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(6,182,212,0.15) 50%, rgba(255,255,255,0.05) 75%);
    background-size: 200% 100%;
    animation: skeleton_shine 1.6s linear infinite;
    border-radius: 6px;
  }

  /* ─── Ready state website content ─── */
  @keyframes page_appear {
    0%   { opacity: 0; transform: scale(0.97); }
    100% { opacity: 1; transform: scale(1); }
  }
  .page-appear { animation: page_appear 0.6s ease-out forwards; }

  /* ─── Progress bar ─── */
  @keyframes progress_load {
    0%   { width: 0%; }
    40%  { width: 55%; }
    70%  { width: 80%; }
    90%  { width: 95%; }
    100% { width: 100%; }
  }
  .progress-bar { animation: progress_load 2.8s ease-in-out forwards; }

  /* ─── Cursor blink ─── */
  @keyframes cursor_blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  .cursor-blink { animation: cursor_blink 1s step-end infinite; }

  /* ─── Glow pulse on ready state ─── */
  @keyframes glow_pulse_green {
    0%, 100% { box-shadow: 0 0 0px rgba(34, 197, 94, 0); }
    50%       { box-shadow: 0 0 24px rgba(34, 197, 94, 0.35); }
  }
  .ready-glow { animation: glow_pulse_green 2s ease-in-out infinite; }

  .anim-fade-up { animation: fade_up 0.8s ease-out forwards; opacity: 0; }
  .shimmer-text { background-size: 200% auto; animation: shimmer_text 5s linear infinite; }
  .group:hover .icon-rotate { animation: rotate_icon 0.7s cubic-bezier(0.4, 0, 0.2, 1); }

  .premium-mesh {
    background: radial-gradient(circle at 50% 50%, #0a0a2e 0%, #030014 100%);
    background-size: 200% 200%;
    animation: mesh_flow 15s ease infinite;
  }

  .grid-overlay {
    background-image: linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: radial-gradient(ellipse at center, black, transparent 85%);
  }

  .glow-blob {
    mix-blend-mode: screen;
    filter: blur(120px);
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;
    animation: float_amb 10s ease-in-out infinite;
  }

  .float-element { animation: float_amb 6s ease-in-out infinite; }

  /* ─── Premium card hover glow ─── */
  .card-hover-glow:hover {
    box-shadow: 0 0 40px rgba(6, 182, 212, 0.08), 0 0 80px rgba(99, 102, 241, 0.05);
  }

  /* ─── Noise texture overlay ─── */
  .noise-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
    border-radius: inherit;
  }

  /* ─── Stat card shine ─── */
  @keyframes stat_shine {
    0%   { transform: translateX(-100%) skewX(-20deg); }
    100% { transform: translateX(250%) skewX(-20deg); }
  }
  .stat-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    transform: translateX(-100%) skewX(-20deg);
    transition: none;
  }
  .stat-card:hover::after {
    animation: stat_shine 0.6s ease-out forwards;
  }
`;

const t = {
  en: {
    pill: "🚀 THE FUTURE OF CAMPUS LIFE IS HERE",
    heroTitle1: "Level up your campus life with",
    heroDesc: "Your digital campus ecosystem. Connect with seniors, automate lab reports, track your CGPA, and unlock AI-driven academic roadmaps in one place.",
    btnJoin: "Join the Community",
    btnDash: "Go to Dashboard",
    btnExplore: "Explore Features",
    stat1: "Active Students",
    stat2: "Lab Reports Gen",
    stat3: "Expert Seniors",
    stat4: "CGPA Tracked",
    feat1Title: "AI-Powered Tools",
    feat1Desc: "Instantly generate lab reports, solve math problems step-by-step, and get personalized AI roadmaps.",
    feat2Title: "Senior Mentorship",
    feat2Desc: "Stuck on a difficult topic or GitHub issue? Connect directly with experienced seniors to get guidance.",
    feat3Title: "Global Network",
    feat3Desc: "Stay in the loop with the campus feed, collaborate on repositories, and chat in real-time.",
    howItWorksTitle: "How the Ecosystem Works",
    howItWorksDesc: "Everything you need from admission to graduation, seamlessly connected.",
    hw1Title: "1. Manage Academics",
    hw1Desc: "Input semester data. Our system tracks your CGPA and handles your lab reports via AI.",
    hw2Title: "2. Utilize the Tools",
    hw2Desc: "Access an arsenal of tools designed specifically for your academic level and research.",
    hw3Title: "3. Grow Together",
    hw3Desc: "Share your knowledge, ask questions in the forum, and collaborate on real-world projects.",
    coachBadge: "FOR EDUCATORS & INSTITUTIONS",
    coachTitle: "Running a Coaching Center or Institution?",
    coachDesc: "You focus on teaching, we handle the rest. Get a complete web solution to manage your students, track exams, and automate tasks.",
    coachBtn: "View Solutions",
    reviewTitle: "Loved by thousands of students",
    reviewDesc: "See how CampusVaiya is changing the academic landscape.",
    ctaTitle: "Ready to transform your academic journey?",
    ctaDesc: "Join thousands of students and educators who are already using CampusVaiya.",
    ctaBtn: "Get Started Now — It's Free",
    visionTitle: "Our Vision for You",
    visionDesc: "We're not just a tool; we're your partner in surviving and thriving through your university years.",
    techTitle: "Smart Tech for Smart Students",
    techDesc: "Experience the fastest way to handle university pressure. Our cloud-integrated platform ensures your data is always synced, secure, and accessible."
  },
  bn: {
    pill: "🚀 ক্যাম্পাস লাইফের ভবিষ্যৎ এখন এখানেই",
    heroTitle1: "ক্যাম্পাস লাইফকে অন্য মাত্রায় নিয়ে যাও",
    heroDesc: "তোমার ডিজিটাল ক্যাম্পাস ইকোসিস্টেম। সিনিয়রদের সাথে কানেক্ট করো, ল্যাব রিপোর্ট অটোমেট করো, সিজিপিএ ট্র্যাক করো এবং এআই রোডম্যাপ আনলক করো এক জায়গায়।",
    btnJoin: "কমিউনিটিতে যুক্ত হও",
    btnDash: "ড্যাশবোর্ডে যাও",
    btnExplore: "ফিচারগুলো দেখো",
    stat1: "অ্যাক্টিভ স্টুডেন্ট",
    stat2: "ল্যাব রিপোর্ট তৈরি",
    stat3: "এক্সপার্ট সিনিয়র",
    stat4: "সিজিপিএ ট্র্যাকড",
    feat1Title: "এআই-পাওয়ার্ড টুলস",
    feat1Desc: "নিমিষেই ল্যাব রিপোর্ট তৈরি করো, গণিত সমাধান করো এবং তোমার ক্যারিয়ারের জন্য পার্সোনালাইজড এআই রোডম্যাপ পাও।",
    feat2Title: "সিনিয়র মেন্টরশিপ",
    feat2Desc: "পড়াশোনা বা গিটহাবের কোনো কঠিন টপিকে আটকে আছো? অভিজ্ঞ সিনিয়রদের সাথে কানেক্ট করে সঠিক গাইডলাইন নাও।",
    feat3Title: "গ্লোবাল নেটওয়ার্ক",
    feat3Desc: "ক্যাম্পাসের খবরের সাথে আপডেট থাকো, প্রজেক্টে কোলাবোরেট করো এবং রিয়েল-টাইমে অন্য ভার্সিটির বন্ধুদের সাথে চ্যাট করো।",
    howItWorksTitle: "পুরো ইকোসিস্টেম যেভাবে কাজ করে",
    howItWorksDesc: "ভর্তি থেকে গ্র্যাজুয়েশন পর্যন্ত যা যা দরকার, সব কিছু এক সুতোয় গাঁথা।",
    hw1Title: "১. একাডেমিকস ম্যানেজ করো",
    hw1Desc: "রেজাল্ট ইনপুট দাও। আমাদের সিস্টেম তোমার সিজিপিএ ট্র্যাক করবে এবং ল্যাব রিপোর্টের ঝামেলা মেটাবে।",
    hw2Title: "২. টুলসগুলোর ব্যবহার",
    hw2Desc: "তোমার লেভেলের জন্য একদম পারফেক্ট টুলসগুলোর অ্যাক্সেস নাও, স্কুল থেকে পিএইচডি পর্যন্ত।",
    hw3Title: "৩. একসাথে এগিয়ে চলো",
    hw3Desc: "নিজের জ্ঞান শেয়ার করো, ফোরামে প্রশ্ন করো এবং রিয়েল-ওয়ার্ল্ড প্রজেক্টে কোলাবোরেট করো।",
    coachBadge: "শিক্ষক ও প্রতিষ্ঠানগুলোর জন্য",
    coachTitle: "নিজস্ব কোচিং বা প্রতিষ্ঠান চালাচ্ছেন?",
    coachDesc: "আপনি শুধু পড়ানোতে ফোকাস করুন। স্টুডেন্ট ম্যানেজমেন্ট, পরীক্ষা ট্র্যাকিং ও রুটিন অটোমেট করার জন্য নিন সম্পূর্ণ সল্যুশন।",
    coachBtn: "সল্যুশন দেখুন",
    reviewTitle: "হাজারো শিক্ষার্থীর ভরসা",
    reviewDesc: "দেখুন CampusVaiya কীভাবে শিক্ষাজীবন সহজ করছে।",
    ctaTitle: "একাডেমিক জার্নি পরিবর্তন করতে প্রস্তুত?",
    ctaDesc: "হাজারো শিক্ষার্থী ও শিক্ষকের সাথে যুক্ত হও, যারা ইতোমধ্যেই CampusVaiya ব্যবহার করছে।",
    ctaBtn: "এখনই শুরু করো — একদম ফ্রি",
    visionTitle: "আমাদের লক্ষ্য",
    visionDesc: "আমরা শুধু একটি টুল নই; আমরা তোমার ইউনিভার্সিটির দিনগুলোকে আরও সহজ এবং সফল করার সঙ্গী।",
    techTitle: "স্মার্ট স্টুডেন্টদের জন্য স্মার্ট টেকনোলজি",
    techDesc: "ভার্সিটির প্রেসার সামলানোর সবচেয়ে দ্রুততম মাধ্যম। আমাদের ক্লাউড-ইন্টিগ্রেটেড প্ল্যাটফর্ম নিশ্চিত করে যে তোমার ডেটা সবসময় সিঙ্কড, সুরক্ষিত এবং হাতের নাগালে থাকবে।"
  }
};

/* ─────────────────────────────────────────────────────────
   Three-Color Convergence Background Canvas Component
   Three blobs (cyan from left, purple from right, blue from top)
   converge to the centre every 8 seconds, merge into white-violet,
   then collapse and scatter back to their origin sides.
───────────────────────────────────────────────────────── */
const ConvergenceBackground = () => {
  const CYCLE = 8000;

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ isolation: 'isolate' }}
    >
      {/* centre anchor – blobs converge here */}
      <div
        className="absolute"
        style={{
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1,
          height: 1,
        }}
      >
        {/* Blob 1 – Cyan – comes from the left */}
        <div
          className="color-blob-left"
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.85) 0%, rgba(6,182,212,0) 70%)',
            mixBlendMode: 'screen',
            filter: 'blur(90px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Blob 2 – Purple – comes from the right */}
        <div
          className="color-blob-right"
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.85) 0%, rgba(168,85,247,0) 70%)',
            mixBlendMode: 'screen',
            filter: 'blur(90px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Blob 3 – Blue – comes from the top */}
        <div
          className="color-blob-top"
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.85) 0%, rgba(59,130,246,0) 70%)',
            mixBlendMode: 'screen',
            filter: 'blur(90px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Collapse flash – bright burst when all three merge */}
        <div
          className="collapse-flash"
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,180,255,0.95) 0%, rgba(139,92,246,0.5) 40%, transparent 70%)',
            mixBlendMode: 'screen',
            filter: 'blur(50px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.1)',
            opacity: 0,
          }}
        />
      </div>

      {/* Ambient static glows that stay as background depth */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
          mixBlendMode: 'screen',
          filter: 'blur(130px)',
          animation: 'float_amb 14s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60%',
          left: '-5%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)',
          mixBlendMode: 'screen',
          filter: 'blur(130px)',
          animation: 'float_amb 18s ease-in-out infinite',
          animationDelay: '-6s',
        }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   Vision Terminal Component
   • Rotates (3-D flip) on each status change
   • When status contains "ready", shows browser-like "loaded page"
   • Otherwise shows skeleton loading UI
───────────────────────────────────────────────────────── */
const VisionTerminal = ({ visionStatus }) => {
  const isReady = visionStatus.toLowerCase().includes('ready');
  const [flipping, setFlipping] = useState(false);
  const prevStatus = useRef(visionStatus);
  const [displayStatus, setDisplayStatus] = useState(visionStatus);
  const [showContent, setShowContent] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (visionStatus !== prevStatus.current) {
      setFlipping(true);
      const t1 = setTimeout(() => {
        setDisplayStatus(visionStatus);
        setShowContent(false);
        prevStatus.current = visionStatus;
      }, 350);
      const t2 = setTimeout(() => {
        setFlipping(false);
        if (visionStatus.toLowerCase().includes('ready')) {
          setProgressKey(k => k + 1);
          setTimeout(() => setShowContent(true), 600);
        }
      }, 700);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [visionStatus]);

  const isDisplayReady = displayStatus.toLowerCase().includes('ready');

  return (
    <div
      className={`relative z-10 p-10 rounded-3xl border backdrop-blur-2xl shadow-2xl transition-all duration-700 noise-overlay ${
        isDisplayReady
          ? 'bg-slate-900/85 border-green-500/30 ready-glow'
          : 'bg-slate-900/80 border-white/10'
      } ${flipping ? 'terminal-flip' : ''}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Window chrome */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${isDisplayReady ? 'bg-green-500' : 'bg-red-500/50'}`}></div>
          <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${isDisplayReady ? 'bg-green-400/70' : 'bg-yellow-500/50'}`}></div>
          <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${isDisplayReady ? 'bg-green-300/70' : 'bg-green-500/50'}`}></div>
        </div>
        {isDisplayReady && (
          <span className="bar-enter text-[10px] text-green-400 font-mono tracking-widest uppercase">● Live</span>
        )}
      </div>

      {/* ── Terminal command line ── */}
      <div className="py-5 px-5 rounded-2xl bg-black/50 border border-white/5 font-mono text-sm mb-6">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 select-none">$</span>
          <span className={`transition-colors duration-500 ${isDisplayReady ? 'text-green-400' : 'text-slate-300'}`}>
            {displayStatus}
          </span>
          {!isDisplayReady && (
            <span className="cursor-blink inline-block w-2 h-4 bg-cyan-500 ml-1"></span>
          )}
          {isDisplayReady && (
            <span className="ml-2 text-green-500 text-xs font-bold">✓</span>
          )}
        </div>
      </div>

      {/* ── Loading content area ── */}
      {!isDisplayReady ? (
        /* Skeleton loading state */
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full progress-bar" key={progressKey}></div>
          </div>

          {/* Browser address skeleton */}
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
            <div className="skeleton-shine w-4 h-4 flex-shrink-0 rounded-sm"></div>
            <div className="skeleton-shine flex-1 h-3"></div>
            <div className="skeleton-shine w-8 h-3 flex-shrink-0"></div>
          </div>

          {/* Website skeleton blocks */}
          <div className="space-y-3 pt-1">
            <div className="skeleton-shine h-5 w-3/5 rounded"></div>
            <div className="skeleton-shine h-3 w-full"></div>
            <div className="skeleton-shine h-3 w-4/5"></div>
            <div className="skeleton-shine h-3 w-2/3"></div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-shine h-14 rounded-xl"></div>
            ))}
          </div>

          <div className="mt-4 text-[10px] text-slate-500 text-center uppercase tracking-[0.3em]">
            Secure Neural Link Establishing...
          </div>
        </div>
      ) : (
        /* ── Loaded "campusvaiya is ready" website mockup ── */
        <div className={showContent ? 'page-appear' : 'opacity-0'}>
          {/* Browser bar */}
          <div className="bar-enter flex items-center gap-2 p-2.5 bg-slate-800/80 rounded-xl border border-white/10 mb-4">
            <div className="flex gap-1.5 ml-1">
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
              <div className="w-2 h-2 rounded-full bg-slate-600"></div>
            </div>
            <div className="flex-1 mx-2 px-3 py-1 rounded-md bg-slate-900/80 text-[10px] font-mono text-slate-400 flex items-center gap-2">
              <span className="text-green-400">🔒</span>
              <span>campusvaiya.app</span>
            </div>
          </div>

          {/* Mini "website" preview */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-[#030014] border border-white/10 overflow-hidden">
            {/* Nav bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-black/20">
              <div className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">CampusVaiya</div>
              <div className="flex gap-3">
                {['Home', 'Tools', 'Feed'].map(label => (
                  <span key={label} className="text-[9px] text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors">{label}</span>
                ))}
              </div>
            </div>

            {/* Hero area */}
            <div className="p-4 space-y-2">
              <div className="text-[11px] font-black text-white leading-tight">Level up your campus life ✦</div>
              <div className="text-[9px] text-slate-400 leading-relaxed">AI tools · Senior mentors · Global network</div>
              <div className="flex gap-2 pt-1">
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-[9px] font-bold text-white">Get Started</div>
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-300">Explore</div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 px-4 pb-4">
              {[{ v: '10K+', l: 'Students' }, { v: '50K+', l: 'Reports' }, { v: '500+', l: 'Seniors' }, { v: '5K+', l: 'CGPAs' }].map((s, i) => (
                <div key={i} className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] font-black text-cyan-400">{s.v}</div>
                  <div className="text-[8px] text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[10px] text-green-400 font-mono tracking-widest uppercase font-bold">campusvaiya is ready</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const [lang, setLang] = useState('en');
  const txt = t[lang];
  const isBn = lang === 'bn';

  const [visionStatus, setVisionStatus] = useState('Initializing Systems...');

  useEffect(() => {
    const statuses = [
      'Analyzing Academic Data...',
      'Syncing Campus Ecosystem...',
      'Optimizing AI Roadmaps...',
      'campusvaiya is ready',
    ];
    let i = 0;
    const interval = setInterval(() => {
      setVisionStatus(statuses[i]);
      i = (i + 1) % statuses.length;
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{customStyles}</style>

      <div className="relative min-h-screen flex flex-col items-center overflow-hidden premium-mesh">

        {/* ── Cyber Grid Background ── */}
        <div className="absolute inset-0 z-0 grid-overlay opacity-40"></div>

        {/* ── Three-Color Convergence Animation ── */}
        <ConvergenceBackground />

        {/* ── Subtle static ambient glows for depth ── */}
        <div className="glow-blob bg-blue-600 top-[-10%] left-[10%] w-[600px] h-[600px]" style={{ animationDuration: '15s', opacity: 0.2 }}></div>
        <div className="glow-blob bg-indigo-600 bottom-[-10%] right-[10%] w-[600px] h-[600px]" style={{ animationDuration: '14s', opacity: 0.2 }}></div>

        {/* ── Language Toggle ── */}
        <button
          onClick={() => setLang(isBn ? 'en' : 'bn')}
          className="fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-xl text-sm font-bold text-white hover:border-cyan-500 transition-all duration-300 shadow-2xl"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          {isBn ? 'English' : 'বাংলা'}
        </button>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-28">

          {/* ── Hero Section ── */}
          <div className="text-center space-y-6 mt-16 md:mt-20">
            <div className="inline-block px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-xl anim-fade-up" style={{ animationDelay: '0.1s' }}>
              <span className="flex items-center gap-2 text-[10px] font-black text-cyan-400 tracking-[0.2em] uppercase">
                {txt.pill}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black text-white tracking-tight leading-[1.05] anim-fade-up" style={{ animationDelay: '0.2s' }}>
              {txt.heroTitle1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shimmer-text">
                CampusVaiya
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed anim-fade-up" style={{ animationDelay: '0.3s' }}>
              {txt.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 anim-fade-up" style={{ animationDelay: '0.4s' }}>
              {isLoggedIn ? (
                <Link to="/dashboard" className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  {txt.btnDash}
                </Link>
              ) : (
                <Link to="/register" className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                  {txt.btnJoin}
                </Link>
              )}
              <Link to="/tools" className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-full font-bold transition-all duration-300 hover:scale-105">
                {txt.btnExplore}
              </Link>
            </div>
          </div>

          {/* ── Stats Bar ── */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 anim-fade-up" style={{ animationDelay: '0.5s' }}>
            {[
              { label: txt.stat1, value: '10K+' },
              { label: txt.stat2, value: '50K+' },
              { label: txt.stat3, value: '500+' },
              { label: txt.stat4, value: '5K+' }
            ].map((stat, i) => (
              <div key={i} className="stat-card relative text-center p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl hover:border-cyan-500/30 transition-all duration-500 group overflow-hidden card-hover-glow">
                <div className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors">{stat.value}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Features Grid ── */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: txt.feat1Title, d: txt.feat1Desc, icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "cyan" },
              { t: txt.feat2Title, d: txt.feat2Desc, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "purple" },
              { t: txt.feat3Title, d: txt.feat3Desc, icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z", color: "blue" }
            ].map((f, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 anim-fade-up card-hover-glow" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-${f.color}-500/10 border border-${f.color}-500/20 icon-rotate`}>
                  <svg className={`w-8 h-8 text-${f.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{f.t}</h3>
                <p className="text-slate-400 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>

          {/* ── Vision Section with Rotating Terminal ── */}
          <div className="mt-40 flex flex-col lg:flex-row items-center gap-16 p-12 rounded-[3rem] bg-white/[0.01] border border-white/5 anim-fade-up">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-white">{txt.visionTitle}</h2>
              <p className="text-slate-400 text-lg leading-relaxed">{txt.visionDesc}</p>
              <ul className="space-y-4">
                {['Personalized AI Roadmaps', 'Secure Cloud Data Management', 'Direct University Network'].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-cyan-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="w-full aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl absolute animate-pulse"></div>
              <VisionTerminal visionStatus={visionStatus} />
            </div>
          </div>

          {/* ── Tech-Forward Component ── */}
          <div className="mt-40 flex flex-col lg:flex-row-reverse items-center gap-16 p-12 rounded-[3rem] bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-white/5 anim-fade-up overflow-hidden">
            <div className="flex-1 space-y-8 z-10">
              <div className="inline-block px-4 py-1 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-tighter">
                HIGH PERFORMANCE TECH
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                {txt.techTitle}
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed italic">
                "Efficiency isn't about doing more, it's about doing what matters faster."
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                {txt.techDesc}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-cyan-400 font-black text-xl mb-1">99.9%</div>
                  <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Uptime</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-purple-400 font-black text-xl mb-1">0.2s</div>
                  <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">Latency</div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative flex justify-center items-center">
              <div className="absolute w-[120%] h-[120%] bg-blue-500/10 blur-[120px] rounded-full"></div>
              <div className="relative w-64 h-[500px] bg-[#05051a] border-[6px] border-slate-800 rounded-[3rem] shadow-2xl float-element overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
                <div className="p-6 pt-12 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 animate-pulse"></div>
                    <div className="space-y-1">
                      <div className="w-20 h-2 bg-white/20 rounded"></div>
                      <div className="w-12 h-2 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  <div className="h-40 w-full bg-white/5 rounded-2xl border border-white/10 flex flex-col p-4 gap-3">
                    <div className="w-full h-3 bg-white/10 rounded"></div>
                    <div className="w-4/5 h-3 bg-white/10 rounded"></div>
                    <div className="mt-auto flex justify-between">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20"></div>
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20"></div>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="w-6 h-6 rounded bg-slate-800"></div>
                        <div className="w-24 h-2 bg-white/10 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 top-20 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-sm opacity-50 float-element" style={{ animationDelay: '-2s' }}></div>
              <div className="absolute -left-10 bottom-20 w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-sm opacity-30 float-element" style={{ animationDelay: '-4s' }}></div>
            </div>
          </div>

          {/* ── Ecosystem / How it works ── */}
          <div className="mt-40 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">{txt.howItWorksTitle}</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-20">{txt.howItWorksDesc}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { step: "1", title: txt.hw1Title, desc: txt.hw1Desc },
                { step: "2", title: txt.hw2Title, desc: txt.hw2Desc },
                { step: "3", title: txt.hw3Title, desc: txt.hw3Desc }
              ].map((item, idx) => (
                <div key={idx} className="group flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-8 group-hover:border-cyan-500 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-500 text-xl font-black text-white">
                    {item.step}
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-white">{item.title}</h4>
                  <p className="text-slate-400 text-center leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Institution Banner ── */}
          <div className="mt-40 relative group overflow-hidden rounded-[3rem] bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 p-12 md:p-20">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl text-center lg:text-left">
                <span className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-black tracking-widest uppercase border border-purple-500/20">
                  {txt.coachBadge}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white mt-6 mb-6 leading-tight">
                  {txt.coachTitle}
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  {txt.coachDesc}
                </p>
              </div>
              <Link to="/institution-services" className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-bold transition-all duration-300 shadow-2xl hover:scale-105 whitespace-nowrap">
                {txt.coachBtn}
              </Link>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-purple-500/20 transition-all duration-700"></div>
          </div>

          {/* ── Final CTA ── */}
          <div className="mt-40 mb-20 text-center space-y-10 py-20 rounded-[4rem] bg-gradient-to-b from-white/[0.03] to-transparent border-t border-white/5">
            <h2 className="text-4xl md:text-6xl font-black text-white max-w-4xl mx-auto leading-tight">
              {txt.ctaTitle}
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              {txt.ctaDesc}
            </p>
            <div className="pt-6">
              <Link to="/register" className="px-12 py-5 bg-white text-[#030014] rounded-full font-black text-lg hover:scale-105 transition-all duration-300 shadow-2xl">
                {txt.ctaBtn}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;
