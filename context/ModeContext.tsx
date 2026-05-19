// context/ModeContext.tsx
// Global demo/live mode toggle — persisted in localStorage

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PlatformMode = 'demo' | 'live';

interface ModeContextValue {
  mode:        PlatformMode;
  isDemoMode:  boolean;
  setMode:     (m: PlatformMode) => void;
  toggleMode:  () => void;
}

const ModeContext = createContext<ModeContextValue>({
  mode:       'demo',
  isDemoMode: true,
  setMode:    () => {},
  toggleMode: () => {},
});

const STORAGE_KEY = 'ruach_platform_mode';

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PlatformMode>('demo');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'live' || saved === 'demo') setModeState(saved);
  }, []);

  function setMode(m: PlatformMode) {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
  }

  function toggleMode() {
    setMode(mode === 'demo' ? 'live' : 'demo');
  }

  return (
    <ModeContext.Provider value={{ mode, isDemoMode: mode === 'demo', setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}

// Utility for pages that haven't been converted to context yet
export function getModeFromStorage(): PlatformMode {
  if (typeof window === 'undefined') return 'demo';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'live' ? 'live' : 'demo';
}

export function isDemoModeActive(): boolean {
  return getModeFromStorage() === 'demo';
}
