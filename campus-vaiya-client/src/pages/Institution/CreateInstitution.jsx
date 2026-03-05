import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Palette, Phone, Globe, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const CreateInstitution = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', type: 'Coaching', referralCode: '',
    isRestricted: false, themeColor: '#2563eb'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/institution/create', formData);
      toast.success(res.data.message);
      navigate('/dashboard'); // ক্রিয়েট হওয়ার পর ড্যাশবোর্ডে নিয়ে যাবে
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 bg-slate-950 flex justify-center">
      <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-[40px] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
        <header className="mb-10">
          <h2 className="text-4xl font-black text-white">Create Your <span className="text-blue-500">Space</span></h2>
          <p className="text-slate-400 mt-2 text-lg">Build your institution's digital home on CampusVaiya.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold ml-2">INSTITUTION NAME</label>
              <input 
                required placeholder="e.g. Creative Coaching Center"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 transition"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-400 text-sm font-bold ml-2">TYPE</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-blue-500 cursor-pointer"
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Coaching">Coaching Center</option>
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="University">University</option>
              </select>
            </div>
          </div>

          <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold flex items-center gap-2">
                  <ShieldCheck className="text-blue-500" size={18}/> Restricted Access
                </h4>
                <p className="text-slate-500 text-xs mt-1">Students will need your approval to join via referral code.</p>
              </div>
              <input 
                type="checkbox" className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer"
                onChange={(e) => setFormData({...formData, isRestricted: e.target.checked})}
              />
            </div>
            
            <input 
              placeholder="Custom Referral Code (Optional)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-blue-500"
              onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-950/30 border border-slate-800 rounded-2xl">
             <Palette className="text-slate-500" />
             <span className="text-slate-400 text-sm font-bold">Pick Branding Color:</span>
             <input 
              type="color" value={formData.themeColor}
              className="w-10 h-10 bg-transparent border-none cursor-pointer"
              onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
             />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
          >
            Launch Institution Space <ArrowRight size={20}/>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateInstitution;