import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, BookOpen, Hash, 
  ShieldCheck, ArrowRight, ArrowLeft, Building2, Search 
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // সাজেশন সেভ করার জন্য
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '',
    educationLevel: 'School', currentClass: '', 
    referralCode: '', manualInstitution: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // যদি ইউজার প্রতিষ্ঠানের নাম টাইপ করে
    if (name === 'manualInstitution') {
      if (value.length > 2) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  // ডাটাবেজ থেকে সাজেশন নিয়ে আসা
  const fetchSuggestions = async (query) => {
    try {
      const res = await API.get(`/institution/search?q=${query}&type=${formData.educationLevel}`);
      setSuggestions(res.data);
      setShowSuggestions(res.data.length > 0);
    } catch (err) {
      console.error("Suggestion fetch error", err);
    }
  };

  // সাজেশন সিলেক্ট করলে
  const handleSelectSuggestion = (name) => {
    setFormData({ ...formData, manualInstitution: name });
    setShowSuggestions(false);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/register', formData);
      toast.success(res.data.message || "Registration Successful!");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900/40 border border-slate-800/60 rounded-[40px] p-8 md:p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-12 relative z-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 flex-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-slate-800'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-blue-400' : 'text-slate-600'}`}>Step 0{s}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <header>
                <h2 className="text-3xl font-black text-white tracking-tight">Create Account</h2>
                <p className="text-slate-400 mt-2">Start your journey with <span className="text-blue-400 font-bold">CampusVaiya</span></p>
              </header>
              <div className="space-y-4">
                <InputField icon={<User size={20}/>} name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
                <InputField icon={<Mail size={20}/>} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                <InputField icon={<Lock size={20}/>} name="password" type="password" placeholder="Create Password" value={formData.password} onChange={handleChange} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <header>
                <h2 className="text-3xl font-black text-white tracking-tight">Academic Info</h2>
              </header>
              <div className="space-y-4">
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <select 
                    name="educationLevel" value={formData.educationLevel} onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 pl-12 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="School">School (Class 1-10)</option>
                    <option value="College">College (Inter 1st/2nd)</option>
                    <option value="University">University (1st-4th Year)</option>
                    <option value="Masters">Masters / PhD</option>
                  </select>
                </div>
                <InputField 
                    icon={<Hash size={20}/>} name="currentClass" type="number" 
                    placeholder={formData.educationLevel === 'University' ? "Year (e.g. 1 or 3)" : "Class (e.g. 8 or 12)"} 
                    value={formData.currentClass} onChange={handleChange} 
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <header>
                <h2 className="text-3xl font-black text-white tracking-tight">Institution Space</h2>
                <p className="text-slate-400 mt-2">Find your campus or create a new one.</p>
              </header>
              <div className="space-y-4 relative">
                <InputField icon={<ShieldCheck size={20}/>} name="referralCode" placeholder="Referral Code (Optional)" value={formData.referralCode} onChange={handleChange} />
                
                <div className="text-center text-slate-600 text-xs font-bold uppercase tracking-widest py-2">— OR —</div>
                
                <div className="relative">
                  <InputField icon={<Building2 size={20}/>} name="manualInstitution" placeholder="Institution Name (Manually)" value={formData.manualInstitution} onChange={handleChange} autoComplete="off" />
                  
                  {/* Suggestion Dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-3 border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Suggested Institutions</div>
                      {suggestions.map((inst) => (
                        <button
                          key={inst.slug}
                          onClick={() => handleSelectSuggestion(inst.name)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-blue-600/10 hover:text-blue-400 transition-all text-left"
                        >
                          <Search size={14} className="text-slate-500" />
                          {inst.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-12">
            {step > 1 ? (
              <button onClick={prevStep} className="flex items-center gap-2 text-slate-400 font-bold hover:text-white transition group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
              </button>
            ) : (
                <Link to="/login" className="text-slate-500 hover:text-blue-400 text-sm font-bold transition">Already have an account?</Link>
            )}
            
            <button 
              onClick={step === 3 ? handleRegister : nextStep} 
              disabled={loading}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-full text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : step === 3 ? "Complete Registration" : "Next Step"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-500 transition-colors">{icon}</div>
    <input 
      {...props}
      className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 pl-12 text-white outline-none focus:border-blue-500/50 transition-all"
    />
  </div>
);

export default Register;