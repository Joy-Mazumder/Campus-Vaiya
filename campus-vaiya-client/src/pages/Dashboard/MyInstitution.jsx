import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  Building2, PlusCircle, Users, Trophy, BookOpen,
  Send, DollarSign, X, Sparkles, CheckCircle, FileText,
  TrendingUp, Settings, ChevronRight, Zap, ArrowUpRight,
  LayoutGrid, GraduationCap, Wallet, Megaphone, Quote,
  History, Info, Star, Layers, FlaskConical, Heart, Upload,
  BookMarked, Trash2, Plus, ChevronDown
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;
const ACCENT = '#6366f1';

const AUTHORITY_CATEGORIES = [
  'Vice Chancellor',
  'Pro Vice-Chancellor',
  'Chairman',
  'Director',
  'Dean',
  'Principal',
  'Head of Department',
  'Registrar',
  'Treasurer',
  'Professor',
  'Founder',
  'Alumni',
  'Faculty',
  'Honorary',
  'Staff',
  'Other',
];

const CATEGORY_COLORS = {
  'Vice Chancellor': '#f59e0b',
  'Pro Vice-Chancellor': '#f97316',
  'Chairman': '#6366f1',
  'Director': '#0ea5e9',
  'Dean': '#10b981',
  'Principal': '#ec4899',
  'Head of Department': '#06b6d4',
  'Registrar': '#a855f7',
  'Treasurer': '#22c55e',
  'Professor': '#6366f1',
  'Founder': '#a855f7',
  'Alumni': '#06b6d4',
  'Faculty': '#6366f1',
  'Honorary': '#f97316',
  'Staff': '#94a3b8',
  'Other': '#94a3b8',
};

const MyInstitution = () => {
  const { user, setUser } = useContext(AuthContext);

  const hasInstitution = user?.institutionRole === 'Admin' && user?.institution;
  const instId = typeof user?.institution === 'object' ? user?.institution?._id : user?.institution;

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const [instData, setInstData] = useState(null);
  const [notices, setNotices] = useState([]);
  const [batches, setBatches] = useState([]);
  const [finances, setFinances] = useState([]);
  const [personalities, setPersonalities] = useState([]);

  /* ── Department management state ── */
  const [departments, setDepartments] = useState([]);
  const [expandedAdminDept, setExpandedAdminDept] = useState(null);
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', description: '', established: '' });
  const [deptLoading, setDeptLoading] = useState(false);
  const [showSubForms, setShowSubForms] = useState({});
  const [subForms, setSubForms] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});
  const [personalityImagePreview, setPersonalityImagePreview] = useState(null);

  useEffect(() => {
    if (hasInstitution && instId) {
      fetchDashboardData();
    }
  }, [hasInstitution, instId]);

  const fetchDashboardData = async () => {
    try {
      const instRes = await API.get(`${API_URL}/institution/my-managed`);
      setInstData(instRes.data);
      setDepartments(instRes.data?.departments || []);

      const [nRes, bRes, fRes, pRes] = await Promise.all([
        API.get(`${API_URL}/institution/${instId}/notices`).catch(() => ({ data: [] })),
        API.get(`${API_URL}/institution/${instId}/batches`).catch(() => ({ data: [] })),
        API.get(`${API_URL}/institution/finance/summary/${instId}`).catch(() => ({ data: { history: [] } })),
        API.get(`${API_URL}/institution/${instId}/personalities`).catch(() => ({ data: [] }))
      ]);

      setNotices(nRes.data || []);
      setBatches(bRes.data || []);
      setFinances(fRes.data?.history || []);
      setPersonalities(pRes.data || []);
    } catch (err) {
      console.error('Dashboard Fetch Error', err);
    }
  };

  /* ── Department API handlers ── */
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) return;
    setDeptLoading(true);
    try {
      const res = await API.post('/institution/departments', deptForm);
      setDepartments(prev => [...prev, res.data]);
      setDeptForm({ name: '', description: '', established: '' });
      setShowDeptForm(false);
      toast.success('Department added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add department.');
    } finally {
      setDeptLoading(false);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm('Delete this department and all its sections?')) return;
    try {
      await API.delete(`/institution/departments/${deptId}`);
      setDepartments(prev => prev.filter(d => d._id !== deptId));
      toast.success('Department deleted.');
    } catch (err) {
      toast.error('Failed to delete department.');
    }
  };

  const handleAddSubcategory = async (e, deptId) => {
    e.preventDefault();
    const form = subForms[deptId] || {};
    if (!form.title?.trim()) return;
    setDeptLoading(true);
    try {
      const res = await API.post(`/institution/departments/${deptId}/subcategories`, form);
      setDepartments(prev => prev.map(d => d._id === deptId ? res.data : d));
      setSubForms(prev => ({ ...prev, [deptId]: { title: '', content: '' } }));
      setShowSubForms(prev => ({ ...prev, [deptId]: false }));
      toast.success('Section added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add section.');
    } finally {
      setDeptLoading(false);
    }
  };

  const handleDeleteSubcategory = async (deptId, subId) => {
    try {
      await API.delete(`/institution/departments/${deptId}/subcategories/${subId}`);
      setDepartments(prev =>
        prev.map(d => d._id === deptId
          ? { ...d, subcategories: d.subcategories.filter(s => s._id !== subId) }
          : d
        )
      );
      toast.success('Section removed.');
    } catch (err) {
      toast.error('Failed to remove section.');
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles({ ...files, [e.target.name]: file });
    if (e.target.name === 'personalityImage') {
      const reader = new FileReader();
      reader.onloadend = () => setPersonalityImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files.license) data.append('license', files.license);
    if (files.idCard) data.append('idCard', files.idCard);
    try {
      const res = await API.post('/institution/create', data);
      toast.success('Institution Created Successfully!');
      if (setUser) {
        const updatedUser = { ...user, institution: res.data.institution, institutionRole: 'Admin' };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setTimeout(() => { window.location.reload(); }, 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already created or Server Error');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = '';
      let payload = formData;
      let isMultipart = false;

      switch (modalType) {
        case 'notice': endpoint = '/institution/notice'; break;
        case 'batch': endpoint = '/institution/batch'; break;
        case 'teacher': endpoint = '/institution/teacher'; break;
        case 'achievement': endpoint = '/institution/achievement'; break;
        case 'finance':
          endpoint = formData.type === 'Income' ? '/institution/finance/collect-fee' : '/institution/finance/expense';
          break;
        case 'result':
          endpoint = '/institution/result/publish';
          payload = {
            ...formData,
            marks: [{ subject: formData.subject, obtainedMarks: Number(formData.marks), totalMarks: 100 }]
          };
          break;
        case 'personality':
          endpoint = '/institution/personality';
          isMultipart = true;
          break;
        default: return;
      }

      let response;
      if (isMultipart) {
        const fd = new FormData();
        Object.keys(formData).forEach(key => formData[key] && fd.append(key, formData[key]));
        if (files.personalityImage) fd.append('image', files.personalityImage);
        response = await API.post(endpoint, fd);
      } else {
        response = await API.post(endpoint, { ...payload, institutionId: instId });
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} added!`);
        setIsModalOpen(false);
        setFormData({});
        setFiles({});
        setPersonalityImagePreview(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    const textFields = ['vision','mission','themeColor','history','alumniHistory','admissionInfo','foundedYear','studentLife','research'];
    textFields.forEach(f => { if (formData[f] !== undefined) data.append(f, formData[f]); });
    if (files.logo) data.append('logo', files.logo);
    if (files.banner) data.append('banner', files.banner);
    try {
      await API.put('/institution/branding', data);
      toast.success('Settings updated!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Settings update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePersonality = async (id) => {
    try {
      await API.delete(`/institution/personality/${id}`);
      toast.success('Removed successfully.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to remove.');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setFormData({});
    setFiles({});
    setPersonalityImagePreview(null);
    setIsModalOpen(true);
  };

  const accent = instData?.themeColor || ACCENT;

  /* ============================================================ */
  /* VIEW: CREATE INSTITUTION                                      */
  /* ============================================================ */
  if (!hasInstitution) {
    return (
      <div className="w-full flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-2xl relative">
          <div className="absolute inset-0 rounded-[48px] blur-3xl opacity-12" style={{ background: ACCENT }} />
          <div className="relative rounded-[36px] border border-white/[0.07] overflow-hidden"
            style={{ background: 'linear-gradient(160deg,#0d1526,#0a0f1e)' }}>
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg,transparent,${ACCENT}80,transparent)` }} />
            <div className="p-10 md:p-14">
              <div className="text-center mb-10">
                <div className="relative inline-flex mb-6">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-35" style={{ background: ACCENT }} />
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
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Institution Name">
                    <input className="inst-input" name="name" placeholder="e.g. Dhaka University" onChange={handleInputChange} required />
                  </Field>
                  <Field label="Institution Type">
                    <select className="inst-input" name="type" onChange={handleInputChange} required>
                      <option value="">Select Type</option>
                      <option>Coaching</option>
                      <option>School</option>
                      <option>College</option>
                      <option>University</option>
                    </select>
                  </Field>
                  <Field label="Email Address">
                    <input className="inst-input" name="email" type="email" placeholder="admin@campus.edu" onChange={handleInputChange} required />
                  </Field>
                  <Field label="Contact Phone">
                    <input className="inst-input" name="phone" placeholder="+880 1XXX XXXXXX" onChange={handleInputChange} required />
                  </Field>
                </div>

                <div className="relative rounded-3xl border-2 border-dashed border-white/[0.08] p-8 text-center hover:border-white/[0.14] transition-colors">
                  <Upload size={22} className="mx-auto mb-3 opacity-25 text-white" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                    {formData.type === 'Coaching' ? 'Upload Owner NID / ID Card' : 'Upload Govt. License Document'}
                  </p>
                  {formData.type !== 'Coaching' && (
                    <input className="inst-input mb-4 max-w-xs mx-auto block" name="eiinNumber" placeholder="EIIN Number (if applicable)" onChange={handleInputChange} />
                  )}
                  <input type="file" name={formData.type === 'Coaching' ? 'idCard' : 'license'} onChange={handleFileChange}
                    className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:bg-white/5 file:text-slate-300 cursor-pointer" required />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-5 rounded-2xl font-black uppercase text-sm tracking-[0.15em] text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  style={{ background: `linear-gradient(135deg,${ACCENT},#4f46e5)`, boxShadow: `0 12px 30px ${ACCENT}40` }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
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

  /* ============================================================ */
  /* VIEW: ADMIN DASHBOARD                                         */
  /* ============================================================ */
  const tabs = [
    { id: 'overview',      label: 'Overview',     icon: <LayoutGrid size={13} /> },
    { id: 'settings',      label: 'Settings',     icon: <Settings size={13} /> },
    { id: 'departments',   label: 'Departments',  icon: <Layers size={13} /> },
    { id: 'faculty',       label: 'Faculty',      icon: <Users size={13} /> },
    { id: 'batches',       label: 'Batches',      icon: <GraduationCap size={13} /> },
    { id: 'finance',       label: 'Finance',      icon: <Wallet size={13} /> },
    { id: 'notices',       label: 'Notices',      icon: <Megaphone size={13} /> },
    { id: 'personalities', label: 'Authorities',  icon: <Quote size={13} /> },
  ];

  const actions = [
    { type: 'notice',      label: 'Post Notice',        icon: <Send size={15} />,        accent: '#3b82f6' },
    { type: 'batch',       label: 'New Batch',          icon: <BookOpen size={15} />,    accent: '#a855f7' },
    { type: 'teacher',     label: 'Add Teacher',        icon: <Users size={15} />,       accent: '#6366f1' },
    { type: 'finance',     label: 'Finance Entry',      icon: <DollarSign size={15} />,  accent: '#22c55e' },
    { type: 'result',      label: 'Publish Result',     icon: <FileText size={15} />,    accent: '#ef4444' },
    { type: 'achievement', label: 'Achievement',        icon: <Trophy size={15} />,      accent: '#f59e0b' },
    { type: 'personality', label: 'Add Authority',      icon: <Quote size={15} />,       accent: '#a855f7' },
  ];

  const DEPT_COLORS = ['#818cf8','#f472b6','#38bdf8','#34d399','#fbbf24','#c084fc','#f87171','#22d3ee'];

  return (
    <div className="w-full space-y-5">

      {/* INSTITUTION HEADER */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07]"
        style={{ background: 'linear-gradient(160deg,#0d1526,#0a0f1e)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[140px] opacity-18 pointer-events-none" style={{ background: accent, transform: 'translate(30%,-30%)' }} />
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: '#ec4899', transform: 'translate(-30%,-30%)' }} />
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 p-7 md:p-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border" style={{ background: '#0a0f1e', borderColor: accent + '45' }}>
              {instData?.logo
                ? <img src={instData.logo} alt="logo" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Building2 className="text-slate-700" size={28} /></div>}
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full border-2 border-[#0a0f1e]" style={{ background: accent }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle size={9} /> Verified
                </span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{instData?.referralCode}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-none">
                {instData?.name || 'Loading...'}
              </h1>
              <p className="text-slate-500 text-xs font-semibold mt-1 uppercase tracking-wider">
                {instData?.type} · Admin Portal{instData?.foundedYear && ` · Est. ${instData.foundedYear}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Faculty',     value: instData?.teachers?.length || 0, color: '#6366f1' },
              { label: 'Batches',     value: batches.length,                  color: '#a855f7' },
              { label: 'Notices',     value: notices.length,                  color: '#0ea5e9' },
              { label: 'Departments', value: departments.length,              color: '#34d399' },
              { label: 'Authorities', value: personalities.length,            color: '#ec4899' },
            ].map((s, i) => (
              <div key={i} className="text-center px-4 py-2.5 rounded-2xl border border-white/[0.06]"
                style={{ background: 'rgba(255,255,255,0.025)' }}>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* QUICK ACTIONS */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] px-1 mb-3">Quick Deploy</p>
          {actions.map(a => (
            <button key={a.type} onClick={() => openModal(a.type)}
              className="w-full group flex items-center gap-3 p-3.5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all text-left"
              style={{ background: 'linear-gradient(135deg,#0d1526,#0a0f1e)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                style={{ background: a.accent + '15', border: `1px solid ${a.accent}25`, color: a.accent }}>
                {a.icon}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors flex-1">{a.label}</span>
              <ChevronRight size={11} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}
        </div>

        {/* MANAGEMENT PANEL */}
        <div className="lg:col-span-9 rounded-[24px] border border-white/[0.07] overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#0d1526,#0a0f1e)' }}>

          {/* TABS */}
          <div className="flex items-center gap-1 p-3.5 border-b border-white/[0.05] overflow-x-auto no-scrollbar">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all"
                style={activeTab === tab.id
                  ? { background: `linear-gradient(135deg,${accent},${accent}bb)`, color: '#fff', boxShadow: `0 4px 16px ${accent}50` }
                  : { color: '#475569' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB BODY */}
          <div className="p-7 min-h-[500px]">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Faculty',    value: instData?.teachers?.length || 0, color: '#6366f1' },
                    { label: 'Active Batches',   value: batches.length,                  color: '#22c55e' },
                    { label: 'Total Notices',    value: notices.length,                  color: '#f59e0b' },
                    { label: 'Authorities',      value: personalities.length,            color: '#ec4899' },
                  ].map((s, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl p-5 text-center border border-white/[0.05] hover:border-white/[0.08] transition-all"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at 50% 100%,${s.color}10,transparent 70%)` }} />
                      <p className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <MiniInfoBlock accent="#6366f1" icon={<Star size={13} />} title="Vision">
                    <p className="text-slate-400 text-sm leading-relaxed">{instData?.vision || <em className="text-slate-700 text-xs">Not set.</em>}</p>
                  </MiniInfoBlock>
                  <MiniInfoBlock accent="#ec4899" icon={<TrendingUp size={13} />} title="Mission">
                    <p className="text-slate-400 text-sm leading-relaxed">{instData?.mission || <em className="text-slate-700 text-xs">Not set.</em>}</p>
                  </MiniInfoBlock>
                  {instData?.history && (
                    <MiniInfoBlock accent="#f59e0b" icon={<History size={13} />} title="History">
                      <p className="text-slate-400 text-sm leading-relaxed">{instData.history}</p>
                    </MiniInfoBlock>
                  )}
                  {instData?.alumniHistory && (
                    <MiniInfoBlock accent="#10b981" icon={<GraduationCap size={13} />} title="Alumni Legacy">
                      <p className="text-slate-400 text-sm leading-relaxed">{instData.alumniHistory}</p>
                    </MiniInfoBlock>
                  )}
                  {instData?.admissionInfo && (
                    <MiniInfoBlock accent="#0ea5e9" icon={<Info size={13} />} title="Admission Info">
                      <p className="text-slate-400 text-sm leading-relaxed">{instData.admissionInfo}</p>
                    </MiniInfoBlock>
                  )}
                  {instData?.studentLife && (
                    <MiniInfoBlock accent="#a855f7" icon={<Heart size={13} />} title="Student Life">
                      <p className="text-slate-400 text-sm leading-relaxed">{instData.studentLife}</p>
                    </MiniInfoBlock>
                  )}
                  {instData?.research && (
                    <MiniInfoBlock accent="#06b6d4" icon={<FlaskConical size={13} />} title="Research">
                      <p className="text-slate-400 text-sm leading-relaxed">{instData.research}</p>
                    </MiniInfoBlock>
                  )}
                </div>

                {instData?.achievements?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-0.5 h-4 rounded-full bg-amber-500" />
                      <p className="text-[11px] font-black text-white uppercase tracking-widest">Achievements</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {instData.achievements.map((ach, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/15 hover:border-amber-500/30 transition-all"
                          style={{ background: 'rgba(245,158,11,0.04)' }}>
                          <Trophy size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-black text-white text-sm">{ach.title}</h4>
                            <p className="text-[10px] text-amber-600/80 font-black uppercase tracking-widest">{ach.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SETTINGS ── */}
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
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Theme Color">
                    <input type="color" name="themeColor" defaultValue={instData?.themeColor || '#6366f1'} onChange={handleInputChange} className="inst-input h-12 cursor-pointer" />
                  </Field>
                  <Field label="Founded Year">
                    <input className="inst-input" name="foundedYear" defaultValue={instData?.foundedYear || ''} placeholder="e.g. 1972" onChange={handleInputChange} />
                  </Field>
                </div>
                {[
                  { name: 'vision',       label: 'Institution Vision',       placeholder: 'Describe your vision...' },
                  { name: 'mission',      label: 'Institution Mission',      placeholder: 'Describe your mission...' },
                  { name: 'history',      label: 'Institution History',      placeholder: 'A brief history of the institution...' },
                  { name: 'alumniHistory',label: 'Alumni Legacy',            placeholder: 'Notable alumni contributions...' },
                  { name: 'admissionInfo',label: 'Admission Information',    placeholder: 'Admission criteria, dates, process...' },
                  { name: 'studentLife',  label: 'Student Life & Clubs',     placeholder: 'Student organizations, events, clubs...' },
                  { name: 'research',     label: 'Research & Publications',  placeholder: 'Research highlights and publications...' },
                ].map(f => (
                  <Field key={f.name} label={f.label}>
                    <textarea name={f.name} defaultValue={instData?.[f.name] || ''} onChange={handleInputChange}
                      className="inst-input" style={{ minHeight: '80px', resize: 'vertical' }} placeholder={f.placeholder} />
                  </Field>
                ))}
                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg,${accent},#4f46e5)`, boxShadow: `0 8px 24px ${accent}35` }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <><CheckCircle size={14} /> Save All Settings</>}
                </button>
              </form>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* ── DEPARTMENTS TAB (ADMIN MANAGEMENT)                   ── */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === 'departments' && (
              <div className="animate-in fade-in duration-300 space-y-5">

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Departments</h3>
                    <p className="text-[10px] text-slate-600 font-bold mt-0.5">
                      Manage academic departments and their subcategories
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeptForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg,${accent},#4f46e5)`, boxShadow: `0 4px 16px ${accent}40` }}>
                    <Plus size={13} /> Add Department
                  </button>
                </div>

                {/* Add Department Form */}
                {showDeptForm && (
                  <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-5 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ background: 'linear-gradient(135deg,#0d1829,#0a0f1e)' }}>
                    <div className="absolute top-0 left-0 right-0 h-px"
                      style={{ background: `linear-gradient(90deg,transparent,${accent}80,transparent)` }} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">New Department</p>
                    <form onSubmit={handleAddDepartment} className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <input
                          className="inst-input"
                          placeholder="Department Name *"
                          value={deptForm.name}
                          onChange={e => setDeptForm(p => ({ ...p, name: e.target.value }))}
                          required
                        />
                        <input
                          className="inst-input"
                          placeholder="Established Year (e.g. 2005)"
                          value={deptForm.established}
                          onChange={e => setDeptForm(p => ({ ...p, established: e.target.value }))}
                        />
                      </div>
                      <textarea
                        className="inst-input"
                        placeholder="Department description (introduction shown when clicked)..."
                        value={deptForm.description}
                        onChange={e => setDeptForm(p => ({ ...p, description: e.target.value }))}
                        style={{ minHeight: '80px', resize: 'vertical' }}
                      />
                      <div className="flex gap-3">
                        <button type="submit" disabled={deptLoading}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
                          style={{ background: `linear-gradient(135deg,${accent},#4f46e5)`, boxShadow: `0 4px 16px ${accent}35` }}>
                          {deptLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={12} />}
                          Save Department
                        </button>
                        <button type="button" onClick={() => setShowDeptForm(false)}
                          className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-white/[0.08] hover:text-white transition-all">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Department list */}
                <div className="space-y-3">
                  {departments.map((dept, i) => {
                    const col = DEPT_COLORS[i % DEPT_COLORS.length];
                    const isOpen = expandedAdminDept === dept._id;

                    return (
                      <div key={dept._id}
                        className="relative overflow-hidden rounded-2xl border transition-all duration-300"
                        style={{
                          background: isOpen
                            ? `linear-gradient(135deg,${col}0e,#0d1829 60%,#0a0f1e)`
                            : 'linear-gradient(135deg,#0d1829,#0a0f1e)',
                          borderColor: isOpen ? col + '50' : col + '22',
                          boxShadow: isOpen ? `0 6px 36px ${col}14` : 'none',
                        }}>

                        {/* Top glow line */}
                        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                          style={{ background: `linear-gradient(to right,transparent,${col}${isOpen ? 'aa' : '40'},transparent)` }} />

                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] pointer-events-none transition-all"
                          style={{ background: col, opacity: isOpen ? 0.12 : 0.06 }} />

                        {/* Department header */}
                        <div className="relative z-10 flex items-center gap-3 p-4">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: col + '18', color: col, border: `1px solid ${col}28` }}>
                            <BookMarked size={17} />
                          </div>

                          {/* Name + established */}
                          <button
                            className="flex-1 text-left min-w-0"
                            onClick={() => setExpandedAdminDept(isOpen ? null : dept._id)}>
                            <h4 className="font-black text-white text-sm leading-tight">{dept.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {dept.established && (
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: col + '99' }}>
                                  Est. {dept.established}
                                </span>
                              )}
                              <span className="text-[9px] text-slate-600 font-bold">
                                {dept.subcategories?.length || 0} sections
                              </span>
                            </div>
                          </button>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => setShowSubForms(prev => ({
                                ...prev,
                                [dept._id]: !prev[dept._id]
                              }))}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105"
                              style={{ background: col + '18', color: col, border: `1px solid ${col}28` }}>
                              <Plus size={10} /> Section
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(dept._id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all border border-red-500/15">
                              <Trash2 size={11} />
                            </button>
                            <button
                              onClick={() => setExpandedAdminDept(isOpen ? null : dept._id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                              style={{ color: isOpen ? col : '#475569' }}>
                              <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isOpen && (
                          <div className="relative z-10 px-4 pb-5 space-y-3 animate-in fade-in duration-200">
                            <div className="h-px" style={{ background: `linear-gradient(to right,${col}30,transparent 70%)` }} />

                            {/* Description preview */}
                            {dept.description && (
                              <p className="text-slate-400 text-xs leading-relaxed px-1 border-l-2 pl-3"
                                style={{ borderColor: col + '55' }}>
                                {dept.description}
                              </p>
                            )}

                            {/* Add subcategory form */}
                            {showSubForms[dept._id] && (
                              <div className="rounded-xl border border-white/[0.07] p-4 space-y-2.5 animate-in fade-in duration-150"
                                style={{ background: 'rgba(0,0,0,0.25)' }}>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">New Section</p>
                                <form onSubmit={e => handleAddSubcategory(e, dept._id)} className="space-y-2.5">
                                  <input
                                    className="inst-input"
                                    placeholder="Section title *"
                                    value={subForms[dept._id]?.title || ''}
                                    onChange={e => setSubForms(prev => ({
                                      ...prev,
                                      [dept._id]: { ...prev[dept._id], title: e.target.value }
                                    }))}
                                    required
                                  />
                                  <textarea
                                    className="inst-input"
                                    placeholder="Section content / data..."
                                    value={subForms[dept._id]?.content || ''}
                                    onChange={e => setSubForms(prev => ({
                                      ...prev,
                                      [dept._id]: { ...prev[dept._id], content: e.target.value }
                                    }))}
                                    style={{ minHeight: '70px', resize: 'vertical' }}
                                  />
                                  <div className="flex gap-2">
                                    <button type="submit" disabled={deptLoading}
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all"
                                      style={{ background: col, boxShadow: `0 4px 12px ${col}30` }}>
                                      {deptLoading ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={10} />}
                                      Add Section
                                    </button>
                                    <button type="button"
                                      onClick={() => setShowSubForms(prev => ({ ...prev, [dept._id]: false }))}
                                      className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 border border-white/[0.06] hover:text-white transition-all">
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}

                            {/* Subcategory list */}
                            {dept.subcategories?.length > 0 && (
                              <div className="space-y-1.5">
                                {dept.subcategories.map((sub, si) => (
                                  <div key={sub._id || si}
                                    className="group flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.05] hover:border-white/[0.08] transition-all"
                                    style={{ background: 'rgba(0,0,0,0.18)' }}>
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                      style={{ background: col, boxShadow: `0 0 6px ${col}` }} />
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-[12px] font-black text-white">{sub.title}</h5>
                                      {sub.content && (
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{sub.content}</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleDeleteSubcategory(dept._id, sub._id)}
                                      className="w-6 h-6 rounded-lg flex items-center justify-center bg-red-500/0 hover:bg-red-500/20 text-slate-700 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5">
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {!dept.subcategories?.length && !showSubForms[dept._id] && (
                              <p className="text-slate-700 text-[11px] italic px-1">
                                No sections yet. Click "+ Section" to add one.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!departments.length && (
                    <MiniEmpty text="No departments yet. Click 'Add Department' to create your first department." />
                  )}
                </div>
              </div>
            )}

            {/* ── FACULTY ── */}
            {activeTab === 'faculty' && (
              <div className="grid md:grid-cols-2 gap-3 animate-in fade-in duration-300">
                {instData?.teachers?.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-base border"
                      style={{ background: accent + '15', borderColor: accent + '25', color: accent }}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-white text-sm truncate">{t.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-tighter truncate mt-0.5" style={{ color: accent }}>{t.designation}</p>
                      {t.department && <p className="text-[9px] text-slate-600 font-bold uppercase truncate">{t.department}</p>}
                    </div>
                  </div>
                ))}
                {!instData?.teachers?.length && <MiniEmpty text="No faculty added yet." />}
              </div>
            )}

            {/* ── BATCHES ── */}
            {activeTab === 'batches' && (
              <div className="grid md:grid-cols-2 gap-3 animate-in fade-in duration-300">
                {batches.map((b, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg" style={{ background: '#a855f715', color: '#a855f7' }}>Batch</span>
                    <h4 className="font-black text-white text-base mt-2">{b.name}</h4>
                    {b.class && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Year / Class: {b.class}</p>}
                    {b.section && <p className="text-[9px] text-slate-600 font-bold uppercase">{b.section}</p>}
                  </div>
                ))}
                {!batches.length && <MiniEmpty text="No batches created yet." />}
              </div>
            )}

            {/* ── FINANCE ── */}
            {activeTab === 'finance' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                {finances.map((f, i) => {
                  const isIncome = f.type === 'Income';
                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                      style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: isIncome ? '#22c55e15' : '#ef444415' }}>
                          <DollarSign size={14} style={{ color: isIncome ? '#22c55e' : '#ef4444' }} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{f.category}</h4>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                            {new Date(f.date || f.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-base" style={{ color: isIncome ? '#22c55e' : '#ef4444' }}>
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

            {/* ── NOTICES ── */}
            {activeTab === 'notices' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {notices.map((n, i) => (
                  <div key={i} className="relative overflow-hidden p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: accent }} />
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h4 className="font-black text-white text-sm flex-1">{n.title}</h4>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg flex-shrink-0"
                        style={{ background: accent + '15', color: accent }}>{n.category || 'General'}</span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{n.content}</p>
                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-wider mt-2">{new Date(n.createdAt).toDateString()}</p>
                  </div>
                ))}
                {!notices.length && <MiniEmpty text="No notices posted yet." />}
              </div>
            )}

            {/* ── AUTHORITIES / PERSONALITIES ── */}
            {activeTab === 'personalities' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Institution Authorities</h3>
                    <p className="text-[10px] text-slate-600 font-bold mt-0.5">Displayed on the campus page right sidebar</p>
                  </div>
                  <button onClick={() => openModal('personality')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)', boxShadow: '0 4px 16px #a855f740' }}>
                    <Quote size={12} /> Add
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {personalities.map((p, i) => {
                    const col = CATEGORY_COLORS[p.category] || '#a855f7';
                    return (
                      <div key={p._id || i} className="group relative overflow-hidden p-4 rounded-2xl border transition-all"
                        style={{ background: `linear-gradient(135deg,${col}06,#0a0f1e)`, borderColor: col + '22' }}>
                        <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-[40px] opacity-12 group-hover:opacity-25 transition-all pointer-events-none" style={{ background: col }} />
                        <button onClick={() => handleDeletePersonality(p._id)}
                          className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all opacity-0 group-hover:opacity-100 z-10">
                          <X size={12} />
                        </button>
                        <div className="flex items-center gap-3 relative z-10 mb-2">
                          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border" style={{ background: col + '18', borderColor: col + '30' }}>
                            {p.image
                              ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                              : <div className="w-full h-full flex items-center justify-center font-black text-base" style={{ color: col }}>{p.name?.charAt(0)}</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-white text-sm truncate">{p.name}</h4>
                              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                                style={{ background: col + '20', color: col }}>{p.category}</span>
                            </div>
                            {p.title && <p className="text-[10px] font-bold uppercase tracking-wider truncate mt-0.5" style={{ color: col + 'bb' }}>{p.title}</p>}
                          </div>
                        </div>
                        {p.quote && <p className="text-slate-500 text-xs leading-relaxed italic line-clamp-2 relative z-10">"{p.quote}"</p>}
                      </div>
                    );
                  })}
                  {!personalities.length && <MiniEmpty text="No authorities added yet. Use 'Add Authority' to get started." />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL                                                         */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-xl bg-black/75 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10" />
            <div className="absolute inset-0 rounded-[36px] blur-2xl opacity-12 pointer-events-none" style={{ background: accent }} />
            <div className="relative rounded-[32px] border border-white/[0.08] overflow-hidden"
              style={{ background: 'linear-gradient(160deg,#0d1526,#0a0f1e)' }}>
              <div className="h-px" style={{ background: `linear-gradient(90deg,transparent,${accent}80,transparent)` }} />
              <div className="p-7">
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Add New</p>
                    <h2 className="text-xl font-black text-white uppercase">
                      <span style={{ color: accent }}>
                        {modalType === 'personality' ? 'Authority / Personality' : modalType}
                      </span>
                    </h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.08] text-slate-500 hover:text-white hover:border-white/[0.16] transition-all">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-3.5">

                  {modalType === 'notice' && (<>
                    <input className="inst-input" name="title" placeholder="Notice Title" onChange={handleInputChange} required />
                    <textarea className="inst-input" name="content" placeholder="Content details..." onChange={handleInputChange} required style={{ minHeight: '100px', resize: 'vertical' }} />
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
                    <textarea className="inst-input" name="description" placeholder="Description" onChange={handleInputChange} style={{ minHeight: '80px', resize: 'vertical' }} />
                  </>)}

                  {modalType === 'result' && (<>
                    <input className="inst-input" name="studentId" placeholder="Student ID (Object ID)" onChange={handleInputChange} required />
                    <input className="inst-input" name="batchId" placeholder="Batch ID (Object ID)" onChange={handleInputChange} required />
                    <input className="inst-input" name="examName" placeholder="Exam Name (e.g. Mid Term)" onChange={handleInputChange} required />
                    <input className="inst-input" name="subject" placeholder="Subject Name" onChange={handleInputChange} required />
                    <input className="inst-input" name="marks" type="number" placeholder="Marks Obtained (out of 100)" onChange={handleInputChange} required />
                  </>)}

                  {modalType === 'personality' && (<>
                    <input className="inst-input" name="name" placeholder="Full Name (e.g. Prof. Dr. Anwar Hossain)" onChange={handleInputChange} required />
                    <input className="inst-input" name="title" placeholder="Official Title (e.g. Vice Chancellor, DU)" onChange={handleInputChange} />

                    <Field label="Category / Role">
                      <select className="inst-input" name="category" onChange={handleInputChange}>
                        {AUTHORITY_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </Field>

                    <textarea className="inst-input" name="quote" placeholder="Their inspiring quote or contribution..." onChange={handleInputChange} required style={{ minHeight: '90px', resize: 'vertical' }} />
                    <input className="inst-input" name="yearOfGraduation" placeholder="Batch / Year (Optional, e.g. 1995)" onChange={handleInputChange} />

                    <Field label="Profile Photo (Upload)">
                      <div className="relative">
                        <label className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-white/[0.1] hover:border-white/[0.2] transition-all cursor-pointer"
                          style={{ background: 'rgba(255,255,255,0.02)' }}>
                          {personalityImagePreview ? (
                            <img src={personalityImagePreview} alt="preview" className="w-20 h-20 rounded-xl object-cover border border-white/10" />
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accent + '18', color: accent }}>
                                <Upload size={18} />
                              </div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Click to upload photo</p>
                              <p className="text-[9px] text-slate-700">JPG, PNG or WEBP</p>
                            </>
                          )}
                          <input type="file" name="personalityImage" accept="image/*" onChange={handleFileChange} className="sr-only" />
                        </label>
                        {personalityImagePreview && (
                          <button type="button" onClick={() => { setPersonalityImagePreview(null); setFiles({ ...files, personalityImage: null }); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-all">
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    </Field>
                  </>)}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                    style={{ background: `linear-gradient(135deg,${accent},#4f46e5)`, boxShadow: `0 8px 24px ${accent}40` }}>
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                      : <><CheckCircle size={14} /> Save {modalType === 'personality' ? 'Authority' : modalType}</>}
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
/* HELPERS                                                       */
/* ============================================================ */
const MiniInfoBlock = ({ accent, icon, title, children }) => (
  <div className="rounded-xl border p-4 transition-all" style={{ background: 'rgba(255,255,255,0.02)', borderColor: accent + '20' }}>
    <div className="flex items-center gap-2 mb-2">
      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: accent + '18', color: accent }}>{icon}</div>
      <div className="w-0.5 h-3 rounded-full" style={{ background: accent }} />
      <p className="text-[10px] font-black text-white uppercase tracking-widest">{title}</p>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
    {children}
  </div>
);

const MiniEmpty = ({ text }) => (
  <div className="col-span-2 flex flex-col items-center justify-center py-14 text-center">
    <Sparkles size={22} className="text-slate-800 mb-3" />
    <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest max-w-xs leading-relaxed">{text}</p>
  </div>
);

const InstStyles = () => (
  <style>{`
    .inst-input {
      width: 100%;
      background: rgba(10,15,30,0.8);
      border: 1px solid rgba(255,255,255,0.07);
      color: white;
      padding: 13px 16px;
      border-radius: 14px;
      outline: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
      display: block;
    }
    .inst-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
    .inst-input::placeholder { color: #334155; }
    select.inst-input option { background-color: #0a0f1e; color: white; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

export default MyInstitution;
