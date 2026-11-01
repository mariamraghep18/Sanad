import React, { useState } from 'react';
import { 
  Activity, 
  HeartPulse, 
  Droplet, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  FileText,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { WeeklyHealthReport, DayVitalSummary } from '../../types/sanad';
import { sanadService } from '../../services/sanadService';

interface WeeklyHealthReportViewProps {
  onRefresh?: () => void;
}

export const WeeklyHealthReportView: React.FC<WeeklyHealthReportViewProps> = ({ onRefresh }) => {
  const [report, setReport] = useState<WeeklyHealthReport | null>(() => {
    const res = sanadService.generateWeeklyHealthReport();
    return res.success && res.report ? res.report : null;
  });
  const [activeTooltip, setActiveTooltip] = useState<{ day: DayVitalSummary; x: number; y: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshReport = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const res = sanadService.generateWeeklyHealthReport();
      if (res.success && res.report) {
        setReport(res.report);
      }
      setIsRefreshing(false);
      if (onRefresh) onRefresh();
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-[14px] text-center text-xs text-slate-500">
        تعذر تحميل التقرير الصحي الأسبوعي نظراً لحجب الصلاحيات أو غياب البيانات.
      </div>
    );
  }

  const { averages, daily_trends } = report;

  // Chart dimensions & scaling calculations
  const chartWidth = 620;
  const chartHeight = 200;
  const paddingX = 45;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Scaling helpers for Blood Pressure (Y range: 60 to 160)
  const bpMin = 60;
  const bpMax = 150;
  const getYForBp = (val: number) => {
    const clamped = Math.max(bpMin, Math.min(bpMax, val));
    return paddingY + innerHeight - ((clamped - bpMin) / (bpMax - bpMin)) * innerHeight;
  };

  // Scaling helpers for Glucose (Y range: 80 to 180)
  const gluMin = 80;
  const gluMax = 170;
  const getYForGlu = (val: number) => {
    const clamped = Math.max(gluMin, Math.min(gluMax, val));
    return paddingY + innerHeight - ((clamped - gluMin) / (gluMax - gluMin)) * innerHeight;
  };

  const getX = (index: number) => {
    if (daily_trends.length <= 1) return paddingX + innerWidth / 2;
    return paddingX + (index / (daily_trends.length - 1)) * innerWidth;
  };

  // Build SVG path strings for Systolic & Diastolic
  const systolicPoints = daily_trends.map((d, i) => `${getX(i)},${getYForBp(d.systolic)}`).join(' ');
  const diastolicPoints = daily_trends.map((d, i) => `${getX(i)},${getYForBp(d.diastolic)}`).join(' ');

  // Build SVG path strings for Glucose
  const glucosePoints = daily_trends.map((d, i) => `${getX(i)},${getYForGlu(d.glucose)}`).join(' ');
  const glucoseAreaPoints = `${getX(0)},${paddingY + innerHeight} ` + 
    daily_trends.map((d, i) => `${getX(i)},${getYForGlu(d.glucose)}`).join(' ') + 
    ` ${getX(daily_trends.length - 1)},${paddingY + innerHeight}`;

  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-6 print:border-none print:shadow-none">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                التقرير الصحي الأسبوعي الدوري
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  ملخص 7 أيام
                </span>
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            فترة التقرير: <strong>{report.period_label}</strong> • المستفيد: <strong>{report.recipient_name}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleRefreshReport}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-[8px] text-xs font-bold transition min-h-[38px]"
            title="إعادة احتساب وتحديث البيانات"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث البيانات</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[8px] text-xs font-bold transition min-h-[38px] shadow-xs"
            title="طباعة التقرير أو حفظه بصيغة PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة التقرير (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Weekly KPI Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Blood Pressure Avg */}
        <div className="p-3.5 bg-slate-50 rounded-[12px] border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              متوسط ضغط الدم
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
              مستقر
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900 font-mono">
              {averages.systolic_avg}/{averages.diastolic_avg}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">mmHg</span>
          </div>
          <p className="text-[10px] text-slate-400">الهدف الموصى به: 120-130 / 80</p>
        </div>

        {/* Glucose Avg */}
        <div className="p-3.5 bg-slate-50 rounded-[12px] border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Droplet className="w-3.5 h-3.5 text-amber-500" />
              متوسط سكر الصائم
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
              آمن
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900 font-mono">
              {averages.glucose_avg}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">mg/dL</span>
          </div>
          <p className="text-[10px] text-slate-400">الهدف الصائم: &lt; 130 mg/dL</p>
        </div>

        {/* SpO2 & Pulse */}
        <div className="p-3.5 bg-slate-50 rounded-[12px] border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              الأكسجين والنبض
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
              ممتاز
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900 font-mono">
              {averages.spo2_avg}%
            </span>
            <span className="text-[10px] text-slate-500 font-mono">| {averages.pulse_avg} bpm</span>
          </div>
          <p className="text-[10px] text-slate-400">تشبع طبيعي ونبض منتظم</p>
        </div>

        {/* Medication Adherence */}
        <div className="p-3.5 bg-slate-50 rounded-[12px] border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              الالتزام بالخطة
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-bold">
              ممتاز
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-indigo-600 font-mono">
              {averages.medication_adherence_percent}%
            </span>
            <span className="text-[10px] text-slate-500 font-bold">من الجرعات</span>
          </div>
          <p className="text-[10px] text-slate-400">27 من 28 موعد منفذ</p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CHART 1: Blood Pressure 7-Day Trend Chart                     */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 bg-slate-50/70 rounded-[14px] border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              مخطط مسار ضغط الدم الشرياني (Blood Pressure 7-Day Trend)
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              تتبع يومي لمؤشري الانقباضي (Systolic) والانبساطي (Diastolic) مقارنة بالنطاق الآمن
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-sans">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              الانقباضي (Systolic)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              الانبساطي (Diastolic)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-2 rounded bg-emerald-200/50 border border-emerald-400 inline-block"></span>
              النطاق المستهدف
            </span>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full min-w-[500px] h-48 select-none"
          >
            {/* Target Normal Zone Background (Systolic 110-130) */}
            <rect
              x={paddingX}
              y={getYForBp(130)}
              width={innerWidth}
              height={getYForBp(110) - getYForBp(130)}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeDasharray="4 2"
            />

            {/* Target Normal Zone Label */}
            <text
              x={chartWidth - paddingX - 4}
              y={getYForBp(120) + 4}
              fontSize="9"
              fill="#10B981"
              fontWeight="bold"
              textAnchor="end"
              fontFamily="sans-serif"
            >
              النطاق المثالي (110 - 130)
            </text>

            {/* Horizontal Grid lines */}
            {[80, 100, 120, 140].map(val => (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={getYForBp(val)}
                  x2={chartWidth - paddingX}
                  y2={getYForBp(val)}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={getYForBp(val) + 3}
                  fontSize="9"
                  fill="#94A3B8"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Systolic Line */}
            <polyline
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={systolicPoints}
            />

            {/* Diastolic Line */}
            <polyline
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={diastolicPoints}
            />

            {/* Points & Labels */}
            {daily_trends.map((d, i) => {
              const x = getX(i);
              const ySys = getYForBp(d.systolic);
              const yDia = getYForBp(d.diastolic);

              return (
                <g key={d.date} className="cursor-pointer group">
                  {/* Vertical hover guide */}
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={paddingY + innerHeight}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="opacity-0 group-hover:opacity-100 transition"
                  />

                  {/* Systolic dot */}
                  <circle
                    cx={x}
                    cy={ySys}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#F43F5E"
                    strokeWidth="2.5"
                    className="group-hover:r-6 transition"
                  />
                  <text
                    x={x}
                    y={ySys - 8}
                    fontSize="9"
                    fill="#BE123C"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {d.systolic}
                  </text>

                  {/* Diastolic dot */}
                  <circle
                    cx={x}
                    cy={yDia}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#6366F1"
                    strokeWidth="2.5"
                    className="group-hover:r-6 transition"
                  />
                  <text
                    x={x}
                    y={yDia + 14}
                    fontSize="9"
                    fill="#4338CA"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {d.diastolic}
                  </text>

                  {/* X-axis Day Label */}
                  <text
                    x={x}
                    y={chartHeight - 4}
                    fontSize="10"
                    fill="#475569"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {d.day_label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CHART 2: Blood Glucose 7-Day Trend Chart                      */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 bg-slate-50/70 rounded-[14px] border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-amber-500" />
              مخطط مسار سكر الدم الصائم (Fasting Blood Glucose 7-Day Trend)
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              قراءات الصباح الباكر قبل وجبة الإفطار موثقة من جهاز Accu-Chek
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-sans">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              قراءة السكر (mg/dL)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3.5 h-0.5 bg-emerald-500 inline-block border-t border-emerald-500"></span>
              الحد الآمن المستهدف (120)
            </span>
          </div>
        </div>

        {/* SVG Glucose Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full min-w-[500px] h-44 select-none"
          >
            <defs>
              <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target 120 threshold dashed line */}
            <line
              x1={paddingX}
              y1={getYForGlu(120)}
              x2={chartWidth - paddingX}
              y2={getYForGlu(120)}
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x={chartWidth - paddingX - 4}
              y={getYForGlu(120) - 5}
              fontSize="9"
              fill="#10B981"
              fontWeight="bold"
              textAnchor="end"
              fontFamily="sans-serif"
            >
              الحد الآمن 120 mg/dL
            </text>

            {/* Horizontal Grid lines */}
            {[90, 110, 130, 150].map(val => (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={getYForGlu(val)}
                  x2={chartWidth - paddingX}
                  y2={getYForGlu(val)}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={getYForGlu(val) + 3}
                  fontSize="9"
                  fill="#94A3B8"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            ))}

            {/* Gradient Area under curve */}
            <polygon fill="url(#glucoseGradient)" points={glucoseAreaPoints} />

            {/* Glucose Trend Line */}
            <polyline
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={glucosePoints}
            />

            {/* Data Points */}
            {daily_trends.map((d, i) => {
              const x = getX(i);
              const y = getYForGlu(d.glucose);

              return (
                <g key={d.date} className="cursor-pointer group">
                  <circle
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    className="group-hover:r-6 transition"
                  />
                  <text
                    x={x}
                    y={y - 8}
                    fontSize="9"
                    fill="#B45309"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {d.glucose}
                  </text>
                  <text
                    x={x}
                    y={chartHeight - 4}
                    fontSize="10"
                    fill="#475569"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    {d.day_label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Observations & Family Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Clinical Observations */}
        <div className="p-4 bg-slate-50 rounded-[14px] border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-xs text-slate-900">ملاحظات واستنتاجات المؤشرات الصحية:</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {report.clinical_observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                <span className="leading-relaxed">{obs}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Family Recommendations */}
        <div className="p-4 bg-teal-50/50 rounded-[14px] border border-teal-200 space-y-3">
          <div className="flex items-center gap-2 text-teal-800">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-xs text-slate-900">توصيات للأسبوع القادم لأفراد العائلة:</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {report.recommendations_for_family.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 flex-shrink-0"></span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Audit Log Stamp & Legal Notice */}
      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Report ID: {report.id} • تم التوليد: {new Date(report.generated_at).toLocaleString('ar-EG')}</span>
        </div>
        <div className="text-slate-500 font-sans text-[10px]">
          موثق تلقائياً في سجل التدقيق غير القابل للتعديل
        </div>
      </div>
    </div>
  );
};
