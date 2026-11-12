import React from 'react';
import { Home, Shield, History, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'asistan', name: 'Asistan', icon: Home },
    { id: 'guvenlik', name: 'Güvenlik', icon: Shield },
    { id: 'gecmis', name: 'Geçmiş', icon: History },
    { id: 'ayarlar', name: 'Ayarlar', icon: Settings },
  ];

  return (
    <div className="h-16 bg-black border-t border-blue-900/30 flex items-center justify-around z-50 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 ${isActive ? 'text-white' : 'text-gray-500'}`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'text-blue-500' : ''}`} />
            <span className="text-[10px] font-medium">{tab.name}</span>
          </button>
        );
      })}
    </div>
  );
};
