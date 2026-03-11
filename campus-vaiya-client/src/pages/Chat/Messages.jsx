import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { 
    Send, Image as ImageIcon, FileText, CheckCircle, XCircle, 
    Trash2, ArrowLeft, Clock, MessageCircle, Phone, Video, 
    Info, UserMinus, UserCheck, Inbox, Send as SendIcon
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const Messages = () => {
    const { user } = useContext(AuthContext);
    
    // UI States
    const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'inbox', 'sent'
    const [activeChat, setActiveChat] = useState(null); 
    
    // Data States
    const [connections, setConnections] = useState([]); 
    const [conversations, setConversations] = useState([]); 
    const [messages, setMessages] = useState([]); 
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    // Input States
    const [newMessage, setNewMessage] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    const socket = useRef();
    const scrollRef = useRef();

    // --- 1. SOCKET & AUTO-SYNC INITIALIZATION ---
    useEffect(() => {
        socket.current = io(SOCKET_URL);
        
        if (user) {
            socket.current.emit("addUser", user._id);
            socket.current.on("getOnlineUsers", (users) => {
                setOnlineUsers(users);
            });
        }

        socket.current.on("getMessage", (data) => {
            setMessages((prev) => [...prev, data]);
            fetchConversations();
            
            // Notification for new message if chat is not open
            if (activeChat?._id !== data.conversationId) {
                toast.success("New message received! 💬");
            }
        });

        return () => socket.current.disconnect();
    }, [user, activeChat]);

    // --- 2. FETCH INITIAL DATA & POLLING ---
    useEffect(() => {
        fetchConnections();
        fetchConversations();

        // Background Polling: 
        // ব্যাকএন্ড সকেট আপডেট না করেই রিকোয়েস্ট এক্সেপ্টের লাইভ আপডেট পাওয়ার জন্য
        const interval = setInterval(() => {
            fetchConnections();
            fetchConversations();
        }, 15000); // Every 15 seconds

        return () => clearInterval(interval);
    }, []);

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
            toast.success("Friend request accepted! 🎉");
            fetchConnections();
            fetchConversations(); 
        } catch (err) { toast.error("Failed to accept request"); }
    };

    const handleDeleteConnection = async (connectionId, isCancel = false) => {
        try {
            await axios.delete(`${API_URL}/messages/connection/${connectionId}`, getConfig());
            toast.success(isCancel ? "Request canceled" : "Request removed");
            fetchConnections();
        } catch (err) { toast.error("Action failed"); }
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
        } catch (err) { toast.error("Failed to send message"); }
    };

    const handleUnsendMessage = async (messageId) => {
        try {
            await axios.put(`${API_URL}/messages/message/unsend/${messageId}`, {}, getConfig());
            toast.success("Message unsent");
            fetchMessages(activeChat._id); 
        } catch (err) { toast.error("Cannot unsend message"); }
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!window.confirm("Delete entire conversation history? This cannot be undone.")) return;
        try {
            await axios.delete(`${API_URL}/messages/conversation/all/${conversationId}`, getConfig());
            toast.success("Conversation deleted");
            setActiveChat(null);
            fetchConversations();
        } catch (err) { toast.error("Failed to delete conversation"); }
    };

    // --- FILTER DATA ---
    const pendingReceived = connections.filter(c => c.status === 'pending' && c.recipient._id === user._id);
    const pendingSent = connections.filter(c => c.status === 'pending' && c.requester._id === user._id);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 pt-24 pb-8 px-4 md:px-8 flex justify-center">
            <Toaster position="top-center" reverseOrder={false} />
            
            <div className="w-full max-w-7xl h-[85vh] flex bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                
                {/* ================= LEFT SIDEBAR (List) ================= */}
                <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-slate-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'} bg-slate-950/30`}>
                    
                    {/* Sidebar Header & Tabs */}
                    <div className="p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
                        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-5 flex items-center gap-2">
                            <MessageCircle size={24} className="text-indigo-500"/> Vaiya-TalkMe~ssenger
                        </h2>
                        
                        {/* 3 Modern Tabs */}
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
                            <button 
                                onClick={() => setActiveTab('chats')} 
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <MessageCircle size={14}/> Chats
                            </button>
                            <button 
    onClick={() => setActiveTab('inbox')} 
    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
>
    <Inbox size={14}/> Invitations
    {pendingReceived.length > 0 && <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse ring-2 ring-slate-900"></span>}
</button>
                            <button 
                                onClick={() => setActiveTab('sent')} 
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'sent' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <SendIcon size={14}/> Sent
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Lists */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
                        
                        {/* 1. CHAT TAB */}
                        {activeTab === 'chats' && conversations.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                                <MessageCircle size={40} className="mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">No conversations</p>
                            </div>
                        )}
                        {activeTab === 'chats' && conversations.map((conv) => {
                            const friend = conv.participants.find(p => p._id !== user._id);
                            if (!friend) return null;
                            const isOnline = onlineUsers.includes(friend._id);

                            return (
                                <div 
                                    key={conv._id} 
                                    onClick={() => handleSelectChat(conv)}
                                    className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all ${activeChat?._id === conv._id ? 'bg-indigo-600/10 border border-indigo-500/30 shadow-inner' : 'hover:bg-slate-800/60 border border-transparent'}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full p-[2px]">
                                            <div className="w-full h-full bg-slate-900 rounded-full overflow-hidden flex items-center justify-center font-bold text-white">
                                                {friend.profilePic ? <img src={friend.profilePic} alt="avatar" className="w-full h-full object-cover"/> : friend.fullName.charAt(0)}
                                            </div>
                                        </div>
                                        {isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-slate-900"></div>}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h4 className="font-bold text-slate-100 text-sm truncate pr-2">{friend.fullName}</h4>
                                            <span className="text-[10px] text-slate-500 font-semibold">{new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate">{conv.lastMessage || "Started a conversation..."}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* 2. INBOX TAB (Received Requests) */}
                        {activeTab === 'inbox' && pendingReceived.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                                <Inbox size={40} className="mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">Inbox is empty</p>
                            </div>
                        )}
                        {/* 2. INBOX TAB (Received Requests) */}
{activeTab === 'inbox' && pendingReceived.length === 0 && (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
        <Inbox size={40} className="mb-2" />
        <p className="text-xs font-bold uppercase tracking-widest">No pending invitations</p>
    </div>
)}
{activeTab === 'inbox' && pendingReceived.map((req) => (
    <div key={req._id} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl mb-2 hover:border-slate-600 transition-colors">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex justify-center items-center font-black border border-indigo-500/30">
                {req.requester.fullName.charAt(0)}
            </div>
            <div>
                <h4 className="font-bold text-sm text-white">{req.requester.fullName}</h4>
                {/* এখানে Reputation Points যোগ করা হয়েছে */}
                <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">
                    ★ {req.requester.reputationPoints || 0} Points
                </p>
            </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => handleAcceptRequest(req._id)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-lg shadow-indigo-900/20">
                <CheckCircle size={14} className="inline mr-1 mb-0.5"/> Accept
            </button>
            <button onClick={() => handleDeleteConnection(req._id, false)} className="flex-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-xs font-bold py-2 rounded-xl transition-all">
                <XCircle size={14} className="inline mr-1 mb-0.5"/> Reject
            </button>
        </div>
    </div>
))}

                        {/* 3. SENT TAB (Sent Requests) */}
                        {activeTab === 'sent' && pendingSent.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
                                <SendIcon size={40} className="mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">No sent requests</p>
                            </div>
                        )}
                        {activeTab === 'sent' && pendingSent.map((req) => (
                            <div key={req._id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-2 flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-800 rounded-full flex justify-center items-center font-bold text-slate-400">
                                        {req.recipient.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-200">{req.recipient.fullName}</h4>
                                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={10}/> Pending
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteConnection(req._id, true)} className="text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-rose-500/10 p-2 rounded-xl transition-all" title="Cancel Request">
                                    <UserMinus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= RIGHT CHAT AREA ================= */}
                <div className={`flex-1 flex flex-col bg-slate-950 relative ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                    
                    {!activeChat ? (
                        <div className="text-center text-slate-500 flex flex-col items-center">
                            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <MessageCircle size={48} className="text-indigo-500/50" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-300 mb-2">Campus Messenger</h3>
                            <p className="text-sm text-slate-500 max-w-xs">Select a conversation from the sidebar or accept a new request to start chatting.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header (Premium Look) */}
                            <div className="h-[76px] px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <button className="md:hidden text-slate-400 hover:text-white p-2 bg-slate-800 rounded-xl" onClick={() => setActiveChat(null)}>
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                                            {activeChat.participants.find(p => p._id !== user._id)?.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-100">
                                                {activeChat.participants.find(p => p._id !== user._id)?.fullName}
                                            </h3>
                                            <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Connected</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Dummy Action Icons for UI completion */}
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all hidden sm:block"><Phone size={18}/></button>
                                    <button className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all hidden sm:block"><Video size={18}/></button>
                                    <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>
                                    <button onClick={() => handleDeleteConversation(activeChat._id)} className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete Chat">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Body */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-[#020617] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light">
                                <div className="text-center my-6">
                                    <span className="bg-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-800">
                                        Conversation Started
                                    </span>
                                </div>
                                
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender === user._id || msg.sender?._id === user._id;
                                    
                                    return (
                                        <div key={idx} ref={scrollRef} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                                
                                                <div className={`relative px-4 py-2.5 shadow-md ${
                                                    isMe 
                                                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl rounded-tr-sm' 
                                                    : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700/50'
                                                }`}>
                                                    
                                                    {msg.isDeleted ? (
                                                        <p className="text-sm italic opacity-70 flex items-center gap-2">
                                                            <XCircle size={14}/> Message unsent
                                                        </p>
                                                    ) : (
                                                        <>
                                                            {msg.text && <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>}
                                                            
                                                            {msg.image && (
                                                                <a href={msg.image} target="_blank" rel="noreferrer" className="block mt-2">
                                                                    <img src={msg.image} alt="attachment" className="rounded-xl max-h-56 object-cover border border-white/10 hover:opacity-90 transition-opacity"/>
                                                                </a>
                                                            )}
                                                            
                                                            {msg.pdf && (
                                                                <a href={msg.pdf} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-2 bg-slate-950/30 p-2.5 rounded-xl text-xs font-bold hover:bg-slate-950/50 transition-colors border border-white/5">
                                                                    <div className="bg-rose-500/20 text-rose-300 p-1.5 rounded-lg"><FileText size={16}/></div>
                                                                    View Document
                                                                </a>
                                                            )}
                                                            
                                                            {/* Unsend Button (Hover to reveal) */}
                                                            {isMe && (
                                                                <button onClick={() => handleUnsendMessage(msg._id)} className="absolute top-1/2 -translate-y-1/2 -left-10 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-500 transition-all p-1.5 bg-slate-900 rounded-full border border-slate-800 shadow-lg" title="Unsend">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-slate-500 font-semibold mt-1.5 px-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Message Input Footer (Floating Design) */}
                            <div className="p-4 bg-slate-950">
                                
                                {/* Attachment Previews */}
                                {(imageFile || pdfFile) && (
                                    <div className="flex gap-2 mb-3">
                                        {imageFile && (
                                            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl text-indigo-400 text-xs font-bold">
                                                <ImageIcon size={14}/> Image selected 
                                                <button onClick={() => setImageFile(null)} className="hover:text-white ml-1"><XCircle size={14}/></button>
                                            </div>
                                        )}
                                        {pdfFile && (
                                            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl text-rose-400 text-xs font-bold">
                                                <FileText size={14}/> PDF selected
                                                <button onClick={() => setPdfFile(null)} className="hover:text-white ml-1"><XCircle size={14}/></button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-slate-900 p-2 rounded-3xl border border-slate-800 focus-within:border-indigo-500/50 transition-colors shadow-lg">
                                    <div className="flex gap-1 pl-2 pb-1">
                                        <label className="text-slate-400 hover:text-indigo-400 hover:bg-slate-800 cursor-pointer p-2.5 rounded-full transition-all">
                                            <ImageIcon size={20} />
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
                                        </label>
                                        <label className="text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer p-2.5 rounded-full transition-all">
                                            <FileText size={20} />
                                            <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files[0])} />
                                        </label>
                                    </div>
                                    
                                    <textarea 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Message..."
                                        className="flex-1 bg-transparent border-none p-3 text-sm text-slate-200 outline-none resize-none max-h-32 custom-scrollbar placeholder:text-slate-600"
                                        rows="1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                                        }}
                                    />
                                    
                                    <button 
                                        type="submit" 
                                        disabled={!newMessage.trim() && !imageFile && !pdfFile}
                                        className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-full transition-all shadow-lg shadow-indigo-600/20 mb-0.5 mr-0.5"
                                    >
                                        <Send size={18} className="ml-0.5" />
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