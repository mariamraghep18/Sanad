import React from 'react';
import { Settings, ShieldCheck, Globe, DollarSign, Clock, AlertTriangle, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">إعدادات مساحة العمل والسياسات</h1>
        <p className="text-sm text-[#64748B] mt-1">
          إعدادات السوق، العملة، وسياسات الاحتفاظ بالبيانات وفقاً لمحددات منصة بَيْعة.
        </p>
      </div>

      {/* Market Configuration Card */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe className="w-5 h-5 text-[#6D5EF5]" />
          <span>تكوين السوق والعملة (Market Configuration)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[10px] space-y-1">
            <span className="text-slate-500 font-semibold block">الدولة الافتراضية:</span>
            <span className="text-sm font-bold text-slate-900 block">جمهورية مصر العربية (مصر)</span>
            <span className="text-[11px] text-slate-400">مؤكدة صراحة ولا يتم تخمينها بواسطة النموذج.</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[10px] space-y-1">
            <span className="text-slate-500 font-semibold block">العملة والوحدة الحسابية:</span>
            <span className="text-sm font-bold text-slate-900 block font-mono">EGP (جنيه مصري)</span>
            <span className="text-[11px] text-slate-400">تُخزن كأعداد صحيحة بالقروش (Minor Units) بدون كسور عائمة.</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-[10px] space-y-1">
            <span className="text-slate-500 font-semibold block">النطاق الزمني للمتجر:</span>
            <span className="text-sm font-bold text-slate-900 block font-mono">Africa/Cairo</span>
            <span className="text-[11px] text-slate-400">تُخزن التواريخ في قاعدة البيانات بتوقيت UTC وتُعرض بتوقيت القاهرة.</span>
          </div>
        </div>
      </div>

      {/* Safety & Retention Policy Card */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>سياسة الخصوصية وتدقيق البيانات (Core Safety Rules)</span>
        </h2>

        <ul className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-[#6D5EF5] font-bold">1.</span>
            <span><strong>اقتراح وليس اعتماد:</strong> مخرجات الذكاء الاصطناعي هي اقتراح أولي فقط، ولا تتحول إلى طلب رسمي دون اعتماد صريح من التاجر.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6D5EF5] font-bold">2.</span>
            <span><strong>القيم المفقودة تظل Null:</strong> لا يتم اختراع أرقام هواتف أو أسماء عملاء أو أسعار غير مذكورة في الرسالة الأصلية.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6D5EF5] font-bold">3.</span>
            <span><strong>حظر تعدد الطلبات:</strong> في حال رصد أكثر من عنوان أو مستلم في نفس الرسالة يتم إيقاف المعالجة الآلية وتوجيه التاجر للتقسيم اليدوي.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6D5EF5] font-bold">4.</span>
            <span><strong>حذف المصادر والتذكارات (Retention & Tombstones):</strong> عند طلب حذف الرسالة المصدرية، يتم شطب الأدلة والنص الأصلي مع الاحتفاظ بلقطة الطلب المعتمد التاريخي (Snapshot).</span>
          </li>
        </ul>
      </div>

      {/* Platform & Delivery Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-[16px] p-5 space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>توضيح بيئة التشغيل والمرحلة الحالية (Phase 1):</span>
        </div>
        <p className="leading-relaxed">
          وفقاً لتعليمات البرومبت الرئيسي: يتم الآن تشغيل المرحلة الأولى (واجهة وتجربة فعلية بالـ demo مع مزوّد محاكاة حتمي Deterministic Demo Provider). البيئة الحالية مبنية على React 19 + TypeScript + Vite + Tailwind CSS v4، وقد تم تصميم المعمارية بنظام طبقات نمطي (Modular Service Layer) معزول تماماً ليتوافق مع التحولات اللاحقة.
        </p>
      </div>
    </div>
  );
};
