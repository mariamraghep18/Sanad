import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileCheck, 
  Lock, 
  Info,
  ShieldCheck,
  Eye,
  FileQuestion
} from 'lucide-react';
import { sanadService } from '../../services/sanadService';
import { SanadDocument } from '../../types/sanad';

interface DocumentsViewProps {
  onDataChanged: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ onDataChanged }) => {
  const documents = sanadService.getDocuments();
  const canSeeHealth = sanadService.canView('health');
  const activeMember = sanadService.getActiveMember();

  const [selectedDoc, setSelectedDoc] = useState<SanadDocument | null>(documents[0] || null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const handleReview = (accept: boolean) => {
    if (!selectedDoc) return;
    const res = sanadService.reviewAiRun(selectedDoc.id, accept);
    if (res.success) {
      setReviewMessage(accept ? 'تم اعتماد مراجعة المسودة وحفظها في الأرشيف' : 'تم رفض مسودة الاستخراج');
      setTimeout(() => setReviewMessage(null), 3000);
      onDataChanged();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
          الملفات ومسودات الاستخراج الذكي
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          أرشيف التقارير والروشتات الطبية مع استخراج مسودات أولية تخضع لمراجعة واعتماد بشري إلزامي.
        </p>
      </div>

      {reviewMessage && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-[12px] text-xs font-bold text-indigo-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>{reviewMessage}</span>
        </div>
      )}

      {/* AI Safety Rule Notice */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-[14px] text-xs text-indigo-950 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">ميثاق الأمان في الذكاء الاصطناعي (AI Review Gate):</span>
          <p className="leading-relaxed text-indigo-900">
            مخرجات الذكاء الاصطناعي تقف عند حالة <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono font-bold">review_required</code> ولا تنشر أي دواء أو مهمة أو موعد تلقائياً دون تدقيق بشري صريح ومطابقة مع أدلة المستند الأصلي.
          </p>
        </div>
      </div>

      {!canSeeHealth ? (
        <div className="bg-white rounded-[16px] border border-amber-200 p-8 shadow-xs text-center space-y-2">
          <Lock className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">الملفات الصحية محجوبة عن حسابك</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            جميع ملفات الروشتات والتحاليل الطبية مصنفة كـ Health ولا تظهر إلا للأعضاء الحاصلين على تصريح الرؤية الصحية.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Document List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">المستندات المحفوظة ({documents.length})</span>
                <span className="text-[11px] text-slate-400">PDF و PNG حتى 10MB</span>
              </div>

              <div className="space-y-2">
                {documents.map(doc => {
                  const isSelected = selectedDoc?.id === doc.id;
                  const hasPendingReview = doc.ai_run?.status === 'review_required';

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-3.5 rounded-[12px] border text-xs cursor-pointer transition flex items-start justify-between gap-3
                        ${isSelected ? 'bg-indigo-50/70 border-indigo-400 shadow-xs' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <div className="space-y-1 truncate">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                          <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="truncate">{doc.original_name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {(doc.byte_size / 1024).toFixed(0)} KB • رفع بواسطة {doc.uploaded_by_name}
                        </div>
                      </div>

                      {hasPendingReview && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex-shrink-0 border border-amber-200">
                          بانتظار المراجعة
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Document & AI Draft Review Pane (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedDoc ? (
              <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{selectedDoc.original_name}</h3>
                    <span className="text-xs text-slate-400 font-mono">
                      تم الرفع: {new Date(selectedDoc.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    تصنيف: صحي (Health)
                  </span>
                </div>

                {/* AI Run Proposal Details */}
                {selectedDoc.ai_run && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-[12px] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-xs text-slate-900">المسودة المستخرجة بالذكاء الاصطناعي:</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono
                          ${selectedDoc.ai_run.status === 'review_required' ? 'bg-amber-100 text-amber-900' :
                            selectedDoc.ai_run.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedDoc.ai_run.status === 'review_required' ? 'مطلوب مراجعة بشرية' :
                           selectedDoc.ai_run.status === 'accepted' ? 'معتمد بشرياً ✓' : 'مرفوض ✕'}
                        </span>
                      </div>

                      {/* Extracted text */}
                      <div className="bg-white p-3 rounded-[8px] border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                        {selectedDoc.ai_run.extracted_text}
                      </div>

                      {/* Source references quotes */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-600 block">مراجع المصدر وأدلة النص (Source Refs):</span>
                        {selectedDoc.ai_run.source_refs.map((ref, idx) => (
                          <div key={idx} className="p-2 bg-indigo-50/50 rounded-[6px] border border-indigo-100 text-xs text-indigo-900 flex items-start justify-between gap-2">
                            <span>«{ref.quote}»</span>
                            <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{ref.location}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Actions if Pending */}
                    {selectedDoc.ai_run.status === 'review_required' && activeMember?.role !== 'viewer' && (
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => handleReview(false)}
                          className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-[8px] transition min-h-[40px]"
                        >
                          رفض المسودة
                        </button>
                        <button
                          onClick={() => handleReview(true)}
                          className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-[8px] transition min-h-[40px] shadow-xs"
                        >
                          اعتماد المسودة ومطابقة المستند ✓
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[16px] border border-slate-200 p-12 text-center text-xs text-slate-400">
                اختر مستنداً لعرض تفاصيل الاستخراج والمراجعة.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
