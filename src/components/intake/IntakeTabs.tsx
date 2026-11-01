import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Image as ImageIcon, 
  Mic, 
  Sparkles, 
  FileEdit, 
  AlertCircle, 
  UploadCloud, 
  FileQuestion,
  HelpCircle
} from 'lucide-react';
import { Button } from '../common/Button';
import { SYNTHETIC_DEMO_TEXT, SAMPLE_INPUTS } from '../../services/mockProvider';
import { SourceData } from '../../types/order';

interface IntakeTabsProps {
  onStartExtraction: (source: SourceData) => void;
  onManualEntry: () => void;
  isLoading?: boolean;
}

export const IntakeTabs: React.FC<IntakeTabsProps> = ({
  onStartExtraction,
  onManualEntry,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'audio'>('text');
  const [textContent, setTextContent] = useState<string>(SYNTHETIC_DEMO_TEXT);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string; previewUrl?: string } | null>(null);

  // Character limit validation
  const charLimit = 6000;
  const charsRemaining = charLimit - textContent.length;

  const handleSelectSample = (text: string) => {
    setTextContent(text);
    setFileError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, expectedType: 'image' | 'audio') => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (expectedType === 'image') {
      // Image validation: <= 8MB, reject SVG, HTML, executables
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.type)) {
        setFileError('نوع الملف غير مدعوم. يُسمح فقط بصور PNG أو JPEG أو WebP (يُحظر ملفات SVG أو HTML لأسباب أمنية).');
        setSelectedFile(null);
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setFileError('حجم الصورة يتجاوز الحد الأقصى المسموح به (8 ميجابايت).');
        setSelectedFile(null);
        return;
      }
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
      });
    } else {
      // Audio validation: <= 15MB, valid audio formats
      const allowedAudio = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
      if (!allowedAudio.some(type => file.type.includes('audio') || file.name.endsWith('.mp3') || file.name.endsWith('.m4a') || file.name.endsWith('.wav'))) {
        setFileError('صيغة الصوت غير مدعومة. يُسمح بملفات MP3 أو M4A أو WAV.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setFileError('حجم التسجيل الصوتي يتجاوز الحد الأقصى (15 ميجابايت).');
        setSelectedFile(null);
        return;
      }
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  };

  const handleExtract = () => {
    setFileError(null);

    if (activeTab === 'text') {
      if (!textContent.trim()) {
        setFileError('يرجى كتابة أو لصق رسالة الطلب أولاً.');
        return;
      }
      if (textContent.length > charLimit) {
        setFileError(`النص يتجاوز الحد الأقصى المسموح (${charLimit} حرف).`);
        return;
      }

      onStartExtraction({
        id: 'src-txt-' + Date.now().toString(36),
        type: 'text',
        content: textContent.trim(),
        createdAt: new Date().toISOString(),
      });
    } else if (activeTab === 'image') {
      if (!selectedFile) {
        setFileError('يرجى اختيار صورة لقطة الشاشة أولاً.');
        return;
      }
      onStartExtraction({
        id: 'src-img-' + Date.now().toString(36),
        type: 'image',
        content: textContent || 'محادثة واتساب مصورة: طلب تيشيرت أسود مقاس M مع شحن للمعادي',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        createdAt: new Date().toISOString(),
      });
    } else {
      if (!selectedFile) {
        setFileError('يرجى اختيار ملف صوتي مسجل أولاً.');
        return;
      }
      onStartExtraction({
        id: 'src-aud-' + Date.now().toString(36),
        type: 'audio',
        content: textContent || 'تسجيل صوتي: عايزة تيشيرت أسود مقاس M، قطعة واحدة، والشحن للمعادي.',
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">استقبال وتدقيق طلب جديد</h1>
          <p className="text-sm text-[#64748B] mt-1">
            الصق رسالة العميل، أو ارفع لقطة شاشة، أو تسجيلاً صوتياً لاستخراج مسودة الطلب مع تدقيق الأدلة.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onManualEntry}
          icon={<FileEdit className="w-4 h-4 ml-1" />}
        >
          أدخل الطلب يدوياً
        </Button>
      </div>

      {/* Primary Intake Card */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex border-b border-[#E2E8F0] bg-slate-50/70 p-1.5 gap-1.5">
          <button
            onClick={() => { setActiveTab('text'); setFileError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-[10px] transition min-h-[44px]
              ${activeTab === 'text' 
                ? 'bg-white text-[#6D5EF5] shadow-xs border border-[#E2E8F0]' 
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/60'}`}
          >
            <MessageSquareText className="w-4 h-4 ml-1" />
            <span>نص الرسالة</span>
          </button>
          <button
            onClick={() => { setActiveTab('image'); setFileError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-[10px] transition min-h-[44px]
              ${activeTab === 'image' 
                ? 'bg-white text-[#6D5EF5] shadow-xs border border-[#E2E8F0]' 
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/60'}`}
          >
            <ImageIcon className="w-4 h-4 ml-1" />
            <span>لقطة شاشة محادثة</span>
          </button>
          <button
            onClick={() => { setActiveTab('audio'); setFileError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-[10px] transition min-h-[44px]
              ${activeTab === 'audio' 
                ? 'bg-white text-[#6D5EF5] shadow-xs border border-[#E2E8F0]' 
                : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100/60'}`}
          >
            <Mic className="w-4 h-4 ml-1" />
            <span>تسجيل صوتي</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 md:p-6 space-y-4">
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0F172A]">
                  رسالة العميل (واتساب / إنستغرام / فيسبوك)
                </label>
                <span className={`text-xs ${charsRemaining < 0 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                  {charsRemaining} حرف متبقي
                </span>
              </div>
              <textarea
                rows={5}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="الصق رسالة العميل هنا..."
                className="w-full p-3.5 text-sm bg-white border border-[#E2E8F0] rounded-[10px] focus:ring-2 focus:ring-[#6D5EF5]/20 focus:border-[#6D5EF5] focus:outline-none text-[#0F172A] leading-relaxed resize-y"
              />

              {/* Sample Messages Quick Picker */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-[#64748B] block mb-2">
                  نماذج اختبار سريعة (مطابقة لمواصفات المرحلة الأولى):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {SAMPLE_INPUTS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample.text)}
                      className={`text-right p-2.5 rounded-[10px] border text-xs transition min-h-[44px] flex flex-col justify-between
                        ${textContent === sample.text 
                          ? 'border-[#6D5EF5] bg-[#EEF2FF] text-[#6D5EF5] font-medium' 
                          : 'border-[#E2E8F0] bg-slate-50/50 hover:bg-slate-100 text-slate-700'}`}
                    >
                      <span className="font-semibold block">{sample.title}</span>
                      <span className="text-[11px] text-[#64748B] mt-1 truncate block">{sample.expectedSummary}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#6D5EF5]/60 rounded-[12px] p-6 text-center transition bg-slate-50/40">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'image')}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#6D5EF5] flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">اضغط لرفع لقطة شاشة المحادثة</span>
                  <span className="text-xs text-[#64748B] mt-1">PNG أو JPG حتى 8 ميجابايت (صورة واحدة فقط)</span>
                </label>
              </div>

              {selectedFile ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[10px] border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    {selectedFile.previewUrl && (
                      <img src={selectedFile.previewUrl} alt="معاينة" className="w-12 h-12 object-cover rounded-[8px] border" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">{selectedFile.name}</p>
                      <p className="text-[11px] text-[#64748B] ltr-text">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-red-600 hover:underline px-2 py-1"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/60 rounded-[10px] text-xs text-indigo-900 flex items-center justify-between">
                  <span>أو استخدم صورة لقطة شاشة تجريبية جاهزة للاختبار:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile({
                        name: 'whatsapp_screenshot_demo.png',
                        size: 245 * 1024,
                        type: 'image/png',
                      });
                      setTextContent(SYNTHETIC_DEMO_TEXT);
                    }}
                    className="font-bold text-[#6D5EF5] underline hover:text-[#5C4DE3]"
                  >
                    تحميل لقطة شاشة المعادي
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#E2E8F0] hover:border-[#6D5EF5]/60 rounded-[12px] p-6 text-center transition bg-slate-50/40">
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'audio')}
                />
                <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#6D5EF5] flex items-center justify-center mb-3">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">اضغط لرفع ملف صوتي مسجل</span>
                  <span className="text-xs text-[#64748B] mt-1">MP3 أو M4A أو WAV حتى 15 ميجابايت (مدة حتى 120 ثانية)</span>
                </label>
              </div>

              {selectedFile ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-[10px] border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                      🎵
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">{selectedFile.name}</p>
                      <p className="text-[11px] text-[#64748B] ltr-text">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-red-600 hover:underline px-2 py-1"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/60 rounded-[10px] text-xs text-indigo-900 flex items-center justify-between">
                  <span>أو استخدم تسجيلاً صوتياً تجريبياً جاهزاً:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile({
                        name: 'voice_note_maadi.m4a',
                        size: 420 * 1024,
                        type: 'audio/m4a',
                      });
                      setTextContent(SYNTHETIC_DEMO_TEXT);
                    }}
                    className="font-bold text-[#6D5EF5] underline hover:text-[#5C4DE3]"
                  >
                    تحميل تسجيل المعادي
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Validation Error Message */}
          {fileError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Core Rule Guarantee Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-[10px] text-xs text-slate-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>قاعدة الأمان:</strong> النتيجة المستخرجة هي مجرد <em>اقتراح مبني على الأدلة</em> وليست طلباً معتمداً. الحقول الناقصة تظل فارغة (Null) ولا يتم اختراع أي أرقام أو أسعار، ولن يتم إنشاء طلب مؤكد إلا بعد مراجعتك واعتمادك الصريح.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="primary"
              size="lg"
              isLoading={isLoading}
              onClick={handleExtract}
              icon={<Sparkles className="w-5 h-5 ml-1.5" />}
              className="w-full sm:w-auto font-bold px-8"
            >
              استخرج مسودة الطلب
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
