import React, { useState, useEffect, useContext } from "react";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { 
  Plus, Trash2, Save, History, Calculator, Zap, 
  ChevronDown, Eye, X, Book, Target, Sparkles, RefreshCw, 
  CheckCircle2, TrendingUp, PlusCircle, ChevronRight 
} from "lucide-react";
import toast from "react-hot-toast";

const gradePoints = {
  "A+": 4.00, "A": 3.75, "A-": 3.50, "B+": 3.25, "B": 3.00, "B-": 2.75, "C+": 2.50, "C": 2.25, "D": 2.00, "F": 0.00
};

const CGPACalculator = () => {
  const { user, setUser } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([{ name: "", credit: "", grade: "A+" }]);
  const [semesterName, setSemesterName] = useState("");
  const [history, setHistory] = useState([]);
  const [cumulative, setCumulative] = useState(0);
  const [totalCreditsEarned, setTotalCreditsEarned] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Prediction States
  const [upcomingSubjects, setUpcomingSubjects] = useState([{ name: "", credit: "" }]);
  const [predictionResult, setPredictionResult] = useState(null);
  const [targetGoal, setTargetGoal] = useState(user?.targetCGPA || 3.50);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/tools/gpa-history");
      setHistory(res.data.history || []);
      setCumulative(parseFloat(res.data.cumulativeCGPA) || 0);
      setTotalCreditsEarned(res.data.totalCredits || 0);
      const nextSem = (res.data.history?.length || 0) + 1;
      setSemesterName(`${nextSem}${getOrdinal(nextSem)} Semester`);
    } catch (err) { console.error("History error:", err); }
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const addSubject = () => setSubjects([...subjects, { name: "", credit: "", grade: "A+" }]);
  const removeSubject = (index) => setSubjects(subjects.filter((_, i) => i !== index));

  const calculateCurrentGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach(s => {
      if (s.credit) {
        totalPoints += (gradePoints[s.grade] * parseFloat(s.credit));
        totalCredits += parseFloat(s.credit);
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const handleUpdateTarget = async () => {
    try {
      const res = await API.put("/users/update-target", { targetCGPA: parseFloat(targetGoal) });
      setUser({ ...user, targetCGPA: res.data.targetCGPA });
      localStorage.setItem('user', JSON.stringify({ ...user, targetCGPA: res.data.targetCGPA }));
      toast.success("Academic Goal Updated!");
    } catch (err) { 
      console.error("Sync Error:", err);
      toast.error(err.response?.data?.message || "Sync failed. Try logging in again."); 
    }
  };

  const handleSave = async () => {
    if (!semesterName) return toast.error("Enter Semester Name!");
    setLoading(true);
    try {
      await API.post("/tools/save-gpa", {
        semesterOrClass: semesterName,
        gpa: calculateCurrentGPA(),
        totalCredits: subjects.reduce((sum, s) => sum + (parseFloat(s.credit) || 0), 0),
        subjects: subjects.map(s => ({ ...s, gradePoint: gradePoints[s.grade] }))
      });
      toast.success("Result Saved!");
      fetchHistory();
    } catch (err) { toast.error("Failed to save"); }
    finally { setLoading(false); }
  };

  const handlePredict = () => {
    const upcomingCredits = upcomingSubjects.reduce((sum, s) => sum + (parseFloat(s.credit) || 0), 0);
    if (upcomingCredits === 0) return toast.error("Add credits first!");

    const currentPoints = cumulative * totalCreditsEarned;
    const totalCreditsAfterSem = totalCreditsEarned + upcomingCredits;
    const requiredTotalPoints = targetGoal * totalCreditsAfterSem;
    const neededPointsInSem = requiredTotalPoints - currentPoints;
    const requiredGPA = neededPointsInSem / upcomingCredits;

    if (requiredGPA > 4) {
      setPredictionResult({ status: "impossible", gpa: requiredGPA.toFixed(2) });
    } else {
      let strategy = [];
      if (requiredGPA > 3.8) strategy = ["High Performance: Consistent A+ required."];
      else if (requiredGPA > 3.5) strategy = ["Moderate: Aim for A/A- mix."];
      else strategy = ["Steady: Maintain B+ average."];

      setPredictionResult({ status: "possible", gpa: requiredGPA.toFixed(2), strategy });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      
      {/* TOP DECORATIVE DESIGN (Banner) */}
      <div className="relative h-64 md:h-80 bg-gradient-to-b from-blue-600/20 via-indigo-600/5 to-transparent flex items-end px-4 md:px-10 pb-10">
         <div className="absolute top-0 left-0 right-0 h-full overflow-hidden opacity-20 pointer-events-none">
            <Sparkles className="absolute top-20 right-20 text-blue-500 animate-pulse" size={200}/>
            <Calculator className="absolute -bottom-10 left-20 text-indigo-500" size={150}/>
         </div>
         <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase">Academic <span className="text-blue-500">Calculator</span></h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Precision Grade Sync & Prediction</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 space-y-12 -mt-10 relative z-10 pb-20">
        
        {/* STATS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800 p-8 rounded-[48px] flex flex-col md:flex-row justify-between items-center gap-8 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-blue-600 rounded-[32px] shadow-xl shadow-blue-600/30"><TrendingUp size={32} /></div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Performance Summary</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase">Database Synced</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <StatBox label="Credits" value={totalCreditsEarned} />
                 <StatBox label="CGPA" value={cumulative.toFixed(2)} highlight />
              </div>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] shadow-2xl flex flex-col justify-center group hover:border-blue-500/50 transition-all">
              <div className="flex justify-between items-center mb-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Target</p>
                 <button onClick={handleUpdateTarget} className="text-[10px] font-black text-blue-500 uppercase hover:underline">Update</button>
              </div>
              <div className="flex items-center gap-3">
                <Target size={24} className="text-amber-500"/>
                <input 
                  type="number" step="0.01" value={targetGoal} 
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="text-5xl font-black bg-transparent text-white outline-none w-full" 
                />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CALCULATOR SIDE */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-slate-900/40 border border-slate-800 p-8 md:p-12 rounded-[56px] shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <PlusCircle className="text-blue-500"/> Input Result
                </h3>
                <input 
                  type="text" value={semesterName} onChange={(e) => setSemesterName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm outline-none focus:border-blue-500 w-full md:w-auto font-black shadow-inner"
                />
              </div>

              <div className="space-y-4">
                {subjects.map((s, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 animate-in fade-in">
                    <input placeholder="Course Name" className="col-span-5 calc-input" value={s.name} onChange={e => {
                        const n = [...subjects]; n[index].name = e.target.value; setSubjects(n);
                    }} />
                    <input type="number" placeholder="Cr" className="col-span-3 calc-input text-center" value={s.credit} onChange={e => {
                        const n = [...subjects]; n[index].credit = e.target.value; setSubjects(n);
                    }} />
                    <div className="col-span-3 relative">
                      <select className="calc-input appearance-none" value={s.grade} onChange={e => {
                          const n = [...subjects]; n[index].grade = e.target.value; setSubjects(n);
                      }}>
                          {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                    <button onClick={() => removeSubject(index)} className="col-span-1 text-slate-600 hover:text-red-500 flex items-center justify-center transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-800/50 pt-10">
                 <button onClick={addSubject} className="flex items-center gap-2 text-blue-500 font-black text-[11px] uppercase hover:bg-blue-600/10 px-8 py-4 rounded-2xl border border-blue-500/20 transition-all active:scale-95">
                   <Plus size={18}/> Add Subject
                 </button>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">GPA Preview</p>
                    <p className="text-7xl font-black text-blue-500 tracking-tighter">{calculateCurrentGPA()}</p>
                 </div>
              </div>

              <button onClick={handleSave} disabled={loading} className="w-full mt-14 bg-blue-600 hover:bg-blue-500 py-7 rounded-[32px] font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-blue-600/40 transition-all active:scale-95">
                {loading ? "Transmitting..." : "Push Result to Database"}
              </button>
            </div>

            {/* PREDICTION ENGINE */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-12 rounded-[64px] shadow-2xl relative overflow-hidden group">
               <h3 className="text-2xl font-black italic mb-10 flex items-center gap-3 uppercase tracking-tighter"><RefreshCw className="text-indigo-500 animate-spin-slow"/> Grade Strategy Generator</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 italic">Enter credits for the next semester to see your strategy for the <span className="text-white font-bold">{targetGoal}</span> target.</p>
                     {upcomingSubjects.map((s, i) => (
                       <div key={i} className="flex gap-2">
                          <input placeholder="Course" className="flex-1 calc-input !py-4" />
                          <input type="number" placeholder="Cr" className="w-20 calc-input !py-4 text-center" onChange={e => {
                             const n = [...upcomingSubjects]; n[i].credit = e.target.value; setUpcomingSubjects(n);
                          }} />
                       </div>
                     ))}
                     <button onClick={() => setUpcomingSubjects([...upcomingSubjects, {name: "", credit: ""}])} className="text-slate-500 text-[10px] font-black uppercase hover:text-white transition-all">+ Add Course</button>
                  </div>

                  <div className="bg-[#020617] border border-slate-800 p-10 rounded-[48px] flex flex-col justify-center items-center text-center shadow-inner">
                     {predictionResult ? (
                        <div className="animate-in zoom-in">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Required GPA</p>
                           <h4 className={`text-7xl font-black tracking-tighter ${predictionResult.status === 'possible' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {predictionResult.gpa}
                           </h4>
                           <div className="mt-8 space-y-3">
                              {predictionResult.strategy?.map((s, idx) => (
                                <p key={idx} className="text-xs font-bold text-slate-300 italic flex items-center gap-2 justify-center">
                                   <CheckCircle2 size={14} className="text-emerald-500"/> {s}
                                </p>
                              ))}
                           </div>
                        </div>
                     ) : (
                        <p className="text-slate-700 text-xs font-black uppercase italic">Pending Data</p>
                     )}
                     <button onClick={handlePredict} className="mt-10 w-full bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-600/30 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all text-indigo-400 hover:text-white">Generate Roadmap</button>
                  </div>
               </div>
            </div>
          </div>

          {/* HISTORY SIDE */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900/60 border border-slate-800 p-10 rounded-[48px] shadow-2xl">
              <h3 className="text-xl font-black mb-10 flex items-center gap-3 uppercase italic text-slate-500">
                <History className="text-blue-500" size={24}/> Sync History
              </h3>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                  <div key={item._id} className="p-7 bg-slate-950 border border-slate-800 rounded-[40px] group hover:border-blue-500/50 transition-all cursor-pointer shadow-inner">
                    <div className="flex justify-between items-start">
                       <div>
                          <h4 className="font-black text-white text-md uppercase tracking-tight">{item.semesterOrClass}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Synced • Cr: {item.totalCredits}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-3xl font-black text-blue-500 tracking-tighter">{item.gpa}</p>
                          <button onClick={() => setSelectedHistory(item)} className="text-[9px] font-black text-slate-600 uppercase mt-2 group-hover:text-blue-400 transition-all flex items-center gap-1 ml-auto">Details <ChevronRight size={10}/></button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedHistory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in duration-300">
           <div className="bg-[#020617] border border-slate-800 w-full max-w-xl rounded-[56px] p-10 md:p-14 shadow-3xl relative">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter">{selectedHistory.semesterOrClass}</h2>
                 <button onClick={() => setSelectedHistory(null)} className="p-3 bg-slate-900 rounded-2xl text-slate-500 hover:text-white transition-all"><X/></button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {selectedHistory.subjects?.map((sub, i) => (
                    <div key={i} className="flex justify-between items-center p-6 bg-slate-900/50 rounded-3xl border border-slate-800/50 hover:border-slate-700 transition-all">
                       <div>
                          <p className="font-black text-slate-200 text-sm">{sub.name || "Untitled Course"}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Credits: {sub.credit}</p>
                       </div>
                       <p className="text-2xl font-black text-blue-500 tracking-tighter">{sub.grade}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      <style jsx="true">{`
        .calc-input { background: rgba(10, 15, 30, 0.9); border: 1px solid #1e293b; color: white; padding: 20px 28px; border-radius: 28px; outline: none; width: 100%; font-size: 14px; font-weight: 700; transition: 0.3s; }
        .calc-input:focus { border-color: #3b82f6; box-shadow: 0 0 20px rgba(59, 130, 246, 0.15); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const StatBox = ({ label, value, highlight }) => (
  <div className={`text-center px-8 py-5 rounded-[32px] border ${highlight ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/30' : 'bg-slate-950 border-slate-800'}`}>
    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-blue-100' : 'text-slate-600'}`}>{label}</p>
    <p className="text-2xl font-black text-white tracking-tight">{value}</p>
  </div>
);

export default CGPACalculator;