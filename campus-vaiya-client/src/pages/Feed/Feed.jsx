import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { Image, FileText, UserPlus, ThumbsUp, ThumbsDown, MessageSquare, Check, X } from 'lucide-react';

const Feed = () => {
  const { user } = useContext(AuthContext);
  
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState([]);

  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('Social'); 
  const [visibility, setVisibility] = useState('global'); 
  const [media, setMedia] = useState(null);
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const getAvatar = (name) => `https://ui-avatars.com/api/?name=${name || 'U'}&background=2563eb&color=fff&rounded=true`;

  const fetchFeed = useCallback(async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/social/feed?page=${pageNum}&limit=5`);
      if (data.length < 5) setHasMore(false);
      setPosts(prev => pageNum === 1 ? data : [...prev, ...data]);
    } catch (error) {
      toast.error("Error loading feed");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConnections = async () => {
    try {
      const { data } = await API.get('/social/connections');
      setConnections(data);
    } catch (err) { console.log("Connection load error", err) }
  };

  useEffect(() => {
    fetchFeed(1);
    fetchConnections();
  }, [fetchFeed]);

  // Infinite Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 50 >= document.documentElement.scrollHeight) {
        if (hasMore && !loading) {
          setPage(prev => {
            const nextPage = prev + 1;
            fetchFeed(nextPage);
            return nextPage;
          });
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, fetchFeed]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Write something first!");
    
    setCreating(true);
    const formData = new FormData();
    formData.append('content', content);
    formData.append('postType', postType);
    formData.append('visibility', visibility);
    
    // যদি টাইটেল বা সাবজেক্ট আপনার মডেলে রিকোয়ার্ড থাকে তবে এগুলো পাঠান
    formData.append('title', content.substring(0, 20)); 
    formData.append('subject', postType === 'Resource' ? 'Academic' : '');

    if (media) formData.append('media', media);
    if (file) formData.append('file', file);

    try {
      const { data } = await API.post('/social/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Post live! 🚀");
      setPosts(prev => [data, ...prev]); 
      
      // Reset States
      setContent(''); 
      setMedia(null); 
      setFile(null); 
      setPostType('Social');
    } catch (error) {
      console.error("Error Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Internal Server Error");
    } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 pt-28 pb-12 px-4 md:px-8 flex justify-center gap-6">
      
      {/* Left Column: Feed */}
      <div className="w-full max-w-2xl space-y-6">
        {/* Create Post Box */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-500"></div>
          <div className="flex gap-4 mb-4 mt-2">
            <img src={user?.profilePic || getAvatar(user?.fullName)} className="w-10 h-10 rounded-full border border-slate-700 object-cover" alt="me" />
            <textarea
              className="w-full bg-slate-950 text-white rounded-2xl p-4 focus:outline-none border border-slate-800 resize-none text-sm"
              rows="3"
              placeholder={postType === 'Resource' ? "Describe your resource..." : "What's on your mind?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Selected Files Preview with Remove Button */}
          {(media || file) && (
             <div className="mb-4 px-14 flex flex-wrap gap-3">
                {media && (
                  <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">📸 {media.name.substring(0, 15)}...</span>
                    <button onClick={() => setMedia(null)} className="text-blue-400 hover:text-white transition-colors"><X size={12}/></button>
                  </div>
                )}
                {file && (
                  <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest">📄 {file.name.substring(0, 15)}...</span>
                    <button onClick={() => {setFile(null); setPostType('Social');}} className="text-purple-400 hover:text-white transition-colors"><X size={12}/></button>
                  </div>
                )}
             </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <div className="flex gap-4">
              <label className={`cursor-pointer transition-colors ${media ? 'text-blue-500' : 'text-slate-400 hover:text-blue-400'}`}>
                <Image size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={e => setMedia(e.target.files[0])}/>
              </label>
              <label className={`cursor-pointer transition-colors ${file ? 'text-purple-500' : 'text-slate-400 hover:text-purple-400'}`}>
                <FileText size={20} />
                <input type="file" accept=".pdf,.docx,.zip" className="hidden" onChange={e => {setFile(e.target.files[0]); setPostType('Resource');}}/>
              </label>
            </div>
            <div className="flex gap-2">
               <select className="bg-slate-950 text-xs p-2 rounded-lg border border-slate-800 outline-none" value={visibility} onChange={e => setVisibility(e.target.value)}>
                  <option value="global">Global</option>
                  <option value="campus">Campus Only</option>
                  <option value="friends">Friends</option>
               </select>
               <button 
                 onClick={handleCreatePost} 
                 disabled={creating} 
                 className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl text-xs font-bold text-white uppercase transition-all disabled:opacity-50"
               >
                 {creating ? 'Posting...' : 'Post'}
               </button>
            </div>
          </div>
        </div>

        {/* Post List */}
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post._id} post={post} currentUser={user} getAvatar={getAvatar} />
          ))}
          {loading && <div className="text-center py-4 font-bold text-slate-600 animate-pulse italic">Loading feed...</div>}
          {!hasMore && posts.length > 0 && <div className="text-center text-slate-700 text-[10px] font-black uppercase tracking-widest py-10">You've reached the end of the galaxy.</div>}
        </div>
      </div>

      {/* Right Column: Sidebar */}
      <div className="hidden lg:block w-80">
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 sticky top-28">
           <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest">Active Connections</h3>
           </div>
           
           <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {connections.length > 0 ? connections.map(friend => (
                <div key={friend._id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-800/50 p-2 rounded-2xl transition-all">
                  <div className="flex items-center gap-3">
                    <img src={friend.profilePic || getAvatar(friend.fullName)} className="w-8 h-8 rounded-full object-cover" alt="friend" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">{friend.fullName}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black">{friend.reputationPoints || 0} Points</p>
                    </div>
                  </div>
                  <MessageSquare size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                </div>
              )) : (
                <div className="text-center py-4">
                    <p className="text-[10px] text-slate-600 font-bold uppercase">No active connections</p>
                    <button className="text-[9px] text-blue-500 font-black mt-2 uppercase underline">Find Seniors</button>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: POST CARD ---
const PostCard = ({ post, currentUser, getAvatar }) => {
  const [votes, setVotes] = useState({ up: post.upvotes?.length || 0, down: post.downvotes?.length || 0 });
  const [userVote, setUserVote] = useState(
    post.upvotes?.includes(currentUser?._id) ? 'up' : 
    post.downvotes?.includes(currentUser?._id) ? 'down' : null
  );
  const [requested, setRequested] = useState(false);

  const handleVote = async (type) => {
    try {
      const voteType = type === 'upvote' ? 'upvote' : 'downvote';
      await API.put(`/social/vote/${post._id}`, { type: voteType });
      
      if (type === 'upvote') {
        setVotes(prev => ({ 
            up: userVote === 'up' ? prev.up - 1 : prev.up + 1, 
            down: userVote === 'down' ? prev.down - 1 : prev.down 
        }));
        setUserVote(userVote === 'up' ? null : 'up');
      } else {
        setVotes(prev => ({ 
            down: userVote === 'down' ? prev.down - 1 : prev.down + 1, 
            up: userVote === 'up' ? prev.up - 1 : prev.up 
        }));
        setUserVote(userVote === 'down' ? null : 'down');
      }
    } catch (err) { toast.error("Action failed") }
  };

  const handleConnect = async () => {
    try {
      await API.post(`/social/connect/${post.author?._id}`);
      setRequested(true);
      toast.success("Connection request sent!");
    } catch (err) { toast.error("Request already sent or error") }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-[32px] hover:border-slate-700 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <img src={post.author?.profilePic || getAvatar(post.author?.fullName)} className="w-10 h-10 rounded-full border border-slate-800 object-cover" alt="avatar" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white font-bold text-sm">{post.author?.fullName || "Anonymous"}</h4>
              <span className="text-[10px] text-blue-400 font-black">+{post.author?.reputationPoints || 0} PTS</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{post.visibility} • {new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {currentUser?._id !== post.author?._id && (
          <button 
            onClick={handleConnect} 
            disabled={requested}
            className={`p-2 rounded-xl transition-all ${requested ? 'text-green-500 bg-green-500/10' : 'text-slate-500 hover:bg-blue-500/10 hover:text-blue-500'}`}
          >
            {requested ? <Check size={18} /> : <UserPlus size={18} />}
          </button>
        )}
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

      {post.media && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-800">
           <img src={post.media} className="w-full h-auto max-h-[400px] object-cover hover:scale-105 transition-transform duration-500" alt="post-media" />
        </div>
      )}
      
      {post.file && (
        <a href={post.file} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 hover:border-blue-500 transition-all group/file">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover/file:bg-blue-500 group-hover/file:text-white transition-all">
            <FileText size={20} />
          </div>
          <div>
            <span className="text-xs font-black text-slate-200 uppercase block">Download Resource</span>
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Education Material</span>
          </div>
        </a>
      )}

      <div className="flex items-center gap-6 border-t border-slate-800/50 pt-4">
        <button 
          onClick={() => handleVote('upvote')} 
          className={`flex items-center gap-2 text-xs font-black transition-colors ${userVote === 'up' ? 'text-green-500' : 'text-slate-500 hover:text-green-500'}`}
        >
          <ThumbsUp size={16} /> {votes.up}
        </button>
        <button 
          onClick={() => handleVote('downvote')} 
          className={`flex items-center gap-2 text-xs font-black transition-colors ${userVote === 'down' ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
        >
          <ThumbsDown size={16} /> {votes.down}
        </button>
        <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 text-xs font-black transition-colors">
          <MessageSquare size={16} /> {post.comments?.length || 0}
        </button>
      </div>
    </div>
  );
};

export default Feed;