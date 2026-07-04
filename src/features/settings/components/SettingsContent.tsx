"use client";

import React, { useState } from "react";
import SapInput from "@/components/ui/SapInput";
import SapButton from "@/components/ui/SapButton";
import { Settings, Shield, Monitor, Bell, Lock, Key, AlertCircle } from "lucide-react";
import { useChangePassword } from "@/features/auth/hooks/useChangePassword";
import { DisplaySettings } from "./DisplaySettings";

// Định nghĩa các tab
const SETTINGS_TABS = [
  { id: 'general', label: 'Cài đặt chung', icon: Settings },
  { id: 'security', label: 'Bảo mật', icon: Shield },
  { id: 'display', label: 'Hiển thị', icon: Monitor },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
];

export const SettingsContent = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex h-[400px] w-full text-sm bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors">
      {/* Sidebar chọn Tab */}
      <div className="w-1/3 border-r border-slate-200 dark:border-zinc-700 pr-4 space-y-1">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-[#eef5fd] dark:bg-zinc-800 text-[#0a6ed1] dark:text-blue-400 font-semibold' 
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nội dung Tab */}
      <div className="w-2/3 pl-6 overflow-y-auto">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'display' && <DisplaySettings />}
        {activeTab === 'notifications' && <NotificationsSettings />}
      </div>
    </div>
  );
};

// Các sub-components (Có thể tách file nếu code dài hơn)
const GeneralSettings = () => (
  <div className="space-y-4 ">
    <h3 className="font-bold text-slate-800 dark:text-zinc-100">Cài đặt chung</h3>
    <label className="block">
      <span className="text-xs text-slate-500 dark:text-zinc-400">Ngôn ngữ</span>
      <select className="w-full mt-1 p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200">
        <option>Tiếng Việt</option>
        <option>English</option>
      </select>
    </label>
  </div>
);

const SecuritySettings = () => {
  const [isChanging, setIsChanging] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const { mutate: changePassword, isPending, isError, error } = useChangePassword();

  const handleSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }
    // Sau khi đổi thành công, tự động đóng form
    changePassword(passwordData, { 
      onSuccess: () => setIsChanging(false) 
    });
  };

  if (isChanging) return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="font-bold text-slate-800 dark:text-zinc-100">Đổi mật khẩu</h3>
      
      <SapInput 
        icon={Key} 
        type="password" 
        placeholder="Mật khẩu hiện tại" 
        value={passwordData.currentPassword}
        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
      />
      <SapInput 
        icon={Lock} 
        type="password" 
        placeholder="Mật khẩu mới" 
        value={passwordData.newPassword}
        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
      />
      <SapInput 
        icon={Lock} 
        type="password" 
        placeholder="Nhập lại mật khẩu mới" 
        value={passwordData.confirmPassword}
        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
      />
      
      <div className="flex gap-2 pt-2">
        <SapButton onClick={(e) => { e.stopPropagation(); handleSave(); }} isLoading={isPending}>
          Xác nhận đổi
        </SapButton>
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsChanging(false); }} 
          className="px-6 py-2 bg-zinc-100 hover:text-red-600 hover:bg-red-50 hover:border-red-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors border border-zinc-200 dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-red-900/30"
        >
          Hủy
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-2 text-red-600 text-xs mt-2">
          <AlertCircle size={14} />
          <span>{(error as any)?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-800 dark:text-zinc-100">Bảo mật</h3>
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsChanging(true); }} 
        className="text-[#0a6ed1] dark:text-blue-400 hover:underline text-xs font-medium block"
      >
        Thay đổi mật khẩu
      </button>
      <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-md border border-amber-100 dark:border-amber-900/50">
        Lần thay đổi mật khẩu gần nhất: 15/06/2026
      </div>
    </div>
  );
};
/*
const DisplaySettings = () => (
  <div className="space-y-4">
    <h3 className="font-bold text-slate-800">Hiển thị</h3>
    <label className="flex items-center gap-2">
      <input type="checkbox" /> <span>Chế độ tối (Dark Mode)</span>
    </label>
  </div>
);*/

const NotificationsSettings = () => (
  <div className="space-y-4">
    <h3 className="font-bold text-slate-800 dark:text-zinc-100">Thông báo</h3>
    <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
      <input type="checkbox" defaultChecked className="dark:accent-blue-500" /> 
      <span>Email thông báo</span>
    </label>
  </div>
);