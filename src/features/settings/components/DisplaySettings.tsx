"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Sun, Moon } from "lucide-react";

export const DisplaySettings = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-20" />;

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-slate-800">Hiển thị</h3>
      
      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Monitor className="text-slate-400" size={20} />
          <div>
            <p className="text-sm font-medium text-slate-700">Chế độ giao diện</p>
            <p className="text-[10px] text-slate-500">Tùy chỉnh giao diện sáng/tối</p>
          </div>
        </div>
        
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-white shadow-sm text-[#0a6ed1]' : 'text-slate-500'}`}
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-white shadow-sm text-[#0a6ed1]' : 'text-slate-500'}`}
          >
            <Moon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};