import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { 
  LogOut, User, BookOpen, MessageSquare, Wrench, 
  Globe, Building2, Bell, LayoutDashboard, Award, 
  Map, ChevronDown, Menu, X, Search, Command, Zap, Star
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("campus"); 
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for a floating feel
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Feed", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Library", path: "/resources", icon: <BookOpen size={18} /> },
    { name: "Seniors", path: "/help", icon: <MessageSquare size={18} /> },
    { name: "Roadmaps", path: "/roadmaps", icon: <Map size={18} /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled 
      ? "py-2 px-4 md:px-8" 
      : "py-4 px-4 md:px-10"
    }`}>
      <div className={`max-w-[1440px] mx-auto transition-all duration-500 border border-slate-800/50 rounded-[24px] px-4 md:px-6 py-2.5 flex justify-between items-center ${
        scrolled 
        ? "bg-slate-950/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]" 
        : "bg-slate-900/40 backdrop-blur-md"
      }`}>
        
        {/* LEFT: Logo & Mode Switcher */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-950 p-2 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="text-blue-500 fill-blue-500" size={20} />
                </div>
            </div>
            <span className="text-white font-black text-xl hidden lg:block tracking-tighter">
              CAMPUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">VAIYA</span>
            </span>
          </Link>

          {/* Search Bar - Professional Look */}
          <div className="hidden xl:flex items-center relative group">
            <Search className="absolute left-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
            <input 
                type="text" 
                placeholder="Search resources, seniors..." 
                className="bg-slate-950/50 border border-slate-800 rounded-full py-2 pl-11 pr-12 text-sm text-slate-300 w-[280px] focus:w-[350px] focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
            <div className="absolute right-3 flex items-center gap-1 px-1.5 py-0.5 border border-slate-800 rounded bg-slate-900 text-[10px] text-slate-500 font-bold">
               <Command size={10}/> K
            </div>
          </div>
        </div>

        {/* CENTER: Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/30 p-1 rounded-2xl border border-slate-800/40">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                location.pathname === link.path 
                ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_12px_rgba(37,99,235,0.1)]" 
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT: Stats, User & View Switcher */}
        <div className="flex items-center gap-4">
          
          {/* Reputation / Points Badge (Unique Feature) */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-full text-amber-500">
               <Star size={14} className="fill-amber-500" />
               <span className="text-xs font-black tracking-widest">1,240</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2.5 text-slate-400 hover:text-blue-400 bg-slate-900/50 rounded-full border border-slate-800 transition-all hover:scale-105 active:scale-95">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-slate-950 animate-pulse"></span>
              </button>

              {/* Profile Section */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-full transition-all group-hover:border-blue-500/50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white text-[10px] font-black uppercase">
                        {user.fullName.charAt(0)}
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-slate-500 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                </button>

                {/* Dropdown Menu - Luxury Design */}
                <div className="absolute right-0 mt-3 w-60 bg-slate-950 border border-slate-800 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-3 z-[110]">
                   <div className="px-4 py-3 mb-2 border-b border-slate-900">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
                   </div>
                   
                   <div className="space-y-1">
                      <MenuButton to="/profile" icon={<User size={16}/>} label="My Profile" />
                      <MenuButton to="/dashboard" icon={<LayoutDashboard size={16}/>} label="Personal Dashboard" />
                      <MenuButton to="/tools" icon={<Wrench size={16}/>} label="My Saved Tools" />
                   </div>

                   <div className="h-[1px] bg-slate-900 my-2 mx-2"></div>
                   
                   <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
                   >
                    <LogOut size={16} /> Logout
                   </button>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition">
                Log in
              </Link>
              <Link to="/register" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE NAV OVERLAY */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 p-4 bg-slate-950 border border-slate-800 rounded-[32px] space-y-3 animate-in fade-in zoom-in duration-300 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 pb-2">
             <button onClick={() => setViewMode('global')} className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black ${viewMode === 'global' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
               <Globe size={14}/> GLOBAL
             </button>
             <button onClick={() => setViewMode('campus')} className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black ${viewMode === 'campus' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500'}`}>
               <Building2 size={14}/> CAMPUS
             </button>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-300 bg-slate-900/50 border border-slate-800/50"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.icon}
              <span className="font-bold">{link.name}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

// Helper Component for Dropdown Items
const MenuButton = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-400 hover:text-blue-400 hover:bg-blue-500/5 rounded-2xl transition-all">
        {icon} {label}
    </Link>
);

export default Navbar;