import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Image as ImageIcon, FileText, UserPlus, ThumbsUp, ThumbsDown, 
  MessageSquare, Check, X, MessageCircle, Eye, Download, ChevronDown, Send, CornerDownRight, Clock 
} from 'lucide-react';

const Feed = () => {
  const { user } = useContext(AuthContext);
  
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState([]);

  // Post Creation States
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('Social'); 
  const [visibility, setVisibility] = useState('global'); 
  const [media, setMedia] = useState(null);
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // Mobile Chat State
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

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
      
      setContent(''); setMedia(null); setFile(null); setPostType('Social');
    } catch (error) {
      toast.error(error.response?.data?.message || "Internal Server Error");
    } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 pt-24 pb-12 px-4 md:px-8 flex justify-center gap-6 relative">
      
      {/* --- MOBILE CHAT FLOATING BUTTON --- */}
      {!isMobileChatOpen && (
        <button 
          onClick={() => setIsMobileChatOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* --- MOBILE CHAT OVERLAY (FULL SCREEN WITH MINIMIZE) --- */}
      {isMobileChatOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 lg:hidden flex flex-col animate-in slide-in-from-bottom-full duration-300">
          
          {/* Header & Minimize Button */}
          <div 
            className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 cursor-pointer active:bg-slate-800"
            onClick={() => setIsMobileChatOpen(false)}
          >
            <div className="flex items-center gap-3 text-white">
              <ChevronDown size={24} className="text-slate-400" />
              <h2 className="font-black text-lg">Chats</h2>
            </div>
            <button className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-full text-slate-300 font-bold uppercase tracking-wider">
              Minimize
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Horizontal Friends List */}
            <div className="p-4 border-b border-slate-800/50">
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">All Friends</p>
               <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar">
                 {connections.map(friend => (
                   <div key={friend._id} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer">
                     <div className="relative">
                       <img src={friend.profilePic || getAvatar(friend.fullName)} className="w-14 h-14 rounded-full object-cover border-2 border-slate-800" alt="friend" />
                       <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                     </div>
                     <p className="text-[10px] text-slate-300 font-bold truncate w-full text-center">{friend.fullName.split(' ')[0]}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* Vertical Recent Conversations List */}
            <div className="p-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Recent Conversations</p>
              <div className="space-y-2">
                {connections.map(friend => (
                  <div key={`recent-${friend._id}`} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-2xl active:bg-slate-800 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <img src={friend.profilePic || getAvatar(friend.fullName)} className="w-12 h-12 rounded-xl object-cover" alt="friend" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{friend.fullName}</h4>
                        <p className="text-xs text-slate-500 truncate max-w-[180px]">Tap to view conversation...</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] text-slate-500 font-bold">2m ago</span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LEFT COLUMN: FEED --- */}
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Create Post Box */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-6 rounded-[32px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"></div>
          <div className="flex gap-4 mb-4 mt-2">
            <img src={user?.profilePic || getAvatar(user?.fullName)} className="w-12 h-12 rounded-2xl border border-slate-700 object-cover" alt="me" />
            <textarea
              className="w-full bg-slate-950/50 text-white rounded-2xl p-4 focus:outline-none border border-slate-800 focus:border-blue-500/50 transition-colors resize-none text-sm placeholder:text-slate-600"
              rows="3"
              placeholder={postType === 'Resource' ? "Describe your resource/PDF..." : "What's on your mind campus?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Selected Files Preview */}
          {(media || file) && (
             <div className="mb-4 pl-[4.5rem] flex flex-wrap gap-3">
                {media && (
                  <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
                    <span className="text-[11px] text-blue-400 font-black uppercase tracking-widest">📸 {media.name.substring(0, 15)}...</span>
                    <button onClick={() => setMedia(null)} className="text-blue-400 hover:text-white transition-colors"><X size={14}/></button>
                  </div>
                )}
                {file && (
                  <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl">
                    <span className="text-[11px] text-purple-400 font-black uppercase tracking-widest">📄 {file.name.substring(0, 15)}...</span>
                    <button onClick={() => {setFile(null); setPostType('Social');}} className="text-purple-400 hover:text-white transition-colors"><X size={14}/></button>
                  </div>
                )}
             </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
            <div className="flex gap-2">
              <label className={`cursor-pointer p-2 rounded-xl hover:bg-slate-800 transition-all ${media ? 'text-blue-500' : 'text-slate-400'}`}>
                <ImageIcon size={22} />
                <input type="file" accept="image/*" className="hidden" onChange={e => setMedia(e.target.files[0])}/>
              </label>
              <label className={`cursor-pointer p-2 rounded-xl hover:bg-slate-800 transition-all ${file ? 'text-purple-500' : 'text-slate-400'}`}>
                <FileText size={22} />
                <input type="file" accept=".pdf,.docx,.zip" className="hidden" onChange={e => {setFile(e.target.files[0]); setPostType('Resource');}}/>
              </label>
            </div>
            <div className="flex gap-3">
               <select className="bg-slate-950 text-xs font-bold text-slate-300 p-2.5 rounded-xl border border-slate-800 outline-none cursor-pointer" value={visibility} onChange={e => setVisibility(e.target.value)}>
                  <option value="global">🌐 Global</option>
                  <option value="campus">🏫 Campus Only</option>
                  <option value="friends">👥 Friends</option>
               </select>
               <button 
                 onClick={handleCreatePost} 
                 disabled={creating} 
                 className="bg-blue-600 hover:bg-blue-700 px-8 py-2.5 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all disabled:opacity-50"
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
          {loading && <div className="text-center py-6 font-black text-slate-600 animate-pulse text-xs uppercase tracking-widest">Loading universe...</div>}
        </div>
      </div>

      {/* --- RIGHT COLUMN: SIDEBAR (DESKTOP) --- */}
      <div className="hidden lg:block w-80">
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 sticky top-28">
           <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest">Chat & Connections</h3>
           </div>
           
           <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {connections.length > 0 ? connections.map(friend => (
                <div key={friend._id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-800 p-3 rounded-2xl transition-all border border-transparent hover:border-slate-700">
                  <div className="flex items-center gap-3">
                    <img src={friend.profilePic || getAvatar(friend.fullName)} className="w-10 h-10 rounded-xl object-cover" alt="friend" />
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-white">{friend.fullName}</p>
                      <p className="text-[9px] text-green-500 uppercase font-black">Online</p>
                    </div>
                  </div>
                  <MessageSquare size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                </div>
              )) : (
                <div className="text-center py-8">
                    <p className="text-[10px] text-slate-600 font-bold uppercase">No active connections</p>
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

  // --- New Comment States ---
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // { id: '...', name: '...' }
  const [postingComment, setPostingComment] = useState(false);

  // Perfect Toggle Vote Logic
  const handleVote = async (type) => {
    let newVoteStatus = null;
    let updatedUp = votes.up;
    let updatedDown = votes.down;

    if (type === 'up') {
      if (userVote === 'up') {
        updatedUp -= 1; 
      } else {
        updatedUp += 1;
        if (userVote === 'down') updatedDown -= 1;
        newVoteStatus = 'up';
      }
    } else {
      if (userVote === 'down') {
        updatedDown -= 1; 
      } else {
        updatedDown += 1;
        if (userVote === 'up') updatedUp -= 1;
        newVoteStatus = 'down';
      }
    }

    setVotes({ up: updatedUp, down: updatedDown });
    setUserVote(newVoteStatus);

    try {
      const actionType = (userVote === type) ? 'remove' : (type === 'up' ? 'upvote' : 'downvote');
      await API.put(`/social/vote/${post._id}`, { type: actionType });
    } catch (err) { 
      setVotes({ up: post.upvotes?.length || 0, down: post.downvotes?.length || 0 });
      setUserVote(post.upvotes?.includes(currentUser?._id) ? 'up' : post.downvotes?.includes(currentUser?._id) ? 'down' : null);
      toast.error("Action failed. Check backend logic.");
    }
  };

  const handleConnect = async () => {
    try {
      await API.post(`/social/connect/${post.author?._id}`);
      setRequested(true);
      toast.success("Connection request sent!");
    } catch (err) { toast.error("Request sent already") }
  };

  // --- Fetch Comments Logic ---
  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const { data } = await API.get(`/comments/post/${post._id}`);
        setComments(data);
      } catch (err) {
        toast.error("Failed to load comments");
      } finally {
        setLoadingComments(false);
      }
    }
  };

  // --- Submit Comment Logic ---
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const payload = {
        content: newComment,
        postId: post._id,
        parentId: replyingTo ? replyingTo.id : null
      };

      const { data } = await API.post('/comments', payload);
      
      setComments(prev => [data, ...prev]);
      setNewComment("");
      setReplyingTo(null);
      toast.success(replyingTo ? "Reply posted!" : "Comment posted!");
    } catch (err) {
      toast.error("Could not post comment");
    } finally {
      setPostingComment(false);
    }
  };

  // Separate Main Comments from Replies
  const mainComments = comments.filter(c => !c.parentId);
  const getReplies = (parentId) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-slate-700/50 transition-all group shadow-sm">
      {/* POST HEADER */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex gap-4 items-center">
          <img src={post.author?.profilePic || getAvatar(post.author?.fullName)} className="w-12 h-12 rounded-[18px] border border-slate-700 object-cover" alt="avatar" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-white font-bold text-sm">{post.author?.fullName || "Anonymous"}</h4>
              {post.postType === 'Resource' && <span className="text-[8px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-black uppercase">Resource</span>}
            </div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">
              {post.visibility} • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {currentUser?._id !== post.author?._id && (
          <button 
            onClick={handleConnect} 
            disabled={requested}
            className={`p-2.5 rounded-xl transition-all ${requested ? 'text-green-500 bg-green-500/10' : 'text-slate-400 bg-slate-800 hover:bg-blue-600 hover:text-white'}`}
          >
            {requested ? <Check size={18} /> : <UserPlus size={18} />}
          </button>
        )}
      </div>

      {/* POST CONTENT */}
      <p className="text-slate-200 text-sm leading-relaxed mb-5 whitespace-pre-wrap">{post.content}</p>

      {/* Image Handler */}
      {post.media && (
        <div className="mb-5 overflow-hidden rounded-[24px] border border-slate-800">
           <img src={post.media} className="w-full h-auto max-h-[450px] object-cover" alt="post-media" loading="lazy" />
        </div>
      )}
      
      {/* Advanced PDF Handler */}
      {post.file && (
        <div className="bg-slate-950/80 p-5 rounded-[24px] border border-slate-800 mb-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
              <FileText size={28} />
            </div>
            <div>
              <span className="text-sm font-black text-slate-200 uppercase tracking-wide block">Document Attached</span>
              <span className="text-[10px] text-slate-500 uppercase font-black">PDF / Web Accessible</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <a 
              href={`https://docs.google.com/viewer?url=${encodeURIComponent(post.file)}&embedded=true`}
              target="_blank" 
              rel="noreferrer" 
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              <Eye size={16} /> View Web
            </a>
            
            <a 
              href={post.file} 
              target="_blank"
              download
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20"
            >
              <Download size={16} /> Download
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 border-t border-slate-800/60 pt-5">
        <button 
          onClick={() => handleVote('up')} 
          className={`flex items-center gap-2 text-xs font-black transition-all px-4 py-2 rounded-xl ${userVote === 'up' ? 'text-white bg-green-500 hover:bg-green-600' : 'text-slate-400 bg-slate-800 hover:bg-slate-700'}`}
        >
          <ThumbsUp size={16} /> {votes.up}
        </button>
        <button 
          onClick={() => handleVote('down')} 
          className={`flex items-center gap-2 text-xs font-black transition-all px-4 py-2 rounded-xl ${userVote === 'down' ? 'text-white bg-red-500 hover:bg-red-600' : 'text-slate-400 bg-slate-800 hover:bg-slate-700'}`}
        >
          <ThumbsDown size={16} /> {votes.down}
        </button>
        
        {/* Toggle Comment Button */}
        <button 
          onClick={handleToggleComments}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ml-auto ${showComments ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-800 hover:bg-blue-600 hover:text-white'}`}
        >
          <MessageSquare size={16} /> {post.comments?.length || comments.length || 0}
        </button>
      </div>

      {/* --- COLLAPSIBLE COMMENT SECTION --- */}
      {showComments && (
        <div className="mt-6 border-t border-slate-800/60 pt-5 animate-in slide-in-from-top-4 duration-300">
          
          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="mb-6 relative">
            {replyingTo && (
              <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-t-xl text-[10px] font-bold uppercase tracking-wider mb-[-10px] pb-3 z-0">
                <span>Replying to {replyingTo.name}</span>
                <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-white"><X size={14}/></button>
              </div>
            )}
            <div className="relative z-10 flex gap-3 items-center">
              <img src={currentUser?.profilePic || getAvatar(currentUser?.fullName)} className="w-10 h-10 rounded-[14px] border border-slate-700 object-cover" alt="me" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-slate-950 text-slate-200 rounded-xl px-4 py-3 text-sm border border-slate-800 focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
                />
                <button 
                  type="submit" 
                  disabled={postingComment || !newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all"
                >
                  <Send size={14} /> 
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingComments ? (
               <div className="text-center py-4 text-slate-500 text-xs font-bold animate-pulse uppercase">Loading comments...</div>
            ) : mainComments.length === 0 ? (
               <div className="text-center py-4 text-slate-600 text-xs font-bold uppercase">No comments yet. Be the first!</div>
            ) : (
              mainComments.map(comment => (
                <div key={comment._id} className="space-y-3">
                  {/* Main Comment */}
                  <CommentItem 
                    comment={comment} 
                    currentUser={currentUser} 
                    getAvatar={getAvatar} 
                    onReply={() => setReplyingTo({ id: comment._id, name: comment.author?.fullName })}
                  />
                  
                  {/* Replies (Nested) */}
                  {getReplies(comment._id).length > 0 && (
                    <div className="ml-10 space-y-3 border-l-2 border-slate-800/60 pl-4 relative">
                      {getReplies(comment._id).map(reply => (
                        <div key={reply._id} className="relative">
                           <div className="absolute -left-4 top-4 w-4 h-0.5 bg-slate-800/60"></div>
                           <CommentItem 
                             comment={reply} 
                             currentUser={currentUser} 
                             getAvatar={getAvatar}
                             isReply={true}
                             onReply={() => setReplyingTo({ id: comment._id, name: reply.author?.fullName })} 
                           />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: COMMENT ITEM ---
const CommentItem = ({ comment, currentUser, getAvatar, onReply, isReply = false }) => {
  const [votes, setVotes] = useState({ up: comment.upvotes?.length || 0, down: comment.downvotes?.length || 0 });
  const [userVote, setUserVote] = useState(
    comment.upvotes?.includes(currentUser?._id) ? 'up' : 
    comment.downvotes?.includes(currentUser?._id) ? 'down' : null
  );

  const handleVote = async (type) => {
    let newVoteStatus = null;
    let updatedUp = votes.up;
    let updatedDown = votes.down;

    if (type === 'up') {
      if (userVote === 'up') updatedUp -= 1;
      else { updatedUp += 1; if (userVote === 'down') updatedDown -= 1; newVoteStatus = 'up'; }
    } else {
      if (userVote === 'down') updatedDown -= 1;
      else { updatedDown += 1; if (userVote === 'up') updatedUp -= 1; newVoteStatus = 'down'; }
    }

    setVotes({ up: updatedUp, down: updatedDown });
    setUserVote(newVoteStatus);

    try {
      const actionType = (userVote === type) ? 'remove' : (type === 'up' ? 'upvote' : 'downvote');
      await API.patch(`/comments/${comment._id}/vote`, { type: actionType });
    } catch (err) {
       setVotes({ up: comment.upvotes?.length || 0, down: comment.downvotes?.length || 0 });
       setUserVote(comment.upvotes?.includes(currentUser?._id) ? 'up' : comment.downvotes?.includes(currentUser?._id) ? 'down' : null);
    }
  };

  return (
    <div className={`bg-slate-950/50 p-4 rounded-2xl border ${isReply ? 'border-slate-800/40' : 'border-slate-800'} flex gap-3 group`}>
      <img src={comment.author?.profilePic || getAvatar(comment.author?.fullName)} className="w-8 h-8 rounded-xl object-cover border border-slate-700" alt="avatar" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h5 className="text-white text-xs font-bold">{comment.author?.fullName}</h5>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed mb-3 whitespace-pre-wrap">{comment.content}</p>
        
        {/* Comment Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button onClick={() => handleVote('up')} className={`p-1.5 rounded-md transition-colors ${userVote === 'up' ? 'text-green-500 bg-slate-800' : 'text-slate-500 hover:text-green-500 hover:bg-slate-800'}`}>
              <ThumbsUp size={12} />
            </button>
            <span className="text-[10px] font-black text-slate-400 px-2 min-w-[20px] text-center">{votes.up - votes.down}</span>
            <button onClick={() => handleVote('down')} className={`p-1.5 rounded-md transition-colors ${userVote === 'down' ? 'text-red-500 bg-slate-800' : 'text-slate-500 hover:text-red-500 hover:bg-slate-800'}`}>
              <ThumbsDown size={12} />
            </button>
          </div>
          
          <button onClick={onReply} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors">
            <CornerDownRight size={12} /> Reply
          </button>
        </div>
      </div>
    </div>
  );
}; 

export default Feed;