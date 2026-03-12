import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Building2, PlusCircle, Users, Trophy, BookOpen, 
  Send, DollarSign, Image as ImageIcon, X, Sparkles, CheckCircle, FileText
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
const API_URL = import.meta.env.VITE_API_URL;
const MyInstitution = () => {
  const { user, setUser } = useContext(AuthContext);
  
  // ইউজার ইতিমধ্যে কোনো ইন্সটিটিউশনের অ্যাডমিন কি না চেক করা
  const hasInstitution = user?.institutionRole === 'Admin' && user?.institution;
  const instId = typeof user?.institution === 'object' ? user?.institution?._id : user?.institution;

  // --- States ---
  const [view, setView] = useState(hasInstitution ? 'dashboard' : 'create'); 
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [instData, setInstData] = useState(null);
  const [notices, setNotices] = useState([]);
  const [batches, setBatches] = useState([]);
  const [finances, setFinances] = useState([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});

  // --- Data Fetching ---
  useEffect(() => {
    if (hasInstitution && instId) {
      fetchDashboardData();
    }
  }, [hasInstitution, instId]);

  const fetchDashboardData = async () => {
    try {
      // ১. ইন্সটিটিউশনের সম্পূর্ণ ডাটা (Teachers, Achievements সহ)
      const instRes = await API.get(`${API_URL}/institution/my-managed`);
      setInstData(instRes.data);

      // ২. অন্যান্য ডাটা
      const [nRes, bRes, fRes] = await Promise.all([
        API.get(`${API_URL}/institution/${instId}/notices`).catch(()=>({data:[]})),
        API.get(`${API_URL}/institution/${instId}/batches`).catch(()=>({data:[]})),
        API.get(`${API_URL}/institution/finance/summary/${instId}`).catch(()=>({data:{history:[]}}))
      ]);
      
      setNotices(nRes.data || []);
      setBatches(bRes.data || []);
      setFinances(fRes.data?.history || []);
    } catch (err) {
      console.error("Dashboard Fetch Error", err);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  // ১. ক্রিয়েট ইন্সটিটিউশন লজিক
  // ১. ক্রিয়েট ইন্সটিটিউশন লজিক (সংশোধিত)
const handleCreate = async (e) => {
  e.preventDefault();
  setLoading(true);

  const data = new FormData();
  Object.keys(formData).forEach(key => data.append(key, formData[key]));
  if (files.license) data.append('license', files.license);
  if (files.idCard) data.append('idCard', files.idCard);

  try {
    const res = await API.post('/institution/create', data);
    
    // ডাটাবেসে সেভ হওয়ার পর সাকসেস মেসেজ
    toast.success("Institution Created Successfully!");

    if (setUser) { // চেক করে নেওয়া যেন ক্রাশ না করে
      const updatedUser = {
        ...user,
        institution: res.data.institution,
        institutionRole: 'Admin'
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    // স্টেট আপডেট হওয়ার জন্য সামান্য সময় দিন
    setTimeout(() => {
      window.location.reload();
    }, 800);

  } catch (err) {
    console.log("Error details:", err.response?.data);
    toast.error(err.response?.data?.message || "Already created or Server Error");
  } finally {
    setLoading(false);
  }
};

// ২. মডাল সাবমিট (ফিন্যান্স এবং রেজাল্টের জন্য স্পেশাল হ্যান্ডেলিং)
const handleModalSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    let endpoint = '';
    let payload = { ...formData, institutionId: instId };

    // কন্ডিশনাল এন্ডপয়েন্ট সিলেকশন
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
        payload.marks = [{ 
          subject: formData.subject, 
          obtainedMarks: Number(formData.marks), 
          totalMarks: 100 
        }];
        break;
      default: return;
    }

    const response = await API.post(endpoint, payload);
    
    if(response.status === 200 || response.status === 201) {
      toast.success(`${modalType.toUpperCase()} added!`);
      setIsModalOpen(false);
      setFormData({});
      fetchDashboardData(); // ডাটা রিফ্রেশ
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to save data.");
  } finally {
    setLoading(false);
  }
};
  // ৩. সেটিংস / ব্র্যান্ডিং আপডেট (Logo, Banner, Vision, Mission)
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

  const openModal = (type) => {
    setModalType(type);
    setFormData({});
    setIsModalOpen(true);
  };


  // ==========================================
  // VIEW 1: CREATE INSTITUTION
  // ==========================================
  if (!hasInstitution || view === 'create') {
    return (
      <div className="min-h-screen bg-[#020617] pt-24 px-4 pb-12 flex justify-center items-center">
        <div className="max-w-2xl w-full bg-slate-900/50 border border-slate-800 p-10 md:p-14 rounded-[48px] shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-[28px] flex items-center justify-center mx-auto mb-6">
              <Building2 size={36} />
            </div>
            <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter">Start New <span className="text-indigo-500">Campus</span></h2>
            <p className="text-slate-400 font-medium mt-2">Fill the basics to generate your institutional portal.</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Institution Name</label>
                <input className="input-field" name="name" placeholder="e.g. Dhaka College" onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Type</label>
                <select className="input-field" name="type" onChange={handleInputChange} required>
                  <option value="">Select Type</option>
                  <option value="Coaching">Coaching</option>
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Address</label>
                <input className="input-field" name="email" type="email" placeholder="admin@campus.com" onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Contact Phone</label>
                <input className="input-field" name="phone" placeholder="+880 1XXX..." onChange={handleInputChange} required />
              </div>
            </div>

            {/* Document Upload based on type */}
            <div className="p-6 bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-[32px] text-center mt-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                {formData.type === 'Coaching' ? "Upload Owner NID/ID Card" : "Upload Govt. License & EIIN"}
              </p>
              
              {formData.type !== 'Coaching' && (
                <input className="input-field mb-4 w-full max-w-sm mx-auto block" name="eiinNumber" placeholder="EIIN Number" onChange={handleInputChange} />
              )}
              
              <input type="file" name={formData.type === 'Coaching' ? 'idCard' : 'license'} onChange={handleFileChange} className="text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20" required />
            </div>

            <button type="submit" disabled={loading} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 rounded-full font-black uppercase text-sm tracking-[0.2em] text-white transition-all shadow-xl active:scale-[0.98]">
              {loading ? "Creating Ecosystem..." : "Launch Institution"}
            </button>
          </form>
        </div>

        <style jsx="true">{`.input-field { width: 100%; background: #0a0f1e; border: 1px solid #1e293b; color: white; padding: 18px 24px; border-radius: 24px; outline: none; font-size: 14px; font-weight: 600; transition: 0.3s; } .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }`}</style>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#020617] pt-24 px-4 md:px-10 pb-20">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[48px] flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5"><Building2 size={200}/></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden flex items-center justify-center">
              {instData?.logo ? <img src={instData.logo} alt="logo" className="w-full h-full object-cover"/> : <ImageIcon className="text-slate-700" size={32}/>}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1"><CheckCircle size={10}/> Verified</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">ID: {instData?.referralCode}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">{instData?.name || "Loading..."}</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* QUICK ACTIONS SIDEBAR */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Quick Deploy</h3>
            <ActionBtn onClick={() => openModal('notice')} icon={<Send/>} label="Post Notice" color="bg-blue-600" />
            <ActionBtn onClick={() => openModal('batch')} icon={<BookOpen/>} label="New Batch" color="bg-purple-600" />
            <ActionBtn onClick={() => openModal('teacher')} icon={<Users/>} label="Add Teacher" color="bg-indigo-600" />
            <ActionBtn onClick={() => openModal('finance')} icon={<DollarSign/>} label="Finance Entry" color="bg-emerald-600" />
            <ActionBtn onClick={() => openModal('result')} icon={<FileText/>} label="Publish Result" color="bg-rose-600" />
            <ActionBtn onClick={() => openModal('achievement')} icon={<Trophy/>} label="Achievement" color="bg-amber-600" />
          </div>

          {/* MAIN MANAGEMENT AREA */}
          <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800 rounded-[48px] p-8 md:p-10 min-h-[600px]">
            {/* TABS */}
            <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto no-scrollbar border-b border-slate-800 pb-6">
              {['overview', 'settings', 'faculty', 'batches', 'finance', 'notices'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-950 text-slate-500 hover:text-white border border-slate-800'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
                <StatCard label="Total Batches" value={batches.length} />
                <StatCard label="Total Faculty" value={instData?.teachers?.length || 0} />
                <StatCard label="Notices" value={notices.length} />
                <div className="md:col-span-3 p-8 bg-slate-950 rounded-[32px] border border-slate-800">
                  <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Vision & Mission</h4>
                  <p className="text-slate-300 text-sm mb-4"><span className="font-bold text-slate-500">Vision:</span> {instData?.vision || 'Not set'}</p>
                  <p className="text-slate-300 text-sm"><span className="font-bold text-slate-500">Mission:</span> {instData?.mission || 'Not set'}</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <form onSubmit={handleSettingsUpdate} className="space-y-6 max-w-2xl animate-in fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Update Logo</label>
                    <input type="file" name="logo" onChange={handleFileChange} className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Update Banner</label>
                    <input type="file" name="banner" onChange={handleFileChange} className="input-field" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Institution Vision</label>
                  <textarea name="vision" defaultValue={instData?.vision} onChange={handleInputChange} className="input-field min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Institution Mission</label>
                  <textarea name="mission" defaultValue={instData?.mission} onChange={handleInputChange} className="input-field min-h-[100px]" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 rounded-full font-black text-white uppercase text-xs tracking-widest hover:bg-indigo-500">
                  {loading ? "Updating..." : "Save Settings"}
                </button>
              </form>
            )}

            {activeTab === 'faculty' && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
                {instData?.teachers?.map((t, i) => (
                  <div key={i} className="p-6 bg-slate-950 border border-slate-800 rounded-[32px] flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase">{t.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-bold text-white">{t.name}</h4>
                      <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{t.designation}</p>
                    </div>
                  </div>
                ))}
                {!instData?.teachers?.length && <p className="text-slate-500 text-sm">No faculty added yet.</p>}
              </div>
            )}

            {/* Similar mapping for Finance, Batches, Notices */}
            {activeTab === 'finance' && (
              <div className="space-y-4 animate-in fade-in">
                {finances.map((f, i) => (
                  <div key={i} className="p-6 bg-slate-950 border border-slate-800 rounded-[32px] flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white">{f.category}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{new Date(f.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-black text-xl ${f.type === 'Income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {f.type === 'Income' ? '+' : '-'} ৳{f.amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ALL-IN-ONE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-black/50 animate-in fade-in duration-300">
          <div className="bg-[#020617] border border-slate-800 w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24}/></button>
            <h2 className="text-3xl font-black uppercase italic text-white mb-8">Add <span className="text-indigo-500">{modalType}</span></h2>

            <form onSubmit={handleModalSubmit} className="space-y-5">
              {/* Dynamic Inputs Based on Modal Type */}
              {modalType === 'notice' && (
                <>
                  <input className="input-field" name="title" placeholder="Notice Title" onChange={handleInputChange} required />
                  <textarea className="input-field min-h-[120px]" name="content" placeholder="Content details..." onChange={handleInputChange} required />
                  <select className="input-field" name="category" onChange={handleInputChange}>
                    <option value="General">General</option>
                    <option value="Exam">Exam</option>
                  </select>
                </>
              )}

              {modalType === 'teacher' && (
                <>
                  <input className="input-field" name="name" placeholder="Teacher's Name" onChange={handleInputChange} required />
                  <input className="input-field" name="designation" placeholder="Designation (e.g. Lecturer)" onChange={handleInputChange} required />
                  <input className="input-field" name="department" placeholder="Department (Optional)" onChange={handleInputChange} />
                </>
              )}

              {modalType === 'batch' && (
                <>
                  <input className="input-field" name="name" placeholder="Batch Name (e.g. HSC 2026)" onChange={handleInputChange} required />
                  <input className="input-field" name="class" type="number" placeholder="Class/Year (Numeric)" onChange={handleInputChange} required />
                  <input className="input-field" name="section" placeholder="Section / Shift" onChange={handleInputChange} />
                </>
              )}

              {modalType === 'finance' && (
                <>
                  <select className="input-field" name="type" onChange={handleInputChange} required>
                    <option value="">Select Type</option>
                    <option value="Income">Income (+)</option>
                    <option value="Expense">Expense (-)</option>
                  </select>
                  <input className="input-field" name="amount" type="number" placeholder="Amount (BDT)" onChange={handleInputChange} required />
                  <input className="input-field" name="category" placeholder="Category (e.g. Rent, Fee)" onChange={handleInputChange} required />
                </>
              )}

              {modalType === 'achievement' && (
                <>
                  <input className="input-field" name="title" placeholder="Achievement Title" onChange={handleInputChange} required />
                  <input className="input-field" name="year" placeholder="Year" onChange={handleInputChange} required />
                  <textarea className="input-field" name="description" placeholder="Description" onChange={handleInputChange} />
                </>
              )}

              {modalType === 'result' && (
                <>
                  <input className="input-field" name="studentId" placeholder="Student ID (Object ID)" onChange={handleInputChange} required />
                  <input className="input-field" name="batchId" placeholder="Batch ID (Object ID)" onChange={handleInputChange} required />
                  <input className="input-field" name="examName" placeholder="Exam Name (e.g. Mid Term)" onChange={handleInputChange} required />
                  <input className="input-field" name="subject" placeholder="Subject Name" onChange={handleInputChange} required />
                  <input className="input-field" name="marks" type="number" placeholder="Marks Obtained (Out of 100)" onChange={handleInputChange} required />
                </>
              )}

              <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 rounded-full font-black uppercase tracking-widest text-xs mt-4 hover:bg-indigo-500">
                {loading ? "Saving..." : `Save ${modalType}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx="true">{`
        .input-field { width: 100%; background: #0a0f1e; border: 1px solid #1e293b; color: white; padding: 18px 24px; border-radius: 24px; outline: none; font-size: 14px; font-weight: 600; transition: 0.3s; }
        .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        select option { background-color: #020617; color: white; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

// --- Reusable Small Components ---
const ActionBtn = ({ label, icon, color, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 bg-slate-950 border border-slate-800 rounded-[24px] hover:border-slate-600 transition-all group`}>
    <div className={`p-3 rounded-xl text-white ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
    <span className="text-xs font-black uppercase tracking-widest text-slate-300">{label}</span>
  </button>
);

const StatCard = ({ label, value }) => (
  <div className="p-6 bg-slate-950 border border-slate-800 rounded-[32px] text-center">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
    <h3 className="text-4xl font-black text-white italic">{value}</h3>
  </div>
);

export default MyInstitution;