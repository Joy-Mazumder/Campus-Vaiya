import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  return (
    <Router>
      {}
      <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30">
        <Navbar />
        
        {}
        <main className="pt-24 md:pt-32"> 
          <Routes>
            <Route path="/" element={
              <div className="flex items-center justify-center min-h-[60vh]">
                <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">
                  Welcome to <span className="text-blue-500">CampusVaiya</span>
                </h1>
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;