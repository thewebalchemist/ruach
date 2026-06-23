import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  { title: 'Welcome to Ruach Admin', description: 'This is your church management dashboard. Here you can manage members, crosspoints, programs, and more.', position: 'center' },
  { title: 'Members', description: 'View, add, and manage all church members. Import members from CSV or create staff accounts.', position: 'center' },
  { title: 'Crosspoints', description: 'Manage home church groups. Create crosspoints, assign leaders, and handle transfer requests.', position: 'center' },
  { title: 'Programs', description: 'Manage Connect Class and Discipleship programs. Create cohorts, assign teachers, and track student progress.', position: 'center' },
  { title: 'Quick Actions', description: 'Use the sidebar to navigate between sections. You can also access the Control Panel for sermons and streaming.', position: 'center' },
];

export function IntroGuide() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('ruach-admin-intro-seen');
    if (!seen) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('ruach-admin-intro-seen', 'true');
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[#12151C] border border-white/[0.06] rounded-2xl p-6 max-w-md w-full shadow-2xl">
        {/* Progress dots */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === step ? 'w-6 bg-[#BF0A30]' : 'w-2 bg-white/20'}`} />
            ))}
          </div>
          <button onClick={dismiss} className="text-white/40 hover:text-white p-1"><X className="w-4 h-4" /></button>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-6">{current.description}</p>

        <div className="flex items-center justify-between">
          <button onClick={dismiss} className="text-xs text-white/40 hover:text-white/60">Skip tour</button>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 px-3 py-2 border border-white/10 rounded-xl text-xs text-white/70 hover:bg-white/[0.06]">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            )}
            <button onClick={isLast ? dismiss : () => setStep(s => s + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-[#BF0A30] hover:bg-[#9A0826] rounded-xl text-xs text-white font-medium">
              {isLast ? 'Get Started' : 'Next'} {!isLast && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
