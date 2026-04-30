'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';

/**
 * MataData — Root Splash Page
 * 
 * Auth flow on load:
 * 1. Show branded splash for 1.2s
 * 2. Check Firebase auth state
 *    - If signed in → push /home (skip onboarding)
 *    - If not signed in + onboarding complete → push /auth (they've seen slides before)
 *    - Otherwise → push /onboarding (fresh start)
 */
export default function RootPage() {
  const router = useRouter();
  const { onboardingComplete, setUser, completeOnboarding } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check Firebase session
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        unsubscribe(); // only need the first value

        if (firebaseUser) {
          // Already signed in — sync user and go home
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
          completeOnboarding();
          router.replace('/home');
        } else if (onboardingComplete) {
          // Seen onboarding but signed out — go to auth/sign-in
          router.replace('/auth');
        } else {
          // First time or fully reset
          router.replace('/onboarding');
        }
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [onboardingComplete, router, setUser, completeOnboarding]);

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center min-h-dvh"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Amber Orb */}
      <motion.div
        className="w-16 h-16 rounded-full"
        style={{
          backgroundColor: '#F5A623',
          boxShadow: '0 0 40px rgba(245, 166, 35, 0.5)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* App Name */}
      <motion.h1
        className="mt-6 text-[22px] font-black italic tracking-tighter text-white"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        MataData
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="mt-2 text-[13px] text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        Know your vote. Know your rights.
      </motion.p>

      {/* Progress bar */}
      <motion.div
        className="fixed bottom-0 left-0 h-[3px]"
        style={{ backgroundColor: '#F5A623' }}
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      />
    </main>
  );
}
