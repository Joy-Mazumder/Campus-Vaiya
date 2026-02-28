import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import {
  Bell, BookOpen, MessageCircle, Zap,
  Clock, ShieldCheck, Map, Calculator, FileText, Library,
  ThumbsUp, Globe, FileType, User as UserIcon, Download,
  Plus, X, UploadCloud, Send, GraduationCap
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [resources, setResources] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailableForHelp || false);

  // Modal & Upload States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "", description: "", subject: "", semester: "", isGlobal: false, file: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.universityId) {
          const noticeRes = await api.get("/institution/notices");
          setNotices(noticeRes.data);
        }
        const resourceRes = await api.get("/resources");
        setResources(resourceRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    fetchData();
  }, [user]);

  const handleToggleStatus = async () => {
    try {
      const res = await api.put("/chat/toggle-status");
      setIsAvailable(res.data.isAvailable);
      const updatedUser = { ...user, isAvailableForHelp: res.data.isAvailable };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success(res.data.isAvailable ? "Available for help! 🟢" : "Status set to Offline 🔴");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Handle Resource Upload
  const handlePostResource = async (e) => {
    e.preventDefault();
    if (!newResource.file) return toast.error("Please select a file first!");

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("title", newResource.title);
    formData.append("description", newResource.description);
    formData.append("subject", newResource.subject);
    formData.append("semester", newResource.semester);
    formData.append("isGlobal", newResource.isGlobal);
    formData.append("file", newResource.file);

    try {
      const res = await api.post("/resources/upload", formData);
      setResources([res.data, ...resources]); // Facebook-like instant update
      setIsModalOpen(false);
      setNewResource({ title: "", description: "", subject: "", semester: "", isGlobal: false, file: null });
      toast.success("Resource shared successfully! 🚀");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden text-white p-4 md:p-8 z-0">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] -z-10"></div>

      {/* Header Section */}
      <header className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 italic">
            CAMPUS<span className="text-blue-500">VAIYA</span>
          </h1>
          <p className="text-slate-400 font-medium">Welcome back, {user?.fullName?.split(" ")[0]}! Ready to contribute?</p>
        </div>

        {user?.role === "senior" && (
          <button onClick={handleToggleStatus} className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 backdrop-blur-xl border ${isAvailable ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-slate-800/50 border-slate-700 text-slate-400"}`}>
            <span className={`w-3 h-3 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" : "bg-slate-500"}`}></span>
            {isAvailable ? "Available to Help" : "Go Online"}
          </button>
        )}
      </header>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column (Main Feed) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Facebook Style Post Box */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/60 p-5 rounded-3xl shadow-xl">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg">
                {user?.fullName?.charAt(0)}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-slate-800/50 hover:bg-slate-800 transition-all text-left px-6 py-3 rounded-2xl text-slate-400 border border-slate-700/50"
              >
                What's on your mind, {user?.fullName?.split(" ")[0]}? Share a resource...
              </button>
            </div>
            <div className="flex gap-6 mt-4 pt-4 border-t border-slate-800/50">
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-blue-400 transition-colors">
                <FileText size={18} className="text-blue-500" /> Note / Slide
              </button>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors">
                <Library size={18} className="text-emerald-500" /> Book PDF
              </button>
            </div>
          </div>

          {/* Newsfeed Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
              <Zap size={20} className="text-amber-500" /> Recent Contributions
            </h2>
            {resources.map((res) => (
              <ResourceCard key={res._id} resource={res} onUpvote={api.put} />
            ))}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Tools Grid */}
          <div className="grid grid-cols-2 gap-4">
            <ToolBox label="Lab Report" icon={<FileText />} color="text-pink-500" link="/tools" />
            <ToolBox label="AI Roadmap" icon={<Map />} color="text-cyan-500" link="/tools" />
            <ToolBox label="CGPA Calc" icon={<Calculator />} color="text-emerald-500"  link="/tools/cgpa"  />
            <ToolBox label="Library" icon={<Library />} color="text-indigo-500" link="/resources" />
          </div>
          {/* Notice Board */}
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/60 p-6 rounded-3xl shadow-xl h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><Bell size={20} className="text-blue-400" /> Notices</h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md uppercase tracking-widest">{user?.university?.name || "Global"}</span>
            </div>
            <div className="overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {notices.map(n => (
                <div key={n._id} className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-2xl hover:border-blue-500/50 transition-all group cursor-pointer">
                  <h4 className="text-sm font-semibold group-hover:text-blue-400 transition-colors">{n.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(n.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> Admin</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- UPLOAD MODAL (The Popup) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !uploadLoading && setIsModalOpen(false)}></div>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-xl rounded-[32px] shadow-2xl z-10 overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Resource Post</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X /></button>
            </div>

            <form onSubmit={handlePostResource} className="p-6 space-y-4">
              <input
                type="text" placeholder="Resource Title (e.g. Physics Lab Report 2)" required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
                value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text" placeholder="Subject" required
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
                  value={newResource.subject} onChange={e => setNewResource({ ...newResource, subject: e.target.value })}
                />
                <select
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
                  value={newResource.semester} onChange={e => setNewResource({ ...newResource, semester: e.target.value })}
                >
                  <option value="">Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>{num}th Semester</option>)}
                </select>
              </div>

              <textarea
                placeholder="Description (What is this about?)" rows="3"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
                value={newResource.description} onChange={e => setNewResource({ ...newResource, description: e.target.value })}
              ></textarea>

              <div className="flex items-center gap-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                <input
                  type="file" id="file-upload" className="hidden"
                  onChange={e => setNewResource({ ...newResource, file: e.target.files[0] })}
                />
                <label htmlFor="file-upload" className="flex-1 flex items-center justify-center gap-3 cursor-pointer py-2 hover:text-blue-400 transition-all">
                  <UploadCloud /> {newResource.file ? <span className="text-blue-400 font-bold">{newResource.file.name}</span> : "Select Document / PDF"}
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-slate-400" />
                  <span className="text-sm font-medium">Make this Global?</span>
                </div>
                <input
                  type="checkbox" className="w-5 h-5 accent-blue-600"
                  checked={newResource.isGlobal} onChange={e => setNewResource({ ...newResource, isGlobal: e.target.checked })}
                />
              </div>

              <button
                type="submit" disabled={uploadLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
              >
                {uploadLoading ? "Uploading Space..." : <><Send size={20} /> Post Resource</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Helper Components ---

const ResourceCard = ({ resource }) => (
  <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[32px] hover:bg-slate-900/60 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 font-bold group-hover:border-blue-500/50 transition-all">
          {resource.uploadedBy?.fullName?.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors">{resource.title}</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <UserIcon size={12} /> {resource.uploadedBy?.fullName} • {new Date(resource.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {resource.isGlobal && <span className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-1 rounded-full border border-purple-500/20 uppercase font-black">Global</span>}
    </div>

    <p className="text-slate-400 text-sm mb-6 leading-relaxed">{resource.description}</p>

    <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
      <div className="flex gap-4">
        <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all">
          <ThumbsUp size={20} /> <span className="text-sm font-bold">{resource.upvotes?.length || 0}</span>
        </button>
        <div className="flex items-center gap-2 text-slate-500">
          <GraduationCap size={18} /> <span className="text-xs font-bold">{resource.subject} • Sem {resource.semester}</span>
        </div>
      </div>
      <a href={resource.fileUrl} target="_blank" className="p-3 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
        <Download size={20} />
      </a>
    </div>
  </div>
);

const ToolBox = ({ icon, label, color, link }) => (
  <Link
    to={link}
    className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800/60 flex flex-col items-center gap-3 hover:-translate-y-1 hover:border-blue-500/50 transition-all cursor-pointer group"
  >
    <div className={`${color} p-3 bg-slate-950 rounded-2xl group-hover:scale-110 transition-all`}>
      {icon}
    </div>
    <span className="text-xs font-bold text-slate-400">{label}</span>
  </Link>
);

const StudentResultCard = ({ result }) => (
  <div className="bg-slate-900/60 border border-emerald-500/20 p-6 rounded-[32px] relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 bg-emerald-500/10 text-emerald-500 rounded-bl-3xl font-black text-xl">
      {result.totalGPA}
    </div>
    <h3 className="text-xl font-bold text-white mb-1">{result.examName}</h3>
    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">
      {result.institution?.name} • {result.batch}
    </p>
    
    <div className="space-y-2 mb-6">
      {result.subjects.map((s, i) => (
        <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-800/50 text-slate-400">
          <span>{s.name}</span>
          <span className="font-bold text-slate-200">{s.grade} ({s.marks})</span>
        </div>
      ))}
    </div>

    <button className="w-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-400 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2">
       Share Result to Feed 🚀
    </button>
  </div>
);

export default Dashboard;