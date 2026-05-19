import { BookMarked, Calendar, PlaySquare, StickyNote } from 'lucide-react';
import { TabType } from '@/types';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function NavigationTabs({
  activeTab,
  onTabChange,
}: NavigationTabsProps) {
  const tabs = [
    { id: 'services' as TabType, label: 'Past Services', icon: PlaySquare },
    { id: 'schedule' as TabType, label: 'Schedule', icon: Calendar },
    { id: 'notes' as TabType, label: 'Notes', icon: StickyNote },
    { id: 'bible' as TabType, label: 'Bible', icon: BookMarked },
  ];

  return (
    <nav className="lg:relative fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-40 lg:z-auto shadow-2xl lg:shadow-none">
      <div className="lg:container lg:mx-auto px-4 lg:px-2">
        <div className="grid grid-cols-4 gap-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-2 rounded-[1.5rem] transition-all ${
                  isActive
                    ? 'bg-[#BF0A30] text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}