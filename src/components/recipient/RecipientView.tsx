import React, { useState } from 'react';
import { 
  Heart, 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Lock, 
  CheckCircle2, 
  Activity,
  Bluetooth,
  Battery,
  RefreshCw,
  Plus,
  Radio,
  Sparkles,
  Droplet,
  HeartPulse,
  Info,
  ChevronRight,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { sanadService } from '../../services/sanadService';
import { CircleMember, ConnectedDevice, VitalSignReading } from '../../types/sanad';
import { WeeklyHealthReportView } from './WeeklyHealthReportView';

interface RecipientViewProps {
  onDataChanged: () => void;
}

export const RecipientView: React.FC<RecipientViewProps> = ({ onDataChanged }) => {
  const circle = sanadService.getCircle();
  const recipient = sanadService.getRecipient();
  const authorizations = sanadService.getAuthorizations();
  const members = sanadService.getMembers();
  const isAdmin = sanadService.isAdmin();
  const canViewHealth = sanadService.canView('health');

  const devices = sanadService.getConnectedDevices();
  const vitalReadings = sanadService.getVitalSignReadings();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [savingMessage, setSavingMessage] = useState<string | null>(null);
  const [healthSectionTab, setHealthSectionTab] = useState<'report' | 'devices'>('report');

  // Device sync & pairing state
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);
  const [showPairModal, setShowPairModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceModel, setNewDeviceModel] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'blood_pressure' | 'glucose_meter' | 'pulse_oximeter'>('blood_pressure');
  const [newDeviceSerial, setNewDeviceSerial] = useState('');

  const handleWithdraw = () => {
    if (!withdrawReason.trim()) {
      alert('يرجى كتابة سبب سحب الموافقة');
      return;
    }
    sanadService.withdrawRecipientProcessing(withdrawReason);
    setShowWithdrawModal(false);
    setWithdrawReason('');
    setSavingMessage('تم سحب موافقة المستفيد وتجميد وصول البيانات الصحية فوراً لجميع الأفراد');
    setTimeout(() => setSavingMessage(null), 4000);
    onDataChanged();
  };

  const handleRestore = () => {
    sanadService.restoreRecipientProcessing();
    setSavingMessage('تم استعادة معالجة البيانات الصحية للدائرة وتحديث جيل التفويض');
    setTimeout(() => setSavingMessage(null), 4000);
    onDataChanged();
  };

  const handleToggleMemberHealth = (member: CircleMember) => {
    if (!isAdmin) return;
    const res = sanadService.updateMemberFlags(member.id, !member.can_view_health_data, member.can_export);
    if (res.success) {
      onDataChanged();
    }
  };

  const handleToggleMemberExport = (member: CircleMember) => {
    if (!isAdmin) return;
    const res = sanadService.updateMemberFlags(member.id, member.can_view_health_data, !member.can_export);
    if (res.success) {
      onDataChanged();
    }
  };

  const handleSyncDevice = (deviceId: string) => {
    setSyncingDeviceId(deviceId);
    setTimeout(() => {
      const res = sanadService.syncDeviceReadings(deviceId);
      setSyncingDeviceId(null);
      if (res.success && res.reading) {
        const typeName = res.reading.type === 'blood_pressure' ? 'ضغط الدم' :
                         res.reading.type === 'blood_glucose' ? 'سكر الدم' : 'تشبع الأكسجين والنبض';
        setSavingMessage(`تمت مزامنة قراءة (${typeName}) بنجاح وتوثيقها في سجل التدقيق بنظام التشفير.`);
        setTimeout(() => setSavingMessage(null), 4000);
        onDataChanged();
      } else {
        alert(res.error || 'فشلت المزامنة من الجهاز');
      }
    }, 600);
  };

  const handlePairDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName || !newDeviceModel || !newDeviceSerial) {
      alert('يرجى ملء كافة بيانات الجهاز');
      return;
    }
    const res = sanadService.connectNewDevice({
      name: newDeviceName,
      model: newDeviceModel,
      type: newDeviceType,
      serial_number: newDeviceSerial,
    });
    if (res.success) {
      setShowPairModal(false);
      setNewDeviceName('');
      setNewDeviceModel('');
      setNewDeviceSerial('');
      setSavingMessage('تم إقران الجهاز الجديد بنجاح وتوثيق عملية الربط في سجل التدقيق.');
      setTimeout(() => setSavingMessage(null), 4000);
      onDataChanged();
    } else {
      alert(res.error || 'تعذر إقران الجهاز');
    }
  };

  // Helper for latest reading of a specific type
  const latestBP = vitalReadings.find(v => v.type === 'blood_pressure');
  const latestGlucose = vitalReadings.find(v => v.type === 'blood_glucose');
  const latestO2 = vitalReadings.find(v => v.type === 'oxygen_saturation');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {savingMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[12px] text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{savingMessage}</span>
        </div>
      )}

      {/* Recipient Profile Card */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[14px] bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-rose-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{recipient.preferred_name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  مستفيد رعاية نشط
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                الاسم القانوني: {recipient.legal_name || 'غير مسجل'} • سنة الميلاد: {recipient.birth_year || '1952'} (74 سنة)
              </p>
            </div>
          </div>

          <div className="text-left text-xs text-slate-500 font-mono">
            <span>دائرة الرعاية: </span>
            <strong className="text-slate-800">{circle.name}</strong>
            <span className="block text-[11px] text-slate-400">نطاق {circle.timezone}</span>
          </div>
        </div>

        {/* Core Architectural Rule Callout */}
        <div className="p-3.5 bg-slate-50 rounded-[12px] border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>قاعدة الفصل الكانونية (Canonical Identity Rule):</span>
          </div>
          <p className="leading-relaxed">
            ملف المستفيد <strong>منفصل تماماً</strong> عن حسابات المستخدمين. وجود شخص في العائلة أو حيازته لقرابة ليس دليلاً قانونياً على امتلاك حق اتخاذ القرار أو الاطلاع على ملف الأدوية والبيانات الصحية.
          </p>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* HEALTH REPORTS & CONNECTED TELEMETRY SUB-NAVIGATION              */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[14px] border border-slate-200">
        <button
          onClick={() => setHealthSectionTab('report')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-xs font-bold transition min-h-[42px] ${
            healthSectionTab === 'report' 
              ? 'bg-white text-indigo-700 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>التقرير الصحي الأسبوعي والرسوم البيانية (Weekly Visual Report)</span>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
            ملخص 7 أيام 📊
          </span>
        </button>

        <button
          onClick={() => setHealthSectionTab('devices')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-xs font-bold transition min-h-[42px] ${
            healthSectionTab === 'devices' 
              ? 'bg-white text-teal-700 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-teal-600" />
          <span>أجهزة المراقبة والمؤشرات اللحظية (Connected Devices & Live Vitals)</span>
          <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-mono">
            {devices.length} أجهزة
          </span>
        </button>
      </div>

      {healthSectionTab === 'report' ? (
        !canViewHealth ? (
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[14px] text-center space-y-2">
              <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">التقرير الصحي الأسبوعي محجوب لدواعي الخصوصية</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {!circle.health_processing_enabled 
                  ? 'تم سحب موافقة المستفيد على معالجة البيانات الصحية وتجميد توليد التقارير لكافة أفراد العائلة.'
                  : 'حسابك الحالي لا يمتلك صلاحية رؤية البيانات الصحية (can_view_health_data).'}
              </p>
            </div>
          </div>
        ) : (
          <WeeklyHealthReportView onRefresh={onDataChanged} />
        )
      ) : (
        /* CONNECTED VITAL SIGNS MONITORS & TELEMETRY SECTION */
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                <Activity className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">أجهزة مراقبة المؤشرات الحيوية المتصلة</h3>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse text-teal-600" />
                    مزامنة تلقائية BLE
                  </span>
                </div>
              <p className="text-xs text-slate-500 mt-0.5">
                تحديث قياسات المستفيد تلقائياً من أجهزة الضغط والسكر والأكسجين مع توثيق القراءات في سجل التدقيق
              </p>
            </div>
          </div>

          {isAdmin && canViewHealth && (
            <button
              onClick={() => setShowPairModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-[8px] text-xs font-bold transition min-h-[40px] shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إقران جهاز جديد</span>
            </button>
          )}
        </div>

        {/* Non-clinical Disclaimer Banner */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-[12px] text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">إخلاء مسؤولية غير سريري ملزم:</strong> القراءات المستلمة من الأجهزة المتصلة مخصصة حصرياً للمتابعة الأسرية وتنسيق خطة الرعاية والتذكير، وليست بديلاً عن الفحص الطبي المباشر أو اتخاذ قرارات دوائية دون استشارة الطبيب المعالج.
          </div>
        </div>

        {/* Privacy Gating Check */}
        {!canViewHealth ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-[14px] text-center space-y-2">
            <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">بيانات المؤشرات الحيوية محجوبة لدواعي الخصوصية</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {!circle.health_processing_enabled 
                ? 'تم سحب موافقة المستفيد على معالجة البيانات الصحية وتجميد عرض القياسات الحيوية لكافة أفراد العائلة.'
                : 'حسابك الحالي لا يمتلك صلاحية رؤية البيانات الصحية (can_view_health_data). يرجى مراجعة مدير الدائرة.'}
            </p>
          </div>
        ) : (
          <>
            {/* Real-time Vital Telemetry Metrics */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                أحدث المؤشرات الحيوية للحاجة فاطمة
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Blood Pressure Card */}
                <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-[14px] space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-500" />
                      ضغط الدم (Blood Pressure)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {latestBP ? (latestBP.status === 'normal' ? 'مستقر' : 'تنبيه') : 'لا قراءة'}
                    </span>
                  </div>
                  <div>
                    {latestBP ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                          {latestBP.value_primary}/{latestBP.value_secondary}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">{latestBP.unit}</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs">بانتظار المزامنة الأولى</div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {latestBP?.note || 'المعدل الطبيعي المستهدف 120/80'}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 flex items-center justify-between font-mono">
                    <span>الجهاز: {latestBP?.device_name || 'Omron Evolv'}</span>
                    <span>{latestBP ? new Date(latestBP.measured_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                </div>

                {/* 2. Blood Glucose Card */}
                <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-[14px] space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-amber-500" />
                      سكر الدم (Blood Glucose)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {latestGlucose ? (latestGlucose.status === 'normal' ? 'طبيعي' : 'تنبيه') : 'لا قراءة'}
                    </span>
                  </div>
                  <div>
                    {latestGlucose ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                          {latestGlucose.value_primary}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">{latestGlucose.unit}</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs">بانتظار المزامنة الأولى</div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {latestGlucose?.note || 'سكر صائم قبل الإفطار'}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 flex items-center justify-between font-mono">
                    <span>الجهاز: {latestGlucose?.device_name || 'Accu-Chek'}</span>
                    <span>{latestGlucose ? new Date(latestGlucose.measured_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                </div>

                {/* 3. SpO2 & Pulse Card */}
                <div className="p-4 bg-slate-50 hover:bg-slate-50/80 border border-slate-200 rounded-[14px] space-y-3 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-teal-600" />
                      الأكسجين والنبض (SpO2 & HR)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {latestO2 ? (latestO2.status === 'normal' ? 'ممتاز' : 'تنبيه') : 'لا قراءة'}
                    </span>
                  </div>
                  <div>
                    {latestO2 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                          {latestO2.value_primary}%
                        </span>
                        <span className="text-xs text-slate-500 font-bold">SpO2 | {latestO2.value_secondary || 74} ن/د</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs">بانتظار المزامنة الأولى</div>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {latestO2?.note || 'نسبة تشبع ممتازة ونبض منتظم'}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-2 flex items-center justify-between font-mono">
                    <span>الجهاز: {latestO2?.device_name || 'Beurer PO 60'}</span>
                    <span>{latestO2 ? new Date(latestO2.measured_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connected Hardware Devices List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  الأجهزة المقترنة بالدائرة ({devices.length})
                </h4>
                <span className="text-[11px] text-slate-400 font-sans">
                  بروتوكول البلوتوث منخفض الطاقة BLE 5.0
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {devices.map(dev => {
                  const isSyncing = syncingDeviceId === dev.id;

                  return (
                    <div 
                      key={dev.id} 
                      className="p-4 bg-slate-50 rounded-[14px] border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-900">{dev.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <Battery className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dev.battery_level}%</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                          <p className="font-semibold text-slate-700">{dev.model}</p>
                          <p className="text-slate-400">S/N: {dev.serial_number}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>آخر مزامنة:</span>
                          <span className="font-mono text-slate-600 font-semibold">
                            {dev.last_sync_at 
                              ? new Date(dev.last_sync_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
                              : 'لم تتم بعد'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleSyncDevice(dev.id)}
                          disabled={isSyncing}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-teal-800 border border-slate-300 rounded-[8px] text-xs font-bold transition shadow-2xs disabled:opacity-50 min-h-[38px]"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>{isSyncing ? 'جاري مزامنة الجهاز...' : 'مزامنة القراءات الآن 🔄'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Synced Readings Audit Log Preview */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-800">
                    سجل القراءات الحيوية الموثقة (Audit Telemetry Log)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {vitalReadings.length} قراءات مسجلة
                </span>
              </div>

              <div className="overflow-x-auto rounded-[10px] border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 text-[11px]">
                    <tr>
                      <th className="p-2.5 font-bold">توقيت القياس</th>
                      <th className="p-2.5 font-bold">المؤشر الحيوي</th>
                      <th className="p-2.5 font-bold">الجهاز المصدر</th>
                      <th className="p-2.5 font-bold">القيمة والوحدة</th>
                      <th className="p-2.5 font-bold">الحالة</th>
                      <th className="p-2.5 font-bold">ملاحظات القياس</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vitalReadings.slice(0, 6).map(reading => (
                      <tr key={reading.id} className="hover:bg-slate-50/70 font-sans">
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">
                          {new Date(reading.measured_at).toLocaleString('ar-EG', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-2.5 font-bold text-slate-800">
                          {reading.type === 'blood_pressure' ? 'ضغط دم' :
                           reading.type === 'blood_glucose' ? 'سكر دم' :
                           reading.type === 'oxygen_saturation' ? 'تشبع أكسجين' : 'نبض قلب'}
                        </td>
                        <td className="p-2.5 text-slate-600 font-mono text-[11px]">
                          {reading.device_name}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">
                          {reading.value_primary}
                          {reading.value_secondary ? `/${reading.value_secondary}` : ''}{' '}
                          <span className="text-[10px] font-normal text-slate-500 font-sans">{reading.unit}</span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            reading.status === 'normal' ? 'bg-emerald-100 text-emerald-800' :
                            reading.status === 'attention' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {reading.status === 'normal' ? 'طبيعي' : reading.status === 'attention' ? 'ملاحظة' : 'حرج'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500 text-[11px]">
                          {reading.note || 'قياس مجدول منتظم'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    )}

      {/* Attestation & Consent Section */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">إقرارات التفويض والموافقة (Authority & Consent)</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Authorization Epoch #{circle.authorization_epoch}
          </span>
        </div>

        <div className="space-y-3">
          {authorizations.map(auth => (
            <div key={auth.id} className="p-4 bg-slate-50 border border-slate-200 rounded-[12px] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {auth.kind === 'authorized_representative_attestation' ? 'إقرار ممثل عائلي مفوض' :
                   auth.kind === 'processing_withdrawal' ? 'سحب موافقة صريح' : 'موافقة مستفيد'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold
                  ${auth.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {auth.status === 'active' ? 'ساري النفاذ' : 'ملغي / مسحوب'}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed font-sans">{auth.attestation_text}</p>
              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-200 pt-2">
                <span>أساس التفويض: {auth.authority_basis}</span>
                <span>تاريخ التوثيق: {new Date(auth.effective_at).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Withdrawal Controls */}
        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {circle.health_processing_enabled ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> معالجة البيانات الصحية مفعلة حالياً في الدائرة.
              </span>
            ) : (
              <span className="text-red-700 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> معالجة البيانات الصحية مسحوبة ومتوقفة.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {circle.health_processing_enabled ? (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-[8px] transition min-h-[40px]"
              >
                سحب موافقة المستفيد (Emergency Stop)
              </button>
            ) : (
              isAdmin && (
                <button
                  onClick={handleRestore}
                  className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-[8px] transition min-h-[40px]"
                >
                  إعادة تفعيل المعالجة الصحية
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Circle Members & Permissions Matrix */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">أعضاء دائرة الرعاية ومصفوفة الصلاحيات</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              علم <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">can_view_health_data</code> مستقل تماماً ولا يتجاوزه المدير تلقائياً.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map(member => (
            <div key={member.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{member.profile.display_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                    ${member.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                      member.role === 'caregiver' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'}`}>
                    {member.role === 'admin' ? 'مدير الدائرة (Admin)' :
                     member.role === 'caregiver' ? 'مقدم رعاية (Caregiver)' : 'مشاهد (Viewer)'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 ltr-text font-mono">
                  {member.profile.phone_e164 || 'بدون هاتف'} • انضم: {new Date(member.joined_at || '').toLocaleDateString('ar-EG')}
                </div>
              </div>

              {/* Toggles (Editable if current user is Admin) */}
              <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-[10px] border border-slate-200">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={member.can_view_health_data}
                    onChange={() => handleToggleMemberHealth(member)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">رؤية الصحة (Health)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={member.can_export}
                    onChange={() => handleToggleMemberExport(member)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">تصدير (Export)</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipient Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="border-b pb-3 text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-base font-bold text-slate-900">سحب موافقة المستفيد (Recipient Withdrawal)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              هذا الإجراء سيوقف فوراً وبشكل حاسم وصول أي فرد في الدائرة (بما في ذلك المديرين) إلى الأدوية، التقارير الطبية، الملاحظات الصحية، وأجهزة المؤشرات الحيوية.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">سبب السحب المسجل في التدقيق:</label>
              <textarea
                rows={2}
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="مثال: طلب الحاجة فاطمة إيقاف مشاركة بياناتها الصحية، أو مراجعة التفويض العائلي..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px]"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-[8px] transition"
              >
                تأكيد سحب الموافقة وتجميد الصحة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pair New Device Modal */}
      {showPairModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form onSubmit={handlePairDevice} className="bg-white rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="border-b pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bluetooth className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">إقران جهاز مراقبة مؤشرات حيوية جديد</h3>
              </div>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                BLE 5.0
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">نوع الجهاز الطبي المنزلي:</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-[8px] bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-sans"
                >
                  <option value="blood_pressure">جهاز قياس ضغط الدم الشرياني (Blood Pressure)</option>
                  <option value="glucose_meter">جهاز قياس نسبة السكر في الدم (Blood Glucose)</option>
                  <option value="pulse_oximeter">جهاز قياس نبض وتأكسج الدم (Pulse Oximeter)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم الجهاز التعريفي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جهاز ضغط الدم المنزلي - غرفة المعيشة"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الموديل والعلامة التجارية:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Omron Evolv HEM-7600T أو Beurer BM 85"
                  value={newDeviceModel}
                  onChange={(e) => setNewDeviceModel(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الرقم التسلسلي (Serial Number):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: SN-OMR-904128"
                  value={newDeviceSerial}
                  onChange={(e) => setNewDeviceSerial(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono uppercase"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[8px] text-[11px] text-slate-500">
                سيتم توثيق عملية الإقران وشهادة الربط في سجل التدقيق غير القابل للتعديل تلقائياً فور الحفظ.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowPairModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-[8px] transition shadow-xs"
              >
                تأكيد الإقران والاتصال
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
