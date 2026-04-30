import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Constituency, Language, Notification, VoiceMode, User } from '@/types';

// ================================================================
// MataData Global Store — Zustand with selective persistence
// ================================================================

interface AppState {
  // ---- User ----
  user: User | null;

  // ---- Preferences ----
  language: Language;
  constituency: Constituency | null;
  pincode: string | null;

  // ---- Onboarding ----
  onboardingComplete: boolean;
  currentOnboardingStep: number;

  // ---- Notifications ----
  unreadCount: number;
  notifications: Notification[];

  // ---- Voice ----
  voiceMode: VoiceMode;

  // ---- Actions ----
  setUser: (user: AppState['user']) => void;
  clearUser: () => void;
  setLanguage: (lang: Language) => void;
  setConstituency: (c: Constituency) => void;
  setPincode: (pincode: string) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setVoiceMode: (mode: VoiceMode) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationsRead: () => void;
  addNotification: (notification: Notification) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  language: 'en' as Language,
  constituency: null,
  pincode: null,
  onboardingComplete: false,
  currentOnboardingStep: 0,
  unreadCount: 0,
  notifications: [] as Notification[],
  voiceMode: 'idle' as VoiceMode,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user }),

      clearUser: () => set({ user: null }),

      setLanguage: (language) => set({ language }),

      setConstituency: (constituency) => set({ constituency }),

      setPincode: (pincode) => set({ pincode }),

      setOnboardingStep: (currentOnboardingStep) =>
        set({ currentOnboardingStep }),

      completeOnboarding: () =>
        set({ onboardingComplete: true }),

      resetOnboarding: () =>
        set({ onboardingComplete: false, currentOnboardingStep: 0, user: null, constituency: null, pincode: null }),

      setVoiceMode: (voiceMode) => set({ voiceMode }),

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.read).length,
        }),

      markNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
          unreadCount: 0,
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.read ? 0 : 1),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'matadata-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys — never persist voiceMode or notifications
      partialize: (state) => ({
        language: state.language,
        constituency: state.constituency,
        pincode: state.pincode,
        onboardingComplete: state.onboardingComplete,
        currentOnboardingStep: state.currentOnboardingStep,
        user: state.user,
      }),
    }
  )
);
