import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { SEO } from '@/components/shared/SEO';
import {
  Send,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  LogIn,
  MessageSquare,
  Clock,
  Bookmark,
  Trash2,
  Plus,
  ChevronRight,
  Church,
  Sun,
  Moon,
} from 'lucide-react';
import { ChatMessage } from '@/types';
import { getCurrentUser } from '@/lib/utils';
import AuthModal from '@/components/streaming/AuthModal';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; reset_at: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const user = getCurrentUser();

  // Initialize theme
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('ruachstream_theme');
    setIsDark(savedTheme !== 'light');
  }, []);

  // Apply theme
  useEffect(() => {
    if (!mounted) return;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark, mounted]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.message || 'Rate limit reached. Sign in for unlimited access!');
          if (data.suggest_signin) setShowSignInPrompt(true);
        } else {
          setError(data.message || 'Something went wrong. Please try again.');
        }
        return;
      }

      if (data.session_id && !sessionId) setSessionId(data.session_id);
      if (data.rate_limit) setRateLimit(data.rate_limit);

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to send message. Please check your connection.');
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

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  const suggestedQuestions = [
    { icon: '📍', text: 'Where is the church located?', desc: 'Get directions' },
    { icon: '⏰', text: 'What time are Sunday services?', desc: 'Service schedule' },
    { icon: '📅', text: 'Any upcoming events?', desc: 'See what\'s happening' },
    { icon: '🙏', text: 'How can I submit a prayer request?', desc: 'We\'d love to pray' },
    { icon: '👥', text: 'How can I join a small group?', desc: 'Connect with others' },
    { icon: '🎧', text: 'Where can I listen to sermons?', desc: 'Past messages' },
  ];

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0c10]" />;
  }

  return (
    <>
      <SEO
        title="Ask Ruach AI"
        description="Ask Ruach — your AI church assistant. Get instant answers about services, events, directions, Connect Class, and anything about Ruach Tabernacle Assembly."
        url="/ask"
      />

      <div className={`min-h-screen flex ${isDark ? 'bg-[#101622] text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Sidebar */}
        <aside className={`w-72 hidden lg:flex flex-col border-r ${isDark ? 'bg-[#151b2b] border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="p-4 flex flex-col h-full">
            {/* Header */}
            <Link href="/" className="flex items-center gap-3 px-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#9a0826] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">Ask Ruach</h1>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AI Church Assistant</p>
              </div>
            </Link>

            {/* New Chat Button */}
            <button
              onClick={clearChat}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#BF0A30] hover:bg-[#9a0826] text-white rounded-xl font-medium transition-colors mb-6"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>

            {/* Chat History Placeholder */}
            <div className="flex-1 overflow-y-auto">
              <div className={`text-xs font-semibold uppercase tracking-wider mb-3 px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Recent
              </div>
              {messages.length > 0 ? (
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                  <MessageSquare className="w-4 h-4 text-[#BF0A30]" />
                  <span className="text-sm truncate">Current conversation</span>
                </div>
              ) : (
                <p className={`text-sm px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No conversations yet
                </p>
              )}
            </div>

            {/* Footer */}
            <div className={`pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} space-y-2`}>
              <Link
                href="/"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Church className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-screen">
          {/* Top Bar */}
          <header className={`flex items-center justify-between px-4 lg:px-6 py-3 border-b ${isDark ? 'bg-[#151b2b]/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-md`}>
            <div className="flex items-center gap-3">
              <Link href="/" className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#9a0826] flex items-center justify-center lg:hidden">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold">Ask Ruach</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Online</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Clear chat"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              {!user && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] hover:bg-[#9a0826] text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              {/* Welcome State */}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#BF0A30]/20 to-[#9a0826]/20 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-[#BF0A30]" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    How can I help you today?
                  </h2>
                  <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Ask me anything about our church, services, events, or faith.
                  </p>

                  {/* Suggested Questions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInputValue(q.text);
                          inputRef.current?.focus();
                        }}
                        className={`flex items-start gap-3 p-4 text-left rounded-2xl border transition-all group ${
                          isDark
                            ? 'bg-[#1a1f2e] border-gray-800 hover:border-[#BF0A30]/50 hover:bg-[#1a1f2e]/80'
                            : 'bg-white border-gray-200 hover:border-[#BF0A30]/50 hover:shadow-md'
                        }`}
                      >
                        <span className="text-2xl">{q.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{q.text}</p>
                          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{q.desc}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gradient-to-br from-[#BF0A30] to-[#9a0826]'
                      }`}>
                        {msg.role === 'user' ? (
                          <span className="text-white text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-[#BF0A30] text-white rounded-br-md'
                            : isDark
                              ? 'bg-[#1a1f2e] text-white rounded-bl-md'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#9a0826] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${isDark ? 'bg-[#1a1f2e]' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#BF0A30]" />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Meditating...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex justify-center">
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                    </div>
                  </div>
                )}

                {/* Sign-in Prompt */}
                {showSignInPrompt && !user && (
                  <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="flex items-start gap-3">
                      <LogIn className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className={`font-medium ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>
                          Sign in for unlimited access
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          Save your chat history and get personalized responses.
                        </p>
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Rate Limit Warning */}
          {rateLimit && !user && rateLimit.remaining < 5 && (
            <div className={`px-4 py-2 text-center text-sm ${isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
              {rateLimit.remaining} messages remaining. Sign in for unlimited access!
            </div>
          )}

          {/* Input Area */}
          <div className={`p-4 border-t ${isDark ? 'bg-[#101622] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="max-w-3xl mx-auto">
              <div className={`flex items-end gap-3 rounded-2xl p-3 ${isDark ? 'bg-[#1a1f2e]' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about our church..."
                  rows={1}
                  className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-sm py-2 px-1 max-h-32 ${
                    isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'
                  }`}
                  style={{ minHeight: '44px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-3 bg-[#BF0A30] hover:bg-[#9a0826] disabled:bg-gray-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-center text-xs mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Ask Ruach is here to help with questions about our church. For urgent matters, please call us directly.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}