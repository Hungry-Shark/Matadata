'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// ── Slide definitions ───────────────────────────────────────────────────────
const SLIDES = [
  { id: 'hook' },
  { id: 'features' },
  { id: 'voice' },
] as const;

type SlideId = typeof SLIDES[number]['id'];

// ── Hook Slide (dark bg) ───────────────────────────────────────────────────
function HookSlide({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <main
      className="flex-1 flex flex-col items-center justify-between pt-12 pb-6 px-6 w-full h-full overflow-hidden relative"
      style={{ background: '#0A0A0A' }}
    >
      {/* Illustration */}
      <div className="w-full flex-grow flex items-center justify-center relative mb-8 max-h-[442px]">
        {/* gradient fade to bg at bottom */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 60%, #0A0A0A 100%)' }}
        />
        <img
          alt="Voting hand illustration"
          className="w-full h-full object-contain object-bottom relative z-0 opacity-90"
          style={{ mixBlendMode: 'screen', filter: 'grayscale(1)' }}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnJPonyc4mjge3w2fuvzp892ElPRvjRUFl-npz9aNKeoi3UgaLbEQjWQxA_FqCRghKIYOOICVNu2_UCpWCGfyzUzWCB36dQWbqHBRi5PYpPPtZQMPqaE6bx8PVgcBvN-x9O5kuuWkcaauptNQt8Y7gC-yZVGZUsMYJvQa4ilHXlUy509JEbE9TOAiTuau2IC2ScZMy6vVUwE3_z3uCphpxhC_w0J_kk--cJMfcptY2psoh-OrIP3olNqw5DtMgAXmFrY1PSNWK6ASL"
        />
        {/* Amber glow */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ mixBlendMode: 'overlay' }}>
          <div
            className="w-48 h-48 rounded-full"
            style={{ background: '#F5A623', filter: 'blur(100px)', opacity: 0.2 }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="w-full flex flex-col gap-2 relative z-20 text-center mb-16">
        <h1
          className="text-pure-white leading-tight"
          style={{ fontFamily: 'Epilogue, sans-serif', fontSize: '52px', fontWeight: 700, lineHeight: 1.05 }}
        >
          Your Vote.<br />Your Voice.<br />Your Right.
        </h1>
        <p
          className="mt-3"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '20px', color: '#9E9E9E' }}
        >
          India ka sabse smart election guide
        </p>
      </div>

      {/* Bottom row: Skip / Dots / Next */}
      <div className="w-full flex items-center justify-between relative z-20 pb-3">
        <button
          onClick={onSkip}
          className="py-2 px-3 -ml-3"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', color: '#9E9E9E' }}
        >
          Skip
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full" style={{ background: '#F5A623' }} />
          <div className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: '#c9c6c5' }} />
          <div className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: '#c9c6c5' }} />
        </div>

        {/* Next arrow button */}
        <button
          onClick={onNext}
          className="w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: '#F5A623',
            color: '#0A0A0A',
            boxShadow: '0 0 20px rgba(245,166,35,0.3)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: 700 }}>
            arrow_forward
          </span>
        </button>
      </div>
    </main>
  );
}

// ── Features Slide (cream bg) ──────────────────────────────────────────────
function FeaturesSlide({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const bullets = [
    'Criminal cases',
    'PRS attendance',
    'Constitutional rights',
    'Booth locator',
  ];

  return (
    <main
      className="flex-1 flex flex-col px-8 pt-16 pb-6 w-full overflow-hidden"
      style={{ background: '#FAFAF5' }}
    >
      {/* Illustration */}
      <div className="flex-1 flex items-center justify-center mb-12">
        <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
          {/* Soft amber blur behind */}
          <div
            className="absolute inset-0 rounded-full opacity-50"
            style={{ background: '#FFF3D6', filter: 'blur(48px)', transform: 'translateY(-32px)' }}
          />
          <img
            className="relative z-10 w-full h-full object-contain"
            style={{ mixBlendMode: 'multiply' }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhc8ZBDqJQsNNg-JLH-usi1_d_MEl3ItiZcrkoIjH3vGjd-iI8Azg0U2HrEa4Beg38u_tvjwLt5VwrWBOludp3AdhJuLlfw59zKkHREadHmwh-gYq8zBmdRTDDLPPtSB3Oin0PVI_bgMuyTNcclczlhIsTjUG0YamMGYceLWY7pF4H8qLmBbMlU3yN8X38O7fAR_nnFL2u5HTvDEimLfZdTcznf_lX1L6RhhR9oWBk3iljLhuNwt5AxJfGyzVfgCMPzmB6EYwCNWh9"
            alt="Features illustration"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 mb-16">
        <h1
          className="tracking-tight"
          style={{ fontFamily: 'Epilogue, sans-serif', fontSize: '36px', fontWeight: 700, lineHeight: 1.1, color: '#0A0A0A' }}
        >
          Know before you vote.
        </h1>
        <ul className="flex flex-col gap-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: '#F5A623', boxShadow: '0 0 8px rgba(245,166,35,0.4)' }}
              />
              <span
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '17px', fontWeight: 500, color: '#524534' }}
              >
                {b}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        {/* Dots */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#e2e3de' }} />
          <div
            className="w-6 h-2 rounded-full"
            style={{ background: '#F5A623', boxShadow: '0 0 8px rgba(245,166,35,0.3)' }}
          />
          <div className="w-2 h-2 rounded-full" style={{ background: '#e2e3de' }} />
        </div>

        {/* Next pill button */}
        <button
          onClick={onNext}
          className="h-14 px-6 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{
            background: '#0A0A0A',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '17px',
            fontWeight: 600,
          }}
        >
          Next
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
        </button>
      </div>
    </main>
  );
}

// ── Voice Slide (amber bg) ─────────────────────────────────────────────────
function VoiceSlide({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col justify-between w-full" style={{ background: '#F5A623' }}>
      {/* Progress bar — 3rd of 4 segments active */}
      <div className="pt-12 px-6 flex gap-2 items-center justify-center">
        {[false, false, true, false].map((active, i) => (
          <div
            key={i}
            className="h-1 w-8 rounded-full"
            style={{ background: active ? '#0A0A0A' : 'rgba(10,10,10,0.2)' }}
          />
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Illustration */}
        <div className="w-full max-w-[320px] aspect-square relative mb-16">
          <img
            alt="Voice illustration"
            className="w-full h-full object-contain"
            style={{ mixBlendMode: 'multiply' }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCnrj1vr-OtOj6C3F_DdZ_UzRHV6aQFl5cAwL7VyvM5rYIYkDsMF9BO_Ly4ah-zzvRYQc158eMX8F7ZtXQfPf0vOt1DayV9fk6BFz2OQWMsUfDTDNKa7qarzzv8YfQd1qUYw9E44XGGWrA1ykqEJ6IxlZjfS-AlAn43RXJeH2GQJT8dTMu9n9zBqqIRunS46LoYqt_3e6MMFnPhz3VRqjxtyz1Id3KiPC1AVLJw9CUBWGfhALZ7XoN3sd5QMBX-hvqhjKJ79BX9wLR"
          />
          {/* Decorative orb */}
          <div
            className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full -z-10"
            style={{
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(to top right, rgba(212,137,26,0.4), rgba(255,243,214,0.4))',
              mixBlendMode: 'overlay',
              filter: 'blur(24px)',
            }}
          />
        </div>

        {/* Typography */}
        <div className="text-center w-full max-w-[400px]">
          <h1
            className="mb-3 tracking-tight"
            style={{ fontFamily: 'Epilogue, sans-serif', fontSize: '36px', fontWeight: 700, lineHeight: 1.1, color: '#0A0A0A' }}
          >
            Ask anything.<br />In any language.
          </h1>
          <p
            className="mb-8"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '17px', color: 'rgba(10,10,10,0.8)' }}
          >
            Hindi, English — bas bol do.
          </p>
          {/* Language pills */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <span
              className="inline-flex items-center px-4 py-2 rounded-full"
              style={{
                background: '#0A0A0A',
                color: '#FFFFFF',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              हिंदी
            </span>
            <span
              className="inline-flex items-center px-4 py-2 rounded-full"
              style={{
                border: '2px solid #FFFFFF',
                color: '#0A0A0A',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              English
            </span>
          </div>
        </div>
      </main>

      {/* CTA */}
      <div className="pb-8 px-6 w-full max-w-[400px] mx-auto">
        <button
          onClick={onNext}
          className="w-full h-14 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{
            background: '#0A0A0A',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(10,10,10,0.1)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '17px',
            fontWeight: 600,
          }}
        >
          Let's Begin
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Onboarding Shell ─────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (step < 2) {
      setDirection(1);
      setStep((s) => (s + 1) as 0 | 1 | 2);
    } else {
      router.push('/onboarding/location');
    }
  };

  const goSkip = () => {
    router.push('/onboarding/location');
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="min-h-dvh flex flex-col overflow-hidden w-full relative">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex flex-col"
        >
          {step === 0 && <HookSlide onNext={goNext} onSkip={goSkip} />}
          {step === 1 && <FeaturesSlide onNext={goNext} onSkip={goSkip} />}
          {step === 2 && <VoiceSlide onNext={goNext} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
