"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

// 1. Thêm title vào kiểu Toast
type Toast = { 
  id: number; 
  title?: string; // Tiêu đề là tùy chọn
  message: string; 
  type: 'success' | 'error' | 'info' 
};

const NotificationContext = createContext<{
  show: (message: string, title?: string, type?: Toast['type']) => void;
} | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 2. Cập nhật hàm show nhận thêm title
  const show = useCallback((message: string, title?: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`p-4 rounded-lg shadow-lg text-white min-w-[250px] ${t.type === 'error' ? 'bg-red-500' : 'bg-blue-600'}`}
          >
            {/* 3. Hiển thị Title nếu có */}
            {t.title && <div className="font-bold mb-1 border-b border-white/20 pb-1">{t.title}</div>}
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext)!;