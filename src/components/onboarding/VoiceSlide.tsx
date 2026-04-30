'use client';

import { motion } from 'framer-motion';
import { SpeakingPersonIllustration } from './illustrations/SpeakingPerson';

interface VoiceSlideProps {
  onLetBegin: () => void;
}

/**
 * Onboarding Step 3 — Voice Demo
 * Full amber background. "Ask anything. In any language."
 * Language pills + "Let's Begin →" CTA.
 */
export function VoiceSlide({ onLetBegin }: VoiceSlideProps) {
  return (
    <div className="flex-1 flex flex-col min-h-dvh" style={{ backgroundColor: '#F5A623' }}>
      {/* Illustration area — top 50% */}
      <div className="flex-[50] relative flex items-center justify-center overflow-hidden">
        {/* Floating language glyphs */}
        <motion.span
          className="absolute top-[22%] right-[20%] font-display text-[18px] font-bold text-ink"
          style={{ opacity: 0.25 }}
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          हिं
        </motion.span>
        <motion.span
          className="absolute top-[35%] left-[15%] font-display text-[16px] font-bold text-ink"
          style={{ opacity: 0.2 }}
          animate={{ y: [0, 6, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          Eng
        </motion.span>
        <motion.span
          className="absolute bottom-[25%] right-[25%] font-display text-[14px] font-bold text-ink"
          style={{ opacity: 0.15 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          ♪
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.3 }}
        >
          <SpeakingPersonIllustration />
        </motion.div>
      </div>

      {/* Content area — bottom 50% */}
      <div className="flex-[50] flex flex-col justify-start px-8 pt-2 pb-8">
        <motion.h1
          className="text-ink leading-[1.15] font-display font-bold"
          style={{ fontSize: 40 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          Ask anything.
          <br />
          In any language.
        </motion.h1>

        <motion.p
          className="mt-2.5 text-[14px] font-body"
          style={{ color: 'rgba(10,10,10,0.65)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          Hindi, English — bas bol do.
          <br />
          MataData sunta hai.
        </motion.p>

        {/* Language pills */}
        <motion.div
          className="mt-[18px] flex gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <span className="px-4 py-2 rounded-full bg-ink text-white text-body-sm font-medium">
            हिंदी
          </span>
          <span className="px-4 py-2 rounded-full border border-ink text-ink text-body-sm font-medium bg-transparent">
            English
          </span>
          <span className="px-4 py-2 rounded-full border border-dashed border-ink/40 text-ink/50 text-body-sm">
            + 8 more
          </span>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={onLetBegin}
          className="mt-6 w-full h-14 rounded-full bg-ink text-white font-display font-bold text-[16px] tracking-[0.02em] flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          whileTap={{ scale: 0.97 }}
        >
          Let&apos;s Begin →
        </motion.button>
      </div>
    </div>
  );
}
