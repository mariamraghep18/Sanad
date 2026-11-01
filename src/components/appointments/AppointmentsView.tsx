import React, { useState } from 'react';
import { 
  Stethoscope, 
  MapPin, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  ShieldCheck, 
  Info,
  Car
} from 'lucide-react';
import { sanadService } from '../../services/sanadService';
import { Appointment, MedicationInstruction } from '../../types/sanad';

export const AppointmentsView: React.FC = () => {
  const appointments = sanadService.getAppointments();
  const instructions = sanadService.getMedicationInstructions();
  const canSeeHealth = sanadService.canView('health');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
          المواعيد والتعليمات المرجعية
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          تنسيق زيارات العيادات واستشارات الأطباء، مع توثيق التعليمات الصادرة للاسترشاد البشري فقط.
        </p>
      </div>

      {/* Strict Medical Disclaimer Callout */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-[14px] text-xs text-amber-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">إخلاء مسؤولية طبي صارم (Non-Clinical Guarantee):</span>
          <p className="leading-relaxed text-amber-900">
            سند لا يقدم أي إرشاد علاجي (Dose Guidance) ولا يبتكر جداول أدوية بالذكاء الاصطناعي. جميع النصوص المدونة هنا هي <em>مراجع بشرية استرشادية</em> نقلها أفراد الأسرة من روشتات معتمدة، ويجب دائماً الرجوع للطبيب المعالج أو الصيدلي في أي قرار دوائي.
          </p>
        </div>
      </div>

      {/* Health Access Barrier if Restricted */}
      {!canSeeHealth && (
        <div className="bg-white rounded-[16px] border border-amber-200 p-6 shadow-xs text-center space-y-2">
          <Lock className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">التعليمات الدوائية محجوبة عن حسابك</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            بموجب سياسات الخصوصية في سند، يتطلب عرض التعليمات الطبية والروشتات امتلاك تصريح <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">can_view_health_data</code> وموافقة سارية من المستفيد.
          </p>
        </div>
      )}

      {/* Appointments Section */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">مواعيد العيادات والاستشارات المخططة</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{appointments.length} مواعيد</span>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">لا توجد مواعيد عيادات مسجلة حالياً.</p>
          ) : (
            appointments.map(apt => (
              <div key={apt.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-[12px] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{apt.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {apt.status === 'confirmed' ? 'موعد مؤكد' : 'مخطط له'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(apt.starts_at).toLocaleDateString('ar-EG')}</span>
                    <span>• {new Date(apt.starts_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>

                  {apt.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{apt.location}</span>
                    </span>
                  )}
                </div>

                {apt.notes && (
                  <p className="text-xs text-slate-500 bg-white p-2.5 rounded-[8px] border border-slate-200 mt-2">
                    <strong>تجهيزات مطلوبة:</strong> {apt.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reference Medication Instructions (Only if Health Access Permitted) */}
      {canSeeHealth && (
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-base text-slate-900">التعليمات الدوائية المعتمدة أسرياً (Human Reference Only)</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{instructions.length} تعليمات</span>
          </div>

          <div className="space-y-3">
            {instructions.map(ins => (
              <div key={ins.id} className="p-4 bg-teal-50/40 border border-teal-200 rounded-[12px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900">
                    المصدر: {ins.source_label || 'روشتة الطبيب'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                    تم التأكيد بشرياً ✓
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">{ins.instruction_text}</p>
                <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-teal-100 pt-2">
                  <span>أُدخلت بواسطة أفراد الأسرة</span>
                  <span>تاريخ المراجعة: {ins.confirmed_at ? new Date(ins.confirmed_at).toLocaleDateString('ar-EG') : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
