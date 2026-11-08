import React, { useEffect, useState } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[200] flex items-center gap-3 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
      <div className="p-2 bg-white/20 rounded-lg">
        <WifiOff className="w-5 h-5 text-white animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="leading-tight">Çevrimdışı Mod</span>
        <span className="text-[10px] opacity-80 font-medium">Önbelleğe alınan veriler kullanılıyor</span>
      </div>
    </div>
  );
};
