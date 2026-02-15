import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronDown } from 'lucide-react';
import { useWatchPartyUserStore } from '../store/userStore';
import { socket } from '../services/socketService';

interface Message {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

export const ChatPanel = () => {
  const { user } = useWatchPartyUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMsgCount, setNewMsgCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const MAX_CHARS = 500;

  // Auto scroll (only if at bottom)
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMsgCount(0);
  }, []);

  // Track scroll position
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 80;
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMsgCount(0);
  };

  // Add new message
  useEffect(() => {
    socket.on('chat:message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      if (!isAtBottom) {
        setNewMsgCount(prev => prev + 1);
      }
    });
    socket.on('chat:typing', (username: string) => {
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username]);
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== username));
      }, 3000);
    });
    return () => {
      socket.off('chat:message');
      socket.off('chat:typing');
    };
  }, [isAtBottom]);

  // Auto scroll when at bottom
  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages, isAtBottom, scrollToBottom]);

  // Emit typing indicator (debounced)
  const emitTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('chat:typing', { username: user?.username });
    typingTimeoutRef.current = setTimeout(() => {
      // Typing auto-stops after 3s
    }, 3000);
  };

  // Auto-resize textarea
  const adjustTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '40px';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || !user) return;

    socket.emit('chat:message', { content: trimmed });
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = '40px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.03]">
        <h3 className="font-bold text-white uppercase tracking-wider text-xs">Live Chat</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400 font-bold tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar relative"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-white/[0.04] rounded-2xl flex items-center justify-center mb-3">
              <Send size={20} className="text-gray-600" />
            </div>
            <p className="text-gray-500 text-xs">Start the conversation!</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.userId === user?.id;

          if (msg.isSystem) {
            return (
              <div key={msg.id || index} className="flex justify-center my-2">
                <span className="text-[10px] text-gray-500 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.04]">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <img src={msg.avatar} alt={msg.username} className="w-7 h-7 rounded-full bg-dark-bg shrink-0 mt-0.5" />

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-gray-400">{isMe ? 'You' : msg.username}</span>
                  <span className="text-[9px] text-gray-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-purple-500/20 text-purple-100 rounded-tr-sm border border-purple-500/10'
                    : 'bg-white/[0.06] text-gray-200 rounded-tl-sm border border-white/[0.04]'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* New messages badge */}
      <AnimatePresence>
        {!isAtBottom && newMsgCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-2 bg-purple-500 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/30 hover:bg-purple-400 transition-all z-10"
          >
            <ChevronDown size={14} />
            {newMsgCount} new message{newMsgCount > 1 ? 's' : ''}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-1.5 border-t border-white/[0.04]"
          >
            <span className="text-[10px] text-gray-500 italic">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
              <span className="inline-flex ml-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white/[0.03] border-t border-white/[0.06]">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setInputValue(e.target.value);
                  emitTyping();
                }
                adjustTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Send a message…"
              rows={1}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-4 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm resize-none min-h-[40px] max-h-[120px] custom-scrollbar"
              style={{ height: '40px' }}
            />
            {inputValue.length > MAX_CHARS * 0.8 && (
              <span className={`absolute right-3 bottom-2 text-[9px] font-mono ${inputValue.length >= MAX_CHARS ? 'text-red-400' : 'text-gray-500'}`}>
                {inputValue.length}/{MAX_CHARS}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-400 active:scale-90 disabled:opacity-30 disabled:hover:bg-purple-500 disabled:active:scale-100 transition-all duration-200 shadow-lg shadow-purple-500/20 shrink-0"
          >
            <Send size={16} className={inputValue.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
          </button>
        </div>
      </form>
    </div>
  );
};
