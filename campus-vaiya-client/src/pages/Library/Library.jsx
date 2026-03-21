import React, { useState, useEffect, useMemo, useContext } from 'react';
import { 
  Search, Plus, BookOpen, Download, X, Filter, Eye, FileText, UploadCloud, 
  Link as LinkIcon, Image as ImageIcon, FolderOpen, PenTool, CheckCircle, 
  ShieldCheck, ThumbsUp, Bookmark, BookmarkCheck, AlertTriangle, MessageSquare, 
  TrendingUp, Clock, Share2, Info, ChevronRight, Link2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// IMPORTANT: Ensure you have your AuthContext set up in your app to provide the 'user' object
// import { AuthContext } from '../../context/AuthContext'; 

const Library = () => {
  // --- STATE & CONTEXT ---
  // UNCOMMENT THIS WHEN USING REAL AUTHENTICATION
  // const { user } = useContext(AuthContext); 
  
  // Fallback mock user if context is not yet linked. Replace with context above.
  const user = { name: "Rahul", isVerified: true }; 

  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null); 
  
  // Filters & Views
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [scopeFilter, setScopeFilter] = useState('Campus'); 
  const [sourceFilter, setSourceFilter] = useState('All'); 
  
  // User Interactions
  const [savedItems, setSavedItems] = useState([]);
  const [upvotedItems, setUpvotedItems] = useState([]);

  // --- REAL DATA STATE ---
  const [resources, setResources] = useState([]);

  const categories = ["CSE", "EEE", "Mechanical", "Civil", "Business", "Mathematics", "Physics", "Other"];

  // Form State for Uploading
  const [formData, setFormData] = useState({
    title: '', 
    author: '', 
    resourceType: 'Book', 
    category: 'CSE', 
    customCategory: '',
    courseCode: '', 
    edition: '', 
    uploadMethod: 'file', // 'file' or 'link'
    link: '', 
    file: null
  });

  // --- BACKEND INTEGRATION: FETCH REAL DATA ---
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        // REPLACE WITH YOUR ACTUAL BACKEND GET URL
        // const response = await fetch('http://localhost:5000/api/resources');
        // const data = await response.json();
        // setResources(data);

        // Simulated delay for UI purposes (Remove this once API is connected)
        setTimeout(() => {
          setResources([]); // Starts empty, no fake data
          setIsLoading(false);
        }, 800);

      } catch (error) {
        console.error("Error fetching resources:", error);
        toast.error("Failed to load library data.");
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // --- HANDLERS ---
  const handleToggleSave = (e, id) => {
    e.stopPropagation();
    if (savedItems.includes(id)) {
      setSavedItems(savedItems.filter(itemId => itemId !== id));
      toast('Removed from saved items', { icon: '🗑️' });
    } else {
      setSavedItems([...savedItems, id]);
      toast.success('Saved to your personal library!');
    }
  };

  const handleToggleUpvote = async (e, id) => {
    e.stopPropagation();
    const isUpvoted = upvotedItems.includes(id);
    
    // Optimistic UI Update
    setUpvotedItems(isUpvoted ? upvotedItems.filter(i => i !== id) : [...upvotedItems, id]);
    setResources(resources.map(res => {
      if (res.id === id) return { ...res, upvotes: isUpvoted ? res.upvotes - 1 : res.upvotes + 1 };
      return res;
    }));

    // ADD YOUR BACKEND UPVOTE LOGIC HERE
    // await fetch(`http://localhost:5000/api/resources/${id}/upvote`, { method: 'POST' });
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  // --- BACKEND INTEGRATION: SAVE UPLOAD ---
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Title is required!");
    if (formData.uploadMethod === 'file' && !formData.file) return toast.error("Please attach a file!");
    if (formData.uploadMethod === 'link' && !formData.link) return toast.error("Please provide a valid link!");

    // Set uploading state here if desired
    const toastId = toast.loading("Uploading and verifying resource...");

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('author', formData.author || "Unknown Author");
      uploadData.append('type', formData.resourceType);
      uploadData.append('category', formData.category === 'Other' ? formData.customCategory : formData.category);
      uploadData.append('courseCode', formData.courseCode || 'General');
      uploadData.append('edition', formData.edition || 'N/A');
      uploadData.append('uploadMethod', formData.uploadMethod);
      
      // Crucial Fix: Using actual logged-in user name
      uploadData.append('addedBy', user?.name || "Anonymous User");

      if (formData.uploadMethod === 'file') {
        uploadData.append('file', formData.file);
      } else {
        uploadData.append('link', formData.link);
      }

      // REPLACE WITH YOUR ACTUAL BACKEND POST URL
      /*
      const response = await fetch('http://localhost:5000/api/resources', {
        method: 'POST',
        body: uploadData, // Automatically sets multipart/form-data headers
        // headers: { Authorization: `Bearer ${user.token}` } // If you have auth tokens
      });

      if (!response.ok) throw new Error("Upload failed on server");
      const newResource = await response.json();
      */

      // --- TEMPORARY MOCK RESPONSE (Remove when backend is connected) ---
      let formatBadge = formData.uploadMethod === 'file' ? 'PDF' : 'LINK';
      let mockSize = formData.uploadMethod === 'file' && formData.file ? `${(formData.file.size / (1024*1024)).toFixed(1)} MB` : 'External';
      const newResource = {
        id: Date.now(),
        title: formData.title,
        author: formData.author || "Unknown Author",
        type: formData.resourceType,
        category: formData.category,
        courseCode: formData.courseCode || 'General',
        edition: formData.edition || 'N/A',
        format: formatBadge,
        size: mockSize,
        pages: formData.uploadMethod === 'file' ? 'N/A' : 'External',
        url: formData.uploadMethod === 'file' ? URL.createObjectURL(formData.file) : formData.link, // Replace with backend URL
        addedBy: user?.name || "Anonymous User",
        isVerified: user?.isVerified || false,
        reputation: 10,
        date: 'Just now',
        upvotes: 0,
        isOfficial: formData.resourceType === 'Book',
        comments: []
      };
      // -----------------------------------------------------------------

      setResources([newResource, ...resources]);
      setShowUploadModal(false);
      // Reset Form
      setFormData({ title: '', author: '', resourceType: 'Book', category: 'CSE', customCategory: '', courseCode: '', edition: '', uploadMethod: 'file', link: '', file: null });
      
      toast.success("Resource uploaded successfully! Verified Scan completed.", { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error("Failed to upload resource. Please try again.", { id: toastId });
    }
  };

  // --- FILTERS ---
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      const matchSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || res.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'All' || res.type === filterType || (filterType === 'Saved' && savedItems.includes(res.id));
      const matchSource = sourceFilter === 'All' || (sourceFilter === 'Official' && res.isOfficial) || (sourceFilter === 'Community' && !res.isOfficial);
      return matchSearch && matchType && matchSource;
    });
  }, [resources, searchTerm, filterType, sourceFilter, savedItems]);

  const trendingResources = [...resources].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);

  const getGradient = (title) => {
    const gradients = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-rose-500 to-red-600", "from-amber-500 to-orange-600", "from-purple-500 to-fuchsia-600"];
    return gradients[title.length % gradients.length];
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen text-slate-200 font-sans relative overflow-hidden">
      
      {/* HEADER WITH PRO TOGGLES */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent tracking-tight">
              Campus Library
            </h1>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 flex items-center gap-1">
              <ShieldCheck size={14} /> SafeScan Active
            </span>
          </div>
          <p className="text-slate-400 font-medium">Community-driven, auto-verified academic resources.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 flex">
            {['Campus', 'Global'].map(scope => (
              <button 
                key={scope} onClick={() => setScopeFilter(scope)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${scopeFilter === scope ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white'}`}
              >
                {scope}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-white text-slate-900 px-6 py-2.5 rounded-2xl font-bold hover:bg-slate-200 transition-all shadow-lg active:scale-95"
          >
            <UploadCloud size={18} /> Upload Resource
          </button>
        </div>
      </div>

      {/* TRENDING SECTION */}
      {!searchTerm && filterType === 'All' && trendingResources.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><TrendingUp className="text-rose-500"/> Trending This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendingResources.map(res => (
              <div key={`trend-${res.id}`} onClick={() => setSelectedResource(res)} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-4 rounded-2xl flex gap-4 cursor-pointer hover:border-blue-500/50 transition-all">
                <div className={`w-16 h-20 rounded-lg shrink-0 flex items-center justify-center bg-gradient-to-br ${getGradient(res.title)}`}>
                  <span className="text-2xl font-black text-white/40">{res.title.charAt(0)}</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">{res.courseCode}</span>
                  <h3 className="text-sm font-bold text-white line-clamp-2">{res.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><ThumbsUp size={12} className="text-emerald-400"/> {res.upvotes}</span>
                    <span className="flex items-center gap-1"><Download size={12}/> {res.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMART SEARCH & ADVANCED FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by title, course code (e.g., MAT101), or author..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-blue-500 transition-all text-white font-medium shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
          {['All', 'Book', 'Note', 'Saved'].map(type => (
            <button 
              key={type} onClick={() => setFilterType(type)}
              className={`px-6 py-4 whitespace-nowrap rounded-2xl font-bold text-sm transition-all border ${filterType === type ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              {type === 'Saved' && <Bookmark size={16} className="inline mr-2 mb-0.5"/>}
              {type}{type !== 'Saved' && type !== 'All' ? 's' : ''}
            </button>
          ))}
          
          <select 
            className="bg-slate-900/50 border border-slate-800 text-slate-300 text-sm font-bold rounded-2xl px-6 py-4 outline-none focus:border-blue-500 cursor-pointer"
            value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="All">All Sources</option>
            <option value="Official">Official Material</option>
            <option value="Community">Student Notes</option>
          </select>
        </div>
      </div>

      {/* RESOURCES GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-80 bg-slate-900 rounded-[24px] animate-pulse"></div>)}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-32 text-center bg-slate-900/20 border border-slate-800/50 rounded-[32px] border-dashed">
          <h3 className="text-2xl font-bold text-white mb-2">No resources found</h3>
          <p className="text-slate-400">Try adjusting your search or be the first to upload for your campus!</p>
          <button onClick={() => setShowUploadModal(true)} className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 transition-colors">
            Upload a Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.map(resource => (
            <div 
              key={resource.id} 
              onClick={() => setSelectedResource(resource)}
              className="group flex flex-col bg-slate-900 border border-slate-800 rounded-[24px] overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 cursor-pointer relative"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <div className={`w-full h-full bg-gradient-to-br ${getGradient(resource.title)} flex items-center justify-center`}>
                  <span className="text-5xl font-black text-white/20 uppercase tracking-tighter">{resource.title.slice(0,2)}</span>
                </div>
                
                <button 
                  onClick={(e) => handleToggleSave(e, resource.id)}
                  className="absolute top-3 left-3 p-2 bg-slate-950/50 backdrop-blur-md rounded-xl text-white hover:bg-slate-900 transition-colors"
                >
                  {savedItems.includes(resource.id) ? <BookmarkCheck size={18} className="text-blue-400"/> : <Bookmark size={18} />}
                </button>

                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${resource.type === 'Book' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-slate-900'}`}>
                    {resource.type}
                  </span>
                  {resource.isOfficial && (
                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-emerald-500/90 text-slate-950 flex items-center gap-1">
                      <ShieldCheck size={10}/> Official
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded-md">{resource.courseCode}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10}/> {resource.date}</span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">{resource.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-1">by {resource.author}</p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4 bg-slate-950/50 p-2 rounded-lg">
                  <span className="flex items-center gap-1" title="File Size"><FileText size={12}/> {resource.size}</span>
                  <span className="flex items-center gap-1" title="Pages"><BookOpen size={12}/> {resource.pages}</span>
                  <span className="flex items-center gap-1" title="Format">
                    {resource.format === 'LINK' ? <LinkIcon size={12} className="text-blue-400" /> : null}
                    <span className="uppercase text-blue-400 font-bold">{resource.format}</span>
                  </span>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                      {resource.addedBy.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        {resource.addedBy} 
                        {resource.isVerified && <CheckCircle size={12} className="text-blue-400" title="Verified Member"/>}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">{resource.reputation} Rep</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleToggleUpvote(e, resource.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${upvotedItems.includes(resource.id) ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    <ThumbsUp size={14} className={upvotedItems.includes(resource.id) ? 'fill-current' : ''}/> 
                    {resource.upvotes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- QUICK VIEW DRAWER --- */}
      {selectedResource && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedResource(null)}></div>
          
          <div className="relative w-full max-w-lg bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Info size={18} className="text-blue-400"/> Resource Details
              </h2>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"><Share2 size={18}/></button>
                <button onClick={() => setSelectedResource(null)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"><X size={20}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${getGradient(selectedResource.title)} flex items-center justify-center relative overflow-hidden shadow-inner`}>
                <span className="text-6xl font-black text-white/20 uppercase">{selectedResource.title.charAt(0)}</span>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg border border-slate-700 text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400"/> Scanned & Safe
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase rounded">{selectedResource.courseCode}</span>
                  <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold uppercase rounded">{selectedResource.edition}</span>
                </div>
                <h1 className="text-2xl font-black text-white mb-1 leading-tight">{selectedResource.title}</h1>
                <p className="text-slate-400 font-medium">Author: {selectedResource.author}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Size</span>
                  <span className="text-white font-bold text-sm">{selectedResource.size}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Pages</span>
                  <span className="text-white font-bold text-sm">{selectedResource.pages}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Format</span>
                  <span className="text-blue-400 font-black text-sm">{selectedResource.format}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/50">
                    {selectedResource.addedBy.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white flex items-center gap-1">
                      Uploaded by {selectedResource.addedBy}
                      {selectedResource.isVerified && <CheckCircle size={14} className="text-blue-400"/>}
                    </p>
                    <p className="text-xs text-slate-400">{selectedResource.reputation} Community Rep</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-slate-300 hover:text-white bg-slate-700 px-3 py-1.5 rounded-lg">Follow</button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <MessageSquare size={16}/> Discussion ({selectedResource.comments?.length || 0})
                </h3>
                <div className="space-y-3 mb-4">
                  {selectedResource.comments?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No comments yet. Be the first to ask a question!</p>
                  ) : (
                    selectedResource.comments?.map((c, i) => (
                      <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-blue-400">{c.user}</span>
                        <p className="text-sm text-slate-300 mt-1">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ask a question about this..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                  <button className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-500"><ChevronRight size={18}/></button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900">
              <div className="flex gap-3">
                {/* Fixed "Read" and "Download" functionality for PDFs vs External Links */}
                <a 
                  href={selectedResource.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  <Eye size={18}/> Read Online
                </a>
                
                {/* Only inject the 'download' attribute if it's an internal file, otherwise let it open external link */}
                <a 
                  href={selectedResource.url} 
                  {...(selectedResource.format === 'PDF' ? { download: `${selectedResource.title}.pdf` } : { target: "_blank", rel: "noopener noreferrer" })}
                  className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/20"
                >
                  {selectedResource.format === 'LINK' ? <Link2 size={18}/> : <Download size={18}/>}
                  {selectedResource.format === 'LINK' ? 'Open Link' : 'Download PDF'}
                </a>
              </div>
              <button className="w-full mt-3 text-xs text-slate-500 hover:text-red-400 flex items-center justify-center gap-1 transition-colors">
                <AlertTriangle size={12}/> Report broken link or copyright issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADVANCED UPLOAD MODAL --- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2"><UploadCloud className="text-blue-500"/> Submit to Campus Library</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddResource} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormData({...formData, resourceType: 'Book'})} className={`py-4 rounded-2xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all ${formData.resourceType === 'Book' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                  <BookOpen size={24}/> Official Textbook
                </button>
                <button type="button" onClick={() => setFormData({...formData, resourceType: 'Note'})} className={`py-4 rounded-2xl border-2 text-sm font-bold flex flex-col items-center gap-2 transition-all ${formData.resourceType === 'Note' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                  <PenTool size={24}/> Personal Notes
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Resource Title <span className="text-red-400">*</span></label>
                  <input value={formData.title} type="text" required placeholder="Exact title of the book or notes..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-blue-500 outline-none" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Course Code (Optional)</label>
                    <input value={formData.courseCode} type="text" placeholder="e.g. CSE101" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-blue-500 outline-none uppercase" onChange={(e) => setFormData({...formData, courseCode: e.target.value.toUpperCase()})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Department <span className="text-red-400">*</span></label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-blue-500 outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Original Author Name (Optional)</label>
                  <input value={formData.author} type="text" placeholder="Who wrote this? (Defaults to your name)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-blue-500 outline-none" onChange={(e) => setFormData({...formData, author: e.target.value})} />
                </div>
              </div>

              {/* TABS FOR FILE VS LINK UPLOAD */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Upload Source <span className="text-red-400">*</span></label>
                
                <div className="flex gap-2 mb-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'file'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${formData.uploadMethod === 'file' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>
                    Upload File
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, uploadMethod: 'link'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${formData.uploadMethod === 'link' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}>
                    Google Drive / External Link
                  </button>
                </div>

                {formData.uploadMethod === 'file' ? (
                  <div 
                    onDragOver={handleDragOver} 
                    onDrop={handleDrop}
                    className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative"
                  >
                    <input 
                      type="file" accept=".pdf" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setFormData({...formData, file: e.target.files[0]})} 
                    />
                    {formData.file ? (
                      <>
                        <FileText size={40} className="text-blue-500 mb-3" />
                        <p className="text-white font-bold">{formData.file.name}</p>
                        <p className="text-slate-500 text-sm mt-1">{(formData.file.size / (1024*1024)).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-400"><UploadCloud size={30}/></div>
                        <p className="text-white font-bold text-lg mb-1">Click to upload or drag and drop</p>
                        <p className="text-slate-500 text-sm">Strictly PDF Files Only (Max 50MB)</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <input 
                      type="url" 
                      value={formData.link}
                      placeholder="Paste Google Drive or external PDF link here..." 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:border-blue-500 outline-none" 
                      onChange={(e) => setFormData({...formData, link: e.target.value})} 
                    />
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Info size={12}/> Make sure link sharing is set to "Anyone with the link".</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-4 flex gap-3 items-start">
                <ShieldCheck className="text-blue-400 shrink-0 mt-0.5" size={18}/>
                <p className="text-xs text-blue-200/70 leading-relaxed">
                  By uploading, you agree to the Honor Code. Files are scanned automatically for malware. Copyrighted materials strictly prohibited without authorization.
                </p>
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest active:scale-95 shadow-lg shadow-blue-600/20">
                Submit for Verification
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;