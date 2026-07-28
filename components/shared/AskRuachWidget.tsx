import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/router';
import { ChatMessage } from '@/types';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const SUGGESTIONS = [
  { icon: '📍', text: 'Where is Ruach Tabernacle located?' },
  { icon: '⏰', text: 'What time are Sunday services?' },
  { icon: '📅', text: 'Are there any upcoming events?' },
  { icon: '🙏', text: 'How do I submit a prayer request?' },
];

export default function AskRuachWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAskPage = router.pathname === '/ask';

  useEffect(() => {
    const handler = () => setOpen(v => !v);
    window.addEventListener('toggleAskRuach', handler);
    return () => window.removeEventListener('toggleAskRuach', handler);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? inputValue).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    const assistantId = `msg_${Date.now()}_ai`;
    setMessages(prev => [...prev, userMsg, {
      id: assistantId, role: 'assistant', content: '', created_at: new Date().toISOString(),
    }]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          session_id: sessionId,
          conversation_history: messages,
        }),
      });

      // Errors come back as JSON; success is a text/event-stream of deltas.
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Something went wrong. Please try again.');
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        return;
      }

      const reader = res.body!.getReader();
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
            } else if (event.type === 'error') {
              setError(event.message);
            }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch {
      setError('Failed to send. Please check your connection.');
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  };

  if (isAskPage) return null;

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[55] lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Fixed stack: panel above button — button hidden on mobile */}
      <div
        className="fixed z-[60] flex flex-col items-end gap-3 bottom-24 right-4 sm:bottom-20 lg:bottom-8 lg:right-6"
      >

        {/* ── Chat Panel ─────────────────────────────────── */}
        {open && (
          <div
            className="flex flex-col overflow-hidden rounded-3xl"
            style={{
              width: 'min(380px, calc(100vw - 32px))',
              height: 'min(520px, calc(100svh - 200px))',
              background: 'rgba(8,10,14,0.97)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(191,10,48,0.12)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #BF0A30 0%, #7A0020 100%)' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm leading-none" style={{ ...H, fontWeight: 900 }}>Ask Ruach</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-white/35 tracking-wide">AI · Online now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {hasMessages && (
                  <button
                    onClick={() => { setMessages([]); setSessionId(null); setError(null); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors"
                    title="Clear chat"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white/35 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {!hasMessages && (
                <div className="pt-1">
                  <p
                    className="text-white/20 text-[9px] text-center tracking-widest mb-4"
                    style={H}
                  >
                    QUICK QUESTIONS
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s.text)}
                        className="flex flex-col items-start gap-2 p-3.5 rounded-2xl text-left transition-all active:scale-95 hover:scale-[1.02]"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <span className="text-xl leading-none">{s.icon}</span>
                        <span className="text-white/55 text-[11px] leading-snug">{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[88%] px-4 py-3 text-sm leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? {
                            background: '#BF0A30',
                            color: 'white',
                            borderRadius: '18px',
                            borderBottomRightRadius: '4px',
                          }
                        : {
                            background: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.80)',
                            borderRadius: '18px',
                            borderBottomLeftRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 flex items-center gap-2"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '18px',
                      borderBottomLeftRadius: '4px',
                    }}
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#BF0A30]" />
                    <span className="text-white/35 text-xs">Meditating...</span>
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(191,10,48,0.12)', border: '1px solid rgba(191,10,48,0.25)' }}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-[#F87171] flex-shrink-0 mt-0.5" />
                  <span className="text-[#F87171] text-xs leading-relaxed">{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-1.5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                  placeholder="Ask anything about our church..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm placeholder:text-white/20 py-2.5"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                  style={{
                    background: inputValue.trim() && !isLoading ? '#BF0A30' : 'rgba(255,255,255,0.06)',
                    color: inputValue.trim() && !isLoading ? 'white' : 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[9px] text-white/20 text-center mt-2.5 tracking-wide">
                AI assistant · Not a substitute for pastoral care
              </p>
            </div>
          </div>
        )}

        {/* ── Floating trigger button — desktop only ─────── */}
        <button
          onClick={() => setOpen(v => !v)}
          className="hidden sm:flex items-center gap-2.5 rounded-2xl transition-all active:scale-95 hover:scale-[1.03]"
          style={{
            background: open
              ? 'rgba(154,8,38,0.95)'
              : 'linear-gradient(135deg, #BF0A30 0%, #9A0826 100%)',
            padding: '11px 18px',
            boxShadow: open
              ? '0 4px 16px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(191,10,48,0.50), 0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {open
            ? <X className="w-4 h-4 text-white" />
            : <Sparkles className="w-4 h-4 text-white" />
          }
          <span
            className="text-white text-[11px] uppercase tracking-widest"
            style={H}
          >
            {open ? 'Close' : 'Ask Ruach'}
          </span>
        </button>

      </div>
    </>
  );
}
