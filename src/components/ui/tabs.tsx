'use client';
import React, { createContext, useContext, useState } from 'react';

// 1. Tạo Context
const TabsContext = createContext<{ 
  active: string; 
  setActive: (val: string) => void 
} | null>(null);

// 2. Component cha (Provider) - Thêm className ở đây để nhận style khung ngoài
export const Tabs = ({ children, defaultValue, className = "" }: { children: React.ReactNode, defaultValue: string, className?: string }) => {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

// 3. Hook nội bộ
const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within <Tabs>');
  return context;
};

// 4. TabsList (Giữ nguyên - Đã có className)
export const TabsList = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex border-b border-border-subtle mb-4 ${className}`}>
    {children}
  </div>
);

// 5. TabsTrigger - ✨ CẬP NHẬT: Thêm className nhận từ bên ngoài
export const TabsTrigger = ({ value, children, className = "" }: { value: string, children: React.ReactNode, className?: string }) => {
  const { active, setActive } = useTabs();
  const isActive = active === value;

  return (
    <button
      type="button" // 🌟 QUAN TRỌNG: Thêm dòng này để fix triệt để lỗi tự động submit form khi chuyển tab!
      className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
        isActive 
          ? 'border-sap-blue text-sap-blue' 
          : 'border-transparent text-foreground hover:text-sap-blue'
      } ${className}`} // 🌟 Gộp class tùy biến từ file cha truyền xuống
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
};

// 6. TabsContent - ✨ CẬP NHẬT: Thêm className nhận từ bên ngoài
export const TabsContent = ({ value, children, className = "" }: { value: string, children: React.ReactNode, className?: string }) => {
  const { active } = useTabs();
  return active === value ? <div className={`mt-2 ${className}`}>{children}</div> : null;
};