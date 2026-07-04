"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const DisplaySettings = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8 rounded-full bg-zinc-700 animate-pulse" />;

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input 
        type="checkbox"
        // Kiểm tra xem thực tế đang là dark không
        checked={resolvedTheme === 'dark'}
        // Khi nhấn, ép buộc theme thành 'dark' hoặc 'light'
        // Việc này sẽ ghi đè trạng thái 'system' trong localStorage
        onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
      />
      <span>Chế độ tối</span>
    </label>
  );
};