'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { SUPPORTED_LOCALES, LOCALE_META } from '@/i18n/config';
import type { Language } from '@/types';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Profile Drawer — slides up from bottom.
 * Shows user info, constituency, language selector, and logout.
 * Designed for mobile: full-screen bottom sheet.
 */
export function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const router = useRouter();
  const t = useTranslations('profile');
  const { user, constituency, language, setLanguage, clearUser, resetOnboarding } = useAppStore();
  const [signingOut, setSigningOut] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(auth);
      resetOnboarding(); // clears user + constituency + onboardingComplete
      router.push('/onboarding');
    } catch (err) {
      console.error('Sign-out error:', err);
      setSigningOut(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLangPicker(false);
    // Reload to let next-intl server pick up the new locale cookie
    window.location.reload();
  };

  const menuItems = [
    { icon: 'location_on', label: t('changeConstituency'), action: () => { onClose(); router.push('/onboarding/location'); } },
    { icon: 'notifications', label: t('notifications'), action: () => {} },
    { icon: 'translate', label: `${t('language')} · ${LOCALE_META[language as keyof typeof LOCALE_META]?.nativeName || 'English'}`, action: () => setShowLangPicker(true) },
    { icon: 'help', label: t('helpFaq'), action: () => {} },
    { icon: 'info', label: t('about'), action: () => {} },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="profile-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#FFFDF5] rounded-t-[28px] overflow-hidden"
            style={{ maxHeight: '90dvh' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-outline-variant rounded-full" />
            </div>

            {/* User Header */}
            <div className="px-6 pt-2 pb-6 border-b border-surface-variant">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-election-amber to-[#D4891A] flex items-center justify-center shrink-0 shadow-amber">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-pure-white text-[28px]">person</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-[18px] font-bold text-primary-ink truncate">
                    {user?.name || t('voter')}
                  </h2>
                  <p className="text-[13px] text-text-secondary truncate">
                    {user?.email || t('notSignedIn')}
                  </p>
                  {constituency && (
                    <div className="inline-flex items-center gap-1 mt-1.5 bg-amber-soft rounded-full px-2.5 py-1 w-max border border-election-amber/20">
                      <span className="material-symbols-outlined text-[11px] text-election-amber" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                      <span className="text-[11px] font-semibold text-amber-dark">{constituency.name}, {constituency.state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: '50dvh' }}>
              {menuItems.map((item) => (
                <button
                  key={item.icon}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 px-3 py-4 rounded-xl hover:bg-surface-container-low active:bg-surface-container transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-deep-cream flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-on-surface">{item.icon}</span>
                  </div>
                  <span className="text-[15px] font-medium text-primary-ink">{item.label}</span>
                  <span className="material-symbols-outlined text-[18px] text-text-muted ml-auto">chevron_right</span>
                </button>
              ))}
            </div>

            {/* Language Picker (inline) */}
            <AnimatePresence>
              {showLangPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 overflow-hidden"
                >
                  <div className="bg-deep-cream rounded-2xl p-4 mb-3 border border-surface-variant">
                    <p className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-3">{t('language')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SUPPORTED_LOCALES.map(loc => {
                        const meta = LOCALE_META[loc];
                        const isActive = language === loc;
                        return (
                          <button
                            key={loc}
                            onClick={() => handleLanguageChange(loc)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                              isActive
                                ? 'bg-election-amber text-pure-white shadow-md'
                                : 'bg-pure-white text-primary-ink border border-surface-variant hover:border-election-amber/40'
                            }`}
                          >
                            <span className="text-[14px] font-semibold">{meta.nativeName}</span>
                            <span className={`text-[11px] ml-auto ${isActive ? 'text-pure-white/70' : 'text-text-muted'}`}>{loc.toUpperCase()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logout */}
            <div className="px-4 pb-6 pt-2 border-t border-surface-variant">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-error-container text-on-error-container font-bold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                {signingOut ? t('signingOut') : t('signOut')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
