'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useTranslations } from 'next-intl';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ProfileDrawer } from '@/components/navigation/ProfileDrawer';
import { daysUntil } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const ELECTION_DATE = '2026-06-15';

const FACT_SOURCES = ['ECI Handbook', 'Supreme Court 2013', 'SC Ruling 2003', 'ECI Guidelines', 'Election Commission'];

/**
 * Home Dashboard — Mobile-first command center.
 * Matches the Stitch design: amber hero header, election countdown,
 * 2-column quick actions grid, "Did You Know?" rotating fact card.
 */
export default function HomePage() {
  const router = useRouter();
  const t = useTranslations('home');
  const tf = useTranslations('facts');
  const [isMounted, setIsMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, constituency } = useAppStore();
  const [factIndex, setFactIndex] = useState(0);
  const daysLeft = daysUntil(ELECTION_DATE);

  useEffect(() => { setIsMounted(true); }, []);

  // Rotate facts every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % 5);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const factKey = `fact${factIndex + 1}` as 'fact1' | 'fact2' | 'fact3' | 'fact4' | 'fact5';

  if (!isMounted) {
    return (
      <div className="min-h-dvh bg-warm-cream flex flex-col">
        <div className="w-full h-[180px] bg-election-amber rounded-b-[32px]" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-warm-cream flex flex-col pb-[calc(72px+env(safe-area-inset-bottom,0px))]">

      {/* ── Amber Hero Header ── */}
      <header className="w-full bg-gradient-to-br from-[#F5A623] to-[#D4891A] text-pure-white rounded-b-[32px] pt-14 pb-8 px-6 relative overflow-hidden shadow-[0_8px_24px_rgba(245,166,35,0.3)]">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="font-display-md text-display-md text-pure-white leading-tight">
              {t('greeting', { name: user?.name?.split(' ')[0] || 'Voter' })}
            </h1>
            <div className="inline-flex items-center gap-1.5 bg-pure-white/20 backdrop-blur-md rounded-full px-3 py-1.5 w-max border border-pure-white/30">
              <span className="material-symbols-outlined text-[15px] text-pure-white" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              <span className="font-mono-sm text-[12px] text-pure-white">
                {constituency?.name || 'Robertsganj'}, {constituency?.state || 'UP'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setProfileOpen(true)}
            className="w-11 h-11 rounded-full bg-pure-white/25 border-2 border-pure-white/50 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-pure-white text-[22px]">person</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <main className="flex-1 flex flex-col gap-4 px-4 pt-5 w-full overflow-x-hidden">

        {/* Election Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="bg-pure-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-surface-variant flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 text-amber-soft opacity-40 pointer-events-none">
            <span className="material-symbols-outlined text-[110px]" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_vote</span>
          </div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <span className="font-body-sm text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
                {t('upcoming')}
              </span>
              <h2 className="font-body-lg text-[17px] font-bold text-primary-ink">
                {t('electionTitle')}
              </h2>
            </div>
            <div className="bg-amber-soft border border-election-amber/30 rounded-xl px-3 py-2.5 flex flex-col items-center justify-center min-w-[70px]">
              <span className="font-display-md text-[22px] font-black text-amber-dark leading-none">{daysLeft}</span>
              <span className="font-mono-sm text-[9px] text-primary-ink mt-0.5 tracking-wider">{t('daysLeft').toUpperCase()}</span>
            </div>
          </div>
          <div className="relative z-10 w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <motion.div className="bg-election-amber h-full rounded-full" initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }} />
          </div>
        </motion.div>

        {/* Quick Actions — 2×2 grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Ask AI */}
          <button onClick={() => router.push('/chat')} className="bg-pure-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-surface-variant flex flex-col items-start gap-3 active:scale-[0.97] transition-transform text-left">
            <div className="w-11 h-11 rounded-full bg-amber-soft text-amber-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
            </div>
            <div>
              <h3 className="font-body-md text-[15px] font-bold text-primary-ink">{t('askAi')}</h3>
              <p className="font-body-xs text-[12px] text-text-secondary mt-0.5">{t('askAiSub')}</p>
            </div>
          </button>

          {/* Voice Ask — dark card */}
          <button onClick={() => router.push('/voice')} className="bg-primary-ink rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.2)] border border-primary-ink flex flex-col items-start gap-3 active:scale-[0.97] transition-transform text-left relative overflow-hidden">
            <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-election-amber/20 rounded-full blur-xl pointer-events-none" />
            <div className="w-11 h-11 rounded-full bg-[#2f312e] text-pure-white flex items-center justify-center border border-[#e2e3de]/20">
              <span className="material-symbols-outlined text-[22px] text-election-amber">mic</span>
            </div>
            <div className="relative z-10">
              <h3 className="font-body-md text-[15px] font-bold text-pure-white">{t('voiceAsk')}</h3>
              <p className="font-body-xs text-[12px] text-[#c9c6c5] mt-0.5">{t('voiceAskSub')}</p>
            </div>
          </button>

          {/* My Rights */}
          <button onClick={() => router.push('/rights')} className="bg-pure-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-surface-variant flex flex-col items-start gap-3 active:scale-[0.97] transition-transform text-left">
            <div className="w-11 h-11 rounded-full bg-[#c4e7ff] text-[#004d6a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">gavel</span>
            </div>
            <div>
              <h3 className="font-body-md text-[15px] font-bold text-primary-ink">{t('myRights')}</h3>
              <p className="font-body-xs text-[12px] text-text-secondary mt-0.5">{t('myRightsSub')}</p>
            </div>
          </button>

          {/* Find Booth */}
          <button onClick={() => router.push('/booth')} className="bg-pure-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-surface-variant flex flex-col items-start gap-3 active:scale-[0.97] transition-transform text-left">
            <div className="w-11 h-11 rounded-full bg-[#e5e2e1] text-on-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">where_to_vote</span>
            </div>
            <div>
              <h3 className="font-body-md text-[15px] font-bold text-primary-ink">{t('findBooth')}</h3>
              <p className="font-body-xs text-[12px] text-text-secondary mt-0.5">{t('findBoothSub')}</p>
            </div>
          </button>
        </motion.div>

        {/* Did You Know card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
          className="bg-amber-soft rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-election-amber text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <h3 className="font-body-md text-[15px] font-bold text-primary-ink">{t('didYouKnow')}</h3>
            </div>
            <div className="bg-[#1A6B3C]/10 text-[#1A6B3C] border border-[#1A6B3C]/20 rounded-full px-2.5 py-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">verified</span>
              <span className="font-mono-sm text-[9px] uppercase font-bold tracking-wider">{FACT_SOURCES[factIndex]}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              className="font-body-sm text-[13px] text-[#524534] leading-relaxed"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {tf(factKey)}
            </motion.p>
          </AnimatePresence>

          <div className="absolute -right-3 -bottom-3 opacity-[0.04] pointer-events-none">
            <span className="material-symbols-outlined text-[90px]" style={{ fontVariationSettings: "'FILL' 1" }}>assured_workload</span>
          </div>
        </motion.div>

      </main>

      <BottomNav />
      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
