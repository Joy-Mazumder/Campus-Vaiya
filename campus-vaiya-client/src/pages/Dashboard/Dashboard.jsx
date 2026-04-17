import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ModeContext } from '../../context/ModeContext';
import {
  TrendingUp, Bell, Map, Send, Trophy, Globe,
  Building2, FileText, Sparkles, CheckCircle, DollarSign,
  Mail, Phone, Calendar, User as UserIcon, ChevronRight,
  BookOpen, Star, Zap, Award, Clock, ArrowUpRight,
  GraduationCap, History, Users, Info, Quote, Layers,
  Heart, FlaskConical, Library, Music, Cpu, Wifi,
  TreePine, Shield, Globe2, BookMarked, BarChart3, Microscope
} from 'lucide-react';
import API from '../../services/api';
import { Link } from 'react-router-dom';
import MyInstitution from './MyInstitution';

/* Categories shown as community cards in Overview (excluded from Authorities sidebar) */
const OVERVIEW_CATEGORIES = ['Alumni', 'Faculty', 'Honorary', 'Staff', 'Other'];

const getCategoryColor = (cat) => ({
  Alumni:    '#06b6d4',
  Faculty:   '#6366f1',
  Honorary:  '#f97316',
  Staff:     '#94a3b8',
  Other:     '#64748b',
  'Vice Chancellor': '#f59e0b',
  VC:        '#f59e0b',
  Chairman:  '#6366f1',
  Director:  '#0ea5e9',
  Dean:      '#10b981',
  Principal: '#ec4899',
  Founder:   '#a855f7',
}[cat] || '#a855f7');

/* ── Bangladesh HSC/Degree Grading System ── */
const getBDGrade = (pct) => {
  if (pct >= 80) return { grade: 'A+', gpa: '5.00', label: 'Outstanding',   color: '#22c55e',  bg: '#14532d' };
  if (pct >= 70) return { grade: 'A',  gpa: '4.00', label: 'Excellent',     color: '#4ade80',  bg: '#166534' };
  if (pct >= 60) return { grade: 'A-', gpa: '3.50', label: 'Very Good',     color: '#86efac',  bg: '#15803d' };
  if (pct >= 50) return { grade: 'B',  gpa: '3.00', label: 'Good',          color: '#60a5fa',  bg: '#1e3a5f' };
  if (pct >= 40) return { grade: 'C',  gpa: '2.00', label: 'Average',       color: '#fbbf24',  bg: '#451a03' };
  if (pct >= 33) return { grade: 'D',  gpa: '1.00', label: 'Below Average', color: '#fb923c',  bg: '#431407' };
  return             { grade: 'F',  gpa: '0.00', label: 'Fail',          color: '#f87171',  bg: '#450a0a' };
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { mode } = useContext(ModeContext);

  const [dashboardData, setDashboardData] = useState({ notices: [], results: [], fees: [] });
  const [stats, setStats] = useState({ cgpa: 0, credits: 0 });
  const [campusTab, setCampusTab] = useState('overview');
  const [personalities, setPersonalities] = useState([]);

  const studentInstId =
    user?.enrolledCampus && typeof user.enrolledCampus === 'object'
      ? user.enrolledCampus._id?.toString()
      : user?.enrolledCampus?.toString();

  const [campusInfo, setCampusInfo] = useState(null);
  const [campusLoading, setCampusLoading] = useState(false);

  const managedInstId =
    user?.institution && typeof user.institution === 'object'
      ? user.institution._id?.toString()
      : user?.institution?.toString();

  const isAdmin = user?.institutionRole === 'Admin' || !!managedInstId;
  const hasManagedInstitution = isAdmin && managedInstId;

  const activeInst = mode === 'campus' ? campusInfo : null;
  const showMainHeader = !(mode === 'global' && hasManagedInstitution);

  const authorityPersonalities = personalities.filter(p => !OVERVIEW_CATEGORIES.includes(p.category));
  const communityPersonalities  = personalities.filter(p =>  OVERVIEW_CATEGORIES.includes(p.category));

  useEffect(() => {
    if (!user) return;
    API.get('/tools/gpa-history')
      .then(res => setStats({
        cgpa:    parseFloat(res.data?.cumulativeCGPA) || 0,
        credits: parseInt(res.data?.totalCredits)     || 0,
      }))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user || mode !== 'campus' || !studentInstId) return;
    setCampusInfo(null);
    setCampusLoading(true);
    const alreadyPopulated =
      typeof user.enrolledCampus === 'object' && user.enrolledCampus !== null && user.enrolledCampus.name;
    if (alreadyPopulated) {
      setCampusInfo(user.enrolledCampus);
      setCampusLoading(false);
    } else {
      API.get(`/institution/details/${studentInstId}`)
        .then(res => setCampusInfo(res.data))
        .catch(err => console.error('Error fetching institution details:', err))
        .finally(() => setCampusLoading(false));
    }
  }, [user, mode, studentInstId]);

  useEffect(() => {
    if (!user || mode !== 'campus' || !studentInstId) return;
    const fetchData = async () => {
      try {
        const [nRes, rRes, fRes] = await Promise.all([
          API.get(`/institution/${studentInstId}/notices`).catch(() => ({ data: [] })),
          API.get(`/institution/result/my-results`).catch(() => ({ data: [] })),
          API.get(`/institution/finance/my-fees/${studentInstId}`).catch(() => ({ data: [] })),
        ]);
        setDashboardData({ notices: nRes.data || [], results: rRes.data || [], fees: fRes.data || [] });
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      }
    };
    fetchData();
  }, [user, mode, studentInstId]);

  useEffect(() => {
    if (!studentInstId || mode !== 'campus') return;
    API.get(`/institution/${studentInstId}/personalities`)
      .then(res => setPersonalities(res.data || []))
      .catch(() => {});
  }, [studentInstId, mode]);

  const tc = activeInst?.themeColor || '#6366f1';

  const tabs = [
    { id: 'overview',    label: 'Overview',   icon: <BookOpen size={14} /> },
    { id: 'departments', label: 'Departments', icon: <Layers size={14} /> },
    { id: 'feed',        label: 'Notices',     icon: <Bell size={14} /> },
    { id: 'results',     label: 'Results',     icon: <Award size={14} /> },
    { id: 'fees',        label: 'Fees',        icon: <DollarSign size={14} /> },
    { id: 'faculty',     label: 'Faculty',     icon: <UserIcon size={14} /> },
  ];

  const communityCount = (cat) => personalities.filter(p => p.category === cat).length;

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-20 px-3 md:px-6"
      style={{ background: 'linear-gradient(150deg,#07091a 0%,#0b1128 45%,#060e1c 100%)', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── AMBIENT ORBS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-8%] right-[-4%] w-[700px] h-[700px] rounded-full blur-[200px] opacity-[0.20]" style={{ background: tc }} />
        <div className="absolute top-[30%] left-[-6%] w-[500px] h-[500px] rounded-full blur-[170px] opacity-[0.14]" style={{ background: '#ec4899' }} />
        <div className="absolute bottom-[5%] right-[20%] w-[400px] h-[400px] rounded-full blur-[200px] opacity-[0.12]" style={{ background: '#06b6d4' }} />
        <div className="absolute top-[55%] left-[40%] w-[300px] h-[300px] rounded-full blur-[160px] opacity-[0.11]" style={{ background: '#a855f7' }} />
        <div className="absolute top-[15%] left-[25%] w-[250px] h-[250px] rounded-full blur-[150px] opacity-[0.09]" style={{ background: '#f59e0b' }} />
      </div>

      <div className="max-w-[1440px] mx-auto space-y-6 relative z-10">

        {/* ══════════════════════════════════════════════════════ */}
        {/* HEADER CARD                                            */}
        {/* ══════════════════════════════════════════════════════ */}
        {showMainHeader && (
          <div className="relative overflow-hidden rounded-[36px] border"
            style={{ borderColor: tc + '38', background: 'linear-gradient(160deg,#0f1a30,#07091a)', boxShadow: `0 0 80px ${tc}18, 0 32px 80px rgba(0,0,0,0.8)` }}>
            <div className="absolute inset-0 rounded-[36px] pointer-events-none"
              style={{ background: `linear-gradient(135deg,${tc}28 0%,transparent 55%,${tc}14 100%)` }} />

            {/* BANNER */}
            <div className="h-56 md:h-72 w-full relative overflow-hidden rounded-t-[36px]">
              {mode === 'global' ? (
                <div className="absolute inset-0">
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#0f1a30,#07091a)' }} />
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%,${tc}55,transparent)` }} />
                  <div className="absolute top-[-20%] right-[5%] w-96 h-96 rounded-full blur-[130px]" style={{ background: tc + '45' }} />
                  <div className="absolute bottom-[-10%] left-[5%] w-72 h-72 rounded-full blur-[100px] opacity-40 bg-pink-500" />
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>
              ) : campusLoading ? (
                <div className="w-full h-full bg-slate-900 animate-pulse" />
              ) : activeInst?.banner ? (
                <img src={activeInst.banner} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${tc}35,#07091a 60%,#060e1c)` }} />
                  <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: tc + '35' }} />
                  <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] opacity-25 bg-purple-600" />
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07091a] via-[#07091a20] to-transparent" />
            </div>

            {/* PROFILE ROW */}
            <div className="px-6 md:px-10 pb-8 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="flex items-end gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#131f38,#07091a)', border: `3px solid ${tc}65`, boxShadow: `0 0 40px ${tc}35, 0 8px 40px rgba(0,0,0,0.9)` }}>
                    {mode === 'global' ? <Globe className="w-11 h-11" style={{ color: tc }} />
                      : campusLoading ? <div className="w-full h-full bg-slate-800 animate-pulse" />
                      : activeInst?.logo ? <img src={activeInst.logo} className="w-full h-full object-contain p-2" alt="Logo" />
                      : <Building2 className="w-11 h-11 text-slate-500" />}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-[#07091a]" style={{ background: tc, boxShadow: `0 0 14px ${tc}` }} />
                </div>
                <div className="mb-1.5">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border" style={{ background: tc + '22', borderColor: tc + '55', color: tc }}>{mode} mode</span>
                    {mode === 'global' && isAdmin && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-400/40 text-amber-400">Admin</span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-none">
                    {mode === 'global' ? 'Global Universe'
                      : campusLoading ? <span className="inline-block w-56 h-8 bg-slate-800 animate-pulse rounded-xl" />
                      : (activeInst?.name || 'Institution Not Found')}
                  </h1>
                  <p className="text-slate-400 text-sm font-medium mt-2">
                    {user?.fullName} · {mode === 'global' && isAdmin ? 'Institution Admin' : 'Student'}
                    {activeInst?.foundedYear && ` · Est. ${activeInst.foundedYear}`}
                  </p>
                </div>
              </div>

              {mode === 'campus' && (
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="relative overflow-hidden rounded-2xl px-7 py-5 border text-center"
                    style={{ background: `linear-gradient(135deg,${tc}22,#0f1a30)`, borderColor: tc + '55', boxShadow: `0 0 40px ${tc}28` }}>
                    <div className="absolute inset-0 opacity-15 blur-xl pointer-events-none rounded-2xl" style={{ background: tc }} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">CGPA</p>
                    <p className="text-5xl font-black tabular-nums leading-none relative z-10" style={{ color: tc }}>{stats.cgpa.toFixed(2)}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-1.5 relative z-10" style={{ color: tc + 'bb' }}>
                      {stats.cgpa >= 3.5 ? 'Honors' : stats.cgpa >= 3.0 ? 'Good Standing' : 'Pass'}
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl px-6 py-5 border text-center"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)' }}>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Credits</p>
                    <p className="text-4xl font-black text-white tabular-nums leading-none">{stats.credits}</p>
                    <Link to="/tools/cgpa" className="text-[9px] font-black uppercase tracking-wider mt-1.5 block" style={{ color: tc }}>Update →</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GLOBAL MODE */}
        {mode === 'global' && <MyInstitution />}

        {/* CAMPUS MODE */}
        {mode === 'campus' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* LEFT CONTENT */}
            <div className="xl:col-span-8 space-y-5">

              {/* TAB NAV */}
              <div className="flex items-center gap-2 p-2 rounded-2xl border border-white/[0.08] overflow-x-auto no-scrollbar"
                style={{ background: 'rgba(0,0,0,0.4)', width: 'fit-content', maxWidth: '100%', backdropFilter: 'blur(20px)' }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setCampusTab(tab.id)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap"
                    style={campusTab === tab.id
                      ? { background: `linear-gradient(135deg,${tc},${tc}cc)`, color: '#fff', boxShadow: `0 4px 24px ${tc}60` }
                      : { color: '#475569' }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {campusLoading && (
                <div className="flex flex-col items-center justify-center py-44 rounded-3xl border border-dashed border-slate-700/50" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="w-14 h-14 rounded-full border-[3px] border-transparent animate-spin mb-5" style={{ borderTopColor: tc }} />
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Campus Data...</p>
                </div>
              )}

              {!studentInstId && !campusLoading && <EmptyState text="You are not enrolled in any institution." themeColor={tc} />}

              {/* ═══════════════════════════════════ */}
              {/* OVERVIEW TAB                        */}
              {/* ═══════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">

                  {/* VISION + MISSION */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <RichCard accent="#818cf8" gradient="from-indigo-950/80 to-slate-950"
                      icon={<Star size={18} />} title="Our Vision">
                      <p className="text-slate-200 text-[15px] leading-relaxed">
                        {activeInst?.vision || <EmptyFieldHint label="Vision" />}
                      </p>
                    </RichCard>
                    <RichCard accent="#f472b6" gradient="from-pink-950/80 to-slate-950"
                      icon={<TrendingUp size={18} />} title="Our Mission">
                      <p className="text-slate-200 text-[15px] leading-relaxed">
                        {activeInst?.mission || <EmptyFieldHint label="Mission" />}
                      </p>
                    </RichCard>
                  </div>

                  {/* INSTITUTION COMMUNITY */}
                  <div className="relative overflow-hidden rounded-2xl border p-7 space-y-6"
                    style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)', borderColor: '#ec489940' }}>
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ background: '#ec4899' }} />
                    <SectionTitle accent="#ec4899" icon={<Users size={16} />} title="Institution Community" />
                    <div className="flex flex-wrap gap-2.5">
                      {OVERVIEW_CATEGORIES.map(cat => {
                        const count = communityCount(cat);
                        const color = getCategoryColor(cat);
                        return (
                          <div key={cat} className="flex items-center gap-2.5 px-4 py-2 rounded-full border"
                            style={{ background: `${color}16`, borderColor: `${color}45` }}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                            <span className="text-[11px] font-black text-white uppercase tracking-wider">{cat}</span>
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full" style={{ background: `${color}30`, color }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                    {communityPersonalities.length > 0 && (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 pt-1">
                        {communityPersonalities.map((person, i) => {
                          const color = getCategoryColor(person.category);
                          return (
                            <div key={i}
                              className="relative overflow-hidden rounded-[20px] border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                              style={{ background: `linear-gradient(160deg,${color}18,#0d1829 70%,#060e1c)`, borderColor: `${color}42`, boxShadow: `0 6px 32px ${color}1e` }}>
                              {/* Top glow line */}
                              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right,transparent,${color}aa,transparent)` }} />
                              <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-[55px] opacity-22 pointer-events-none" style={{ background: color }} />
                              <div className="relative z-10 flex flex-col items-center text-center p-6">
                                {/* Avatar */}
                                <div className="rounded-[16px] overflow-hidden flex items-center justify-center mb-4 border-2"
                                  style={{ width: '80px', height: '80px', background: `linear-gradient(145deg,${color}22,#0d1829)`, borderColor: `${color}60`, boxShadow: `0 0 28px ${color}38` }}>
                                  {person.image
                                    ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                                    : <span className="font-black" style={{ fontSize: '1.8rem', color }}>{person.name?.charAt(0) || '?'}</span>}
                                </div>
                                {/* Category */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
                                  style={{ background: `${color}22`, border: `1px solid ${color}50` }}>
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{person.category}</span>
                                </div>
                                <h4 className="font-black text-white leading-snug mb-1" style={{ fontSize: '14px' }}>{person.name}</h4>
                                {person.title && (
                                  <p className="font-bold uppercase tracking-wider mb-2.5" style={{ fontSize: '10px', color: `${color}ee` }}>{person.title}</p>
                                )}
                                {person.quote && (
                                  <p className="text-slate-300 italic leading-snug line-clamp-2" style={{ fontSize: '11.5px' }}>"{person.quote}"</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* HISTORY */}
                  {activeInst?.history && (
                    <RichCard accent="#fbbf24" gradient="from-amber-950/80 to-slate-950"
                      icon={<History size={18} />} title="History of the Institution">
                      <p className="text-slate-200 text-[15px] leading-relaxed">{activeInst.history}</p>
                    </RichCard>
                  )}

                  {/* ACHIEVEMENTS */}
                  {activeInst?.achievements?.length > 0 && (
                    <div>
                      <SectionTitle accent="#fbbf24" icon={<Trophy size={16} />} title="Achievements & Awards" />
                      <div className="grid sm:grid-cols-2 gap-4 mt-5">
                        {activeInst.achievements.map((ach, i) => (
                          <div key={i}
                            className="group relative overflow-hidden rounded-2xl border border-amber-500/20 hover:border-amber-400/45 transition-all p-6"
                            style={{ background: 'linear-gradient(135deg,#1a1000,#0d1829)', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
                            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-[65px] bg-amber-500/14 group-hover:bg-amber-400/28 transition-all" />
                            <div className="flex items-center gap-3 mb-3 relative z-10">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20 border border-amber-500/30">
                                <Trophy className="text-amber-400" size={18} />
                              </div>
                              <span className="text-xs font-black text-amber-400 uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/14 border border-amber-500/25">{ach.year}</span>
                            </div>
                            <h4 className="font-black text-white text-base mb-1.5 relative z-10">{ach.title}</h4>
                            {ach.description && <p className="text-slate-300 text-sm leading-relaxed relative z-10">{ach.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ALUMNI LEGACY */}
                  {activeInst?.alumniHistory && (
                    <RichCard accent="#34d399" gradient="from-emerald-950/80 to-slate-950"
                      icon={<GraduationCap size={18} />} title="Alumni Legacy">
                      <p className="text-slate-200 text-[15px] leading-relaxed">{activeInst.alumniHistory}</p>
                    </RichCard>
                  )}

                  {/* ADMISSION INFO */}
                  {activeInst?.admissionInfo && (
                    <RichCard accent="#38bdf8" gradient="from-sky-950/80 to-slate-950"
                      icon={<Info size={18} />} title="Admission Information">
                      <p className="text-slate-200 text-[15px] leading-relaxed">{activeInst.admissionInfo}</p>
                    </RichCard>
                  )}

                  {/* FACILITIES */}
                  <div>
                    <SectionTitle accent="#c084fc" icon={<TreePine size={16} />} title="Campus Life & Facilities" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
                      {[
                        { icon: <Library size={24} />,    label: 'Central Library', color: '#fbbf24', desc: activeInst?.facilities?.library  || 'Digital & physical resources' },
                        { icon: <Microscope size={24} />, label: 'Research Labs',   color: '#38bdf8', desc: activeInst?.facilities?.labs      || 'Modern lab infrastructure' },
                        { icon: <Wifi size={24} />,       label: 'Digital Campus',  color: '#818cf8', desc: activeInst?.facilities?.digital   || 'Wi-Fi enabled campus' },
                        { icon: <Heart size={24} />,      label: 'Health Centre',   color: '#f87171', desc: activeInst?.facilities?.health    || 'Medical facilities on-site' },
                        { icon: <Music size={24} />,      label: 'Arts & Culture',  color: '#f472b6', desc: activeInst?.facilities?.arts      || 'Creative spaces & events' },
                        { icon: <Shield size={24} />,     label: 'Campus Security', color: '#34d399', desc: activeInst?.facilities?.security  || '24/7 campus safety' },
                      ].map((f, i) => (
                        <div key={i}
                          className="group relative overflow-hidden rounded-2xl p-5 border border-white/[0.07] hover:border-white/[0.20] transition-all text-center cursor-default"
                          style={{ background: `linear-gradient(160deg,${f.color}10,#0d1829)` }}>
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at 50% 100%,${f.color}22,transparent 70%)` }} />
                          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,transparent,${f.color}60,transparent)` }} />
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 relative z-10 transition-transform group-hover:scale-110"
                            style={{ background: f.color + '22', color: f.color, boxShadow: `0 6px 20px ${f.color}30`, border: `1px solid ${f.color}35` }}>
                            {f.icon}
                          </div>
                          <p className="text-[13px] font-black text-white relative z-10 mb-1">{f.label}</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-tight relative z-10">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STUDENT LIFE */}
                  <RichCard accent="#c084fc" gradient="from-purple-950/80 to-slate-950"
                    icon={<Users size={18} />} title="Student Life & Organizations">
                    <p className="text-slate-200 text-[15px] leading-relaxed">
                      {activeInst?.studentLife ||
                        <span className="text-slate-500 italic text-sm">Student organizations and clubs information will appear here when added by the institution admin.</span>}
                    </p>
                  </RichCard>

                  {/* RESEARCH */}
                  <RichCard accent="#22d3ee" gradient="from-cyan-950/80 to-slate-950"
                    icon={<FlaskConical size={18} />} title="Research & Publications">
                    <p className="text-slate-200 text-[15px] leading-relaxed">
                      {activeInst?.research ||
                        <span className="text-slate-500 italic text-sm">Research highlights and publications will appear here.</span>}
                    </p>
                  </RichCard>

                  {/* CONTACT */}
                  <div>
                    <SectionTitle accent={tc} icon={<Mail size={16} />} title="Contact & Information" />
                    <div className="grid sm:grid-cols-2 gap-4 mt-5">
                      <InfoTile icon={<Map size={16} />}      label="Location"       value={activeInst?.contact?.address} tc={tc} />
                      <InfoTile icon={<Mail size={16} />}     label="Official Email"  value={activeInst?.contact?.email}   tc={tc} />
                      <InfoTile icon={<Phone size={16} />}    label="Phone"           value={activeInst?.contact?.phone}   tc={tc} />
                      <InfoTile icon={<Calendar size={16} />} label="Academic Year"   value="2024–2025"                    tc={tc} />
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════ */}
              {/* DEPARTMENTS TAB                     */}
              {/* ═══════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'departments' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {activeInst?.departments?.length > 0 ? (
                    activeInst.departments.map((dept, i) => {
                      const colors = ['#818cf8','#f472b6','#38bdf8','#34d399','#fbbf24','#c084fc','#f87171','#22d3ee'];
                      const col = colors[i % colors.length];
                      return (
                        <div key={i}
                          className="relative overflow-hidden rounded-2xl border transition-all hover:border-opacity-70 p-6"
                          style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)', borderColor: col + '35', boxShadow: `0 4px 30px rgba(0,0,0,0.4)` }}>
                          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,${col}70,transparent)` }} />
                          <div className="absolute top-0 right-0 w-44 h-44 rounded-full blur-[90px] pointer-events-none opacity-12" style={{ background: col }} />
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: col + '22', color: col, boxShadow: `0 4px 18px ${col}28`, border: `1px solid ${col}40` }}>
                              <BookMarked size={20} />
                            </div>
                            <div className="w-0.5 h-7 rounded-full" style={{ background: `linear-gradient(to bottom,${col},${col}33)` }} />
                            <h3 className="font-black text-white text-lg">{dept.name}</h3>
                            {dept.established && (
                              <span className="ml-auto text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                                style={{ background: col + '20', color: col, border: `1px solid ${col}35` }}>Est. {dept.established}</span>
                            )}
                          </div>
                          {dept.description && <p className="text-slate-300 text-sm leading-relaxed mb-4">{dept.description}</p>}
                          {dept.subFields?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {dept.subFields.map((sf, j) => (
                                <span key={j} className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                                  style={{ background: col + '18', color: col, border: `1px solid ${col}28` }}>
                                  {sf}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-14 text-center"
                      style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: tc + '18', border: `1px solid ${tc}28`, padding: '1rem' }}>
                        <Layers size={28} style={{ color: tc }} className="opacity-60" />
                      </div>
                      <h3 className="text-white font-black text-lg mb-2">No Departments Added Yet</h3>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto">Departments and their sub-fields will appear here once the institution admin adds them.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════ */}
              {/* NOTICES TAB                         */}
              {/* ═══════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'feed' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {dashboardData.notices.map(n => (
                    <div key={n._id}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] transition-all hover:border-white/[0.18] p-6"
                      style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)' }}>
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full" style={{ background: `linear-gradient(to bottom,${tc},${tc}22)` }} />
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,${tc}55,transparent)` }} />
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                          style={{ background: tc + '18', borderColor: tc + '45', color: tc }}>
                          {n.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={10} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(n.createdAt).toDateString()}</span>
                        </div>
                      </div>
                      <h4 className="text-[17px] font-black text-white leading-snug mb-2">{n.title}</h4>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{n.content}</p>
                    </div>
                  ))}
                  {dashboardData.notices.length === 0 && <EmptyState text="The bulletin board is empty." themeColor={tc} />}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════ */}
              {/* RESULTS TAB — BANGLADESH GRADING SYSTEM                 */}
              {/* ═══════════════════════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'results' && (
                <div className="space-y-5 animate-in fade-in duration-300">

                  {/* Grade Scale Legend */}
                  <div className="relative overflow-hidden rounded-[20px] border border-white/[0.10] p-6"
                    style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right,transparent,#fbbf2460,transparent)' }} />
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none bg-amber-400" />
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/22 border border-amber-400/35" style={{ boxShadow: '0 4px 18px rgba(251,191,36,0.22)' }}>
                        <Award size={18} className="text-amber-400" />
                      </div>
                      <div className="w-0.5 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom,#fbbf24,#fbbf2433)' }} />
                      <div>
                        <h3 className="text-[13px] font-black text-white uppercase tracking-widest leading-none">Bangladesh Grading Scale</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">HSC / Degree / Honours</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                      {[
                        { grade: 'A+', range: '80–100', gpa: '5.00', color: '#22c55e' },
                        { grade: 'A',  range: '70–79',  gpa: '4.00', color: '#4ade80' },
                        { grade: 'A-', range: '60–69',  gpa: '3.50', color: '#86efac' },
                        { grade: 'B',  range: '50–59',  gpa: '3.00', color: '#60a5fa' },
                        { grade: 'C',  range: '40–49',  gpa: '2.00', color: '#fbbf24' },
                        { grade: 'D',  range: '33–39',  gpa: '1.00', color: '#fb923c' },
                        { grade: 'F',  range: '0–32',   gpa: '0.00', color: '#f87171' },
                      ].map((g) => (
                        <div key={g.grade} className="rounded-[14px] py-3 px-2 text-center border transition-all hover:scale-105"
                          style={{ background: `linear-gradient(160deg,${g.color}18,${g.color}08)`, borderColor: `${g.color}38`, boxShadow: `0 4px 16px ${g.color}10` }}>
                          {/* Glow top line */}
                          <div className="w-full h-px rounded-full mb-2" style={{ background: `linear-gradient(to right,transparent,${g.color}80,transparent)` }} />
                          <p className="font-black leading-none mb-1.5" style={{ fontSize: '22px', color: g.color, textShadow: `0 0 20px ${g.color}80` }}>{g.grade}</p>
                          <p className="font-bold text-slate-400" style={{ fontSize: '9px' }}>{g.range}%</p>
                          <p className="font-black mt-0.5" style={{ fontSize: '9px', color: g.color + 'cc' }}>GPA {g.gpa}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result Cards */}
                  {dashboardData.results.map(r => {
                    const pct = parseFloat(r.percentage || r.marks || 0);
                    const { grade, gpa, label, color } = getBDGrade(pct);
                    return (
                      <div key={r._id}
                        className="relative overflow-hidden rounded-2xl border transition-all hover:border-opacity-60"
                        style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)', borderColor: color + '35', boxShadow: `0 4px 36px ${color}12` }}>

                        {/* Top glow line */}
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,transparent,${color}70,transparent)` }} />
                        <div className="absolute top-0 right-0 w-52 h-52 rounded-full blur-[90px] pointer-events-none" style={{ background: color + '16' }} />

                        <div className="p-6 flex items-start gap-6">
                          {/* SVG Ring Score */}
                          <div className="flex-shrink-0 relative" style={{ width: '104px', height: '104px' }}>
                            <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
                              <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                              <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="8"
                                strokeDasharray={`${2 * Math.PI * 36}`}
                                strokeDashoffset={`${2 * Math.PI * 36 * (1 - Math.min(pct, 100) / 100)}`}
                                strokeLinecap="round"
                                style={{ filter: `drop-shadow(0 0 8px ${color}90)`, transition: 'stroke-dashoffset 0.9s ease' }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-black leading-none" style={{ color }}>{grade}</span>
                              <span className="text-[10px] font-black text-slate-400 mt-0.5">{pct.toFixed(0)}%</span>
                            </div>
                          </div>

                          {/* Info Block */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-white text-[17px] leading-snug mb-2">{r.examName}</h4>
                            <div className="flex items-center gap-2.5 mb-4 flex-wrap">
                              <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/[0.07] text-slate-300 border border-white/[0.09]">
                                {r.status || 'Published'}
                              </span>
                              <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                                style={{ background: color + '18', borderColor: color + '40', color }}>
                                {label}
                              </span>
                              <span className="px-3 py-1.5 rounded-lg text-[10px] font-black border"
                                style={{ background: color + '14', borderColor: color + '35', color: color + 'ee' }}>
                                GPA {gpa}
                              </span>
                            </div>

                            {/* Score display */}
                            <div className="flex items-end justify-between mb-2">
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Score</p>
                                <p className="text-4xl font-black tabular-nums leading-none" style={{ color }}>
                                  {pct.toFixed(1)}<span className="text-xl ml-0.5">%</span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Grade Point</p>
                                <p className="text-4xl font-black tabular-nums leading-none" style={{ color }}>{gpa}</p>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden mt-3">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(pct, 100)}%`, background: `linear-gradient(to right,${color}80,${color})`, boxShadow: `0 0 10px ${color}60` }} />
                            </div>
                            <div className="flex justify-between mt-1.5">
                              <span className="text-[9px] text-slate-600 font-bold">0%</span>
                              <span className="text-[9px] font-bold" style={{ color: color + 'aa' }}>{pct.toFixed(1)}%</span>
                              <span className="text-[9px] text-slate-600 font-bold">100%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {dashboardData.results.length === 0 && <EmptyState text="No results published yet." themeColor={tc} />}
                </div>
              )}

              {/* ═══════════════════════════════════ */}
              {/* FEES TAB                            */}
              {/* ═══════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'fees' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {dashboardData.fees.map(f => (
                    <div key={f._id}
                      className="group flex items-center justify-between p-5 rounded-2xl border border-white/[0.07] hover:border-emerald-500/35 transition-all"
                      style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0 bg-emerald-500/14 group-hover:bg-emerald-500/24 transition-all border border-emerald-500/22"
                          style={{ width: '52px', height: '52px' }}>
                          <DollarSign size={20} className="text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-[15px]">{f.category || f.note || 'Tuition Fee'}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                            <Clock size={9} /> {new Date(f.date || f.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-emerald-400">৳{f.amount?.toLocaleString()}</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/14 flex items-center justify-center border border-emerald-500/25">
                          <CheckCircle size={16} className="text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.fees.length === 0 && <EmptyState text="No fees recorded." themeColor={tc} />}
                </div>
              )}

              {/* ═══════════════════════════════════════════ */}
              {/* FACULTY TAB — PREMIUM REDESIGN              */}
              {/* ═══════════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'faculty' && (
                <div className="grid sm:grid-cols-2 gap-5 animate-in fade-in duration-300">
                  {activeInst?.teachers?.map((t, i) => {
                    const colors = ['#818cf8','#f472b6','#38bdf8','#34d399','#fbbf24','#c084fc','#22d3ee','#f87171'];
                    const col = colors[i % colors.length];
                    return (
                      <div key={i}
                        className="group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1.5 hover:shadow-2xl"
                        style={{ background: 'linear-gradient(160deg,#0d1829,#07091a)', borderColor: col + '30', boxShadow: `0 4px 28px ${col}0e` }}>
                        {/* Top glow line */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(to right,${col}80,${col}ee,${col}80)` }} />
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[70px] opacity-10 pointer-events-none group-hover:opacity-22 transition-opacity" style={{ background: col }} />

                        <div className="p-5 relative z-10">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden border-2"
                                style={{ background: `linear-gradient(135deg,${col}22,#0d1829)`, borderColor: col + '55', boxShadow: `0 0 24px ${col}28` }}>
                                {t.image
                                  ? <img src={t.image} className="w-full h-full object-cover" alt="teacher" />
                                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ color: col }}>
                                      {t.name?.charAt(0) || '?'}
                                    </div>}
                              </div>
                            </div>
                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-white text-[15px] leading-snug mb-0.5">{t.name}</h4>
                              <p className="text-[11px] font-black uppercase tracking-wider mb-2.5" style={{ color: col }}>{t.designation}</p>
                              {t.department && (
                                <span className="inline-block px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider"
                                  style={{ background: col + '18', color: col + 'ee', border: `1px solid ${col}28` }}>
                                  {t.department}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!activeInst?.teachers || activeInst.teachers.length === 0) && (
                    <EmptyState text="No faculty members added yet." themeColor={tc} />
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="xl:col-span-4 space-y-5">

              {/* ════════════════════════════════════════ */}
              {/* AUTHORITY CARDS — PREMIUM QUOTE DESIGN  */}
              {/* ════════════════════════════════════════ */}
              {authorityPersonalities.length > 0 && (
                <div className="relative overflow-hidden rounded-[28px] border"
                  style={{ background: 'linear-gradient(160deg,#0e0620,#0b1127)', borderColor: '#a855f738', height: '780px', boxShadow: '0 8px 60px rgba(0,0,0,0.8), 0 0 60px rgba(168,85,247,0.12)' }}>
                  <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom,rgba(168,85,247,0.14),transparent)' }} />
                  <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.07]">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-1.5 h-7 rounded-full" style={{ background: 'linear-gradient(to bottom,#a855f7,#6366f1)' }} />
                      <h3 className="text-[13px] font-black text-white uppercase tracking-widest">Institution Authorities</h3>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4.5">Leadership & Key Officials</p>
                  </div>
                  <div className="relative overflow-hidden" style={{ height: 'calc(100% - 88px)' }}>
                    <div style={{ animation: `scrollDown ${authorityPersonalities.length * 7 + 20}s linear infinite` }}>
                      {[...authorityPersonalities, ...authorityPersonalities].map((p, i) => (
                        <AuthorityCard key={i} person={p} />
                      ))}
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-10 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to bottom,#0e0620,transparent)' }} />
                    <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to top,#0b1127,transparent)' }} />
                  </div>
                </div>
              )}

              {/* ACADEMIC TOOLKIT */}
              <div className="rounded-[24px] border border-white/[0.08] overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#0d1829,#07091a)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Academic Toolkit</h3>
                </div>
                <div className="p-4 space-y-2">
                  <ToolCard title="GPA Calculator" icon={<BarChart3 size={18} className="text-indigo-400" />} link="/tools/cgpa"    accent="#818cf8" />
                  <ToolCard title="Lab Report"     icon={<FileText    size={18} className="text-pink-400"   />} link="/tools/lab-gen" accent="#f472b6" />
                  <ToolCard title="Roadmaps"       icon={<Sparkles    size={18} className="text-amber-400"  />} link="/roadmaps"      accent="#fbbf24" />
                  <ToolCard title="Campus Feed"    icon={<Globe       size={18} className="text-cyan-400"   />} link="/feed"          accent="#22d3ee" />
                </div>
              </div>

              {/* ACADEMIC STATS */}
              <div className="rounded-[24px] border border-white/[0.08] overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#0d1829,#07091a)', boxShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
                <div className="px-6 py-5 border-b border-white/[0.07] flex items-center gap-2">
                  <BarChart3 size={14} style={{ color: tc }} />
                  <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">My Academic Stats</h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Cumulative CGPA',   value: stats.cgpa.toFixed(2), color: tc,        sub: '/ 4.00',  icon: <Star size={14} /> },
                    { label: 'Credits Earned',     value: stats.credits,          color: '#34d399', sub: 'credits', icon: <Award size={14} /> },
                    {
                      label: 'Academic Standing',
                      value: stats.cgpa >= 3.75 ? "Dean's List"
                           : stats.cgpa >= 3.5  ? 'Honors'
                           : stats.cgpa >= 3.0  ? 'Good Standing'
                           : 'Satisfactory',
                      color: '#fbbf24', sub: '', icon: <Trophy size={14} />,
                    },
                  ].map((s, i) => (
                    <div key={i}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/[0.07]"
                      style={{ background: `${s.color}08` }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-wider">{s.label}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[15px]" style={{ color: s.color }}>{s.value}</span>
                        {s.sub && <span className="text-slate-500 text-[10px] ml-1.5">{s.sub}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <DashboardStyles />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/* AUTHORITY CARD — GORGEOUS PREMIUM REDESIGN                  */
/* ═══════════════════════════════════════════════════════════ */
const AuthorityCard = ({ person }) => {
  const col = getCategoryColor(person.category);
  return (
    <div className="mx-4 mb-6 relative overflow-hidden rounded-[24px] border transition-all hover:-translate-y-1"
      style={{
        background: `linear-gradient(165deg,${col}1e 0%,#0d1829 45%,#060e1c 100%)`,
        borderColor: col + '45',
        boxShadow: `0 12px 50px rgba(0,0,0,0.65), 0 0 0 1px ${col}18, 0 0 60px ${col}0a`,
      }}>

      {/* TOP GLOW LINE */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[24px]"
        style={{ background: `linear-gradient(to right,transparent 5%,${col}cc 40%,${col} 50%,${col}cc 60%,transparent 95%)` }} />

      {/* AMBIENT CORNER GLOW */}
      <div className="absolute -top-4 -right-4 w-44 h-44 rounded-full blur-[80px] opacity-22 pointer-events-none" style={{ background: col }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[60px] opacity-08 pointer-events-none" style={{ background: col }} />

      {/* ── IDENTITY ROW ── */}
      <div className="flex items-start gap-5 px-6 pt-6 pb-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="rounded-[18px] overflow-hidden border-[2.5px]"
            style={{
              width: '90px', height: '90px',
              background: `linear-gradient(145deg,${col}30,#0d1829)`,
              borderColor: col + '70',
              boxShadow: `0 0 36px ${col}40, 0 6px 24px rgba(0,0,0,0.7)`,
            }}>
            {person.image
              ? <img src={person.image} className="w-full h-full object-cover" alt={person.name} />
              : <div className="w-full h-full flex items-center justify-center font-black"
                  style={{ fontSize: '2.2rem', color: col, background: `linear-gradient(145deg,${col}18,#0d1829)` }}>
                  {person.name?.charAt(0) || '?'}
                </div>}
          </div>
          {/* Online / active dot */}
          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-[2.5px] border-[#060e1c]"
            style={{ background: col, boxShadow: `0 0 12px ${col}, 0 0 24px ${col}80` }} />
        </div>

        {/* Name / title / badge */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Category badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-2.5"
            style={{ background: `${col}20`, border: `1px solid ${col}50`, boxShadow: `0 0 16px ${col}20` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: col, boxShadow: `0 0 6px ${col}` }} />
            <span className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: col }}>
              {person.category}
            </span>
          </div>
          <h4 className="font-black text-white leading-tight mb-1" style={{ fontSize: '17px' }}>{person.name}</h4>
          {person.title && (
            <p className="font-bold uppercase tracking-wider" style={{ fontSize: '11px', color: col + 'dd' }}>
              {person.title}
            </p>
          )}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="mx-6 h-px" style={{ background: `linear-gradient(to right,${col}40,${col}10,transparent)` }} />

      {/* ── QUOTE BLOCK ── */}
      {person.quote && (
        <div className="mx-6 my-5 relative rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg,rgba(0,0,0,0.45),rgba(0,0,0,0.25))`,
            border: `1px solid ${col}28`,
            boxShadow: `inset 0 1px 0 ${col}20`,
          }}>
          {/* Inner top glow */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,${col}55,transparent)` }} />
          {/* Giant decorative open-quote */}
          <div className="absolute -top-1 left-3 pointer-events-none select-none"
            style={{ fontSize: '72px', color: col, opacity: 0.50, fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: 1 }}>
            &#8220;
          </div>
          {/* Giant decorative close-quote */}
          <div className="absolute -bottom-7 right-3 pointer-events-none select-none"
            style={{ fontSize: '72px', color: col, opacity: 0.35, fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: 1 }}>
            &#8221;
          </div>
          <p className="text-slate-100 italic leading-relaxed px-6 pt-8 pb-6 relative z-10"
            style={{ fontSize: '13.5px' }}>
            {person.quote}
          </p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/* SUB-COMPONENTS                                              */
/* ═══════════════════════════════════════════════════════════ */
const RichCard = ({ accent, gradient, icon, title, children }) => (
  <div className={`relative overflow-hidden rounded-2xl border p-7 bg-gradient-to-br ${gradient} transition-all hover:border-opacity-55`}
    style={{ borderColor: accent + '35', boxShadow: `0 4px 40px rgba(0,0,0,0.5)` }}>
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,${accent}70,transparent)` }} />
    <div className="absolute top-0 right-0 w-52 h-52 rounded-full blur-[90px] pointer-events-none opacity-15" style={{ background: accent, transform: 'translate(30%,-30%)' }} />
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '28', color: accent, border: `1px solid ${accent}42`, boxShadow: `0 4px 18px ${accent}25` }}>
          {icon}
        </div>
        <div className="w-0.5 h-6 rounded-full" style={{ background: `linear-gradient(to bottom,${accent},${accent}33)` }} />
        <h3 className="text-[13px] font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

const SectionTitle = ({ accent, icon, title }) => (
  <div className="flex items-center gap-3 px-0.5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: accent + '25', color: accent, border: `1px solid ${accent}38`, boxShadow: `0 4px 18px ${accent}20` }}>
      {icon}
    </div>
    <div className="w-0.5 h-6 rounded-full" style={{ background: `linear-gradient(to bottom,${accent},${accent}33)` }} />
    <h3 className="text-[13px] font-black text-white uppercase tracking-widest">{title}</h3>
  </div>
);

const InfoTile = ({ icon, label, value, tc }) => (
  <div className="flex items-center gap-4 p-5 rounded-xl border border-white/[0.07] hover:border-white/[0.14] transition-all"
    style={{ background: 'rgba(0,0,0,0.25)' }}>
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: (tc || '#6366f1') + '25', color: tc || '#6366f1', border: `1px solid ${tc || '#6366f1'}32`, boxShadow: `0 4px 14px ${tc || '#6366f1'}20` }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-slate-100 text-[13px] font-semibold truncate">{value || 'Not provided'}</p>
    </div>
  </div>
);

const ToolCard = ({ title, icon, link, accent }) => (
  <Link to={link}
    className="group flex items-center justify-between p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.16] transition-all"
    style={{ background: 'rgba(0,0,0,0.2)' }}>
    <div className="flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
        style={{ background: accent + '22', border: `1px solid ${accent}32`, boxShadow: `0 4px 14px ${accent}18` }}>
        {icon}
      </div>
      <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors">
        {title}
      </span>
    </div>
    <ArrowUpRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
  </Link>
);

const EmptyFieldHint = ({ label }) => (
  <span className="text-slate-600 italic text-sm">{label} statement will appear here once set by admin.</span>
);

const EmptyState = ({ text, themeColor }) => (
  <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/[0.07]"
    style={{ background: 'rgba(0,0,0,0.15)' }}>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: (themeColor || '#6366f1') + '18', border: `1px solid ${(themeColor || '#6366f1')}28`, boxShadow: `0 0 28px ${(themeColor || '#6366f1')}18` }}>
      <Sparkles size={24} style={{ color: themeColor || '#6366f1' }} className="opacity-70" />
    </div>
    <p className="text-slate-500 font-black uppercase tracking-widest text-[11px] text-center max-w-xs leading-relaxed">{text}</p>
  </div>
);

const DashboardStyles = () => (
  <style>{`
    @keyframes scrollDown {
      0%   { transform: translateY(0); }
      100% { transform: translateY(-50%); }
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

export default Dashboard;
