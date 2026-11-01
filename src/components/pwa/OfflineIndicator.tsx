import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-80 z-50 flex items-center gap-2.5 rounded-[12px] bg-slate-900 text-white p-3 shadow-xl border border-slate-700 text-xs">
      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div>
        <p className="font-bold text-slate-100">أنت تعمل بدون اتصال بالإنترنت</p>
        <p className="text-[11px] text-slate-400">سند يحفظ بياناتك مؤقتاً وسيتم المزامنة عند عودة الاتصال.</p>
      </div>
    </div>
  );
};
