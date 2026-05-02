'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import type { Language } from '@/types';

// ─── Locale names for the language picker ────────────────────────────────────
const LOCALES: Language[] = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn'];
const LOCALE_NAMES: Record<Language, string> = {
  en: 'English', hi: 'हिंदी', bn: 'বাংলা', te: 'తెలుగు',
  mr: 'मराठी', ta: 'தமிழ்', gu: 'ગુજરાતી', kn: 'ಕನ್ನಡ',
};

// ─── Types ───────────────────────────────────────────────────────────────────
type SlideKey = 'hook' | 'features' | 'voice' | 'location';
const SLIDES: SlideKey[] = ['hook', 'features', 'voice', 'location'];

// ─── Spring ──────────────────────────────────────────────────────────────────
const SPRING = { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.9 };

// ─── Shared NavRow ───────────────────────────────────────────────────────────
// Keeps Skip/spacer + dots + arrow button perfectly centred on every slide
function NavRow({
  slideIndex,     // 0‑based index of current slide
  totalSlides,    // how many slides to show dots for
  onNext,
  onSkip,
  showSkip = false,
  darkMode = false,
}: {
  slideIndex: number;
  totalSlides: number;
  onNext: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  darkMode?: boolean;
}) {
  const inactiveColor = darkMode ? 'rgba(201,198,197,0.3)' : '#e2e3de';
  const textColor = darkMode ? '#9E9E9E' : '#9E9E9E';

  return (
    <div className="w-full flex items-center justify-between px-6 pb-4" style={{ gap: 0 }}>
      {/* Left – Skip or invisible spacer */}
      <div style={{ width: 56, display: 'flex', alignItems: 'center' }}>
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', color: textColor, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
          >
            Skip
          </button>
        )}
      </div>

      {/* Centre – pill dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slideIndex ? 24 : 6,
              height: 6,
              borderRadius: 99,
              background: i === slideIndex ? '#F5A623' : inactiveColor,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Right – amber circle arrow (identical on every slide) */}
      <motion.button
        onClick={onNext}
        whileTap={{ scale: 0.88 }}
        transition={SPRING}
        style={{
          width: 56, height: 56, borderRadius: 99,
          background: '#F5A623',
          color: '#0A0A0A',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(245,166,35,0.35)',
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22, fontWeight: 700 }}>
          arrow_forward
        </span>
      </motion.button>
    </div>
  );
}

// ─── Slide 1 – Hook (dark) ───────────────────────────────────────────────────
function HookSlide({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ background: '#0A0A0A', flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Illustration */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', maxHeight: 420, minHeight: 260 }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, transparent 55%, #0A0A0A 100%)', pointerEvents: 'none' }} />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnJPonyc4mjge3w2fuvzp892ElPRvjRUFl-npz9aNKeoi3UgaLbEQjWQxA_FqCRghKIYOOICVNu2_UCpWCGfyzUzWCB36dQWbqHBRi5PYpPPtZQMPqaE6bx8PVgcBvN-x9O5kuuWkcaauptNQt8Y7gC-yZVGZUsMYJvQa4ilHXlUy509JEbE9TOAiTuau2IC2ScZMy6vVUwE3_z3uCphpxhC_w0J_kk--cJMfcptY2psoh-OrIP3olNqw5DtMgAXmFrY1PSNWK6ASL"
          alt="Voting hand"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'bottom', mixBlendMode: 'screen', filter: 'grayscale(1)', opacity: 0.9, display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', mixBlendMode: 'overlay' }}>
          <div style={{ width: 192, height: 192, borderRadius: '50%', background: '#F5A623', filter: 'blur(100px)', opacity: 0.2 }} />
        </div>
      </div>

      {/* Text */}
      <div style={{ padding: '0 24px 24px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontFamily: 'Epilogue, sans-serif', fontSize: 48, fontWeight: 900, lineHeight: 1.05, color: '#FFFFFF', margin: 0 }}>
          Your Vote.<br />Your Voice.<br />Your Right.
        </h1>
        <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, color: '#9E9E9E', marginTop: 12, marginBottom: 24 }}>
          India ka sabse smart election guide
        </p>
      </div>

      <NavRow slideIndex={0} totalSlides={4} onNext={onNext} onSkip={onSkip} showSkip darkMode />
    </div>
  );
}

// ─── Slide 2 – Features (cream) ──────────────────────────────────────────────
function FeaturesSlide({ onNext }: { onNext: () => void }) {
  const bullets = ['Criminal cases', 'PRS attendance', 'Constitutional rights', 'Booth locator'];
  return (
    <div style={{ background: '#FAFAF5', flex: 1, display: 'flex', flexDirection: 'column', width: '100%', paddingTop: 40 }}>
      {/* Illustration */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', width: 260, height: 260 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#FFF3D6', filter: 'blur(48px)', opacity: 0.5, transform: 'translateY(-32px)' }} />
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhc8ZBDqJQsNNg-JLH-usi1_d_MEl3ItiZcrkoIjH3vGjd-iI8Azg0U2HrEa4Beg38u_tvjwLt5VwrWBOludp3AdhJuLlfw59zKkHREadHmwh-gYq8zBmdRTDDLPPtSB3Oin0PVI_bgMuyTNcclczlhIsTjUG0YamMGYceLWY7pF4H8qLmBbMlU3yN8X38O7fAR_nnFL2u5HTvDEimLfZdTcznf_lX1L6RhhR9oWBk3iljLhuNwt5AxJfGyzVfgCMPzmB6EYwCNWh9"
            alt="Features"
            style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', position: 'relative', zIndex: 1 }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 32px 16px' }}>
        <h1 style={{ fontFamily: 'Epilogue, sans-serif', fontSize: 34, fontWeight: 800, lineHeight: 1.1, color: '#0A0A0A', margin: '0 0 16px 0' }}>
          Know before you vote.
        </h1>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bullets.map((b, i) => (
            <motion.li key={b} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: 0.05 * i }}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F5A623', boxShadow: '0 0 8px rgba(245,166,35,0.4)', flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 17, fontWeight: 500, color: '#524534' }}>{b}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div style={{ paddingBottom: 8 }} />
      <NavRow slideIndex={1} totalSlides={4} onNext={onNext} />
    </div>
  );
}

// ─── Slide 3 – Voice (amber) ─────────────────────────────────────────────────
function VoiceSlide({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ background: '#F5A623', flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
      {/* Illustration area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 0', minWidth: 0 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 280, aspectRatio: '1', marginBottom: 24 }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCnrj1vr-OtOj6C3F_DdZ_UzRHV6aQFl5cAwL7VyvM5rYIYkDsMF9BO_Ly4ah-zzvRYQc158eMX8F7ZtXQfPf0vOt1DayV9fk6BFz2OQWMsUfDTDNKa7qarzzv8YfQd1qUYw9E44XGGWrA1ykqEJ6IxlZjfS-AlAn43RXJeH2GQJT8dTMu9n9zBqqIRunS46LoYqt_3e6MMFnPhz3VRqjxtyz1Id3KiPC1AVLJw9CUBWGfhALZ7XoN3sd5QMBX-hvqhjKJ79BX9wLR"
            alt="Voice"
            style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', display: 'block' }}
          />
          <motion.div
            style={{ position: 'absolute', top: '50%', left: '50%', width: 140, height: 140, borderRadius: '50%', background: 'rgba(212,137,26,0.35)', filter: 'blur(28px)', zIndex: -1, translateX: '-50%', translateY: '-50%' }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Text — uses explicit width in px, not Tailwind utilities */}
        <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Epilogue, sans-serif', fontSize: 34, fontWeight: 800, lineHeight: 1.1, color: '#0A0A0A', margin: '0 0 10px 0' }}>
            Ask anything.<br />In any language.
          </h1>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 17, color: 'rgba(10,10,10,0.75)', margin: '0 0 20px 0', whiteSpace: 'nowrap' }}>
            Hindi, English — bas bol do.
          </p>

          {/* Language pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {(['हिंदी', 'English'] as const).map((l, i) => (
              <motion.span key={l} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.1 + i * 0.08 }}
                style={i === 0
                  ? { background: '#0A0A0A', color: '#FFFFFF', fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 99, display: 'inline-block' }
                  : { border: '2px solid rgba(255,255,255,0.85)', color: '#0A0A0A', fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600, padding: '6px 18px', borderRadius: 99, display: 'inline-block' }}>
                {l}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Shared nav row replaces the old "Let's Begin" — keeps visual flow */}
      <div style={{ paddingTop: 16 }} />
      <NavRow slideIndex={2} totalSlides={4} onNext={onNext} darkMode={false} />
    </div>
  );
}

// ─── Slide 4 – Location ───────────────────────────────────────────────────────
function LocationSlide({ onFinish }: { onFinish: () => void }) {
  const { setConstituency, setPincode, setLanguage } = useAppStore();
  const [pincode, setPincodeLocal] = useState('');
  const [lang, setLangLocal] = useState<Language>('hi');
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [msgs, setMsgs] = useState<Record<string, string>>({});

  // Load the onboarding messages for the selected language
  useEffect(() => {
    import(`../../../messages/${lang}.json`).then(m => {
      setMsgs(m.default?.onboarding ?? m.onboarding ?? {});
    }).catch(() => {
      // Fallback to English
      import(`../../../messages/en.json`).then(m => {
        setMsgs(m.default?.onboarding ?? m.onboarding ?? {});
      });
    });
  }, [lang]);

  const T = {
    title: msgs.locationTitle || 'Where are you voting?',
    subtitle: msgs.locationSub || 'We need your location to show the right candidates for your constituency.',
    pincodeLabel: msgs.pincodeLabel || 'Enter Pincode',
    placeholder: '000 000',
    gpsButton: msgs.gpsButton || 'Use my current location',
    langTitle: msgs.langTitle || 'Preferred Language',
    cta: msgs.cta || 'Continue',
    errorMsg: msgs.pincodeError || 'Please enter a valid 6-digit pincode.',
    gpsError: msgs.gpsError || 'Could not access location. Enter your pincode.',
    or: msgs.or || 'or',
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { setError(T.errorMsg); return; }
    setGpsLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(
      () => { setGpsLoading(false); setLanguage(lang); onFinish(); },
      () => { setGpsLoading(false); setError(T.gpsError); }
    );
  };

  const handleContinue = () => {
    if (pincode.length !== 6) { setError(T.errorMsg); return; }
    setLoading(true); setError('');
    setPincode(pincode);
    setLanguage(lang);
    setConstituency({ id: pincode, name: `Constituency (${pincode})`, state: 'India', electionType: 'lok_sabha', pincodeRanges: [pincode] });
    onFinish();
  };

  return (
    <div style={{ background: '#FAFAF5', flex: 1, display: 'flex', flexDirection: 'column', width: '100%', overflowY: 'auto' }}>
      {/* 4-segment bar, 4th active */}
      <div style={{ display: 'flex', gap: 8, padding: '20px 24px 0' }}>
        {[false, false, false, true].map((active, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 99, background: active ? '#F5A623' : '#F0EBE0', transition: 'background 0.3s' }} />
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 24px 24px', gap: 20 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ fontFamily: 'Epilogue, sans-serif', fontSize: 32, fontWeight: 800, lineHeight: 1.1, color: '#0A0A0A', margin: '0 0 10px 0' }}>
            {T.title}
          </h1>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, color: '#5C5C5C', lineHeight: 1.7, margin: 0 }}>
            {T.subtitle}
          </p>
        </div>

        {/* White card */}
        <div style={{ width: '100%', background: '#FFFFFF', borderRadius: 24, padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e3de', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Pincode label + input */}
          <div>
            <label htmlFor="pincode" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#524534', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
              {T.pincodeLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9E9E9E', fontSize: 20 }}>pin_drop</span>
              <input
                id="pincode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={T.placeholder}
                value={pincode}
                onChange={e => { setError(''); setPincodeLocal(e.target.value.replace(/\D/g, '')); }}
                style={{
                  width: '100%', height: 60, borderRadius: 12, paddingLeft: 48, paddingRight: 16,
                  textAlign: 'center', background: '#F0EBE0', border: error ? '2px solid #ba1a1a' : 'none',
                  fontFamily: 'Space Grotesk, monospace', fontSize: 22, letterSpacing: '0.35em', color: '#0A0A0A',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            {error && <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#ba1a1a', margin: '6px 0 0' }}>{error}</p>}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9E9E9E' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e8e8e4' }} />
          </div>

          {/* GPS */}
          <motion.button onClick={handleGPS} disabled={gpsLoading} whileTap={{ scale: 0.97 }} transition={SPRING}
            style={{ width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 99, background: '#FFFFFF', border: '2px solid #e2e3de', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 600, color: '#0A0A0A', cursor: 'pointer', opacity: gpsLoading ? 0.6 : 1 }}>
            {gpsLoading
              ? <span style={{ width: 20, height: 20, border: '2px solid rgba(10,10,10,0.2)', borderTopColor: '#0A0A0A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              : <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>my_location</span>}
            {T.gpsButton}
          </motion.button>
        </div>

        {/* Language toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
          <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#5C5C5C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            {T.langTitle}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: 6, borderRadius: 16, background: '#F0EBE0', width: '100%' }}>
            {LOCALES.map(l => (
              <motion.button key={l} onClick={() => setLangLocal(l)} whileTap={{ scale: 0.95 }} transition={SPRING}
                style={{
                  padding: '10px 4px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: lang === l ? '#0A0A0A' : 'transparent',
                  color: lang === l ? '#FFFFFF' : '#5C5C5C',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: 500,
                  transition: 'background 0.2s, color 0.2s', textAlign: 'center',
                }}>
                {LOCALE_NAMES[l]}
              </motion.button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button onClick={handleContinue} disabled={loading} whileTap={{ scale: 0.97 }} transition={SPRING}
          style={{
            width: '100%', height: 56, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', cursor: 'pointer',
            background: '#F5A623', color: '#FFFFFF', boxShadow: '0 4px 14px rgba(245,166,35,0.4)',
            fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 17, fontWeight: 700, opacity: loading ? 0.6 : 1,
          }}>
          {loading
            ? <span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            : <>{T.cta}<span className="material-symbols-outlined">arrow_forward</span></>}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Root Shell ───────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useAppStore();
  const [slide, setSlide] = useState<SlideKey>('hook');
  const [dir, setDir] = useState(1);

  const go = (next: SlideKey) => {
    const curIdx = SLIDES.indexOf(slide);
    const nextIdx = SLIDES.indexOf(next);
    setDir(nextIdx > curIdx ? 1 : -1);
    setSlide(next);
  };

  const next = () => {
    const idx = SLIDES.indexOf(slide);
    if (idx < SLIDES.length - 1) go(SLIDES[idx + 1]);
  };

  const finish = () => {
    completeOnboarding();
    router.refresh(); // Refresh Next.js cache so the server picks up the new language cookie
    router.replace('/auth');
  };

  const skip = () => go('location');

  return (
    <div style={{ minHeight: '100dvh', width: '100%', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={slide}
          custom={dir}
          initial={{ x: dir > 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir > 0 ? '-55%' : '55%', opacity: 0 }}
          transition={SPRING}
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => { if (info.offset.x < -60) next(); }}
        >
          {slide === 'hook'     && <HookSlide onNext={next} onSkip={skip} />}
          {slide === 'features' && <FeaturesSlide onNext={next} />}
          {slide === 'voice'    && <VoiceSlide onNext={next} />}
          {slide === 'location' && <LocationSlide onFinish={finish} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
