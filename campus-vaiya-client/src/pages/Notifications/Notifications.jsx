import { useEffect, useState } from "react";
import api from "../../services/api";
import { Bell, UserCheck, UserPlus, Star } from "lucide-react";
import toast from "react-hot-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [notifRes, friendRes] = await Promise.all([
      api.get("/notifications"),
      api.get("/friends/pending")
    ]);
    setNotifications(notifRes.data);
    setPendingRequests(friendRes.data);
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/friends/accept/${id}`);
      toast.success("New connection added! +50 Points 🌟");
      fetchData();
    } catch (err) { toast.error("Failed to accept"); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Connection Requests */}
        {pendingRequests.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UserPlus className="text-blue-500" /> Pending Connections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map(req => (
                <div key={req._id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-3xl flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                        {req.requester.fullName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{req.requester.fullName}</p>
                        <p className="text-[10px] text-slate-500">{req.requester.university?.name}</p>
                      </div>
                   </div>
                   <button onClick={() => handleAccept(req._id)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-xs font-bold">Accept</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Regular Notifications */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Bell className="text-amber-500" /> Recent Updates
          </h2>
          <div className="space-y-4">
            {notifications.map(n => (
              <div key={n._id} className="p-5 bg-slate-900/40 border-l-4 border-l-blue-500 border border-slate-800 rounded-2xl flex items-center gap-4">
                 <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Star size={20}/></div>
                 <p className="text-sm text-slate-300 flex-1">{n.message}</p>
                 <span className="text-[10px] text-slate-600">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Notifications;