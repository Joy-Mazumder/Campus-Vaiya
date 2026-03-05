import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back to CampusVaiya!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-4">
            <Zap className="text-blue-500 fill-blue-500" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white">Welcome Back</h2>
          <p className="text-slate-400 mt-2">Continue your academic journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-500" size={20} />
            <input 
              type="email" placeholder="Email Address" required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:border-blue-500 outline-none transition"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-500" size={20} />
            <input 
              type="password" placeholder="Password" required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 text-white focus:border-blue-500 outline-none transition"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
          >
            Sign In <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-400 font-bold hover:underline">Register Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;