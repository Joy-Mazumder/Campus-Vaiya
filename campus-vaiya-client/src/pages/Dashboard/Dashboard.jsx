import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ModeContext } from '../../context/ModeContext';
import { 
  TrendingUp, Bell, Map, DollarSign, Trash2, 
  PlusCircle, Send, X, Users, Trophy, BookOpen, 
  Globe, Building2, Edit3, FileText, Sparkles, ChevronRight
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { mode } = useContext(ModeContext);
  
  // -- Data States --
  const [dashboardData, setDashboardData] = useState({ notices: [], batches: [], finances: [] });
  const [stats, setStats] = useState({ cgpa: 0, credits: 0 });

  // -- UI States --
  const [campusTab, setCampusTab] = useState("overview"); 
  const [globalTab, setGlobalTab] = useState("overview"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  // Institution shortcut (Check if user owns an institution)
  const inst = user?.institution;
  const isAdmin = user?.institutionRole === 'Admin';

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, mode]);

  const fetchDashboardData = async () => {
    try {
      const gRes = await API.get("/tools/gpa-history").catch(() => ({ data: { cumulativeCGPA: 0, totalCredits: 0 } }));
      setStats({ 
        cgpa: parseFloat(gRes.data?.cumulativeCGPA) || 0, 
        credits: parseInt(gRes.data?.totalCredits) || 0 
      });

      if (inst?._id) {
        const [nRes, bRes, fRes] = await Promise.all([
            API.get(`/institution/notices/${inst._id}`).catch(() => ({ data: [] })),
            API.get(`/institution/batches/${inst._id}`).catch(() => ({ data: [] })),
            API.get(`/institution/finance/${inst._id}`).catch(() => ({ data: [] }))
        ]);
        
        setDashboardData({ 
            notices: nRes.data || [], 
            batches: bRes.data || [], 
            finances: fRes.data || [] 
        });
      }
    } catch (err) { 
      console.error("Dashboard Fetch Error:", err); 
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = `/institution/${modalType}s/add`; 
      if (modalType === 'notice') endpoint = "/institution/notices/create";
      if (modalType === 'batch') endpoint = "/institution/batchs/add";

      const payload = { ...formData, institutionId: inst?._id };
      await API.post(endpoint, payload);
      
      toast.success(`${modalType.toUpperCase()} deployed successfully!`);
      setIsModalOpen(false);
      setFormData({});
      fetchDashboardData();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Operation failed."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (type, id) => {
    if(!window.confirm(`Permanently remove this ${type.slice(0,-1)}?`)) return;
    try {
        await API.delete(`/institution/${type}/${id}`);
        toast.success("Entry removed.");
        fetchDashboardData();
    } catch (err) { toast.error("Delete failed."); }
  };

  const openModal = (type) => {
    setModalType(type);
    setFormData({});
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* --- DYNAMIC HEADER --- */}
        <div className="bg-slate-900/40 border border-slate-800 p-8 md:p-10 rounded-[48px] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <Sparkles size={180}/>
           </div>
           <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-white drop-shadow-lg">
                {/* Global mode এ যদি নিজের প্রতিষ্ঠান থাকে তবে সেটা দেখাবে, নয়তো Global Universe */}
                {mode === 'global' ? (inst && isAdmin ? inst.name : "GLOBAL UNIVERSE") : (inst ? inst.name : "GLOBAL UNIVERSE")}
              </h1>
              <div className="flex items-center gap-3 mt-4">
                 <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${mode === 'campus' ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'}`}>
                    {mode === 'campus' ? <Building2 size={12}/> : <Globe size={12}/>} {mode} MODE
                 </div>
                 <p className="text-slate-400 font-bold text-xs italic">
                    {user?.fullName} • {isAdmin ? 'Authority' : 'Member'}
                 </p>
              </div>
           </div>
           <div className="relative z-10 bg-slate-950/50 p-6 rounded-[32px] border border-slate-800 text-center min-w-[140px]">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Standing</p>
              <p className="text-5xl font-black text-white">{stats.cgpa.toFixed(2)}</p>
           </div>
        </div>

        {/* ======================================================= */}
        {/* =============== GLOBAL MODE (MANAGEMENT) ============== */}
        {/* ======================================================= */}
        {mode === 'global' && (
          <div className="animate-in fade-in duration-500 space-y-8">
            {/* Condition: Show Create ONLY if NOT an Admin of an existing institution */}
            {!isAdmin ? (
               <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 p-16 rounded-[56px] text-center space-y-6 shadow-2xl">
                  <div className="bg-indigo-600/20 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/30">
                     <Building2 size={48} className="text-indigo-400"/>
                  </div>
                  <h3 className="text-4xl font-black uppercase text-white">Create Your Digital Campus</h3>
                  <p className="text-slate-400 max-w-lg mx-auto font-medium">Launch your coaching or batch website globally. Manage everything from student fees to official notices in one dashboard.</p>
                  <Link to="/create-institution" className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 mt-4">
                     <PlusCircle size={20}/> Launch Institution
                  </Link>
               </div>
            ) : (
                /* Management UI (Visible only after creation) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   <div className="lg:col-span-8 space-y-8">
                      {/* ACTION GRID */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <ActionCard onClick={() => openModal('notice')} label="Post Notice" icon={<Send size={18}/>} color="bg-blue-600" />
                          <ActionCard onClick={() => openModal('teacher')} label="Faculty" icon={<Users size={18}/>} color="bg-indigo-600" />
                          <ActionCard onClick={() => openModal('achievement')} label="Awards" icon={<Trophy size={18}/>} color="bg-amber-600" />
                          <ActionCard onClick={() => openModal('batch')} label="Batch" icon={<BookOpen size={18}/>} color="bg-purple-600" />
                          <ActionCard onClick={() => openModal('finance')} label="Finance" icon={<DollarSign size={18}/>} color="bg-emerald-600" />
                      </div>

                      {/* MANAGEMENT HUB */}
                      <div className="bg-slate-900/40 border border-slate-800 rounded-[48px] p-8 shadow-2xl">
                         <div className="flex flex-wrap gap-3 mb-8 no-scrollbar">
                            {['overview', 'broadcasts', 'faculty', 'achievements', 'batches', 'finance'].map(tab => (
                               <button key={tab} onClick={() => setGlobalTab(tab)} 
                                 className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${globalTab === tab ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-white'}`}>
                                  {tab}
                               </button>
                            ))}
                         </div>
                         
                         <div className="min-h-[350px] space-y-4">
                            {globalTab === 'overview' && (
                              <div className="grid md:grid-cols-2 gap-6 animate-in fade-in">
                                <OverviewBox title="Branding Vision" content={inst?.vision || "Institution vision not set."} icon={<Sparkles size={16}/>} />
                                <OverviewBox title="Campus Contact" content={`${inst?.contact?.address || 'N/A'} • ${inst?.contact?.email || 'N/A'}`} icon={<Map size={16}/>} />
                              </div>
                            )}

                            {globalTab === 'broadcasts' && dashboardData.notices.map(n => (
                               <div key={n._id} className="flex justify-between items-center p-6 bg-slate-950 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition-all group">
                                  <div className="flex items-center gap-4">
                                     <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500"><Bell size={20}/></div>
                                     <div>
                                        <h4 className="font-bold text-white tracking-tight">{n.title}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{n.category} • {new Date(n.createdAt).toLocaleDateString()}</p>
                                     </div>
                                  </div>
                                  <button onClick={() => handleDelete('notices', n._id)} className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
                               </div>
                            ))}
                            {globalTab === 'broadcasts' && dashboardData.notices.length === 0 && <EmptyState text="No active broadcasts found." />}

                            {globalTab === 'faculty' && (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {inst?.teachers?.map((t, i) => (
                                    <div key={i} className="p-5 bg-slate-950 rounded-[32px] border border-slate-800 flex justify-between items-center group">
                                      <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 font-bold">
                                            {t.image ? <img src={t.image} className="w-full h-full rounded-2xl object-cover" alt="faculty"/> : t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{t.name}</h4>
                                            <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest">{t.designation}</p>
                                        </div>
                                      </div>
                                      <button onClick={() => handleDelete('teachers', t._id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={18}/></button>
                                    </div>
                                 ))}
                                 {(!inst?.teachers || inst?.teachers.length === 0) && <EmptyState text="Faculty list is empty." />}
                               </div>
                            )}

                            {globalTab === 'batches' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dashboardData.batches.map(b => (
                                        <div key={b._id} className="p-6 bg-slate-950 rounded-[40px] border border-slate-800 border-l-4 border-l-purple-500">
                                            <h4 className="font-black text-xl text-white">{b.name}</h4>
                                            <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">{b.section} • Class {b.class}</p>
                                            <div className="mt-6 flex justify-between items-center">
                                                <span className="text-[10px] bg-slate-900 px-4 py-1.5 rounded-full text-slate-400 font-black tracking-widest uppercase">{b.students?.length || 0} Students</span>
                                                <button onClick={() => handleDelete('batches', b._id)} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {dashboardData.batches.length === 0 && <EmptyState text="No batches created." />}
                                </div>
                            )}

                            {globalTab === 'finance' && (
                                <div className="space-y-3">
                                    {dashboardData.finances.map(f => (
                                        <div key={f._id} className="p-5 bg-slate-950 rounded-3xl border border-slate-800 flex justify-between items-center shadow-inner">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${f.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    <DollarSign size={20}/>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-sm">{f.category}</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{new Date(f.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <p className={`font-black text-xl ${f.type === 'Income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {f.type === 'Income' ? '+' : '-'} ৳{f.amount}
                                            </p>
                                        </div>
                                    ))}
                                    {dashboardData.finances.length === 0 && <EmptyState text="No financial records." />}
                                </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* RIGHT SIDEBAR - GLOBAL */}
                   <div className="lg:col-span-4 space-y-6">
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] sticky top-32 shadow-2xl">
                         <h3 className="text-xl font-black italic mb-8 uppercase tracking-tighter">Authority Hub</h3>
                         <div className="space-y-4">
                            <InfoRow label="Referral ID" value={inst?.referralCode} color="text-indigo-400" />
                            <InfoRow label="Staff Portal" value={inst?.teachers?.length || 0} color="text-blue-400" />
                            <InfoRow label="Total Batches" value={dashboardData.batches?.length || 0} color="text-purple-400" />
                            <InfoRow label="Access Type" value={inst?.isRestricted ? "RESTRICTED" : "OPEN"} color={inst?.isRestricted ? "text-amber-500" : "text-emerald-500"} />
                         </div>
                         <Link to={`/edit-institution`} className="w-full mt-10 py-5 bg-slate-950 border border-slate-800 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all flex justify-center items-center gap-3">
                           <Edit3 size={16}/> Site Settings
                         </Link>
                      </div>
                   </div>
                </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* =============== CAMPUS MODE (STUDENT HUB) ============= */}
        {/* ======================================================= */}
        {mode === 'campus' && (
          <div className="animate-in slide-in-from-bottom-6 duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               
               <div className="flex flex-wrap gap-3 mb-4">
                  {['overview', 'feed', 'faculty', 'achievements'].map(tab => (
                     <button key={tab} onClick={() => setCampusTab(tab)} 
                       className={`px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${campusTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-900/40 text-slate-500 border border-slate-800 hover:text-white'}`}>
                        {tab}
                     </button>
                  ))}
               </div>

               <div className="min-h-[450px]">
                  {(!inst) && <EmptyState text="Please join an institution using a referral code." />}

                  {inst && campusTab === 'overview' && (
                     <div className="space-y-6 animate-in fade-in">
                       <div className="bg-slate-900 border border-slate-800 p-10 rounded-[56px] relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><Building2 size={120}/></div>
                         <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Welcome back to {inst.name}</h3>
                         <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-2xl">{inst.mission || "Access your official campus resources and track your milestones."}</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <ContactCard icon={<Map size={18}/>} label="Campus Location" value={inst.contact?.address || "Location unavailable"} />
                           <ContactCard icon={<Send size={18}/>} label="Institutional Help" value={inst.contact?.email || "No support email"} />
                         </div>
                       </div>
                     </div>
                  )}

                  {inst && campusTab === 'feed' && (
                     <div className="space-y-4 animate-in fade-in">
                       {dashboardData.notices.map(n => (
                          <div key={n._id} className="p-8 bg-slate-900 border border-slate-800 border-l-4 border-l-blue-600 rounded-[40px] shadow-lg transition-all hover:scale-[1.01]">
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{n.category}</span>
                                <span className="text-[10px] font-black text-slate-600 tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</span>
                             </div>
                             <h4 className="text-2xl font-bold text-white leading-tight">{n.title}</h4>
                             <p className="text-slate-400 text-sm mt-4 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                          </div>
                       ))}
                       {dashboardData.notices.length === 0 && <EmptyState text="The campus bulletin is quiet." />}
                     </div>
                  )}

                  {inst && campusTab === 'faculty' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                       {inst.teachers?.map((t, i) => (
                          <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-[32px] flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 font-black text-xl">
                                {t.image ? <img src={t.image} className="w-full h-full rounded-2xl object-cover" alt="faculty"/> : t.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{t.name}</h4>
                                <p className="text-xs text-blue-400 font-black uppercase tracking-widest">{t.designation}</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{t.department}</p>
                            </div>
                          </div>
                       ))}
                     </div>
                  )}

                  {inst && campusTab === 'achievements' && (
                     <div className="grid grid-cols-1 gap-4 animate-in fade-in">
                       {inst.achievements?.map((ach, i) => (
                          <div key={i} className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Trophy size={100}/></div>
                            <span className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-[0.2em] mb-4 inline-block">{ach.year}</span>
                            <h4 className="font-black text-2xl text-white mb-2">{ach.title}</h4>
                            <p className="text-sm text-slate-400 max-w-xl">{ach.description}</p>
                          </div>
                       ))}
                     </div>
                  )}
               </div>
            </div>

            {/* RIGHT SIDEBAR - CAMPUS */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 p-12 rounded-[56px] text-center shadow-xl">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Cumulative CGPA</p>
                  <h2 className="text-7xl font-black text-white tracking-tighter">{stats.cgpa.toFixed(2)}</h2>
                  <p className="text-xs text-slate-500 mt-4 font-black uppercase tracking-widest">Total Credits: {stats.credits}</p>
               </div>

               <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] px-6 pt-6 italic text-center">Toolkit</h3>
               <div className="grid grid-cols-1 gap-4">
                  <ToolCard title="GPA Tracker" desc="Smart Result Sync" icon={<TrendingUp size={22} className="text-emerald-500"/>} link="/tools/cgpa" />
                  <ToolCard title="Lab Report Gen" desc="Auto PDF Layouts" icon={<FileText size={22} className="text-pink-500"/>} link="/tools/lab-gen" />
                  <ToolCard title="AI Roadmap" desc="Gemini Career Path" icon={<Sparkles size={22} className="text-amber-500"/>} link="/roadmaps" />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* --- REUSABLE MODAL SYSTEM --- */}
      {isModalOpen && mode === 'global' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-[#020617] border border-slate-800 w-full max-w-xl rounded-[56px] p-8 md:p-14 shadow-3xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 text-slate-600 hover:text-white transition-colors"><X/></button>
              <h2 className="text-4xl font-black italic mb-10 uppercase tracking-tighter">New <span className="text-indigo-500">{modalType}</span></h2>

              <form onSubmit={handleModalSubmit} className="space-y-6">
                {modalType === 'notice' && (
                  <>
                    <input className="modal-input" name="title" placeholder="Notice Title" onChange={handleInputChange} required />
                    <textarea className="modal-input" name="content" rows="4" placeholder="Description..." onChange={handleInputChange} required />
                    <select className="modal-input" name="category" onChange={handleInputChange}>
                       <option value="General">Category: General</option>
                       <option value="Exam">Category: Exam Info</option>
                       <option value="Holiday">Category: Holiday</option>
                    </select>
                  </>
                )}

                {modalType === 'teacher' && (
                  <>
                    <input className="modal-input" name="name" placeholder="Full Name" onChange={handleInputChange} required />
                    <input className="modal-input" name="designation" placeholder="Designation" onChange={handleInputChange} required />
                    <input className="modal-input" name="department" placeholder="Department" onChange={handleInputChange} />
                  </>
                )}

                {modalType === 'achievement' && (
                  <>
                    <input className="modal-input" name="title" placeholder="Award Name" onChange={handleInputChange} required />
                    <input className="modal-input" name="year" placeholder="Year" onChange={handleInputChange} required />
                    <textarea className="modal-input" name="description" rows="3" placeholder="Description..." onChange={handleInputChange} required />
                  </>
                )}

                {modalType === 'finance' && (
                  <>
                    <select className="modal-input" name="type" onChange={handleInputChange} required>
                       <option value="">Transaction Type</option>
                       <option value="Income">Income (+)</option>
                       <option value="Expense">Expense (-)</option>
                    </select>
                    <input className="modal-input" name="category" placeholder="Source/Head" onChange={handleInputChange} required />
                    <input type="number" className="modal-input" name="amount" placeholder="Amount (৳)" onChange={handleInputChange} required />
                  </>
                )}

                {modalType === 'batch' && (
                  <>
                    <input className="modal-input" name="name" placeholder="Batch Name" onChange={handleInputChange} required />
                    <input type="number" className="modal-input" name="class" placeholder="Standard Class (Numeric)" onChange={handleInputChange} required />
                    <input className="modal-input" name="section" placeholder="Section/Shift" onChange={handleInputChange} />
                  </>
                )}

                <button type="submit" disabled={loading} className="w-full bg-indigo-600 py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-indigo-600/30">
                  {loading ? "Syncing..." : `Confirm ${modalType}`}
                </button>
              </form>
           </div>
        </div>
      )}

      <style jsx="true">{`
        .modal-input { width: 100%; background: #0a0f1e; border: 1px solid #1e293b; color: white; padding: 20px 28px; border-radius: 28px; outline: none; transition: 0.3s; font-size: 14px; font-weight: 600; }
        .modal-input:focus { border-color: #6366f1; box-shadow: 0 0 20px rgba(99, 102, 241, 0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

// Internal Components
const ActionCard = ({ label, icon, color, onClick }) => (
  <button onClick={onClick} className={`p-6 ${color} rounded-[32px] text-white flex flex-col items-center gap-3 hover:-translate-y-2 transition-all shadow-xl active:scale-95`}>
    <div className="bg-white/10 p-3 rounded-2xl">{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ToolCard = ({ title, desc, icon, link }) => (
  <Link to={link} className="flex items-center gap-5 p-7 bg-slate-900/60 border border-slate-800 rounded-[40px] hover:border-blue-500 transition-all group shadow-lg">
    <div className="p-4 bg-slate-950 rounded-2xl group-hover:scale-110 transition-transform shadow-inner">{icon}</div>
    <div>
      <h4 className="text-sm font-black text-white uppercase tracking-tight">{title}</h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{desc}</p>
    </div>
  </Link>
);

const InfoRow = ({ label, value, color }) => (
  <div className="flex justify-between items-center p-5 bg-slate-950/50 rounded-3xl border border-slate-800">
     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
     <span className={`font-black text-xs ${color}`}>{value || "---"}</span>
  </div>
);

const OverviewBox = ({ title, content, icon }) => (
  <div className="p-8 bg-slate-950 rounded-[40px] border border-slate-800 shadow-inner group">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-indigo-500 bg-indigo-500/10 p-2 rounded-lg">{icon}</div>
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</h4>
    </div>
    <p className="text-slate-300 text-sm leading-relaxed font-medium">{content}</p>
  </div>
);

const ContactCard = ({ icon, label, value }) => (
  <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 group hover:border-blue-500/30 transition-all">
    <div className="flex items-center gap-3 mb-2">
      <div className="text-blue-500">{icon}</div>
      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</h4>
    </div>
    <p className="text-white text-sm font-bold truncate">{value}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-800 rounded-[48px] bg-slate-900/20">
    <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px] italic">{text}</p>
  </div>
);

export default Dashboard;