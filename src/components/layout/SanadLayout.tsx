import React, { useState } from 'react';
import { 
  Heart, 
  Calendar, 
  Users, 
  FileText, 
  Bell, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  Menu, 
  X,
  Stethoscope,
  Clock,
  Sparkles,
  Download,
  Info,
  CheckCircle2
} from 'lucide-react';
import { CareCircle, CareRecipient, CircleMember, Profile } from '../../types/sanad';
import { sanadService, SEED_PROFILES } from '../../services/sanadService';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import { EmergencySosButton } from '../emergency/EmergencySosButton';
import { ThemeToggle } from '../theme/ThemeToggle';

export type SanadTab = 'schedule' | 'recipient' | 'appointments' | 'documents' | 'inbox' | 'audit';

interface SanadLayoutProps {
  currentTab: SanadTab;
  onSelectTab: (tab: SanadTab) => void;
  children: React.ReactNode;
  circle: CareCircle;
  recipient: CareRecipient;
  activeMember?: CircleMember;
  onMemberSwitched: () => void;
}

export const SanadLayout: React.FC<SanadLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
  circle,
  recipient,
  activeMember,
  onMemberSwitched,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMemberSelector, setShowMemberSelector] = useState(false);

  const canSeeHealth = sanadService.canView('health');
  const isAdmin = sanadService.isAdmin();
  const unreadNotifs = sanadService.getNotifications().filter(n => !n.read_at).length;

  const navItems = [
    {
      id: 'schedule' as SanadTab,
      label: 'الجدول والمتابعات',
      icon: <Calendar className="w-4 h-4 ml-2" />,
      badge: undefined,
    },
    {
      id: 'recipient' as SanadTab,
      label: 'المستفيد والدائرة',
      icon: <Users className="w-4 h-4 ml-2" />,
      badge: undefined,
    },
    {
      id: 'appointments' as SanadTab,
      label: 'المواعيد والتعليمات',
      icon: <Stethoscope className="w-4 h-4 ml-2" />,
      badge: undefined,
    },
    {
      id: 'documents' as SanadTab,
      label: 'الملفات والذكاء الاصطناعي',
      icon: <FileText className="w-4 h-4 ml-2" />,
      badge: sanadService.getDocuments().filter(d => d.ai_run?.status === 'review_required').length || undefined,
    },
    {
      id: 'inbox' as SanadTab,
      label: 'صندوق الوارد',
      icon: <Bell className="w-4 h-4 ml-2" />,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
    ...(isAdmin ? [{
      id: 'audit' as SanadTab,
      label: 'سجل التدقيق والتصدير',
      icon: <ShieldCheck className="w-4 h-4 ml-2" />,
      badge: undefined,
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans antialiased">
      <OfflineIndicator />

      {/* Top Banner: Medical & Legal Disclaimer */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 truncate">
          <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="truncate">
            <strong>سند — منصة تنسيق عائلي:</strong> سند ليس طبيباً ولا مستشاراً طبياً، ولا يُثبت السلطة القانونية أو الوصاية.
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-slate-400 font-mono hidden sm:inline">Africa/Cairo</span>
          <PWAInstallButton />
        </div>
      </div>

      {/* Recipient Processing Withdrawn Emergency Banner */}
      {!circle.health_processing_enabled && (
        <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold block">تم تفعيل سحب موافقة المستفيد (Processing Withdrawn - Epoch #{circle.authorization_epoch})</span>
              <span className="text-red-100">تم حجب كافة البيانات الصحية والأدوية والتقارير والذكاء الاصطناعي والإشعارات عن جميع الأعضاء فوراً.</span>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                sanadService.restoreRecipientProcessing();
                onMemberSwitched();
              }}
              className="bg-white text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-[8px] text-xs font-bold transition flex-shrink-0 min-h-[36px]"
            >
              استعادة المعالجة
            </button>
          )}
        </div>
      )}

      {/* Main App Bar */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Care Recipient Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-[8px] min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-600"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base md:text-lg text-[#0F172A] tracking-tight">سند</h1>
                  <span className="text-xs text-slate-400 font-mono">Sanad</span>
                  <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                    دائرة: {circle.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-bold text-indigo-700">{recipient.preferred_name}</span>
                  <span>(مواليد {recipient.birth_year || '1952'})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Switcher, Emergency SOS Button & Dark Mode Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <EmergencySosButton onAlertTriggered={onMemberSwitched} />

            <div className="relative">
              <button
                onClick={() => setShowMemberSelector(!showMemberSelector)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[10px] text-xs transition min-h-[42px]"
                title="اضغط لاختبار الأدوار والصلاحيات (Admin, Caregiver, Viewer)"
              >
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{activeMember?.profile.display_name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold
                      ${activeMember?.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 
                        activeMember?.role === 'caregiver' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'}`}>
                      {activeMember?.role === 'admin' ? 'مدير (Admin)' : activeMember?.role === 'caregiver' ? 'مقدم رعاية' : 'مشاهد (Viewer)'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    {canSeeHealth ? (
                      <span className="text-teal-700 font-semibold flex items-center">
                        <ShieldCheck className="w-3 h-3 ml-0.5" /> صحة مفعّلة
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center">
                        <ShieldAlert className="w-3 h-3 ml-0.5" /> محجوب الصحة (عام فقط)
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-slate-400 text-xs">▼</span>
              </button>

              {/* Member Selector Dropdown */}
              {showMemberSelector && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-white rounded-[14px] shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                    <span className="text-xs font-bold text-slate-900 block">تبديل المستخدم (اختبار الصلاحيات الحقيقية):</span>
                    <span className="text-[10px] text-slate-500">جرب رؤية النظام من زاوية كل فرد</span>
                  </div>
                  {sanadService.getMembers().map(member => {
                    const isSelected = member.user_id === activeMember?.user_id;
                    return (
                      <button
                        key={member.id}
                        onClick={() => {
                          sanadService.setActiveUser(member.user_id);
                          setShowMemberSelector(false);
                          onMemberSwitched();
                        }}
                        className={`w-full text-right p-2.5 rounded-[8px] text-xs transition mb-1 flex items-start justify-between
                          ${isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'}`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{member.profile.display_name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            الدور: {member.role} • 
                            {member.can_view_health_data ? ' يرى الصحة' : ' لا يرى الصحة'}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 border-t border-slate-100 gap-2">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center py-3 px-3.5 text-xs font-bold border-b-2 transition min-h-[44px]
                  ${isActive 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="mr-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg z-30 animate-in fade-in">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-xs font-bold min-h-[44px]
                  ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <ThemeToggle isMobile={true} />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};
