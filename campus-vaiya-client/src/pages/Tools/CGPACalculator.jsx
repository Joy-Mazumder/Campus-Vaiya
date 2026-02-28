import { useState, useEffect } from "react";
import api from "../../services/api";
import { Plus, Trash2, Save, History, Calculator, Zap, ChevronDown, Eye, X, Book } from "lucide-react";
import toast from "react-hot-toast";

const gradePoints = {
  "A+": 4.00, "A": 3.75, "A-": 3.50, "B+": 3.25, "B": 3.00, "B-": 2.75, "C+": 2.50, "C": 2.25, "D": 2.00, "F": 0.00
};

const CGPACalculator = () => {
  const [subjects, setSubjects] = useState([{ name: "", credit: "", grade: "A+" }]);
  const [semesterName, setSemesterName] = useState("");
  const [history, setHistory] = useState([]);
  const [cumulative, setCumulative] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // নতুন স্টেট: বিস্তারিত দেখার জন্য
  const [selectedHistory, setSelectedHistory] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/tools/gpa-history");
      setHistory(res.data.history);
      setCumulative(res.data.cumulativeCGPA);
      const nextSem = res.data.history.length + 1;
      setSemesterName(`${nextSem}${getOrdinal(nextSem)} Semester`);
    } catch (err) { console.error(err); }
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const addSubject = () => setSubjects([...subjects, { name: "", credit: "", grade: "A+" }]);
  
  const removeSubject = (index) => {
    if (subjects.length > 1) setSubjects(subjects.filter((_, i) => i !== index));
  };

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

  const handleSave = async () => {
    if (!semesterName) return toast.error("Enter Semester Name!");
    setLoading(true);
    const currentGPA = calculateCurrentGPA();
    const totalCredits = subjects.reduce((sum, s) => sum + (parseFloat(s.credit) || 0), 0);
    
    try {
      await api.post("/tools/save-gpa", {
        semesterOrClass: semesterName,
        gpa: currentGPA,
        totalCredits,
        subjects: subjects.map(s => ({ ...s, gradePoint: gradePoints[s.grade] }))
      });
      toast.success(`${semesterName} result saved!`);
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Left: Calculator Form */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-[40px] backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-2xl font-black italic flex items-center gap-3 text-white">
              <Calculator className="text-blue-500" /> GPA <span className="text-blue-500">CALC</span>
            </h2>
            <input 
                type="text" value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                placeholder="e.g. 6th Semester"
                className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-sm outline-none focus:border-blue-500 w-full md:w-auto"
            />
          </div>

          <div className="space-y-3">
            {subjects.map((s, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <input type="text" placeholder="Course Name" className="col-span-5 calc-input" value={s.name} onChange={e => {
                    const newSubs = [...subjects]; newSubs[index].name = e.target.value; setSubjects(newSubs);
                }} />
                <input type="number" placeholder="Credit" className="col-span-3 calc-input" value={s.credit} onChange={e => {
                    const newSubs = [...subjects]; newSubs[index].credit = e.target.value; setSubjects(newSubs);
                }} />
                <div className="col-span-3 relative">
                    <select className="w-full bg-slate-950 border border-slate-800 text-white p-2.5 rounded-xl outline-none appearance-none focus:border-blue-500" value={s.grade} onChange={e => {
                        const newSubs = [...subjects]; newSubs[index].grade = e.target.value; setSubjects(newSubs);
                    }}>
                        {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                <button onClick={() => removeSubject(index)} className="col-span-1 text-slate-600 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={addSubject} className="mt-6 text-blue-500 font-bold flex items-center gap-2 hover:bg-blue-500/10 px-4 py-2 rounded-xl transition-all">
            <Plus size={20} /> Add Subject
          </button>

          <div className="mt-10 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-slate-500 text-xs uppercase font-black tracking-widest mb-1">Semester GPA</p>
              <p className="text-5xl font-black text-blue-500">{calculateCurrentGPA()}</p>
            </div>
            <button onClick={handleSave} disabled={loading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Saving..." : "SAVE RESULT"}
            </button>
          </div>
        </div>

        {/* Right: History & Cumulative */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-500"><Zap size={140}/></div>
             <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Total Cumulative CGPA</p>
             <h3 className="text-8xl font-black tracking-tighter">{cumulative}</h3>
             <div className="mt-6 flex items-center gap-4">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-sm font-bold flex items-center gap-2"><History size={16}/> {history.length} Semesters</div>
             </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-white">
                <Zap size={20} className="text-amber-500" /> Result History
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? history.map(item => (
                <div key={item._id} className="flex justify-between items-center p-5 bg-slate-950/40 border border-slate-800/50 rounded-3xl hover:border-blue-500/30 transition-all group">
                  <div>
                    <h4 className="font-bold text-slate-200">{item.semesterOrClass}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Credits: {item.totalCredits}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-black text-emerald-400">{item.gpa}</div>
                    <button 
                      onClick={() => setSelectedHistory(item)}
                      className="p-2 bg-blue-600/10 text-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-slate-600 italic">No history saved yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- SUBJECT DETAILS MODAL --- */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedHistory(null)}></div>
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-[32px] shadow-2xl z-10 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedHistory.semesterOrClass}</h2>
                <p className="text-xs text-blue-500 font-bold">GPA: {selectedHistory.gpa} • Credits: {selectedHistory.totalCredits}</p>
              </div>
              <button onClick={() => setSelectedHistory(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X/></button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                {selectedHistory.subjects.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                            <Book size={16}/>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-200">{sub.name || "Untitled Subject"}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Credit: {sub.credit}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-emerald-400">{sub.grade}</p>
                        <p className="text-[10px] text-slate-600 font-bold">Point: {sub.gradePoint || gradePoints[sub.grade]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/30 flex justify-end">
                <button 
                  onClick={() => setSelectedHistory(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all"
                >
                    Close View
                </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .calc-input { background: rgba(2, 6, 23, 0.7); border: 1px solid #1e293b; color: white; padding: 12px; border-radius: 16px; outline: none; width: 100%; font-size: 14px; transition: all 0.3s; }
        .calc-input:focus { border-color: #3b82f6; box-shadow: 0 0 10px rgba(59,130,246,0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CGPACalculator;