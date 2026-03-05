import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FileText, Download, Zap, Book, ChevronRight } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

const LabReportGen = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    experimentName: '', date: new Date().toISOString().split('T')[0],
    studentName: user?.fullName, studentId: user?.studentId || '',
    department: user?.educationLevel || '', objective: '', 
    procedure: '', observation: '', conclusion: ''
  });

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/tools/generate-lab-report', data, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report_${data.experimentName}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success("PDF Generated Successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 md:px-10 bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Form Side */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 p-8 rounded-[48px] backdrop-blur-xl shadow-2xl">
           <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <FileText className="text-pink-500" /> Lab Report <span className="text-pink-500">Generator</span>
           </h2>

           <form onSubmit={handleDownload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup label="Experiment Name" placeholder="e.g. Logic Gates" onChange={v => setData({...data, experimentName: v})} />
                 <InputGroup label="Submission Date" type="date" value={data.date} onChange={v => setData({...data, date: v})} />
              </div>
              
              <div className="space-y-4">
                 <TextAreaGroup label="Objective" placeholder="What is the goal of this experiment?" onChange={v => setData({...data, objective: v})} />
                 <TextAreaGroup label="Procedure" placeholder="Step by step steps taken..." onChange={v => setData({...data, procedure: v})} />
                 <TextAreaGroup label="Observation" placeholder="What did you see/calculate?" onChange={v => setData({...data, observation: v})} />
                 <TextAreaGroup label="Conclusion" placeholder="Final summary..." onChange={v => setData({...data, conclusion: v})} />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-500 py-5 rounded-3xl font-black uppercase text-sm tracking-[0.2em] transition-all shadow-xl shadow-pink-600/20 active:scale-95"
              >
                {loading ? "Generating PDF..." : "Generate Official Report"}
              </button>
           </form>
        </div>

        {/* Info/Preview Side */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-gradient-to-br from-pink-600/20 to-indigo-600/20 border border-pink-500/20 p-8 rounded-[40px]">
              <Zap className="text-pink-500 mb-4" />
              <h3 className="text-xl font-black italic uppercase">Pro Formatting</h3>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed font-medium">
                 This tool automatically adds your <span className="text-white font-bold">{user?.institution?.name || 'Institution'}</span> branding and standard academic layout to the PDF.
              </p>
           </div>
           
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-[40px]">
              <h4 className="font-black text-xs uppercase tracking-widest text-slate-500 mb-6 italic">Report Structure</h4>
              <div className="space-y-4">
                 <PreviewItem label="Header" desc="Institution Logo & Name" />
                 <PreviewItem label="Student Meta" desc="Name, ID & Department" />
                 <PreviewItem label="Body" desc="Objective to Conclusion" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const InputGroup = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
    <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-pink-500 transition-all" required />
  </div>
);

const TextAreaGroup = ({ label, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
    <textarea rows="3" placeholder={placeholder} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-pink-500 transition-all" required />
  </div>
);

const PreviewItem = ({ label, desc }) => (
  <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800/50 group">
     <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500"><ChevronRight size={14}/></div>
        <div>
           <p className="text-xs font-bold text-white uppercase">{label}</p>
           <p className="text-[10px] text-slate-600 font-bold">{desc}</p>
        </div>
     </div>
  </div>
);

export default LabReportGen;