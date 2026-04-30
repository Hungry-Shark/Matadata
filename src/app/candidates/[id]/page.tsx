'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

// ── Mock candidate data (replace with Firestore fetch) ──────────────────────
const CANDIDATES: Record<string, {
  id: string; name: string; party: string; partyColor: string; status: string;
  age: number; education: string; constituency: string; state: string;
  assets: string; liabilities: string; casesCount: number; cases: string[];
  attendancePct: number | null; billsIntroduced: number; questionsAsked: number;
  avatar: string; bio: string; sources: string[];
}> = {
  '1': {
    id: '1', name: 'Ramesh Kumar', party: 'BJP', partyColor: '#FF6600', status: 'Incumbent',
    age: 54, education: 'B.A.', constituency: 'Chandauli', state: 'Uttar Pradesh',
    assets: '₹12 Cr', liabilities: '₹1.2 Cr', casesCount: 2,
    cases: ['IPC 420 (Cheating) — pending since 2019', 'IPC 406 (Criminal breach of trust) — pending since 2021'],
    attendancePct: 89, billsIntroduced: 3, questionsAsked: 47,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACydp702QUVJ_sy2LBjqXvMRM7oBGoOPWu-d81uoRlcszE6OuWipXdd9LherEifHLLfVRNJ1Q51c8Nck9YHmzz38SYp11g5L1gL-6HfBrCJmWk1baokG8YO_qdzq79eLQim9EhSkMcPpeS_SlDjMYAmm02ec3fn2NoVUbeoYQ0qADxbHvRyCsmHj8l5BQy-TJlJuUqHMV2TO69HwrHtVn5aw2oYFFJo6PuMz9LRZ0Wo3BLCv6nk6lzOjQZfux-XBtnaMtsgjua9-zA',
    bio: 'Two-term Member of Parliament representing Chandauli constituency. Served on the Standing Committee on Agriculture.',
    sources: ['ECI Data', 'PRS Legislative', 'MyNeta'],
  },
  '2': {
    id: '2', name: 'Anita Singh', party: 'INC', partyColor: '#00ADEF', status: 'Challenger',
    age: 41, education: 'M.A. Political Science', constituency: 'Chandauli', state: 'Uttar Pradesh',
    assets: '₹4.5 Cr', liabilities: '₹0', casesCount: 0, cases: [],
    attendancePct: null, billsIntroduced: 0, questionsAsked: 0,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfzUks1_HhpQWe5LdzKzccXozZ9R_4Zi5SVOUyLs-VuhwygmP7uYRq6VwGYE2alleC1KgXiFb1MlZBlr95t0mentnLtT9ncST8Iv7qjd9C3zRgaBa-HZ-3KOP-nFsM5drDhT7bCkg-ccD7k4Jbr1nZJB0JW1Pnez-vLiimF9Z1bLy3_vi9LKy8nYot1OjsTIQJfpxjzUnN95FxQ_tHoUdMTwIa6u9Y71UocUy4jTvRfeNv1deQxmljVPhx6cypPiHl0_UgYUolpt0j',
    bio: 'First-time candidate and grassroots organiser. Former district-level panchayat official with a focus on women\'s rights.',
    sources: ['ECI Data', 'MyNeta'],
  },
};

const srcStyles: Record<string, string> = {
  'ECI Data': 'bg-[#1A6B3C]/10 text-[#1A6B3C] border-[#1A6B3C]/20',
  'PRS Legislative': 'bg-[#003B7A]/10 text-[#003B7A] border-[#003B7A]/20',
  'MyNeta': 'bg-[#7B2D8B]/10 text-[#7B2D8B] border-[#7B2D8B]/20',
};

// ── Mini chat bubble ──────────────────────────────────────────────────────────
function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-2 items-end', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-election-amber flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-pure-white text-[13px]">smart_toy</span>
        </div>
      )}
      <div className={cn(
        'px-3 py-2 rounded-xl text-[14px] leading-relaxed max-w-[80%]',
        isUser
          ? 'bg-primary-ink text-pure-white rounded-tr-none'
          : 'bg-pure-white text-primary-ink border border-surface-variant rounded-tl-none'
      )}>
        {msg.content}
      </div>
    </div>
  );
}

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const candidate = CANDIDATES[id];

  const [tab, setTab] = useState<'overview' | 'record' | 'chat'>('overview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-seed the chat with a context message
  useEffect(() => {
    if (!candidate) return;
    setChatMessages([{
      id: 'intro',
      role: 'assistant',
      content: `I have full data on ${candidate.name} (${candidate.party}). Ask me anything — their criminal cases, assets, attendance, or voting record.`,
      timestamp: new Date().toISOString(),
    }]);
  }, [candidate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const sendChat = useCallback(async (text: string) => {
    if (!text.trim() || chatLoading || !candidate) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    const contextPrefix = `Regarding candidate ${candidate.name} (${candidate.party}, ${candidate.constituency}, ${candidate.state}): assets ${candidate.assets}, ${candidate.casesCount} criminal cases, attendance ${candidate.attendancePct ?? 'N/A'}%. `;
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    const aiId = crypto.randomUUID();
    setChatMessages(prev => [...prev, { id: aiId, role: 'assistant', content: '', timestamp: new Date().toISOString() }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: contextPrefix + text.trim() }] }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: dr } = await reader.read();
          done = dr;
          if (value) {
            const chunk = decoder.decode(value);
            setChatMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: m.content + chunk } : m));
          }
        }
      }
    } catch {
      setChatMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: 'Error fetching response. Please try again.' } : m));
    } finally {
      setChatLoading(false);
    }
  }, [candidate, chatLoading]);

  if (!candidate) {
    return (
      <div className="min-h-screen bg-warm-cream flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-[64px] text-text-muted">person_off</span>
        <p className="text-text-secondary">Candidate not found.</p>
        <button onClick={() => router.push('/candidates')} className="px-6 py-2 bg-primary-ink text-pure-white rounded-full">Go back</button>
      </div>
    );
  }

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'record', label: 'Record' },
    { key: 'chat', label: 'Ask AI' },
  ] as const;

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col pb-8">
      {/* Header */}
      <header className="bg-pure-white border-b border-surface-variant sticky top-0 z-30 flex items-center gap-3 px-4 h-14">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <h1 className="font-bold text-[17px] text-primary-ink flex-1 truncate">{candidate.name}</h1>
        <span className="text-[13px] font-semibold px-3 py-1 rounded-full" style={{ background: `${candidate.partyColor}18`, color: candidate.partyColor }}>
          {candidate.party}
        </span>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-pure-white to-warm-cream px-4 pt-5 pb-4 flex items-start gap-4">
        <img src={candidate.avatar} alt={candidate.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-surface-variant shadow-md" />
        <div className="flex-1 min-w-0">
          <h2 className="text-[22px] font-bold text-primary-ink leading-tight">{candidate.name}</h2>
          <p className="text-[14px] text-text-secondary mt-0.5">{candidate.status} · {candidate.constituency}, {candidate.state}</p>
          <p className="text-[13px] text-text-muted mt-1">{candidate.education} · Age {candidate.age}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {candidate.sources.map(src => (
              <span key={src} className={cn('text-[10px] font-bold px-2.5 py-0.5 rounded-full border', srcStyles[src] || 'bg-surface-variant text-on-surface')}>
                {src}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex bg-pure-white border-b border-surface-variant sticky top-14 z-20">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 h-11 text-[14px] font-semibold transition-colors relative',
              tab === t.key ? 'text-election-amber' : 'text-text-secondary'
            )}
          >
            {t.label}
            {tab === t.key && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-election-amber rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {tab === 'overview' && (
            <div className="px-4 pt-5 flex flex-col gap-4">
              {/* Bio */}
              <div className="bg-pure-white rounded-2xl p-4 border border-surface-variant shadow-sm">
                <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">About</h3>
                <p className="text-[14px] text-primary-ink leading-relaxed">{candidate.bio}</p>
              </div>

              {/* Stats */}
              <div className="bg-pure-white rounded-2xl p-4 border border-surface-variant shadow-sm">
                <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3">Financial Disclosure</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Declared Assets', value: candidate.assets, icon: 'account_balance_wallet', color: '#1A6B3C' },
                    { label: 'Liabilities', value: candidate.liabilities, icon: 'trending_down', color: '#ba1a1a' },
                  ].map(s => (
                    <div key={s.label} className="bg-warm-cream rounded-xl p-3 flex flex-col gap-1">
                      <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>{s.icon}</span>
                      <span className="text-[18px] font-bold text-primary-ink">{s.value}</span>
                      <span className="text-[11px] text-text-muted">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Criminal Cases */}
              <div className="bg-pure-white rounded-2xl p-4 border border-surface-variant shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider">Criminal Cases</h3>
                  <span className={cn('text-[13px] font-bold px-2.5 py-1 rounded-full', candidate.casesCount > 0 ? 'bg-red-50 text-alert-red' : 'bg-green-50 text-success-green')}>
                    {candidate.casesCount} pending
                  </span>
                </div>
                {candidate.cases.length === 0 ? (
                  <p className="text-[14px] text-success-green flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">verified</span> Clean record — no pending cases
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {candidate.cases.map((c, i) => (
                      <li key={i} className="text-[13px] text-primary-ink bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {tab === 'record' && (
            <div className="px-4 pt-5 flex flex-col gap-4">
              <div className="bg-pure-white rounded-2xl p-4 border border-surface-variant shadow-sm">
                <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3">Parliamentary Performance</h3>
                {candidate.attendancePct === null ? (
                  <p className="text-[14px] text-text-muted italic">No parliamentary record — first-time candidate.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Attendance bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-text-secondary font-medium">Attendance</span>
                        <span className="font-bold text-primary-ink">{candidate.attendancePct}%</span>
                      </div>
                      <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-success-green rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.attendancePct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Bills Introduced', value: candidate.billsIntroduced, icon: 'description' },
                        { label: 'Questions Asked', value: candidate.questionsAsked, icon: 'help' },
                      ].map(s => (
                        <div key={s.label} className="bg-warm-cream rounded-xl p-3 flex flex-col gap-1">
                          <span className="material-symbols-outlined text-election-amber text-[20px]">{s.icon}</span>
                          <span className="text-[22px] font-bold text-primary-ink">{s.value}</span>
                          <span className="text-[11px] text-text-muted">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-amber-soft rounded-2xl p-4 border border-election-amber/20">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-election-amber text-[20px] mt-0.5">info</span>
                  <p className="text-[13px] text-[#524534] leading-relaxed">
                    Data sourced from PRS Legislative Research and ECI affidavits. All information is in the public domain as mandated by the Supreme Court (2003).
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'chat' && (
            <div className="flex flex-col flex-1 h-full">
              <div
                ref={scrollRef}
                className="flex-1 flex flex-col gap-3 px-4 pt-4 pb-4 overflow-y-auto min-h-[300px]"
                style={{ maxHeight: 'calc(100vh - 250px)' }}
              >
                {chatMessages.map(m => <ChatBubble key={m.id} msg={m} />)}
                {chatLoading && (
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-election-amber flex items-center justify-center">
                      <span className="material-symbols-outlined text-pure-white text-[13px]">smart_toy</span>
                    </div>
                    <div className="bg-pure-white rounded-xl rounded-tl-none p-3 border border-surface-variant flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-election-amber animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick questions */}
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {['How many cases?', 'What is their attendance?', 'Tell me about their assets'].map(q => (
                  <button
                    key={q}
                    onClick={() => sendChat(q)}
                    className="shrink-0 text-[12px] bg-pure-white border border-surface-variant text-text-secondary px-3 py-1.5 rounded-full hover:border-election-amber transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={e => { e.preventDefault(); sendChat(chatInput); }}
                className="mx-4 mb-4 flex items-center gap-2 bg-pure-white border border-surface-variant rounded-full px-3 h-12 shadow-sm focus-within:border-election-amber transition-colors"
              >
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about this candidate…"
                  className="flex-1 bg-transparent text-[14px] text-primary-ink placeholder:text-text-muted outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-8 h-8 rounded-full bg-election-amber text-pure-white flex items-center justify-center disabled:opacity-40 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
