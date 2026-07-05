"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("fav_menus");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const handleTileClick = (item: MenuNode) => {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      item.winNo 
        ? router.push(`/app/${item.winNo.toLowerCase()}`) 
        : router.push(`/home/${item.menuNo}`);
      return;
    }

    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      if (item.children && item.children.length > 0) {
        const fullItem = menuData?.find(m => m.menuNo === item.menuNo) || item;
        setActiveGroup(fullItem);
        setBreadcrumbs(["Home", item.menuName]);
      } else {
        setBreadcrumbs(["Home", item.menuName]);
        item.winNo 
          ? router.push(`/app/${item.winNo.toLowerCase()}`) 
          : router.push(`/home/${item.menuNo}`);
      }
    }, 250);
  };

  const toggleFavorite = (e: React.MouseEvent, menuNo: string) => {
    e.stopPropagation();
    setFavorites(prevFavs => {
      const newFavs = prevFavs.includes(menuNo) ? prevFavs.filter(id => id !== menuNo) : [...prevFavs, menuNo];
      localStorage.setItem("fav_menus", JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const { groups, favItems } = useMemo(() => {
    if (!menuData) return { groups: [], favItems: [] };
    const searchMatch = (item: MenuNode): boolean => {
      const matchName = item.menuName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchChildren = item.children?.some(child => searchMatch(child));
      return matchName || !!matchChildren;
    };
    const filteredGroups = menuData.filter(searchMatch);
    const allItems: MenuNode[] = [];
    const collectItems = (nodes: MenuNode[]) => {
      nodes.forEach(n => { allItems.push(n); if (n.children) collectItems(n.children); });
    };
    collectItems(menuData);
    return { groups: filteredGroups, favItems: allItems.filter(item => favorites.includes(item.menuNo)) };
  }, [menuData, searchTerm, favorites]);

  const renderAppTile = (item: MenuNode, context: 'fav' | 'group') => {
    const Icon = (LucideIcons as any)[item.iconName || "LayoutDashboard"] || LucideIcons.LayoutDashboard;
    return (
      <motion.button
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        key={`${context}-${item.menuNo}`}
        onClick={() => handleTileClick(item)}
        className="group relative flex flex-col items-center justify-center p-6 bg-[var(--color-card-bg)] rounded-xl border border-[var(--color-border-subtle)] shadow-sm hover:border-[var(--color-sap-blue)] transition-all"
      >
        <div onClick={(e) => toggleFavorite(e, item.menuNo)} className="absolute top-2 right-2 p-1 cursor-pointer">
          <Star size={18} className={`${favorites.includes(item.menuNo) ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-[var(--color-border-subtle)]'}`} />
        </div>
        <div className="p-3 rounded-full bg-[var(--color-background)] text-[var(--color-sap-blue)] mb-3 group-hover:bg-[var(--color-sap-blue)] group-hover:text-white transition-all">
          <Icon size={24} />
        </div>
        <span className="text-xs font-medium text-[var(--color-foreground)] text-center line-clamp-2">{item.menuName}</span>
      </motion.button>
    );
  };

  if (!menuData) return <div className="p-8 text-center text-[var(--color-foreground)]">Loading...</div>;

  return (
    <div className="p-8 bg-[var(--color-background)] transition-colors min-h-screen">
      {activeGroup ? (
        <div className="mb-8">
          <button 
            onClick={() => { setActiveGroup(null); setBreadcrumbs(["Home"]); }}
            className="flex items-center gap-2 text-[var(--color-sap-blue)] font-semibold hover:underline"
          >
            <ArrowLeft size={20} /> Quay lại
          </button>
          <h2 className="text-2xl font-bold mt-4 text-[var(--color-foreground)]">{activeGroup.menuName}</h2>
        </div>
      ) : (
        <input
          placeholder="Tìm kiếm chức năng..."
          className="mb-8 w-full max-w-md px-4 py-2 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-input-bg)] text-[var(--color-foreground)] outline-none focus:ring-1 focus:ring-[var(--color-sap-blue)]"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}
      
      {activeGroup ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {activeGroup.children?.map((child) => renderAppTile(child, 'group'))}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {favItems.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" /> Favorites
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {favItems.map(item => renderAppTile(item, 'fav'))}
                </div>
              </div>
            )}
            {groups.map(group => (
              <div key={group.menuNo} className="mb-10">
                <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
                  <LayoutGrid size={20} className="text-[var(--color-sap-blue)]" /> {group.menuName}
                </h3>
                {group.children?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {group.children?.map((child) => renderAppTile(child, 'group'))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)] italic">Không có ứng dụng con</p>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};