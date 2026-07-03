"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const DisplaySettings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect này bắt buộc để tránh lỗi hydration (server/client mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Tránh render sai theme khi server đang load

  return (
    <div className="p-4">
      <h3 className="font-bold mb-4">Hiển thị</h3>
      <label className="flex items-center gap-2 cursor-pointer">
        <input 
          type="checkbox" 
          // resolvedTheme giúp lấy theme thực tế đang áp dụng (kể cả khi theme là 'system')
          checked={resolvedTheme === 'dark'}
          onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
          className="w-4 h-4"
        />
        <span>Chế độ tối (Dark Mode)</span>
      </label>
    </div>
  );
};