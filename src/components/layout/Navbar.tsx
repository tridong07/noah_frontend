"use client";

import React from "react";
import { MenuNode } from "@/hooks/useMenuData";
import { SubMenu } from "./SubMenu";

export const Navbar = ({ menuData }: { menuData: MenuNode[] }) => {
  return (
    <nav className="flex items-center gap-1 px-4 h-14 bg-white border-b border-slate-200 shadow-sm">
      {menuData.map((item) => (
        <div key={item.menuNo} className="relative group h-full flex items-center">
          {/* Node cha */}
          <button className="px-4 h-full text-sm font-medium text-slate-700 hover:text-[#0a6ed1] hover:bg-slate-50 transition-colors">
            {item.menuName}
          </button>

          {/* Popup Tree Menu - Chỉ hiện nếu có children */}
          {item.children && item.children.length > 0 && (
            <div className="absolute top-full left-0 hidden group-hover:block pt-1 z-[100]">
              <SubMenu nodes={item.children} />
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};