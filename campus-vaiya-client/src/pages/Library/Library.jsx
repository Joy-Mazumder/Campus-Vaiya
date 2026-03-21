import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, BookOpen, Download, X, Eye, EyeOff, FileText, UploadCloud, 
  PenTool, CheckCircle, ShieldCheck, ThumbsUp, Bookmark, 
  BookmarkCheck, Trash2, Clock, Info, Link2, User, LayoutGrid, MessageSquare, Star,
  FileQuestion, ScrollText, Library as LibraryIcon, GraduationCap, ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// --- IMPROVED HELPER FUNCTION ---
const base64ToBlob = (dataURI) => {
  try {
    // Check if it's a data URI or just a raw base64 string
    const isDataURI = dataURI.startsWith('data:');
    let mimeType = 'application/pdf';
    let base64Str = dataURI;

    if (isDataURI) {
      const splitIndex = dataURI.indexOf(',');
      const mimeMatch = dataURI.match(/^data:([^;]+);/);
      mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
      base64Str = dataURI.slice(splitIndex + 1);
    }
    
    const byteString = atob(base64Str);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  } catch (error) {
    console.error("Blob conversion error:", error);
    return null;
  }
};

const Library = () => {
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null); 
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('lib_user_name') || '');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem('campus_lib_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedItems, setSavedItems] = useState(() => JSON.parse(localStorage.getItem('lib_saved') || '[]'));
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(5);

  // Sync Persistence
  useEffect(() => {
    localStorage.setItem('campus_lib_v4', JSON.stringify(resources));
    localStorage.setItem('lib_saved', JSON.stringify(savedItems));
    if(currentUser) localStorage.setItem('lib_user_name', currentUser);
  }, [resources, savedItems, currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const categories = ["CSE", "EEE", "Mechanical", "Civil", "Business", "Mathematics", "Physics", "Other"];
  
  const resourceTypeOptions = [
    { label: "Book", icon: <LibraryIcon size={20} /> },
    { label: "Notes", icon: <ScrollText size={20} /> },
    { label: "Question Bank", icon: <FileQuestion size={20} /> },
    { label: "Handout", icon: <GraduationCap size={20} /> },
    { label: "Lab Report", icon: <FileText size={20} /> },
    { label: "Other", icon: <LayoutGrid size={20} /> },
  ];

  const [formData, setFormData] = useState({
    title: '', author: '', uploaderName: currentUser, resourceType: 'Book', 
    category: 'CSE', courseCode: '', uploadMethod: 'file', link: '', file: null
  });

  // --- HANDLERS ---
  
  const handleToggleVisibility = (e, id) => {
    e.stopPropagation();
    setResources(prev => prev.map(res => 
      res.id === id ? { ...res, isHidden: !res.isHidden } : res
    ));
    toast.success("Visibility updated");
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if(window.confirm("Delete this upload permanently?")) {
      setResources(prev => prev.filter(res => res.id !== id));
      toast.error("Resource removed.");
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.uploaderName) return toast.error("Required fields missing.");
    if (formData.uploadMethod === 'file' && !formData.file) return toast.error("Please select a file.");
    if (formData.uploadMethod === 'link' && !formData.link) return toast.error("Please provide a link.");

    let finalUrl = formData.link;

    if (formData.uploadMethod === 'file') {
      try {
        finalUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.file);
        });
      } catch (error) {
        return toast.error("Failed to process the file.");
      }
    }

    const newResource = {
      id: Date.now(),
      title: formData.title,
      author: formData.author || "Unknown Writer",
      uploader: formData.uploaderName,
      type: formData.resourceType,
      category: formData.category,
      courseCode: formData.courseCode || 'GEN101',
      format: formData.uploadMethod === 'file' ? 'PDF' : 'LINK',
      url: finalUrl,
      fileName: formData.file ? formData.file.name : 'resource.pdf',
      isHidden: false,
      date: new Date().toLocaleDateString(),
      comments: [],
      upvotes: 0,
    };

    try {
      const updatedResources = [newResource, ...resources];
      localStorage.setItem('campus_lib_v4', JSON.stringify(updatedResources));
      
      setCurrentUser(formData.uploaderName);
      setResources(updatedResources);
      setShowUploadModal(false);
      setFormData({ ...formData, title: '', author: '', file: null, link: '' });
      toast.success("Published Successfully!");
    } catch (err) {
      toast.error("File is too large for local storage (Max ~5MB). Please use an external link instead.");
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const updatedResources = resources.map(res => {
      if (res.id === selectedResource.id) {
        const updatedRes = {
          ...res,
          comments: [...(res.comments || []), {
            id: Date.now(),
            user: currentUser || "Anonymous",
            text: newComment,
            rating: userRating,
            date: new Date().toLocaleDateString()
          }]
        };
        setSelectedResource(updatedRes);
        return updatedRes;
      }
      return res;
    });

    setResources(updatedResources);
    setNewComment("");
    toast.success("Review posted!");
  };

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || res.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = 
        filterType === 'All' ? true :
        filterType === 'Saved' ? savedItems.includes(res.id) :
        filterType === 'My Uploads' ? res.uploader === currentUser :
        res.type === filterType;
      
      if (res.isHidden && res.uploader !== currentUser) return false;
      return matchSearch && matchType;
    });
  }, [resources, searchTerm, filterType, savedItems, currentUser]);

  const getGradient = (t) => {
    const grads = ["from-indigo-600 to-violet-700", "from-emerald-500 to-teal-700", "from-rose-500 to-orange-600", "from-blue-600 to-cyan-700"];
    return grads[t.length % grads.length];
  };

  // --- REFINED ACTIONS ---
  const handleReadOnline = (res) => {
    if (res.format === 'LINK') {
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } else {
      const blob = base64ToBlob(res.url);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        // Revoke after a delay to allow the browser to load it
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } else {
        toast.error("Could not generate preview.");
      }
    }
  };

  const handleDownload = (res) => {
    if (res.format === 'LINK') {
      window.open(res.url, '_blank', 'noopener,noreferrer');
      toast.success("Redirecting to source...");
    } else {
      const blob = base64ToBlob(res.url);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.fileName || `${res.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Download started!");
      } else {
        toast.error("Download failed.");
      }
    }
  };

  // --- COMPONENTS ---

  const BookCover = ({ res, size = "small" }) => (
    <div className={`relative w-full h-full bg-gradient-to-br ${getGradient(res.title)} flex flex-col items-center justify-center p-6 text-center overflow-hidden`}>
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/20" />
      <div className="absolute right-4 top-4 opacity-20"><FileText size={size === "large" ? 120 : 60} /></div>
      <span className="text-[10px] font-black tracking-[3px] uppercase text-white/60 mb-2">{res.category}</span>
      <h4 className={`font-black text-white leading-tight uppercase italic ${size === "large" ? 'text-2xl' : 'text-sm'} line-clamp-3 px-2`}>
        {res.title}
      </h4>
      <div className="mt-4 w-10 h-1 bg-white/40 rounded-full" />
      <span className="mt-4 text-[8px] font-bold text-white/50 uppercase tracking-widest">{res.courseCode}</span>
    </div>
  );

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen text-slate-200 bg-[#070b14]">
      <Toaster position="bottom-center" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            Campus<span className="text-blue-500">Library</span>
          </h1>
          <p className="text-slate-500 mt-2 font-bold flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-500" /> Collaborative Academic Repository
          </p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 active:scale-95">
          <UploadCloud size={22} /> ADD NEW RESOURCE
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
          <input 
            type="text" placeholder="Search by title or course code..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-white focus:border-blue-500 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', ...resourceTypeOptions.map(o => o.label), 'Saved', 'My Uploads'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={`whitespace-nowrap px-5 py-4 rounded-2xl font-bold text-xs border transition-all ${filterType === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* GRID */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-40 bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-800">
          <LayoutGrid size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-slate-500 font-bold text-xl">No resources match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredResources.map(res => (
            <div key={res.id} onClick={() => setSelectedResource(res)} className={`group relative bg-slate-900/40 border border-slate-800 rounded-[35px] overflow-hidden transition-all cursor-pointer hover:border-blue-500/40 ${res.isHidden ? 'opacity-60' : ''}`}>
              
              <div className="h-64 w-full relative">
                <BookCover res={res} />
                
                {res.uploader === currentUser && (
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button onClick={(e) => handleToggleVisibility(e, res.id)} className="p-2 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-black transition-all">
                      {res.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={(e) => handleDelete(e, res.id)} className="p-2 bg-red-500/20 backdrop-blur-md rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 z-20">
                  <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase text-white border border-white/10">{res.type}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{res.courseCode}</span>
                  <div className="flex items-center gap-1 text-slate-600 text-[10px] font-bold">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" /> 
                    {res.comments?.length > 0 ? (res.comments.reduce((acc, c) => acc + c.rating, 0) / res.comments.length).toFixed(1) : "N/A"}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{res.title}</h3>
                <p className="text-slate-500 text-xs mb-6">By {res.author}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-blue-500">{res.uploader?.charAt(0) || 'U'}</div>
                       <span className="text-[10px] font-bold text-slate-400">{res.uploader === currentUser ? "You" : res.uploader}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSavedItems(prev => prev.includes(res.id) ? prev.filter(i => i !== res.id) : [...prev, res.id]); }} className={savedItems.includes(res.id) ? 'text-blue-500' : 'text-slate-600'}>
                       <Bookmark size={18} fill={savedItems.includes(res.id) ? "currentColor" : "none"} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL DRAWER */}
      {selectedResource && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/90 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setSelectedResource(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#0a0f18] h-full shadow-2xl border-l border-slate-800 flex flex-col p-8 overflow-y-auto animate-in slide-in-from-right">
            <button onClick={() => setSelectedResource(null)} className="absolute top-6 right-6 p-2 bg-slate-900 z-50 rounded-xl hover:text-white transition-colors"><X /></button>
            
            <div className="w-full h-80 rounded-[40px] overflow-hidden mb-8 shadow-2xl">
                <BookCover res={selectedResource} size="large" />
            </div>

            <h1 className="text-3xl font-black text-white mb-2 leading-tight">{selectedResource.title}</h1>
            <p className="text-slate-400 mb-6 italic flex items-center gap-2 uppercase text-xs font-bold tracking-widest">
              <User size={14} /> {selectedResource.author} • <UploadCloud size={14} /> {selectedResource.uploader}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {/* READ ONLINE BUTTON */}
              <button 
                onClick={() => handleReadOnline(selectedResource)}
                className="flex-1 bg-white text-black flex items-center justify-center gap-2 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                <ExternalLink size={20} /> READ ONLINE
              </button>

              {/* DOWNLOAD BUTTON */}
              <button 
                onClick={() => handleDownload(selectedResource)}
                className="flex-1 bg-blue-600 text-white flex items-center justify-center gap-2 font-black py-5 rounded-2xl hover:bg-blue-500 transition-all active:scale-95"
              >
                <Download size={20} /> DOWNLOAD
              </button>

              {/* CLOSE BUTTON */}
              <button 
                onClick={() => setSelectedResource(null)}
                className="flex-none bg-slate-800 text-white flex items-center justify-center gap-2 font-black py-5 px-6 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            {/* REVIEWS SECTION */}
            <div className="border-t border-slate-800 pt-8">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-500" /> REVIEWS ({selectedResource.comments?.length || 0})
              </h2>
              <form onSubmit={handleAddComment} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 mb-8">
                <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(num => (
                    <button key={num} type="button" onClick={() => setUserRating(num)}>
                      <Star size={20} className={num <= userRating ? "text-yellow-500 fill-yellow-500" : "text-slate-700"} />
                    </button>
                  ))}
                </div>
                <textarea 
                  value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Leave a helpful comment..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 mb-4 h-24 text-white"
                />
                <button type="submit" className="w-full bg-slate-800 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all">POST REVIEW</button>
              </form>
              <div className="space-y-4">
                {(selectedResource.comments || []).map(comment => (
                  <div key={comment.id} className="bg-slate-900/30 p-5 rounded-2xl border border-slate-800/50">
                    <div className="flex justify-between mb-2">
                      <span className="font-black text-blue-400 text-xs uppercase">{comment.user}</span>
                      <div className="flex gap-1">
                        {[...Array(comment.rating)].map((_, i) => <Star key={i} size={10} className="text-yellow-500 fill-yellow-500" />)}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{comment.text}</p>
                    <span className="text-[10px] text-slate-600 mt-2 block">{comment.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-xl">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-3xl rounded-[50px] p-8 md:p-12 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Contribute</h2>
                <p className="text-slate-500 text-sm font-bold">Share academic materials with the community.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="bg-slate-900 p-3 rounded-2xl text-slate-500 hover:text-white transition-all"><X /></button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[2px] ml-2">1. Select Resource Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {resourceTypeOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setFormData({...formData, resourceType: opt.label})}
                      className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all gap-2 ${
                        formData.resourceType === opt.label 
                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20" 
                        : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      {opt.icon}
                      <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                 <label className="text-[10px] font-black text-blue-500 uppercase tracking-[2px] ml-2">2. Resource Information</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-600 font-bold ml-4">Uploader Name</span>
                      <input value={formData.uploaderName} onChange={(e) => setFormData({...formData, uploaderName: e.target.value})} type="text" placeholder="Your Name" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-600 font-bold ml-4">Author / Writer</span>
                      <input value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} type="text" placeholder="Writer's Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500" />
                    </div>
                 </div>
                 
                 <div className="space-y-1">
                    <span className="text-[10px] text-slate-600 font-bold ml-4">Full Title of Resource</span>
                    <input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} type="text" placeholder="e.g. Advanced Calculus - Vol 2" required className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-600 font-bold ml-4">Department</span>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none appearance-none">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-600 font-bold ml-4">Course Code</span>
                      <input value={formData.courseCode} onChange={(e) => setFormData({...formData, courseCode: e.target.value.toUpperCase()})} type="text" placeholder="e.g. CSE101" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-blue-500 uppercase tracking-[2px] ml-2">3. Attach Document</label>
                <div className="bg-slate-950/50 p-3 rounded-[35px] border border-slate-800">
                  <div className="flex gap-2 mb-4">
                    <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'file'})} className={`flex-1 py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${formData.uploadMethod === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}>Upload PDF</button>
                    <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'link'})} className={`flex-1 py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${formData.uploadMethod === 'link' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}>External Link</button>
                  </div>
                  
                  {formData.uploadMethod === 'file' ? (
                    <div className="relative group border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center transition-all hover:border-blue-500/50 bg-slate-900/20">
                      <input type="file" accept=".pdf" onChange={(e) => setFormData({...formData, file: e.target.files[0]})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <UploadCloud size={40} className="text-slate-600 group-hover:text-blue-500 transition-colors mb-3" />
                      <p className="text-xs font-bold text-slate-500 text-center">
                        {formData.file ? <span className="text-blue-400">{formData.file.name}</span> : "Click or drag to upload document (PDF)"}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      <input type="url" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} placeholder="Paste Drive, Dropbox or Mega link here..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-white text-black font-black py-6 rounded-[30px] hover:bg-blue-500 hover:text-white transition-all uppercase tracking-[4px] shadow-2xl active:scale-95">
                Publish to Library
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;