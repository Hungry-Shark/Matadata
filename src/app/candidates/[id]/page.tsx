'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types';

// ── Source citation styles ──────────────────────────────────────────
const srcStyles: Record<string, string> = {
  'myneta': 'bg-[#7B2D8B]/10 text-[#7B2D8B] border-[#7B2D8B]/20',
  'prs': 'bg-[#003B7A]/10 text-[#003B7A] border-[#003B7A]/20',
  'eci': 'bg-[#1A6B3C]/10 text-[#1A6B3C] border-[#1A6B3C]/20',
};

const PARTY_COLORS: Record<string, string> = {
  BJP: '#FF9933',
  INC: '#19AAED',
  SP: '#E82029',
  AAP: '#0077B6',
  BSP: '#22409A',
  TMC: '#20C646',
  DMK: '#E72D36',
  NCP: '#004B87',
  IND: '#666666',
};

// ── Types ──────────────────────────────────────────────────────────
interface CandidateDetail {
  id: string;
  name: string;
  party: string;
  constituency: string;
  state: string;
  isWinner: boolean;
  age?: string;
  education?: string;
  profession?: string;
  totalAssets?: string;
  totalLiabilities?: string;
  criminalCases?: number;
  seriousCases?: number;
  caseDetails?: string;
  selfProfession?: string;
  spouseProfession?: string;
  mynetaUrl?: string;
  prsUrl?: string;
  attendance?: string;
  questionsAsked?: number;
  debatesParticipated?: number;
  privateBills?: number;
}

// ── Mini chat bubble ──────────────────────────────────────────────
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

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'record' | 'chat'>('overview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch candidate data from API
  useEffect(() => {
    async function fetchCandidate() {
      setLoading(true);
      try {
        const res = await fetch(`/api/candidates?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.candidate) {
          setCandidate(data.candidate);
        }
      } catch (err) {
        console.warn('Could not fetch candidate:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCandidate();
  }, [id]);

  // Pre-seed the chat with a context message
  useEffect(() => {
    if (!candidate) return;
    setChatMessages([{
      id: 'intro',
      role: 'assistant',
      content: `I have verified data on ${candidate.name} (${candidate.party}, ${candidate.constituency}). Ask me anything — their criminal cases, assets, attendance, or voting record. All data is from official ECI affidavits.`,
      timestamp: new Date().toISOString(),
    }]);
  }, [candidate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const sendChat = useCallback(async (text: string) => {
    if (!text.trim() || chatLoading || !candidate) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    const contextPrefix = `Regarding candidate ${candidate.name} (${candidate.party}, ${candidate.constituency}, ${candidate.state}): assets ${candidate.totalAssets || 'N/A'}, ${candidate.criminalCases || 0} criminal cases, attendance ${candidate.attendance || 'N/A'}. `;
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-election-amber/30 border-t-election-amber rounded-full animate-spin" />
        <p className="text-[14px] text-text-secondary">Loading candidate profile…</p>
      </div>
    );
  }

  // Not found state
  if (!candidate) {
    return (
      <div className="min-h-screen bg-warm-cream flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-[64px] text-text-muted">person_off</span>
        <p className="text-text-secondary">Candidate not found.</p>
        <button onClick={() => router.push('/candidates')} className="px-6 py-2 bg-primary-ink text-pure-white rounded-full">Go back</button>
      </div>
    );
  }

  const partyColor = PARTY_COLORS[candidate.party] || PARTY_COLORS['IND'];
  const attendancePct = candidate.attendance ? parseInt(candidate.attendance) : null;

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
        <span className="text-[13px] font-semibold px-3 py-1 rounded-full" style={{ background: `${partyColor}18`, color: partyColor }}>
          {candidate.party}
        </span>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-pure-white to-warm-cream px-4 pt-5 pb-4 flex items-start gap-4">
        {/* Party-colored avatar */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-[28px] font-black border-2 shadow-md shrink-0"
          style={{ background: `${partyColor}15`, color: partyColor, borderColor: `${partyColor}30` }}>
          {candidate.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-bold text-primary-ink leading-tight">{candidate.name}</h2>
            {candidate.isWinner && (
              <span className="material-symbols-outlined text-success-green text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            )}
          </div>
          <p className="text-[14px] text-text-secondary mt-0.5">
            {candidate.isWinner ? 'Winner' : 'Candidate'} · {candidate.constituency}, {candidate.state}
          </p>
          {candidate.education && <p className="text-[13px] text-text-muted mt-1">{candidate.education}{candidate.age ? ` · Age ${candidate.age}` : ''}</p>}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {candidate.mynetaUrl && (
              <a href={candidate.mynetaUrl} target="_blank" rel="noopener noreferrer"
                className={cn('text-[10px] font-bold px-2.5 py-0.5 rounded-full border', srcStyles['myneta'])}>
                MyNeta ↗
              </a>
            )}
            {candidate.prsUrl && (
              <a href={candidate.prsUrl} target="_blank" rel="noopener noreferrer"
                className={cn('text-[10px] font-bold px-2.5 py-0.5 rounded-full border', srcStyles['prs'])}>
                PRS ↗
              </a>
            )}
            <span className={cn('text-[10px] font-bold px-2.5 py-0.5 rounded-full border', srcStyles['eci'])}>
              ECI Affidavit
            </span>
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
              {/* Profession/Bio */}
              <div className="bg-pure-white rounded-2xl p-4 border border-surface-variant shadow-sm">
                <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-2">About</h3>
                <div className="flex flex-col gap-1.5">
                  {candidate.selfProfession && (
                    <p className="text-[14px] text-primary-ink leading-relaxed">
                      <span className="text-text-muted font-medium">Profession: </span>{candidate.selfProfession}
                    </p>
                  )}
                  {candidate.spouseProfession && (
                    <p className="text-[14px] text-primary-ink leading-relaxed">
                      <span className="text-text-muted font-medium">Spouse: </span>{candidate.spouseProfession}
                    </p>
                  )}
                  {!candidate.selfProfession && !candidate.spouseProfession && (
                    <p className="text-[14px] text-text-muted italic">No additional profile details available.</p>
                  )}
                </div>
              </div>

              {/* Financial Disclosure */}
              <div className="bg-pure-white rounded-2xl p-4 border border-surface-variant shadow-sm">
                <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3">Financial Disclosure</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Declared Assets', value: candidate.totalAssets || 'N/A', icon: 'account_balance_wallet', color: '#1A6B3C' },
                    { label: 'Liabilities', value: candidate.totalLiabilities || 'N/A', icon: 'trending_down', color: '#ba1a1a' },
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
                  <span className={cn('text-[13px] font-bold px-2.5 py-1 rounded-full',
                    (candidate.criminalCases || 0) > 0 ? 'bg-red-50 text-alert-red' : 'bg-green-50 text-success-green'
                  )}>
                    {candidate.criminalCases || 0} pending
                    {candidate.seriousCases ? ` (${candidate.seriousCases} serious)` : ''}
                  </span>
                </div>
                {(candidate.criminalCases || 0) === 0 ? (
                  <p className="text-[14px] text-success-green flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">verified</span> Clean record — no pending cases
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {candidate.caseDetails ? (
                      <p className="text-[13px] text-primary-ink bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                        {candidate.caseDetails}
                      </p>
                    ) : (
                      <p className="text-[13px] text-alert-red italic">Case details are pending extraction from affidavit.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'record' && (
            <div className="px-4 pt-5 flex flex-col gap-4">
              <div className="bg-pure-white rounded-2xl p-4 border border-surface-variant shadow-sm">
                <h3 className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-3">Parliamentary Performance</h3>
                {attendancePct === null ? (
                  <p className="text-[14px] text-text-muted italic">
                    {candidate.isWinner ? 'Performance data is being collected from PRS Legislative Research.' : 'No parliamentary record — first-time candidate or no data available.'}
                  </p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Attendance bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-text-secondary font-medium">Attendance</span>
                        <span className="font-bold text-primary-ink">{candidate.attendance}</span>
                      </div>
                      <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-success-green rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${attendancePct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Questions', value: candidate.questionsAsked || 0, icon: 'help' },
                        { label: 'Debates', value: candidate.debatesParticipated || 0, icon: 'forum' },
                        { label: 'Bills', value: candidate.privateBills || 0, icon: 'description' },
                      ].map(s => (
                        <div key={s.label} className="bg-warm-cream rounded-xl p-3 flex flex-col gap-1 items-center">
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
                    Data sourced from PRS Legislative Research and ECI affidavits via MyNeta.info (ADR). All information is in the public domain as mandated by the Supreme Court of India (2003 judgment).
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
                {['How many cases?', 'What is their attendance?', 'Tell me about their assets', 'Compare with other candidates'].map(q => (
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
