import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, LogIn, ChevronRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Verifying credentials...");

    try {
      await login(email, password);
      toast.success("Welcome back to CampusVaiya!", { id: loadingToast });
      navigate("/dashboard");
    } catch (err) {
      setIsSubmitting(false);
      const errMsg = err.response?.data?.message || "Invalid email or password";
      toast.error(errMsg, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      {/* Background Decorative Blobs - matching Register page */}
      <div className="absolute top-[-10%], right-[-10%] w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px]"></div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-8 rounded-3xl shadow-2xl z-10 transition-all">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/10 rounded-2xl border border-blue-500/20 mb-4">
            <LogIn className="text-blue-500" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome <span className="text-blue-500">Back</span>
          </h2>
          <p className="text-slate-400 mt-2">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative group">
            <label className="text-xs font-semibold text-slate-500 uppercase ml-1 mb-2 block tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="email"
                placeholder="name@university.edu"
                required
                className="w-full bg-slate-950/50 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="flex justify-between items-center ml-1 mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <Link to="/forgot-password" size={18} className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950/50 border border-slate-800 text-white pl-12 pr-12 py-3.5 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
            {!isSubmitting && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:text-blue-400 font-bold underline underline-offset-8 decoration-2 decoration-blue-500/30 hover:decoration-blue-500 transition-all">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;