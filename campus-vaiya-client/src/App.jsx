import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
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