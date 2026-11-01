import React, { useState } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  CheckCircle2, 
  X, 
  Clock, 
  ShieldAlert, 
  AlertTriangle,
  Siren,
  HeartHandshake
} from 'lucide-react';
import { sanadService } from '../../services/sanadService';
import { EmergencyAlert } from '../../types/sanad';

interface EmergencySosButtonProps {
  onAlertTriggered: () => void;
}

export const EmergencySosButton: React.FC<EmergencySosButtonProps> = ({ onAlertTriggered }) => {
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [emergencyType, setEmergencyType] = useState<'medical_urgent' | 'fall_or_injury' | 'unresponsive' | 'other'>('medical_urgent');
  const [note, setNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolveError, setResolveError] = useState<string | null>(null);

  const activeAlert = sanadService.getActiveEmergencyAlert();
  const recipient = sanadService.getRecipient();
  const members = sanadService.getMembers();

  const handleTrigger = () => {
    sanadService.triggerEmergencyAlert({
      emergencyType,
      note: note.trim() || null,
    });
    setShowTriggerModal(false);
    setNote('');
    onAlertTriggered();
  };

  const handleResolve = () => {
    setResolveError(null);
    if (!resolutionNote.trim()) {
      setResolveError('يرجى توثيق الإجراء المتخذ لإنهاء الطارئ في سجل التدقيق');
      return;
    }

    if (activeAlert) {
      const res = sanadService.resolveEmergencyAlert({
        alertId: activeAlert.id,
        resolutionNote: resolutionNote.trim(),
      });
      if (res.success) {
        setShowResolveModal(false);
        setResolutionNote('');
        onAlertTriggered();
      } else {
        setResolveError(res.error || 'تعذر إنهاء التنبيه');
      }
    }
  };

  return (
    <>
      {/* Active Emergency Banner (Shows across all screens when SOS is active) */}
      {activeAlert && (
        <div className="bg-red-700 text-white px-4 py-3 shadow-lg border-b-2 border-red-900 animate-in fade-in sticky top-0 z-40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-800 border-2 border-white/60 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Siren className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm md:text-base tracking-wide">
                    🚨 نداء طوارئ عاجل نشط ({sanadService.getEmergencyTypeLabel(activeAlert.emergency_type)})
                  </span>
                  <span className="bg-red-900/80 px-2 py-0.5 rounded text-[11px] font-mono">
                    {new Date(activeAlert.triggered_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5 leading-relaxed">
                  أطلقه: <strong>{activeAlert.triggered_by_name}</strong> لرعاية <strong>{recipient.preferred_name}</strong>.
                  {activeAlert.note && <span> — الملاحظة: «{activeAlert.note}»</span>}
                </p>
              </div>
            </div>

            {/* Quick Emergency Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="tel:123"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-700 font-bold text-xs rounded-[8px] hover:bg-red-50 transition min-h-[38px] shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>الاتصال بالإسعاف (123)</span>
              </a>

              <button
                onClick={() => setShowResolveModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-900 hover:bg-red-950 text-white font-bold text-xs rounded-[8px] border border-red-500/50 transition min-h-[38px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>إنهاء وتوثيق الإجراء المتخذ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Button Trigger (Compact in Header, High Visibility) */}
      {!activeAlert ? (
        <button
          onClick={() => setShowTriggerModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-[10px] text-xs font-bold transition shadow-xs min-h-[40px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          title="إرسال تنبيه طوارئ عاجل لجميع أفراد الدائرة"
        >
          <AlertOctagon className="w-4 h-4 ml-0.5 animate-pulse" />
          <span>طوارئ SOS</span>
        </button>
      ) : (
        <button
          onClick={() => setShowResolveModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 border border-red-300 rounded-[10px] text-xs font-bold transition min-h-[40px]"
        >
          <Siren className="w-4 h-4 text-red-600 animate-spin" />
          <span>طوارئ نشطة 🚨</span>
        </button>
      )}

      {/* Trigger SOS Modal */}
      {showTriggerModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-red-500">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertOctagon className="w-6 h-6 flex-shrink-0 animate-bounce" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">إطلاق نداء طوارئ فوري (SOS)</h3>
                  <span className="text-xs text-red-600 font-medium">سيتم إشعار جميع أفراد الدائرة ({members.length} أفراد) حالاً</span>
                </div>
              </div>
              <button
                onClick={() => setShowTriggerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              هذا التنبيه مخصص للحالات العاجلة فقط المتعلقة بـ <strong>{recipient.preferred_name}</strong>. سيتم تسجيل التوقيت الدقيق وهوية المطلق في سجل التدقيق الإداري.
            </p>

            {/* Emergency Type Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">نوع الحالة الطارئة:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'medical_urgent', label: 'طوارئ صحية حادة (ألم/تنفس)' },
                  { id: 'fall_or_injury', label: 'سقوط أو إصابة منزلية' },
                  { id: 'unresponsive', label: 'فقدان وعي أو هبوط حاد' },
                  { id: 'other', label: 'طارئ عام آخر يحتاج تجمعاً' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEmergencyType(item.id as any)}
                    className={`p-2.5 rounded-[10px] border text-xs font-semibold text-right transition
                      ${emergencyType === item.id 
                        ? 'bg-red-50 border-red-500 text-red-900 shadow-xs' 
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">تفاصيل سريعة للموقف (اختياري):</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="مثال: الضغط مرتفع جداً والوالدة تشعر بدوار، أو برجاء الحضور فوراً..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowTriggerModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px] min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleTrigger}
                className="px-6 py-2 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-[10px] min-h-[44px] transition shadow-md flex items-center gap-2"
              >
                <Siren className="w-4 h-4 ml-1" />
                <span>إرسال تنبيه الطوارئ الفوري لجميع الأفراد 🚨</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Emergency Modal */}
      {showResolveModal && activeAlert && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="border-b pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <HeartHandshake className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-base font-bold text-slate-900">إنهاء وتوثيق حالة الطوارئ</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                تأكيد انتهاء الخطر وتوثيق الإجراء المتخذ لحفظه في سجل التدقيق الإداري.
              </p>
            </div>

            {resolveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{resolveError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px] text-xs space-y-1">
              <div className="flex justify-between text-slate-500 font-mono">
                <span>توقيت الإطلاق:</span>
                <span>{new Date(activeAlert.triggered_at).toLocaleString('ar-EG')}</span>
              </div>
              <div className="flex justify-between text-slate-800">
                <span>المطلق:</span>
                <strong>{activeAlert.triggered_by_name}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                الإجراء المتخذ للتعامل مع الحالة: <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="مثال: تم الاتصال بالطبيب المعالج وإعطاء جرعة مخفضة للضغط واستقرت الحالة تماماً..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px]"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleResolve}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] transition shadow-xs"
              >
                توثيق وإنهاء الطارئ رسمياً ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
