import React from 'react';
import { Home, LayoutGrid, Clock, Settings } from 'lucide-react';
import { playTacticalSound } from '../utils/audioEffects';
import { triggerHaptic } from '../utils/haptics';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'asistan', name: 'Asistan', icon: Home },
    { id: 'guvenlik', name: 'Güvenlik', icon: LayoutGrid },
    { id: 'gecmis', name: 'Geçmiş', icon: Clock },
    { id: 'ayarlar', name: 'Ayarlar', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    playTacticalSound('click');
    triggerHaptic('click');
    onTabChange(id);
  };

  return (
    <div className="h-16 bg-black border-t border-gray-900 flex items-center justify-around z-50 shrink-0 px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className="relative flex-1 flex flex-col items-center justify-center h-full py-1 group transition"
          >
            {/* Top Indicator Line (matching screenshot) */}
            {isActive && (
              <span className="absolute top-0 left-4 right-4 h-0.5 bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] rounded-full" />
            )}

            <Icon
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                isActive ? 'text-[#38bdf8]' : 'text-gray-400 group-hover:text-gray-200'
              }`}
            />
            <span
              className={`text-[10px] font-medium mt-1 tracking-wider ${
                isActive ? 'text-[#38bdf8] font-bold' : 'text-gray-400 group-hover:text-gray-200'
              }`}
            >
              {tab.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
