import React, { useState, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  FileText, Download, Zap, Layout, ClipboardList, Sparkles,
  CheckCircle, Palette, AlignLeft, Eye, X, Upload, ImageIcon,
  ChevronRight, Info, BookOpen
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'lab',        label: 'Lab Report', icon: <FileText size={14}/>,      accent: '#ec4899', dark: '#831843' },
  { id: 'cover',      label: 'Cover Page', icon: <Layout size={14}/>,         accent: '#6366f1', dark: '#312e81' },
  { id: 'assignment', label: 'Assignment', icon: <ClipboardList size={14}/>,  accent: '#22c55e', dark: '#14532d' },
];

// ── Styles ───────────────────────────────────────────────────────────────────
const STYLES = [
  { id: 'university', label: 'University', icon: '🏛️', desc: 'Real academic cover with "Submitted to / by" blocks' },
  { id: 'classic',    label: 'Classic',    icon: '📄', desc: 'Traditional double-border — universally accepted' },
  { id: 'modern',     label: 'Modern',     icon: '🌑', desc: 'Dark navy top, white body, blue accent stripe' },
  { id: 'minimal',    label: 'Minimal',    icon: '✦',  desc: 'Left accent bar, large type, clean whitespace' },
  { id: 'bold',       label: 'Bold',       icon: '⬡',  desc: 'Full dark with geometric accents and info card' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const toBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

const blobToUrl = (data) =>
  window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));

const triggerDownload = (url, filename) => {
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
};

// ════════════════════════════════════════════════════════════════════════════
const LabReportGen = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('lab');
  const [loading, setLoading] = useState(false);

  // Preview modal
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewFilename, setPreviewFilename] = useState('document.pdf');

  // Logo state (shared across all tabs)
  const [logoBase64, setLogoBase64] = useState('');
  const [logoName, setLogoName] = useState('');
  const logoRef = useRef();

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo must be under 2 MB');
    const b64 = await toBase64(file);
    setLogoBase64(b64);
    setLogoName(file.name);
    toast.success('Logo loaded!');
  };

  // ── State per tab ─────────────────────────────────────────────────────────
  const [lab, setLab] = useState({
    experimentName: '', experimentNo: '',
    date: new Date().toISOString().split('T')[0],
    studentName: user?.fullName || '', studentId: user?.studentId || '',
    department: user?.educationLevel || '', course: '', courseCode: '',
    instructor: '', style: 'university',
    objective: '', apparatus: '', procedure: '',
    observation: '', dataTable: '', discussion: '', conclusion: '',
  });

  const [cover, setCover] = useState({
    title: '', subtitle: '',
    studentName: user?.fullName || '', studentId: user?.studentId || '',
    department: user?.educationLevel || '', course: '', courseCode: '',
    instructor: '', date: new Date().toISOString().split('T')[0],
    style: 'university',
  });

  const [assign, setAssign] = useState({
    title: '', subject: '', courseCode: '', instructor: '',
    studentName: user?.fullName || '', studentId: user?.studentId || '',
    department: user?.educationLevel || '',
    date: new Date().toISOString().split('T')[0],
    content: '', style: 'university', includeLines: false,
  });

  // ── API call helper ───────────────────────────────────────────────────────
  const callApi = useCallback(async (endpoint, payload) => {
    const res = await API.post(endpoint, { ...payload, logoBase64 }, { responseType: 'blob' });
    return res.data;
  }, [logoBase64]);

  const openPreview = async (endpoint, payload, filename) => {
    setLoading(true);
    try {
      const blob = await callApi(endpoint, payload);
      const url  = blobToUrl(blob);
      if (previewUrl) window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      setPreviewFilename(filename);
    } catch { toast.error('Preview failed — check your fields'); }
    finally { setLoading(false); }
  };

  const currentTab = TABS.find(t => t.id === activeTab);
  const accent = currentTab.accent;

  const handlePreview = (e) => {
    e.preventDefault();
    if (activeTab === 'lab') {
      openPreview('/tools/generate-lab-report', lab,
        `Lab_Report_${lab.experimentName || 'report'}.pdf`);
    } else if (activeTab === 'cover') {
      openPreview('/tools/generate-cover-page', cover,
        `Cover_${cover.title || 'page'}.pdf`);
    } else {
      openPreview('/tools/generate-assignment', assign,
        `Assignment_${assign.title || 'doc'}.pdf`);
    }
  };

  // ── WHAT'S INCLUDED sidebar content ──────────────────────────────────────
  const sidebarFeatures = {
    lab: [
      ['University Cover Page', 'Logo, institution name, student details'],
      ['7 Content Sections',    'Each section on its own clean page'],
      ['Page Numbers',          'Professional footer on every page'],
      ['5 Style Options',       'University, Classic, Modern, Minimal, Bold'],
      ['Logo Support',          'Upload your institution logo'],
    ],
    cover: [
      ['5 Unique Styles',       'University, Classic, Modern, Minimal, Bold'],
      ['Logo Embed',            'Your institution logo at the top'],
      ['Full Info Block',       'Name, ID, Course, Dept, Date'],
      ['Print-ready A4',        'Correct margins and layout'],
    ],
    assignment: [
      ['Cover + Body in One PDF','Cover page + typed content together'],
      ['5 Cover Styles',        'University, Classic, Modern, Minimal, Bold'],
      ['Logo Support',          'Upload your uni logo'],
      ['Optional Writing Lines','Ruled lines below content for handwriting'],
    ],
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-black uppercase tracking-widest text-slate-500">
            <Sparkles size={11}/> Academic PDF Studio
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
            Document <span style={{color: accent}}>Generator</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Professional, print-ready PDFs — preview before you download.
          </p>
        </div>

        {/* ── TAB BAR ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200"
              style={activeTab === t.id
                ? { background: t.accent, color: '#fff', boxShadow: `0 6px 24px ${t.accent}50` }
                : { background: 'rgba(255,255,255,0.03)', color: '#475569', border: '1px solid rgba(255,255,255,0.06)' }
              }>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── LOGO UPLOAD BANNER ─────────────────────────────────────── */}
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer group"
          style={{background: '#ffffff03'}}
          onClick={() => logoRef.current?.click()}>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange}/>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
            style={{background: accent + '15', border: `1px solid ${accent}25`}}>
            {logoBase64
              ? <img src={logoBase64} className="w-full h-full object-contain rounded-xl" alt="logo"/>
              : <Upload size={16} style={{color: accent}}/>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-300 group-hover:text-white transition-colors">
              {logoBase64 ? `Logo: ${logoName}` : 'Upload Institution Logo (Optional)'}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">Appears at the top of the cover page · JPEG or PNG · max 2 MB</p>
          </div>
          {logoBase64 && (
            <button onClick={e => { e.stopPropagation(); setLogoBase64(''); setLogoName(''); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <X size={14}/>
            </button>
          )}
        </div>

        {/* ── MAIN GRID ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* FORM PANEL */}
          <div className="lg:col-span-8">
            <form onSubmit={handlePreview}>
              <div className="relative rounded-[32px] border border-white/[0.07] overflow-hidden"
                style={{background: 'linear-gradient(160deg, #0d1224, #0a0f1e)'}}>
                <div className="h-px" style={{background: `linear-gradient(90deg, transparent, ${accent}90, transparent)`}}/>

                <div className="p-8 space-y-7">

                  {/* ── LAB REPORT FIELDS ───────────────────────────── */}
                  {activeTab === 'lab' && (<>
                    <FieldSection icon={<Info size={13}/>} title="Experiment Info" accent={accent}>
                      <div className="grid grid-cols-2 gap-4">
                        <F label="Experiment Name" span={2}>
                          <input className="di" placeholder="e.g. Verification of Logic Gates" required
                            value={lab.experimentName} onChange={e => setLab({...lab, experimentName: e.target.value})}/>
                        </F>
                        <F label="Experiment No.">
                          <input className="di" placeholder="e.g. 04"
                            value={lab.experimentNo} onChange={e => setLab({...lab, experimentNo: e.target.value})}/>
                        </F>
                        <F label="Date">
                          <input type="date" className="di" value={lab.date}
                            onChange={e => setLab({...lab, date: e.target.value})}/>
                        </F>
                        <F label="Student Name">
                          <input className="di" required value={lab.studentName}
                            onChange={e => setLab({...lab, studentName: e.target.value})}/>
                        </F>
                        <F label="Student ID">
                          <input className="di" placeholder="e.g. 231-115-049"
                            value={lab.studentId} onChange={e => setLab({...lab, studentId: e.target.value})}/>
                        </F>
                        <F label="Department">
                          <input className="di" placeholder="e.g. CSE"
                            value={lab.department} onChange={e => setLab({...lab, department: e.target.value})}/>
                        </F>
                        <F label="Course">
                          <input className="di" placeholder="Course name"
                            value={lab.course} onChange={e => setLab({...lab, course: e.target.value})}/>
                        </F>
                        <F label="Course Code">
                          <input className="di" placeholder="e.g. CSE 2201"
                            value={lab.courseCode} onChange={e => setLab({...lab, courseCode: e.target.value})}/>
                        </F>
                        <F label="Instructor" span={2}>
                          <input className="di" placeholder="Submitted to (teacher's name)"
                            value={lab.instructor} onChange={e => setLab({...lab, instructor: e.target.value})}/>
                        </F>
                      </div>
                    </FieldSection>

                    <FieldSection icon={<AlignLeft size={13}/>} title="Report Content" accent={accent}>
                      <div className="space-y-4">
                        {[
                          { k: 'objective',   l: 'Objective *',             p: 'State the goal of this experiment...',            r: true  },
                          { k: 'apparatus',   l: 'Apparatus / Materials',   p: 'List equipment and materials used...',            r: false },
                          { k: 'procedure',   l: 'Procedure *',             p: 'Step-by-step process...',                        r: true  },
                          { k: 'observation', l: 'Observation *',           p: 'What did you observe or measure?',               r: true  },
                          { k: 'dataTable',   l: 'Data Table (Optional)',   p: 'Paste tabular data or recorded values...',       r: false },
                          { k: 'discussion',  l: 'Discussion (Optional)',   p: 'Analysis and interpretation of results...',      r: false },
                          { k: 'conclusion',  l: 'Conclusion *',            p: 'Final summary and key findings...',              r: true  },
                        ].map(f => (
                          <F key={f.k} label={f.l}>
                            <textarea rows={3} className="di resize-y" placeholder={f.p} required={f.r}
                              value={lab[f.k]} onChange={e => setLab({...lab, [f.k]: e.target.value})}/>
                          </F>
                        ))}
                      </div>
                    </FieldSection>
                  </>)}

                  {/* ── COVER PAGE FIELDS ───────────────────────────── */}
                  {activeTab === 'cover' && (
                    <FieldSection icon={<Layout size={13}/>} title="Cover Page Details" accent={accent}>
                      <div className="grid grid-cols-2 gap-4">
                        <F label="Main Title" span={2}>
                          <input className="di" placeholder="e.g. Fluid Mechanics Lab Report" required
                            value={cover.title} onChange={e => setCover({...cover, title: e.target.value})}/>
                        </F>
                        <F label="Subtitle (Optional)" span={2}>
                          <input className="di" placeholder="e.g. Mid-Term Submission, Experiment 3"
                            value={cover.subtitle} onChange={e => setCover({...cover, subtitle: e.target.value})}/>
                        </F>
                        <F label="Student Name">
                          <input className="di" required value={cover.studentName}
                            onChange={e => setCover({...cover, studentName: e.target.value})}/>
                        </F>
                        <F label="Student ID">
                          <input className="di" placeholder="e.g. 231-115-049"
                            value={cover.studentId} onChange={e => setCover({...cover, studentId: e.target.value})}/>
                        </F>
                        <F label="Department">
                          <input className="di" placeholder="e.g. EEE"
                            value={cover.department} onChange={e => setCover({...cover, department: e.target.value})}/>
                        </F>
                        <F label="Course">
                          <input className="di" placeholder="Course name"
                            value={cover.course} onChange={e => setCover({...cover, course: e.target.value})}/>
                        </F>
                        <F label="Course Code">
                          <input className="di" placeholder="e.g. EEE 3401"
                            value={cover.courseCode} onChange={e => setCover({...cover, courseCode: e.target.value})}/>
                        </F>
                        <F label="Submitted To">
                          <input className="di" placeholder="Instructor's name & designation"
                            value={cover.instructor} onChange={e => setCover({...cover, instructor: e.target.value})}/>
                        </F>
                        <F label="Date">
                          <input type="date" className="di" value={cover.date}
                            onChange={e => setCover({...cover, date: e.target.value})}/>
                        </F>
                      </div>
                    </FieldSection>
                  )}

                  {/* ── ASSIGNMENT FIELDS ───────────────────────────── */}
                  {activeTab === 'assignment' && (<>
                    <FieldSection icon={<ClipboardList size={13}/>} title="Assignment Details" accent={accent}>
                      <div className="grid grid-cols-2 gap-4">
                        <F label="Assignment Title" span={2}>
                          <input className="di" placeholder="e.g. Overview of Data Structures" required
                            value={assign.title} onChange={e => setAssign({...assign, title: e.target.value})}/>
                        </F>
                        <F label="Subject">
                          <input className="di" placeholder="Subject name"
                            value={assign.subject} onChange={e => setAssign({...assign, subject: e.target.value})}/>
                        </F>
                        <F label="Course Code">
                          <input className="di" placeholder="e.g. CSE 2101"
                            value={assign.courseCode} onChange={e => setAssign({...assign, courseCode: e.target.value})}/>
                        </F>
                        <F label="Student Name">
                          <input className="di" required value={assign.studentName}
                            onChange={e => setAssign({...assign, studentName: e.target.value})}/>
                        </F>
                        <F label="Student ID">
                          <input className="di" placeholder="e.g. 231-115-049"
                            value={assign.studentId} onChange={e => setAssign({...assign, studentId: e.target.value})}/>
                        </F>
                        <F label="Department">
                          <input className="di" placeholder="e.g. CSE"
                            value={assign.department} onChange={e => setAssign({...assign, department: e.target.value})}/>
                        </F>
                        <F label="Submitted To">
                          <input className="di" placeholder="Teacher's name"
                            value={assign.instructor} onChange={e => setAssign({...assign, instructor: e.target.value})}/>
                        </F>
                        <F label="Date">
                          <input type="date" className="di" value={assign.date}
                            onChange={e => setAssign({...assign, date: e.target.value})}/>
                        </F>
                      </div>
                    </FieldSection>

                    <FieldSection icon={<AlignLeft size={13}/>} title="Assignment Body" accent={accent}>
                      <F label="Content (leave blank for cover-only PDF)">
                        <textarea rows={8} className="di resize-y"
                          placeholder="Type or paste your assignment content here. Supports long paragraphs and multiple sections..."
                          value={assign.content}
                          onChange={e => setAssign({...assign, content: e.target.value})}/>
                      </F>

                      {/* Writing lines toggle */}
                      <label className="flex items-center gap-3 cursor-pointer group w-fit mt-2">
                        <div className="relative w-11 h-6 flex-shrink-0">
                          <input type="checkbox" className="sr-only"
                            checked={assign.includeLines}
                            onChange={e => setAssign({...assign, includeLines: e.target.checked})}/>
                          <div className="w-full h-full rounded-full transition-all"
                            style={{background: assign.includeLines ? accent : '#1e293b',
                                    border: `1px solid ${assign.includeLines ? accent : 'rgba(255,255,255,0.08)'}`}}>
                            <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-all"
                              style={{left: assign.includeLines ? '22px' : '2px'}}/>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                          Add ruled writing lines below content
                        </span>
                      </label>
                    </FieldSection>
                  </>)}

                  {/* ── STYLE PICKER ─────────────────────────────────── */}
                  <FieldSection icon={<Palette size={13}/>} title="Cover Style" accent={accent}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {STYLES.map(s => {
                        const activeStyle =
                          activeTab === 'lab' ? lab.style :
                          activeTab === 'cover' ? cover.style : assign.style;
                        const setStyle = (v) =>
                          activeTab === 'lab'   ? setLab({...lab, style: v}) :
                          activeTab === 'cover' ? setCover({...cover, style: v}) :
                          setAssign({...assign, style: v});
                        const isActive = activeStyle === s.id;
                        return (
                          <button key={s.id} type="button" onClick={() => setStyle(s.id)}
                            className="p-3.5 rounded-2xl border text-left transition-all"
                            style={isActive
                              ? { borderColor: accent, background: accent + '14', boxShadow: `0 0 0 1px ${accent}` }
                              : { borderColor: 'rgba(255,255,255,0.07)', background: '#ffffff03' }
                            }>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-lg leading-none">{s.icon}</span>
                              {isActive && <CheckCircle size={11} style={{color: accent}}/>}
                            </div>
                            <p className="text-[11px] font-black text-white mb-0.5">{s.label}</p>
                            <p className="text-[9px] text-slate-600 leading-tight">{s.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </FieldSection>

                  {/* ── PREVIEW + DOWNLOAD BUTTONS ───────────────────── */}
                  <div className="flex gap-3">
                    <button type="submit" disabled={loading}
                      className="flex-1 py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2 border"
                      style={{
                        background: loading ? '#0f172a' : 'transparent',
                        borderColor: loading ? 'rgba(255,255,255,0.06)' : accent,
                        color: loading ? '#475569' : accent,
                        boxShadow: loading ? 'none' : `0 0 0 1px ${accent}30`,
                      }}>
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin"/> Generating...</>
                        : <><Eye size={15}/> Preview PDF</>}
                    </button>

                    {/* Direct download without preview */}
                    <button type="button" disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const ep = activeTab === 'lab' ? '/tools/generate-lab-report' :
                                     activeTab === 'cover' ? '/tools/generate-cover-page' : '/tools/generate-assignment';
                          const payload = activeTab === 'lab' ? lab : activeTab === 'cover' ? cover : assign;
                          const blob = await callApi(ep, payload);
                          const url = blobToUrl(blob);
                          triggerDownload(url, previewFilename || 'document.pdf');
                          window.URL.revokeObjectURL(url);
                          toast.success('PDF downloaded!');
                        } catch { toast.error('Download failed'); }
                        finally { setLoading(false); }
                      }}
                      className="px-6 py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      style={{
                        background: loading ? '#0f172a' : `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                        boxShadow: loading ? 'none' : `0 8px 24px ${accent}40`,
                      }}>
                      <Download size={15}/>
                    </button>
                  </div>

                </div>
              </div>
            </form>
          </div>

          {/* ── SIDEBAR ─────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Feature highlight */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-7"
              style={{background: 'linear-gradient(135deg, #0d1224, #0a0f1e)'}}>
              <div className="absolute top-0 right-0 w-44 h-44 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3"
                style={{background: accent + '25'}}/>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{background: accent + '15', border: `1px solid ${accent}30`}}>
                  <Zap size={17} style={{color: accent}}/>
                </div>
                <h3 className="text-sm font-black uppercase mb-2 text-white">
                  {activeTab === 'lab' ? 'Lab Report PDF' :
                   activeTab === 'cover' ? 'Cover Page PDF' : 'Assignment PDF'}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {activeTab === 'lab'
                    ? 'Fill the form, preview the document, pick your favourite style, then download. Each section lives on its own page — no blank pages.'
                    : activeTab === 'cover'
                    ? 'Choose from 5 styles including "University" style which mirrors real academic cover pages. Add your logo for a truly professional look.'
                    : 'Generates a styled cover + your assignment body in a single PDF. Toggle writing lines if you plan to print and write by hand.'}
                </p>
              </div>
            </div>

            {/* What's included */}
            <div className="rounded-3xl border border-white/[0.07] p-7"
              style={{background: 'linear-gradient(135deg, #0d1224, #0a0f1e)'}}>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-5">What's Included</p>
              <div className="space-y-2.5">
                {(sidebarFeatures[activeTab] || []).map(([label, desc], i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.05]"
                    style={{background: '#ffffff02'}}>
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{background: accent + '20'}}>
                      <CheckCircle size={10} style={{color: accent}}/>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white">{label}</p>
                      <p className="text-[9px] text-slate-600 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institution chip */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.07]"
              style={{background: '#ffffff03'}}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
                <CheckCircle size={14} className="text-emerald-400"/>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Auto Institution</p>
                <p className="text-sm font-bold text-white truncate">{user?.institution?.name || 'CampusVaiya Academics'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREVIEW MODAL ──────────────────────────────────────────────── */}
      {previewUrl && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[90vh] flex flex-col rounded-[28px] overflow-hidden border border-white/[0.1] shadow-2xl"
            style={{background: '#0a0f1e'}}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{background: accent + '20'}}>
                  <Eye size={14} style={{color: accent}}/>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Preview</p>
                  <p className="text-sm font-black text-white">{previewFilename}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { triggerDownload(previewUrl, previewFilename); toast.success('Downloading…'); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all"
                  style={{background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 6px 20px ${accent}40`}}>
                  <Download size={13}/> Download
                </button>
                <button
                  onClick={() => { window.URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white border border-white/[0.08] hover:border-white/[0.2] transition-all">
                  <X size={16}/>
                </button>
              </div>
            </div>

            {/* PDF iframe */}
            <div className="flex-1 overflow-hidden bg-[#1a1a2e] p-3">
              <iframe
                src={previewUrl + '#toolbar=1&navpanes=0'}
                className="w-full h-full rounded-xl"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      <DocStyles accent={accent}/>
    </div>
  );
};

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

const FieldSection = ({ icon, title, accent, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{background: accent + '15', color: accent}}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
      <div className="flex-1 h-px bg-white/[0.05]"/>
    </div>
    {children}
  </div>
);

// Field wrapper — span=2 makes it full width in a 2-col grid
const F = ({ label, children, span }) => (
  <div className={`space-y-1.5${span === 2 ? ' col-span-2' : ''}`}>
    <label className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-0.5">{label}</label>
    {children}
  </div>
);

const DocStyles = ({ accent }) => (
  <style>{`
    .di {
      width: 100%;
      background: #080d18;
      border: 1px solid rgba(255,255,255,0.07);
      color: #e2e8f0;
      padding: 12px 15px;
      border-radius: 12px;
      outline: none;
      font-size: 13px;
      font-weight: 500;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .di:focus {
      border-color: ${accent || '#6366f1'};
      box-shadow: 0 0 0 3px ${(accent || '#6366f1') + '18'};
    }
    .di::placeholder { color: #1e293b; }
    textarea.di { min-height: 82px; }
    input[type="date"].di { color-scheme: dark; }
    select.di option { background: #0a0f1e; }
  `}</style>
);

export default LabReportGen;
