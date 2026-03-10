import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext'; // এখন আর এরর দিবে না
import API from '../../services/api';
import { Send, User, ChevronLeft, Search, MoreVertical, Trash2, MessageCircle, Zap, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const { receiverId } = useParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef();

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${name || 'U'}&background=2563eb&color=fff&rounded=true`;

  useEffect(() => {
    fetchConversations();
    if (receiverId) {
      fetchHistory();
      fetchReceiverProfile();
    }
  }, [receiverId]);

  const fetchConversations = async () => {
    try {
      const { data } = await API.get('/chat/conversations');
      setConversations(data);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/chat/history/${receiverId}`);
      setMessages(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchReceiverProfile = async (id = receiverId) => {
    try {
      const { data } = await API.get(`/users/profile/${id}`);
      setReceiver(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (socket) {
      socket.on("getMessage", (data) => {
        if (receiverId === data.sender) {
          setMessages((prev) => [...prev, data]);
        }
        fetchConversations();
      });
    }
    return () => socket?.off("getMessage");
  }, [socket, receiverId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = { senderId: user._id, receiverId, text: newMessage };
    socket.emit("sendMessage", msgData);
    
    setMessages((prev) => [...prev, { ...msgData, sender: user._id, createdAt: new Date() }]);
    setNewMessage("");
    fetchConversations();
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-4 px-2 md:px-10 flex justify-center">
      <div className="w-full max-w-7xl h-[88vh] bg-slate-900/30 border border-slate-800 rounded-[40px] flex overflow-hidden backdrop-blur-xl shadow-2xl">
        
        {/* LEFT: CONVERSATION LIST (Mobile Responsive) */}
        <div className={`${receiverId ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r border-slate-800 flex-col bg-black/20`}>
          <div className="p-8 border-b border-slate-800">
             <h3 className="text-2xl font-black italic uppercase tracking-tighter">Transmissions</h3>
             <div className="relative mt-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input placeholder="Search connections..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 text-sm outline-none focus:border-blue-500/50 transition-all" />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
             {conversations.map(conv => (
                <div 
                  key={conv._id} 
                  onClick={() => navigate(`/messages/${conv._id}`)}
                  className={`flex items-center gap-4 p-5 rounded-[28px] cursor-pointer transition-all ${receiverId === conv._id ? 'bg-blue-600 shadow-xl scale-[1.02]' : 'hover:bg-slate-800/40'}`}
                >
                   <div className="relative">
                      <img src={conv.profilePic || getAvatar(conv.fullName)} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-800 shadow-lg" alt="p" />
                      {onlineUsers.some(u => u.userId === conv._id) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-lg"></div>
                      )}
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <h4 className="font-black text-sm truncate uppercase tracking-tight">{conv.fullName}</h4>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${receiverId === conv._id ? 'text-blue-100' : 'text-slate-500'}`}>
                         {conv.badge || 'Active Student'}
                      </p>
                   </div>
                </div>
             ))}
             {conversations.length === 0 && <div className="text-center py-20 opacity-20 font-black uppercase text-xs tracking-widest italic">No pulse detected</div>}
          </div>
        </div>

        {/* RIGHT: CHAT INTERFACE */}
        <div className={`${!receiverId ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col relative bg-gradient-to-br from-slate-900/10 to-blue-900/5`}>
          {receiverId ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/30 backdrop-blur-md">
                 <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/messages')} className="md:hidden p-2 bg-slate-800 rounded-xl"><ChevronLeft/></button>
                    <img src={receiver?.profilePic || getAvatar(receiver?.fullName)} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-600/20" alt="r" />
                    <div>
                       <h4 className="font-black text-white uppercase tracking-tight">{receiver?.fullName}</h4>
                       <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1">
                          {onlineUsers.some(u => u.userId === receiverId) ? <><Zap size={10} className="fill-green-500"/> Online Intel</> : <span className="text-slate-600 italic">Offline Transmission</span>}
                       </p>
                    </div>
                 </div>
                 <MoreVertical className="text-slate-600" />
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                 {messages.map((m, i) => (
                    <div key={i} ref={scrollRef} className={`flex ${m.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] md:max-w-[60%] p-5 rounded-[32px] text-sm font-semibold shadow-2xl ${m.sender === user._id ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none' : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700'}`}>
                          {m.text}
                          <p className="text-[8px] opacity-30 mt-3 text-right font-black uppercase">
                             {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSend} className="p-6 md:p-8 bg-black/40 border-t border-slate-800 backdrop-blur-xl">
                 <div className="flex gap-4 bg-black/60 p-2 rounded-[28px] border border-slate-800 shadow-inner group focus-within:border-blue-500/50 transition-all">
                    <input 
                      type="text" 
                      placeholder="Enter encrypted message..." 
                      className="flex-1 bg-transparent px-6 py-3 outline-none text-white text-sm font-bold placeholder:text-slate-700"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="p-4 bg-blue-600 text-white rounded-[20px] shadow-xl hover:bg-blue-500 transition-all active:scale-90">
                       <Send size={22} />
                    </button>
                 </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
               <div className="p-12 bg-slate-900 rounded-[60px] border border-slate-800 shadow-3xl mb-8">
                  <MessageCircle size={100} className="text-blue-600" />
               </div>
               <h2 className="text-3xl font-black italic uppercase tracking-tighter">CampusVaiya Pulse</h2>
               <p className="mt-4 text-xs font-black uppercase tracking-[0.5em] text-slate-500">Secure conversation hub</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;