import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Lock, BookOpen, Hash, 
  ShieldCheck, ArrowRight, ArrowLeft, Building2, Search,
  Phone, AlertTriangle, FileText, UploadCloud
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [regType, setRegType] = useState('Student');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [suggestions, setSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [studentData, setStudentData] = useState({
    fullName: '', email: '', password: '',
    educationLevel: 'School', currentClass: '', 
    referralCode: '', manualInstitution: ''
  });

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });

    if (name === 'manualInstitution') {
      if (value.length > 2) fetchSuggestions(value, studentData.educationLevel);
      else { setSuggestions([]); setShowSuggestions(false); }
    }
  };

  const fetchSuggestions = async (query, type) => {
    try {
      const res = await API.get(`/institution/search?q=${query}&type=${type}`);
      setSuggestions(res.data);
      setShowSuggestions(res.data.length > 0);
    } catch (err) { console.error(err); }
  };

  const handleSelectSuggestion = (name) => {
    setStudentData({ ...studentData, manualInstitution: name });
    setShowSuggestions(false);
  };

  const [authData, setAuthData] = useState({
    adminName: '', adminEmail: '', adminPassword: '',
    instName: '', instType: 'Coaching', contact: '', eiinNumber: ''
  });
  const [existingInst, setExistingInst] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [authDoc, setAuthDoc] = useState(null);

  const handleAuthChange = async (e) => {
    const { name, value } = e.target;
    setAuthData({ ...authData, [name]: value });

    if (name === 'instName') {
      if (value.length > 2) {
        try {
          const res = await API.get(`/institution/search?q=${value}&type=${authData.instType}`);
          
          const normalizedInput = value.toLowerCase().replace(/\s+/g, '');
          
          const exactMatch = res.data.find(inst => 
            inst.name.toLowerCase().replace(/\s+/g, '') === normalizedInput
          );

          if (exactMatch) {
            setExistingInst(exactMatch);
          } else {
            setExistingInst(null);
            setIsClaiming(false);
          }
        } catch (err) { console.error(err); }
      } else {
        setExistingInst(null);
        setIsClaiming(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(file) setAuthDoc(file);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const switchTab = (type) => {
    setRegType(type);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (regType === 'Student') {
        const res = await API.post('/auth/register', studentData);
        toast.success(res.data.message || "Registration Successful!");
        navigate('/login');
      } 
      else {
        const userRes = await API.post('/auth/register', {
          fullName: authData.adminName,
          email: authData.adminEmail,
          password: authData.adminPassword,
        });

        const loginRes = await API.post('/auth/login', { 
          email: authData.adminEmail, 
          password: authData.adminPassword 
        });
        const token = loginRes.data.token;

        const formDataObj = new FormData();
        formDataObj.append('name', authData.instName);
        formDataObj.append('type', authData.instType);
        formDataObj.append('contact', authData.contact);
        formDataObj.append('eiinNumber', authData.eiinNumber);
        
        if (authDoc) {
          formDataObj.append('verificationDoc', authDoc);
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (isClaiming && existingInst) {
          formDataObj.append('institutionId', existingInst._id);
          formDataObj.append('reason', 'I am the original authority of this institution.');
          await API.post('/institution/claim', formDataObj, config);
          toast.success("Claim request submitted! Admin will verify your documents.");
        } else {
          await API.post('/institution/create', formDataObj, config);
          toast.success("Institution registered! Pending verification.");
        }
        
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900/40 border border-slate-800/60 rounded-[40px] p-8 md:p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        
        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mb-10 border border-slate-800 relative z-10">
          <button 
            onClick={() => switchTab('Student')} 
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-black rounded-xl transition-all duration-300 ${regType === 'Student' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Student
          </button>
          <button 
            onClick={() => switchTab('Authority')} 
            className={`flex-1 py-3 text-xs uppercase tracking-widest font-black rounded-xl transition-all duration-300 ${regType === 'Authority' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Authority
          </button>
        </div>

        <div className="flex items-center justify-between mb-12 relative z-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 flex-1">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${step >= s ? (regType === 'Student' ? 'bg-blue-600' : 'bg-indigo-600') : 'bg-slate-800'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-slate-300' : 'text-slate-600'}`}>Step 0{s}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          
          {regType === 'Student' && (
            <>
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <header>
                    <h2 className="text-3xl font-black text-white tracking-tight">Student Account</h2>
                  </header>
                  <div className="space-y-4">
                    <InputField icon={<User size={20}/>} name="fullName" placeholder="Full Name" value={studentData.fullName} onChange={handleStudentChange} />
                    <InputField icon={<Mail size={20}/>} name="email" type="email" placeholder="Email Address" value={studentData.email} onChange={handleStudentChange} />
                    <InputField icon={<Lock size={20}/>} name="password" type="password" placeholder="Create Password" value={studentData.password} onChange={handleStudentChange} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <header>
                    <h2 className="text-3xl font-black text-white tracking-tight">Academic Info</h2>
                  </header>
                  <div className="space-y-4">
                    <div className="relative group">
                      <BookOpen className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                      <select 
                        name="educationLevel" value={studentData.educationLevel} onChange={handleStudentChange}
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
                        placeholder={studentData.educationLevel === 'University' ? "Year (e.g. 1 or 3)" : "Class (e.g. 8 or 12)"} 
                        value={studentData.currentClass} onChange={handleStudentChange} 
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <header>
                    <h2 className="text-3xl font-black text-white tracking-tight">Institution Space</h2>
                  </header>
                  <div className="space-y-4 relative">
                    <InputField icon={<ShieldCheck size={20}/>} name="referralCode" placeholder="Referral Code (Optional)" value={studentData.referralCode} onChange={handleStudentChange} />
                    <div className="text-center text-slate-600 text-xs font-bold uppercase tracking-widest py-2">— OR —</div>
                    <div className="relative">
                      <InputField icon={<Building2 size={20}/>} name="manualInstitution" placeholder="Institution Name (Manually)" value={studentData.manualInstitution} onChange={handleStudentChange} autoComplete="off" />
                      {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                          {suggestions.map((inst) => (
                            <button key={inst.slug} onClick={() => handleSelectSuggestion(inst.name)} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-blue-600/10 hover:text-blue-400 transition-all text-left">
                              <Search size={14} className="text-slate-500" /> {inst.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {regType === 'Authority' && (
            <>
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <header>
                    <h2 className="text-3xl font-black text-white tracking-tight">Admin Details</h2>
                    <p className="text-slate-400 mt-2 text-sm">Create the primary administrative account.</p>
                  </header>
                  <div className="space-y-4">
                    <InputField icon={<User size={20}/>} name="adminName" placeholder="Admin Full Name" value={authData.adminName} onChange={handleAuthChange} />
                    <InputField icon={<Mail size={20}/>} name="adminEmail" type="email" placeholder="Official Email" value={authData.adminEmail} onChange={handleAuthChange} />
                    <InputField icon={<Lock size={20}/>} name="adminPassword" type="password" placeholder="Admin Password" value={authData.adminPassword} onChange={handleAuthChange} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <header>
                    <h2 className="text-3xl font-black text-white tracking-tight">Institution Details</h2>
                  </header>
                  <div className="space-y-4">
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <select 
                        name="instType" value={authData.instType} onChange={handleAuthChange}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 pl-12 text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                      >
                        <option value="School">School</option>
                        <option value="College">College</option>
                        <option value="University">University</option>
                        <option value="Coaching">Coaching Center</option>
                      </select>
                    </div>

                    <InputField icon={<Building2 size={20}/>} name="instName" placeholder="Institution Full Name" value={authData.instName} onChange={handleAuthChange} autoComplete="off" />
                    
                    {existingInst && (
                      <div className="bg-orange-500/10 border border-orange-500/50 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
                        <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                        <div>
                          <h4 className="text-orange-400 font-bold text-sm">Institution Already Exists!</h4>
                          <p className="text-slate-400 text-xs mt-1">We found "{existingInst.name}" in our database. If you are the true owner, you can claim it directly.</p>
                          <button 
                            onClick={() => setIsClaiming(true)}
                            className={`mt-3 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-lg transition ${isClaiming ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-orange-500 hover:text-white'}`}
                          >
                            {isClaiming ? "✓ Claim Selected" : "Claim Ownership"}
                          </button>
                        </div>
                      </div>
                    )}

                    <InputField icon={<Phone size={20}/>} name="contact" placeholder="Official Contact Number" value={authData.contact} onChange={handleAuthChange} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <header>
                    <h2 className="text-3xl font-black text-white tracking-tight">{isClaiming ? 'Claim Verification' : 'Verification Docs'}</h2>
                    <p className="text-slate-400 mt-2 text-sm">{isClaiming ? 'Provide proof to acquire ownership.' : 'Required for official badge.'}</p>
                  </header>
                  <div className="space-y-4">
                    <InputField 
                      icon={<FileText size={20}/>} name="eiinNumber" 
                      placeholder={authData.instType === 'Coaching' ? "Trade License Number (Optional)" : "EIIN Number"} 
                      value={authData.eiinNumber} onChange={handleAuthChange} 
                    />
                    
                    <label className="cursor-pointer flex flex-col items-center justify-center p-6 border border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-900/50 rounded-2xl bg-slate-950/30 text-center transition-all group">
                      <input 
                        type="file" 
                        accept=".pdf,image/*" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                      {authDoc ? (
                        <>
                          <FileText className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform" size={28} />
                          <p className="text-sm text-indigo-300 font-medium truncate w-full px-4">{authDoc.name}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="text-slate-500 mb-2 group-hover:text-indigo-400 group-hover:scale-110 transition-all" size={28} />
                          <p className="text-sm text-slate-300 font-medium">Click to upload your license or certification document for verification of {authData.instType}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">PDF, JPG or PNG</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </>
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
              onClick={step === 3 ? handleSubmit : nextStep} 
              disabled={loading}
              className={`flex items-center gap-3 px-10 py-4 rounded-full text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${regType === 'Student' ? 'bg-blue-600 hover:bg-blue-500' : (isClaiming ? 'bg-orange-500 hover:bg-orange-400' : 'bg-indigo-600 hover:bg-indigo-500')}`}
            >
              {loading ? "Processing..." : step === 3 ? (isClaiming ? "Submit Claim" : "Complete Setup") : "Next Step"}
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