import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  Building2, PlusCircle, Users, Trophy, BookOpen,
  Send, DollarSign, Image as ImageIcon, X, Sparkles, CheckCircle, FileText,
  TrendingUp, Settings, ChevronRight, Zap, ArrowUpRight, Eye, Bell,
  LayoutGrid, GraduationCap, Wallet, Megaphone
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT = '#6366f1'; // indigo

const MyInstitution = () => {
  const { user, setUser } = useContext(AuthContext);

  const hasInstitution = user?.institutionRole === 'Admin' && user?.institution;
  const instId = typeof user?.institution === 'object' ? user?.institution?._id : user?.institution;

  const [view, setView] = useState(hasInstitution ? 'dashboard' : 'create');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const [instData, setInstData] = useState(null);
  const [notices, setNotices] = useState([]);
  const [batches, setBatches] = useState([]);
  const [finances, setFinances] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (hasInstitution && instId) {
      fetchDashboardData();
    }
  }, [hasInstitution, instId]);

  const fetchDashboardData = async () => {
    try {
      const instRes = await API.get(`${API_URL}/institution/my-managed`);
      setInstData(instRes.data);

      const [nRes, bRes, fRes] = await Promise.all([
        API.get(`${API_URL}/institution/${instId}/notices`).catch(() => ({ data: [] })),
        API.get(`${API_URL}/institution/${instId}/batches`).catch(() => ({ data: [] })),
        API.get(`${API_URL}/institution/finance/summary/${instId}`).catch(() => ({ data: { history: [] } }))
      ]);

      setNotices(nRes.data || []);
      setBatches(bRes.data || []);
      setFinances(fRes.data?.history || []);
    } catch (err) {
      console.error("Dashboard Fetch Error", err);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files.license) data.append('license', files.license);
    if (files.idCard) data.append('idCard', files.idCard);

    try {
      const res = await API.post('/institution/create', data);
      toast.success("Institution Created Successfully!");

      if (setUser) {
        const updatedUser = { ...user, institution: res.data.institution, institutionRole: 'Admin' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setTimeout(() => { window.location.reload(); }, 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Already created or Server Error");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = '';
      let payload = { ...formData, institutionId: instId };

      switch (modalType) {
        case 'notice': endpoint = "/institution/notice"; break;
        case 'batch': endpoint = "/institution/batch"; break;
        case 'teacher': endpoint = "/institution/teacher"; break;
        case 'achievement': endpoint = "/institution/achievement"; break;
        case 'finance':
          endpoint = formData.type === 'Income' ? '/institution/finance/collect-fee' : '/institution/finance/expense';
          break;
        case 'result':
          endpoint = "/institution/result/publish";
          payload.marks = [{ subject: formData.subject, obtainedMarks: Number(formData.marks), totalMarks: 100 }];
          break;
        default: return;
      }

      const response = await API.post(endpoint, payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(`${modalType.toUpperCase()} added!`);
        setIsModalOpen(false);
        setFormData({});
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    if (formData.vision) data.append('vision', formData.vision);
    if (formData.mission) data.append('mission', formData.mission);
    if (formData.themeColor) data.append('themeColor', formData.themeColor);
    if (files.logo) data.append('logo', files.logo);
    if (files.banner) data.append('banner', files.banner);

    try {
      await API.put('/institution/branding', data);
      toast.success("Settings updated successfully!");
      fetchDashboardData();
    } catch (err) {
      toast.error("Settings update failed.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => { setModalType(type); setFormData({}); setIsModalOpen(true); };

  // ============================================================
  // VIEW 1: CREATE INSTITUTION
  // ============================================================
  if (!hasInstitution) {
    return (
      <div className="w-full flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-2xl relative">
          {/* Ambient glow */}
          <div className="absolute inset-0 rounded-[48px] blur-3xl opacity-20" style={{ background: ACCENT }} />

          <div className="relative rounded-[40px] border border-white/[0.08] overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #0d1224 0%, #0a0f1e 100%)' }}>

            {/* Top accent line */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}80, transparent)` }} />

            <div className="p-10 md:p-14">
              {/* Icon + Title */}
              <div className="text-center mb-10">
                <div className="relative inline-flex mb-6">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-50" style={{ background: ACCENT }} />
                  <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center border"
                    style={{ background: ACCENT + '15', borderColor: ACCENT + '40' }}>
                    <Building2 size={32} style={{ color: ACCENT }} />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                  Launch Your <span style={{ color: ACCENT }}>Institution</span>
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-2 max-w-sm mx-auto">
                  Fill in the details below to generate your institutional portal.
                </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Institution Name">
                    <input className="inst-input" name="name" placeholder="e.g. Dhaka University" onChange={handleInputChange} required />
                  </Field>
                  <Field label="Institution Type">
                    <select className="inst-input" name="type" onChange={handleInputChange} required>
                      <option value="">Select Type</option>
                      <option value="Coaching">Coaching</option>
                      <option value="School">School</option>
                      <option value="College">College</option>
                      <option value="University">University</option>
                    </select>
                  </Field>
                  <Field label="Email Address">
                    <input className="inst-input" name="email" type="email" placeholder="admin@campus.edu" onChange={handleInputChange} required />
                  </Field>
                  <Field label="Contact Phone">
                    <input className="inst-input" name="phone" placeholder="+880 1XXX XXXXXX" onChange={handleInputChange} required />
                  </Field>
                </div>

                {/* Document upload */}
                <div className="relative rounded-3xl border-2 border-dashed border-white/[0.08] p-8 text-center hover:border-white/[0.14] transition-colors">

                  {/* এখানে pointer-events-none যোগ করা হয়েছে */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 100%, ${ACCENT}08, transparent 70%)` }} />

                  <FileText size={22} className="mx-auto mb-3 opacity-30 text-white" />

                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                    {formData.type === 'Coaching' ? "Upload Owner NID / ID Card" : "Upload Govt. License & EIIN Number"}
                  </p>

                  {formData.type !== 'Coaching' && (
                    <input
                      className="inst-input mb-4 max-w-xs mx-auto block relative z-10" // z-10 নিরাপত্তা নিশ্চিত করে
                      name="eiinNumber"
                      placeholder="EIIN Number"
                      onChange={handleInputChange}
                    />
                  )}

                  <input
                    type="file"
                    name={formData.type === 'Coaching' ? 'idCard' : 'license'}
                    onChange={handleFileChange}
                    // এখানে relative z-10 যোগ করা হয়েছে যাতে এটি সবার উপরে থাকে
                    className="relative z-10 text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider cursor-pointer"
                    style={{ '--file-bg': ACCENT + '15', '--file-color': ACCENT }}
                    required
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-5 rounded-2xl font-black uppercase text-sm tracking-[0.15em] text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #4f46e5)`, boxShadow: `0 12px 30px ${ACCENT}40` }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Ecosystem...</>
                    : <><Zap size={16} /> Launch Institution</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        <InstStyles />
      </div>
    );
  }

  // ============================================================
  // VIEW 2: ADMIN DASHBOARD
  // ============================================================
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid size={13} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={13} /> },
    { id: 'faculty', label: 'Faculty', icon: <Users size={13} /> },
    { id: 'batches', label: 'Batches', icon: <GraduationCap size={13} /> },
    { id: 'finance', label: 'Finance', icon: <Wallet size={13} /> },
    { id: 'notices', label: 'Notices', icon: <Megaphone size={13} /> },
  ];

  const actions = [
    { type: 'notice', label: 'Post Notice', icon: <Send size={16} />, accent: '#3b82f6' },
    { type: 'batch', label: 'New Batch', icon: <BookOpen size={16} />, accent: '#a855f7' },
    { type: 'teacher', label: 'Add Teacher', icon: <Users size={16} />, accent: '#6366f1' },
    { type: 'finance', label: 'Finance Entry', icon: <DollarSign size={16} />, accent: '#22c55e' },
    { type: 'result', label: 'Publish Result', icon: <FileText size={16} />, accent: '#ef4444' },
    { type: 'achievement', label: 'Achievement', icon: <Trophy size={16} />, accent: '#f59e0b' },
  ];

  return (
    <div className="w-full space-y-6">

      {/* INSTITUTION HEADER CARD */}
      <div className="relative overflow-hidden rounded-[36px] border border-white/[0.07]"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #0a0f1e 100%)' }}>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background: instData?.themeColor || ACCENT, transform: 'translate(30%, -30%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute bottom-0 right-8 opacity-[0.04]"><Building2 size={180} /></div>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border"
              style={{ background: '#0a0f1e', borderColor: (instData?.themeColor || ACCENT) + '40' }}>
              {instData?.logo
                ? <img src={instData.logo} alt="logo" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="text-slate-700" size={32} />
                </div>}
              <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a0f1e]"
                style={{ background: instData?.themeColor || ACCENT }} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle size={9} /> Verified
                </span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                  {instData?.referralCode}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">
                {instData?.name || "Loading..."}
              </h1>
              <p className="text-slate-500 text-xs font-semibold mt-1.5 uppercase tracking-wider">
                {instData?.type} &nbsp;·&nbsp; Admin Portal
              </p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center gap-3">
            {[
              { label: 'Faculty', value: instData?.teachers?.length || 0 },
              { label: 'Batches', value: batches.length },
              { label: 'Notices', value: notices.length },
            ].map((s, i) => (
              <div key={i} className="text-center px-5 py-3 rounded-2xl border border-white/[0.06]"
                style={{ background: '#ffffff05' }}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* QUICK ACTIONS SIDEBAR */}
        <div className="lg:col-span-3 space-y-2.5">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] px-1 mb-3">Quick Deploy</p>
          {actions.map(a => (
            <button key={a.type} onClick={() => openModal(a.type)}
              className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all text-left"
              style={{ background: 'linear-gradient(135deg, #0f172a, #0a0f1e)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                style={{ background: a.accent + '15', border: `1px solid ${a.accent}25`, color: a.accent }}>
                {a.icon}
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors flex-1">
                {a.label}
              </span>
              <ChevronRight size={12} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}
        </div>

        {/* MAIN MANAGEMENT PANEL */}
        <div className="lg:col-span-9 rounded-[32px] border border-white/[0.07] overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #0d1224, #0a0f1e)' }}>

          {/* TABS */}
          <div className="flex items-center gap-1 p-4 border-b border-white/[0.05] overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all"
                style={activeTab === tab.id
                  ? { background: ACCENT, color: '#fff', boxShadow: `0 4px 16px ${ACCENT}50` }
                  : { color: '#475569' }
                }>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB BODY */}
          <div className="p-8 min-h-[500px]">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Faculty', value: instData?.teachers?.length || 0, color: ACCENT },
                    { label: 'Active Batches', value: batches.length, color: '#22c55e' },
                    { label: 'Total Notices', value: notices.length, color: '#f59e0b' },
                  ].map((s, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl p-6 text-center border border-white/[0.05]"
                      style={{ background: '#ffffff03' }}>
                      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
                        style={{ background: `radial-gradient(ellipse at 50% 100%, ${s.color}10, transparent 70%)` }} />
                      <p className="text-4xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/[0.05] p-7"
                  style={{ background: '#ffffff03' }}>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1 h-5 rounded-full" style={{ background: ACCENT }} />
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Vision & Mission</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Vision</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{instData?.vision || 'Not set yet.'}</p>
                    </div>
                    <div className="h-px bg-white/[0.05]" />
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Mission</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{instData?.mission || 'Not set yet.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSettingsUpdate} className="space-y-5 max-w-2xl animate-in fade-in duration-300">
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Update Logo">
                    <input type="file" name="logo" onChange={handleFileChange} className="inst-input" />
                  </Field>
                  <Field label="Update Banner">
                    <input type="file" name="banner" onChange={handleFileChange} className="inst-input" />
                  </Field>
                </div>
                <Field label="Institution Vision">
                  <textarea name="vision" defaultValue={instData?.vision} onChange={handleInputChange}
                    className="inst-input" style={{ minHeight: '100px', resize: 'vertical' }} />
                </Field>
                <Field label="Institution Mission">
                  <textarea name="mission" defaultValue={instData?.mission} onChange={handleInputChange}
                    className="inst-input" style={{ minHeight: '100px', resize: 'vertical' }} />
                </Field>
                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #4f46e5)`, boxShadow: `0 8px 24px ${ACCENT}35` }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                    : <><CheckCircle size={15} /> Save Settings</>}
                </button>
              </form>
            )}

            {/* FACULTY */}
            {activeTab === 'faculty' && (
              <div className="grid md:grid-cols-2 gap-3 animate-in fade-in duration-300">
                {instData?.teachers?.map((t, i) => (
                  <div key={i} className="group flex items-center gap-4 p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
                    style={{ background: '#ffffff03' }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-lg border"
                      style={{ background: ACCENT + '15', borderColor: ACCENT + '25', color: ACCENT }}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-white text-sm truncate">{t.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-tighter truncate mt-0.5" style={{ color: ACCENT }}>{t.designation}</p>
                      {t.department && <p className="text-[9px] text-slate-600 font-bold uppercase truncate">{t.department}</p>}
                    </div>
                  </div>
                ))}
                {!instData?.teachers?.length && <MiniEmpty text="No faculty added yet." />}
              </div>
            )}

            {/* BATCHES */}
            {activeTab === 'batches' && (
              <div className="grid md:grid-cols-2 gap-3 animate-in fade-in duration-300">
                {batches.map((b, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                    style={{ background: '#ffffff03' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                        style={{ background: '#a855f715', color: '#a855f7' }}>
                        Batch
                      </span>
                      {b.section && (
                        <span className="text-[9px] text-slate-600 font-bold uppercase">{b.section}</span>
                      )}
                    </div>
                    <h4 className="font-black text-white text-base mt-1">{b.name}</h4>
                    {b.class && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Year / Class: {b.class}</p>}
                  </div>
                ))}
                {!batches.length && <MiniEmpty text="No batches created yet." />}
              </div>
            )}

            {/* FINANCE */}
            {activeTab === 'finance' && (
              <div className="space-y-2.5 animate-in fade-in duration-300">
                {finances.map((f, i) => {
                  const isIncome = f.type === 'Income';
                  return (
                    <div key={i} className="group flex items-center justify-between p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                      style={{ background: '#ffffff03' }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: isIncome ? '#22c55e15' : '#ef444415' }}>
                          <DollarSign size={15} style={{ color: isIncome ? '#22c55e' : '#ef4444' }} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{f.category}</h4>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                            {new Date(f.date || f.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-lg" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
                          {isIncome ? '+' : '-'} ৳{f.amount?.toLocaleString()}
                        </p>
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-lg"
                          style={{ background: isIncome ? '#22c55e15' : '#ef444415', color: isIncome ? '#22c55e' : '#ef4444' }}>
                          {f.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {!finances.length && <MiniEmpty text="No financial records yet." />}
              </div>
            )}

            {/* NOTICES */}
            {activeTab === 'notices' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {notices.map((n, i) => (
                  <div key={i} className="relative overflow-hidden p-6 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                    style={{ background: '#ffffff03' }}>
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: ACCENT }} />
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-black text-white text-sm flex-1">{n.title}</h4>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex-shrink-0"
                        style={{ background: ACCENT + '15', color: ACCENT }}>
                        {n.category || 'General'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{n.content}</p>
                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-wider mt-3">
                      {new Date(n.createdAt).toDateString()}
                    </p>
                  </div>
                ))}
                {!notices.length && <MiniEmpty text="No notices posted yet." />}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
            {/* Glow */}
            <div className="absolute inset-0 rounded-[40px] blur-2xl opacity-20" style={{ background: ACCENT }} />

            <div className="relative rounded-[36px] border border-white/[0.08] overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #0d1224, #0a0f1e)' }}>
              {/* Top accent */}
              <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}80, transparent)` }} />

              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Add New</p>
                    <h2 className="text-2xl font-black text-white uppercase capitalize"
                      style={{ WebkitTextFillColor: 'white' }}>
                      <span style={{ color: ACCENT }}>{modalType}</span>
                    </h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.08] text-slate-500 hover:text-white hover:border-white/[0.16] transition-all">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-4">
                  {modalType === 'notice' && (<>
                    <input className="inst-input" name="title" placeholder="Notice Title" onChange={handleInputChange} required />
                    <textarea className="inst-input" name="content" placeholder="Content details..." onChange={handleInputChange} required style={{ minHeight: '110px', resize: 'vertical' }} />
                    <select className="inst-input" name="category" onChange={handleInputChange}>
                      <option value="General">General</option>
                      <option value="Exam">Exam</option>
                    </select>
                  </>)}

                  {modalType === 'teacher' && (<>
                    <input className="inst-input" name="name" placeholder="Teacher's Full Name" onChange={handleInputChange} required />
                    <input className="inst-input" name="designation" placeholder="Designation (e.g. Lecturer)" onChange={handleInputChange} required />
                    <input className="inst-input" name="department" placeholder="Department (Optional)" onChange={handleInputChange} />
                  </>)}

                  {modalType === 'batch' && (<>
                    <input className="inst-input" name="name" placeholder="Batch Name (e.g. HSC 2026)" onChange={handleInputChange} required />
                    <input className="inst-input" name="class" type="number" placeholder="Class / Year (Numeric)" onChange={handleInputChange} required />
                    <input className="inst-input" name="section" placeholder="Section / Shift" onChange={handleInputChange} />
                  </>)}

                  {modalType === 'finance' && (<>
                    <select className="inst-input" name="type" onChange={handleInputChange} required>
                      <option value="">Select Type</option>
                      <option value="Income">Income (+)</option>
                      <option value="Expense">Expense (-)</option>
                    </select>
                    <input className="inst-input" name="amount" type="number" placeholder="Amount (BDT)" onChange={handleInputChange} required />
                    <input className="inst-input" name="category" placeholder="Category (e.g. Rent, Fee)" onChange={handleInputChange} required />
                  </>)}

                  {modalType === 'achievement' && (<>
                    <input className="inst-input" name="title" placeholder="Achievement Title" onChange={handleInputChange} required />
                    <input className="inst-input" name="year" placeholder="Year (e.g. 2024)" onChange={handleInputChange} required />
                    <textarea className="inst-input" name="description" placeholder="Description" onChange={handleInputChange} style={{ minHeight: '90px', resize: 'vertical' }} />
                  </>)}

                  {modalType === 'result' && (<>
                    <input className="inst-input" name="studentId" placeholder="Student ID (Object ID)" onChange={handleInputChange} required />
                    <input className="inst-input" name="batchId" placeholder="Batch ID (Object ID)" onChange={handleInputChange} required />
                    <input className="inst-input" name="examName" placeholder="Exam Name (e.g. Mid Term)" onChange={handleInputChange} required />
                    <input className="inst-input" name="subject" placeholder="Subject Name" onChange={handleInputChange} required />
                    <input className="inst-input" name="marks" type="number" placeholder="Marks Obtained (out of 100)" onChange={handleInputChange} required />
                  </>)}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, #4f46e5)`, boxShadow: `0 8px 24px ${ACCENT}40` }}>
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                      : <><CheckCircle size={15} /> Save {modalType}</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <InstStyles />
    </div>
  );
};

/* ============================================================ */
/* HELPERS */
/* ============================================================ */

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
    {children}
  </div>
);

const MiniEmpty = ({ text }) => (
  <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
    <Sparkles size={24} className="text-slate-800 mb-3" />
    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{text}</p>
  </div>
);

const InstStyles = () => (
  <style>{`
    .inst-input {
      width: 100%;
      background: #0a0f1e;
      border: 1px solid rgba(255,255,255,0.07);
      color: white;
      padding: 16px 20px;
      border-radius: 16px;
      outline: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .inst-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    }
    .inst-input::placeholder { color: #334155; }
    select.inst-input option { background-color: #0a0f1e; color: white; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `}</style>
);

export default MyInstitution;
