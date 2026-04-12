import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ModeContext } from '../../context/ModeContext';
import { 
  TrendingUp, Bell, Map, Send, Trophy, Globe, 
  Building2, FileText, Sparkles, CheckCircle, DollarSign,
  Mail, Phone, Calendar, User as UserIcon, ChevronRight,
  BookOpen, Star, Zap, Award, Clock, ArrowUpRight, 
} from 'lucide-react';
import API from '../../services/api';
import { Link } from 'react-router-dom';
import MyInstitution from './MyInstitution';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { mode } = useContext(ModeContext);
  
  const [dashboardData, setDashboardData] = useState({ notices: [], results: [], fees: [] });
  const [stats, setStats] = useState({ cgpa: 0, credits: 0 });
  const [campusTab, setCampusTab] = useState("overview");

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

  useEffect(() => {
    if (!user) return;
    API.get("/tools/gpa-history")
      .then(res => setStats({
        cgpa: parseFloat(res.data?.cumulativeCGPA) || 0,
        credits: parseInt(res.data?.totalCredits) || 0
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
        .catch(err => console.error("Error fetching institution details:", err))
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
          API.get(`/institution/finance/my-fees/${studentInstId}`).catch(() => ({ data: [] }))
        ]);
        setDashboardData({ notices: nRes.data || [], results: rRes.data || [], fees: fRes.data || [] });
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      }
    };
    fetchData();
  }, [user, mode, studentInstId]);

  const themeColor = activeInst?.themeColor || '#2563eb';
  const themeColorMuted = themeColor + '22';
  const themeColorBorder = themeColor + '44';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen size={14}/> },
    { id: 'feed', label: 'Notices', icon: <Bell size={14}/> },
    { id: 'results', label: 'Results', icon: <Award size={14}/> },
    { id: 'fees', label: 'Fees', icon: <DollarSign size={14}/> },
    { id: 'faculty', label: 'Faculty', icon: <UserIcon size={14}/> },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-16 px-4 md:px-8 bg-[#020617] text-white font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        {showMainHeader && (
          <div className="relative overflow-hidden rounded-[32px] shadow-2xl">
            
            {/* Gradient border trick */}
            <div className="absolute inset-0 rounded-[32px] p-px"
              style={{ background: `linear-gradient(135deg, ${themeColor}55, transparent 60%, ${themeColor}33)` }}>
              <div className="absolute inset-0 rounded-[32px] bg-[#0a0f1e]" />
            </div>

            <div className="relative z-10">
              {/* BANNER */}
              <div className="h-52 md:h-72 w-full relative overflow-hidden rounded-t-[32px]">
                {mode === 'global' ? (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[#0a0f1e]" />
                    <div className="absolute inset-0" style={{background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${themeColor}30, transparent)`}} />
                    <div className="absolute top-[-20%] right-[5%] w-96 h-96 rounded-full blur-[120px]" style={{background: themeColor + '25'}} />
                    <div className="absolute bottom-[-10%] left-[5%] w-72 h-72 rounded-full blur-[100px] bg-violet-600/20" />
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.04]"
                      style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
                  </div>
                ) : campusLoading ? (
                  <div className="w-full h-full bg-slate-900 animate-pulse" />
                ) : activeInst?.banner ? (
                  <img src={activeInst.banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0" style={{background: `linear-gradient(135deg, ${themeColor}20, #0a0f1e)`}} />
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px]" style={{background: themeColor + '20'}} />
                    <div className="absolute inset-0 opacity-[0.03]"
                      style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/20 to-transparent" />
              </div>

              {/* PROFILE ROW */}
              <div className="px-6 md:px-10 pb-8 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                
                <div className="flex items-end gap-5">
                  {/* Logo */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl"
                      style={{background: '#0a0f1e', border: `2px solid ${themeColor}44`}}>
                      {mode === 'global' ? (
                        <Globe className="w-10 h-10" style={{color: themeColor}} />
                      ) : campusLoading ? (
                        <div className="w-full h-full bg-slate-800 animate-pulse" />
                      ) : activeInst?.logo ? (
                        <img src={activeInst.logo} className="w-full h-full object-contain p-2" alt="Logo"/>
                      ) : (
                        <Building2 className="w-10 h-10 text-slate-600"/>
                      )}
                    </div>
                    {/* Online dot */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0f1e]"
                      style={{background: themeColor}} />
                  </div>

                  {/* Name & badges */}
                  <div className="mb-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border"
                        style={{background: themeColor + '15', borderColor: themeColor + '40', color: themeColor}}>
                        {mode} mode
                      </span>
                      {mode === 'global' && isAdmin && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          Admin
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-none">
                      {mode === 'global'
                        ? 'Global Universe'
                        : campusLoading
                        ? <span className="inline-block w-56 h-8 bg-slate-800 animate-pulse rounded-lg" />
                        : (activeInst?.name || 'Institution Not Found')}
                    </h1>
                    <p className="text-slate-500 text-xs font-semibold mt-1.5">
                      {user?.fullName} &nbsp;·&nbsp; {mode === 'global' && isAdmin ? 'Institution Admin' : 'Student'}
                    </p>
                  </div>
                </div>

                {/* CGPA Badge — campus mode only */}
                {mode === 'campus' && (
                  <div className="flex-shrink-0 relative group">
                    <div className="absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"
                      style={{background: themeColor}} />
                    <div className="relative px-8 py-5 rounded-2xl text-center border"
                      style={{background: '#0a0f1e', borderColor: themeColor + '50'}}>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Academic CGPA</p>
                      <p className="text-4xl font-black tabular-nums leading-none" style={{color: themeColor}}>
                        {stats.cgpa.toFixed(2)}
                      </p>
                      <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-wider">Cumulative</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* GLOBAL MODE */}
        {/* ================================================================ */}
        {mode === 'global' && <MyInstitution />}

        {/* ================================================================ */}
        {/* CAMPUS MODE */}
        {/* ================================================================ */}
        {mode === 'campus' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT CONTENT */}
            <div className="lg:col-span-8 space-y-6">

              {/* TAB NAV */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCampusTab(tab.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200"
                    style={campusTab === tab.id
                      ? { background: themeColor, color: '#fff', boxShadow: `0 4px 20px ${themeColor}55` }
                      : { color: '#475569' }
                    }
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT */}
              <div className="min-h-[500px]">
                
                {!studentInstId && (
                  <EmptyState text="You are not enrolled in any institution as a student." themeColor={themeColor} />
                )}

                {studentInstId && campusLoading && (
                  <div className="flex flex-col items-center justify-center py-40 rounded-3xl border border-dashed border-slate-800 bg-slate-900/10">
                    <div className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin mb-5"
                      style={{ borderColor: themeColor + '44', borderTopColor: 'transparent' }}>
                      <div className="w-full h-full rounded-full border-[3px] border-t-transparent animate-spin"
                        style={{ borderColor: 'transparent', borderTopColor: themeColor }} />
                    </div>
                    <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">Loading Campus Data...</p>
                  </div>
                )}

                {/* 1. OVERVIEW */}
                {studentInstId && !campusLoading && campusTab === 'overview' && (
                  <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* Vision card */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-8"
                      style={{background: 'linear-gradient(135deg, #0f172a, #0a0f1e)'}}>
                      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"
                        style={{background: themeColor + '15'}} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-6 rounded-full" style={{background: themeColor}} />
                          <h3 className="text-lg font-black uppercase tracking-tight">Institutional Vision</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-2xl">
                          {activeInst?.vision || "Empowering students through excellence in education and innovation."}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <InfoTile icon={<Map size={16}/>} label="Location" value={activeInst?.contact?.address} themeColor={themeColor}/>
                          <InfoTile icon={<Mail size={16}/>} label="Official Email" value={activeInst?.contact?.email} themeColor={themeColor}/>
                          <InfoTile icon={<Phone size={16}/>} label="Phone" value={activeInst?.contact?.phone} themeColor={themeColor}/>
                          <InfoTile icon={<Calendar size={16}/>} label="Academic Year" value="2024-2025" themeColor={themeColor}/>
                        </div>
                      </div>
                    </div>

                    {/* Achievements */}
                    {activeInst?.achievements?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeInst.achievements.slice(0, 2).map((ach, i) => (
                          <div key={i} className="relative overflow-hidden rounded-2xl p-6 border border-amber-500/10 group hover:border-amber-500/30 transition-all"
                            style={{background: 'linear-gradient(135deg, #1a1200, #0a0f1e)'}}>
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] bg-amber-500/10 group-hover:bg-amber-500/20 transition-all" />
                            <Trophy className="text-amber-500 mb-3 relative z-10" size={22}/>
                            <h4 className="font-black text-white text-sm mb-1 relative z-10">{ach.title}</h4>
                            <p className="text-[10px] text-amber-600/80 font-black uppercase tracking-widest relative z-10">{ach.year}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. FEED / NOTICES */}
                {studentInstId && !campusLoading && campusTab === 'feed' && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    {dashboardData.notices.map((n, idx) => (
                      <div key={n._id}
                        className="group relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 transition-all hover:border-white/[0.12]"
                        style={{background: 'linear-gradient(135deg, #0f172a, #0a0f1e)'}}>
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full"
                          style={{background: `linear-gradient(to bottom, ${themeColor}, ${themeColor}00)`}} />
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                            style={{background: themeColor + '10', borderColor: themeColor + '30', color: themeColor}}>
                            {n.category || "General"}
                          </span>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock size={10}/>
                            <span className="text-[9px] font-bold uppercase tracking-wider">{new Date(n.createdAt).toDateString()}</span>
                          </div>
                        </div>
                        <h4 className="text-base font-black text-white group-hover:text-slate-200 transition-colors leading-snug mb-2">
                          {n.title}
                        </h4>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{n.content}</p>
                      </div>
                    ))}
                    {dashboardData.notices.length === 0 && <EmptyState text="The bulletin board is empty." themeColor={themeColor}/>}
                  </div>
                )}

                {/* 3. RESULTS */}
                {studentInstId && !campusLoading && campusTab === 'results' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    {dashboardData.results.map(r => {
                      const pct = parseFloat(r.percentage || r.marks || 0);
                      const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : '#ef4444';
                      return (
                        <div key={r._id}
                          className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 hover:border-white/[0.1] transition-all"
                          style={{background: 'linear-gradient(135deg, #0f172a, #0a0f1e)'}}>
                          <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full blur-[60px]" style={{background: color + '15'}} />
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h4 className="font-black text-white text-sm uppercase leading-snug mb-2">{r.examName}</h4>
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/5 text-slate-500">
                                {r.status || 'Published'}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-3xl font-black tabular-nums leading-none" style={{color}}>
                                {pct.toFixed(1)}
                                <span className="text-lg">%</span>
                              </p>
                              <p className="text-[9px] text-slate-600 font-black uppercase mt-1">Score</p>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-4 h-1 rounded-full bg-white/[0.05]">
                            <div className="h-full rounded-full transition-all duration-700" style={{width: `${Math.min(pct, 100)}%`, background: color}} />
                          </div>
                        </div>
                      );
                    })}
                    {dashboardData.results.length === 0 && <EmptyState text="No results published yet." themeColor={themeColor}/>}
                  </div>
                )}

                {/* 4. FEES */}
                {studentInstId && !campusLoading && campusTab === 'fees' && (
                  <div className="space-y-2.5 animate-in fade-in duration-300">
                    {dashboardData.fees.map((f, i) => (
                      <div key={f._id}
                        className="group flex items-center justify-between p-5 rounded-2xl border border-white/[0.06] hover:border-emerald-500/20 transition-all"
                        style={{background: 'linear-gradient(135deg, #0f172a, #0a0f1e)'}}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all">
                            <DollarSign size={16} className="text-emerald-400"/>
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{f.category || f.note || 'Monthly Tuition Fee'}</h4>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                              <Clock size={8}/>
                              {new Date(f.date || f.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-emerald-400">৳{f.amount?.toLocaleString()}</span>
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle size={12} className="text-emerald-500"/>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dashboardData.fees.length === 0 && <EmptyState text="All clear! No pending or past fees recorded." themeColor={themeColor}/>}
                  </div>
                )}

                {/* 5. FACULTY */}
                {studentInstId && !campusLoading && campusTab === 'faculty' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    {activeInst?.teachers?.map((t, i) => (
                      <div key={i}
                        className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
                        style={{background: 'linear-gradient(135deg, #0f172a, #0a0f1e)'}}>
                        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/[0.07]"
                          style={{background: '#0a0f1e'}}>
                          {t.image
                            ? <img src={t.image} className="w-full h-full object-cover" alt="teacher"/>
                            : <div className="w-full h-full flex items-center justify-center">
                                <UserIcon size={20} className="text-slate-600"/>
                              </div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-white text-sm truncate">{t.name}</h4>
                          <p className="text-[10px] font-black uppercase tracking-tighter truncate mt-0.5" style={{color: themeColor}}>
                            {t.designation}
                          </p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase truncate">{t.department}</p>
                        </div>
                      </div>
                    ))}
                    {(!activeInst?.teachers || activeInst.teachers.length === 0) && (
                      <EmptyState text="No faculty members added yet." themeColor={themeColor}/>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="lg:col-span-4 space-y-5">

              {/* CREDITS CARD */}
              {/* CREDITS CARD */}
<div className="relative overflow-hidden rounded-3xl p-8 text-center group"
    style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)', 
        border: `1px solid ${themeColor}30`
    }}
>
    {/* Glow Effect */}
    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{background: `radial-gradient(ellipse at 50% 120%, ${themeColor}15, transparent 70%)`}} 
    />
    
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px pointer-events-none"
        style={{background: `linear-gradient(90deg, transparent, ${themeColor}80, transparent)`}} 
    />

    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Campus Credit Balance</p>
    
    <div className="relative inline-block mb-3">
        <h2 className="text-7xl font-black tabular-nums leading-none relative z-10" style={{color: themeColor}}>
            {stats.credits}
        </h2>
        <div className="absolute inset-0 blur-2xl opacity-30" style={{background: themeColor, borderRadius: '50%'}} />
    </div>
    
    <p className="text-slate-600 text-[9px] uppercase font-bold tracking-widest mb-6">Total Credits Earned</p>
    
    {/* Link Component */}
    <Link 
        to="/tools/cgpa"
        className="relative z-20 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg"
        style={{
            backgroundColor: themeColor, 
            color: '#fff', 
            boxShadow: `0 8px 25px ${themeColor}40`
        }}
    >
        Update Results <ChevronRight size={14}/>
    </Link>
</div>

              {/* ACADEMIC TOOLKIT */}
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] px-1 mb-3">Academic Toolkit</p>
                <div className="space-y-2">
                  <ToolCard
                    title="Lab Report"
                    icon={<FileText size={18} className="text-pink-400"/>}
                    link="/tools/lab-gen"
                    accent="#ec4899"
                  />
                  <ToolCard
                    title="Roadmaps"
                    icon={<Sparkles size={18} className="text-amber-400"/>}
                    link="/roadmaps"
                    accent="#f59e0b"
                  />
                  <ToolCard
                    title="Campus Feed"
                    icon={<Globe size={18} className="text-indigo-400"/>}
                    link="/feed"
                    accent="#6366f1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================ */
/* SUBSIDIARY COMPONENTS */
/* ============================================================ */

const ToolCard = ({ title, icon, link, accent }) => (
  <Link to={link}
    className="group flex items-center justify-between p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
    style={{background: 'linear-gradient(135deg, #0f172a, #0a0f1e)'}}>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
        style={{background: accent + '15', border: `1px solid ${accent}25`}}>
        {icon}
      </div>
      <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors">
        {title}
      </span>
    </div>
    <ArrowUpRight size={14} className="text-slate-700 group-hover:text-slate-400 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
  </Link>
);

const InfoTile = ({ icon, label, value, themeColor }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.05] hover:border-white/[0.08] transition-all"
    style={{background: '#ffffff05'}}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{background: (themeColor || '#2563eb') + '15'}}>
      <span style={{color: themeColor || '#2563eb'}}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-slate-300 text-xs font-semibold truncate">{value || 'Not provided'}</p>
    </div>
  </div>
);

const EmptyState = ({ text, themeColor }) => (
  <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/[0.06]"
    style={{background: '#ffffff02'}}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
      style={{background: (themeColor || '#2563eb') + '10', border: `1px solid ${(themeColor || '#2563eb')}20`}}>
      <Sparkles size={22} style={{color: themeColor || '#2563eb'}} className="opacity-60"/>
    </div>
    <p className="text-slate-600 font-black uppercase tracking-widest text-[10px] text-center max-w-[220px] leading-relaxed">
      {text}
    </p>
  </div>
);

export default Dashboard;


