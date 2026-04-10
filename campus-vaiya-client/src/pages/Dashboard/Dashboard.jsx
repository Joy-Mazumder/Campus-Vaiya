import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ModeContext } from '../../context/ModeContext';
import { 
  TrendingUp, Bell, Map, Send, Trophy, Globe, 
  Building2, FileText, Sparkles, CheckCircle, DollarSign,
  Mail, Phone, Calendar, User as UserIcon
} from 'lucide-react';
import API from '../../services/api';
import { Link } from 'react-router-dom';
import MyInstitution from './MyInstitution';

// API URL
const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { mode } = useContext(ModeContext);
  
  const [dashboardData, setDashboardData] = useState({ notices: [], results: [], fees: [] });
  const [stats, setStats] = useState({ cgpa: 0, credits: 0 });
  const [campusTab, setCampusTab] = useState("overview"); 

  // =========================================================================
  // --- PERFECTED LOGIC: STRICT SEPARATION OF STUDENT & ADMIN ROLES ---
  // =========================================================================
  
  // ১. Campus Mode এর জন্য (শুধুমাত্র enrolledCampus বা স্টুডেন্ট প্রোফাইলের ডাটা)
  const studentInst = typeof user?.enrolledCampus === 'object' ? user?.enrolledCampus : null;
  const studentInstId = studentInst?._id || (typeof user?.enrolledCampus === 'string' ? user?.enrolledCampus : null);

  // ২. Global Mode এর জন্য (শুধুমাত্র institution বা অ্যাডমিন প্রোফাইলের ডাটা)
  const managedInst = typeof user?.institution === 'object' ? user?.institution : null;
  const managedInstId = managedInst?._id || (typeof user?.institution === 'string' ? user?.institution : null);
  
  const isAdmin = user?.institutionRole === 'Admin';
  const hasManagedInstitution = isAdmin && managedInstId;

  // ৩. Currently Active Institution: 
  // ক্যাম্পাস মোড হলে শুধুমাত্র স্টুডেন্ট ক্যাম্পাস দেখাবে, গ্লোবাল হলে কিছু দেখাবে না (কারণ গ্লোবালের ডিজাইন আলাদা)
  const activeInst = mode === 'campus' ? studentInst : null;

  // ৪. Header Visibility Logic: 
  // গ্লোবাল মোডে যদি অ্যাডমিন হিসেবে তার প্রতিষ্ঠান থাকে, তবে মেইন হেডার হাইড হবে, সরাসরি অ্যাডমিন ড্যাশবোর্ড দেখাবে
  const showMainHeader = !(mode === 'global' && hasManagedInstitution);

  useEffect(() => {
    if (user) {
      fetchCampusData();
    }
  }, [user, mode]);

  const fetchCampusData = async () => {
    try {
      // Academic Stats (CGPA & Credits)
      const gRes = await API.get("/tools/gpa-history").catch(() => ({ data: { cumulativeCGPA: 0, totalCredits: 0 } }));
      setStats({ 
        cgpa: parseFloat(gRes.data?.cumulativeCGPA) || 0, 
        credits: parseInt(gRes.data?.totalCredits) || 0 
      });

      // ক্যাম্পাস মোডে ডাটা শুধুমাত্র স্টুডেন্ট ক্যাম্পাসের আইডি (studentInstId) দিয়ে লোড হবে!
      // অ্যাডমিন আইডির কোনো অ্যাক্সেস এখানে নেই।
      if (studentInstId && mode === 'campus') {
        const [nRes, rRes, fRes] = await Promise.all([
          API.get(`${API_URL}/institution/${studentInstId}/notices`).catch(() => ({ data: [] })),
          API.get(`${API_URL}/institution/result/my-results`).catch(() => ({ data: [] })),
          API.get(`${API_URL}/institution/finance/my-fees/${studentInstId}`).catch(() => ({ data: [] }))
        ]);
        
        setDashboardData({ 
          notices: nRes.data || [],
          results: rRes.data || [],
          fees: fRes.data || []
        });
      }
    } catch (err) { 
      console.error("Data Sync Error:", err); 
    }
  };

  const themeColor = activeInst?.themeColor || '#2563eb';

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-12 px-4 md:px-8 bg-[#020617] text-white font-sans">
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* --- DYNAMIC HEADER --- */}
        {showMainHeader && (
          <div className="relative overflow-hidden rounded-[40px] border border-slate-800 bg-slate-900/50 shadow-2xl animate-in fade-in duration-500">
             
             {/* BANNER SECTION (Strictly showing activeInst data in Campus Mode) */}
             <div className="h-48 md:h-64 w-full relative bg-[#020617]">
                {mode === 'global' ? (
                  /* Beautiful Global Universe Background */
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#020617] to-[#020617]"></div>
                    <div className="absolute top-0 right-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                  </div>
                ) : activeInst?.banner ? (
                  <img src={activeInst.banner} alt="Campus Banner" className="w-full h-full object-cover opacity-70" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-900/50 to-indigo-900/50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
             </div>

             {/* LOGO & PROFILE OVERLAY */}
             <div className="px-8 pb-8 -mt-20 relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="flex items-center gap-6">
                   <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-950 border-4 border-[#020617] overflow-hidden shadow-2xl flex items-center justify-center relative">
                      {mode === 'global' ? (
                         <Globe className="w-full h-full p-6 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse"/>
                      ) : activeInst?.logo ? (
                        <img src={activeInst.logo} className="w-full h-full object-contain p-2 bg-white/5" alt="Logo"/>
                      ) : (
                        <Building2 className="w-full h-full p-6 text-slate-700"/>
                      )}
                   </div>
                   <div className="mb-2">
                      <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white uppercase italic drop-shadow-md">
                        {mode === 'global' ? "Global Universe" : (activeInst?.name || "Campus Portal")}
                      </h1>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter bg-white/10 border border-white/20">
                            {mode} mode
                         </span>
                         <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            {/* Role is strictly "Student" in Campus mode, regardless of admin status elsewhere */}
                            {user?.fullName} • {mode === 'global' && isAdmin ? 'Institution Admin' : 'Student'}
                         </span>
                      </div>
                   </div>
                </div>
                
                {/* CGPA Block - Only shown in Campus Mode */}
                {mode === 'campus' && (
                  <div className="bg-slate-950/80 backdrop-blur-md p-5 rounded-3xl border border-slate-800 text-center min-w-[150px] shadow-xl animate-in fade-in zoom-in duration-500">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Academic CGPA</p>
                     <p className="text-4xl font-black" style={{ color: themeColor }}>{stats.cgpa.toFixed(2)}</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* --- GLOBAL MODE: Institution Creation & Management (ADMIN ONLY) --- */}
        {mode === 'global' && <MyInstitution />}

        {/* --- CAMPUS MODE: Student Dashboard (STUDENT ONLY) --- */}
        {mode === 'campus' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* LEFT CONTENT AREA */}
            <div className="lg:col-span-8 space-y-8">
               
               {/* Clean Tab Navigation */}
               <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/50 border border-slate-800 rounded-[28px] w-fit">
                  {['overview', 'feed', 'results', 'fees', 'faculty'].map(tab => (
                     <button key={tab} onClick={() => setCampusTab(tab)} 
                       className={`px-6 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${campusTab === tab ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                        {tab}
                     </button>
                  ))}
               </div>

               <div className="min-h-[500px]">
                 {!studentInstId && (
                   <EmptyState text="You are not enrolled in any institution as a student." />
                 )}

                 {/* 1. OVERVIEW */}
                 {studentInstId && campusTab === 'overview' && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                      <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[44px] relative overflow-hidden">
                        <h3 className="text-2xl font-black italic uppercase mb-3">Institutional Vision</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-2xl">
                          {activeInst?.vision || "Empowering students through excellence in education and innovation."}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoTile icon={<Map size={18}/>} label="Location" value={activeInst?.contact?.address} />
                          <InfoTile icon={<Mail size={18}/>} label="Official Email" value={activeInst?.contact?.email} />
                          <InfoTile icon={<Phone size={18}/>} label="Phone" value={activeInst?.contact?.phone} />
                          <InfoTile icon={<Calendar size={18}/>} label="Academic Year" value="2024-2025" />
                        </div>
                      </div>

                      {activeInst?.achievements?.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {activeInst.achievements.slice(0, 2).map((ach, i) => (
                              <div key={i} className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl flex flex-col justify-center">
                                 <Trophy className="text-amber-500 mb-4" size={24}/>
                                 <h4 className="font-bold text-white mb-1">{ach.title}</h4>
                                 <p className="text-[10px] text-slate-500 uppercase font-black">{ach.year}</p>
                              </div>
                           ))}
                        </div>
                      )}
                    </div>
                 )}

                 {/* 2. FEED / NOTICES */}
                 {studentInstId && campusTab === 'feed' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {dashboardData.notices.map(n => (
                         <div key={n._id} className="group p-8 bg-slate-900/50 border border-slate-800 rounded-[35px] hover:border-blue-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                               <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                                  {n.category || "General"}
                               </span>
                               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(n.createdAt).toDateString()}</span>
                            </div>
                            <h4 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{n.title}</h4>
                            <p className="text-slate-400 text-sm mt-3 leading-relaxed line-clamp-3">{n.content}</p>
                         </div>
                      ))}
                      {dashboardData.notices.length === 0 && <EmptyState text="The bulletin board is empty." />}
                    </div>
                 )}

                 {/* 3. RESULTS */}
                 {studentInstId && campusTab === 'results' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                      {dashboardData.results.map(r => (
                         <div key={r._id} className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex justify-between items-center">
                            <div>
                               <h4 className="font-black text-white uppercase text-sm">{r.examName}</h4>
                               <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Status: {r.status || 'Published'}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-2xl font-black text-blue-500">{r.percentage || r.marks}%</p>
                               <p className="text-[9px] text-slate-600 font-black uppercase">Result</p>
                            </div>
                         </div>
                      ))}
                      {dashboardData.results.length === 0 && <EmptyState text="No results found." />}
                    </div>
                 )}

                 {/* 4. FEES */}
                 {studentInstId && campusTab === 'fees' && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      {dashboardData.fees.map(f => (
                         <div key={f._id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex justify-between items-center group hover:bg-slate-900">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform"><DollarSign size={18}/></div>
                               <div>
                                  <h4 className="font-bold text-white text-sm">{f.category || f.note || 'Monthly Tuition Fee'}</h4>
                                  <p className="text-[9px] text-slate-500 font-black uppercase">{new Date(f.date).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <p className="font-black text-lg text-emerald-400">৳{f.amount}</p>
                         </div>
                      ))}
                      {dashboardData.fees.length === 0 && <EmptyState text="All clear! No pending or past fees recorded." />}
                    </div>
                 )}

                 {/* 5. FACULTY */}
                 {studentInstId && campusTab === 'faculty' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                      {activeInst?.teachers?.map((t, i) => (
                         <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center gap-4 hover:border-slate-600 transition-all">
                           <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                               {t.image ? <img src={t.image} className="w-full h-full object-cover" alt="teacher"/> : <UserIcon className="text-slate-700"/>}
                           </div>
                           <div>
                               <h4 className="font-bold text-white uppercase text-sm">{t.name}</h4>
                               <p className="text-[10px] text-blue-400 font-black uppercase tracking-tighter">{t.designation}</p>
                               <p className="text-[9px] text-slate-600 font-bold uppercase">{t.department}</p>
                           </div>
                         </div>
                      ))}
                      {(!activeInst?.teachers || activeInst.teachers.length === 0) && <EmptyState text="No faculty members added yet." />}
                    </div>
                 )}
               </div>
            </div>

            {/* RIGHT SIDEBAR - QUICK TOOLS */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white p-8 rounded-[40px] text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Campus Credit Balance</p>
                  <h2 className="text-6xl font-black text-black tracking-tighter">{stats.credits}</h2>
                  <div className="mt-6 flex justify-center">
                     <Link to="/tools/cgpa" className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                        Update Results <CheckCircle size={12}/>
                     </Link>
                  </div>
               </div>

               <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 mb-4">Academic Toolkit</h3>
                  <ToolCard title="Lab Report" icon={<FileText size={20} className="text-pink-500"/>} link="/tools/lab-gen" color="pink" />
                  <ToolCard title="Roadmaps" icon={<Sparkles size={20} className="text-amber-500"/>} link="/roadmaps" color="amber" />
                  <ToolCard title="Campus Feed" icon={<Globe size={20} className="text-indigo-500"/>} link="/feed" color="indigo" />
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- SUBSIDIARY COMPONENTS (UNCHANGED) ---

const ToolCard = ({ title, icon, link, color }) => (
  <Link to={link} className="flex items-center justify-between p-6 bg-slate-900/40 border border-slate-800 rounded-3xl hover:border-blue-500/50 transition-all group">
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-slate-950 rounded-xl group-hover:scale-110 transition-all`}>{icon}</div>
      <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h4>
    </div>
    <div className="text-slate-700 group-hover:text-white transition-colors">
       <TrendingUp size={16}/>
    </div>
  </Link>
);

const InfoTile = ({ icon, label, value }) => (
  <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50 flex items-center gap-4">
    <div className="text-blue-500 opacity-70">{icon}</div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
      <p className="text-slate-300 text-xs font-bold truncate">{value || 'Not provided'}</p>
    </div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-800 rounded-[40px] bg-slate-900/10">
    <Sparkles className="text-slate-800 mb-4" size={40}/>
    <p className="text-slate-600 font-black uppercase tracking-widest text-[10px] italic text-center max-w-[250px]">{text}</p>
  </div>
);

export default Dashboard;