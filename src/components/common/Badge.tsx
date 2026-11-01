import React from 'react';
import { ReviewState, OrderStatus } from '../../types/order';

interface ReviewBadgeProps {
  state: ReviewState;
  className?: string;
}

export const ReviewBadge: React.FC<ReviewBadgeProps> = ({ state, className = '' }) => {
  switch (state) {
    case 'from_source':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] ${className}`}>
          من المصدر
        </span>
      );
    case 'needs_review':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] ${className}`}>
          محتاج مراجعة
        </span>
      );
    case 'missing':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] ${className}`}>
          ناقص
        </span>
      );
    case 'user_edited':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-[#ECFDF5] text-[#0F766E] border border-[#A7F3D0] ${className}`}>
          عدّله المستخدم
        </span>
      );
  }
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'draft':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          مسودة
        </span>
      );
    case 'confirmed':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
          تم التأكيد
        </span>
      );
    case 'preparing':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${className}`}>
          جاري التجهيز
        </span>
      );
    case 'shipped':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          تم الشحن
        </span>
      );
    case 'delivered':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}>
          تم التسليم
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 ${className}`}>
          ملغي
        </span>
      );
  }
};
