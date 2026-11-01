import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  AlertCircle, 
  Calendar, 
  Filter, 
  ArrowRightLeft, 
  FileEdit, 
  ShieldCheck, 
  ShieldAlert, 
  Info,
  User,
  History,
  Lock,
  PlusCircle,
  Utensils,
  Pill,
  Activity,
  BellRing,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  Check
} from 'lucide-react';
import { 
  TaskOccurrence, 
  CareRecord, 
  RecordResult, 
  TruthSource, 
  OccurrenceStatus, 
  CircleMember,
  TaskCategory,
  VisibilityScope
} from '../../types/sanad';
import { sanadService } from '../../services/sanadService';

interface ScheduleViewProps {
  onDataChanged: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onDataChanged }) => {
  const occurrences = sanadService.getOccurrences();
  const members = sanadService.getMembers();
  const activeMember = sanadService.getActiveMember();
  const canSeeHealth = sanadService.canView('health');
  const recipient = sanadService.getRecipient();

  // View mode: 'timeline' (الروتين اليومي وخطة الرعاية) vs 'list' (القائمة الشاملة)
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New Schedule / Reminder Modal State
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [scheduleTitle, setScheduleTitle] = useState<string>('');
  const [scheduleCategory, setScheduleCategory] = useState<TaskCategory>('general');
  const [scheduleVisibility, setScheduleVisibility] = useState<VisibilityScope>('general');
  const [scheduleTime, setScheduleTime] = useState<string>('08:30');
  const [scheduleRecurrence, setScheduleRecurrence] = useState<string>('يومياً (Daily)');
  const [scheduleAssignee, setScheduleAssignee] = useState<string>('');
  const [scheduleNotifyAll, setScheduleNotifyAll] = useState<boolean>(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null);

  // Recording Modal states
  const [recordingOcc, setRecordingOcc] = useState<TaskOccurrence | null>(null);
  const [recordResult, setRecordResult] = useState<RecordResult | ''>('');
  const [truthSource, setTruthSource] = useState<TruthSource | ''>('');
  const [observedAt, setObservedAt] = useState<string>('');
  const [observedTimeUnknown, setObservedTimeUnknown] = useState<boolean>(false);
  const [reportedByLabel, setReportedByLabel] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [recordError, setRecordError] = useState<string | null>(null);

  // Correction Modal
  const [correctingOcc, setCorrectingOcc] = useState<TaskOccurrence | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>('');

  // Handoff Modal
  const [handoffOcc, setHandoffOcc] = useState<TaskOccurrence | null>(null);
  const [handoffTargetUser, setHandoffTargetUser] = useState<string>('');
  const [handoffError, setHandoffError] = useState<string | null>(null);

  // Filter occurrences for list view
  const filtered = occurrences.filter(occ => {
    if (filterCategory !== 'all' && occ.category !== filterCategory) return false;
    if (filterStatus !== 'all' && occ.status !== filterStatus) return false;
    return true;
  });

  // Group occurrences into Morning, Afternoon, Evening for Timeline Routine View
  const groupOccurrencesByPeriod = () => {
    const morning: TaskOccurrence[] = [];
    const afternoon: TaskOccurrence[] = [];
    const evening: TaskOccurrence[] = [];

    // Sort by scheduled time
    const sorted = [...occurrences].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

    sorted.forEach(occ => {
      const date = new Date(occ.scheduled_at);
      const hour = date.getHours();

      if (hour >= 4 && hour < 12) {
        morning.push(occ);
      } else if (hour >= 12 && hour < 18) {
        afternoon.push(occ);
      } else {
        evening.push(occ);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupOccurrencesByPeriod();

  // Quick Preset Selection in New Schedule Modal
  const applyPreset = (type: 'med_morning' | 'med_night' | 'meal_breakfast' | 'meal_lunch' | 'meal_dinner' | 'check_sugar' | 'check_bp') => {
    switch (type) {
      case 'med_morning':
        setScheduleTitle('متابعة علاج الضغط الصباحي (كونكور)');
        setScheduleCategory('medication_followup');
        setScheduleVisibility('health');
        setScheduleTime('08:30');
        break;
      case 'med_night':
        setScheduleTitle('قطرة العين المسائية (زايمار)');
        setScheduleCategory('medication_followup');
        setScheduleVisibility('health');
        setScheduleTime('21:30');
        break;
      case 'meal_breakfast':
        setScheduleTitle('وجبة إفطار صحية (شوفان ومشروب دافئ)');
        setScheduleCategory('general');
        setScheduleVisibility('general');
        setScheduleTime('08:00');
        break;
      case 'meal_lunch':
        setScheduleTitle('وجبة الغداء (بروتين خفيف وسلطة قليلة الملح)');
        setScheduleCategory('general');
        setScheduleVisibility('general');
        setScheduleTime('14:00');
        break;
      case 'meal_dinner':
        setScheduleTitle('وجبة عشاء خفيف (زبادي بلدي وفاكهة مهروسة)');
        setScheduleCategory('general');
        setScheduleVisibility('general');
        setScheduleTime('20:00');
        break;
      case 'check_sugar':
        setScheduleTitle('قياس السكر قبل الغداء وتوثيق القراءة');
        setScheduleCategory('medication_followup');
        setScheduleVisibility('health');
        setScheduleTime('13:30');
        break;
      case 'check_bp':
        setScheduleTitle('قياس ضغط الدم المسائي');
        setScheduleCategory('medication_followup');
        setScheduleVisibility('health');
        setScheduleTime('19:30');
        break;
    }
  };

  const handleCreateSchedule = () => {
    setScheduleError(null);
    if (!scheduleTitle.trim()) {
      setScheduleError('يرجى إدخال عنوان المتابعة أو الوجبة');
      return;
    }

    const res = sanadService.createTaskSchedule({
      title: scheduleTitle.trim(),
      category: scheduleCategory,
      visibility: scheduleVisibility,
      timeOfDay: scheduleTime,
      recurrenceRule: scheduleRecurrence,
      assigneeUserId: scheduleAssignee || null,
      notifyAllMembers: scheduleNotifyAll,
    });

    if (!res.success) {
      setScheduleError(res.error || 'تعذر حفظ الجدولة');
    } else {
      setShowScheduleModal(false);
      setScheduleSuccess(`تمت إضافة جدولة التذكير وإرسال الإشعارات الدورية لأفراد الأسرة بنجاح`);
      setTimeout(() => setScheduleSuccess(null), 4000);
      onDataChanged();
    }
  };

  // Open Recording Modal
  const openRecordModal = (occ: TaskOccurrence) => {
    setRecordingOcc(occ);
    setRecordResult(''); // Strictly NO DEFAULT! User must explicitly select!
    setTruthSource('');
    setObservedAt(new Date().toISOString().slice(0, 16));
    setObservedTimeUnknown(false);
    setReportedByLabel('');
    setNote('');
    setRecordError(null);
  };

  // Open Correction Modal
  const openCorrectionModal = (occ: TaskOccurrence) => {
    setCorrectingOcc(occ);
    setRecordResult(occ.current_record?.result || '');
    setTruthSource(occ.current_record?.truth_source || '');
    setObservedAt(occ.current_record?.observed_at ? occ.current_record.observed_at.slice(0, 16) : '');
    setObservedTimeUnknown(occ.current_record?.observed_time_unknown || false);
    setReportedByLabel(occ.current_record?.reported_by_label || '');
    setNote(occ.current_record?.note || '');
    setCorrectionReason('');
    setRecordError(null);
  };

  const handleSaveRecord = () => {
    setRecordError(null);
    if (!recordingOcc) return;

    if (!recordResult) {
      setRecordError('يرجى اختيار النتيجة صراحة (تم التنفيذ أو لم يُنفذ)');
      return;
    }
    if (!truthSource) {
      setRecordError('يرجى تحديد مصدر المعرفة (أنا نفذت / شاهدت بنفسي / أُبلغت بها)');
      return;
    }
    if (!observedTimeUnknown && !observedAt) {
      setRecordError('يرجى إدخال وقت المتابعة أو تحديد "الوقت الدقيق غير معلوم"');
      return;
    }

    const res = sanadService.recordCareOccurrence({
      occurrenceId: recordingOcc.id,
      result: recordResult as RecordResult,
      truthSource: truthSource as TruthSource,
      observedAt: observedTimeUnknown ? null : new Date(observedAt).toISOString(),
      observedTimeUnknown,
      reportedByLabel: truthSource === 'reported' ? reportedByLabel : null,
      note: note.trim() || null,
      expectedRowVersion: recordingOcc.row_version,
    });

    if (!res.success) {
      setRecordError(res.error || 'تعذر التسجيل');
    } else {
      setRecordingOcc(null);
      onDataChanged();
    }
  };

  const handleSaveCorrection = () => {
    setRecordError(null);
    if (!correctingOcc || !correctingOcc.current_record) return;

    if (!correctionReason.trim()) {
      setRecordError('سبب التصحيح مطلوب إلزامياً لضمان سلامة التدقيق العائلي');
      return;
    }

    const res = sanadService.submitCorrection({
      occurrenceId: correctingOcc.id,
      result: recordResult as RecordResult,
      truthSource: truthSource as TruthSource,
      observedAt: observedTimeUnknown ? null : (observedAt ? new Date(observedAt).toISOString() : null),
      observedTimeUnknown,
      reportedByLabel: truthSource === 'reported' ? reportedByLabel : null,
      note: note.trim() || null,
      correctionReason: correctionReason.trim(),
      supersedesRecordId: correctingOcc.current_record.id,
      expectedRowVersion: correctingOcc.row_version,
    });

    if (!res.success) {
      setRecordError(res.error || 'تعذر إجراء التصحيح');
    } else {
      setCorrectingOcc(null);
      onDataChanged();
    }
  };

  const handleHandoff = () => {
    setHandoffError(null);
    if (!handoffOcc || !handoffTargetUser) {
      setHandoffError('يرجى اختيار العضو المستهدف');
      return;
    }

    const res = sanadService.handoffAssignment(handoffOcc.id, handoffTargetUser);
    if (!res.success) {
      setHandoffError(res.error || 'تعذر التسليم');
    } else {
      setHandoffOcc(null);
      onDataChanged();
    }
  };

  // Render an occurrence card
  const renderOccurrenceCard = (occ: TaskOccurrence) => {
    const statusInfo = sanadService.getStatusText(occ.status, occ.scheduled_at);
    const isAssignedToMe = occ.current_assignment?.assignee_user_id === activeMember?.user_id;
    const isPendingAssignment = occ.current_assignment?.state === 'pending';
    const isMeal = occ.title_snapshot.includes('وجبة') || occ.title_snapshot.includes('إفطار') || occ.title_snapshot.includes('غداء') || occ.title_snapshot.includes('عشاء');

    return (
      <div
        key={occ.id}
        className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 md:p-5 hover:border-indigo-300 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border
              ${statusInfo.tone === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                statusInfo.tone === 'danger' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                statusInfo.tone === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-200' :
                'bg-blue-50 text-blue-800 border-blue-200'}`}>
              {statusInfo.label}
            </span>

            <span className={`text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1
              ${isMeal ? 'bg-orange-50 text-orange-700' :
                occ.visibility === 'health' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
              {isMeal ? <Utensils className="w-3 h-3" /> : occ.category === 'medication_followup' ? <Pill className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
              <span>{isMeal ? 'وجبة غذائية (عام)' : occ.category === 'medication_followup' ? 'دواء (صحي)' : 'عام'}</span>
            </span>

            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(occ.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </span>

            <span className="text-[10px] text-slate-400 font-mono">v{occ.row_version}</span>
          </div>

          <h3 className="font-bold text-base text-[#0F172A]">{occ.title_snapshot}</h3>

          {/* Care Record Summary */}
          {occ.current_record && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  توثيق: {occ.current_record.result === 'done' ? 'تم التنفيذ ✓' : 'لم يُنفذ ✕'}
                </span>
                <span className="text-[11px] text-slate-500">
                  المصدر: {sanadService.getTruthSourceLabel(occ.current_record.truth_source)}
                </span>
              </div>
              {occ.current_record.note && (
                <p className="text-slate-600 italic">«{occ.current_record.note}»</p>
              )}
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200">
                <span>سجل بواسطة: {occ.current_record.actor_profile?.display_name || 'عضو'}</span>
                <span>{new Date(occ.current_record.recorded_at).toLocaleTimeString('ar-EG')}</span>
              </div>
            </div>
          )}

          {/* Assignment Information */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {occ.current_assignment ? (
                <span>
                  المسؤول: <strong>{occ.current_assignment.assignee_profile?.display_name}</strong>
                  {occ.current_assignment.state === 'pending' && ' (في انتظار الموافقة)'}
                  {occ.current_assignment.state === 'accepted' && ' (موافق عليه)'}
                </span>
              ) : (
                <span className="text-slate-400 italic">غير معيّن لشخص محدد (متاح لأي فرد)</span>
              )}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0">
          {isAssignedToMe && isPendingAssignment && (
            <div className="flex items-center gap-1.5 w-full">
              <button
                onClick={() => {
                  sanadService.respondToAssignment(occ.id, true);
                  onDataChanged();
                }}
                className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] text-xs font-bold transition min-h-[38px]"
              >
                قبول المهمة
              </button>
              <button
                onClick={() => {
                  sanadService.respondToAssignment(occ.id, false);
                  onDataChanged();
                }}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[8px] text-xs transition min-h-[38px]"
              >
                اعتذار
              </button>
            </div>
          )}

          {activeMember?.role !== 'viewer' && (
            <div className="flex items-center gap-2 w-full">
              {!occ.current_record ? (
                <button
                  onClick={() => openRecordModal(occ)}
                  className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[10px] text-xs font-bold transition min-h-[40px] shadow-xs"
                >
                  <FileEdit className="w-3.5 h-3.5 ml-1" />
                  <span>تسجيل المتابعة</span>
                </button>
              ) : (
                <button
                  onClick={() => openCorrectionModal(occ)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-[8px] text-xs font-semibold transition min-h-[38px]"
                  title="إضافة تصحيح مسجل"
                >
                  <History className="w-3.5 h-3.5 ml-1" />
                  <span>تصحيح السجل</span>
                </button>
              )}
            </div>
          )}

          {activeMember?.role !== 'viewer' && (
            <button
              onClick={() => {
                setHandoffOcc(occ);
                setHandoffTargetUser('');
                setHandoffError(null);
              }}
              className="text-[11px] text-slate-500 hover:text-indigo-600 hover:underline flex items-center justify-center gap-1 py-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>تسليم أو إعادة تعيين</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {scheduleSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-[12px] text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{scheduleSuccess}</span>
        </div>
      )}

      {/* Top Header & Scheduling Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
            جدول ومتابعات الرعاية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            جدولة التذكيرات اليومية للأدوية والوجبات ومتابعة الروتين اليومي مع إشعار أفراد العائلة فورياً.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeMember?.role !== 'viewer' && (
            <button
              onClick={() => {
                setShowScheduleModal(true);
                setScheduleTitle('');
                setScheduleError(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[10px] text-xs font-bold transition shadow-xs min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 ml-1" />
              <span>جدولة تذكير يومي جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher: Routine Timeline vs All List */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-2 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3.5 py-2 rounded-[8px] text-xs font-bold transition min-h-[38px] flex items-center gap-1.5
              ${viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>الروتين اليومي وخطة الرعاية</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-2 rounded-[8px] text-xs font-bold transition min-h-[38px] flex items-center gap-1.5
              ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>كافة المتابعات والمهام ({occurrences.length})</span>
          </button>
        </div>

        {/* Health Scope Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          {canSeeHealth ? (
            <span className="text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> الأدوية والوجبات معروضة
            </span>
          ) : (
            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> الأدوية محجوبة (وجبات ومهام عامة فقط)
            </span>
          )}
        </div>
      </div>

      {/* View Mode 1: Daily Routine Care Timeline */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {/* Morning Period */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">فترة الصباح واليقظة (04:00 ص – 12:00 م)</h3>
              <span className="text-xs text-slate-400 font-mono">({morning.length} متابعات)</span>
            </div>

            {morning.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">لا توجد متابعات مجدولة في فترة الصباح.</p>
            ) : (
              morning.map(occ => renderOccurrenceCard(occ))
            )}
          </div>

          {/* Afternoon Period */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                <Sunset className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">فترة الظهيرة والغداء (12:00 م – 06:00 م)</h3>
              <span className="text-xs text-slate-400 font-mono">({afternoon.length} متابعات)</span>
            </div>

            {afternoon.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">لا توجد متابعات مجدولة في فترة الظهيرة.</p>
            ) : (
              afternoon.map(occ => renderOccurrenceCard(occ))
            )}
          </div>

          {/* Evening Period */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">فترة المساء والعشاء والنوم (06:00 م فما بعدها)</h3>
              <span className="text-xs text-slate-400 font-mono">({evening.length} متابعات)</span>
            </div>

            {evening.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">لا توجد متابعات مجدولة في فترة المساء.</p>
            ) : (
              evening.map(occ => renderOccurrenceCard(occ))
            )}
          </div>
        </div>
      )}

      {/* View Mode 2: Detailed List with Full Filters */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">التصنيف:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="all">كل التصنيفات</option>
                {canSeeHealth && <option value="medication_followup">متابعة دواء (صحي)</option>}
                <option value="appointment_logistics">لوجستيات موعد (عام)</option>
                <option value="general">وجبات ورعاية عامة</option>
              </select>

              <span className="text-xs font-bold text-slate-700 mr-2">الحالة:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="all">كل الحالات</option>
                <option value="unrecorded">بانتظار المتابعة / غير مؤكدة</option>
                <option value="recorded">تم تسجيل المتابعة</option>
                <option value="not_done">مسجل أنه لم يُنفذ</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              معروض: {filtered.length} مهمة
            </span>
          </div>

          <div className="space-y-3">
            {filtered.map(occ => renderOccurrenceCard(occ))}
          </div>
        </div>
      )}

      {/* New Schedule & Reminder Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-5 h-5 text-indigo-600" />
                <span>جدولة تذكير يومي للأدوية أو الوجبات</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ربط تذكير دوري بخطة رعاية {recipient.preferred_name} مع إرسال إشعارات لأفراد الدائرة.
              </p>
            </div>

            {scheduleError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{scheduleError}</span>
              </div>
            )}

            {/* Quick Templates Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block">نماذج سريعة للتعبئة:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('meal_breakfast')}
                  className="p-2 text-right text-[11px] rounded-[8px] border border-orange-200 bg-orange-50/60 text-orange-900 hover:bg-orange-100 font-semibold"
                >
                  🍲 وجبة إفطار صحية (08:00 ص)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('med_morning')}
                  disabled={!canSeeHealth}
                  className="p-2 text-right text-[11px] rounded-[8px] border border-purple-200 bg-purple-50/60 text-purple-900 hover:bg-purple-100 font-semibold disabled:opacity-40"
                >
                  💊 دواء الضغط صباحاً (08:30 ص)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('meal_lunch')}
                  className="p-2 text-right text-[11px] rounded-[8px] border border-orange-200 bg-orange-50/60 text-orange-900 hover:bg-orange-100 font-semibold"
                >
                  🍲 وجبة الغداء (02:00 م)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('check_sugar')}
                  disabled={!canSeeHealth}
                  className="p-2 text-right text-[11px] rounded-[8px] border border-teal-200 bg-teal-50/60 text-teal-900 hover:bg-teal-100 font-semibold disabled:opacity-40"
                >
                  🩺 قياس السكر (01:30 م)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('meal_dinner')}
                  className="p-2 text-right text-[11px] rounded-[8px] border border-orange-200 bg-orange-50/60 text-orange-900 hover:bg-orange-100 font-semibold"
                >
                  🍲 عشاء خفيف (08:00 م)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('med_night')}
                  disabled={!canSeeHealth}
                  className="p-2 text-right text-[11px] rounded-[8px] border border-purple-200 bg-purple-50/60 text-purple-900 hover:bg-purple-100 font-semibold disabled:opacity-40"
                >
                  💊 قطرة العين ليلاً (09:30 م)
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                عنوان المتابعة أو الوجبة: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="مثال: وجبة الغداء مع شوربة خضار، أو قرص الضغط بعد الإفطار..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            {/* Category and Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">التصنيف:</label>
                <select
                  value={scheduleCategory}
                  onChange={(e) => {
                    const cat = e.target.value as TaskCategory;
                    setScheduleCategory(cat);
                    if (cat === 'medication_followup') {
                      setScheduleVisibility('health');
                    } else {
                      setScheduleVisibility('general');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="general">وجبات غذائية ورعاية عامة</option>
                  {canSeeHealth && <option value="medication_followup">متابعة دواء أو قياس صحي</option>}
                  <option value="appointment_logistics">لوجستيات وتجهيزات</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">نطاق الخصوصية:</label>
                <select
                  value={scheduleVisibility}
                  disabled={scheduleCategory === 'medication_followup'}
                  onChange={(e) => setScheduleVisibility(e.target.value as VisibilityScope)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="general">عام (مرئي لكافة أفراد العائلة)</option>
                  {canSeeHealth && <option value="health">صحي (محجوب عن غير المصرح لهم)</option>}
                </select>
              </div>
            </div>

            {/* Time of Day & Recurrence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">توقيت التذكير اليومي:</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 block">التكرار:</label>
                <select
                  value={scheduleRecurrence}
                  onChange={(e) => setScheduleRecurrence(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="يومياً (Daily)">يومياً في نفس الموعد</option>
                  <option value="أيام الأسبوع (من الأحد إلى الخميس)">أيام الأسبوع (من الأحد إلى الخميس)</option>
                  <option value="مواعيد محددة أسبوعياً">مواعيد محددة أسبوعياً</option>
                </select>
              </div>
            </div>

            {/* Assignee Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">تعيين لمسؤول محدد:</label>
              <select
                value={scheduleAssignee}
                onChange={(e) => setScheduleAssignee(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              >
                <option value="">(بدون تعيين مسبق — متاح للأول الذي يقبل المهمة)</option>
                {members.map(m => {
                  const cannotHandleHealth = scheduleVisibility === 'health' && !m.can_view_health_data;
                  return (
                    <option key={m.id} value={m.user_id} disabled={cannotHandleHealth}>
                      {m.profile.display_name} ({m.role}){cannotHandleHealth ? ' [محجوب عنه الصحة]' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Notification Checkbox */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px]">
              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleNotifyAll}
                  onChange={(e) => setScheduleNotifyAll(e.target.checked)}
                  className="rounded text-indigo-600 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900 block">إرسال إشعارات تذكير دورية لأفراد الأسرة</span>
                  <span className="text-[11px] text-slate-500">
                    سيصل إشعار دوري في صندوق الوارد وعلى شاشات الأجهزة للتأكد من تناول الوجبة أو الدواء في موعده.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px] min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCreateSchedule}
                className="px-6 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-[8px] min-h-[44px] transition shadow-xs"
              >
                حفظ الجدولة وتفعيل التذكيرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Care Occurrence Modal */}
      {recordingOcc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-3">
              <span className="text-xs text-indigo-600 font-bold block">تسجيل متابعة رعاية</span>
              <h3 className="text-base font-bold text-slate-900">{recordingOcc.title_snapshot}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تنبيه: التسجيل لا يضع أي قيمة افتراضية؛ يجب الاختيار الصريح لسلامة التوثيق.
              </p>
            </div>

            {recordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{recordError}</span>
              </div>
            )}

            {/* Field 1: Result (done vs not_done) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                1. هل تم تنفيذ المتابعة؟ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecordResult('done')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-[10px] border transition flex items-center justify-center gap-2 min-h-[44px]
                    ${recordResult === 'done' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم التنفيذ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecordResult('not_done')}
                  className={`py-2.5 px-3 text-xs font-bold rounded-[10px] border transition flex items-center justify-center gap-2 min-h-[44px]
                    ${recordResult === 'not_done' 
                      ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>لم يُنفذ</span>
                </button>
              </div>
            </div>

            {/* Field 2: Truth Source */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                2. ما مصدر علمك بالواقعة؟ (Truth Source) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'first_hand', label: 'أنا اللي نفّذت (مباشرة)' },
                  { id: 'observed', label: 'شاهدتها بنفسي (كنت حاضراً أثناء التنفيذ)' },
                  { id: 'reported', label: 'أُبلغت بها (من المستفيد أو ممرض أو فرد آخر)' },
                ].map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2 p-2.5 rounded-[10px] border text-xs cursor-pointer transition
                      ${truthSource === item.id ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                  >
                    <input
                      type="radio"
                      name="truthSource"
                      value={item.id}
                      checked={truthSource === item.id}
                      onChange={() => setTruthSource(item.id as TruthSource)}
                      className="text-indigo-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* If Reported: label */}
            {truthSource === 'reported' && (
              <div className="space-y-1 pt-1 animate-in fade-in">
                <label className="text-xs font-semibold text-slate-800 block">من الذي أبلغك؟</label>
                <input
                  type="text"
                  value={reportedByLabel}
                  onChange={(e) => setReportedByLabel(e.target.value)}
                  placeholder="مثال: الحاجة فاطمة بنفسها، أو الممرضة إيمان"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            )}

            {/* Field 3: Observed Time */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-800 block">3. وقت وقوع المتابعة:</label>
              <div className="flex items-center gap-3">
                <input
                  type="datetime-local"
                  disabled={observedTimeUnknown}
                  value={observedAt}
                  onChange={(e) => setObservedAt(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 font-mono"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={observedTimeUnknown}
                    onChange={(e) => setObservedTimeUnknown(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>الوقت الدقيق غير معلوم</span>
                </label>
              </div>
            </div>

            {/* Field 4: Note */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-800 block">4. ملاحظات إضافية (اختياري):</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="أي ملاحظات حول الوجبة أو الجرعة..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setRecordingOcc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px] min-h-[44px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveRecord}
                className="px-6 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-[8px] min-h-[44px] transition shadow-xs"
              >
                تأكيد وتسجيل المتابعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Append-Only Correction Modal */}
      {correctingOcc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-3">
              <span className="text-xs text-amber-700 font-bold block">تصحيح سجل سابق (Append-only Correction)</span>
              <h3 className="text-base font-bold text-slate-900">{correctingOcc.title_snapshot}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                بموجب قواعد التدقيق: السجل القديم لا يُمسح بل يُحفظ في التاريخ ويُربط بالسجل المصحح.
              </p>
            </div>

            {recordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{recordError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">سبب التصحيح: <span className="text-red-500">*</span></label>
              <textarea
                rows={2}
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="مثال: خطأ في وقت الإعطاء، أو تبين لاحقاً أن الوجبة أُخذت في موعد آخر..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-[8px] focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-800 block">النتيجة المصححة:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRecordResult('done')}
                  className={`py-2 px-3 text-xs font-bold rounded-[8px] border transition
                    ${recordResult === 'done' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'border-slate-200'}`}
                >
                  تم التنفيذ
                </button>
                <button
                  type="button"
                  onClick={() => setRecordResult('not_done')}
                  className={`py-2 px-3 text-xs font-bold rounded-[8px] border transition
                    ${recordResult === 'not_done' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'border-slate-200'}`}
                >
                  لم يُنفذ
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setCorrectingOcc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-[8px] transition"
              >
                حفظ التصحيح الموثق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handoff Modal */}
      {handoffOcc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">تسليم المهمة لعضو آخر (Handoff)</h3>
              <p className="text-xs text-slate-500 mt-1">{handoffOcc.title_snapshot}</p>
            </div>

            {handoffError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{handoffError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">اختر العضو المستهدف:</label>
              <div className="space-y-1.5">
                {members.map(m => {
                  const cannotReceiveHealth = handoffOcc.visibility === 'health' && !m.can_view_health_data;
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between p-2.5 rounded-[8px] border text-xs cursor-pointer transition
                        ${handoffTargetUser === m.user_id ? 'bg-indigo-50 border-indigo-500 font-bold' : 'border-slate-200 hover:bg-slate-50'}
                        ${cannotReceiveHealth ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="handoffUser"
                          value={m.user_id}
                          disabled={cannotReceiveHealth}
                          checked={handoffTargetUser === m.user_id}
                          onChange={() => setHandoffTargetUser(m.user_id)}
                        />
                        <span>{m.profile.display_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {cannotReceiveHealth ? 'محجوب عنه الصحة' : m.role}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setHandoffOcc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[8px]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleHandoff}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-[8px] transition"
              >
                إرسال طلب التسليم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
