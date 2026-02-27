import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { 
  LogOut, User, BookOpen, MessageSquare, Wrench, 
  Globe, Building2, Bell, LayoutDashboard, Award, 
  Map, ChevronDown, Menu, X 
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("campus"); // 'global' or 'campus'

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Library", path: "/resources", icon: <BookOpen size={18} /> },
    { name: "Seniors", path: "/help", icon: <MessageSquare size={18} /> },
    { name: "Tools", path: "/tools", icon: <Wrench size={18} /> },
    { name: "Roadmaps", path: "/roadmaps", icon: <Map size={18} /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <Award size={18} /> },
  ];

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-[100] px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Left: Logo & View Switcher */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg group-hover:rotate-6 transition-transform">
              <span className="text-white font-black text-xl px-1">CV</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block tracking-tight">
              Campus<span className="text-blue-500">Vaiya</span>
            </span>
          </Link>

          {/* Mode Switcher - Only shown if user has an institution */}
          {user?.university && (
            <div className="hidden lg:flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("global")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "global" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:text-white"
                }`}
              >
                <Globe size={14} /> Global
              </button>
              <button
                onClick={() => setViewMode("campus")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "campus" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-slate-400 hover:text-white"
                }`}
              >
                <Building2 size={14} /> My Campus
              </button>
            </div>
          )}
        </div>

        {/* Center: Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === link.path 
                ? "bg-slate-900 text-blue-400" 
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="p-2 text-slate-400 hover:text-blue-400 bg-slate-900 rounded-xl border border-slate-800 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 pr-3 bg-slate-900 border border-slate-800 rounded-full hover:border-slate-700 transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold uppercase text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white leading-none">{user.fullName.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-500">{user.role}</p>
                  </div>
                  <ChevronDown size={14} className="text-slate-500 group-hover:rotate-180 transition-transform" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 overflow-hidden">
                   <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition">
                    <User size={16} /> My Profile
                  </Link>
                  <div className="h-px bg-slate-800 my-1 mx-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-slate-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="px-5 py-2 text-sm font-bold text-slate-300 hover:text-white transition">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-2 mb-4">
             <button
                onClick={() => setViewMode("global")}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold ${
                  viewMode === "global" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400"
                }`}
              >
                <Globe size={14} /> Global
              </button>
              <button
                onClick={() => setViewMode("campus")}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-xs font-bold ${
                  viewMode === "campus" ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400"
                }`}
              >
                <Building2 size={14} /> My Campus
              </button>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 bg-slate-900/50 active:bg-slate-800"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;