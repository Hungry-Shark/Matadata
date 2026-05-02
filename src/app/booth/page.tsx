'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useTranslations } from 'next-intl';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ProfileDrawer } from '@/components/navigation/ProfileDrawer';

const SPRING = { type: 'spring' as const, stiffness: 380, damping: 32 };

export default function BoothPage() {
  const router = useRouter();
  const { constituency, pincode } = useAppStore();
  const t = useTranslations('booth');
  const [searchInput, setSearchInput] = useState(pincode || '');
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [result, setResult] = useState<null | {
    boothName: string; address: string; distance: string;
  }>(null);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    // Simulate fetch — replace with real Booth Locator API call
    setTimeout(() => {
      setResult({
        boothName: `Polling Booth ${searchInput.slice(-3)}`,
        address: `Government School, Ward ${searchInput.slice(-2)}, ${constituency?.name || 'Your Constituency'}`,
        distance: '0.8 km',
      });
      setLoading(false);
    }, 900);
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#FAFAF5' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-4 bg-[#FAFAF5] border-b border-[#e2e3de]">
        <button onClick={() => router.back()} className="p-2 rounded-full active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ color: '#0A0A0A' }}>arrow_back</span>
        </button>
        <h1 className="text-[20px] font-black italic tracking-tighter" style={{ color: '#0A0A0A', fontFamily: 'Epilogue, sans-serif' }}>
          {t('boothLocator')}
        </h1>
        <button onClick={() => setProfileOpen(true)} className="w-9 h-9 rounded-full bg-[#e8e8e4] flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-[20px]" style={{ color: '#524534' }}>person</span>
        </button>
      </header>

      <main className="flex-1 px-4 pt-24 pb-28 flex flex-col gap-5 w-full">
        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
          className="rounded-2xl p-5 flex flex-col gap-2"
          style={{ background: '#F5A623', boxShadow: '0 4px 20px rgba(245,166,35,0.25)' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px]" style={{ color: '#0A0A0A', fontVariationSettings: "'FILL' 1" }}>where_to_vote</span>
            <h2 style={{ fontFamily: 'Epilogue, sans-serif', fontSize: '20px', fontWeight: 800, color: '#0A0A0A' }}>{t('title')}</h2>
          </div>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px', color: 'rgba(10,10,10,0.7)' }}>
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Search card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.06 }}
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: '#FFFFFF', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #e2e3de' }}>

          {/* Pincode input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9E9E9E', fontSize: '20px' }}>search</span>
            <input type="text" inputMode="numeric" maxLength={6} placeholder={t('pincodeLabel')}
              value={searchInput} onChange={e => setSearchInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full h-14 rounded-xl pl-12 pr-4 focus:outline-none transition-shadow focus:ring-2"
              style={{ background: '#F0EBE0', border: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', letterSpacing: '0.2em', color: '#0A0A0A' }} />
          </div>

          <div className="flex gap-3">
            <motion.button onClick={handleSearch} disabled={loading} whileTap={{ scale: 0.96 }} transition={SPRING}
              className="flex-1 h-12 rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: '#0A0A0A', color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans', fontSize: '15px', fontWeight: 600 }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span className="material-symbols-outlined text-[18px]">search</span> {t('searchBtn')}</>}
            </motion.button>

            <motion.button
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(pos => {
                  console.log(pos.coords);
                  handleSearch();
                });
              }}
              whileTap={{ scale: 0.96 }} transition={SPRING}
              className="h-12 px-4 rounded-full flex items-center justify-center gap-2"
              style={{ border: '2px solid #e2e3de', background: '#FFFFFF', color: '#0A0A0A', fontFamily: 'Plus Jakarta Sans', fontSize: '15px', fontWeight: 600 }}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Result card */}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: '#FFFFFF', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #e2e3de' }}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#e5f8ee' }}>
                <span className="material-symbols-outlined" style={{ color: '#2D9F5C', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 style={{ fontFamily: 'Epilogue', fontSize: '17px', fontWeight: 700, color: '#0A0A0A' }}>{result.boothName}</h3>
                <p style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '13px', color: '#5C5C5C' }}>{result.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#F0EBE0' }}>
              <span className="material-symbols-outlined text-[18px]" style={{ color: '#F5A623', fontVariationSettings: "'FILL' 1" }}>directions_walk</span>
              <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '14px', fontWeight: 600, color: '#0A0A0A' }}>{t('fromLocation', { distance: result.distance })}</span>
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.address)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full h-12 rounded-full flex items-center justify-center gap-2"
              style={{ background: '#F5A623', color: '#0A0A0A', fontFamily: 'Plus Jakarta Sans', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 12px rgba(245,166,35,0.3)', textDecoration: 'none' }}>
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              {t('openMaps')}
            </a>
          </motion.div>
        )}

        {/* Info note */}
        {!result && (
          <p className="text-center text-[13px]" style={{ color: '#9E9E9E', fontFamily: 'Plus Jakarta Sans' }}>
            {t('boothData')}
          </p>
        )}
      </main>

      <BottomNav />
      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
