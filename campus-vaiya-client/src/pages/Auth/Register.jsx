import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, User, Mail, Lock, School, GraduationCap, ChevronRight } from "lucide-react";

const Register = () => {
    const [institutions, setInstitutions] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "", email: "", password: "",
        instId: "", referralID: "", studentClass: ""
    });
    const [selectedInst, setSelectedInst] = useState(null);
    const navigate = useNavigate();

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
        const inst = institutions.find((i) => i._id === id);
        setSelectedInst(inst);
        setFormData({ ...formData, instId: id });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Creating your account...");
        try {
            await api.post("/auth/register", formData);
            toast.success("Account created! Welcome to the family.", { id: loadingToast });
            navigate("/login");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed", { id: loadingToast });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px]"></div>

            <div className="w-full max-w-xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl z-10">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">
                        Join <span className="text-blue-500">CampusVaiya</span>
                    </h2>
                    <p className="text-slate-400 mt-2">Empowering students through collaboration</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Full Name */}
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            className="w-full bg-slate-950/50 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            className="w-full bg-slate-950/50 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* Password with Toggle */}
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input
                            type={showPassword ? "text" : "password"} // true হলে text (দেখা যাবে), false হলে password (লুকানো)
                            placeholder="Create Password"
                            required
                            autoComplete="new-password"
                            className="w-full bg-slate-950/50 border border-slate-800 text-white pl-11 pr-12 py-3 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                            type="button"
                            tabIndex="-1"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all p-1 z-20"
                        >
                            {}
                            {showPassword ? (
                                <Eye size={20} className="animate-in fade-in duration-200" /> // পাসওয়ার্ড দেখা গেলে খোলা চোখ
                            ) : (
                                <EyeOff size={20} className="animate-in fade-in duration-200" /> // পাসওয়ার্ড লুকানো থাকলে বন্ধ চোখ
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* University Selection */}
                        <div className="relative">
                            <School className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <select
                                className="w-full bg-slate-950/50 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                onChange={handleInstChange}
                            >
                                <option value="" className="bg-slate-900">Select Institution</option>
                                {institutions.map((inst) => (
                                    <option key={inst._id} value={inst._id} className="bg-slate-900">
                                        {inst.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Class/Semester */}
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Class/Semester"
                                className="w-full bg-slate-950/50 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:border-blue-500 outline-none"
                                onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Conditional Referral ID */}
                    {selectedInst?.isReferralRequired && (
                        <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-amber-500 font-bold">#</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter Referral ID (Required by Institution)"
                                required
                                className="w-full bg-amber-500/5 border border-amber-500/30 text-amber-200 pl-11 pr-4 py-3 rounded-xl focus:border-amber-500 outline-none placeholder:text-amber-700"
                                onChange={(e) => setFormData({ ...formData, referralID: e.target.value })}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98]"
                    >
                        Create Account
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400">
                        Already a member?{" "}
                        <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold underline underline-offset-4">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;