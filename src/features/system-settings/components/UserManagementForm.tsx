'use client';
import { useState } from 'react';
import { User, Shield, Settings } from "lucide-react";
import SapInput from "@/components/ui/SapInput";
import SapButton from "@/components/ui/SapButton";

export const UserManagementForm = () => {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Thiết lập người dùng', icon: User },
    { id: 'permissions', label: 'Thiết lập quyền hạn', icon: Shield },
    { id: 'properties', label: 'Thiết lập thuộc tính', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--color-card-bg)] border border-[var(--color-border-subtle)] rounded-lg overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id 
                ? "border-[var(--color-sap-blue)] text-[var(--color-sap-blue)]" 
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-foreground)]"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 overflow-y-auto">
        {activeTab === 'info' && <UserInfoTab />}
        {activeTab === 'permissions' && <UserPermissionsTab />}
        {activeTab === 'properties' && <UserPropertiesTab />}
      </div>
    </div>
  );
};

// Các Sub-components cho từng Tab
const UserInfoTab = () => (
  <div className="grid grid-cols-2 gap-6">
    <SapInput type="text" name="Mã người dùng" />
    <SapInput type="text" name="Tên người dùng" />
    <SapInput type="email" name="Email" />
    <SapInput type="tel" name="Điện thoại" />
    {/* Thêm các trường khác từ ảnh của bạn ở đây */}
  </div>
);

const UserPermissionsTab = () => (
    <div className="space-y-4">
        {/* Render danh sách quyền hạn dạng Tree hoặc Checklist */}
        <p>Danh sách phân quyền chi tiết...</p>
    </div>
);

const UserPropertiesTab = () => (
    <div className="space-y-4">
        {/* Render danh sách thuộc tính */}
        <p>Các thuộc tính mở rộng của người dùng...</p>
    </div>
);