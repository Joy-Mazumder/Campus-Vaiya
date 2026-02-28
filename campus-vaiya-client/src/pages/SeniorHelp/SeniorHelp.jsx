import { useState, useContext, useEffect } from "react";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api"; // ইমেজ আপলোডের জন্য API
import { Send, Image as ImageIcon, Bell, CheckCircle, Star } from "lucide-react";
import toast from "react-hot-toast";

const SeniorHelp = () => {
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);

  const handleSendRequest = async () => {
    if (!topic) return toast.error("Topic is required");
    setLoading(true);
    
    let imageUrl = "";
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      // আমরা রিসোর্স আপলোডের সেইম ক্লাউডিনারি রুট ব্যবহার করতে পারি
      const res = await api.post("/resources/upload-image", formData); 
      imageUrl = res.data.fileUrl;
    }

    const requestData = {
      senderId: user._id,
      senderName: user.fullName,
      senderReputation: user.reputationPoints, // ইউজারের গুরুত্ব দেখাবে
      universityId: user.universityId,
      topic,
      description,
      imageUrl,
      createdAt: new Date()
    };

    socket.emit("send_help_request", requestData);
    toast.success("Broadcasted to all seniors! 🚀");
    setTopic(""); setDescription(""); setImage(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Form Section */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] h-fit">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3 italic">
            REQUEST <span className="text-blue-500">HELP</span>
          </h2>
          <div className="space-y-4">
            <input 
              type="text" placeholder="Problem Topic..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 outline-none focus:border-blue-500"
              value={topic} onChange={(e) => setTopic(e.target.value)}
            />
            <textarea 
              placeholder="Describe your issue..." rows="4"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 outline-none focus:border-blue-500"
              value={description} onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            
            {/* Image Upload Button */}
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 bg-slate-800/50 border border-dashed border-slate-700 p-3 rounded-2xl cursor-pointer hover:border-blue-500 transition-all text-slate-400">
                <ImageIcon size={20}/> {image ? image.name.substring(0,15) : "Add Screenshot (Optional)"}
                <input type="file" hidden onChange={(e) => setImage(e.target.files[0])} />
              </label>
            </div>

            <button 
              onClick={handleSendRequest} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
            >
              {loading ? "Uploading..." : <><Send size={20}/> Ask Seniors</>}
            </button>
          </div>
        </div>

        {/* Requests Feed Section */}
        <div className="lg:col-span-7 space-y-6">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <Bell size={22} className="text-amber-500" /> Active Requests In Your Campus
           </h2>
           <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
              {requests.map((req, i) => (
                <div key={i} className="p-6 bg-slate-900/60 border border-slate-800 rounded-[32px] hover:border-blue-500/30 transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                            {req.senderName[0]}
                         </div>
                         <div>
                            <h4 className="font-bold text-slate-200">{req.topic}</h4>
                            <p className="text-[10px] text-slate-500 uppercase font-black flex items-center gap-1">
                               <Star size={10} className="fill-amber-500 text-amber-500"/> {req.senderReputation} Points • {req.senderName}
                            </p>
                         </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg font-bold">NEW</span>
                   </div>
                   
                   <p className="text-sm text-slate-400 mb-4">{req.description}</p>
                   {req.imageUrl && (
                      <img src={req.imageUrl} alt="issue" className="w-full h-48 object-cover rounded-2xl mb-4 border border-slate-800" />
                   )}
                   
                   <button className="w-full py-3 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                      <CheckCircle size={18}/> Accept & Solve
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorHelp;