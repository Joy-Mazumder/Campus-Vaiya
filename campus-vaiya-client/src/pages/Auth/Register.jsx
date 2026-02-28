import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, User, Mail, Lock, School, GraduationCap, ChevronRight, Building2, UserCircle } from "lucide-react";

const Register = () => {
  const [institutions, setInstitutions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student"); // student or inst_admin
  
  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "",
    institutionType: "", currentClassOrSemester: "",
    instId: "", customInstitutionName: "", referralID: ""
  });

  const [selectedInst, setSelectedInst] = useState(null);
  const navigate = useNavigate();

  // প্রতিষ্ঠানের ধরন অনুযায়ী ক্লাসের লিস্ট
  const classOptions = {
    School: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"],
    College: ["Inter 1st Year", "Inter 2nd Year"],
    University: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Masters"],
    Coaching: ["Academic Batch", "Admission Batch"]
  };

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await api.get("/institution/approved-list");
        setInstitutions(res.data);
      } catch (err) {
        console.error("Failed to load institutions");
      }
    };
    fetchInstitutions();
  }, []);

  const handleInstChange = (e) => {
    const id = e.target.value;
    if (id === "other") {
      setSelectedInst({ name: "Other", _id: "other" });
      setFormData({ ...formData, instId: "", customInstitutionName: "" });
    } else {
      const inst = institutions.find((i) => i._id === id);
      setSelectedInst(inst);
      setFormData({ ...formData, instId: id, customInstitutionName: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing your request...");
    try {
      // Role ও অন্যান্য ডাটা ইনজেক্ট করা
      const finalData = { ...formData, role };
      await api.post("/auth/register", finalData);
      
      toast.success(role === 'student' ? "Welcome! Account created." : "Institution request sent to Admin!", { id: loadingToast });
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[40px] shadow-2xl z-10 my-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white tracking-tight italic">
            CAMPUS<span className="text-blue-500">VAIYA</span>
          </h2>
          <p className="text-slate-400 mt-2">The ultimate ecosystem for students & institutions</p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-8">
          <button 
            onClick={() => setRole("student")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${role === 'student' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <UserCircle size={20}/> Student
          </button>
          <button 
            onClick={() => setRole("inst_admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${role === 'inst_admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Building2 size={20}/> Authority
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="text" placeholder="Full Name" required className="reg-input" onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="email" placeholder="Email Address" required className="reg-input" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              required
              className="reg-input pr-12"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select 
                required
                className="reg-input pl-11 appearance-none cursor-pointer"
                onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
              >
                <option value="">Institution Type</option>
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="University">University</option>
                <option value="Coaching">Coaching / Private Care</option>
              </select>
            </div>

            {role === "student" && (
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select 
                  required
                  className="reg-input pl-11 appearance-none cursor-pointer"
                  onChange={(e) => setFormData({ ...formData, currentClassOrSemester: e.target.value })}
                >
                  <option value="">Class / Semester</option>
                  {formData.institutionType && classOptions[formData.institutionType].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Institution Selection or Custom Input */}
          <div className="space-y-4">
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select className="reg-input pl-11 appearance-none cursor-pointer" onChange={handleInstChange}>
                <option value="">Search / Select Institution</option>
                {institutions.map((inst) => (
                  <option key={inst._id} value={inst._id}>{inst.name}</option>
                ))}
                <option value="other" className="text-blue-400 font-bold">+ Other / Not Listed</option>
              </select>
            </div>

            {(selectedInst?._id === "other" || role === "inst_admin") && (
              <div className="relative animate-in slide-in-from-left-2 duration-300">
                <input 
                  type="text" 
                  placeholder={role === 'inst_admin' ? "Enter your Institution Name to Create" : "Enter your Institution Name"} 
                  required 
                  className="reg-input border-blue-500/30 bg-blue-500/5"
                  onChange={(e) => setFormData({ ...formData, customInstitutionName: e.target.value })}
                />
              </div>
            )}
          </div>

          {selectedInst?.isReferralRequired && role === "student" && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <label className="text-xs font-bold text-amber-500 uppercase ml-1 block mb-2">Referral ID Required</label>
              <input
                type="text"
                placeholder="Enter ID provided by your institution"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:border-amber-500 outline-none"
                onChange={(e) => setFormData({ ...formData, referralID: e.target.value })}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group transition-all"
          >
            {role === "student" ? "Complete Registration" : "Apply for Institution Space"}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400">
          Already using CampusVaiya? <Link to="/login" className="text-blue-500 font-bold hover:underline">Login</Link>
        </p>
      </div>

      <style jsx="true">{`
        .reg-input {
          width: 100%;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid rgba(30, 41, 59, 1);
          color: white;
          padding: 12px 12px 12px 44px;
          border-radius: 16px;
          outline: none;
          transition: all 0.3s;
        }
        .reg-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        select option {
          background: #0f172a;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Register;