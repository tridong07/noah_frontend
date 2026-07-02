"use client";

import React, { useState, useMemo, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { useMenuContext } from "@/context/MenuContext";
import { MenuNode } from "@/hooks/useMenuData";
import { motion, AnimatePresence } from "framer-motion";
import { Star, LayoutGrid, ArrowLeft } from "lucide-react";

interface MenuLaunchpadProps {
  menuData: MenuNode[] | undefined;
}

export const MenuLaunchpad = ({ menuData }: MenuLaunchpadProps) => {
  const router = useRouter();
  const { setBreadcrumbs } = useMenuContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState<MenuNode | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("fav_menus");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const handleTileClick = (item: MenuNode) => {
    if (item.children && item.children.length > 0) {
      // Đi sâu vào nhóm con
      setActiveGroup(item);
      setBreadcrumbs(["Home", item.menuName]);
    } else {
      // Điều hướng đến ứng dụng
      setBreadcrumbs(["Home", item.menuName]);
      item.winNo 
        ? router.push(`/app/${item.winNo.toLowerCase()}`) 
        : router.push(`/home/${item.menuNo}`);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, menuNo: string) => {
    e.stopPropagation();
    const newFavs = favorites.includes(menuNo) 
      ? favorites.filter(id => id !== menuNo) 
      : [...favorites, menuNo];
    setFavorites(newFavs);
    localStorage.setItem("fav_menus", JSON.stringify(newFavs));
  };

  const { groups, favItems } = useMemo(() => {
    if (!menuData) return { groups: [], favItems: [] };

    // Tìm kiếm sâu trong cây menu
    const searchMatch = (item: MenuNode): boolean => {
      const matchName = item.menuName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchChildren = item.children?.some(child => searchMatch(child));
      return matchName || !!matchChildren;
    };

    const filteredGroups = menuData.filter(searchMatch);

    // Thu thập tất cả các item để xử lý Favorites
    const allItems: MenuNode[] = [];
    const collectItems = (nodes: MenuNode[]) => {
      nodes.forEach(n => {
        allItems.push(n);
        if (n.children) collectItems(n.children);
      });
    };
    collectItems(menuData);

    return {
      groups: filteredGroups,
      favItems: allItems.filter(item => favorites.includes(item.menuNo))
    };
  }, [menuData, searchTerm, favorites]);

  const renderAppTile = (item: MenuNode) => {
    const Icon = (LucideIcons as any)[item.iconName || "LayoutDashboard"] || LucideIcons.LayoutDashboard;
    return (
      <motion.button
        layout
        key={item.menuNo}
        onClick={() => handleTileClick(item)}
        className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#0a6ed1] transition-all"
      >
        <div onClick={(e) => toggleFavorite(e, item.menuNo)} className="absolute top-2 right-2 p-1 cursor-pointer">
          <Star size={18} className={`${favorites.includes(item.menuNo) ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-slate-300'}`} />
        </div>
        <div className="p-3 rounded-full bg-slate-50 text-[#0a6ed1] mb-3 group-hover:bg-[#0a6ed1] group-hover:text-white transition-all">
          <Icon size={24} />
        </div>
        <span className="text-xs font-medium text-slate-600 text-center line-clamp-2">{item.menuName}</span>
      </motion.button>
    );
  };

  if (!menuData) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8">
      {/* Header và Search */}
      {activeGroup ? (
        <div className="mb-8">
          <button 
            onClick={() => { setActiveGroup(null); setBreadcrumbs(["Home"]); }}
            className="flex items-center gap-2 text-[#0a6ed1] font-semibold hover:underline"
          >
            <ArrowLeft size={20} /> Quay lại
          </button>
          <h2 className="text-2xl font-bold mt-4 text-slate-800">{activeGroup.menuName}</h2>
        </div>
      ) : (
        <input
          placeholder="Tìm kiếm chức năng..."
          className="mb-8 w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-[#0a6ed1]"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}
      
      {/* Nội dung chính */}
      {activeGroup ? (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {activeGroup.children?.map(renderAppTile)}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {favItems.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" /> Favorites
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {favItems.map(renderAppTile)}
                </div>
              </div>
            )}

            {groups.map(group => (
              <div key={group.menuNo} className="mb-10">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <LayoutGrid size={20} className="text-[#0a6ed1]" />
                  {group.menuName}
                </h3>
                {group.children && group.children.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {group.children.map(renderAppTile)}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Không có ứng dụng con</p>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};