import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';

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
import { SocketProvider } from './context/SocketContext';

// Placeholder Pages
// const Dashboard = () => <div className="pt-32 text-white text-center text-3xl font-black">Dashboard (Coming Soon)</div>;
const Home = () => <div className="pt-32 text-white text-center text-3xl font-black">Welcome to CampusVaiya</div>;

function App() {
  return (
    <AuthProvider>
      <SocketProvider> 
        <ModeProvider>
        <Router>
          <div className="min-h-screen bg-slate-950">
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

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </ModeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
// hellow hi bye bye

export default App;