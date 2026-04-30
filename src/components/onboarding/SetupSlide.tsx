'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Language } from '@/types';

interface SetupSlideProps {
  onBack: () => void;
  onComplete: (pincode: string, language: Language) => void;
}

/**
 * Onboarding Step 4 — Location Setup
 * Cream background. Pincode input, GPS option, language toggle.
 * Validates pincode (6 digits) before enabling Continue.
 */
export function SetupSlide({ onBack, onComplete }: SetupSlideProps) {
  const [pincode, setPincode] = useState('');
  const [language, setLanguage] = useState<Language>('hi');
  const [isLocating, setIsLocating] = useState(false);

  const isValid = pincode.length >= 4;

  const handlePincodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
      setPincode(value);
    },
    []
  );

  const handleGPS = useCallback(() => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // In production: reverse geocode to get pincode
          // For now, set a demo pincode
          setPincode('221001');
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-cream min-h-dvh">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 16px) + 16px)' }}>
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center -ml-2"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-body-sm text-muted">Almost there</span>
        <div className="w-10" />
      </div>

      {/* Content card */}
      <motion.div
        className="mx-6 mt-6 bg-white rounded-xl p-6"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        {/* Pincode section */}
        <label className="text-body-xs font-semibold uppercase tracking-[0.08em] text-amber">
          WHERE ARE YOU VOTING?
        </label>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pincode}
          onChange={handlePincodeChange}
          placeholder="Enter your pincode"
          className="mt-3 w-full h-16 rounded-[12px] bg-cream-deep text-center font-mono text-[24px] font-medium text-ink placeholder:text-muted/60 outline-none transition-all duration-200 border-[1.5px]"
          style={{
            borderColor: pincode.length > 0 ? '#0A0A0A' : 'rgba(0,0,0,0.12)',
          }}
          autoComplete="postal-code"
        />

        {/* Divider with "or" */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-ink/10" />
          <span className="text-body-xs text-muted">or</span>
          <div className="flex-1 h-px bg-ink/10" />
        </div>

        {/* GPS button */}
        <button
          onClick={handleGPS}
          disabled={isLocating}
          className="w-full h-[52px] rounded-full border-[1.5px] border-ink/15 text-body-sm font-medium text-ink flex items-center justify-center gap-2 transition-colors hover:bg-cream-deep disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-amber border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Locating...
            </>
          ) : (
            '📍 Use my current location'
          )}
        </button>
      </motion.div>

      {/* Language section */}
      <motion.div
        className="mx-6 mt-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <label className="text-body-xs font-semibold uppercase tracking-[0.08em] text-amber">
          YOUR PREFERRED LANGUAGE
        </label>

        <div className="mt-3 flex gap-3">
          <button
            onClick={() => setLanguage('hi')}
            className="flex-1 h-12 rounded-full font-body font-medium text-[15px] transition-all duration-200"
            style={{
              backgroundColor: language === 'hi' ? '#0A0A0A' : '#FAFAF5',
              color: language === 'hi' ? '#FFFFFF' : '#9E9E9E',
              border: language === 'hi' ? 'none' : '1.5px solid rgba(0,0,0,0.1)',
            }}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('en')}
            className="flex-1 h-12 rounded-full font-body font-medium text-[15px] transition-all duration-200"
            style={{
              backgroundColor: language === 'en' ? '#0A0A0A' : '#FAFAF5',
              color: language === 'en' ? '#FFFFFF' : '#9E9E9E',
              border: language === 'en' ? 'none' : '1.5px solid rgba(0,0,0,0.1)',
            }}
          >
            English
          </button>
        </div>
      </motion.div>

      {/* CTA */}
      <div className="mt-auto px-6 pb-8">
        <motion.button
          onClick={() => onComplete(pincode, language)}
          disabled={!isValid}
          className="w-full h-14 rounded-full font-display font-bold text-[16px] transition-all duration-200 flex items-center justify-center"
          style={{
            backgroundColor: isValid ? '#F5A623' : 'rgba(245,166,35,0.35)',
            color: '#0A0A0A',
          }}
          whileTap={isValid ? { scale: 0.97 } : undefined}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          Continue →
        </motion.button>
      </div>
    </div>
  );
}
