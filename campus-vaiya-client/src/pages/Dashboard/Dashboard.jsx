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

  /* Derived personality lists */
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
      typeof user.enrolledCampus === 'object' &&
      user.enrolledCampus !== null &&
      user.enrolledCampus.name;
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
    { id: 'overview',    label: 'Overview',   icon: <BookOpen size={13} /> },
    { id: 'departments', label: 'Departments', icon: <Layers size={13} /> },
    { id: 'feed',        label: 'Notices',     icon: <Bell size={13} /> },
    { id: 'results',     label: 'Results',     icon: <Award size={13} /> },
    { id: 'fees',        label: 'Fees',        icon: <DollarSign size={13} /> },
    { id: 'faculty',     label: 'Faculty',     icon: <UserIcon size={13} /> },
  ];

  /* Count community personalities per category */
  const communityCount = (cat) => personalities.filter(p => p.category === cat).length;

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-20 px-3 md:px-6 font-sans"
      style={{ background: 'linear-gradient(150deg,#07091a 0%,#0b1128 45%,#060e1c 100%)' }}>

      {/* ── AMBIENT ORBS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-8%] right-[-4%] w-[700px] h-[700px] rounded-full blur-[200px] opacity-[0.18]"
          style={{ background: tc }} />
        <div className="absolute top-[30%] left-[-6%] w-[500px] h-[500px] rounded-full blur-[170px] opacity-[0.13]"
          style={{ background: '#ec4899' }} />
        <div className="absolute bottom-[5%] right-[20%] w-[400px] h-[400px] rounded-full blur-[200px] opacity-[0.11]"
          style={{ background: '#06b6d4' }} />
        <div className="absolute top-[55%] left-[40%] w-[300px] h-[300px] rounded-full blur-[160px] opacity-[0.10]"
          style={{ background: '#a855f7' }} />
        <div className="absolute top-[15%] left-[25%] w-[250px] h-[250px] rounded-full blur-[150px] opacity-[0.08]"
          style={{ background: '#f59e0b' }} />
      </div>

      <div className="max-w-[1440px] mx-auto space-y-5 relative z-10">

        {/* ════════════════════════════════════════════════════════ */}
        {/* HEADER CARD                                              */}
        {/* ════════════════════════════════════════════════════════ */}
        {showMainHeader && (
          <div className="relative overflow-hidden rounded-[32px] shadow-2xl border"
            style={{
              borderColor: tc + '35',
              background: 'linear-gradient(160deg,#0f1a30,#07091a)',
              boxShadow: `0 0 80px ${tc}15, 0 24px 80px rgba(0,0,0,0.7)`,
            }}>

            <div className="absolute inset-0 rounded-[32px] pointer-events-none"
              style={{ background: `linear-gradient(135deg,${tc}25 0%,transparent 55%,${tc}12 100%)` }} />

            {/* BANNER */}
            <div className="h-52 md:h-72 w-full relative overflow-hidden rounded-t-[32px]">
              {mode === 'global' ? (
                <div className="absolute inset-0">
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#0f1a30,#07091a)' }} />
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%,${tc}50,transparent)` }} />
                  <div className="absolute top-[-20%] right-[5%] w-96 h-96 rounded-full blur-[130px]" style={{ background: tc + '40' }} />
                  <div className="absolute bottom-[-10%] left-[5%] w-72 h-72 rounded-full blur-[100px] opacity-35 bg-pink-500" />
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>
              ) : campusLoading ? (
                <div className="w-full h-full bg-slate-900 animate-pulse" />
              ) : activeInst?.banner ? (
                <img src={activeInst.banner} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${tc}30,#07091a 60%,#060e1c)` }} />
                  <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: tc + '32' }} />
                  <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-purple-500" />
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07091a] via-transparent to-transparent" />
            </div>

            {/* PROFILE ROW */}
            <div className="px-6 md:px-10 pb-8 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="flex items-end gap-5">
                {/* Logo */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg,#131f38,#07091a)',
                      border: `2.5px solid ${tc}65`,
                      boxShadow: `0 0 35px ${tc}30, 0 8px 40px rgba(0,0,0,0.8)`,
                    }}>
                    {mode === 'global' ? (
                      <Globe className="w-11 h-11" style={{ color: tc }} />
                    ) : campusLoading ? (
                      <div className="w-full h-full bg-slate-800 animate-pulse" />
                    ) : activeInst?.logo ? (
                      <img src={activeInst.logo} className="w-full h-full object-contain p-2" alt="Logo" />
                    ) : (
                      <Building2 className="w-11 h-11 text-slate-500" />
                    )}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-[#07091a] shadow-lg"
                    style={{ background: tc, boxShadow: `0 0 12px ${tc}` }} />
                </div>

                {/* Name */}
                <div className="mb-1.5">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                      style={{ background: tc + '22', borderColor: tc + '55', color: tc }}>
                      {mode} mode
                    </span>
                    {mode === 'global' && isAdmin && (
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-500/45 text-amber-400">
                        Admin
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-none drop-shadow-lg">
                    {mode === 'global'
                      ? 'Global Universe'
                      : campusLoading
                        ? <span className="inline-block w-56 h-8 bg-slate-800 animate-pulse rounded-xl" />
                        : (activeInst?.name || 'Institution Not Found')}
                  </h1>
                  <p className="text-slate-400 text-xs font-semibold mt-1.5">
                    {user?.fullName} · {mode === 'global' && isAdmin ? 'Institution Admin' : 'Student'}
                    {activeInst?.foundedYear && ` · Est. ${activeInst.foundedYear}`}
                  </p>
                </div>
              </div>

              {/* ── CGPA COMPACT BADGE ── */}
              {mode === 'campus' && (
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="relative overflow-hidden rounded-2xl px-6 py-4 border text-center"
                    style={{
                      background: `linear-gradient(135deg,${tc}20,#0f1a30)`,
                      borderColor: tc + '50',
                      boxShadow: `0 0 35px ${tc}25, 0 8px 32px rgba(0,0,0,0.5)`,
                    }}>
                    <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl pointer-events-none" style={{ background: tc }} />
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.18em] mb-0.5 relative z-10">CGPA</p>
                    <p className="text-4xl font-black tabular-nums leading-none relative z-10" style={{ color: tc }}>{stats.cgpa.toFixed(2)}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-1 relative z-10" style={{ color: tc + 'bb' }}>
                      {stats.cgpa >= 3.5 ? 'Honors' : stats.cgpa >= 3.0 ? 'Good' : 'Pass'}
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl px-5 py-4 border text-center"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Credits</p>
                    <p className="text-3xl font-black text-white tabular-nums leading-none">{stats.credits}</p>
                    <Link to="/tools/cgpa" className="text-[8px] font-black uppercase tracking-wider mt-1 block" style={{ color: tc }}>
                      Update →
                    </Link>
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

            {/* ── LEFT CONTENT ── */}
            <div className="xl:col-span-8 space-y-4">

              {/* TAB NAV */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-white/[0.08] overflow-x-auto no-scrollbar"
                style={{ background: 'rgba(0,0,0,0.35)', width: 'fit-content', maxWidth: '100%', backdropFilter: 'blur(16px)' }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setCampusTab(tab.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap"
                    style={campusTab === tab.id
                      ? { background: `linear-gradient(135deg,${tc},${tc}cc)`, color: '#fff', boxShadow: `0 4px 20px ${tc}55` }
                      : { color: '#475569' }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* LOADING */}
              {campusLoading && (
                <div className="flex flex-col items-center justify-center py-40 rounded-3xl border border-dashed border-slate-700/50"
                  style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="w-12 h-12 rounded-full border-[3px] border-transparent animate-spin mb-5"
                    style={{ borderTopColor: tc }} />
                  <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Loading Campus Data...</p>
                </div>
              )}

              {!studentInstId && !campusLoading && (
                <EmptyState text="You are not enrolled in any institution." themeColor={tc} />
              )}

              {/* ══════════════════════════════════════ */}
              {/* OVERVIEW TAB                           */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'overview' && (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">

                  {/* ── VISION + MISSION — TOP ── */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <RichCard accent="#6366f1" gradient="from-indigo-950/70 to-slate-950/90"
                      icon={<Star size={17} />} title="Our Vision">
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {activeInst?.vision || <EmptyFieldHint label="Vision" />}
                      </p>
                    </RichCard>
                    <RichCard accent="#ec4899" gradient="from-pink-950/70 to-slate-950/90"
                      icon={<TrendingUp size={17} />} title="Our Mission">
                      <p className="text-slate-200 text-sm leading-relaxed">
                        {activeInst?.mission || <EmptyFieldHint label="Mission" />}
                      </p>
                    </RichCard>
                  </div>

                  {/* ── INSTITUTION COMMUNITY ── */}
                  <div className="relative overflow-hidden rounded-2xl border p-6 space-y-5"
                    style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)', borderColor: '#ec489935', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
                    <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-[100px] opacity-10 pointer-events-none"
                      style={{ background: '#ec4899' }} />
                    <SectionTitle accent="#ec4899" icon={<Users size={15} />} title="Institution Community" />
                    <div className="flex flex-wrap gap-2">
                      {OVERVIEW_CATEGORIES.map(cat => {
                        const count = communityCount(cat);
                        const color = getCategoryColor(cat);
                        return (
                          <div key={cat} className="flex items-center gap-2 px-4 py-2 rounded-full border"
                            style={{ background: `${color}14`, borderColor: `${color}40` }}>
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{cat}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${color}28`, color }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>

                    {communityPersonalities.length > 0 && (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
                        {communityPersonalities.map((person, i) => {
                          const color = getCategoryColor(person.category);
                          return (
                            <div key={i}
                              className="relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1.5"
                              style={{ background: `linear-gradient(145deg,${color}12,#0d1829)`, borderColor: `${color}35`, boxShadow: `0 4px 24px ${color}18` }}>
                              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] opacity-18 pointer-events-none" style={{ background: color }} />
                              <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mb-3.5 border-2"
                                  style={{ background: `${color}18`, borderColor: `${color}50`, boxShadow: `0 0 20px ${color}30` }}>
                                  {person.image
                                    ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                                    : <span className="text-2xl font-black" style={{ color }}>{person.name?.charAt(0) || '?'}</span>}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2"
                                  style={{ background: `${color}22`, color, border: `1px solid ${color}40` }}>
                                  {person.category}
                                </span>
                                <h4 className="font-black text-white text-sm leading-snug mb-0.5">{person.name}</h4>
                                {person.title && (
                                  <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: `${color}ee` }}>{person.title}</p>
                                )}
                                {person.quote && (
                                  <p className="text-[10px] text-slate-300 italic leading-snug line-clamp-2">"{person.quote}"</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* History */}
                  {activeInst?.history && (
                    <RichCard accent="#f59e0b" gradient="from-amber-950/70 to-slate-950/90"
                      icon={<History size={17} />} title="History of the Institution">
                      <p className="text-slate-200 text-sm leading-relaxed">{activeInst.history}</p>
                    </RichCard>
                  )}

                  {/* Achievements */}
                  {activeInst?.achievements?.length > 0 && (
                    <div>
                      <SectionTitle accent="#f59e0b" icon={<Trophy size={15} />} title="Achievements & Awards" />
                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        {activeInst.achievements.map((ach, i) => (
                          <div key={i}
                            className="group relative overflow-hidden rounded-2xl p-6 border border-amber-500/18 hover:border-amber-500/40 transition-all"
                            style={{ background: 'linear-gradient(135deg,#1a1000,#0d1829)', boxShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
                            <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-[65px] bg-amber-500/12 group-hover:bg-amber-500/25 transition-all" />
                            <Trophy className="text-amber-400 mb-4 relative z-10" size={22} />
                            <h4 className="font-black text-white text-sm mb-1.5 relative z-10">{ach.title}</h4>
                            {ach.description && (
                              <p className="text-slate-300 text-xs leading-relaxed mb-2.5 relative z-10">{ach.description}</p>
                            )}
                            <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest relative z-10">{ach.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alumni Legacy */}
                  {activeInst?.alumniHistory && (
                    <RichCard accent="#10b981" gradient="from-emerald-950/70 to-slate-950/90"
                      icon={<GraduationCap size={17} />} title="Alumni Legacy">
                      <p className="text-slate-200 text-sm leading-relaxed">{activeInst.alumniHistory}</p>
                    </RichCard>
                  )}

                  {/* Admission Info */}
                  {activeInst?.admissionInfo && (
                    <RichCard accent="#0ea5e9" gradient="from-sky-950/70 to-slate-950/90"
                      icon={<Info size={17} />} title="Admission Information">
                      <p className="text-slate-200 text-sm leading-relaxed">{activeInst.admissionInfo}</p>
                    </RichCard>
                  )}

                  {/* Facilities */}
                  <div>
                    <SectionTitle accent="#a855f7" icon={<TreePine size={15} />} title="Campus Life & Facilities" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                      {[
                        { icon: <Library size={22} />,    label: 'Central Library', color: '#f59e0b', desc: activeInst?.facilities?.library  || 'Digital & physical resources' },
                        { icon: <Microscope size={22} />, label: 'Research Labs',   color: '#0ea5e9', desc: activeInst?.facilities?.labs      || 'Modern lab infrastructure' },
                        { icon: <Wifi size={22} />,       label: 'Digital Campus',  color: '#6366f1', desc: activeInst?.facilities?.digital   || 'Wi-Fi enabled campus' },
                        { icon: <Heart size={22} />,      label: 'Health Centre',   color: '#ef4444', desc: activeInst?.facilities?.health    || 'Medical facilities on-site' },
                        { icon: <Music size={22} />,      label: 'Arts & Culture',  color: '#ec4899', desc: activeInst?.facilities?.arts      || 'Creative spaces & events' },
                        { icon: <Shield size={22} />,     label: 'Campus Security', color: '#10b981', desc: activeInst?.facilities?.security  || '24/7 campus safety' },
                      ].map((f, i) => (
                        <div key={i}
                          className="group relative overflow-hidden rounded-2xl p-5 border border-white/[0.07] hover:border-white/[0.18] transition-all text-center cursor-default"
                          style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)' }}>
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at 50% 100%,${f.color}20,transparent 70%)` }} />
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 relative z-10 transition-transform group-hover:scale-110"
                            style={{ background: f.color + '20', color: f.color, boxShadow: `0 4px 18px ${f.color}28`, border: `1px solid ${f.color}30` }}>
                            {f.icon}
                          </div>
                          <p className="text-xs font-black text-white relative z-10 mb-1">{f.label}</p>
                          <p className="text-[9px] text-slate-400 font-semibold leading-tight relative z-10">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Organizations */}
                  <RichCard accent="#a855f7" gradient="from-purple-950/70 to-slate-950/90"
                    icon={<Users size={17} />} title="Student Life & Organizations">
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {activeInst?.studentLife ||
                        <span className="text-slate-500 italic text-xs">Student organizations and clubs information will appear here when added by the institution admin.</span>}
                    </p>
                  </RichCard>

                  {/* Research */}
                  <RichCard accent="#06b6d4" gradient="from-cyan-950/70 to-slate-950/90"
                    icon={<FlaskConical size={17} />} title="Research & Publications">
                    <p className="text-slate-200 text-sm leading-relaxed">
                      {activeInst?.research ||
                        <span className="text-slate-500 italic text-xs">Research highlights and publications will appear here.</span>}
                    </p>
                  </RichCard>

                  {/* Contact */}
                  <div>
                    <SectionTitle accent={tc} icon={<Mail size={15} />} title="Contact & Information" />
                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <InfoTile icon={<Map size={15} />}      label="Location"       value={activeInst?.contact?.address} tc={tc} />
                      <InfoTile icon={<Mail size={15} />}     label="Official Email"  value={activeInst?.contact?.email}   tc={tc} />
                      <InfoTile icon={<Phone size={15} />}    label="Phone"           value={activeInst?.contact?.phone}   tc={tc} />
                      <InfoTile icon={<Calendar size={15} />} label="Academic Year"   value="2024–2025"                    tc={tc} />
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════ */}
              {/* DEPARTMENTS TAB                        */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'departments' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {activeInst?.departments?.length > 0 ? (
                    activeInst.departments.map((dept, i) => {
                      const colors = ['#6366f1','#ec4899','#0ea5e9','#10b981','#f59e0b','#a855f7','#ef4444','#06b6d4'];
                      const col = colors[i % colors.length];
                      return (
                        <div key={i}
                          className="relative overflow-hidden rounded-2xl border p-6 transition-all hover:border-opacity-60"
                          style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)', borderColor: col + '30', boxShadow: `0 4px 30px rgba(0,0,0,0.4)` }}>
                          <div className="absolute top-0 right-0 w-44 h-44 rounded-full blur-[90px] pointer-events-none opacity-12" style={{ background: col }} />
                          <div className="flex items-center gap-4 mb-3.5">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: col + '22', color: col, boxShadow: `0 4px 16px ${col}28`, border: `1px solid ${col}38` }}>
                              <BookMarked size={18} />
                            </div>
                            <div className="w-0.5 h-6 rounded-full" style={{ background: `linear-gradient(to bottom,${col},${col}33)` }} />
                            <h3 className="font-black text-white text-base">{dept.name}</h3>
                            {dept.established && (
                              <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                                style={{ background: col + '20', color: col, border: `1px solid ${col}30` }}>Est. {dept.established}</span>
                            )}
                          </div>
                          {dept.description && <p className="text-slate-300 text-sm leading-relaxed mb-3.5">{dept.description}</p>}
                          {dept.subFields?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {dept.subFields.map((sf, j) => (
                                <span key={j} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                                  style={{ background: col + '16', color: col, border: `1px solid ${col}25` }}>
                                  {sf}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-12 text-center"
                      style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                        style={{ background: tc + '18', border: `1px solid ${tc}28`, padding: '1rem' }}>
                        <Layers size={28} style={{ color: tc }} className="opacity-60" />
                      </div>
                      <h3 className="text-white font-black text-base mb-2">No Departments Added Yet</h3>
                      <p className="text-slate-400 text-sm max-w-sm mx-auto">Departments and their sub-fields will appear here once the institution admin adds them.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════════════════════════════ */}
              {/* NOTICES TAB                            */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'feed' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {dashboardData.notices.map(n => (
                    <div key={n._id}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] p-6 transition-all hover:border-white/[0.15]"
                      style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)' }}>
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-full"
                        style={{ background: `linear-gradient(to bottom,${tc},${tc}22)` }} />
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                          style={{ background: tc + '18', borderColor: tc + '40', color: tc }}>
                          {n.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock size={9} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">{new Date(n.createdAt).toDateString()}</span>
                        </div>
                      </div>
                      <h4 className="text-base font-black text-white leading-snug mb-1.5">{n.title}</h4>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{n.content}</p>
                    </div>
                  ))}
                  {dashboardData.notices.length === 0 && <EmptyState text="The bulletin board is empty." themeColor={tc} />}
                </div>
              )}

              {/* ══════════════════════════════════════ */}
              {/* RESULTS TAB — PREMIUM REDESIGN         */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'results' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {dashboardData.results.map(r => {
                    const pct = parseFloat(r.percentage || r.marks || 0);
                    const grade =
                      pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' :
                      pct >= 60 ? 'B'  : pct >= 50 ? 'C' : 'F';
                    const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444';
                    const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : 'Needs Improvement';
                    return (
                      <div key={r._id}
                        className="relative overflow-hidden rounded-2xl border transition-all hover:border-opacity-60"
                        style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)', borderColor: color + '30', boxShadow: `0 4px 30px ${color}10` }}>

                        {/* Top glow */}
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,transparent,${color}60,transparent)` }} />
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none" style={{ background: color + '14' }} />

                        <div className="p-6 flex items-start gap-6">
                          {/* Circle Score */}
                          <div className="flex-shrink-0 relative w-24 h-24">
                            <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
                              <circle cx="44" cy="44" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                              <circle cx="44" cy="44" r="36" fill="none" stroke={color} strokeWidth="7"
                                strokeDasharray={`${2 * Math.PI * 36}`}
                                strokeDashoffset={`${2 * Math.PI * 36 * (1 - Math.min(pct, 100) / 100)}`}
                                strokeLinecap="round"
                                style={{ filter: `drop-shadow(0 0 6px ${color}80)`, transition: 'stroke-dashoffset 0.8s ease' }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black leading-none" style={{ color }}>{grade}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{pct.toFixed(0)}%</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <h4 className="font-black text-white text-base leading-snug mb-1">{r.examName}</h4>
                                <span className="inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/[0.07] text-slate-300 border border-white/[0.08]">
                                  {r.status || 'Published'}
                                </span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-3xl font-black tabular-nums leading-none" style={{ color }}>
                                  {pct.toFixed(1)}<span className="text-lg">%</span>
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-wider mt-1" style={{ color: color + 'bb' }}>{label}</p>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(pct, 100)}%`, background: `linear-gradient(to right,${color}88,${color})`, boxShadow: `0 0 8px ${color}60` }} />
                            </div>
                            <div className="flex justify-between mt-1.5">
                              <span className="text-[9px] text-slate-500 font-bold">0%</span>
                              <span className="text-[9px] font-bold" style={{ color: color + 'aa' }}>{pct.toFixed(1)}%</span>
                              <span className="text-[9px] text-slate-500 font-bold">100%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {dashboardData.results.length === 0 && <EmptyState text="No results published yet." themeColor={tc} />}
                </div>
              )}

              {/* ══════════════════════════════════════ */}
              {/* FEES TAB                               */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'fees' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  {dashboardData.fees.map(f => (
                    <div key={f._id}
                      className="group flex items-center justify-between p-5 rounded-2xl border border-white/[0.07] hover:border-emerald-500/30 transition-all"
                      style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-emerald-500/14 group-hover:bg-emerald-500/24 transition-all border border-emerald-500/20">
                          <DollarSign size={18} className="text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{f.category || f.note || 'Tuition Fee'}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                            <Clock size={8} /> {new Date(f.date || f.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-emerald-400">৳{f.amount?.toLocaleString()}</span>
                        <div className="w-7 h-7 rounded-xl bg-emerald-500/14 flex items-center justify-center border border-emerald-500/22">
                          <CheckCircle size={13} className="text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.fees.length === 0 && <EmptyState text="No fees recorded." themeColor={tc} />}
                </div>
              )}

              {/* ══════════════════════════════════════ */}
              {/* FACULTY TAB — PREMIUM REDESIGN         */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'faculty' && (
                <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                  {activeInst?.teachers?.map((t, i) => {
                    const colors = ['#6366f1','#ec4899','#0ea5e9','#10b981','#f59e0b','#a855f7','#06b6d4','#ef4444'];
                    const col = colors[i % colors.length];
                    return (
                      <div key={i}
                        className="group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 hover:border-opacity-60"
                        style={{ background: 'linear-gradient(135deg,#0d1829,#07091a)', borderColor: col + '28', boxShadow: `0 4px 24px ${col}0a` }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[70px] opacity-10 pointer-events-none transition-opacity group-hover:opacity-20" style={{ background: col }} />
                        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,transparent,${col}50,transparent)` }} />

                        <div className="p-5 flex items-start gap-4 relative z-10">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2"
                              style={{ background: col + '18', borderColor: col + '45', boxShadow: `0 0 20px ${col}25` }}>
                              {t.image
                                ? <img src={t.image} className="w-full h-full object-cover" alt="teacher" />
                                : <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ color: col }}>
                                    {t.name?.charAt(0) || '?'}
                                  </div>}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="mb-2">
                              <h4 className="font-black text-white text-sm leading-snug">{t.name}</h4>
                              <p className="text-[10px] font-black uppercase tracking-wider mt-0.5" style={{ color: col }}>{t.designation}</p>
                            </div>
                            {t.department && (
                              <span className="inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
                                style={{ background: col + '16', color: col + 'dd', border: `1px solid ${col}25` }}>
                                {t.department}
                              </span>
                            )}
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

            {/* ── RIGHT SIDEBAR ── */}
            <div className="xl:col-span-4 space-y-4">

              {/* ════════════════════════════════════════════════════ */}
              {/* AUTHORITIES — PREMIUM FULL REDESIGN                 */}
              {/* ════════════════════════════════════════════════════ */}
              {authorityPersonalities.length > 0 && (
                <div className="relative overflow-hidden rounded-[28px] border"
                  style={{
                    background: 'linear-gradient(160deg,#0e0620,#0b1127)',
                    borderColor: '#a855f730',
                    height: '680px',
                    boxShadow: '0 8px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.08)',
                  }}>

                  {/* Top ambient */}
                  <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                    style={{ background: 'linear-gradient(to bottom,rgba(168,85,247,0.12),transparent)' }} />

                  {/* Header */}
                  <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.07]">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-1.5 h-6 rounded-full" style={{ background: 'linear-gradient(to bottom,#a855f7,#6366f1)' }} />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Institution Authorities</h3>
                    </div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-4">Leadership & Key Officials</p>
                  </div>

                  {/* Scrolling list */}
                  <div className="relative overflow-hidden" style={{ height: 'calc(100% - 84px)' }}>
                    <div style={{ animation: `scrollDown ${authorityPersonalities.length * 6 + 18}s linear infinite` }}>
                      {[...authorityPersonalities, ...authorityPersonalities].map((p, i) => (
                        <AuthorityCard key={i} person={p} />
                      ))}
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-10 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to bottom,#0e0620,transparent)' }} />
                    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to top,#0b1127,transparent)' }} />
                  </div>
                </div>
              )}

              {/* ACADEMIC TOOLKIT */}
              <div className="rounded-[24px] border border-white/[0.08] overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#0d1829,#07091a)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
                <div className="px-6 py-5 border-b border-white/[0.07]">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">Academic Toolkit</h3>
                </div>
                <div className="p-4 space-y-2">
                  <ToolCard title="GPA Calculator" icon={<BarChart3 size={17} className="text-indigo-400" />} link="/tools/cgpa"    accent="#6366f1" />
                  <ToolCard title="Lab Report"     icon={<FileText    size={17} className="text-pink-400"   />} link="/tools/lab-gen" accent="#ec4899" />
                  <ToolCard title="Roadmaps"       icon={<Sparkles    size={17} className="text-amber-400"  />} link="/roadmaps"      accent="#f59e0b" />
                  <ToolCard title="Campus Feed"    icon={<Globe       size={17} className="text-cyan-400"   />} link="/feed"          accent="#06b6d4" />
                </div>
              </div>

              {/* QUICK STATS */}
              <div className="rounded-[24px] border border-white/[0.08] overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#0d1829,#07091a)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
                <div className="px-6 py-5 border-b border-white/[0.07]">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">My Academic Stats</h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Cumulative CGPA',   value: stats.cgpa.toFixed(2), color: tc,        sub: '/ 4.00' },
                    { label: 'Credits Earned',     value: stats.credits,          color: '#10b981', sub: 'total' },
                    {
                      label: 'Academic Standing',
                      value: stats.cgpa >= 3.75 ? "Dean's List"
                           : stats.cgpa >= 3.5  ? 'Honors'
                           : stats.cgpa >= 3.0  ? 'Good Standing'
                           : 'Satisfactory',
                      color: '#f59e0b', sub: '',
                    },
                  ].map((s, i) => (
                    <div key={i}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{s.label}</p>
                      <div className="text-right">
                        <span className="font-black text-sm" style={{ color: s.color }}>{s.value}</span>
                        {s.sub && <span className="text-slate-500 text-[10px] ml-1">{s.sub}</span>}
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
/* AUTHORITY CARD — PREMIUM QUOTE REDESIGN                     */
/* ═══════════════════════════════════════════════════════════ */
const AuthorityCard = ({ person }) => {
  const col = getCategoryColor(person.category);
  return (
    <div className="mx-4 mb-5 relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(160deg,${col}14,#0d1829 60%,#0a0e1e)`,
        borderColor: col + '35',
        boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px ${col}12`,
      }}>

      {/* Top border glow line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right,transparent,${col}80,transparent)` }} />

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-36 h-36 rounded-full blur-[70px] opacity-18 pointer-events-none" style={{ background: col }} />

      {/* ── IDENTITY BLOCK ── */}
      <div className="flex items-center gap-4 p-5 pb-4">
        {/* Avatar — large */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2"
            style={{
              background: `linear-gradient(135deg,${col}25,#0d1829)`,
              borderColor: col + '55',
              boxShadow: `0 0 28px ${col}35, 0 4px 20px rgba(0,0,0,0.5)`,
            }}>
            {person.image
              ? <img src={person.image} className="w-full h-full object-cover" alt={person.name} />
              : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ color: col }}>
                  {person.name?.charAt(0) || '?'}
                </div>}
          </div>
          {/* Category dot */}
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-[#0d1829]"
            style={{ background: col, boxShadow: `0 0 8px ${col}` }} />
        </div>

        {/* Name & meta */}
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[8px] font-black uppercase tracking-[0.16em] px-2.5 py-1 rounded-full mb-2"
            style={{ background: col + '22', color: col, border: `1px solid ${col}40` }}>
            {person.category}
          </span>
          <h4 className="font-black text-white text-[15px] leading-snug truncate">{person.name}</h4>
          {person.title && (
            <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate" style={{ color: col + 'dd' }}>
              {person.title}
            </p>
          )}
        </div>
      </div>

      {/* ── QUOTE BLOCK ── */}
      {person.quote && (
        <div className="mx-5 mb-5 relative rounded-xl px-5 py-4"
          style={{ background: `rgba(0,0,0,0.3)`, border: `1px solid ${col}22` }}>
          {/* Giant decorative left quote mark */}
          <div className="absolute -top-3 -left-1 text-5xl font-black leading-none pointer-events-none select-none"
            style={{ color: col, opacity: 0.5, fontFamily: 'Georgia, serif' }}>
            &#8220;
          </div>
          <p className="text-slate-200 text-[12px] leading-relaxed italic pt-1 pl-3">
            {person.quote}
          </p>
          {/* Closing quote */}
          <div className="absolute -bottom-4 -right-1 text-5xl font-black leading-none pointer-events-none select-none"
            style={{ color: col, opacity: 0.35, fontFamily: 'Georgia, serif' }}>
            &#8221;
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════ SUB-COMPONENTS ═══════════════════════ */
const RichCard = ({ accent, gradient, icon, title, children }) => (
  <div className={`relative overflow-hidden rounded-2xl border p-6 bg-gradient-to-br ${gradient} transition-all hover:border-opacity-50`}
    style={{ borderColor: accent + '30', boxShadow: `0 4px 40px rgba(0,0,0,0.4)` }}>
    <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[90px] pointer-events-none opacity-15"
      style={{ background: accent, transform: 'translate(30%,-30%)' }} />
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '25', color: accent, border: `1px solid ${accent}38`, boxShadow: `0 4px 16px ${accent}22` }}>
          {icon}
        </div>
        <div className="w-0.5 h-5 rounded-full" style={{ background: `linear-gradient(to bottom,${accent},${accent}33)` }} />
        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

const SectionTitle = ({ accent, icon, title }) => (
  <div className="flex items-center gap-2.5 px-0.5">
    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
      style={{ background: accent + '22', color: accent, border: `1px solid ${accent}35`, boxShadow: `0 4px 16px ${accent}18` }}>
      {icon}
    </div>
    <div className="w-0.5 h-5 rounded-full" style={{ background: `linear-gradient(to bottom,${accent},${accent}33)` }} />
    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h3>
  </div>
);

const InfoTile = ({ icon, label, value, tc }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] hover:border-white/[0.13] transition-all"
    style={{ background: 'rgba(0,0,0,0.25)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: (tc || '#6366f1') + '22', color: tc || '#6366f1', border: `1px solid ${tc || '#6366f1'}30` }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-slate-200 text-xs font-semibold truncate">{value || 'Not provided'}</p>
    </div>
  </div>
);

const ToolCard = ({ title, icon, link, accent }) => (
  <Link to={link}
    className="group flex items-center justify-between p-3.5 rounded-xl border border-white/[0.06] hover:border-white/[0.14] transition-all"
    style={{ background: 'rgba(0,0,0,0.2)' }}>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
        style={{ background: accent + '20', border: `1px solid ${accent}30` }}>
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
        {title}
      </span>
    </div>
    <ArrowUpRight size={13} className="text-slate-600 group-hover:text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
  </Link>
);

const EmptyFieldHint = ({ label }) => (
  <span className="text-slate-600 italic text-xs">{label} statement will appear here once set by admin.</span>
);

const EmptyState = ({ text, themeColor }) => (
  <div className="flex flex-col items-center justify-center py-28 rounded-3xl border border-dashed border-white/[0.07]"
    style={{ background: 'rgba(0,0,0,0.15)' }}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
      style={{ background: (themeColor || '#6366f1') + '18', border: `1px solid ${(themeColor || '#6366f1')}28` }}>
      <Sparkles size={22} style={{ color: themeColor || '#6366f1' }} className="opacity-60" />
    </div>
    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] text-center max-w-[200px] leading-relaxed">{text}</p>
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
