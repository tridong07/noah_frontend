"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const DisplaySettings = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8 rounded-full bg-[var(--color-border-subtle)] animate-pulse" />;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[var(--color-foreground)]">Hiển thị</h3>
      <label className="flex items-center gap-3 cursor-pointer group">
        <input 
          type="checkbox"
          className="h-4 w-4 rounded border-[var(--color-border-subtle)] accent-[var(--color-sap-blue)] cursor-pointer"
          checked={resolvedTheme === 'dark'}
          onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
        />
        <span className="text-sm text-[var(--color-foreground)] group-hover:text-[var(--color-sap-blue)] transition-colors">
          Chế độ tối (Dark Mode)
        </span>
      </label>
    </div>
  );
};