'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[72px] rounded-t-[24px] border-t border-outline-variant/30 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] bg-pure-white/90 z-50 flex justify-around items-center px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Home */}
      <button onClick={() => router.push('/home')} className={cn("flex flex-col items-center justify-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 w-16", pathname === '/home' ? "text-stone-900 dark:text-amber-500" : "text-stone-400 dark:text-stone-500")}>
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: pathname === '/home' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="font-['Epilogue'] text-[11px] font-semibold uppercase tracking-wider">Home</span>
      </button>

      {/* Chat */}
      <button onClick={() => router.push('/chat')} className={cn("flex flex-col items-center justify-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 w-16", pathname === '/chat' ? "text-stone-900 dark:text-amber-500" : "text-stone-400 dark:text-stone-500")}>
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: pathname === '/chat' ? "'FILL' 1" : "'FILL' 0" }}>chat_bubble</span>
        <span className="font-['Epilogue'] text-[11px] font-semibold uppercase tracking-wider">Chat</span>
      </button>

      {/* Center FAB Container */}
      <div className="relative w-16 h-16 flex justify-center -top-6">
        <button onClick={() => router.push('/voice')} className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-[#F5A623] to-[#D4891A] text-pure-white flex items-center justify-center shadow-[0_0_30px_rgba(245,166,35,0.4)] scale-110 transition-transform active:scale-95 border-4 border-[#FAFAF5]">
          <span className="material-symbols-outlined text-[32px]">mic</span>
        </button>
      </div>

      {/* Candidates */}
      <button onClick={() => router.push('/candidates')} className={cn("flex flex-col items-center justify-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 w-16", pathname === '/candidates' ? "text-stone-900 dark:text-amber-500" : "text-stone-400 dark:text-stone-500")}>
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: pathname === '/candidates' ? "'FILL' 1" : "'FILL' 0" }}>groups</span>
        <span className="font-['Epilogue'] text-[11px] font-semibold uppercase tracking-wider">Candidates</span>
      </button>

      {/* Rights */}
      <button onClick={() => router.push('/rights')} className={cn("flex flex-col items-center justify-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 w-16", pathname === '/rights' ? "text-stone-900 dark:text-amber-500" : "text-stone-400 dark:text-stone-500")}>
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: pathname === '/rights' ? "'FILL' 1" : "'FILL' 0" }}>gavel</span>
        <span className="font-['Epilogue'] text-[11px] font-semibold uppercase tracking-wider">Rights</span>
      </button>
    </nav>
  );
}
