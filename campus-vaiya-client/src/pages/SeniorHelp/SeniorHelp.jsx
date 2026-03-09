import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, ThumbsUp, UserPlus, Send, CheckCircle, Clock, FileText, ImageIcon, Filter, XCircle, AlertTriangle } from 'lucide-react';

const SeniorHelp = () => {
    // --- States ---
    const [activeTab, setActiveTab] = useState('new');
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [acceptedRequests, setAcceptedRequests] = useState([]);
    const [browseRequests, setBrowseRequests] = useState([]);
    
    // Filter States
    const [filterSubject, setFilterSubject] = useState('All Subjects');
    const [filterCategory, setFilterCategory] = useState('All Categories');

    // Modal States
    const [selectedIncoming, setSelectedIncoming] = useState(null);
    const [solutionModalData, setSolutionModalData] = useState(null);
    const [viewSolvedModal, setViewSolvedModal] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        subject: '', category: '', topic: '', description: ''
    });
    const [images, setImages] = useState([]);
    const [pdfFile, setPdfFile] = useState(null);
    const [solutionImage, setSolutionImage] = useState(null); // For senior's answer
    const API = import.meta.env.VITE_API_URL;
    // --- Fetch Data ---
    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
            // Configure these endpoints according to your exact backend routes
            const availableRes = await axios.get(`${API}/help/available`, config).catch(() => ({ data: [] })); // Fetches requests available for the senior's rank
            setIncomingRequests(Array.isArray(availableRes.data) ? availableRes.data : []);

            // Assuming you have a route to get user's accepted requests
            // If not, you can filter them from available requests or create a specific endpoint
            const acceptedRes = await axios.get(`${API}/help/my-accepted`, config).catch(() => ({ data: [] })); 
            setAcceptedRequests(Array.isArray(acceptedRes.data) ? acceptedRes.data : []);

            const solvedRes = await axios.get(`${API}/help/browse`, config);
            setBrowseRequests(Array.isArray(solvedRes.data) ? solvedRes.data : []);
        } catch (err) {
            console.error("Error fetching requests:", err);
        }
    };

    // Filters
    const uniqueSubjects = ['All Subjects', ...new Set(browseRequests.map(item => item.subject).filter(Boolean))];
    const uniqueCategories = ['All Categories', ...new Set(browseRequests.map(item => item.category).filter(Boolean))];

    const filteredBrowseRequests = browseRequests.filter(req => {
        const matchSubj = filterSubject === 'All Subjects' || req.subject === filterSubject;
        const matchCat = filterCategory === 'All Categories' || req.category === filterCategory;
        return matchSubj && matchCat;
    });

    // --- Handlers ---
    const handleCreateRequest = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('subject', formData.subject);
        data.append('category', formData.category);
        data.append('topic', formData.topic);
        data.append('description', formData.description);
        
        images.forEach(img => data.append('images', img));
        if (pdfFile) data.append('pdf', pdfFile);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            await axios.post(`${API}/help/create`, data, config);
            alert('Request Sent Successfully!');
            setFormData({ subject: '', category: '', topic: '', description: '' });
            setImages([]);
            setPdfFile(null);
            fetchRequests();
        } catch (err) {
            alert('Failed to send request');
        }
    };

    const handleAccept = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.put(`${API}/help/accept/${id}`, null, config);
            setSelectedIncoming(null);
            setActiveTab('accepted');
            fetchRequests();
        } catch (err) {
            alert('Could not accept request');
        }
    };

    const handleDecline = (id) => {
        // Removes the request from local view (doesn't delete from DB so others can see)
        setIncomingRequests(prev => prev.filter(req => req._id !== id));
        setSelectedIncoming(null);
    };

    const handlePostSolution = async (e) => {
        e.preventDefault();
        const text = e.target.solutionText.value;
        const submitData = new FormData();
        submitData.append('text', text);
        if (solutionImage) {
            submitData.append('solutionImage', solutionImage);
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };
            await axios.put(`${API}/help/solve/${solutionModalData._id}`, submitData, config);
            alert('Solution Posted Successfully!');
            setSolutionModalData(null);
            setSolutionImage(null);
            fetchRequests();
        } catch (err) {
            alert('Submission failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            
            {/* Header Section - Fixed Navbar Overlap with pt-24 and distinctive background */}
            <div className="pt-24 pb-10 px-4 md:px-8 bg-gradient-to-b from-indigo-950/40 to-slate-950 border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-3">
                        <MessageSquare className="text-indigo-500" size={32} /> Senior Help Desk
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm md:text-base">Connect with seniors, solve problems, and earn reputation points.</p>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    
                    {/* LEFT: Ask for Help */}
                    <div className="lg:col-span-5 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm h-fit">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-300">
                            <Send size={20} /> Ask for Help
                        </h2>
                        <form onSubmit={handleCreateRequest} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="text" placeholder="Subject (e.g. Physics)" 
                                    className="bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})} required
                                />
                                <input 
                                    type="text" placeholder="Category (e.g. Lab)" 
                                    className="bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})} required
                                />
                            </div>
                            <input 
                                type="text" placeholder="Topic Name" 
                                className="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                value={formData.topic}
                                onChange={(e) => setFormData({...formData, topic: e.target.value})} required
                            />
                            <textarea 
                                placeholder="Describe your problem in detail..." rows="4" 
                                className="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})} required
                            ></textarea>
                            
                            {/* Attachments: Separate Boxes for Images and PDF */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 bg-indigo-900/20 rounded-xl border border-dashed border-indigo-500/30 flex flex-col gap-2">
                                    <label className="text-[10px] text-indigo-400 flex items-center gap-1 uppercase font-bold tracking-wider">
                                        <ImageIcon size={12} /> Upload Images (Max 5)
                                    </label>
                                    <input 
                                        type="file" multiple accept="image/*"
                                        onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
                                        className="text-xs text-slate-400 file:bg-indigo-600 file:text-white file:border-none file:px-2 file:py-1 file:rounded-md file:mr-2 cursor-pointer w-full" 
                                    />
                                </div>
                                
                                <div className="p-3 bg-red-900/20 rounded-xl border border-dashed border-red-500/30 flex flex-col gap-2">
                                    <label className="text-[10px] text-red-400 flex items-center gap-1 uppercase font-bold tracking-wider">
                                        <FileText size={12} /> Upload PDF (Optional)
                                    </label>
                                    <input 
                                        type="file" accept=".pdf"
                                        onChange={(e) => setPdfFile(e.target.files[0])}
                                        className="text-xs text-slate-400 file:bg-red-600 file:text-white file:border-none file:px-2 file:py-1 file:rounded-md file:mr-2 cursor-pointer w-full" 
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20">
                                Post Request
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: Senior Dashboard */}
                    <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col h-[600px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-200">Senior Dashboard</h2>
                            <div className="bg-indigo-900/30 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-800">
                                Rank Check Enabled
                            </div>
                        </div>

                        <div className="flex space-x-6 border-b border-slate-800 mb-6">
                            {['new', 'accepted'].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {tab} ({tab === 'new' ? incomingRequests.length : acceptedRequests.length})
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-t-full" />}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {activeTab === 'new' && incomingRequests.length === 0 && (
                                <p className="text-slate-500 text-center text-sm py-10">No new requests available for your rank.</p>
                            )}
                            
                            {activeTab === 'new' && incomingRequests.map(req => (
                                <div key={req._id} className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl flex justify-between items-center group hover:border-indigo-500/50 transition-all">
                                    <div>
                                        <h4 className="font-bold text-slate-100">{req.subject} - {req.topic}</h4>
                                        <p className="text-xs text-slate-500 mt-1">By: {req.sender?.fullName} | Class: {req.senderRank}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDecline(req._id)} className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-900/50 hover:text-red-400 transition-all">
                                            Remove
                                        </button>
                                        <button onClick={() => setSelectedIncoming(req)} className="bg-indigo-600/10 text-indigo-400 border border-indigo-600/30 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">
                                            View & Accept
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {activeTab === 'accepted' && acceptedRequests.length === 0 && (
                                <p className="text-slate-500 text-center text-sm py-10">You haven't accepted any requests yet.</p>
                            )}

                            {activeTab === 'accepted' && acceptedRequests.map(req => (
                                <div key={req._id} onClick={() => setSolutionModalData(req)} className="p-4 bg-indigo-900/10 border border-indigo-800/50 rounded-xl flex justify-between items-center cursor-pointer hover:bg-indigo-900/20 transition-all group">
                                    <div>
                                        <h4 className="font-bold text-indigo-200 group-hover:text-indigo-100">{req.topic}</h4>
                                        <p className="text-[10px] text-red-400/80 flex items-center gap-1 mt-1 font-semibold uppercase tracking-wider">
                                            <AlertTriangle size={10}/> Penalty if not solved in 24h
                                        </p>
                                    </div>
                                    <button className="bg-green-600/20 text-green-400 border border-green-600/30 px-4 py-2 rounded-lg text-xs font-bold transition-all group-hover:bg-green-600 group-hover:text-white">
                                        Read & Solve
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BOTTOM: Browse Section */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h2 className="text-2xl font-bold text-slate-100">Browse Solved Issues</h2>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                                <Filter size={14} className="text-indigo-400" />
                                <select 
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="bg-transparent border-none text-xs text-slate-200 outline-none focus:ring-0 cursor-pointer"
                                >
                                    {uniqueSubjects.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                                <select 
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="bg-transparent border-none text-xs text-slate-200 outline-none focus:ring-0 cursor-pointer"
                                >
                                    {uniqueCategories.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBrowseRequests.map((req) => (
                            <div 
                                key={req._id} 
                                onClick={() => setViewSolvedModal(req)}
                                className="bg-slate-800/40 border border-slate-700 p-5 rounded-2xl hover:bg-slate-800 transition-all cursor-pointer group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md">
                                            {req.category}
                                        </span>
                                        <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                                            <ThumbsUp size={14} /> {req.solution?.votes?.up?.length || 0}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">{req.topic}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{req.description}</p>
                                </div>
                                <div className="pt-4 border-t border-slate-700 flex items-center justify-between mt-auto">
                                    <span className="text-xs text-slate-400">By: <b className="text-slate-300">{req.acceptedBy?.fullName || "Senior"}</b></span>
                                    <span className="text-xs text-yellow-500 font-bold">★ {req.acceptedBy?.reputationPoints || 0}</span>
                                </div>
                            </div>
                        ))}
                        {filteredBrowseRequests.length === 0 && (
                            <p className="text-slate-500 text-sm col-span-full text-center py-10">No solved requests match your filters.</p>
                        )}
                    </div>
                </div>

                {/* ================= MODALS ================= */}
                
                {/* Modal: View & Accept Request */}
                {selectedIncoming && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl">
                            <h3 className="text-xl font-bold text-indigo-400 mb-1">{selectedIncoming.subject}</h3>
                            <h4 className="text-sm text-slate-400 mb-4">{selectedIncoming.topic}</h4>
                            
                            <div className="bg-slate-800 p-4 rounded-xl mb-6 max-h-48 overflow-y-auto custom-scrollbar">
                                <p className="text-sm text-slate-300 whitespace-pre-line">{selectedIncoming.description}</p>
                            </div>

                            <div className="flex justify-between items-center bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20 mb-6">
                                <div className="flex items-center gap-2 text-xs text-indigo-300 font-semibold">
                                    <Clock size={14}/> Once accepted, solve within 24h
                                </div>
                                <div className="text-xs font-bold text-green-400">+20 Points</div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setSelectedIncoming(null)} className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm">Cancel</button>
                                <button onClick={() => handleAccept(selectedIncoming._id)} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-white font-bold text-sm shadow-lg shadow-indigo-900/40 transition-all">
                                    Accept Task
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal: Read Problem & Submit Solution */}
                {solutionModalData && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl p-6 rounded-2xl shadow-2xl my-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                    <CheckCircle /> Solve Problem
                                </h3>
                                <button onClick={() => setSolutionModalData(null)} className="text-slate-500 hover:text-white">
                                    <XCircle size={24}/>
                                </button>
                            </div>

                            {/* Read the Problem Context */}
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl mb-6">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">The Request</h4>
                                <p className="text-sm text-slate-200 font-semibold mb-1">{solutionModalData.topic}</p>
                                <p className="text-sm text-slate-400 whitespace-pre-line">{solutionModalData.description}</p>
                            </div>

                            {/* Submit Answer Form */}
                            <form onSubmit={handlePostSolution}>
                                <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Your Solution</h4>
                                <textarea 
                                    name="solutionText"
                                    placeholder="Explain the solution clearly here..." rows="6" 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-green-500 outline-none text-sm mb-4 resize-none text-slate-100"
                                    required
                                ></textarea>
                                
                                <div className="p-3 bg-green-900/10 rounded-xl border border-dashed border-green-500/30 flex flex-col gap-2 mb-6">
                                    <label className="text-[10px] text-green-400 flex items-center gap-1 uppercase font-bold tracking-wider">
                                        <ImageIcon size={12} /> Attach Solution Image (Optional)
                                    </label>
                                    <input 
                                        type="file" accept="image/*"
                                        onChange={(e) => setSolutionImage(e.target.files[0])}
                                        className="text-xs text-slate-400 file:bg-green-600 file:text-white file:border-none file:px-3 file:py-1 file:rounded-md file:mr-3 cursor-pointer" 
                                    />
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <AlertTriangle size={12} className="text-yellow-500"/> Quality answers get more upvotes.
                                    </p>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setSolutionModalData(null)} className="px-4 py-2 text-slate-400 font-bold text-sm">Cancel</button>
                                        <button type="submit" className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-xl text-white font-bold text-sm shadow-lg shadow-green-900/40 transition-all">
                                            Post Solution
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: View Solved Content */}
                {viewSolvedModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl p-6 md:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-slate-100 pr-8">{viewSolvedModal.topic}</h2>
                                <button onClick={() => setViewSolvedModal(null)} className="text-slate-500 hover:text-white flex-shrink-0">
                                    <XCircle size={28}/>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl text-sm">
                                    <h4 className="text-red-400 font-bold mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
                                        <FileText size={14}/> The Problem
                                    </h4>
                                    <p className="text-slate-300">{viewSolvedModal.description}</p>
                                </div>

                                <div className="bg-green-500/5 border border-green-500/20 p-5 rounded-2xl text-sm leading-relaxed relative">
                                    <h4 className="text-green-400 font-bold mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
                                        <CheckCircle size={14}/> Senior's Solution
                                    </h4>
                                    <p className="text-slate-100 whitespace-pre-line">{viewSolvedModal.solution?.text}</p>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center justify-between border border-slate-700 mt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-inner">
                                            {viewSolvedModal.acceptedBy?.fullName?.charAt(0) || "S"}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-100">{viewSolvedModal.acceptedBy?.fullName || "Senior Student"}</h4>
                                            <p className="text-[10px] text-yellow-500 font-bold tracking-widest uppercase mt-0.5">★ {viewSolvedModal.acceptedBy?.reputationPoints || 0} Points</p>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                                        <UserPlus size={14} /> Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeniorHelp;