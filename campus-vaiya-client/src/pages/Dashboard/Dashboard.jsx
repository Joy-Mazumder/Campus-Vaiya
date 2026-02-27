import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { 
  Bell, BookOpen, MessageCircle, Zap, 
  User as UserIcon, CheckCircle, Clock, ShieldCheck 
} from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailableForHelp || false);

  // নোটিশ লোড করা (যদি ইউনিভার্সিটি থাকে)
  useEffect(() => {
    if (user?.universityId) {
      const fetchNotices = async () => {
        try {
          const res = await api.get("/institution/notices");
          setNotices(res.data);
        } catch (err) {
          console.error("Failed to fetch notices");
        }
      };
      fetchNotices();
    }
  }, [user]);

  // হেল্প স্ট্যাটাস টগল করা (সিনিয়রদের জন্য)
  const handleToggleStatus = async () => {
    try {
      const res = await api.put("/chat/toggle-status");
      setIsAvailable(res.data.isAvailable);
      // আপডেট ইউজার ইন কন্টেক্সট
      const updatedUser = { ...user, isAvailableForHelp: res.data.isAvailable };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(res.data.isAvailable ? "You are now Available for help!" : "Status set to Offline");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      {/* Top Welcome Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, <span className="text-blue-500">{user?.fullName}</span>!
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Currently active in {user?.university?.name || "Global Space"}
          </p>
        </div>

        {/* Senior Toggle Button */}
        {user?.role === 'senior' && (
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
              isAvailable 
                ? "bg-green-600/10 border border-green-500 text-green-500 hover:bg-green-600/20" 
                : "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700"
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${isAvailable ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-slate-500"}`}></div>
            {isAvailable ? "Available for Help" : "Set Available"}
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section: Stats & Quick Tools */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={<BookOpen className="text-blue-500" />} label="My Notes" value="12" />
            <StatCard icon={<Zap className="text-amber-500" />} label="Contribution" value={user?.badge || "Newbie"} />
            <StatCard icon={<MessageCircle className="text-purple-500" />} label="Help Requests" value="5" />
          </div>

          {/* Quick Actions (Utility Tools Access) */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-4">Quick Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ToolIcon label="Lab Report" icon="🧪" link="/tools" />
              <ToolIcon label="AI Roadmap" icon="🚀" link="/tools" />
              <ToolIcon label="CGPA Cal" icon="📊" link="/tools" />
              <ToolIcon label="Library" icon="📚" link="/resources" />
            </div>
          </div>
        </div>

        {/* Right Section: Notice Board (Contextual) */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell size={20} className="text-blue-500" /> Notice Board
            </h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
              {user?.university?.name || "Global"}
            </span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice._id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer group">
                  <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition">{notice.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12}/> {new Date(notice.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={12}/> Admin</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-10">No notices posted yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
    <div className="p-3 bg-slate-950 rounded-2xl">{icon}</div>
    <div>
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const ToolIcon = ({ label, icon, link }) => (
  <a href={link} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-slate-800 transition-all bg-slate-950/30 border border-slate-800/50">
    <span className="text-2xl">{icon}</span>
    <span className="text-xs font-medium text-slate-400">{label}</span>
  </a>
);

export default Dashboard;