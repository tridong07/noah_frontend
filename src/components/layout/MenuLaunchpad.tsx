"use client";

import React, { useState, useMemo, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { useMenuContext } from "@/context/MenuContext";
import { MenuNode } from "@/hooks/useMenuData";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface MenuLaunchpadProps {
  menuData: MenuNode[] | undefined;
}

export const MenuLaunchpad = ({ menuData }: MenuLaunchpadProps) => {
  const router = useRouter();
  const { setBreadcrumbs } = useMenuContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("fav_menus");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (e: React.MouseEvent, menuNo: string) => {
    e.stopPropagation();
    const newFavs = favorites.includes(menuNo) 
      ? favorites.filter(id => id !== menuNo) 
      : [...favorites, menuNo];
    setFavorites(newFavs);
    localStorage.setItem("fav_menus", JSON.stringify(newFavs));
  };

  // Tách menu thành 2 nhóm
  const { favItems, otherItems } = useMemo(() => {
    if (!menuData) return { favItems: [], otherItems: [] };
    
    const filtered = menuData.filter(item => 
      item.menuName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return {
      favItems: filtered.filter(item => favorites.includes(item.menuNo)),
      otherItems: filtered.filter(item => !favorites.includes(item.menuNo))
    };
  }, [menuData, favorites, searchTerm]);

  const renderGrid = (items: MenuNode[], title: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          {title === "Favorites" ? <Star size={16} className="fill-yellow-400 text-yellow-400" /> : null}
          {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => {
            const Icon = (LucideIcons as any)[item.iconName || "LayoutDashboard"] || LucideIcons.LayoutDashboard;
            return (
              <motion.button
                layout key={item.menuNo}
                onClick={() => {
                  setBreadcrumbs(["Home", item.menuName]);
                  item.winNo ? router.push(`/app/${item.winNo.toLowerCase()}`) : router.push(`/home/${item.menuNo}`);
                }}
                className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#0a6ed1] transition-all"
              >
                <div onClick={(e) => toggleFavorite(e, item.menuNo)} className="absolute top-2 right-2 p-1 cursor-pointer">
                  <Star size={18} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="p-3 rounded-full bg-slate-50 text-[#0a6ed1] mb-3 group-hover:bg-[#0a6ed1] group-hover:text-white transition-all">
                  <Icon size={24} />
                </div>
                <span className="text-xs font-medium text-slate-600 text-center line-clamp-2">{item.menuName}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!menuData) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8">
      <input
        placeholder="Tìm kiếm ứng dụng..."
        className="mb-8 w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-[#0a6ed1]"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {renderGrid(favItems, "Favorites")}
      {renderGrid(otherItems, "All Applications")}
      
      {favItems.length === 0 && otherItems.length === 0 && (
        <div className="text-center py-20 text-slate-400">Không tìm thấy ứng dụng.</div>
      )}
    </div>
  );
};