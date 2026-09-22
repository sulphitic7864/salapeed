import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
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

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-50 flex items-center gap-2 rounded-lg bg-amber-500/95 text-black px-3.5 py-2 text-xs font-semibold shadow-xl border border-amber-300">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode active — browsing cached Salapeed catalogue.</span>
    </div>
  );
};
