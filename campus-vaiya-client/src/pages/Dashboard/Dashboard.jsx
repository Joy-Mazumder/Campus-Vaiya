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
      style={{ background: 'linear-gradient(150deg,#0f172a 0%,#1a1f4e 45%,#0f2440 100%)' }}>

      {/* ── AMBIENT ORBS ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-8%] right-[-4%] w-[700px] h-[700px] rounded-full blur-[180px] opacity-[0.14]"
          style={{ background: tc }} />
        <div className="absolute top-[30%] left-[-6%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.10]"
          style={{ background: '#ec4899' }} />
        <div className="absolute bottom-[5%] right-[20%] w-[400px] h-[400px] rounded-full blur-[180px] opacity-[0.09]"
          style={{ background: '#06b6d4' }} />
        <div className="absolute top-[55%] left-[40%] w-[300px] h-[300px] rounded-full blur-[140px] opacity-[0.07]"
          style={{ background: '#a855f7' }} />
      </div>

      <div className="max-w-[1440px] mx-auto space-y-5 relative z-10">

        {/* ════════════════════════════════════════════════════════ */}
        {/* HEADER CARD                                              */}
        {/* ════════════════════════════════════════════════════════ */}
        {showMainHeader && (
          <div className="relative overflow-hidden rounded-[28px] shadow-2xl border"
            style={{ borderColor: tc + '30', background: 'linear-gradient(160deg,#131d35,#0f172a)' }}>

            <div className="absolute inset-0 rounded-[28px] pointer-events-none"
              style={{ background: `linear-gradient(135deg,${tc}28 0%,transparent 50%,${tc}12 100%)` }} />

            {/* BANNER */}
            <div className="h-48 md:h-64 w-full relative overflow-hidden rounded-t-[28px]">
              {mode === 'global' ? (
                <div className="absolute inset-0">
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#131d35,#0f172a)' }} />
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%,${tc}45,transparent)` }} />
                  <div className="absolute top-[-20%] right-[5%] w-96 h-96 rounded-full blur-[130px]" style={{ background: tc + '35' }} />
                  <div className="absolute bottom-[-10%] left-[5%] w-72 h-72 rounded-full blur-[100px] opacity-30 bg-pink-500" />
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>
              ) : campusLoading ? (
                <div className="w-full h-full bg-slate-900 animate-pulse" />
              ) : activeInst?.banner ? (
                <img src={activeInst.banner} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${tc}28,#0f172a 60%,#0f2440)` }} />
                  <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px]" style={{ background: tc + '28' }} />
                  <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] opacity-20 bg-purple-500" />
                  <div className="absolute inset-0 opacity-[0.035]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>

            {/* PROFILE ROW */}
            <div className="px-5 md:px-9 pb-7 -mt-14 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                {/* Logo */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl"
                    style={{ background: '#131d35', border: `2px solid ${tc}60` }}>
                    {mode === 'global' ? (
                      <Globe className="w-9 h-9" style={{ color: tc }} />
                    ) : campusLoading ? (
                      <div className="w-full h-full bg-slate-800 animate-pulse" />
                    ) : activeInst?.logo ? (
                      <img src={activeInst.logo} className="w-full h-full object-contain p-2" alt="Logo" />
                    ) : (
                      <Building2 className="w-9 h-9 text-slate-500" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f172a]"
                    style={{ background: tc }} />
                </div>

                {/* Name */}
                <div className="mb-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                      style={{ background: tc + '20', borderColor: tc + '50', color: tc }}>
                      {mode} mode
                    </span>
                    {mode === 'global' && isAdmin && (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/15 border border-amber-500/35 text-amber-400">
                        Admin
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl md:text-3xl font-black tracking-tight text-white leading-none">
                    {mode === 'global'
                      ? 'Global Universe'
                      : campusLoading
                        ? <span className="inline-block w-48 h-7 bg-slate-800 animate-pulse rounded-lg" />
                        : (activeInst?.name || 'Institution Not Found')}
                  </h1>
                  <p className="text-slate-500 text-xs font-semibold mt-1">
                    {user?.fullName} · {mode === 'global' && isAdmin ? 'Institution Admin' : 'Student'}
                    {activeInst?.foundedYear && ` · Est. ${activeInst.foundedYear}`}
                  </p>
                </div>
              </div>

              {/* ── CGPA COMPACT BADGE ── */}
              {mode === 'campus' && (
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="relative overflow-hidden rounded-2xl px-5 py-3 border text-center"
                    style={{ background: `linear-gradient(135deg,${tc}18,#131d35)`, borderColor: tc + '45' }}>
                    <div className="absolute inset-0 rounded-2xl opacity-25 blur-lg pointer-events-none" style={{ background: tc }} />
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.18em] mb-0.5 relative z-10">CGPA</p>
                    <p className="text-3xl font-black tabular-nums leading-none relative z-10" style={{ color: tc }}>{stats.cgpa.toFixed(2)}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest mt-0.5 relative z-10" style={{ color: tc + 'aa' }}>
                      {stats.cgpa >= 3.5 ? 'Honors' : stats.cgpa >= 3.0 ? 'Good' : 'Pass'}
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl px-4 py-3 border text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' }}>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Credits</p>
                    <p className="text-2xl font-black text-white tabular-nums leading-none">{stats.credits}</p>
                    <Link to="/tools/cgpa"
                      className="text-[8px] font-black uppercase tracking-wider mt-0.5 block"
                      style={{ color: tc }}>
                      Update →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* GLOBAL MODE                                              */}
        {/* ════════════════════════════════════════════════════════ */}
        {mode === 'global' && <MyInstitution />}

        {/* ════════════════════════════════════════════════════════ */}
        {/* CAMPUS MODE                                              */}
        {/* ════════════════════════════════════════════════════════ */}
        {mode === 'campus' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

            {/* ── LEFT CONTENT ── */}
            <div className="xl:col-span-8 space-y-4">

              {/* TAB NAV */}
              <div className="flex items-center gap-1 p-1.5 rounded-2xl border border-white/[0.08] overflow-x-auto no-scrollbar"
                style={{ background: 'rgba(255,255,255,0.03)', width: 'fit-content', maxWidth: '100%' }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setCampusTab(tab.id)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap"
                    style={campusTab === tab.id
                      ? { background: `linear-gradient(135deg,${tc},${tc}cc)`, color: '#fff', boxShadow: `0 4px 20px ${tc}55` }
                      : { color: '#475569' }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* LOADING */}
              {campusLoading && (
                <div className="flex flex-col items-center justify-center py-40 rounded-3xl border border-dashed border-slate-700/60">
                  <div className="w-10 h-10 rounded-full border-[3px] border-transparent animate-spin mb-5"
                    style={{ borderTopColor: tc }} />
                  <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Loading Campus Data...</p>
                </div>
              )}

              {!studentInstId && !campusLoading && (
                <EmptyState text="You are not enrolled in any institution." themeColor={tc} />
              )}

              {/* ══════════════════════════════════════ */}
              {/* OVERVIEW TAB                           */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">

                  {/* ── INSTITUTION COMMUNITY ── */}
                  <div className="relative overflow-hidden rounded-2xl border p-5 space-y-4"
                    style={{ background: 'linear-gradient(135deg,#1a2545,#131d35)', borderColor: '#ec489930' }}>
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none"
                      style={{ background: '#ec4899' }} />

                    <SectionTitle accent="#ec4899" icon={<Users size={14} />} title="Institution Community" />

                    {/* Category pills */}
                    <div className="flex flex-wrap gap-2">
                      {OVERVIEW_CATEGORIES.map(cat => {
                        const count = communityCount(cat);
                        const color = getCategoryColor(cat);
                        return (
                          <div key={cat} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border"
                            style={{ background: `${color}12`, borderColor: `${color}38` }}>
                            <div className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                            <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">{cat}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                              style={{ background: `${color}25`, color }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Community person cards */}
                    {communityPersonalities.length > 0 && (
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                        {communityPersonalities.map((person, i) => {
                          const color = getCategoryColor(person.category);
                          return (
                            <div key={i}
                              className="relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 hover:-translate-y-1 hover:border-opacity-60"
                              style={{
                                background: `linear-gradient(145deg,${color}10,#1a2545)`,
                                borderColor: `${color}30`,
                                boxShadow: `0 4px 16px ${color}18`,
                              }}>
                              <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-[40px] opacity-15 pointer-events-none"
                                style={{ background: color }} />
                              <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center mb-3 border-2"
                                  style={{ background: `${color}15`, borderColor: `${color}45`, boxShadow: `0 0 14px ${color}28` }}>
                                  {person.image
                                    ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                                    : <span className="text-xl font-black" style={{ color }}>{person.name?.charAt(0) || '?'}</span>}
                                </div>
                                {/* Category badge */}
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5"
                                  style={{ background: `${color}20`, color }}>
                                  {person.category}
                                </span>
                                {/* Name */}
                                <h4 className="font-black text-white text-xs leading-snug mb-0.5">{person.name}</h4>
                                {/* Title */}
                                {person.title && (
                                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1.5" style={{ color: `${color}cc` }}>
                                    {person.title}
                                  </p>
                                )}
                                {/* Quote */}
                                {person.quote && (
                                  <p className="text-[10px] text-slate-500 italic leading-snug line-clamp-2">
                                    "{person.quote}"
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Vision + Mission */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <RichCard accent="#6366f1" gradient="from-indigo-950/60 to-slate-950/80"
                      icon={<Star size={16} />} title="Our Vision">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {activeInst?.vision || <EmptyFieldHint label="Vision" />}
                      </p>
                    </RichCard>
                    <RichCard accent="#ec4899" gradient="from-pink-950/60 to-slate-950/80"
                      icon={<TrendingUp size={16} />} title="Our Mission">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {activeInst?.mission || <EmptyFieldHint label="Mission" />}
                      </p>
                    </RichCard>
                  </div>

                  {/* History */}
                  {activeInst?.history && (
                    <RichCard accent="#f59e0b" gradient="from-amber-950/50 to-slate-950/80"
                      icon={<History size={16} />} title="History of the Institution">
                      <p className="text-slate-300 text-sm leading-relaxed">{activeInst.history}</p>
                    </RichCard>
                  )}

                  {/* Achievements */}
                  {activeInst?.achievements?.length > 0 && (
                    <div>
                      <SectionTitle accent="#f59e0b" icon={<Trophy size={14} />} title="Achievements & Awards" />
                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        {activeInst.achievements.map((ach, i) => (
                          <div key={i}
                            className="group relative overflow-hidden rounded-2xl p-5 border border-amber-500/15 hover:border-amber-500/35 transition-all"
                            style={{ background: 'linear-gradient(135deg,#1e1500,#1a2545)' }}>
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] bg-amber-500/12 group-hover:bg-amber-500/22 transition-all" />
                            <Trophy className="text-amber-500 mb-3 relative z-10" size={20} />
                            <h4 className="font-black text-white text-sm mb-1 relative z-10">{ach.title}</h4>
                            {ach.description && (
                              <p className="text-slate-500 text-xs leading-relaxed mb-2 relative z-10">{ach.description}</p>
                            )}
                            <span className="text-[10px] text-amber-500/70 font-black uppercase tracking-widest relative z-10">
                              {ach.year}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alumni Legacy */}
                  {activeInst?.alumniHistory && (
                    <RichCard accent="#10b981" gradient="from-emerald-950/50 to-slate-950/80"
                      icon={<GraduationCap size={16} />} title="Alumni Legacy">
                      <p className="text-slate-300 text-sm leading-relaxed">{activeInst.alumniHistory}</p>
                    </RichCard>
                  )}

                  {/* Admission Info */}
                  {activeInst?.admissionInfo && (
                    <RichCard accent="#0ea5e9" gradient="from-sky-950/50 to-slate-950/80"
                      icon={<Info size={16} />} title="Admission Information">
                      <p className="text-slate-300 text-sm leading-relaxed">{activeInst.admissionInfo}</p>
                    </RichCard>
                  )}

                  {/* Facilities */}
                  <div>
                    <SectionTitle accent="#a855f7" icon={<TreePine size={14} />} title="Campus Life & Facilities" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {[
                        { icon: <Library size={20} />,    label: 'Central Library',  color: '#f59e0b', desc: activeInst?.facilities?.library  || 'Digital & physical resources' },
                        { icon: <Microscope size={20} />, label: 'Research Labs',    color: '#0ea5e9', desc: activeInst?.facilities?.labs      || 'Modern lab infrastructure' },
                        { icon: <Wifi size={20} />,       label: 'Digital Campus',   color: '#6366f1', desc: activeInst?.facilities?.digital   || 'Wi-Fi enabled campus' },
                        { icon: <Heart size={20} />,      label: 'Health Centre',    color: '#ef4444', desc: activeInst?.facilities?.health    || 'Medical facilities on-site' },
                        { icon: <Music size={20} />,      label: 'Arts & Culture',   color: '#ec4899', desc: activeInst?.facilities?.arts      || 'Creative spaces & events' },
                        { icon: <Shield size={20} />,     label: 'Campus Security',  color: '#10b981', desc: activeInst?.facilities?.security  || '24/7 campus safety' },
                      ].map((f, i) => (
                        <div key={i}
                          className="group relative overflow-hidden rounded-2xl p-4 border border-white/[0.07] hover:border-white/[0.16] transition-all text-center"
                          style={{ background: 'linear-gradient(135deg,#1a2545,#131d35)' }}>
                          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at 50% 100%,${f.color}14,transparent 70%)` }} />
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 relative z-10"
                            style={{ background: f.color + '18', color: f.color }}>
                            {f.icon}
                          </div>
                          <p className="text-[11px] font-black text-white relative z-10">{f.label}</p>
                          <p className="text-[9px] text-slate-600 font-semibold mt-0.5 leading-tight relative z-10">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Organizations */}
                  <RichCard accent="#a855f7" gradient="from-purple-950/50 to-slate-950/80"
                    icon={<Users size={16} />} title="Student Life & Organizations">
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {activeInst?.studentLife ||
                        <span className="text-slate-600 italic text-xs">Student organizations and clubs information will appear here when added by the institution admin.</span>}
                    </p>
                  </RichCard>

                  {/* Research */}
                  <RichCard accent="#06b6d4" gradient="from-cyan-950/50 to-slate-950/80"
                    icon={<FlaskConical size={16} />} title="Research & Publications">
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {activeInst?.research ||
                        <span className="text-slate-600 italic text-xs">Research highlights and publications will appear here.</span>}
                    </p>
                  </RichCard>

                  {/* Contact */}
                  <div>
                    <SectionTitle accent={tc} icon={<Mail size={14} />} title="Contact & Information" />
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
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
                          className="relative overflow-hidden rounded-2xl border p-5 transition-all hover:border-opacity-50"
                          style={{ background: 'linear-gradient(135deg,#1a2545,#131d35)', borderColor: col + '28' }}>
                          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] pointer-events-none opacity-12"
                            style={{ background: col }} />
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: col + '20', color: col }}>
                              <BookMarked size={16} />
                            </div>
                            <div className="w-0.5 h-5 rounded-full" style={{ background: col }} />
                            <h3 className="font-black text-white text-base">{dept.name}</h3>
                            {dept.established && (
                              <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ background: col + '18', color: col }}>Est. {dept.established}</span>
                            )}
                          </div>
                          {dept.description && (
                            <p className="text-slate-400 text-sm leading-relaxed mb-3">{dept.description}</p>
                          )}
                          {dept.subFields?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {dept.subFields.map((sf, j) => (
                                <span key={j}
                                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                                  style={{ background: col + '14', color: col + 'cc', border: `1px solid ${col}22` }}>
                                  {sf}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-10 text-center"
                      style={{ background: 'linear-gradient(135deg,#1a2545,#131d35)' }}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                        style={{ background: tc + '18', border: `1px solid ${tc}28` }}>
                        <Layers size={28} style={{ color: tc }} className="opacity-60" />
                      </div>
                      <h3 className="text-white font-black text-base mb-2">No Departments Added Yet</h3>
                      <p className="text-slate-600 text-sm max-w-sm mx-auto">
                        Departments and their sub-fields will appear here once the institution admin adds them.
                      </p>
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
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] p-5 transition-all hover:border-white/[0.14]"
                      style={{ background: 'linear-gradient(135deg,#1a2545,#131d35)' }}>
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full"
                        style={{ background: `linear-gradient(to bottom,${tc},${tc}00)` }} />
                      <div className="flex justify-between items-start mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                          style={{ background: tc + '14', borderColor: tc + '35', color: tc }}>
                          {n.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock size={9} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">{new Date(n.createdAt).toDateString()}</span>
                        </div>
                      </div>
                      <h4 className="text-base font-black text-white leading-snug mb-1.5">{n.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{n.content}</p>
                    </div>
                  ))}
                  {dashboardData.notices.length === 0 && <EmptyState text="The bulletin board is empty." themeColor={tc} />}
                </div>
              )}

              {/* ══════════════════════════════════════ */}
              {/* RESULTS TAB                            */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'results' && (
                <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                  {dashboardData.results.map(r => {
                    const pct = parseFloat(r.percentage || r.marks || 0);
                    const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444';
                    return (
                      <div key={r._id}
                        className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-5 hover:border-white/[0.12] transition-all"
                        style={{ background: 'linear-gradient(135deg,#1a2545,#131d35)' }}>
                        <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full blur-[50px]"
                          style={{ background: color + '20' }} />
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 pr-3">
                            <h4 className="font-black text-white text-sm uppercase leading-snug mb-1.5">{r.examName}</h4>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/5 text-slate-500">
                              {r.status || 'Published'}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-3xl font-black tabular-nums leading-none" style={{ color }}>
                              {pct.toFixed(1)}<span className="text-lg">%</span>
                            </p>
                            <p className="text-[9px] text-slate-600 font-black uppercase mt-0.5">Score</p>
                          </div>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
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
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  {dashboardData.fees.map(f => (
                    <div key={f._id}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-white/[0.07] hover:border-emerald-500/25 transition-all"
                      style={{ background: 'linear-gradient(135deg,#1a2545,#131d35)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/12 group-hover:bg-emerald-500/22 transition-all">
                          <DollarSign size={16} className="text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{f.category || f.note || 'Tuition Fee'}</h4>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                            <Clock size={8} /> {new Date(f.date || f.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-emerald-400">৳{f.amount?.toLocaleString()}</span>
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/12 flex items-center justify-center">
                          <CheckCircle size={11} className="text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.fees.length === 0 && <EmptyState text="No fees recorded." themeColor={tc} />}
                </div>
              )}

              {/* ══════════════════════════════════════ */}
              {/* FACULTY TAB                            */}
              {/* ══════════════════════════════════════ */}
              {studentInstId && !campusLoading && campusTab === 'faculty' && (
                <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                  {activeInst?.teachers?.map((t, i) => (
                    <div key={i}
                      className="group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] hover:border-white/[0.14] transition-all"
                      style={{ background: 'linear-gradient(135deg,#1a2545,#131d35)' }}>
                      <div className="rounded-2xl overflow-hidden flex-shrink-0 border border-white/[0.08]"
                        style={{ background: '#131d35', width: '52px', height: '52px' }}>
                        {t.image
                          ? <img src={t.image} className="w-full h-full object-cover" alt="teacher" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <UserIcon size={18} className="text-slate-600" />
                            </div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-white text-sm truncate">{t.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-tighter truncate mt-0.5" style={{ color: tc }}>{t.designation}</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase truncate">{t.department}</p>
                      </div>
                    </div>
                  ))}
                  {(!activeInst?.teachers || activeInst.teachers.length === 0) && (
                    <EmptyState text="No faculty members added yet." themeColor={tc} />
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="xl:col-span-4 space-y-4">

              {/* AUTHORITIES — auto-scroll, high-ranking only */}
              {authorityPersonalities.length > 0 && (
                <div className="relative overflow-hidden rounded-[24px] border"
                  style={{
                    background: 'linear-gradient(160deg,#1a1040,#131d35)',
                    borderColor: '#a855f728',
                    height: '580px',
                  }}>

                  {/* Header */}
                  <div className="relative px-5 pt-5 pb-3 border-b border-white/[0.06]">
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to bottom,#a855f720,transparent)' }} />
                    <div className="relative flex items-center gap-2 mb-0.5">
                      <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom,#a855f7,#6366f1)' }} />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Institution Authorities</h3>
                    </div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest ml-3.5">
                      Leadership & Key Officials
                    </p>
                  </div>

                  {/* Scrolling list */}
                  <div className="relative overflow-hidden" style={{ height: 'calc(100% - 72px)' }}>
                    <div style={{ animation: `scrollDown ${authorityPersonalities.length * 5 + 15}s linear infinite` }}>
                      {[...authorityPersonalities, ...authorityPersonalities].map((p, i) => (
                        <AuthorityCard key={i} person={p} />
                      ))}
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to bottom,#1a1040,transparent)' }} />
                    <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
                      style={{ background: 'linear-gradient(to top,#131d35,transparent)' }} />
                  </div>
                </div>
              )}

              {/* ACADEMIC TOOLKIT */}
              <div className="rounded-[20px] border border-white/[0.08] overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#1a2545,#131d35)' }}>
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Academic Toolkit</h3>
                </div>
                <div className="p-3 space-y-1.5">
                  <ToolCard title="GPA Calculator" icon={<BarChart3 size={16} className="text-indigo-400" />} link="/tools/cgpa"    accent="#6366f1" />
                  <ToolCard title="Lab Report"     icon={<FileText    size={16} className="text-pink-400"   />} link="/tools/lab-gen" accent="#ec4899" />
                  <ToolCard title="Roadmaps"       icon={<Sparkles    size={16} className="text-amber-400"  />} link="/roadmaps"      accent="#f59e0b" />
                  <ToolCard title="Campus Feed"    icon={<Globe       size={16} className="text-cyan-400"   />} link="/feed"          accent="#06b6d4" />
                </div>
              </div>

              {/* QUICK STATS */}
              <div className="rounded-[20px] border border-white/[0.08] overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#1a2545,#131d35)' }}>
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">My Academic Stats</h3>
                </div>
                <div className="p-4 space-y-3">
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
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.025)' }}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{s.label}</p>
                      <div className="text-right">
                        <span className="font-black text-sm" style={{ color: s.color }}>{s.value}</span>
                        {s.sub && <span className="text-slate-600 text-[10px] ml-1">{s.sub}</span>}
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

/* ════════════════════ AUTHORITY CARD ═══════════════════════ */
const AuthorityCard = ({ person }) => {
  const col = getCategoryColor(person.category);
  return (
    <div className="mx-4 mb-3 relative overflow-hidden rounded-2xl p-4 border transition-all hover:-translate-y-0.5 hover:border-opacity-70"
      style={{
        background: `linear-gradient(135deg,${col}12,#1a2545)`,
        borderColor: col + '30',
        boxShadow: `0 4px 20px ${col}14`,
      }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] opacity-20 pointer-events-none"
        style={{ background: col }} />
      <div className="flex items-start gap-3 relative z-10">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2"
          style={{ background: col + '20', borderColor: col + '40', boxShadow: `0 0 12px ${col}28` }}>
          {person.image
            ? <img src={person.image} className="w-full h-full object-cover" alt={person.name} />
            : <div className="w-full h-full flex items-center justify-center text-lg font-black" style={{ color: col }}>
                {person.name?.charAt(0) || '?'}
              </div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h4 className="font-black text-white text-sm truncate">{person.name}</h4>
            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: col + '22', color: col }}>{person.category}</span>
          </div>
          {person.title && (
            <p className="text-[10px] font-bold uppercase tracking-wider truncate mb-1" style={{ color: col + 'cc' }}>
              {person.title}
            </p>
          )}
          {person.quote && (
            <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-2">
              "{person.quote}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════ SUB-COMPONENTS ═══════════════════════ */
const RichCard = ({ accent, gradient, icon, title, children }) => (
  <div className={`relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br ${gradient} transition-all hover:border-opacity-40`}
    style={{ borderColor: accent + '25' }}>
    <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] pointer-events-none opacity-20"
      style={{ background: accent, transform: 'translate(30%,-30%)' }} />
    <div className="relative z-10">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '22', color: accent }}>{icon}</div>
        <div className="w-0.5 h-4 rounded-full" style={{ background: accent }} />
        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

const SectionTitle = ({ accent, icon, title }) => (
  <div className="flex items-center gap-2 px-0.5">
    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: accent + '20', color: accent }}>
      {icon}
    </div>
    <div className="w-0.5 h-4 rounded-full" style={{ background: accent }} />
    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h3>
  </div>
);

const InfoTile = ({ icon, label, value, tc }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] hover:border-white/[0.10] transition-all"
    style={{ background: 'rgba(255,255,255,0.025)' }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: (tc || '#6366f1') + '20', color: tc || '#6366f1' }}>{icon}</div>
    <div className="min-w-0">
      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-slate-300 text-xs font-semibold truncate">{value || 'Not provided'}</p>
    </div>
  </div>
);

const ToolCard = ({ title, icon, link, accent }) => (
  <Link to={link}
    className="group flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
    style={{ background: 'rgba(255,255,255,0.025)' }}>
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
        style={{ background: accent + '18', border: `1px solid ${accent}25` }}>
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
        {title}
      </span>
    </div>
    <ArrowUpRight size={12} className="text-slate-700 group-hover:text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
  </Link>
);

const EmptyFieldHint = ({ label }) => (
  <span className="text-slate-700 italic text-xs">{label} statement will appear here once set by admin.</span>
);

const EmptyState = ({ text, themeColor }) => (
  <div className="flex flex-col items-center justify-center py-28 rounded-3xl border border-dashed border-white/[0.06]"
    style={{ background: 'rgba(255,255,255,0.01)' }}>
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: (themeColor || '#6366f1') + '14', border: `1px solid ${(themeColor || '#6366f1')}22` }}>
      <Sparkles size={20} style={{ color: themeColor || '#6366f1' }} className="opacity-60" />
    </div>
    <p className="text-slate-600 font-black uppercase tracking-widest text-[10px] text-center max-w-[200px] leading-relaxed">{text}</p>
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
