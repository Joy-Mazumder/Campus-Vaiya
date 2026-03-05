import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ModeContext } from "../../context/ModeContext"; // মুড সুইচিংয়ের জন্য
import { 
  LogOut, User, BookOpen, MessageSquare, 
  Globe, Building2, Bell, LayoutDashboard, Wrench,
  Search, Command, Zap, Star, Menu, X, ChevronDown, Map
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { mode, toggleMode } = useContext(ModeContext); // context theke ashbe
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Feed", path: "/Feed", icon: <LayoutDashboard size={18} /> },
    { name: "Library", path: "/resources", icon: <BookOpen size={18} /> },
    { name: "Seniors", path: "/help", icon: <MessageSquare size={18} /> },
    { name: "Roadmaps", path: "/roadmaps", icon: <Map size={18} /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? "py-2 px-4 md:px-8" : "py-4 px-4 md:px-10"}`}>
      <div className={`max-w-[1440px] mx-auto transition-all duration-500 border border-slate-800/50 rounded-[24px] px-4 md:px-6 py-2.5 flex justify-between items-center ${scrolled ? "bg-slate-950/80 backdrop-blur-2xl shadow-2xl" : "bg-slate-900/40 backdrop-blur-md"}`}>
        
        {/* LEFT: Branding & Toggle */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative bg-slate-950 p-2 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform">
                {mode === 'campus' && user?.institution?.logo ? (
                    <img src={user.institution.logo} alt="Inst Logo" className="w-6 h-6 object-contain" />
                ) : (
                    <Zap className="text-blue-500 fill-blue-500" size={20} />
                )}
            </div>
            <span className="text-white font-black text-lg tracking-tighter hidden lg:block uppercase">
              {mode === 'campus' && user?.institution ? user.institution.name : (
                <>CAMPUS<span className="text-blue-400">VAIYA</span></>
              )}
            </span>
          </Link>

          {/* Mode Switcher */}
          {user && (
            <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
                <button 
                    onClick={() => toggleMode('campus')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${mode === 'campus' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}
                >
                    <Building2 size={12}/> CAMPUS
                </button>
                <button 
                    onClick={() => toggleMode('global')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${mode === 'global' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
                >
                    <Globe size={12}/> GLOBAL
                </button>
            </div>
          )}
        </div>

        {/* CENTER: Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/30 p-1 rounded-2xl border border-slate-800/40">
          {navLinks.map((link) => (
            <Link
              key={link.path} to={link.path}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${location.pathname === link.path ? "bg-blue-600/10 text-blue-400 shadow-inner" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}
            >
              {link.icon} {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT: Stats & Profile */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-full text-amber-500">
                <Star size={14} className="fill-amber-500" />
                <span className="text-xs font-black tracking-widest">{user.reputationPoints || 0}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 text-slate-400 hover:text-blue-400 bg-slate-900/50 rounded-full border border-slate-800 transition-all">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-slate-950 animate-pulse"></span>
              </button>

              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-full transition-all group-hover:border-blue-500/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-white uppercase overflow-hidden">
                        {user.profilePic ? <img src={user.profilePic} /> : user.fullName.charAt(0)}
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-slate-500 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                </button>

                {/* Profile Dropdown */}
                <div className="absolute right-0 mt-3 w-64 bg-slate-950 border border-slate-800 rounded-[28px] shadow-3xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-3 z-[110]">
                   <div className="px-4 py-3 mb-2 border-b border-slate-900">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Logged in as</p>
                      <p className="text-sm font-black text-white truncate">{user.fullName}</p>
                   </div>
                   <div className="space-y-1">
                      <MenuButton to="/profile" icon={<User size={16}/>} label="My Profile" />
                      <MenuButton to="/dashboard" icon={<LayoutDashboard size={16}/>} label="Personal Dashboard" />
                      <MenuButton to="/tools" icon={<Wrench size={16}/>} label="Utility Tools" />
                   </div>
                   <button onClick={() => {logout(); navigate('/login')}} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-2xl mt-2 transition-all">
                    <LogOut size={16} /> Logout
                   </button>
                </div>
              </div>

              <button className="md:hidden p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition">Login</Link>
              <Link to="/register" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-full shadow-lg shadow-blue-600/20 transition-all active:scale-95">JOIN NOW</Link>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 p-4 bg-slate-950 border border-slate-800 rounded-[32px] space-y-3 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-2 gap-2 pb-2">
             <button onClick={() => toggleMode('global')} className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black tracking-widest ${mode === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500'}`}>
               <Globe size={14}/> GLOBAL
             </button>
             <button onClick={() => toggleMode('campus')} className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black tracking-widest ${mode === 'campus' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500'}`}>
               <Building2 size={14}/> CAMPUS
             </button>
          </div>
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-300 bg-slate-900/50 border border-slate-800/50 font-bold" onClick={() => setIsMenuOpen(false)}>
              {link.icon} {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

const MenuButton = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-blue-400 hover:bg-blue-500/5 rounded-2xl transition-all">
        {icon} {label}
    </Link>
);

export default Navbar;