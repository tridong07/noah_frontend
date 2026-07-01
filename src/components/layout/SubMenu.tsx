"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { MenuNode } from "@/hooks/useMenuData";
import { useRouter } from "next/navigation";

export const SubMenu = ({ nodes }: { nodes: MenuNode[] }) => {
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-60 bg-white shadow-xl border border-slate-200 rounded-lg py-2"
    >
      {nodes.map((item) => {
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.menuNo} className="relative group/item">
            <button 
              onClick={() => item.winNo && router.push(`/app/${item.winNo.toLowerCase()}`)}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 flex justify-between items-center transition-colors"
            >
              {item.menuName}
              {hasChildren && <ChevronRight size={14} className="text-slate-400" />}
            </button>
            
            {/* Đệ quy: Hiển thị cấp con tiếp theo */}
            {hasChildren && (
              <div className="absolute left-full top-0 hidden group-hover/item:block pl-1">
                <SubMenu nodes={item.children} />
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};