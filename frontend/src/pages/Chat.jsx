import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { matchApi } from '../api/matchApi';
import { messageApi } from '../api/messageApi';

const Chat = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await matchApi.getMyMatches();
        const fetchedMatches = res.data.data.matches || [];
        setMatches(fetchedMatches);
        if (matchId) {
          const found = fetchedMatches.find(m => m._id === matchId);
          setSelectedMatch(found || fetchedMatches[0]);
        } else if (fetchedMatches.length > 0) {
          setSelectedMatch(fetchedMatches[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [matchId]);

  useEffect(() => {
    if (!selectedMatch) return;

    const loadMessages = async () => {
      try {
        const res = await messageApi.getMessages(selectedMatch._id);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();

    if (socket) {
      socket.emit('join_match', selectedMatch._id);
      socket.on('new_message', ({ message }) => {
        setMessages(prev => [...prev, message]);
      });
      socket.on('user_typing', ({ userId }) => {
        if (userId !== user._id) setOtherUserTyping(true);
      });
      socket.on('user_stopped_typing', ({ userId }) => {
        if (userId !== user._id) setOtherUserTyping(false);
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      }
    };
  }, [selectedMatch, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;
    socket.emit('send_message', { matchId: selectedMatch._id, content: newMessage.trim() });
    setNewMessage('');
    socket.emit('typing_stop', { matchId: selectedMatch._id });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing_start', { matchId: selectedMatch._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { matchId: selectedMatch._id });
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getOtherUser = (match) =>
    match?.user1?._id === user?._id ? match?.user2 : match?.user1;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{height: '80vh'}}>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {matches.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">No conversations yet</div>
            ) : (
              matches.map(match => {
                const otherUser = getOtherUser(match);
                const isSelected = selectedMatch?._id === match._id;
                return (
                  <button
                    key={match._id}
                    onClick={() => setSelectedMatch(match)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${isSelected ? 'bg-sky-50 dark:bg-sky-900/20' : ''}`}
                  >
                    <img
                      src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${otherUser?.name}&background=0ea5e9&color=fff`}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="text-left min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{otherUser?.name}</div>
                      <div className="text-xs text-gray-400 truncate">{match.lastMessage?.content || 'Start chatting!'}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          {selectedMatch ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                <img
                  src={getOtherUser(selectedMatch)?.avatar || `https://ui-avatars.com/api/?name=${getOtherUser(selectedMatch)?.name}&background=0ea5e9&color=fff`}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{getOtherUser(selectedMatch)?.name}</div>
                  {otherUserTyping && <div className="text-xs text-green-500 animate-pulse">typing...</div>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 chat-scrollbar">
                {messages.map((message, index) => {
                  const isOwn = message.sender?._id === user._id || message.sender === user._id;
                  return (
                    <div key={message._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isOwn ? 'bg-sky-500 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-sm'}`}>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-sky-100' : 'text-gray-400'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 border border-transparent focus:border-sky-300 outline-none transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <div>
                <div className="text-4xl mb-3">💬</div>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;