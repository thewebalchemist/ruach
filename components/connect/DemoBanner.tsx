// components/DemoBanner.tsx
// Subtle persistent banner shown in demo mode so users always know their context

import { useMode } from '@/context/ModeContext';

export function DemoBanner() {
  const { isDemoMode, setMode } = useMode();
  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-4 py-2.5 bg-[#1A1A1A]/95 dark:bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white text-xs font-semibold select-none">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
      <span className="text-white/70">Demo Mode — all data is simulated</span>
      <button
        onClick={() => setMode('live')}
        className="ml-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors text-xs font-bold"
      >
        Switch to Live
      </button>
    </div>
  );
}
