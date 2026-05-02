'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ProfileDrawer } from '@/components/navigation/ProfileDrawer';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import { useTranslations } from 'next-intl';

interface Candidate {
  id: string;
  name: string;
  party: string;
  constituency: string;
  state: string;
  isWinner: boolean;
  totalAssets?: string;
  criminalCases?: number;
  seriousCases?: number;
  attendance?: string;
  education?: string;
  age?: string;
  profession?: string;
  mynetaUrl?: string;
  prsUrl?: string;
}

const PARTY_COLORS: Record<string, string> = {
  BJP: 'bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20',
  INC: 'bg-[#19AAED]/10 text-[#19AAED] border-[#19AAED]/20',
  SP: 'bg-[#E82029]/10 text-[#E82029] border-[#E82029]/20',
  AAP: 'bg-[#0077B6]/10 text-[#0077B6] border-[#0077B6]/20',
  BSP: 'bg-[#22409A]/10 text-[#22409A] border-[#22409A]/20',
  TMC: 'bg-[#20C646]/10 text-[#20C646] border-[#20C646]/20',
  DMK: 'bg-[#E72D36]/10 text-[#E72D36] border-[#E72D36]/20',
  NCP: 'bg-[#004B87]/10 text-[#004B87] border-[#004B87]/20',
  IND: 'bg-gray-100 text-gray-600 border-gray-200',
};

const srcStyles: Record<string, string> = {
  'myneta': 'bg-source-myneta/10 text-source-myneta border-source-myneta/20',
  'prs': 'bg-source-prs/10 text-source-prs border-source-prs/20',
  'eci': 'bg-source-eci/10 text-source-eci border-source-eci/20',
};

export default function CandidatesPage() {
  const router = useRouter();
  const t = useTranslations('candidates');
  const { constituency } = useAppStore();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [filter, setFilter] = useState('All');
  const [profileOpen, setProfileOpen] = useState(false);
  const [parties, setParties] = useState<string[]>(['All']);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCandidates() {
      setLoading(true);
      try {
        // Step 1: Try to fetch from Firestore cache via existing API
        const params = new URLSearchParams();
        if (constituency?.name) {
          params.set('constituency', constituency.name.toUpperCase());
        }
        params.set('limit', '50');

        const res = await fetch(`/api/candidates?${params.toString()}`);
        const data = await res.json();

        if (data.candidates && data.candidates.length > 0) {
          setCandidates(data.candidates);
          const uniqueParties = ['All', ...new Set(data.candidates.map((c: Candidate) => c.party))] as string[];
          setParties(uniqueParties);
          setLoading(false);
          return;
        }

        // Step 2: Cache miss → trigger on-demand scraping
        if (constituency?.name) {
          setScraping(true);
          setLoading(false);
          
          const lookupParams = new URLSearchParams();
          lookupParams.set('district', constituency.name.toLowerCase());
          if (constituency.state) lookupParams.set('state', constituency.state);

          const lookupRes = await fetch(`/api/candidates/lookup?${lookupParams.toString()}`);
          const lookupData = await lookupRes.json();

          if (lookupData.candidates && lookupData.candidates.length > 0) {
            setCandidates(lookupData.candidates);
            const uniqueParties = ['All', ...new Set(lookupData.candidates.map((c: Candidate) => c.party))] as string[];
            setParties(uniqueParties);
          }
          setScraping(false);
          return;
        }

        // Step 3: No constituency set — fetch whatever is in DB
        const allRes = await fetch('/api/candidates?limit=50');
        const allData = await allRes.json();
        if (allData.candidates && allData.candidates.length > 0) {
          setCandidates(allData.candidates);
          const uniqueParties = ['All', ...new Set(allData.candidates.map((c: Candidate) => c.party))] as string[];
          setParties(uniqueParties);
        }
      } catch (err) {
        console.warn('Could not fetch candidates:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidates();
  }, [constituency]);

  const filtered = filter === 'All' ? candidates : candidates.filter(c => c.party === filter);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-xl h-16 bg-[#FFFDF5]/95 backdrop-blur-lg border-b border-surface-variant">
        <div className="flex items-center gap-md">
          <button onClick={() => window.history.back()} className="text-on-surface hover:bg-surface-container transition-colors p-sm rounded-full">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-display-md text-display-md font-black italic tracking-tighter text-on-surface">MataData</h1>
        </div>
        <button onClick={() => setProfileOpen(true)} className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant hover:bg-surface-container transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface">person</span>
        </button>
      </header>

      <main className="pt-[88px] px-4 pb-28 flex flex-col gap-6 w-full overflow-x-hidden">
        <section className="flex flex-col gap-sm">
          <h2 className="font-display-lg text-display-lg text-primary-ink">
            {t('title')}
          </h2>
          <p className="font-body-lg text-body-lg text-text-secondary">
            {constituency?.name 
              ? t('subtitle_with_location', { location: `${constituency.name}, ${constituency.state}` })
              : t('subtitle')}
          </p>
        </section>

        {/* Data Source Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#E8F5E9] rounded-xl border border-[#A5D6A7]">
          <span className="material-symbols-outlined text-success-green text-[16px]">verified</span>
          <span className="text-[12px] text-primary-ink font-medium">
            {t('source_badge')}
          </span>
        </div>

        {/* Filter Chips */}
        {parties.length > 1 && (
          <section className="w-full -mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 w-max pb-2 px-4">
              {parties.map((p) => (
                <button 
                  key={p} 
                  onClick={() => setFilter(p)}
                  className={cn(
                    "px-lg py-sm rounded-full font-body-sm text-body-sm whitespace-nowrap transition-colors",
                    filter === p 
                      ? "bg-primary-ink text-pure-white font-semibold" 
                      : "bg-deep-cream text-on-surface border border-outline-variant hover:bg-surface-container"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-election-amber/30 border-t-election-amber rounded-full animate-spin" />
            <p className="text-[14px] text-text-secondary font-medium">{t('loading')}</p>
          </div>
        )}

        {/* Scraping State (on-demand) */}
        {scraping && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4 bg-pure-white rounded-3xl border border-surface-variant shadow-sm p-6"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-election-amber/20 border-t-election-amber rounded-full animate-spin" />
              <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-election-amber text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                search
              </span>
            </div>
            <div className="text-center">
              <p className="text-[16px] text-primary-ink font-bold">{t('scraping_title')}</p>
              <p className="text-[13px] text-text-secondary mt-1 max-w-[280px]">
                {t('scraping_subtitle', { location: constituency?.name || 'your area' })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-soft rounded-full">
              <span className="material-symbols-outlined text-[14px] text-amber-dark">schedule</span>
              <span className="text-[11px] text-amber-dark font-semibold">{t('scraping_time')}</span>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !scraping && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="material-symbols-outlined text-[48px] text-text-muted">how_to_reg</span>
            <p className="text-[16px] text-primary-ink font-semibold">{t('empty_title')}</p>
            <p className="text-[13px] text-text-secondary max-w-[280px]">
              {t('empty_subtitle')}
            </p>
          </div>
        )}

        {/* Candidate Cards */}
        {!loading && !scraping && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            {filtered.map((c, i) => (
              <motion.article 
                key={c.id} 
                className="bg-pure-white rounded-[24px] p-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col gap-lg border border-surface-container-high relative overflow-hidden"
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                {/* Winner Badge */}
                {c.isWinner && (
                  <div className="absolute top-3 right-3 bg-[#E8F5E9] text-success-green text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                    {t('winner')}
                  </div>
                )}

                <div className="flex items-start gap-md">
                  {/* Avatar with party initial */}
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-black shrink-0 border",
                    PARTY_COLORS[c.party] || PARTY_COLORS['IND']
                  )}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="font-display-md text-body-xl font-bold text-primary-ink leading-tight truncate">{c.name}</h3>
                    <p className="font-body-md text-body-md text-text-secondary">{c.party} • {c.constituency}</p>
                    {c.education && (
                      <p className="font-body-sm text-body-sm text-text-muted truncate">{c.education}</p>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-sm bg-warm-cream rounded-xl p-md border border-surface-container-low">
                  <div className="flex flex-col items-center text-center">
                    <span className="font-mono-sm text-mono-sm text-text-muted mb-1">{t('assets')}</span>
                    <span className="font-body-md text-body-md font-semibold text-primary-ink text-[13px]">
                      {c.totalAssets || 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center border-x border-surface-variant">
                    <span className="font-mono-sm text-mono-sm text-text-muted mb-1">{t('cases')}</span>
                    <span className={cn(
                      "font-body-md text-body-md font-semibold",
                      (c.criminalCases || 0) > 0 ? "text-alert-red" : "text-success-green"
                    )}>
                      {c.criminalCases ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="font-mono-sm text-mono-sm text-text-muted mb-1">{t('attendance_label')}</span>
                    <span className={cn(
                      "font-body-md text-body-md font-semibold",
                      c.attendance ? "text-success-green" : "text-text-muted"
                    )}>
                      {c.attendance || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === c.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3 py-2">
                        {c.age && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{t('age')}</span>
                            <span className="text-[14px] text-primary-ink font-semibold">{c.age}</span>
                          </div>
                        )}
                        {c.profession && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{t('profession')}</span>
                            <span className="text-[14px] text-primary-ink font-semibold">{c.profession}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Source Citations */}
                <div className="flex flex-wrap gap-sm">
                  {c.mynetaUrl && (
                    <a href={c.mynetaUrl} target="_blank" rel="noopener noreferrer"
                      className={cn("font-mono-sm text-mono-sm px-md py-xs rounded-full border", srcStyles['myneta'])}>
                      MyNeta ↗
                    </a>
                  )}
                  {c.prsUrl && (
                    <a href={c.prsUrl} target="_blank" rel="noopener noreferrer"
                      className={cn("font-mono-sm text-mono-sm px-md py-xs rounded-full border", srcStyles['prs'])}>
                      PRS ↗
                    </a>
                  )}
                  <button
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className="font-mono-sm text-mono-sm px-md py-xs rounded-full border border-surface-variant text-text-secondary hover:bg-surface-container transition-colors"
                  >
                    {expandedId === c.id ? t('less') : t('more')}
                  </button>
                </div>

                <button 
                  onClick={() => router.push(`/chat?q=Tell me about ${encodeURIComponent(c.name)} from ${encodeURIComponent(c.constituency)}`)} 
                  className="mt-auto w-full py-md px-lg bg-amber-soft text-amber-dark font-body-md text-body-md font-bold rounded-full flex items-center justify-center gap-sm hover:bg-election-amber/20 transition-colors active:scale-[0.98]"
                >
                  {t('ask_ai')}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </motion.article>
            ))}
          </section>
        )}
      </main>
      
      <BottomNav />
      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
