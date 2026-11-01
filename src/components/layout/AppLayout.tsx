import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  Settings, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Menu, 
  X,
  FileText,
  AlertTriangle
} from 'lucide-react';

export type NavTab = 'orders' | 'intake' | 'review' | 'order-detail' | 'products' | 'customers' | 'settings';

interface AppLayoutProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: React.ReactNode;
  activeOrderCount?: number;
  draftCount?: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
  activeOrderCount = 0,
  draftCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'orders' as NavTab,
      label: 'الطلبات',
      icon: <ShoppingBag className="w-5 h-5 ml-3" />,
      badge: activeOrderCount > 0 ? activeOrderCount : undefined,
    },
    {
      id: 'products' as NavTab,
      label: 'المنتجات',
      icon: <Package className="w-5 h-5 ml-3" />,
    },
    {
      id: 'customers' as NavTab,
      label: 'العملاء',
      icon: <Users className="w-5 h-5 ml-3" />,
    },
    {
      id: 'settings' as NavTab,
      label: 'الإعدادات',
      icon: <Settings className="w-5 h-5 ml-3" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A] flex flex-col md:flex-row font-sans antialiased">
      {/* Desktop Right Sidebar (in RTL, it is on the right side) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-[#E2E8F0] shadow-sm flex-shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#6D5EF5] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              بَ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-[#0F172A]">بَيْعة</span>
                <span className="text-xs font-mono text-[#64748B]">Bay3a</span>
              </div>
              <span className="text-[11px] text-[#64748B] block">تدقيق واستقبال الطلبات</span>
            </div>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="mx-4 mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-[12px] text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950">بيانات تجريبية (Phase 1)</span>
            <span className="text-[11px] text-amber-800 leading-relaxed block mt-0.5">
              مزوّد المحاكاة الحتمي نشط بدون اتصال سحابي مباشر.
            </span>
          </div>
        </div>

        {/* New Order CTA */}
        <div className="p-4">
          <button
            onClick={() => onSelectTab('intake')}
            className="w-full flex items-center justify-center gap-2 bg-[#6D5EF5] hover:bg-[#5C4DE3] text-white py-2.5 px-4 rounded-[10px] font-medium text-sm transition shadow-sm min-h-[44px]"
          >
            <PlusCircle className="w-5 h-5 ml-1" />
            <span>استخراج / طلب جديد</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 py-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition min-h-[44px]
                  ${isActive 
                    ? 'bg-[#EEF2FF] text-[#6D5EF5] font-semibold' 
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'}`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Workspace Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-[#0F172A] truncate">متجر القاهرة الرئيسي</p>
              <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                <span>مصر (EGP)</span>
                <span>•</span>
                <span>توقيت القاهرة</span>
              </p>
            </div>
            <span title="عزل بيانات مؤمن">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#6D5EF5] text-white flex items-center justify-center font-bold text-sm">
              بَ
            </div>
            <span className="font-bold text-base text-[#0F172A]">بَيْعة</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-[11px] font-semibold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
            بيانات تجريبية
          </span>
          <button
            onClick={() => {
              onSelectTab('intake');
              setMobileMenuOpen(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-[#6D5EF5] text-white rounded-[8px] min-h-[40px] flex items-center"
          >
            + جديد
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 py-3 space-y-1 shadow-lg z-30 animate-in fade-in slide-in-from-top-2">
          <div className="pb-2 mb-2 border-b border-slate-100 text-xs text-slate-500">
            <span>مساحة العمل: </span>
            <span className="font-semibold text-slate-800">متجر القاهرة الرئيسي (EGP)</span>
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-sm font-medium min-h-[44px]
                  ${isActive 
                    ? 'bg-[#EEF2FF] text-[#6D5EF5] font-semibold' 
                    : 'text-[#64748B] hover:text-[#0F172A]'}`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#6D5EF5]/10 text-[#6D5EF5]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
