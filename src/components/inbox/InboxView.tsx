import React from 'react';
import { Bell, CheckCircle2, ShieldCheck, Lock, Smartphone, Clock } from 'lucide-react';
import { sanadService } from '../../services/sanadService';

interface InboxViewProps {
  onDataChanged: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({ onDataChanged }) => {
  const notifications = sanadService.getNotifications();
  const activeMember = sanadService.getActiveMember();

  const handleMarkRead = (id: string) => {
    sanadService.markNotificationAsRead(id);
    onDataChanged();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
          صندوق الوارد والتنبيهات
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          التنبيهات المخصصة لك، مع الحفاظ على الخصوصية عند العرض على شاشة القفل.
        </p>
      </div>

      {/* Lock Screen Privacy Guarantee Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-[14px] text-xs text-slate-700 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block">ضمان خصوصية شاشة القفل (Lock Screen Privacy Rule):</span>
          <p className="leading-relaxed">
            وفقاً للمعايير الكانونية في سند: أي إشعار يخرج للجهاز أو شاشة القفل يكون بنص عام فقط مثل <em>«لديك متابعة جديدة في سند»</em>، ولا يظهر أبداً اسم المستفيد أو اسم الدواء على شاشة القفل منعاً لتسرب الخصوصية.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] divide-y divide-slate-100 shadow-xs overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p>صندوق الوارد فارغ حالياً.</p>
          </div>
        ) : (
          notifications.map(notif => {
            const isUnread = !notif.read_at;

            return (
              <div
                key={notif.id}
                className={`p-4 md:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3
                  ${notif.kind === 'emergency' 
                    ? 'bg-red-50/80 border-r-4 border-red-600 shadow-xs' 
                    : isUnread ? 'bg-indigo-50/30' : 'bg-white'}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${notif.kind === 'emergency' ? 'bg-red-600 animate-ping' : 'bg-indigo-600'}`} />
                    )}
                    <h4 className={`font-bold text-sm ${notif.kind === 'emergency' ? 'text-red-950 text-base' : 'text-slate-900'}`}>
                      {notif.title}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold
                      ${notif.kind === 'emergency' ? 'bg-red-200 text-red-900' : 'bg-slate-100 text-slate-600'}`}>
                      {notif.kind === 'emergency' ? 'طارئ عاجل' : notif.visibility === 'health' ? 'صحي' : 'عام'}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${notif.kind === 'emergency' ? 'text-red-900 font-semibold' : 'text-slate-600'}`}>
                    {notif.body}
                  </p>
                  
                  {/* Lock Screen Preview Comparison */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>النص على شاشة القفل: «{notif.generic_lock_screen_text}»</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-[8px] transition"
                    >
                      تحديد كمقروء
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
