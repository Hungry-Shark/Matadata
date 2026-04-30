'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ProfileDrawer } from '@/components/navigation/ProfileDrawer';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const CATEGORIES = ['All Rights', 'Registration', 'Polling Day', 'Disabilities', 'Grievances'];

const RIGHTS = [
  { id: '326', type: 'Constitutional Right', title: 'Right to Vote (Universal Adult Suffrage)', article: 'Article 326, Constitution of India', description: 'Article 326 of the Constitution of India provides that the elections to the House of the People and to the Legislative Assembly of every State shall be on the basis of adult suffrage. This means every citizen of India who is 18 years of age or older has the right to vote, irrespective of caste, religion, race, or gender.', note: 'Exceptions include non-residence, unsoundness of mind, or criminal disqualification.', icon: 'account_balance', category: 'Polling Day' },
  { id: '19', type: 'RPA 1950, Sec 19', title: 'Right to be Registered', article: 'Section 19, RP Act 1950', description: 'Every citizen who is 18 years old and is an ordinary resident of a constituency is entitled to be registered in the electoral roll.', note: 'Ensure you register via Form 6 before the cut-off dates.', icon: 'how_to_reg', category: 'Registration' },
  { id: 'SC', type: 'Supreme Court Ruling', title: 'Right to Know (Candidate Info)', article: 'SC Ruling 2003', description: 'Every voter has the right to know the criminal record, financial assets, and educational qualifications of all candidates contesting elections.', note: 'Information is made available via ECI affidavits.', icon: 'gavel', category: 'Polling Day' },
  { id: 'NOTA', type: 'EVM Feature', title: 'Right to NOTA', article: 'Supreme Court Ruling 2013', description: 'NOTA (None of the Above) allows you to reject all candidates. While NOTA votes don\'t affect election results, they are officially recorded.', note: 'A fundamental expression of dissent.', icon: 'block', category: 'Polling Day' },
];

export default function RightsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All Rights');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const filtered = activeCategory === 'All Rights' ? RIGHTS : RIGHTS.filter((r) => r.category === activeCategory);

  return (
    <div className="bg-warm-cream min-h-screen text-primary-ink font-body-md selection:bg-election-amber/30 pb-3xl">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#FFFDF5] border-b border-stone-200">
        <button onClick={() => window.history.back()} className="text-stone-900 hover:bg-stone-100 transition-colors rounded-full p-2 scale-95 active:duration-150">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="font-display-lg text-2xl font-black italic tracking-tighter text-stone-900">
          MataData
        </div>
        <button onClick={() => setProfileOpen(true)} className="text-stone-900 hover:bg-stone-100 transition-colors rounded-full p-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
        </button>
      </header>

      <main className="pt-24 px-4 pb-28 w-full flex flex-col gap-6 overflow-x-hidden">
        {/* Header & Search */}
        <section className="space-y-lg">
          <h1 className="font-display-lg text-display-lg text-primary-ink">Voter Rights</h1>
          <p className="font-body-lg text-body-lg text-text-secondary">Understand your constitutional rights and protections as an Indian voter.</p>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-muted">search</span>
            </div>
            <input 
              className="block w-full pl-12 pr-12 py-4 bg-deep-cream border-none rounded-full font-body-md text-primary-ink placeholder-text-muted focus:ring-2 focus:ring-election-amber shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-shadow" 
              placeholder="Search rights, articles, or topics..." 
              type="text"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button className="p-2 text-election-amber hover:text-amber-dark transition-colors rounded-full">
                <span className="material-symbols-outlined">mic</span>
              </button>
            </div>
          </div>
        </section>

        {/* Category Chips */}
        <section className="flex space-x-md overflow-x-auto pb-4 -mx-xl px-xl scrollbar-hide snap-x">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap px-lg py-sm rounded-full font-body-sm text-body-sm snap-start shrink-0 transition-colors",
                activeCategory === cat 
                  ? "bg-primary-ink text-pure-white" 
                  : "bg-pure-white text-primary-ink border border-surface-container-highest hover:bg-deep-cream"
              )}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Rights Accordions */}
        <section className="space-y-md pb-4xl">
          {filtered.map((right, i) => {
            const isExpanded = expandedId === right.id;
            return (
              <motion.div 
                key={right.id} 
                className={cn(
                  "bg-pure-white rounded-[24px] p-lg transition-colors overflow-hidden",
                  isExpanded 
                    ? "shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-surface-container-highest" 
                    : "shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-surface-container-lowest hover:border-surface-container-highest cursor-pointer"
                )}
                initial={{ opacity: 0, y: 16 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : right.id)}>
                  <div className="flex gap-lg">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                      isExpanded ? "bg-amber-soft" : "bg-surface-container-low"
                    )}>
                      {isExpanded && right.id.length <= 3 && !isNaN(Number(right.id)) ? (
                        <span className="font-display-md text-election-amber font-bold text-lg">{right.id}</span>
                      ) : (
                        <span className={cn("material-symbols-outlined", isExpanded ? "text-election-amber" : "text-text-secondary")}>
                          {right.icon}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-mono-sm text-mono-sm text-text-muted uppercase tracking-wider block mb-1">{right.type}</span>
                      <h3 className="font-display-md text-body-xl text-primary-ink">{right.title}</h3>
                    </div>
                  </div>
                  <motion.span 
                    className="material-symbols-outlined text-text-muted mt-2"
                    animate={{ rotate: isExpanded ? 180 : 0 }} 
                    transition={{ duration: 0.2 }}
                  >
                    expand_more
                  </motion.span>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      transition={{ duration: 0.3 }}
                      className="mt-lg pt-lg border-t border-surface-container-low space-y-lg overflow-hidden"
                    >
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        {right.description}
                      </p>
                      <div className="bg-deep-cream p-md rounded-lg flex items-start gap-md border border-surface-variant">
                        <span className="material-symbols-outlined text-election-amber mt-1">info</span>
                        <p className="font-body-sm text-body-sm text-text-secondary">{right.note}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push('/chat'); }}
                        className="w-full flex items-center justify-between px-lg py-4 bg-primary-ink text-pure-white rounded-full hover:bg-stone-800 transition-colors active:scale-95 group"
                      >
                        <span className="font-body-md text-body-md font-semibold">Ask AI to explain this</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </section>
      </main>

      <BottomNav />
      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
