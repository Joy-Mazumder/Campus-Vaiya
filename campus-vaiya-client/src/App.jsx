import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CreateInstitution from './pages/Institution/CreateInstitution';
import Dashboard from './pages/Dashboard/Dashboard';
import MyProfile from './pages/Profile/MyProfile';
import LabReportGen from './pages/Tools/LabReportGen';
import AiRoadmap from './pages/Tools/AiRoadmap';
import GpaTracker from './pages/Tools/CGPACalculator';
import SeniorHelp from './pages/SeniorHelp/SeniorHelp';
import Feed from './pages/Feed/Feed';
import Messages from './pages/Chat/Messages';
import Library from './pages/Library/Library';
import ToolsPage from './pages/Tools/Tools';
import MathSolver from './pages/Tools/MathSolver';
import ScienceExplainer from './pages/Tools/ScienceExplainer';
import EnglishGrammar from './pages/Tools/EnglishGrammar';
import HandwrittenNotes from './pages/Tools/HandwrittenNotes';
import ErDiagram from './pages/Tools/ErDiagram';
import ResearchSummarizer from './pages/Tools/ResearchSummarizer';
import PlagiarismChecker from './pages/Tools/PlagiarismChecker';
import LiteratureReview from './pages/Tools/LiteratureReview';
import ResearchGapFinder from './pages/Tools/ResearchGapFinder';

// Custom CSS for animations and pattern
const customStyles = `
  @keyframes float_amb { 0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; } 50% { transform: translateY(-30px) scale(1.05); opacity: 1; } }
  @keyframes shimmer_text { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes fade_up_hero { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes fade_up_cards { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes cta_pulse { 0% { box-shadow: 0 0 0 0 rgba(37,99,235, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(37,99,235, 0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235, 0); } }

  .anim-float-amb { animation: float_amb 10s ease-in-out infinite; }
  .anim-fade-up-hero { animation: fade_up_hero 0.8s ease-out forwards; opacity: 0; }
  .anim-fade-up-cards { animation: fade_up_cards 0.6s ease-out forwards; opacity: 0; }
  .shimmer-text { background-size: 200% auto; animation: shimmer_text 5s linear infinite; }
  .anim-cta-pulse { animation: cta_pulse 2s infinite; }
  .bg-grid-pattern { background-image: linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px); background-size: 50px 50px; }
`;

// 🌟 Truly Gorgeous & Impactful Home Component
const Home = () => (
  <>
    <style>{customStyles}</style>
    <div className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center overflow-hidden bg-grid-pattern">

      {/* Background Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none anim-float-amb"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none anim-float-amb" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-emerald-500/10 rounded-[100%] blur-[160px] pointer-events-none"></div>

      {/* Hero Icon Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 opacity-[0.03] text-[500px] text-white pointer-events-none">
        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 1 7l11 5 9-4.09V17h2V7L12 2zM4.14 9.17 12 12.74l7.86-3.57L12 5.61 4.14 9.17zM12 15l-7-3.18V14l7 3.18L19 14v-2.18L12 15z" /></svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center space-y-10 mt-10">
          <div className="inline-block mb-4 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-inner anim-fade-up-hero" style={{ animationDelay: '0.1s' }}>
            <span className="flex items-center gap-2.5 text-xs font-semibold text-blue-300 tracking-[0.2em] uppercase">
              🚀 The future of campus life is here
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.95] anim-fade-up-hero" style={{ animationDelay: '0.2s' }}>
            Level up your campus life with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 drop-shadow-sm shimmer-text">
              CampusVaiya
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed anim-fade-up-hero" style={{ animationDelay: '0.3s' }}>
            Your digital campus ecosystem. Connect with seniors, automate your lab reports, track CGPA, and unlock AI-driven academic roadmaps in one place.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10 anim-fade-up-hero" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="group relative px-9 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-500 text-white rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 overflow-hidden anim-cta-pulse">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Join the Community
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </Link>
            <Link to="/tools/cgpa" className="px-9 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-inner">
              Explore Features
            </Link>
          </div>
        </div>

        {/* 📊 NEW COMPONENT: Live Statistics Bar */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 anim-fade-up-hero" style={{ animationDelay: '0.5s' }}>
          {[
            { label: 'Active Students', value: '10K+' },
            { label: 'Lab Reports Gen', value: '50K+' },
            { label: 'Expert Seniors', value: '500+' },
            { label: 'CGPA Tracked', value: '5K+' }
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="relative group bg-slate-900/40 backdrop-blur-2xl p-9 rounded-3xl border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden shadow-2xl anim-fade-up-cards" style={{ animationDelay: '0.6s' }}>
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-8 border border-cyan-500/30 group-hover:rotate-[360deg] transition-transform duration-700">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Tools</h3>
              <p className="text-slate-400 leading-relaxed font-light text-lg">
                Instantly generate lab reports, calculate your CGPA seamlessly, and get personalized AI roadmaps for your career.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group bg-slate-900/40 backdrop-blur-2xl p-9 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden shadow-2xl anim-fade-up-cards" style={{ animationDelay: '0.7s' }}>
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/30 group-hover:rotate-[360deg] transition-transform duration-700">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Senior Mentorship</h3>
              <p className="text-slate-400 leading-relaxed font-light text-lg">
                Stuck on a difficult topic? Connect directly with experienced seniors to get the exact guidance and mentorship you need.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group bg-slate-900/40 backdrop-blur-2xl p-9 rounded-3xl border border-white/10 hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-3 overflow-hidden shadow-2xl anim-fade-up-cards" style={{ animationDelay: '0.8s' }}>
            <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/30 group-hover:rotate-[360deg] transition-transform duration-700">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Campus Network</h3>
              <p className="text-slate-400 leading-relaxed font-light text-lg">
                Stay in the loop with the campus feed, access the digital library, and chat with your peers in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* 🌟 NEW COMPONENT: Bottom Interactive Banner */}
        <div className="mt-40 p-12 rounded-[40px] bg-gradient-to-br from-blue-600 to-purple-700 text-center relative overflow-hidden anim-fade-up-hero">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">Ready to transform your academic journey?</h2>
          <p className="text-blue-100 mb-10 text-lg md:text-xl max-w-2xl mx-auto relative z-10">Join thousands of students who are already using CampusVaiya to simplify their university life.</p>
          <Link to="/register" className="inline-block px-12 py-5 bg-white text-blue-600 rounded-full font-black text-xl hover:bg-blue-50 transition-colors shadow-2xl relative z-10">
            Get Started Now — It's Free
          </Link>
        </div>
      </div>
    </div>
  </>
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ModeProvider>
          <Router>
            <div className="min-h-screen bg-slate-950 selection:bg-cyan-500/30">
              <Navbar />
              <Toaster position="top-center" reverseOrder={false} />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-institution" element={<CreateInstitution />} />
                <Route path="/profile" element={<MyProfile />} />
                <Route path="/tools/cgpa" element={<GpaTracker />} />
                <Route path="/tools/lab-gen" element={<LabReportGen />} />
                <Route path="/roadmaps" element={<AiRoadmap />} />
                <Route path="/senior-help" element={<SeniorHelp />} />
                <Route path="/Feed" element={<Feed />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:receiverId" element={<Messages />} />
                <Route path="/library" element={<Library />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/tools/math-solver" element={<MathSolver />} />
                <Route path="/tools/science-explainer" element={<ScienceExplainer />} />
                <Route path="/tools/english-grammar" element={<EnglishGrammar />} />
                <Route path="/tools/notes-digitizer" element={<HandwrittenNotes />} />
                <Route path="/tools/er-diagram" element={<ErDiagram />} />
                <Route path="/tools/research-summarizer" element={<ResearchSummarizer />} />
                <Route path="/tools/plagiarism-checker" element={<PlagiarismChecker />} />
                <Route path="/tools/literature-review" element={<LiteratureReview />} />
                <Route path="/tools/research-gap-finder" element={<ResearchGapFinder />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </ModeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;