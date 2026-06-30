"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { useMenuContext } from "@/context/MenuContext";
import { MenuNode } from "@/hooks/useMenuData"; // Import interface từ hook

interface MenuLaunchpadProps {
  menuData: MenuNode[] | undefined; // Nhận data có thể là undefined khi đang loading
}

export const MenuLaunchpad = ({ menuData }: MenuLaunchpadProps) => {
  const router = useRouter();
  const { setBreadcrumbs } = useMenuContext();
  
  // Kiểm tra dữ liệu: Nếu chưa có hoặc không phải mảng, trả về giao diện trống hoặc loading
  if (!menuData || !Array.isArray(menuData)) {
    return <div className="p-8 text-center text-slate-500">Đang tải menu...</div>;
  }

  const handleNavigate = (item: MenuNode) => {
    setBreadcrumbs(["Home", item.menuName]);

    if (item.children && item.children.length > 0) {
      router.push(`/home/${item.menuNo}`);
    } else if (item.winNo) {
      router.push(`/app/${item.winNo.toLowerCase()}`);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
      {menuData.map((item) => {
        // Dùng icon mặc định nếu iconName không tồn tại hoặc icon không hợp lệ
        const IconComponent = (LucideIcons as any)[item.iconName || "LayoutDashboard"] || LucideIcons.LayoutDashboard;

        return (
          <button
            key={item.menuNo}
            onClick={() => handleNavigate(item)}
            className="group flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#0a6ed1] transition-all"
          >
            <div className="p-4 rounded-full bg-slate-100 text-[#0a6ed1] mb-4 group-hover:bg-[#0a6ed1] group-hover:text-white transition-all">
              <IconComponent size={32} />
            </div>
            <span className="text-sm font-semibold text-slate-700 text-center">
              {item.menuName}
            </span>
          </button>
        );
      })}
    </div>
  );
};