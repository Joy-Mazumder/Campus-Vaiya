import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  ThumbsUp, 
  Download, 
  UserPlus, 
  Check, 
  GraduationCap, 
  Star, 
  Globe, 
  FileText,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ResourceCard = ({ resource, onUpvote, onConnect }) => {
  const { user } = useContext(AuthContext);
  const [upvotes, setUpvotes] = useState(resource.upvotes?.length || 0);
  const [isUpvoted, setIsUpvoted] = useState(resource.upvotes?.includes(user?._id));

  // লজিক: ইউজার কি অলরেডি ফ্রেন্ড? 
  const isFriend = user?.friends?.includes(resource.uploadedBy?._id);
  // লজিক: এটা কি ইউজারের নিজের পোস্ট?
  const isSelf = user?._id === resource.uploadedBy?._id;

  const handleUpvoteLocal = async () => {
    if (!user) return toast.error("Please login to upvote");
    try {
      await onUpvote(`/resources/vote/${resource._id}`);
      setIsUpvoted(!isUpvoted);
      setUpvotes(isUpvoted ? upvotes - 1 : upvotes + 1);
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[32px] hover:bg-slate-900/60 transition-all group relative overflow-hidden backdrop-blur-sm">
      
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-all"></div>

      {/* Header: User Info & Connect Button */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-blue-500 text-xl group-hover:border-blue-500/50 transition-all">
            {resource.uploadedBy?.fullName?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors capitalize">
                {resource.uploadedBy?.fullName}
              </h4>
              {/* Reputation Badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-500 font-black">
                <Star size={10} className="fill-amber-500" />
                {resource.uploadedBy?.reputationPoints?.toLocaleString() || 0}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-bold uppercase tracking-wider">
              <Clock size={10} /> {new Date(resource.createdAt).toLocaleDateString()} • {resource.uploadedBy?.badge || "Student"}
            </p>
          </div>
        </div>

        {/* Connect Button Logic */}
        {!isSelf && (
          <button
            onClick={() => !isFriend && onConnect(resource.uploadedBy?._id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isFriend 
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default" 
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95"
            }`}
          >
            {isFriend ? <><Check size={14}/> Connected</> : <><UserPlus size={14}/> Connect</>}
          </button>
        )}
      </div>

      {/* Resource Content */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
           <h3 className="text-xl font-black text-white leading-tight flex-1">
             {resource.title}
           </h3>
           {resource.isGlobal && (
             <span className="flex items-center gap-1 bg-purple-500/10 text-purple-400 text-[10px] px-2 py-1 rounded-lg border border-purple-500/20 font-black uppercase tracking-tighter">
               <Globe size={10}/> Global
             </span>
           )}
        </div>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
          {resource.description || "No description provided for this resource."}
        </p>
      </div>

      {/* Meta Info: Subject & Semester */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          <FileText size={14} className="text-blue-500" /> {resource.subject}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          <GraduationCap size={14} className="text-indigo-500" /> {resource.semester}
        </div>
      </div>

      {/* Footer: Vote & Download */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-800/50">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleUpvoteLocal}
            className={`flex items-center gap-2 transition-all ${
              isUpvoted ? "text-blue-500 scale-110" : "text-slate-500 hover:text-blue-400"
            }`}
          >
            <ThumbsUp size={20} className={isUpvoted ? "fill-blue-500" : ""} />
            <span className="text-sm font-black">{upvotes}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={resource.fileUrl} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all font-bold text-sm"
          >
            <Download size={18} /> View / Download
          </a>
        </div>
      </div>

    </div>
  );
};

export default ResourceCard;