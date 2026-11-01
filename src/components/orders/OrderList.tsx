import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  FileEdit, 
  Clock, 
  Phone, 
  MapPin, 
  ShoppingBag,
  ChevronLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/order';
import { OrderStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { orderStorage } from '../../services/orderStorage';

interface OrderListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onNewOrder: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onSelectOrder,
  onNewOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  // Filter & Search
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      (order.customerName && order.customerName.toLowerCase().includes(query)) ||
      (order.phone && order.phone.includes(query)) ||
      (order.address && order.address.toLowerCase().includes(query)) ||
      order.items.some(it => it.name.toLowerCase().includes(query))
    );
  });

  const handleExportCsv = () => {
    const csvContent = orderStorage.generateSafeCsv(filteredOrders);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bay3a_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusTabs: { id: OrderStatus | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: orders.length },
    { id: 'draft', label: 'مسودات', count: orders.filter(o => o.status === 'draft').length },
    { id: 'confirmed', label: 'مؤكدة', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'preparing', label: 'قيد التجهيز', count: orders.filter(o => o.status === 'preparing').length },
    { id: 'shipped', label: 'تم الشحن', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'تم التسليم', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'ملغية', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">سجل الطلبات والمسودات</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5]">
              {orders.length} طلب
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            متابعة دورة حياة الطلبات من استخراج المسودة حتى الاعتماد والتسليم.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            icon={<Download className="w-4 h-4 ml-1" />}
            title="تصدير CSV آمن ومحصن ضد ثغرات معادلات الجداول"
          >
            تصدير CSV آمن
          </Button>

          <Button
            variant="primary"
            onClick={onNewOrder}
            icon={<PlusCircle className="w-4 h-4 ml-1" />}
          >
            استخراج طلب جديد
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الطلب (BAY-...) أو اسم العميل أو رقم الهاتف أو اسم الصنف..."
            className="w-full pr-10 pl-4 py-2.5 text-sm bg-[#F7F8FA] border border-[#E2E8F0] rounded-[10px] min-h-[44px] focus:bg-white focus:ring-2 focus:ring-[#6D5EF5]/20 focus:border-[#6D5EF5] focus:outline-none transition"
          />
        </div>

        {/* Status Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm no-scrollbar">
          {statusTabs.map(tab => {
            const isSelected = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-semibold whitespace-nowrap transition min-h-[38px]
                  ${isSelected 
                    ? 'bg-[#6D5EF5] text-white shadow-xs' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold
                  ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Order List Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لا توجد طلبات مطابقة</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? 'لم نجد أي طلبات تتطابق مع كلمة البحث. جرّب البحث برقم هاتف أو اسم آخر.' 
              : 'لا توجد طلبات في هذه الحالة حالياً.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#6D5EF5] hover:underline"
            >
              مسح البحث
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const totalQty = order.items.reduce((sum, it) => sum + it.quantity, 0);
            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 md:p-5 hover:border-[#6D5EF5]/50 hover:shadow-sm transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Right block: Order info & customer */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-sm text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                    </span>
                    {order.isDraft && (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        مسودة غير مكتملة
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-600">
                    <div className="font-semibold text-slate-900">
                      {order.customerName ? (
                        <span>العميل: {order.customerName}</span>
                      ) : (
                        <span className="text-red-600 italic">الاسم: غير مدخل</span>
                      )}
                    </div>

                    {order.phone ? (
                      <div className="flex items-center gap-1 ltr-text font-mono text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.phone}</span>
                      </div>
                    ) : (
                      <div className="text-red-600 italic">الهاتف: غير مدخل</div>
                    )}

                    {order.address && (
                      <div className="flex items-center gap-1 truncate max-w-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-500 pt-1">
                    <span>الأصناف ({totalQty}): </span>
                    <span className="text-slate-800 font-medium">
                      {order.items.map(it => `${it.name} (${it.quantity})`).join('، ')}
                    </span>
                  </div>
                </div>

                {/* Left block: Financials & Action */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">الإجمالي:</span>
                    <span className="font-mono font-bold text-base text-[#0F172A]">
                      {order.totalCents !== null 
                        ? `${(order.totalCents / 100).toFixed(2)} ج.م` 
                        : <span className="text-amber-800 text-xs">غير محدد (مسودة)</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6D5EF5] font-semibold flex items-center">
                      <span>عرض التفاصيل</span>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
