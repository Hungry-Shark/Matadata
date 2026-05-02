'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useAppStore } from '@/store/appStore';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();
  const { setUser, completeOnboarding } = useAppStore();
  const t = useTranslations('auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Sync the Firebase user into our Zustand store
      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Voter',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || null,
        constituency: null,
        preferences: { language: 'en', notifications: true },
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      });

      // Persist profile to Firestore (fire & forget)
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Voter',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString(),
        }),
      }).catch(console.warn);

      completeOnboarding();
      router.push('/home');
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleGuest = () => {
    completeOnboarding();
    router.push('/home');
  };

  return (
    <div className="bg-warm-cream text-primary-ink min-h-dvh flex flex-col font-body-md antialiased">
      {/* Full-width mobile layout — no max-w constraint */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 w-full">

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[300px] aspect-square mb-8 rounded-3xl overflow-hidden bg-deep-cream border-2 border-primary-ink/5 relative flex items-center justify-center"
        >
          <img
            alt="Character at polling booth"
            className="w-full h-full object-cover mix-blend-multiply opacity-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdMahardGKyq8cjThOB3JBJBVjtoATN9MlLCuEMXBMxvE3Ibh8hJkqw_mHGWk7sfVCkOe5_FWn6NcNIgdIybygbMRuREj5XXYDTygkYL5Zh1hMU9Kl3fe_rhTQ8WaW9Bt-s_Ftr2yDsWg0MBlbOSNTCv4k2Myzo-BLPTWqbi9Ek8GUWMKI-ejxqbfjZveaDUH0WEBkBWIi-t8IPd8Odc85p50DO55O7uSa7DxVepO_D7CwCZq9rGcUlUexh59KkokxMN2O36jUqlg2"
          />
        </motion.div>

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="text-center w-full mb-8"
        >
          <h1 className="text-[32px] font-black italic tracking-tighter text-primary-ink mb-2">
            MataData
          </h1>
          <p className="text-[16px] text-text-secondary leading-snug">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="w-full flex flex-col gap-4"
        >
          {error && (
            <p className="text-[13px] text-error text-center bg-error-container rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Google Sign-in */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full h-14 rounded-full bg-primary-ink text-pure-white text-[16px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? t('signingIn') : t('googleBtn')}
          </button>

          {/* Guest */}
          <button
            onClick={handleGuest}
            className="w-full h-14 rounded-full bg-deep-cream text-primary-ink text-[16px] font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform group"
          >
            {t('guestBtn')}
            <span className="material-symbols-outlined text-[18px] group-active:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </motion.div>

        {/* Fine print */}
        <p className="text-[11px] text-text-muted text-center mt-8 px-4 leading-relaxed">
          {t('terms')}{' '}
          <a href="#" className="underline text-primary-ink/60">{t('termsLink')}</a>
          {' '}{t('and')}{' '}
          <a href="#" className="underline text-primary-ink/60">{t('privacyLink')}</a>.
        </p>
      </main>
    </div>
  );
}
