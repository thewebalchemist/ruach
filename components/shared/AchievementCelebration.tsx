import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Trophy, Star, Flame, GraduationCap, Home, Video, BookOpen, ClipboardCheck, Footprints, HandMetal } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Achievement {
  slug:        string;
  title:       string;
  description: string;
  icon:        string;
  points:      number;
}

interface CelebrationContextValue {
  celebrate: (achievement: Achievement) => void;
}

// ── Context ────────────────────────────────────────────────────────────────────
const CelebrationContext = createContext<CelebrationContextValue>({ celebrate: () => {} });

export function useCelebration() {
  return useContext(CelebrationContext);
}

// ── Icon map (lucide icon name → component) ────────────────────────────────────
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy, Star, Flame, GraduationCap, Home, Video, BookOpen,
  ClipboardCheck, Footprints, HandMetal,
};

function AchievementIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Trophy;
  return <Icon className={className} />;
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function AchievementCelebrationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Achievement | null>(null);
  const [visible, setVisible]  = useState(false);

  const celebrate = useCallback((achievement: Achievement) => {
    setCurrent(achievement);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      {visible && current && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          style={{ animation: 'fadeInOut 4.5s ease forwards' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={() => setVisible(false)} />

          {/* Card */}
          <div
            className="relative z-10 flex flex-col items-center gap-4 px-10 py-8 rounded-3xl pointer-events-auto"
            style={{
              background: 'linear-gradient(135deg, #1a1d25 0%, #0d0f14 100%)',
              border: '1px solid rgba(191,10,48,0.4)',
              boxShadow: '0 0 60px rgba(191,10,48,0.3), 0 20px 60px rgba(0,0,0,0.8)',
              animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
              maxWidth: 320,
            }}
          >
            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i % 3 === 0 ? '#BF0A30' : i % 3 === 1 ? '#FFD700' : '#fff',
                    left:       `${Math.random() * 100}%`,
                    top:        `${Math.random() * 100}%`,
                    animation:  `particle ${0.8 + Math.random() * 1.2}s ease-out ${Math.random() * 0.5}s forwards`,
                    opacity:    0,
                  }}
                />
              ))}
            </div>

            {/* Icon ring */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(191,10,48,0.15)',
                border: '2px solid rgba(191,10,48,0.5)',
                animation: 'pulse 1.5s ease infinite',
              }}
            >
              <AchievementIcon name={current.icon} className="w-9 h-9 text-[#BF0A30]" />
            </div>

            {/* Label */}
            <div
              className="text-[#BF0A30] text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Achievement Unlocked
            </div>

            {/* Title */}
            <h2
              className="text-white text-2xl font-black text-center leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {current.title}
            </h2>

            {/* Description */}
            <p className="text-white/55 text-sm text-center leading-relaxed">
              {current.description}
            </p>

            {/* Points badge */}
            <div
              className="flex items-center gap-1.5 px-4 py-2 rounded-full"
              style={{ background: 'rgba(191,10,48,0.2)', border: '1px solid rgba(191,10,48,0.35)' }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-black text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                +{current.points} pts
              </span>
            </div>

            {/* Dismiss hint */}
            <p className="text-white/20 text-[10px]">Tap anywhere to dismiss</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInOut {
          0%   { opacity: 0; }
          10%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes particle {
          0%   { opacity: 1; transform: translate(0,0) scale(1); }
          100% { opacity: 0; transform: translate(var(--dx,20px), var(--dy,-40px)) scale(0); }
        }
      `}</style>
    </CelebrationContext.Provider>
  );
}
