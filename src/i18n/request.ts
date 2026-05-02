import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

/**
 * Server-side locale resolver for next-intl.
 * Reads the 'locale' cookie set by the client-side Zustand store.
 * Falls back to 'en' if no cookie is present (first visit / guest).
 */

const SUPPORTED_LOCALES = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn'] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

function isSupported(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get('locale')?.value || 'en';
  const locale: SupportedLocale = isSupported(raw) ? raw : 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
