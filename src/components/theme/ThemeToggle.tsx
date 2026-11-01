import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export type ThemeMode = 'light' | 'dark';

export const ThemeToggle: React.FC<{ isMobile?: boolean }> = ({ isMobile }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sanad_theme') as ThemeMode | null;
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sanad_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (isMobile) {
    return (
      <button
        onClick={toggleTheme}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-[8px] text-xs font-bold text-slate-600 hover:bg-slate-50 transition min-h-[44px]"
        aria-label="تبديل الوضع الليلي"
      >
        <div className="flex items-center gap-2">
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500 ml-2" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 ml-2" />
          )}
          <span>{theme === 'dark' ? 'الوضع النهاري (Day)' : 'الوضع الليلي (Night)'}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-100 text-slate-600">
          {theme === 'dark' ? 'مفعّل 🌙' : 'معطّل ☀️'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[10px] text-xs font-bold text-slate-700 transition min-h-[42px] shadow-2xs"
      title={theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي لتقليل إجهاد العين'}
      aria-label="تبديل الوضع الليلي"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          <span className="hidden lg:inline text-amber-300">الوضع النهاري</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-180 duration-300" />
          <span className="hidden lg:inline text-slate-700">الوضع الليلي</span>
        </>
      )}
    </button>
  );
};
