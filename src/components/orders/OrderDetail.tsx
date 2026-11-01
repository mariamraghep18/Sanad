import React, { useState } from 'react';
import { 
  ArrowRight, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle, 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  FileEdit,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Order, OrderStatus, OrderEvent } from '../../types/order';
import { OrderStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { orderStorage } from '../../services/orderStorage';

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onReopenReview?: (order: Order) => void;
  onStatusUpdated: () => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onBack,
  onReopenReview,
  onStatusUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const events = orderStorage.getEvents(order.id);

  const handleCopyConfirmation = () => {
    const text = orderStorage.generateOrderConfirmationText(order);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    // Record copy event in timeline (explicitly noting it is NOT proof of sent message!)
    orderStorage.addEvent({
      orderId: order.id,
      type: 'text_copied',
      note: 'تم نسخ نص التأكيد للحافظة (تنبيه: النسخ ليس دليلاً على إرسال الرسالة للعميل)',
    });
    onStatusUpdated();
  };

  const handlePrint = () => {
    orderStorage.addEvent({
      orderId: order.id,
      type: 'printed',
      note: 'تم طباعة ملخص الطلب أو تصديره إلى PDF',
    });
    window.print();
  };

  const handleTransition = (newStatus: OrderStatus) => {
    setStatusError(null);
    const res = orderStorage.updateOrderStatus(order.id, newStatus);
    if (!res.success) {
      setStatusError(res.error || 'تعذر تغيير الحالة');
    } else {
      onStatusUpdated();
    }
  };

  // Status Machine Available Actions
  const renderStatusActions = () => {
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return (
        <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-[8px]">
          هذه حالة نهائية (Terminal State) ولا يمكن التعديل بعدها
        </span>
      );
    }

    if (order.status === 'draft') {
      return (
        <div className="flex items-center gap-2">
          {onReopenReview && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onReopenReview(order)}
              icon={<FileEdit className="w-4 h-4 ml-1" />}
            >
              استكمال تدقيق المسودة
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleTransition('cancelled')}
          >
            إلغاء المسودة
          </Button>
        </div>
      );
    }

    if (order.fulfillment === 'delivery') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {order.status === 'confirmed' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleTransition('preparing')}
            >
              بدء التجهيز ➔
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleTransition('shipped')}
            >
              تسليم لشركة الشحن ➔
            </Button>
          )}
          {order.status === 'shipped' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTransition('delivered')}
            >
              تم التسليم والتحصيل ✓
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-red-700 hover:bg-red-50"
            onClick={() => handleTransition('cancelled')}
          >
            إلغاء الطلب
          </Button>
        </div>
      );
    } else {
      // Pickup
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {order.status === 'confirmed' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleTransition('preparing')}
            >
              تجهيز للاستلام ➔
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTransition('delivered')}
            >
              تم استلام العميل ✓
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-red-700 hover:bg-red-50"
            onClick={() => handleTransition('cancelled')}
          >
            إلغاء الطلب
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-[8px] min-h-[44px] min-w-[44px] flex items-center justify-center transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold font-mono text-[#0F172A]">{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} />
              {order.isDraft && (
                <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                  مسودة
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              تم الإنشاء: {new Date(order.createdAt).toLocaleString('ar-EG')} (توقيت القاهرة)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4 ml-1" />}
            title="طباعة ملخص الطلب أو حفظه PDF"
          >
            طباعة ملخص
          </Button>
          <Button
            variant="primary"
            onClick={handleCopyConfirmation}
            icon={copied ? <Check className="w-4 h-4 ml-1 text-emerald-300" /> : <Copy className="w-4 h-4 ml-1" />}
          >
            {copied ? 'تم النسخ للحافظة!' : 'نسخ رسالة العميل'}
          </Button>
        </div>
      </div>

      {/* Copy Note Disclaimer */}
      {copied && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[10px] text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in print:hidden">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            تم نسخ نص الرسالة بنجاح. تذكير أمني: نسخ النص أو إرساله للعميل لا يعتبر نظامياً إشعاراً مؤكداً بالاستلام حتى يسجل ذلك التاجر يدوياً.
          </span>
        </div>
      )}

      {/* State Machine Transition Bar */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs text-slate-500 block">الحالة الحالية:</span>
          <span className="text-sm font-bold text-slate-900">
            {orderStorage.getStatusLabel(order.status)} ({order.fulfillment === 'delivery' ? 'شحن وتوصيل' : 'استلام من المقر'})
          </span>
        </div>
        <div>
          {renderStatusActions()}
        </div>
      </div>

      {statusError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-800 flex items-center gap-2 print:hidden">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{statusError}</span>
        </div>
      )}

      {/* Printable Sheet (Standardized Layout) */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 md:p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Printable Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-[#0F172A]">متجر القاهرة الرئيسي</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-mono">EGP</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">ملخص طلب عميل (Order Summary) - غير صالح كفاتورة ضريبية</p>
          </div>
          <div className="text-left font-mono">
            <span className="text-base font-bold text-[#6D5EF5] block">{order.orderNumber}</span>
            <span className="text-xs text-slate-500 block">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
        </div>

        {/* Customer & Delivery Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-[12px] border border-slate-200 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block text-sm">بيانات العميل:</span>
            <p className="text-slate-700"><strong>الاسم:</strong> {order.customerName || 'غير مسجل'}</p>
            <p className="text-slate-700"><strong>الهاتف:</strong> <span className="ltr-text font-mono">{order.phone || 'غير مسجل'}</span></p>
            <p className="text-slate-700"><strong>طريقة الاستلام:</strong> {order.fulfillment === 'delivery' ? 'شحن وتوصيل للمنزل' : 'استلام من المتجر'}</p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 block text-sm">عنوان الشحن والتعليمات:</span>
            <p className="text-slate-700"><strong>العنوان:</strong> {order.address || (order.fulfillment === 'pickup' ? 'استلام من المقر' : 'غير مسجل')}</p>
            {order.notes && (
              <p className="text-slate-700"><strong>ملاحظات:</strong> {order.notes}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-[#0F172A]">أصناف الطلب:</h3>
          <div className="border border-[#E2E8F0] rounded-[10px] overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-bold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">الصنف والتفاصيل</th>
                  <th className="p-3 text-center">الكمية</th>
                  <th className="p-3 text-left">سعر الوحدة</th>
                  <th className="p-3 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {order.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/40">
                    <td className="p-3 text-slate-400 font-mono">{index + 1}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.color && <span>اللون: {item.color} </span>}
                        {item.size && <span>• المقاس: {item.size}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-semibold">{item.quantity}</td>
                    <td className="p-3 text-left font-mono">
                      {(item.unitPriceCents / 100).toFixed(2)} ج.م
                    </td>
                    <td className="p-3 text-left font-mono font-semibold text-slate-900">
                      {(item.totalCents / 100).toFixed(2)} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
          <div className="text-xs text-slate-500 max-w-sm">
            <p><strong>تنبيه قانوني:</strong> هذا المستند عبارة عن بيان استلام وتجهيز طلب داخلي صادر عن منصة بَيْعة، وليس فاتورة ضريبية إلكترونية معتمدة.</p>
          </div>

          <div className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-[12px] p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>المجموع الفرعي:</span>
              <span className="font-mono font-semibold">
                {order.subtotalCents !== null ? `${(order.subtotalCents / 100).toFixed(2)} ج.م` : 'غير محدد'}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>مصاريف الشحن:</span>
              <span className="font-mono font-semibold">
                {order.shippingFeeCents !== null ? `${(order.shippingFeeCents / 100).toFixed(2)} ج.م` : 'غير محدد'}
              </span>
            </div>
            {order.discountCents > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>الخصم:</span>
                <span className="font-mono font-semibold">-{(order.discountCents / 100).toFixed(2)} ج.م</span>
              </div>
            )}
            <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-[#0F172A]">
              <span>الإجمالي المستحق:</span>
              <span className="font-mono text-base text-[#6D5EF5]">
                {order.totalCents !== null ? `${(order.totalCents / 100).toFixed(2)} ج.م` : 'غير محدد'}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Log / Events Timeline */}
        <div className="border-t border-slate-200 pt-5 space-y-3 print:hidden">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6D5EF5]" />
            <h4 className="font-bold text-xs text-[#0F172A]">سجل أحداث وتدقيق الطلب (Audit Timeline)</h4>
          </div>

          <div className="space-y-2">
            {events.map((evt) => (
              <div key={evt.id} className="text-xs flex items-start gap-2 bg-slate-50 p-2.5 rounded-[8px] border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-[#6D5EF5] mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold text-slate-900">{evt.note}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {new Date(evt.timestamp).toLocaleString('ar-EG')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
