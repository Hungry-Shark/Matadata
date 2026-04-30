'use client';

import { motion } from 'framer-motion';
import { WalkingVoterIllustration } from './illustrations/WalkingVoter';

const features = [
  'Criminal cases & assets from ECI affidavits',
  'Attendance & voting record from PRS India',
  'Your rights under the Constitution of India',
  'Election timelines & booth locator',
];

/**
 * Onboarding Step 2 — Feature Showcase
 * Cream background, confident voter walking with phone.
 * "Know before you vote." with feature bullet list.
 */
export function FeatureSlide() {
  return (
    <div className="flex-1 flex flex-col bg-cream min-h-dvh">
      {/* Illustration area — top 52% */}
      <div className="flex-[52] relative flex items-center justify-center overflow-hidden">
        {/* Amber blob behind character */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(245,166,35,0.12)',
            filter: 'blur(30px)',
          }}
        />

        {/* Floating icons */}
        <motion.div
          className="absolute top-[18%] right-[18%] opacity-60"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4L17 10L24 11L19 16L20 23L14 20L8 23L9 16L4 11L11 10Z" stroke="#F5A623" strokeWidth="1.5" fill="none" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-[25%] left-[15%] opacity-50"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#F5A623" strokeWidth="1.5" />
            <path d="M8 12L11 15L16 9" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-[30%] left-[20%] opacity-40"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="4" y="2" width="14" height="18" rx="2" stroke="#F5A623" strokeWidth="1.5" />
            <line x1="7" y1="7" x2="15" y2="7" stroke="#F5A623" strokeWidth="1" opacity="0.5" />
            <line x1="7" y1="10" x2="15" y2="10" stroke="#F5A623" strokeWidth="1" opacity="0.5" />
            <line x1="7" y1="13" x2="12" y2="13" stroke="#F5A623" strokeWidth="1" opacity="0.5" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.3 }}
        >
          <WalkingVoterIllustration />
        </motion.div>
      </div>

      {/* Content area — bottom 48% */}
      <div className="flex-[48] flex flex-col justify-start px-8 pt-2 pb-20">
        <motion.h1
          className="text-display-lg text-ink leading-[1.15]"
          style={{ fontSize: 40 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          Know before
          <br />
          you vote.
        </motion.h1>

        <motion.p
          className="mt-2.5 text-[14px] text-secondary font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          Candidate records, your rights, election
          <br />
          dates — all grounded in official data
        </motion.p>

        {/* Feature list */}
        <motion.ul
          className="mt-5 flex flex-col gap-2.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span
                className="mt-[7px] w-1.5 h-1.5 rounded-full bg-amber shrink-0"
              />
              <span className="text-body-sm text-ink">{feature}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
