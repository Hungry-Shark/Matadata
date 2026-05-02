'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const NAV_ITEMS_LEFT = [
  { key: 'home' as const, href: '/home', icon: 'home' },
  { key: 'chat' as const, href: '/chat', icon: 'chat_bubble' },
];

const NAV_ITEMS_RIGHT = [
  { key: 'candidates' as const, href: '/candidates', icon: 'how_to_reg' },
  { key: 'rights' as const, href: '/rights', icon: 'gavel' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');

  const renderNavItem = (item: { key: 'home' | 'chat' | 'candidates' | 'rights'; href: string; icon: string }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== '/home' && pathname.startsWith(item.href));

    return (
      <Link
        key={item.key}
        href={item.href}
        className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
          isActive
            ? 'text-election-amber'
            : 'text-text-muted hover:text-primary-ink'
        }`}
      >
        <span
          className="material-symbols-outlined text-[24px]"
          style={{
            fontVariationSettings: isActive
              ? "'FILL' 1, 'wght' 600"
              : "'FILL' 0, 'wght' 400",
          }}
        >
          {item.icon}
        </span>
        <span className="font-body-xs text-[10px] font-semibold tracking-wide">
          {t(item.key)}
        </span>
      </Link>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-pure-white/95 backdrop-blur-lg border-t border-surface-variant"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-[72px] w-full relative">
        {/* Left nav items */}
        {NAV_ITEMS_LEFT.map(renderNavItem)}

        {/* Center Voice FAB */}
        <button
          onClick={() => router.push('/voice')}
          className="relative -mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-election-amber to-amber-dark text-pure-white flex items-center justify-center shadow-[0_4px_20px_rgba(245,166,35,0.45)] active:scale-90 transition-transform border-4 border-pure-white"
          aria-label="Voice assistant"
        >
          <span
            className="material-symbols-outlined text-[26px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mic
          </span>
        </button>

        {/* Right nav items */}
        {NAV_ITEMS_RIGHT.map(renderNavItem)}
      </div>
    </nav>
  );
}
