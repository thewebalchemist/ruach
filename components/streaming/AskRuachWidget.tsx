import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  Paperclip,
  Sparkles,
  ChevronDown,
  User,
  Loader2,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { getCurrentUser } from '@/lib/utils';

interface AskRuachWidgetProps {
  onOpenAuthModal?: () => void;
}

export default function AskRuachWidget({ onOpenAuthModal }: AskRuachWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; reset_at: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const user = getCurrentUser();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Show sign-in prompt after 5 messages for anonymous users
  useEffect(() => {
    if (!user && messages.filter(m => m.role === 'user').length >= 5) {
      setShowSignInPrompt(true);
    }
  }, [messages, user]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    const assistantId = `msg_${Date.now()}_assistant`;
    setMessages(prev => [...prev, {
      id: assistantId, role: 'assistant', content: '', created_at: new Date().toISOString(),
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          conversation_history: messages,
          user_id: user?.id,
        }),
      });

      // Errors come back as JSON; success is a text/event-stream of deltas.
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 429) {
          setError(data.message || 'Rate limit reached. Sign in for unlimited access!');
          if (data.suggest_signin) setShowSignInPrompt(true);
        } else {
          setError(data.message || 'Something went wrong. Please try again.');
        }
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            if (event.type === 'delta') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + event.content } : m
              ));
            } else if (event.type === 'done') {
              if (event.session_id && !sessionId) setSessionId(event.session_id);
              if (event.rate_limit) setRateLimit(event.rate_limit);
            } else if (event.type === 'error') {
              setError(event.message);
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to send message. Please check your connection.');
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    { icon: '📍', text: 'Where is the church located?' },
    { icon: '⏰', text: 'What time are Sunday services?' },
    { icon: '📅', text: 'Any upcoming events?' },
    { icon: '🙏', text: 'How can I submit a prayer request?' },
  ];

  const handleSuggestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-[#BF0A30] to-[#9a0826] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all group ${isOpen ? 'hidden' : ''}`}
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="font-semibold text-sm">Ask Ruach</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full sm:w-[420px] h-[100dvh] sm:h-[600px] sm:max-h-[85vh] bg-white dark:bg-[#0f1219] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1219]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#BF0A30] to-[#9a0826] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Ask Ruach</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome Message (if no messages) */}
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#BF0A30]/10 to-[#9a0826]/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#BF0A30]" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to Ask Ruach! 👋
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    I'm here to help answer your questions about our church, services, and events.
                  </p>

                  {/* Suggested Questions */}
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(q.text)}
                        className="flex items-center gap-3 p-3 text-left bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-lg">{q.icon}</span>
                        <span>{q.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-[#BF0A30] text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#BF0A30]" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Meditating...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                  </div>
                </div>
              )}

              {/* Sign-in prompt */}
              {showSignInPrompt && !user && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <LogIn className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Sign in for unlimited access
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Save your chat history and get personalized responses.
                      </p>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onOpenAuthModal?.();
                        }}
                        className="mt-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Rate limit indicator */}
            {rateLimit && !user && rateLimit.remaining < 5 && (
              <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
                  {rateLimit.remaining} messages remaining. Sign in for unlimited access!
                </p>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f1219]">
              <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 py-2 px-2 max-h-24"
                  style={{ minHeight: '40px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2.5 bg-[#BF0A30] hover:bg-[#9a0826] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Ask Ruach can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}