import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Save, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  HelpCircle,
  FileCheck2,
  FileText,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { OrderReview, ProposedItem, ProposedField, ReviewState, SourceData, Order } from '../../types/order';
import { ReviewBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { orderStorage, INITIAL_CATALOG } from '../../services/orderStorage';

interface ReviewScreenProps {
  review: OrderReview;
  source: SourceData;
  onSaveDraft: (updatedReview: OrderReview) => void;
  onApproveOrder: (updatedReview: OrderReview) => void;
  onBackToIntake: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  review: initialReview,
  source,
  onSaveDraft,
  onApproveOrder,
  onBackToIntake,
}) => {
  const [review, setReview] = useState<OrderReview>(initialReview);
  const [mobileTab, setMobileTab] = useState<'order' | 'source'>('order');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const catalog = orderStorage.getCatalog();

  // Helper to mark field as user edited
  const updateField = <T,>(
    getter: (prev: OrderReview) => ProposedField<T>,
    setter: (val: ProposedField<T>) => Partial<OrderReview>,
    newValue: T | null
  ) => {
    setHasUnsavedChanges(true);
    setReview(prev => {
      const current = getter(prev);
      const isOriginal = current.value === newValue;
      const updatedField: ProposedField<T> = {
        value: newValue,
        evidence: current.evidence,
        review_state: isOriginal ? current.review_state : 'user_edited',
      };
      return {
        ...prev,
        ...setter(updatedField),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Items manipulation
  const updateItemField = <K extends keyof ProposedItem>(
    itemId: string,
    fieldKey: K,
    newValue: any
  ) => {
    setHasUnsavedChanges(true);
    setReview(prev => {
      const newItems = prev.items.map(item => {
        if (item.id !== itemId) return item;

        // If fieldKey is 'catalog_product_id', update catalog ID and optionally auto-fill price
        if (fieldKey === 'catalog_product_id') {
          const matchedProd = catalog.find(p => p.id === newValue);
          return {
            ...item,
            catalog_product_id: newValue,
            unit_price_cents: matchedProd 
              ? { value: matchedProd.referencePriceCents, evidence: 'من الكتالوج', review_state: 'user_edited' as ReviewState }
              : item.unit_price_cents,
          };
        }

        const currentField = item[fieldKey] as ProposedField<any>;
        return {
          ...item,
          [fieldKey]: {
            ...currentField,
            value: newValue,
            review_state: 'user_edited' as ReviewState,
          },
        };
      });

      return {
        ...prev,
        items: newItems,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleAddItem = () => {
    setHasUnsavedChanges(true);
    const newItem: ProposedItem = {
      id: 'item-' + Date.now().toString(36),
      name: { value: '', evidence: null, review_state: 'user_edited' },
      color: { value: null, evidence: null, review_state: 'user_edited' },
      size: { value: null, evidence: null, review_state: 'user_edited' },
      quantity: { value: 1, evidence: null, review_state: 'user_edited' },
      unit_price_cents: { value: null, evidence: null, review_state: 'missing' },
      catalog_product_id: null,
    };
    setReview(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (review.items.length <= 1) {
      alert('يجب أن يحتوي الطلب على صنف واحد على الأقل.');
      return;
    }
    setHasUnsavedChanges(true);
    setReview(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id),
    }));
  };

  // Calculations: minor units (100 = 1 EGP). Null if any item price is missing!
  let subtotalCents: number | null = 0;
  for (const item of review.items) {
    if (item.unit_price_cents.value === null || item.unit_price_cents.value === undefined) {
      subtotalCents = null;
      break;
    }
    subtotalCents += (item.unit_price_cents.value || 0) * (item.quantity.value || 1);
  }

  const shippingFee = review.fulfillment.value === 'pickup' ? 0 : review.shippingFeeCents.value;
  let totalCents: number | null = null;
  if (subtotalCents !== null && shippingFee !== null) {
    totalCents = Math.max(0, subtotalCents + shippingFee - (review.discountCents || 0));
  }

  // Real-time blocker check
  const blockers = orderStorage.getApprovalBlockers(review);
  const isEligibleForApproval = blockers.length === 0 && review.inputAssessment !== 'multiple_orders' && review.inputAssessment !== 'not_an_order';

  const handleApprove = () => {
    setApprovalError(null);
    if (!isEligibleForApproval) {
      setApprovalError('يرجى استكمال الحقول المطلوبة وحل التحذيرات قبل الاعتماد.');
      return;
    }
    onApproveOrder(review);
  };

  const handleSaveDraft = () => {
    setHasUnsavedChanges(false);
    onSaveDraft(review);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8FA]">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3.5 sticky top-0 z-20 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (hasUnsavedChanges) setShowExitConfirm(true);
              else onBackToIntake();
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-[8px] min-h-[44px] min-w-[44px] flex items-center justify-center transition"
            title="رجوع للمدخلات"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-[#0F172A]">تدقيق مسودة الطلب</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                بيانات تجريبية
              </span>
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  تعديلات غير محفوظة
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] hidden sm:block">
              راجع الحقول المستخرجة وقارنها بالأدلة النصية قبل الحفظ أو الاعتماد.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            icon={<Save className="w-4 h-4 ml-1" />}
            title="يمكن حفظ المسودة في أي وقت حتى لو كانت غير مكتملة"
          >
            حفظ كمسودة
          </Button>

          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={!isEligibleForApproval}
            icon={<CheckCircle2 className="w-4 h-4 ml-1" />}
            title={!isEligibleForApproval ? 'الاعتماد غير متاح لوجود بيانات ناقصة' : 'اعتماد ونقل للطلبات المؤكدة'}
          >
            اعتماد الطلب
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher (at 360px) */}
      <div className="md:hidden bg-slate-100 p-1 border-b border-[#E2E8F0] flex gap-1">
        <button
          onClick={() => setMobileTab('order')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-[8px] transition min-h-[44px]
            ${mobileTab === 'order' ? 'bg-white text-[#6D5EF5] shadow-xs' : 'text-slate-600'}`}
        >
          بيانات الطلب والبنود
        </button>
        <button
          onClick={() => setMobileTab('source')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-[8px] transition min-h-[44px]
            ${mobileTab === 'source' ? 'bg-white text-[#6D5EF5] shadow-xs' : 'text-slate-600'}`}
        >
          المصدر والأدلة
        </button>
      </div>

      {/* Main Two-Pane Body */}
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Right Pane (in RTL: Main Order Form) - 7 cols on lg */}
        <div className={`space-y-6 ${mobileTab === 'order' ? 'block' : 'hidden lg:block'} lg:col-span-7`}>
          
          {/* Assessment Warnings Banner */}
          {review.warnings && review.warnings.length > 0 && (
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[16px] p-4 text-[#92400E] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-[#92400E] flex-shrink-0" />
                <span>تنبيهات وتدقيق النظام:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
                {review.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Multiple Orders Blocker Banner */}
          {review.inputAssessment === 'multiple_orders' && (
            <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span>تم حظر التقدم التلقائي: تم رصد طلبين منفصلين!</span>
              </div>
              <p className="text-xs leading-relaxed">
                بموجب القاعدة رقم 5: الرسالة تحتوي على أكثر من طلب لعنوانين أو مستلمين. يجب فصل الرسالة إلى طلبين منفصلين، أو إدخال كل طلب يدوياً لمنع خلط الشحنات.
              </p>
            </div>
          )}

          {/* Customer & Delivery Section Card */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <span>بيانات العميل والتوصيل</span>
              </h2>
              <span className="text-xs text-[#64748B]">اضغط على أي حقل للتعديل</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Name */}
              <Input
                label="اسم العميل"
                value={review.customerName.value || ''}
                placeholder="مثال: سارة عبد الرحمن"
                badge={<ReviewBadge state={review.customerName.review_state} />}
                onChange={(e) => updateField(
                  r => r.customerName,
                  val => ({ customerName: val }),
                  e.target.value || null
                )}
                error={!review.customerName.value ? 'مفقود بالرسالة - مطلوب للاعتماد' : undefined}
              />

              {/* Phone (Preserves LTR) */}
              <Input
                label="رقم الهاتف"
                isLtr
                value={review.phone.value || ''}
                placeholder="01xxxxxxxxx"
                badge={<ReviewBadge state={review.phone.review_state} />}
                onChange={(e) => updateField(
                  r => r.phone,
                  val => ({ phone: val }),
                  e.target.value || null
                )}
                error={!review.phone.value ? 'مفقود بالرسالة - مطلوب للاعتماد' : undefined}
                helperText="يُحفظ النص الأصلي بدون تخمين كود الدولة"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Fulfillment Type */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0F172A]">نوع الاستلام</label>
                  <ReviewBadge state={review.fulfillment.review_state} />
                </div>
                <select
                  value={review.fulfillment.value || 'delivery'}
                  onChange={(e) => updateField(
                    r => r.fulfillment,
                    val => ({ fulfillment: val }),
                    e.target.value as any
                  )}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-[10px] min-h-[44px] focus:ring-2 focus:ring-[#6D5EF5]/20 focus:border-[#6D5EF5] focus:outline-none"
                >
                  <option value="delivery">شحن وتوصيل للمنزل</option>
                  <option value="pickup">استلام من مقر المتجر</option>
                </select>
              </div>

              {/* Address (If delivery) */}
              <div className="sm:col-span-2 space-y-1.5">
                <Input
                  label="عنوان التوصيل"
                  value={review.address.value || ''}
                  placeholder={review.fulfillment.value === 'pickup' ? 'غير مطلوب للاستلام من المتجر' : 'العنوان بالتفصيل'}
                  disabled={review.fulfillment.value === 'pickup'}
                  badge={<ReviewBadge state={review.address.review_state} />}
                  onChange={(e) => updateField(
                    r => r.address,
                    val => ({ address: val }),
                    e.target.value || null
                  )}
                  error={review.fulfillment.value === 'delivery' && !review.address.value ? 'مطلوب لطلبات الشحن' : undefined}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0F172A]">ملاحظات أو تعليمات خاصة</label>
                {review.notes.evidence && <ReviewBadge state={review.notes.review_state} />}
              </div>
              <input
                type="text"
                value={review.notes.value || ''}
                placeholder="مثال: تسليم بعد الساعة 5 مساءً"
                onChange={(e) => updateField(
                  r => r.notes,
                  val => ({ notes: val }),
                  e.target.value || null
                )}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#E2E8F0] rounded-[10px] min-h-[44px] focus:ring-2 focus:ring-[#6D5EF5]/20 focus:border-[#6D5EF5] focus:outline-none"
              />
            </div>
          </div>

          {/* Items Section Card */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">الأصناف المطلوبة</h2>
                <span className="text-xs text-[#64748B]">تطابق المنتجات يتم مع كتالوج متجرك فقط، ولا يتم اختراع أسعار</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddItem}
                icon={<Plus className="w-3.5 h-3.5 ml-1" />}
              >
                إضافة صنف
              </Button>
            </div>

            <div className="space-y-4">
              {review.items.map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-50/70 border border-[#E2E8F0] rounded-[12px] space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">بند رقم {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <ReviewBadge state={item.name.review_state} />
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 min-h-[36px] min-w-[36px] flex items-center justify-center transition"
                        title="حذف هذا البند"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Item Name */}
                    <div className="sm:col-span-5">
                      <Input
                        label="اسم المنتج"
                        value={item.name.value || ''}
                        placeholder="اسم الصنف"
                        onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                        error={!item.name.value ? 'مطلوب' : undefined}
                      />
                    </div>

                    {/* Catalog Link */}
                    <div className="sm:col-span-4 space-y-1.5">
                      <label className="text-xs font-semibold text-[#0F172A] block">ربط بكتالوج المتجر</label>
                      <select
                        value={item.catalog_product_id || ''}
                        onChange={(e) => updateItemField(item.id, 'catalog_product_id', e.target.value || null)}
                        className="w-full px-2.5 py-2.5 text-xs bg-white border border-[#E2E8F0] rounded-[10px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]/20 focus:border-[#6D5EF5]"
                      >
                        <option value="">(صنف حر بدون كتالوج)</option>
                        {catalog.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} ({cat.referencePriceCents / 100} ج.م)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-3">
                      <Input
                        label="الكمية"
                        type="number"
                        min="1"
                        step="1"
                        isLtr
                        value={item.quantity.value || 1}
                        onChange={(e) => updateItemField(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Color */}
                    <Input
                      label="اللون"
                      value={item.color.value || ''}
                      placeholder="مثال: أسود"
                      onChange={(e) => updateItemField(item.id, 'color', e.target.value || null)}
                    />

                    {/* Size */}
                    <Input
                      label="المقاس"
                      value={item.size.value || ''}
                      placeholder="مثال: M أو L"
                      onChange={(e) => updateItemField(item.id, 'size', e.target.value || null)}
                    />

                    {/* Unit Price (in EGP) */}
                    <div>
                      <Input
                        label="سعر القطعة (ج.م)"
                        type="number"
                        min="0"
                        isLtr
                        placeholder="غير محدد"
                        value={item.unit_price_cents.value !== null ? (item.unit_price_cents.value / 100) : ''}
                        badge={<ReviewBadge state={item.unit_price_cents.review_state} />}
                        onChange={(e) => {
                          const val = e.target.value;
                          const cents = val === '' ? null : Math.round(parseFloat(val) * 100);
                          updateItemField(item.id, 'unit_price_cents', cents);
                        }}
                        error={item.unit_price_cents.value === null ? 'مفقود بالرسالة - مطلوب للاعتماد' : undefined}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Totals Card */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 md:p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#0F172A] border-b border-slate-100 pb-3">
              الحسابات والإجمالي (بالجنيه المصري EGP)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shipping Charge */}
              {review.fulfillment.value === 'delivery' && (
                <Input
                  label="مصاريف الشحن (ج.م)"
                  type="number"
                  min="0"
                  isLtr
                  value={review.shippingFeeCents.value !== null ? (review.shippingFeeCents.value / 100) : ''}
                  placeholder="0 ج.م للشحن المجاني"
                  badge={<ReviewBadge state={review.shippingFeeCents.review_state} />}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cents = val === '' ? null : Math.round(parseFloat(val) * 100);
                    updateField(
                      r => r.shippingFeeCents,
                      field => ({ shippingFeeCents: field }),
                      cents
                    );
                  }}
                  error={review.shippingFeeCents.value === null ? 'يجب تحديد قيمة الشحن (يمكن وضع 0 إذا مجاني)' : undefined}
                />
              )}

              {/* Discount */}
              <Input
                label="قيمة الخصم (ج.م)"
                type="number"
                min="0"
                isLtr
                value={(review.discountCents / 100) || 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setReview(prev => ({
                    ...prev,
                    discountCents: Math.round(val * 100),
                  }));
                }}
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 rounded-[12px] p-4 space-y-2.5 text-sm border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي للأصناف:</span>
                <span className="font-mono font-semibold">
                  {subtotalCents !== null ? `${(subtotalCents / 100).toFixed(2)} ج.م` : 'غير محدد (أسعار ناقصة)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>مصاريف الشحن والتوصيل:</span>
                <span className="font-mono font-semibold">
                  {shippingFee !== null ? `${(shippingFee / 100).toFixed(2)} ج.م` : 'غير محدد'}
                </span>
              </div>
              {review.discountCents > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>الخصم المطبق:</span>
                  <span className="font-mono font-semibold">-{(review.discountCents / 100).toFixed(2)} ج.م</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base text-[#0F172A]">
                <span>الإجمالي النهائي المستحق:</span>
                <span className="font-mono text-[#6D5EF5] text-lg">
                  {totalCents !== null ? `${(totalCents / 100).toFixed(2)} ج.م` : 'غير محدد (Null)'}
                </span>
              </div>
            </div>

            {totalCents === null && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-[8px] border border-amber-200">
                <strong>ملاحظة حاسوبية:</strong> الإجمالي غير محدد لأن أحد الأصناف أو الشحن لا يحتوي على سعر مسجل. النظام يرفض وضع إجمالي = صفر عند نقص الأسعار التزاماً بالقاعدة رقم 9.
              </p>
            )}
          </div>
        </div>

        {/* Left Pane (Source & Evidence) - 5 cols on lg */}
        <div className={`space-y-6 ${mobileTab === 'source' ? 'block' : 'hidden lg:block'} lg:col-span-5`}>
          
          {/* Evidence Inspector Card */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6D5EF5]" />
                <h3 className="font-bold text-sm text-[#0F172A]">المصدر الأصلي والأدلة</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {source.type === 'text' ? 'نص رسالة' : source.type === 'image' ? 'لقطة شاشة' : 'تسجيل صوتي'}
              </span>
            </div>

            {/* Raw Source Preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">نص المحادثة المستلمة:</label>
              <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-3 text-xs text-slate-800 leading-relaxed font-sans max-h-48 overflow-y-auto">
                {source.content}
              </div>
            </div>

            {/* Extracted Evidence Mapping Table */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 block">مطابقة الأدلة المستخرجة:</label>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-[8px] border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">المنتج والصفات:</span>
                    <ReviewBadge state={review.items[0]?.name.review_state || 'from_source'} />
                  </div>
                  <p className="text-slate-600">
                    الدليل: <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">{review.items[0]?.name.evidence || 'عايزة تيشيرت أسود'}</code>
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-[8px] border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">الكمية والمقاس:</span>
                    <ReviewBadge state="from_source" />
                  </div>
                  <p className="text-slate-600">
                    الدليل: <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">مقاس M، قطعة واحدة</code>
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-[8px] border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">العنوان المستخرج:</span>
                    <ReviewBadge state={review.address.review_state} />
                  </div>
                  <p className="text-slate-600">
                    الدليل: <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded">{review.address.evidence || 'والشحن للمعادي'}</code>
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1">حالة "محتاج مراجعة": العنوان مذكور كمنطقة ويحتاج تفصيل الشارع والعمارة.</p>
                </div>

                <div className="p-2.5 bg-red-50/60 rounded-[8px] border border-red-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-red-900">الهاتف والاسم والأسعار:</span>
                    <ReviewBadge state="missing" />
                  </div>
                  <p className="text-red-700">
                    القيمة: <code className="bg-red-100 text-red-800 px-1 py-0.5 rounded">null</code> (لم يتم العثور على أي دليل في المصدر).
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Blocker Checklist */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>شروط اعتماد الطلب:</span>
                {isEligibleForApproval ? (
                  <span className="text-emerald-700 text-xs font-bold">جاهز للاعتماد ✓</span>
                ) : (
                  <span className="text-red-700 text-xs font-bold">معطل ({blockers.length} نواقص)</span>
                )}
              </h4>

              <div className="space-y-1.5 text-xs">
                {blockers.map((b, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-red-700 bg-red-50 p-2 rounded-[6px]">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>{b}</span>
                  </div>
                ))}

                {isEligibleForApproval && (
                  <div className="text-emerald-700 bg-emerald-50 p-2.5 rounded-[6px] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>جميع البيانات مكتملة ويمكنك الآن اعتماد الطلب رسمياً.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Helper Button to auto-fill missing values for test convenience */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setReview(prev => ({
                    ...prev,
                    customerName: { value: 'مريم علي', evidence: 'تم الإدخال يدوياً', review_state: 'user_edited' },
                    phone: { value: '01023456789', evidence: 'تم الإدخال يدوياً', review_state: 'user_edited' },
                    address: { value: 'شارع 9، المعادي، القاهرة', evidence: 'تم الإدخال يدوياً', review_state: 'user_edited' },
                    shippingFeeCents: { value: 4500, evidence: '45 ج.م', review_state: 'user_edited' },
                    items: prev.items.map(it => ({
                      ...it,
                      unit_price_cents: it.unit_price_cents.value ? it.unit_price_cents : { value: 28000, evidence: '280 ج.م', review_state: 'user_edited' },
                    })),
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-[#6D5EF5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-[8px] border border-[#C7D2FE] transition text-center min-h-[38px]"
              >
                ⚡ تعبئة النواقص التجريبية بنقرة واحدة (للاختبار السريع)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">تعديلات غير محفوظة</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              لديك تعديلات على هذه المسودة لم تقم بحفظها. هل ترغب في حفظ المسودة قبل الخروج؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowExitConfirm(false)}>
                البقاء هنا
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowExitConfirm(false);
                  onBackToIntake();
                }}
              >
                تجاهل وخروج
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowExitConfirm(false);
                  handleSaveDraft();
                }}
              >
                حفظ وخروج
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
