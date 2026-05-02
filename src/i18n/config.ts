// ── i18n constants ──────────────────────────────────────────────────────────
// Single source of truth for all supported locales and their display metadata.

export const SUPPORTED_LOCALES = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_META: Record<SupportedLocale, { name: string; nativeName: string; script: string }> = {
  en: { name: 'English',  nativeName: 'English',  script: 'Latin' },
  hi: { name: 'Hindi',    nativeName: 'हिंदी',     script: 'Devanagari' },
  bn: { name: 'Bengali',  nativeName: 'বাংলা',    script: 'Bengali' },
  te: { name: 'Telugu',   nativeName: 'తెలుగు',    script: 'Telugu' },
  mr: { name: 'Marathi',  nativeName: 'मराठी',     script: 'Devanagari' },
  ta: { name: 'Tamil',    nativeName: 'தமிழ்',     script: 'Tamil' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી',   script: 'Gujarati' },
  kn: { name: 'Kannada',  nativeName: 'ಕನ್ನಡ',     script: 'Kannada' },
};

export const DEFAULT_LOCALE: SupportedLocale = 'en';
