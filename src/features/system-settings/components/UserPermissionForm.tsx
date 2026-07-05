import { User, Shield, LayoutGrid } from "lucide-react";

const menuItems = [
  { id: 'users', label: 'Người dùng hệ thống', icon: User },
  { id: 'roles', label: 'Vai trò hệ thống', icon: Shield },
  { id: 'windows', label: 'Window hệ thống', icon: LayoutGrid },
];

export const SystemSettingsSidebar = ({ activeItem, setActiveItem }: any) => (
  <div className="w-72 border-r border-[var(--color-border-subtle)] bg-[var(--color-card-bg)] h-[calc(100vh-100px)] overflow-y-auto">
    <div className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
      Quản lý quyền hạn
    </div>
    {menuItems.map((item) => (
      <button
        key={item.id}
        onClick={() => setActiveItem(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
          activeItem === item.id 
            ? "bg-[var(--color-sap-blue)]/10 text-[var(--color-sap-blue)] border-r-2 border-[var(--color-sap-blue)]" 
            : "text-[var(--color-foreground)] hover:bg-[var(--color-border-subtle)]"
        }`}
      >
        <item.icon size={18} />
        {item.label}
      </button>
    ))}
  </div>
);