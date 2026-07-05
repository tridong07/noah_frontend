"use client";

import React, { useState } from "react";
import SapInput from "@/components/ui/SapInput";
import SapButton from "@/components/ui/SapButton";
import { Settings, Shield, Monitor, Bell, Lock, Key, AlertCircle } from "lucide-react";
import { useChangePassword } from "@/features/auth/hooks/useChangePassword";
import { DisplaySettings } from "./DisplaySettings";

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
      {/* Sidebar */}
      <div className="w-1/3 border-r border-[var(--color-border-subtle)] pr-4 space-y-1">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-[var(--color-sap-blue)]/10 text-[var(--color-sap-blue)] font-semibold' 
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border-subtle)]/30'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="w-2/3 pl-6 overflow-y-auto">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'display' && <DisplaySettings />}
        {activeTab === 'notifications' && <NotificationsSettings />}
      </div>
    </div>
  );
};

const GeneralSettings = () => (
  <div className="space-y-4">
    <h3 className="font-bold text-[var(--color-foreground)]">Cài đặt chung</h3>
    <label className="block">
      <span className="text-xs text-[var(--color-text-muted)]">Ngôn ngữ</span>
      <select className="w-full mt-1 p-2 rounded-md bg-[var(--color-input-bg)] border border-[var(--color-border-subtle)] text-[var(--color-foreground)]">
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
    changePassword(passwordData, { onSuccess: () => setIsChanging(false) });
  };

  if (isChanging) return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="font-bold text-[var(--color-foreground)]">Đổi mật khẩu</h3>
      <SapInput icon={Key} type="password" placeholder="Mật khẩu hiện tại" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
      <SapInput icon={Lock} type="password" placeholder="Mật khẩu mới" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
      <SapInput icon={Lock} type="password" placeholder="Nhập lại mật khẩu mới" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
      
      <div className="flex gap-2 pt-2">
        <SapButton onClick={(e) => { e.stopPropagation(); handleSave(); }} isLoading={isPending}>Xác nhận đổi</SapButton>
        <button type="button" onClick={(e) => { e.stopPropagation(); setIsChanging(false); }} className="px-6 py-2 bg-[var(--color-border-subtle)]/30 hover:bg-[var(--color-border-subtle)] text-[var(--color-foreground)] rounded-lg text-sm font-medium transition-colors border border-[var(--color-border-subtle)]">
          Hủy
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-2 text-[var(--color-danger)] text-xs mt-2">
          <AlertCircle size={14} />
          <span>{(error as any)?.response?.data?.message || "Có lỗi xảy ra"}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[var(--color-foreground)]">Bảo mật</h3>
      <button type="button" onClick={(e) => { e.stopPropagation(); setIsChanging(true); }} className="text-[var(--color-sap-blue)] hover:underline text-xs font-medium block">
        Thay đổi mật khẩu
      </button>
      <div className="p-3 bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-xs rounded-md border border-[var(--color-warning)]/20">
        Lần thay đổi mật khẩu gần nhất: 15/06/2026
      </div>
    </div>
  );
};

const NotificationsSettings = () => (
  <div className="space-y-4">
    <h3 className="font-bold text-[var(--color-foreground)]">Thông báo</h3>
    <label className="flex items-center gap-2 text-[var(--color-foreground)]">
      <input type="checkbox" defaultChecked className="accent-[var(--color-sap-blue)]" /> 
      <span>Email thông báo</span>
    </label>
  </div>
);