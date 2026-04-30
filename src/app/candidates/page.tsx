'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ProfileDrawer } from '@/components/navigation/ProfileDrawer';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const PARTIES = ['All', 'BJP', 'INC', 'SP', 'AAP', 'IND'] as const;

const DEMO_CANDIDATES = [
  { 
    id: '1', 
    name: 'Ramesh Kumar', 
    party: 'BJP', 
    status: 'Incumbent', 
    assets: '₹12 Cr', 
    casesCount: 2, 
    attendancePct: 89, 
    sources: ['ECI Data', 'PRS Legislative'],
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACydp702QUVJ_sy2LBjqXvMRM7oBGoOPWu-d81uoRlcszE6OuWipXdd9LherEifHLLfVRNJ1Q51c8Nck9YHmzz38SYp11g5L1gL-6HfBrCJmWk1baokG8YO_qdzq79eLQim9EhSkMcPpeS_SlDjMYAmm02ec3fn2NoVUbeoYQ0qADxbHvRyCsmHj8l5BQy-TJlJuUqHMV2TO69HwrHtVn5aw2oYFFJo6PuMz9LRZ0Wo3BLCv6nk6lzOjQZfux-XBtnaMtsgjua9-zA',
    accentColor: 'bg-election-amber'
  },
  { 
    id: '2', 
    name: 'Anita Singh', 
    party: 'INC', 
    status: 'Challenger', 
    assets: '₹4.5 Cr', 
    casesCount: 0, 
    attendancePct: null, 
    sources: ['ECI Data', 'MyNeta'],
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfzUks1_HhpQWe5LdzKzccXozZ9R_4Zi5SVOUyLs-VuhwygmP7uYRq6VwGYE2alleC1KgXiFb1MlZBlr95t0mentnLtT9ncST8Iv7qjd9C3zRgaBa-HZ-3KOP-nFsM5drDhT7bCkg-ccD7k4Jbr1nZJB0JW1Pnez-vLiimF9Z1bLy3_vi9LKy8nYot1OjsTIQJfpxjzUnN95FxQ_tHoUdMTwIa6u9Y71UocUy4jTvRfeNv1deQxmljVPhx6cypPiHl0_UgYUolpt0j',
    accentColor: 'bg-tertiary-container'
  },
];

const srcStyles: Record<string, string> = {
  'ECI Data': 'bg-source-eci/10 text-source-eci border-source-eci/20',
  'PRS Legislative': 'bg-source-prs/10 text-source-prs border-source-prs/20',
  'MyNeta': 'bg-source-myneta/10 text-source-myneta border-source-myneta/20',
};

export default function CandidatesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<typeof PARTIES[number]>('All');
  const [profileOpen, setProfileOpen] = useState(false);
  
  const list = filter === 'All' ? DEMO_CANDIDATES : DEMO_CANDIDATES.filter((c) => c.party === filter);

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-xl h-16 bg-[#FFFDF5] border-b border-surface-variant">
        <div className="flex items-center gap-md">
          <button onClick={() => window.history.back()} className="text-on-surface hover:bg-surface-container transition-colors p-sm rounded-full scale-95 active:duration-150">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-display-md text-display-md font-black italic tracking-tighter text-on-surface">MataData</h1>
        </div>
        <button onClick={() => setProfileOpen(true)} className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant hover:bg-surface-container transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface">person</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-[88px] px-4 pb-28 flex flex-col gap-6 w-full overflow-x-hidden">
        {/* Header Section */}
        <section className="flex flex-col gap-sm">
          <h2 className="font-display-lg text-display-lg text-primary-ink">Candidates</h2>
          <p className="font-body-lg text-body-lg text-text-secondary">Explore verified profiles and data for your constituency.</p>
        </section>

        {/* Filter Row */}
        <section className="w-full -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 w-max pb-2 px-4">
            {PARTIES.map((p) => (
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

        {/* Candidate Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          {list.map((c, i) => (
            <motion.article 
              key={c.id} 
              className="bg-pure-white rounded-[24px] p-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col gap-lg border border-surface-container-high relative overflow-hidden"
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-10 rounded-bl-full pointer-events-none", c.accentColor)}></div>
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-md">
                  <img alt={c.name} src={c.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-surface-variant bg-surface-container-high" />
                  <div>
                    <h3 className="font-display-md text-body-xl font-bold text-primary-ink">{c.name}</h3>
                    <p className="font-body-md text-body-md text-text-secondary">{c.party} • {c.status}</p>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-sm bg-warm-cream rounded-xl p-md border border-surface-container-low">
                <div className="flex flex-col items-center text-center">
                  <span className="font-mono-sm text-mono-sm text-text-muted mb-1">Assets</span>
                  <span className="font-body-md text-body-md font-semibold text-primary-ink">{c.assets}</span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-surface-variant">
                  <span className="font-mono-sm text-mono-sm text-text-muted mb-1">Cases</span>
                  <span className={cn("font-body-md text-body-md font-semibold", c.casesCount > 0 ? "text-alert-red" : "text-primary-ink")}>{c.casesCount}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="font-mono-sm text-mono-sm text-text-muted mb-1">Attendance</span>
                  <span className={cn("font-body-md text-body-md font-semibold", c.attendancePct ? "text-success-green" : "text-text-muted")}>
                    {c.attendancePct ? `${c.attendancePct}%` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Citations */}
              <div className="flex flex-wrap gap-sm">
                {c.sources.map(src => (
                  <span key={src} className={cn("font-mono-sm text-mono-sm px-md py-xs rounded-full border", srcStyles[src] || "bg-surface-variant text-on-surface")}>
                    {src}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => router.push(`/candidates/${c.id}`)} 
                className="mt-auto w-full py-md px-lg bg-amber-soft text-amber-dark font-body-md text-body-md font-bold rounded-full flex items-center justify-center gap-sm hover:bg-election-amber/20 transition-colors"
              >
                Ask AI about this candidate
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </motion.article>
          ))}
        </section>
      </main>
      
      <BottomNav />
      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
