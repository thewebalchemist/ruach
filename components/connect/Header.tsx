import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 sm:px-6 border-b border-white/[0.06] bg-[#0A0C10]/95 backdrop-blur-md">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-white/50 hover:text-white">
        <Menu className="w-5 h-5" />
      </button>
      <h1 className="text-sm font-bold text-white/80 tracking-wide uppercase">{title}</h1>
      <div className="flex-1" />
      <button className="relative p-2 text-white/40 hover:text-white transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BF0A30] rounded-full" />
      </button>
    </header>
  );
}
