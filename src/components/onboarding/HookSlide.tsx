'use client';

import { motion } from 'framer-motion';
import { VotingHandIllustration } from './illustrations/VotingHand';

/**
 * Onboarding Step 1 — The Hook
 * Dark ink background, bold typography, voting hand illustration.
 * "Your Vote. Your Voice. Your Right."
 */
export function HookSlide() {
  return (
    <div className="flex-1 flex flex-col bg-ink min-h-dvh">
      {/* Illustration area — top 55% */}
      <div className="flex-[55] relative flex items-center justify-center overflow-hidden">
        {/* Amber radial glow */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 60%, rgba(245,166,35,0.15) 0%, transparent 60%)',
          }}
        />

        {/* Floating ballot icon — top right */}
        <motion.div
          className="absolute top-[15%] right-[15%] opacity-40"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="4" width="20" height="24" rx="2" stroke="#F5A623" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="22" y2="10" stroke="#F5A623" strokeWidth="1" opacity="0.5" />
            <line x1="10" y1="14" x2="22" y2="14" stroke="#F5A623" strokeWidth="1" opacity="0.5" />
            <line x1="10" y1="18" x2="18" y2="18" stroke="#F5A623" strokeWidth="1" opacity="0.5" />
            <circle cx="12" cy="22" r="1.5" fill="#F5A623" opacity="0.6" />
          </svg>
        </motion.div>

        {/* Floating EVM icon — bottom left */}
        <motion.div
          className="absolute bottom-[20%] left-[12%] opacity-30"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="8" y="6" width="20" height="26" rx="3" stroke="#F5A623" strokeWidth="1.5" />
            <rect x="12" y="10" width="4" height="3" rx="1" stroke="#F5A623" strokeWidth="1" />
            <rect x="20" y="10" width="4" height="3" rx="1" stroke="#F5A623" strokeWidth="1" />
            <rect x="12" y="16" width="4" height="3" rx="1" stroke="#F5A623" strokeWidth="1" />
            <rect x="20" y="16" width="4" height="3" rx="1" stroke="#F5A623" strokeWidth="1" />
            <rect x="14" y="24" width="8" height="4" rx="2" fill="#F5A623" opacity="0.3" />
          </svg>
        </motion.div>

        {/* Main illustration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.3 }}
        >
          <VotingHandIllustration />
        </motion.div>
      </div>

      {/* Content area — bottom 45% */}
      <div className="flex-[45] flex flex-col justify-start px-8 pt-4 pb-20">
        <motion.h1
          className="text-display-xl text-white leading-[1.05]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          Your Vote.
          <br />
          Your Voice.
          <br />
          Your Right.
        </motion.h1>

        <motion.p
          className="mt-3 text-[14px] font-body"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          India ka sabse smart election guide
        </motion.p>

        {/* Tag chips */}
        <motion.div
          className="mt-4 flex gap-2 flex-wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          {['🗳️ Voter Rights', '📋 Candidates', '🎤 Voice in Hindi'].map(
            (label) => (
              <span
                key={label}
                className="px-3 py-1.5 rounded-full text-mono-sm bg-amber-soft text-amber"
                style={{ fontSize: 11 }}
              >
                {label}
              </span>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
}
