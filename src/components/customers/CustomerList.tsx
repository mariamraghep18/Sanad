import React, { useState } from 'react';
import { Users, Phone, MapPin, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Customer } from '../../types/order';
import { orderStorage } from '../../services/orderStorage';

export const CustomerList: React.FC = () => {
  const [customers] = useState<Customer[]>(orderStorage.getCustomers());

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#0F172A]">العملاء المعتمدون</h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5]">
            {customers.length} عملاء
          </span>
        </div>
        <p className="text-sm text-[#64748B] mt-1">
          يتم تسجيل العملاء في هذه القائمة حصراً بعد اعتماد الطلبات فعلياً من قبل التاجر، ولا يتم إنشاء عميل من استخراجات غير مراجعة.
        </p>
      </div>

      <div className="bg-white rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 border-b border-[#E2E8F0] text-slate-600 font-bold">
            <tr>
              <th className="p-3.5">العميل</th>
              <th className="p-3.5">رقم الهاتف</th>
              <th className="p-3.5">العنوان المسجل</th>
              <th className="p-3.5 text-center">عدد الطلبات</th>
              <th className="p-3.5 text-left">إجمالي المشتريات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                <td className="p-3.5 ltr-text font-mono text-slate-700">{c.phone}</td>
                <td className="p-3.5 text-slate-600">{c.defaultAddress || '-'}</td>
                <td className="p-3.5 text-center font-mono font-semibold">{c.ordersCount}</td>
                <td className="p-3.5 text-left font-mono font-bold text-[#6D5EF5]">
                  {(c.totalSpentCents / 100).toFixed(2)} ج.م
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
