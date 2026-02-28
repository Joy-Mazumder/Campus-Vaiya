import { useState } from "react";
import api from "../../services/api";
import { FileText, Map, Send, Download, Sparkles, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

const Tools = () => {
  const [activeTab, setActiveTab] = useState("lab"); // 'lab' or 'ai'
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  // Lab Report State
  const [labData, setLabData] = useState({
    experimentName: "", date: "", apparatus: "", procedure: "", observation: "", conclusion: ""
  });

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/tools/lab-report", labData, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${labData.experimentName}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("Lab Report Generated! 📥");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const [aiGoal, setAiGoal] = useState("");
  const handleAiRoadmap = async () => {
    if (!aiGoal) return toast.error("Enter your goal first!");
    setLoading(true);
    try {
      const res = await api.post("/tools/ai-roadmap", { goal: aiGoal, currentSemester: "Current" });
      setAiResponse(res.data.roadmap);
      toast.success("Roadmap Generated! 🚀");
    } catch (err) {
      toast.error("AI is busy, try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-3 italic">
          STUDENT <span className="text-blue-500">TOOLKIT</span> <Wand2 className="text-blue-500"/>
        </h1>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mb-10 w-fit mx-auto">
          <button 
            onClick={() => setActiveTab("lab")}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'lab' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText size={18}/> Lab Report
          </button>
          <button 
            onClick={() => setActiveTab("ai")}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Sparkles size={18}/> AI Roadmap
          </button>
        </div>

        {/* --- Lab Report Form --- */}
        {activeTab === "lab" && (
          <form onSubmit={handleLabSubmit} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] space-y-6 backdrop-blur-xl">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Experiment Name" placeholder="Ohm's Law" onChange={val => setLabData({...labData, experimentName: val})} />
                <InputGroup label="Date" type="date" onChange={val => setLabData({...labData, date: val})} />
             </div>
             <TextAreaGroup label="Apparatus" placeholder="Resistor, Voltmeter, Battery..." onChange={val => setLabData({...labData, apparatus: val})} />
             <TextAreaGroup label="Procedure" placeholder="Step by step process..." onChange={val => setLabData({...labData, procedure: val})} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextAreaGroup label="Observation" placeholder="Data points..." onChange={val => setLabData({...labData, observation: val})} />
                <TextAreaGroup label="Conclusion" placeholder="Final result..." onChange={val => setLabData({...labData, conclusion: val})} />
             </div>
             <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all">
                {loading ? "Generating PDF..." : <><Download size={20}/> Generate Standard PDF</>}
             </button>
          </form>
        )}

        {/* --- AI Roadmap Section --- */}
        {activeTab === "ai" && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] flex flex-col md:flex-row gap-4">
                <input 
                  type="text" placeholder="I want to become a Full Stack Developer..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500"
                  value={aiGoal} onChange={e => setAiGoal(e.target.value)}
                />
                <button 
                  onClick={handleAiRoadmap} disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "AI is Thinking..." : <><Send size={18}/> Generate</>}
                </button>
             </div>

             {aiResponse && (
               <div className="bg-slate-900/60 border border-blue-500/20 p-8 rounded-[32px] prose prose-invert max-w-none shadow-2xl">
                  <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2 underline underline-offset-8 decoration-blue-500/30">
                    <Map size={24}/> Your Custom Roadmap
                  </h3>
                  <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
                    {aiResponse}
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components
const InputGroup = ({ label, placeholder, type="text", onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type} placeholder={placeholder} 
      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none transition-all"
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const TextAreaGroup = ({ label, placeholder, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <textarea 
      placeholder={placeholder} rows="3"
      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 focus:border-blue-500 outline-none transition-all"
      onChange={e => onChange(e.target.value)}
    ></textarea>
  </div>
);

export default Tools;