import { useState } from "react";
import api from "../../services/api";
import { Send, Plus, UserPlus, FileCheck } from "lucide-react";
import toast from "react-hot-toast";

const PublishResult = () => {
  const [studentEmail, setStudentEmail] = useState("");
  const [examName, setExamName] = useState("");
  const [batch, setBatch] = useState("");
  const [subjects, setSubjects] = useState([{ name: "", marks: "", grade: "", point: "" }]);

  const addSubject = () => setSubjects([...subjects, { name: "", marks: "", grade: "", point: "" }]);

  const handlePublish = async (e) => {
    e.preventDefault();
    const totalGPA = (subjects.reduce((sum, s) => sum + parseFloat(s.point), 0) / subjects.length).toFixed(2);
    
    try {
      await api.post("/institution/publish-result", {
        studentEmail, examName, batch, subjects, totalGPA
      });
      toast.success("Result published to student portal! 🎓");
      setSubjects([{ name: "", marks: "", grade: "", point: "" }]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
           <div className="p-4 bg-blue-600/20 rounded-3xl text-blue-500"><FileCheck size={32}/></div>
           <div>
              <h1 className="text-3xl font-black italic">PUBLISH <span className="text-blue-500">RESULTS</span></h1>
              <p className="text-slate-400">Official academic result entry portal</p>
           </div>
        </div>

        <form onSubmit={handlePublish} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Student Email</label>
              <input type="email" required className="res-input" placeholder="student@mail.com" onChange={e => setStudentEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Exam Name</label>
              <input type="text" required className="res-input" placeholder="Final Term 2024" onChange={e => setExamName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Batch</label>
              <input type="text" required className="res-input" placeholder="Batch 24" onChange={e => setBatch(e.target.value)} />
            </div>
          </div>

          <h3 className="font-bold mb-4 text-slate-300">Subject-wise Marks</h3>
          <div className="space-y-4">
            {subjects.map((s, index) => (
              <div key={index} className="grid grid-cols-12 gap-3">
                <input type="text" placeholder="Subject" className="col-span-5 res-input" onChange={e => {
                  const newS = [...subjects]; newS[index].name = e.target.value; setSubjects(newS);
                }} />
                <input type="number" placeholder="Marks" className="col-span-2 res-input" onChange={e => {
                  const newS = [...subjects]; newS[index].marks = e.target.value; setSubjects(newS);
                }} />
                <input type="text" placeholder="G" className="col-span-2 res-input" onChange={e => {
                  const newS = [...subjects]; newS[index].grade = e.target.value; setSubjects(newS);
                }} />
                <input type="number" placeholder="Point" className="col-span-3 res-input" onChange={e => {
                  const newS = [...subjects]; newS[index].point = e.target.value; setSubjects(newS);
                }} />
              </div>
            ))}
          </div>

          <button type="button" onClick={addSubject} className="mt-4 text-blue-500 flex items-center gap-2 font-bold hover:text-blue-400 transition">
             <Plus size={20}/> Add Another Subject
          </button>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl mt-10 font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20">
             <Send size={22}/> Publish to Student Portal
          </button>
        </form>
      </div>
      <style jsx="true">{`
        .res-input {
          width: 100%; background: #020617; border: 1px solid #1e293b; color: white;
          padding: 12px; border-radius: 16px; outline: none; transition: 0.3s;
        }
        .res-input:focus { border-color: #3b82f6; }
      `}</style>
    </div>
  );
};

export default PublishResult;