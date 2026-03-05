import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { User, Camera, Mail, Book, Shield, Save, Globe, Linkedin, Github } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const MyProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    currentClass: user?.currentClass || '',
    specialities: user?.specialities?.join(', ') || '',
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    availableForHelp: user?.helpSettings?.available ?? true
  });
  const [imagePreview, setImagePreview] = useState(user?.profilePic || null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (selectedFile) data.append('profilePic', selectedFile);

    try {
      const res = await API.put('/users/update', data);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success("Profile Updated Globally! 🚀");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 md:px-8 bg-slate-950">
      <div className="max-w-4xl mx-auto bg-slate-900/40 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <form onSubmit={handleUpdate} className="px-8 pb-12">
          {/* Avatar Upload */}
          <div className="relative -mt-16 mb-8 flex justify-center md:justify-start">
            <div className="relative group">
              <img src={imagePreview || `https://ui-avatars.com/api/?name=${user.fullName}`} className="w-32 h-32 rounded-3xl border-4 border-slate-950 object-cover shadow-2xl" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-3xl cursor-pointer transition-all">
                <Camera className="text-white" />
                <input type="file" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div className="mt-20 ml-6 hidden md:block">
               <h2 className="text-2xl font-black text-white">{user.fullName}</h2>
               <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">{user.badge} • Rank #{user.rank}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase italic tracking-tighter"><User size={20} className="text-blue-500"/> Personal Identity</h3>
              <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-2">Bio / Headline</label>
                <textarea className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500" rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell the campus about yourself..." />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase italic tracking-tighter"><Shield size={20} className="text-blue-500"/> Social & Speciality</h3>
              <Input label="Specialities (Comma separated)" value={formData.specialities} onChange={e => setFormData({...formData, specialities: e.target.value})} placeholder="Math, Physics, React..." />
              <div className="grid grid-cols-2 gap-4">
                 <Input icon={<Github size={16}/>} label="Github" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} />
                 <Input icon={<Linkedin size={16}/>} label="LinkedIn" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                 <span className="text-xs font-black text-slate-400 uppercase">Available for Help</span>
                 <input type="checkbox" className="w-6 h-6 accent-blue-600" checked={formData.availableForHelp} onChange={e => setFormData({...formData, availableForHelp: e.target.checked})} />
              </div>
            </div>
          </div>

          <button disabled={loading} className="w-full mt-12 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95">
            <Save size={20}/> {loading ? "Saving Changes..." : "Sync Profile Data"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-slate-500 uppercase ml-2 flex items-center gap-2">{icon} {label}</label>
    <input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-blue-500 transition-all" />
  </div>
);

export default MyProfile;