'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { BottomNav } from '@/components/navigation/BottomNav';
import { cn } from '@/lib/utils';
import type { ChatMessage, Source } from '@/types';

/** Persist a completed session to Firestore via the /api/history endpoint */
async function saveSessionToFirestore(uid: string, sessionId: string, messages: ChatMessage[]) {
  try {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, sessionId, messages, type: 'chat' }),
    });
  } catch (e) {
    console.warn('History save failed:', e);
  }
}

const SUGGESTIONS = [
  'Compare candidates',
  'View attendance record',
  'Criminal cases',
  'What is Model Code of Conduct?',
];

function SourceChip({ source }: { source: Source }) {
  // Use Tailwind classes from Stitch
  const classNames: Record<string, string> = {
    eci: 'bg-source-eci/10 text-source-eci border-source-eci/20',
    prs: 'bg-source-prs/10 text-source-prs border-source-prs/20',
    myneta: 'bg-source-myneta/10 text-source-myneta border-source-myneta/20',
  };
  const bgTextClass = classNames[source.type] || 'bg-surface-variant text-text-secondary border-outline/20';

  let icon = 'info';
  if (source.type === 'eci') icon = 'check_circle';
  else if (source.type === 'prs') icon = 'school';

  return (
    <span className={cn('inline-flex items-center gap-xs px-3 py-1 rounded-full font-mono-sm border', bgTextClass)}>
      <span className="material-symbols-outlined text-[12px]">{icon}</span>
      {source.name}
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={cn('flex gap-md items-end max-w-[85%]', isUser ? 'self-end' : 'self-start')}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-election-amber flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <span className="material-symbols-outlined text-pure-white text-[16px]">smart_toy</span>
        </div>
      )}

      <div
        className={cn(
          'p-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] font-body-md whitespace-pre-wrap',
          isUser
            ? 'bg-primary-ink text-pure-white rounded-2xl rounded-tr-none'
            : 'bg-pure-white text-primary-ink border border-surface-variant rounded-2xl rounded-tl-none flex flex-col gap-md'
        )}
      >
        <p className="font-body-md">{message.content}</p>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-sm mt-sm">
            {message.sources.map((s, i) => (
              <SourceChip key={i} source={s} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StreamingIndicator() {
  return (
    <div className="flex gap-md items-end max-w-[85%] self-start">
      <div className="w-8 h-8 rounded-full bg-election-amber flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <span className="material-symbols-outlined text-pure-white text-[16px]">smart_toy</span>
      </div>
      <div className="bg-pure-white rounded-2xl rounded-tl-none p-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-surface-variant flex gap-1.5 items-center">
        <span className="w-2 h-2 rounded-full bg-election-amber animate-dot-1" />
        <span className="w-2 h-2 rounded-full bg-election-amber animate-dot-2" />
        <span className="w-2 h-2 rounded-full bg-election-amber animate-dot-3" />
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const { user } = useAppStore();

  const showSuggestions = messages.length === 0;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput('');
      setIsLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }),
        });

        if (!res.ok) throw new Error(res.statusText);

        const sourcesHeader = res.headers.get('X-Sources');
        let sources = [];
        if (sourcesHeader) {
          try {
            sources = JSON.parse(atob(sourcesHeader));
          } catch (e) {}
        }

        const aiMsgId = crypto.randomUUID();
        const initialAiMsg: ChatMessage = {
          id: aiMsgId,
          role: 'assistant',
          content: '',
          sources: sources,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, initialAiMsg]);
        setIsLoading(false);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        
        if (reader) {
          let done = false;
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            
            if (chunkValue) {
              setMessages((prev) => {
                return prev.map(msg => {
                  if (msg.id === aiMsgId) {
                    return { ...msg, content: msg.content + chunkValue };
                  }
                  return msg;
                });
              });
            }
          }
        }

        // Save to Firestore after AI finishes (fire & forget)
        if (user?.id) {
          setMessages(prev => {
            saveSessionToFirestore(user.id, sessionIdRef.current, prev);
            return prev;
          });
        }
      } catch (err) {
        console.error('Chat error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Sorry, I encountered an error connecting to the server. Please try again.',
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsLoading(false);
      }
    },
    [messages, user]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="bg-warm-cream text-primary-ink font-body-md antialiased min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-[#FFFDF5] dark:bg-stone-950 font-['Epilogue'] font-bold tracking-tight text-stone-900 dark:text-stone-50 border-b border-stone-200 dark:border-stone-800 fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16">
        <button
          onClick={() => window.history.back()}
          aria-label="Menu"
          className="hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors scale-95 active:duration-150 p-2 rounded-full -ml-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-black italic tracking-tighter text-stone-900 dark:text-stone-50">
          MataData
        </h1>
        <button
          aria-label="User profile"
          className="hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors scale-95 active:duration-150 w-8 h-8 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-text-muted mt-1">person</span>
        </button>
      </header>

      {/* Main Chat Canvas */}
      <main
        ref={scrollRef}
        className="flex-grow pt-[80px] pb-[160px] px-xl flex flex-col gap-2xl overflow-y-auto no-scrollbar scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex gap-md items-end max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-election-amber flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <span className="material-symbols-outlined text-pure-white text-[16px]">smart_toy</span>
            </div>
            <div className="bg-pure-white rounded-2xl rounded-tl-none p-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-surface-variant font-body-md text-primary-ink">
              Namaskar! I am your civic assistant. How can I help you understand your electoral rights or candidates today?
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <StreamingIndicator />}
      </main>

      {/* Chat Input & Suggested Actions */}
      <div className="fixed bottom-[64px] left-0 w-full bg-gradient-to-t from-warm-cream via-warm-cream to-transparent pt-4 pb-4 px-xl z-40">
        {/* Suggested Pills (Horizontal Scroll) */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              className="flex gap-md overflow-x-auto no-scrollbar mb-md pb-2 -mx-xl px-xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestion(suggestion)}
                  className="shrink-0 bg-pure-white border border-surface-variant hover:border-outline transition-colors px-4 py-2 rounded-full font-body-sm text-text-secondary shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="bg-deep-cream rounded-full h-14 flex items-center px-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant focus-within:border-election-amber focus-within:ring-2 focus-within:ring-election-amber/20 transition-all"
        >
          <button type="button" aria-label="Attach file" className="p-2 text-text-secondary hover:text-election-amber transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow bg-transparent border-none focus:ring-0 font-body-md text-primary-ink placeholder:text-text-muted px-2 outline-none"
            placeholder="Ask about candidates or rights..."
            type="text"
          />
          <button type="button" aria-label="Voice input" className="p-2 text-text-secondary hover:text-election-amber transition-colors">
            <span className="material-symbols-outlined">mic</span>
          </button>
          {input.trim() && (
            <button type="submit" aria-label="Send message" className="ml-1 w-10 h-10 rounded-full bg-primary-ink text-pure-white flex items-center justify-center hover:bg-surface-tint transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px] ml-1">send</span>
            </button>
          )}
        </form>
      </div>

      <BottomNav />
    </div>
  );
}


