import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet, 
  CheckCircle2, 
  Lock,
  Eye,
  Key
} from 'lucide-react';
import { sanadService } from '../../services/sanadService';
import { AuditEvent } from '../../types/sanad';

export const AuditView: React.FC = () => {
  const auditEvents = sanadService.getAuditEvents();
  const isAdmin = sanadService.isAdmin();
  const canExport = sanadService.canExport();

  const [showExportModal, setShowExportModal] = useState(false);
  const [includeHealth, setIncludeHealth] = useState(true);
  const [exportConfirmed, setExportConfirmed] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-[16px] border border-slate-200 p-12 text-center space-y-2 max-w-md mx-auto">
        <Lock className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="font-bold text-sm text-slate-800">هذه الشاشة مقصورة على مديري الدائرة (Admin)</h3>
        <p className="text-xs text-slate-500">
          سجل الأحداث والتدقيق الإداري يتطلب دور Admin للمراجعة والحوكمة.
        </p>
      </div>
    );
  }

  const handleDownloadExport = () => {
    // Generate text/csv care summary
    const occurrences = sanadService.getOccurrences();
    const headers = ['رقم المهمة', 'التاريخ والوقت', 'عنوان المتابعة', 'التصنيف', 'الحالة', 'النتيجة', 'المسؤول'];
    const rows = occurrences.map(o => [
      o.id,
      new Date(o.scheduled_at).toLocaleString('ar-EG'),
      `"${o.title_snapshot.replace(/"/g, '""')}"`,
      o.category,
      o.status,
      o.current_record ? o.current_record.result : 'غير مسجل',
      o.current_assignment?.assignee_profile?.display_name || 'غير محدد'
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sanad_care_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setShowExportModal(false);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
            سجل التدقيق والحوكمة والتصدير
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل غير قابل للتعديل لكافة الإجراءات والعمليات المنفذة في الدائرة دون تخزين نصوص صحية حساسة.
          </p>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[10px] text-xs font-bold transition shadow-xs min-h-[44px]"
        >
          <Download className="w-4 h-4 ml-1" />
          <span>تصدير ملخص الرعاية (Export)</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[12px] text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>تم تنزيل ملف التصدير بنجاح. تذكير: احرص على حفظ الملف في مكان آمن.</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-sm text-slate-900">سجل عمليات الدائرة (Audit Events)</span>
          </div>
          <span className="text-xs font-mono text-slate-400">{auditEvents.length} أحداث مسجلة</span>
        </div>

        <div className="divide-y divide-slate-100">
          {auditEvents.map(evt => {
            const isEmergencyTrigger = evt.action === 'emergency_sos_triggered';
            const isEmergencyResolve = evt.action === 'emergency_sos_resolved';
            const isVitalSync = evt.action === 'vital_signs_device_synced';
            const isDevicePaired = evt.action === 'vital_device_paired';
            const isWeeklyReport = evt.action === 'weekly_health_report_generated';

            return (
              <div 
                key={evt.id} 
                className={`p-4 text-xs space-y-1.5 transition
                  ${isEmergencyTrigger ? 'bg-red-50/70 border-r-4 border-red-600' :
                    isEmergencyResolve ? 'bg-emerald-50/70 border-r-4 border-emerald-600' :
                    isWeeklyReport ? 'bg-purple-50/50 border-r-4 border-purple-500 hover:bg-purple-50/80' :
                    isVitalSync ? 'bg-teal-50/50 border-r-4 border-teal-500 hover:bg-teal-50/80' :
                    isDevicePaired ? 'bg-indigo-50/50 border-r-4 border-indigo-500' : 'hover:bg-slate-50/60'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${isEmergencyTrigger ? 'text-red-900 text-sm' : isEmergencyResolve ? 'text-emerald-900 text-sm' : isWeeklyReport ? 'text-purple-900 text-sm' : isVitalSync ? 'text-teal-900 text-sm' : 'text-slate-900'}`}>
                      {isEmergencyTrigger ? '🚨 إطلاق نداء طوارئ فوري (SOS Triggered)' :
                       isEmergencyResolve ? '✓ إنهاء وتوثيق حالة الطوارئ (SOS Resolved)' :
                       isWeeklyReport ? '📊 توليد التقرير الصحي الأسبوعي (Weekly Health Report)' :
                       isVitalSync ? '🔄 مزامنة جهاز مؤشرات حيوية (Vital Telemetry Synced)' :
                       isDevicePaired ? '📡 إقران جهاز مراقبة جديد (Device Paired)' : evt.action}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold
                      ${isEmergencyTrigger ? 'bg-red-200 text-red-900' :
                        isEmergencyResolve ? 'bg-emerald-200 text-emerald-900' :
                        isWeeklyReport ? 'bg-purple-100 text-purple-800' :
                        isVitalSync ? 'bg-teal-100 text-teal-800' :
                        isDevicePaired ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                      {evt.entity_type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(evt.created_at).toLocaleString('ar-EG')}
                  </span>
                </div>

              <div className="text-slate-600 flex items-center gap-2">
                <span>المنفذ: <strong>{evt.actor_name || 'النظام'}</strong></span>
                <span>•</span>
                <span className="font-mono text-slate-400">Request: {evt.request_id}</span>
              </div>

              {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                <div className="bg-slate-50 p-2 rounded-[6px] border border-slate-200 text-[11px] font-mono text-slate-700 overflow-x-auto">
                  {JSON.stringify(evt.metadata)}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Export Confirmation Modal with Physical Device Warning */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">تصدير ملخص الرعاية (Care Summary Export)</h3>
              <p className="text-xs text-slate-500 mt-1">تنزيل نسخة بيانات مجدولة للمراجعة الأسرية أو الطبية</p>
            </div>

            {/* Mandatory Warning as per Specification */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-[12px] text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>تحذير أمني وقانوني ملزم (Irrevocable Download Warning):</span>
              </div>
              <p className="leading-relaxed">
                بمجرد تنزيل هذا الملف على جهازك الفعلي، <strong>لا يمكن للتطبيق أو الدائرة سحب هذه النسخة تقنياً</strong> حتى لو سحب المستفيد موافقته لاحقاً. يجب الحفاظ على سرية الملف وعدم مشاركته في قنوات غير آمنة.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!canExport}
                  checked={includeHealth}
                  onChange={(e) => setIncludeHealth(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="font-semibold text-slate-800">
                  تضمين متابعات الأدوية والبيانات الصحية {(!canExport) && '(غير مصرح لك)'}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-[8px] border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportConfirmed}
                  onChange={(e) => setExportConfirmed(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="font-bold text-slate-900">
                  أقر بأنني اطلعت على التحذير وأتحمل مسؤولية تأمين النسخة المحملة
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!exportConfirmed}
                onClick={handleDownloadExport}
                className="px-6 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-[8px] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تنزيل الملف (CSV)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
