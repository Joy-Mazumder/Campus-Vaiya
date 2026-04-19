import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";

/* ─────────────────────────────────────────────────────────────────────
   PERFORMANCE NOTES
   • All convergence blobs use transform (GPU) only — no layout triggers
   • No mix-blend-mode on animated elements (extremely expensive)
   • filter: blur() only on will-change: transform elements (composited layer)
   • backdrop-blur used sparingly — only on small elements
   • Convergence animation lives ONLY inside the hero 100vh container
   • Rest of page gets subtle static gradient vibes, no moving blurs
───────────────────────────────────────────────────────────────────── */

const customStyles = `
  /* ── Core animations ── */
  @keyframes float_slow {
    0%, 100% { transform: translateY(0px) translateZ(0); }
    50%       { transform: translateY(-20px) translateZ(0); }
  }
  @keyframes shimmer_text {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fade_up {
    0%   { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes rotate_icon {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ── Hero background: three-color convergence (GPU only, no mix-blend) ── */
  /*  Blob positions are animated with translate only.
      Colors overlap via low opacity, producing natural blended hues. */
  @keyframes conv_left {
    0%, 100% { transform: translate(-70vw, 10vh) scale(1)   translateZ(0); opacity: 0.55; }
    45%       { transform: translate(-5vw,  -2vh) scale(1.2) translateZ(0); opacity: 0.70; }
    60%       { transform: translate(0vw,   0vh)  scale(0.8) translateZ(0); opacity: 0.85; }
    75%       { transform: translate(-5vw,  5vh)  scale(0.4) translateZ(0); opacity: 0.40; }
    88%       { transform: translate(-40vw, 8vh)  scale(0.7) translateZ(0); opacity: 0.45; }
  }
  @keyframes conv_right {
    0%, 100% { transform: translate(70vw, -10vh) scale(1)   translateZ(0); opacity: 0.55; }
    45%       { transform: translate(5vw,   0vh)  scale(1.2) translateZ(0); opacity: 0.70; }
    60%       { transform: translate(0vw,   0vh)  scale(0.8) translateZ(0); opacity: 0.85; }
    75%       { transform: translate(5vw,  -5vh)  scale(0.4) translateZ(0); opacity: 0.40; }
    88%       { transform: translate(40vw, -8vh)  scale(0.7) translateZ(0); opacity: 0.45; }
  }
  @keyframes conv_top {
    0%, 100% { transform: translate(0vw, -70vh) scale(1)   translateZ(0); opacity: 0.55; }
    45%       { transform: translate(0vw,  0vh)  scale(1.2) translateZ(0); opacity: 0.70; }
    60%       { transform: translate(0vw,  0vh)  scale(0.8) translateZ(0); opacity: 0.85; }
    75%       { transform: translate(0vw,  8vh)  scale(0.4) translateZ(0); opacity: 0.40; }
    88%       { transform: translate(5vw, -30vh) scale(0.7) translateZ(0); opacity: 0.45; }
  }
  @keyframes flash_collapse {
    0%,  56% { opacity: 0;   transform: translate(-50%, -50%) scale(0.05) translateZ(0); }
    62%       { opacity: 0.7; transform: translate(-50%, -50%) scale(1.8)  translateZ(0); }
    72%       { opacity: 0.4; transform: translate(-50%, -50%) scale(1.2)  translateZ(0); }
    82%       { opacity: 0.1; transform: translate(-50%, -50%) scale(0.8)  translateZ(0); }
    90%, 100% { opacity: 0;   transform: translate(-50%, -50%) scale(0.1) translateZ(0); }
  }

  .blob-left  {
    will-change: transform, opacity;
    animation: conv_left  10s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }
  .blob-right {
    will-change: transform, opacity;
    animation: conv_right 10s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }
  .blob-top   {
    will-change: transform, opacity;
    animation: conv_top   10s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }
  .blob-flash {
    will-change: transform, opacity;
    animation: flash_collapse 10s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  }

  /* ── General utilities ── */
  .anim-fade-up  { animation: fade_up 0.7s ease-out forwards; opacity: 0; }
  .shimmer-text  { background-size: 200% auto; animation: shimmer_text 5s linear infinite; }
  .float-slow    { animation: float_slow 7s ease-in-out infinite; }
  .group:hover .icon-spin { animation: rotate_icon 0.65s cubic-bezier(0.4, 0, 0.2, 1); }

  /* ── Background base ── */
  .page-bg {
    background: #030014;
  }

  /* ── Subtle dot grid ── */
  .dot-grid {
    background-image: radial-gradient(rgba(6,182,212,0.12) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  /* ── Terminal flip ── */
  @keyframes term_flip {
    0%   { transform: perspective(1000px) rotateX(0deg); opacity: 1; }
    35%  { transform: perspective(1000px) rotateX(88deg); opacity: 0.15; }
    65%  { transform: perspective(1000px) rotateX(-88deg); opacity: 0.15; }
    100% { transform: perspective(1000px) rotateX(0deg); opacity: 1; }
  }
  .term-flip { animation: term_flip 0.6s ease-in-out; }

  /* ── Skeleton shimmer ── */
  @keyframes sk_shine {
    0%   { background-position: -300% 0; }
    100% { background-position: 300% 0; }
  }
  .sk {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.04) 0%,
      rgba(6,182,212,0.12) 50%,
      rgba(255,255,255,0.04) 100%
    );
    background-size: 300% 100%;
    animation: sk_shine 1.8s linear infinite;
    border-radius: 5px;
  }

  /* ── Progress bar ── */
  @keyframes prog {
    0%   { width: 0%; }
    35%  { width: 50%; }
    65%  { width: 78%; }
    85%  { width: 93%; }
    100% { width: 100%; }
  }
  .prog-bar { animation: prog 3s ease-in-out forwards; }

  /* ── Cursor blink ── */
  @keyframes cblink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  .cur { animation: cblink 1s step-end infinite; }

  /* ── Ready glow ── */
  @keyframes rg {
    0%,100%{ box-shadow: 0 0 0 rgba(34,197,94,0); }
    50%    { box-shadow: 0 0 28px rgba(34,197,94,0.28); }
  }
  .ready-glow { animation: rg 2.2s ease-in-out infinite; }

  /* ── Page appear ── */
  @keyframes page_in { 0%{opacity:0;transform:scale(0.96);} 100%{opacity:1;transform:scale(1);} }
  .page-in { animation: page_in 0.5s ease-out forwards; }

  /* ── Bar enter ── */
  @keyframes bar_in { 0%{opacity:0;transform:translateY(-5px);} 100%{opacity:1;transform:translateY(0);} }
  .bar-in { animation: bar_in 0.4s ease-out forwards; }

  /* ── Stat card sweep ── */
  @keyframes sweep { 0%{transform:translateX(-100%) skewX(-15deg);} 100%{transform:translateX(250%) skewX(-15deg);} }
  .stat-card { position: relative; overflow: hidden; }
  .stat-card::after {
    content:''; position:absolute; top:0; left:0; width:35%; height:100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    transform: translateX(-100%) skewX(-15deg);
  }
  .stat-card:hover::after { animation: sweep 0.55s ease-out forwards; }

  /* ── Section vibe gradient (subtle, static) ── */
  .vibe-cyan   { background: radial-gradient(ellipse 60% 40% at 15% 50%, rgba(6,182,212,0.06) 0%, transparent 100%); }
  .vibe-purple { background: radial-gradient(ellipse 60% 40% at 85% 50%, rgba(168,85,247,0.06) 0%, transparent 100%); }
  .vibe-blue   { background: radial-gradient(ellipse 80% 50% at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 100%); }

  /* ── Premium card border glow on hover ── */
  .card-glow { transition: box-shadow 0.4s ease, border-color 0.4s ease; }
  .card-glow:hover {
    box-shadow: 0 0 0 1px rgba(6,182,212,0.2), 0 8px 48px rgba(6,182,212,0.07);
  }

  /* ── Mobile adjustments ── */
  @media (max-width: 768px) {
    .hero-blob { width: 260px; height: 260px; filter: blur(50px); }
    .section-pad { padding: 2rem; }
  }
`;

/* ─────────────── Translation object ─────────────── */
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
    ctaTitle: "একাডেমিক জার্নি পরিবর্তন করতে প্রস্তুত?",
    ctaDesc: "হাজারো শিক্ষার্থী ও শিক্ষকের সাথে যুক্ত হও, যারা ইতোমধ্যেই CampusVaiya ব্যবহার করছে।",
    ctaBtn: "এখনই শুরু করো — একদম ফ্রি",
    visionTitle: "আমাদের লক্ষ্য",
    visionDesc: "আমরা শুধু একটি টুল নই; আমরা তোমার ইউনিভার্সিটির দিনগুলোকে আরও সহজ এবং সফল করার সঙ্গী।",
    techTitle: "স্মার্ট স্টুডেন্টদের জন্য স্মার্ট টেকনোলজি",
    techDesc: "ভার্সিটির প্রেসার সামলানোর সবচেয়ে দ্রুততম মাধ্যম। আমাদের ক্লাউড-ইন্টিগ্রেটেড প্ল্যাটফর্ম নিশ্চিত করে যে তোমার ডেটা সবসময় সিঙ্কড, সুরক্ষিত এবং হাতের নাগালে থাকবে।"
  }
};

/* ────────────────────────────────────────────────────────────────────
 �
   HeroBackground — three-color convergence ONLY for the hero viewport
   Blobs live in their own composited layer (will-change: transform).
   NO mix-blend-mode (too expensive), NO massive blur on animated els.
   Colors merge naturally via overlapping semi-transparent radial fills.
───────────────────────────────────────────────────────────────────── */
const HeroBackground = () => (
  /* Strictly 100vh, pointer-events:none so it never blocks interaction */
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    {/* Subtle dot grid */}
    <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.45 }} />

    {/* Convergence anchor — centre of hero */}
    <div
      style={{
        position: 'absolute',
        top: '46%',
        left: '50%',
        width: 0,
        height: 0,
      }}
    >
      {/* CYAN blob — enters from left */}
      <div
        className="blob-left hero-blob"
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.55) 0%, rgba(6,182,212,0.18) 45%, transparent 70%)',
          filter: 'blur(55px)',
          transform: 'translate(-50%,-50%) translateZ(0)',
        }}
      />
      {/* PURPLE blob — enters from right */}
      <div
        className="blob-right hero-blob"
        style={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(168,85,247,0.18) 45%, transparent 70%)',
          filter: 'blur(55px)',
          transform: 'translate(-50%,-50%) translateZ(0)',
        }}
      />
      {/* BLUE blob — enters from top */}
      <div
        className="blob-top hero-blob"
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.50) 0%, rgba(59,130,246,0.15) 45%, transparent 70%)',
          filter: 'blur(55px)',
          transform: 'translate(-50%,-50%) translateZ(0)',
        }}
      />
      {/* Merge flash — bright burst at convergence point */}
      <div
        className="blob-flash"
        style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,170,255,0.85) 0%, rgba(139,92,246,0.40) 50%, transparent 70%)',
          filter: 'blur(38px)',
          top: 0,
          left: 0,
          transform: 'translate(-50%,-50%) scale(0.05) translateZ(0)',
          opacity: 0,
        }}
      />
    </div>

    {/* Soft dark vignette at bottom so content below isn't tinted */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '35%',
        background: 'linear-gradient(to bottom, transparent, #030014)',
        pointerEvents: 'none',
      }}
    />
  </div>
);

/* ─────────────────────────────────────────────────────────────────────
   VisionTerminal — flips on each status change
   Loading → skeleton UI | Ready → CampusVaiya home page mini-mockup
   The "loaded" screen shows ONLY content that exists on the home page.
───────────────────────────────────────────────────────────────────── */
const VisionTerminal = ({ visionStatus }) => {
  const [displayStatus, setDisplayStatus] = useState(visionStatus);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const [progKey, setProgKey] = useState(0);
  const prevRef = useRef(visionStatus);

  useEffect(() => {
    if (visionStatus === prevRef.current) return;
    prevRef.current = visionStatus;

    setIsFlipping(true);
    const swapTimer = setTimeout(() => {
      setDisplayStatus(visionStatus);
      setShowPage(false);
    }, 300);
    const endTimer = setTimeout(() => {
      setIsFlipping(false);
      if (visionStatus.toLowerCase().includes('ready')) {
        setProgKey(k => k + 1);
        setTimeout(() => setShowPage(true), 550);
      }
    }, 620);
    return () => { clearTimeout(swapTimer); clearTimeout(endTimer); };
  }, [visionStatus]);

  const isReady = displayStatus.toLowerCase().includes('ready');

  return (
    <div
      className={`relative rounded-3xl border shadow-2xl overflow-hidden${isReady ? ' ready-glow' : ''}${isFlipping ? ' term-flip' : ''}`}
      style={{
        background: 'rgba(5,5,26,0.92)',
        borderColor: isReady ? 'rgba(34,197,94,0.30)' : 'rgba(255,255,255,0.08)',
        padding: '1.5rem',
        transition: 'border-color 0.6s ease',
      }}
    >
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            isReady ? '#22c55e' : 'rgba(239,68,68,0.5)',
            isReady ? 'rgba(134,239,172,0.7)' : 'rgba(234,179,8,0.5)',
            isReady ? 'rgba(187,247,208,0.6)' : 'rgba(34,197,94,0.5)',
          ].map((c, i) => (
            <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, display: 'inline-block', transition: 'background 0.5s' }} />
          ))}
        </div>
        {isReady && (
          <span className="bar-in" style={{ fontSize: '9px', color: '#4ade80', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ● Live
          </span>
        )}
      </div>

      {/* Command line */}
      <div style={{
        padding: '0.75rem 1rem',
        borderRadius: '12px',
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.05)',
        fontFamily: 'monospace',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '1rem',
      }}>
        <span style={{ color: '#22d3ee', userSelect: 'none' }}>$</span>
        <span style={{ color: isReady ? '#4ade80' : '#cbd5e1', transition: 'color 0.5s', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {displayStatus}
        </span>
        {!isReady && <span className="cur" style={{ display: 'inline-block', width: 8, height: 14, background: '#22d3ee', borderRadius: 2, flexShrink: 0 }} />}
        {isReady && <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>✓</span>}
      </div>

      {/* Content area */}
      {!isReady ? (
        /* ── Skeleton loading state ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Progress bar */}
          <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div
              className="prog-bar"
              key={progKey}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #06b6d4, #6366f1, #a855f7)',
                borderRadius: 99,
                width: 0,
              }}
            />
          </div>
          {/* Address bar skeleton */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="sk" style={{ width: 14, height: 14, flexShrink: 0, borderRadius: 4 }} />
            <div className="sk" style={{ flex: 1, height: 10 }} />
            <div className="sk" style={{ width: 32, height: 10, flexShrink: 0 }} />
          </div>
          {/* Content skeletons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <div className="sk" style={{ height: 16, width: '62%' }} />
            <div className="sk" style={{ height: 10, width: '100%' }} />
            <div className="sk" style={{ height: 10, width: '80%' }} />
            <div className="sk" style={{ height: 10, width: '65%' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 4 }}>
            {[1, 2, 3].map(i => <div key={i} className="sk" style={{ height: 48, borderRadius: 10 }} />)}
          </div>
          <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', letterSpacing: '0.25em', marginTop: 4 }}>
            Secure Neural Link Establishing...
          </div>
        </div>
      ) : (
        /* ── CampusVaiya loaded page mockup ── */
        <div className={showPage ? 'page-in' : ''} style={{ opacity: showPage ? 1 : 0 }}>
          {/* Browser bar */}
          <div className="bar-in" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px',
            background: 'rgba(15,23,42,0.8)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(100,116,139,0.6)', display: 'inline-block' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(100,116,139,0.6)', display: 'inline-block' }} />
            </div>
            <div style={{
              flex: 1, padding: '3px 10px', borderRadius: 7,
              background: 'rgba(0,0,0,0.5)',
              fontSize: 10, fontFamily: 'monospace',
              color: 'rgba(148,163,184,0.8)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ color: '#4ade80' }}>🔒</span>
              <span>campusvaiya.app</span>
            </div>
          </div>

          {/* Mini home page preview */}
          <div style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0a0a2e 0%, #030014 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}>
            {/* Nav */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(0,0,0,0.2)',
            }}>
              <span style={{
                fontSize: 11, fontWeight: 900,
                background: 'linear-gradient(90deg, #22d3ee, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>CampusVaiya</span>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Home', 'Tools', 'Community'].map(l => (
                  <span key={l} style={{ fontSize: 8, color: 'rgba(148,163,184,0.7)' }}>{l}</span>
                ))}
              </div>
            </div>

            {/* Hero mini */}
            <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', marginBottom: 3, lineHeight: 1.3 }}>
                Level up your campus life ✦
              </div>
              <div style={{ fontSize: 8, color: 'rgba(148,163,184,0.7)', marginBottom: 8 }}>
                AI tools · Senior mentors · Global network
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', padding: '4px 10px', borderRadius: 99, background: 'linear-gradient(90deg, #06b6d4, #6366f1)' }}>Join Community</span>
                <span style={{ fontSize: 8, color: 'rgba(203,213,225,0.8)', padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>Explore</span>
              </div>
            </div>

            {/* Stats mini */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '8px 12px 10px' }}>
              {[{ v: '10K+', l: 'Students' }, { v: '50K+', l: 'Reports' }, { v: '500+', l: 'Seniors' }, { v: '5K+', l: 'CGPAs' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '5px 2px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: '#22d3ee' }}>{s.v}</div>
                  <div style={{ fontSize: 7, color: 'rgba(100,116,139,0.9)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 12 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'cblink 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 9, color: '#4ade80', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>
              campusvaiya is ready
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Main Home Component
───────────────────────────────────────────────────────────────────── */
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
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{customStyles}</style>

      <div className="page-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden', position: 'relative' }}>

        {/* ── Language Toggle ── */}
        <button
          onClick={() => setLang(isBn ? 'en' : 'bn')}
          style={{
            position: 'fixed', top: '5.5rem', right: '1.5rem', zIndex: 50,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 99,
            background: 'rgba(5,5,26,0.7)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
            transition: 'border-color 0.25s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
        >
          <svg width="16" height="16" fill="none" stroke="#22d3ee" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
 �        {isBn ? 'English' : 'বাংলা'}
        </button>

        {/* ════════════════════════════════════════════════════════
            HERO SECTION — convergence animation lives here only
        ════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <HeroBackground />

          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '8rem 1.5rem 5rem' }}>
            <div style={{ textAlign: 'center' }}>
              {/* Pill badge */}
              <div
                className="anim-fade-up"
                style={{
                  display: 'inline-block', marginBottom: '1.5rem',
                  padding: '7px 20px', borderRadius: 99,
                  border: '1px solid rgba(6,182,212,0.28)',
                  background: 'rgba(6,182,212,0.05)',
                  animationDelay: '0.1s',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 900, color: '#22d3ee', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {txt.pill}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="anim-fade-up"
                style={{
                  fontSize: 'clamp(2.6rem, 7vw, 5rem)',
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.08,
                  margin: '0 0 1.25rem',
                  animationDelay: '0.2s',
                }}
              >
                {txt.heroTitle1}
                <br />
                <span
                  className="shimmer-text"
                  style={{
                    background: 'linear-gradient(90deg, #22d3ee, #6366f1, #a855f7, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  CampusVaiya
                </span>
              </h1>

              {/* Subtext */}
              <p
                className="anim-fade-up"
                style={{
                  fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                  color: 'rgba(148,163,184,0.9)',
                  maxWidth: 560,
                  margin: '0 auto 2.5rem',
                  lineHeight: 1.75,
                  fontWeight: 500,
                  animationDelay: '0.3s',
                }}
              >
                {txt.heroDesc}
              </p>

              {/* CTAs */}
              <div
                className="anim-fade-up"
                style={{
                  display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem',
                  animationDelay: '0.4s',
                }}
              >
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    style={{
                      padding: '14px 36px', borderRadius: 99,
                      background: 'linear-gradient(90deg, #06b6d4, #6366f1)',
                      color: '#fff', fontWeight: 700, fontSize: 15,
                      boxShadow: '0 0 28px rgba(6,182,212,0.28)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(6,182,212,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(6,182,212,0.28)'; }}
                  >
                    {txt.btnDash}
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    style={{
                      padding: '14px 36px', borderRadius: 99,
                      background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                      color: '#fff', fontWeight: 700, fontSize: 15,
                      boxShadow: '0 0 28px rgba(79,70,229,0.28)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {txt.btnJoin}
                  </Link>
                )}
                <Link
                  to="/tools"
                  style={{
                    padding: '14px 36px', borderRadius: 99,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: '#fff', fontWeight: 700, fontSize: 15,
                    transition: 'transform 0.2s, background 0.2s',
                    display: 'inline-block',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  {txt.btnExplore}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            REST OF PAGE — subtle color vibe only, no moving blurs
        ════════════════════════════════════════════════════════ */}
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 7rem', position: 'relative', zIndex: 1 }}>

          {/* ── Stats Bar ── */}
          <div
            className="anim-fade-up"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginTop: '-2rem',
              animationDelay: '0.5s',
            }}
          >
            {[
              { label: txt.stat1, value: '10K+' },
              { label: txt.stat2, value: '50K+' },
              { label: txt.stat3, value: '500+' },
              { label: txt.stat4, value: '5K+' },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-card card-glow"
                style={{
                  textAlign: 'center',
                  padding: '1.75rem 1rem',
                  borderRadius: '1.75rem',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'default',
                  transition: 'border-color 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(100,116,139,0.9)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700, marginTop: 8 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Features Grid ── */}
          <div style={{ marginTop: '6rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[
                { t: txt.feat1Title, d: txt.feat1Desc, icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", clr: '#22d3ee', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.18)' },
                { t: txt.feat2Title, d: txt.feat2Desc, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", clr: '#c084fc', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.18)' },
                { t: txt.feat3Title, d: txt.feat3Desc, icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z", clr: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.18)' },
              ].map((f, i) => (
                <div
                  key={i}
                  className={`anim-fade-up card-glow`}
                  style={{
                    padding: '2.25rem 2rem',
                    borderRadius: '2rem',
                    background: 'rgba(255,255,255,0.018)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'border-color 0.3s, background 0.3s',
                    animationDelay: `${0.6 + i * 0.1}s`,
                    cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.018)'; }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: f.bg, border: `1px solid ${f.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <svg width="26" height="26" fill="none" stroke={f.clr} viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>{f.t}</h3>
                  <p style={{ fontSize: '0.95rem', color: 'rgba(148,163,184,0.85)', lineHeight: 1.7 }}>{f.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Vision Section with Terminal ── */}
          <div
            className="vibe-cyan"
            style={{
              marginTop: '7rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '3rem',
              padding: '3rem 2.5rem',
              borderRadius: '2.5rem',
              background: 'rgba(255,255,255,0.012)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Text side */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15 }}>{txt.visionTitle}</h2>
              <p style={{ fontSize: '1rem', color: 'rgba(148,163,184,0.85)', lineHeight: 1.75 }}>{txt.visionDesc}</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0, padding: 0, listStyle: 'none' }}>
                {['Personalized AI Roadmaps', 'Secure Cloud Data Management', 'Direct University Network'].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#22d3ee', fontWeight: 700, fontSize: '0.95rem' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Terminal side */}
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-10%',
                background: 'radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }} />
              <VisionTerminal visionStatus={visionStatus} />
            </div>
          </div>

          {/* ── Tech Forward Component ── */}
          <div
            className="vibe-blue"
            style={{
              marginTop: '6rem',
              display: 'flex',
              flexWrap: 'wrap-reverse',
              alignItems: 'center',
              gap: '3rem',
              padding: '3rem 2.5rem',
              borderRadius: '2.5rem',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(99,102,241,0.04) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Text */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', alignSelf: 'flex-start' }}>
                HIGH PERFORMANCE TECH
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15 }}>{txt.techTitle}</h2>
              <p style={{ fontSize: '1rem', color: 'rgba(148,163,184,0.75)', fontStyle: 'italic', lineHeight: 1.65 }}>
                "Efficiency isn't about doing more, it's about doing what matters faster."
              </p>
              <p style={{ fontSize: '1rem', color: 'rgba(148,163,184,0.85)', lineHeight: 1.75 }}>{txt.techDesc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                {[{ v: '99.9%', l: 'Uptime', c: '#22d3ee' }, { v: '0.2s', l: 'Latency', c: '#c084fc' }].map((m, i) => (
                  <div key={i} style={{ padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: 10, color: 'rgba(100,116,139,0.9)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, marginTop: 4 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Phone mockup */}
            <div style={{ flex: '1 1 220px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div
                className="float-slow"
                style={{
                  width: 210,
                  height: 420,
                  background: '#05051a',
                  border: '5px solid rgba(30,41,59,0.9)',
                  borderRadius: '2.5rem',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Notch */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 20, background: 'rgba(15,23,42,0.95)', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, zIndex: 2 }} />
                <div style={{ padding: '1.5rem 1rem 1rem', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ width: 70, height: 7, background: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
                      <div style={{ width: 45, height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                    <div style={{ width: '80%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                      {[['rgba(6,182,212,0.2)', '#06b6d4'], ['rgba(168,85,247,0.2)', '#a855f7'], ['rgba(99,102,241,0.2)', '#6366f1']].map(([bg, br], i) => (
                        <div key={i} style={{ width: 28, height: 28, borderRadius: 8, background: bg, border: `1px solid ${br}30` }} />
                      ))}
                    </div>
                  </div>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(30,41,59,0.8)', flexShrink: 0 }} />
                      <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="float-slow" style={{ position: 'absolute', right: -8, top: 60, width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #a855f7, #ec4899)', opacity: 0.45, filter: 'blur(4px)', animationDelay: '-2s' }} />
              <div className="float-slow" style={{ position: 'absolute', left: -20, bottom: 70, width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #6366f1)', opacity: 0.28, filter: 'blur(6px)', animationDelay: '-4s' }} />
            </div>
          </div>

          {/* ── How It Works ── */}
          <div
            className="vibe-purple"
            style={{ marginTop: '6rem', textAlign: 'center' }}
          >
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>{txt.howItWorksTitle}</h2>
            <p style={{ fontSize: '1rem', color: 'rgba(148,163,184,0.8)', maxWidth: 560, margin: '0 auto 3.5rem' }}>{txt.howItWorksDesc}</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
              {[
                { step: '1', title: txt.hw1Title, desc: txt.hw1Desc },
                { step: '2', title: txt.hw2Title, desc: txt.hw2Desc },
                { step: '3', title: txt.hw3Title, desc: txt.hw3Desc },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.querySelector('.step-circle').style.boxShadow = '0 0 22px rgba(6,182,212,0.35)'}
                  onMouseLeave={e => e.currentTarget.querySelector('.step-circle').style.boxShadow = 'none'}
                >
                  <div
                    className="step-circle"
                    style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: 'rgba(5,5,26,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1.5rem',
                      fontSize: 20, fontWeight: 900, color: '#fff',
                      transition: 'box-shadow 0.3s, border-color 0.3s',
                    }}
                  >
                    {item.step}
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.93rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.7, textAlign: 'center' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Institution Banner ── */}
          <div
            style={{
              marginTop: '6rem',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '2.5rem',
              background: 'linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(30,64,175,0.12) 100%)',
              border: '1px solid rgba(139,92,246,0.18)',
              padding: 'clamp(2rem, 5vw, 4rem)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
              <div style={{ maxWidth: 580 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '5px 14px', borderRadius: 99,
                  background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.22)',
                  color: '#c084fc', fontSize: 10, fontWeight: 900,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                }}>
                  {txt.coachBadge}
                </span>
                <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
                  {txt.coachTitle}
                </h2>
                <p style={{ fontSize: '1rem', color: 'rgba(148,163,184,0.85)', lineHeight: 1.75 }}>
                  {txt.coachDesc}
                </p>
              </div>
              <Link
                to="/institution-services"
                style={{
                  padding: '14px 32px', borderRadius: 99,
                  background: '#7c3aed', color: '#fff',
                  fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap',
                  boxShadow: '0 8px 32px rgba(109,40,217,0.35)',
                  transition: 'transform 0.2s, background 0.2s',
                  display: 'inline-block',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#6d28d9'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#7c3aed'; }}
              >
                {txt.coachBtn}
              </Link>
            </div>
            {/* Ambient corner glow */}
            <div style={{ position: 'absolute', top: '-30%', right: '-5%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(139,92,246,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          </div>

          {/* ── Final CTA ── */}
          <div
            style={{
              marginTop: '6rem',
              marginBottom: '2rem',
              textAlign: 'center',
              padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
              borderRadius: '3rem',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 3.25rem)', fontWeight: 900, color: '#fff', maxWidth: 680, margin: '0 auto 1.25rem', lineHeight: 1.15 }}>
              {txt.ctaTitle}
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(148,163,184,0.8)', maxWidth: 460, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
              {txt.ctaDesc}
            </p>
            <Link
              to="/register"
              style={{
                display: 'inline-block',
                padding: '16px 44px',
                borderRadius: 99,
                background: '#fff',
                color: '#030014',
                fontWeight: 900, fontSize: 16,
                boxShadow: '0 8px 48px rgba(255,255,255,0.15)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 12px 60px rgba(255,255,255,0.22)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 48px rgba(255,255,255,0.15)'; }}
            >
              {txt.ctaBtn}
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;
