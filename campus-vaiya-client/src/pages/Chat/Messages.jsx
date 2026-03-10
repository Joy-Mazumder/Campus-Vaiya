import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
    Send, Image as ImageIcon, FileText, CheckCircle, XCircle, 
    Trash2, MoreVertical, ArrowLeft, Clock, UserCheck, MessageCircle 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Messages = () => {
    const { user } = useContext(AuthContext);
    
    // UI States
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'requests'
    const [activeChat, setActiveChat] = useState(null); // Selected conversation
    
    // Data States
    const [connections, setConnections] = useState([]); // Friend Requests
    const [conversations, setConversations] = useState([]); // Chat List
    const [messages, setMessages] = useState([]); // Current Chat Messages
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    // Input States
    const [newMessage, setNewMessage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    const socket = useRef();
    const scrollRef = useRef();

    // --- 1. SOCKET INITIALIZATION ---
    useEffect(() => {
        socket.current = io(SOCKET_URL);
        
        if (user) {
            socket.current.emit("addUser", user._id);
            socket.current.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });
        }

        socket.current.on("getMessage", (data) => {
            // যদি কারেন্ট চ্যাট ওপেন থাকে, তবে লাইভ মেসেজ এড হবে
            setMessages((prev) => [...prev, data]);
            
            // চ্যাট লিস্টের লাস্ট মেসেজ আপডেট করা
            fetchConversations();
        });

        return () => socket.current.disconnect();
    }, [user]);

    // --- 2. FETCH INITIAL DATA ---
    useEffect(() => {
        fetchConnections();
        fetchConversations();
    }, []);

    // মেসেজ লোড হলে নিচে স্ক্রল করা
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- API FUNCTIONS ---
    const getConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchConnections = async () => {
        try {
            const res = await axios.get(`${API_URL}/messages/my-connections`, getConfig());
            setConnections(res.data);
        } catch (err) { console.error("Error fetching connections", err); }
    };

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${API_URL}/messages/conversations`, getConfig());
            setConversations(res.data);
        } catch (err) { console.error("Error fetching conversations", err); }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const res = await axios.get(`${API_URL}/messages/messages/${conversationId}`, getConfig());
            setMessages(res.data);
        } catch (err) { console.error("Error fetching messages", err); }
    };

    // --- HANDLERS: FRIEND REQUESTS ---
    const handleAcceptRequest = async (requestId) => {
        try {
            await axios.put(`${API_URL}/messages/accept/${requestId}`, {}, getConfig());
            fetchConnections();
            fetchConversations(); // নতুন চ্যাট তৈরি হবে
        } catch (err) { alert("Failed to accept"); }
    };

    const handleRejectRequest = async (connectionId) => {
        try {
            await axios.delete(`${API_URL}/messages/connection/${connectionId}`, getConfig());
            fetchConnections();
        } catch (err) { alert("Failed to remove"); }
    };

    // --- HANDLERS: CHATTING ---
    const handleSelectChat = (conversation) => {
        setActiveChat(conversation);
        fetchMessages(conversation._id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !imageFile && !pdfFile) return;

        const formData = new FormData();
        formData.append('conversationId', activeChat._id);
        if (newMessage.trim()) formData.append('text', newMessage);
        if (imageFile) formData.append('image', imageFile);
        if (pdfFile) formData.append('pdf', pdfFile);

        const receiverId = activeChat.participants.find(p => p._id !== user._id)._id;

        try {
            const config = { headers: { ...getConfig().headers, 'Content-Type': 'multipart/form-data' } };
            const res = await axios.post(`${API_URL}/messages/send`, formData, config);
            
            // Socket emit
            socket.current.emit("sendMessage", {
                senderId: user._id,
                receiverId,
                text: newMessage,
                image: res.data.image,
                pdf: res.data.pdf,
                conversationId: activeChat._id
            });

            setMessages(prev => [...prev, res.data]);
            setNewMessage(""); setImageFile(null); setPdfFile(null);
            fetchConversations();
        } catch (err) { alert("Failed to send message"); }
    };

    const handleUnsendMessage = async (messageId) => {
        try {
            await axios.put(`${API_URL}/messages/message/unsend/${messageId}`, {}, getConfig());
            fetchMessages(activeChat._id); // Refresh messages
        } catch (err) { alert("Cannot unsend"); }
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!window.confirm("Delete entire conversation?")) return;
        try {
            await axios.delete(`${API_URL}/messages/conversation/all/${conversationId}`, getConfig());
            setActiveChat(null);
            fetchConversations();
        } catch (err) { alert("Failed to delete conversation"); }
    };

    // --- FILTER DATA ---
    const pendingRequests = connections.filter(c => c.status === 'pending' && c.recipient._id === user._id);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pt-24 pb-8 px-4 md:px-8 flex justify-center">
            <div className="w-full max-w-6xl h-[80vh] flex bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                
                {/* ================= LEFT SIDEBAR (List) ================= */}
                <div className={`w-full md:w-1/3 border-r border-slate-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Sidebar Header & Tabs */}
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                        <h2 className="text-xl font-black text-white mb-4">Connections</h2>
                        <div className="flex bg-slate-800/50 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('chats')} 
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'chats' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Chats
                            </button>
                            <button 
                                onClick={() => setActiveTab('requests')} 
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all relative ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Requests
                                {pendingRequests.length > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Lists */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        
                        {/* CHAT TAB */}
                        {activeTab === 'chats' && conversations.map((conv) => {
                            const friend = conv.participants.find(p => p._id !== user._id);
                            if (!friend) return null;
                            const isOnline = onlineUsers.includes(friend._id);

                            return (
                                <div 
                                    key={conv._id} 
                                    onClick={() => handleSelectChat(conv)}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${activeChat?._id === conv._id ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800 border border-transparent'}`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-slate-700 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg text-white">
                                            {friend.profilePic ? <img src={friend.profilePic} alt="avatar" className="w-full h-full object-cover"/> : friend.fullName.charAt(0)}
                                        </div>
                                        {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-slate-100 truncate">{friend.fullName}</h4>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage || "Started a conversation"}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-500">{new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            );
                        })}

                        {/* REQUESTS TAB */}
                        {activeTab === 'requests' && pendingRequests.length === 0 && (
                            <p className="text-center text-slate-500 text-sm mt-10">No pending requests</p>
                        )}
                        {activeTab === 'requests' && pendingRequests.map((req) => (
                            <div key={req._id} className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl mb-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded-full flex justify-center items-center font-bold">{req.requester.fullName.charAt(0)}</div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">{req.requester.fullName}</h4>
                                        <p className="text-[10px] text-slate-400">Class {req.requester.rank}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAcceptRequest(req._id)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition-all flex justify-center items-center gap-1"><CheckCircle size={14}/> Accept</button>
                                    <button onClick={() => handleRejectRequest(req._id)} className="flex-1 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 text-xs font-bold py-2 rounded-lg transition-all flex justify-center items-center gap-1"><XCircle size={14}/> Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= RIGHT CHAT AREA ================= */}
                <div className={`w-full md:w-2/3 flex flex-col bg-slate-950 ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                    
                    {!activeChat ? (
                        <div className="text-center text-slate-500">
                            <MessageCircle size={64} className="mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-slate-400">Your Messages</h3>
                            <p className="text-sm">Select a connection to start chatting</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <button className="md:hidden text-slate-400" onClick={() => setActiveChat(null)}>
                                        <ArrowLeft />
                                    </button>
                                    <h3 className="font-bold text-lg text-white">
                                        {activeChat.participants.find(p => p._id !== user._id)?.fullName}
                                    </h3>
                                </div>
                                <button onClick={() => handleDeleteConversation(activeChat._id)} className="text-slate-500 hover:text-red-400 transition-colors p-2" title="Delete entire conversation">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Messages Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-950 bg-blend-soft-light">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender === user._id || msg.sender?._id === user._id;
                                    
                                    return (
                                        <div key={idx} ref={scrollRef} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[70%] p-3 rounded-2xl relative group ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
                                                
                                                {/* Text Content */}
                                                {msg.isDeleted ? (
                                                    <p className="text-sm italic text-slate-300 opacity-70">Message unsent</p>
                                                ) : (
                                                    <>
                                                        {msg.text && <p className="text-sm whitespace-pre-line">{msg.text}</p>}
                                                        {msg.image && <a href={msg.image} target="_blank" rel="noreferrer"><img src={msg.image} alt="attachment" className="mt-2 rounded-xl max-h-48 object-cover border border-white/20"/></a>}
                                                        {msg.pdf && <a href={msg.pdf} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-2 bg-black/20 p-2 rounded-lg text-xs font-bold hover:bg-black/40"><FileText size={16}/> View PDF</a>}
                                                        
                                                        {/* Unsend Button (only for my messages) */}
                                                        {isMe && (
                                                            <button onClick={() => handleUnsendMessage(msg._id)} className="absolute top-2 -left-8 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-500 transition-all p-1">
                                                                <XCircle size={16} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-500 mt-1 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Message Input Footer */}
                            <div className="p-4 bg-slate-900 border-t border-slate-800">
                                {/* Preview attachments */}
                                {(imageFile || pdfFile) && (
                                    <div className="flex gap-2 mb-2 p-2 bg-slate-800 rounded-lg w-fit">
                                        {imageFile && <span className="text-xs text-indigo-400 flex items-center gap-1"><ImageIcon size={14}/> Image attached</span>}
                                        {pdfFile && <span className="text-xs text-rose-400 flex items-center gap-1"><FileText size={14}/> PDF attached</span>}
                                        <button onClick={() => {setImageFile(null); setPdfFile(null)}} className="text-slate-500 ml-2"><XCircle size={14}/></button>
                                    </div>
                                )}
                                
                                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                    <div className="flex gap-1 p-2">
                                        <label className="text-slate-400 hover:text-indigo-400 cursor-pointer p-2 transition-colors">
                                            <ImageIcon size={20} />
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
                                        </label>
                                        <label className="text-slate-400 hover:text-rose-400 cursor-pointer p-2 transition-colors">
                                            <FileText size={20} />
                                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files[0])} />
                                        </label>
                                    </div>
                                    
                                    <textarea 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 resize-none max-h-24 custom-scrollbar"
                                        rows="1"
                                    />
                                    
                                    <button type="submit" className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center">
                                        <Send size={20} className="ml-1" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Messages;