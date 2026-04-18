import React, { useState, useContext, useEffect } from 'react';
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

  /* Status Typing Animation */
  @keyframes status_pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

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

  /* Enhanced Fluid Glows with Color Mixing */
  .glow-blob {
    mix-blend-mode: screen; /* This merges the colors where they overlap */
    filter: blur(120px);
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;
    animation: float_amb 10s ease-in-out infinite;
  }

  .float-element { animation: float_amb 6s ease-in-out infinite; }
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

const Home = () => {
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const [lang, setLang] = useState('en');
  const txt = t[lang];
  const isBn = lang === 'bn';

  // State for Vision Terminal
  const [visionStatus, setVisionStatus] = useState('Initializing Systems...');

  useEffect(() => {
    const statuses = [
      'Analyzing Academic Data...',
      'Syncing Campus Ecosystem...',
      'Optimizing AI Roadmaps...',
      'CampusVaiya is ready to help you!'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setVisionStatus(statuses[i]);
      i = (i + 1) % statuses.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{customStyles}</style>
      
      <div className="relative min-h-screen flex flex-col items-center overflow-hidden premium-mesh">
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 z-0 grid-overlay opacity-40"></div>

        {/* --- Multi-color Merged Background Orbs --- */}
        <div className="glow-blob bg-blue-600 top-[-10%] left-[10%] w-[600px] h-[600px]" style={{ animationDuration: '15s' }}></div>
        <div className="glow-blob bg-purple-600 top-[15%] left-[25%] w-[500px] h-[500px]" style={{ animationDelay: '-5s', animationDuration: '12s' }}></div>
        <div className="glow-blob bg-cyan-500 top-[5%] left-[15%] w-[450px] h-[450px]" style={{ animationDelay: '-2s', animationDuration: '18s' }}></div>
        
        <div className="glow-blob bg-indigo-600 bottom-[-10%] right-[10%] w-[600px] h-[600px]" style={{ animationDuration: '14s' }}></div>
        <div className="glow-blob bg-blue-400 bottom-[5%] right-[20%] w-[500px] h-[500px]" style={{ animationDelay: '-7s', animationDuration: '16s' }}></div>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(isBn ? 'en' : 'bn')}
          className="fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-xl text-sm font-bold text-white hover:border-cyan-500 transition-all duration-300 shadow-2xl"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          {isBn ? 'English' : 'বাংলা'}
        </button>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-28">
          
          {/* ── Hero Section ─────────────────────────────────────────────────── */}
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

          {/* ── Stats Bar ────────────────────────────────────────────────── */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 anim-fade-up" style={{ animationDelay: '0.5s' }}>
            {[
              { label: txt.stat1, value: '10K+' },
              { label: txt.stat2, value: '50K+' },
              { label: txt.stat3, value: '500+' },
              { label: txt.stat4, value: '5K+' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl hover:border-cyan-500/30 transition-all duration-500 group">
                <div className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors">{stat.value}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Features Grid ────────────────────────────────────────── */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: txt.feat1Title, d: txt.feat1Desc, icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", color: "cyan" },
              { t: txt.feat2Title, d: txt.feat2Desc, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "purple" },
              { t: txt.feat3Title, d: txt.feat3Desc, icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z", color: "blue" }
            ].map((f, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 anim-fade-up" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-${f.color}-500/10 border border-${f.color}-500/20 icon-rotate`}>
                  <svg className={`w-8 h-8 text-${f.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{f.t}</h3>
                <p className="text-slate-400 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>

          {/* ── Vision Section (UPGRADED WITH DYNAMIC LOADING) ────────── */}
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
               <div className="relative z-10 p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl">
                  {/* Mockup Top Header */}
                  <div className="flex gap-2 mb-8">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  
                  {/* Dynamic Status Display */}
                  <div className="space-y-6">
                    <div className="h-2 w-1/3 bg-cyan-500/30 rounded animate-pulse"></div>
                    <div className="py-8 px-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-sm">
                      <span className="text-cyan-400 mr-2">$</span>
                      <span className={`${visionStatus.includes('ready') ? 'text-green-400' : 'text-slate-300'}`}>
                        {visionStatus}
                      </span>
                      <span className="inline-block w-2 h-4 bg-cyan-500 ml-2 animate-[status_pulse_1s_infinite]"></span>
                    </div>
                    
                    {/* Visual Progress Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-1000 ${visionStatus.includes('ready') ? 'bg-green-500' : 'bg-slate-700 animate-pulse'}`}></div>
                      ))}
                    </div>

                    <div className="mt-4 text-[10px] text-slate-500 text-center uppercase tracking-[0.3em]">
                      Secure Neural Link Established
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* ── Tech-Forward Component ──────────────── */}
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
                        {[1,2,3,4].map(i => (
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

          {/* ── Ecosystem / How it works ───────────────────────────── */}
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

          {/* ── Institution Banner ────────────────────────── */}
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

          {/* ── Final CTA ───────────────────────────────────── */}
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