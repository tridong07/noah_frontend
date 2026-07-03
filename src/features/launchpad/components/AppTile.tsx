"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { MenuNode } from "@/hooks/useMenuData";

interface AppTileProps {
  item: MenuNode;
  context: 'fav' | 'group';
  isFavorite: boolean;
  onTileClick: (item: MenuNode) => void;
  onToggleFavorite: (e: React.MouseEvent, menuNo: string) => void;
}

export const AppTile = ({ item, context, isFavorite, onTileClick, onToggleFavorite }: AppTileProps) => {
  const Icon = (LucideIcons as any)[item.iconName || "LayoutDashboard"] || LucideIcons.LayoutDashboard;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      key={`${context}-${item.menuNo}`}
      onClick={() => onTileClick(item)}
      className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#0a6ed1] transition-all cursor-pointer"
    >
      <div onClick={(e) => onToggleFavorite(e, item.menuNo)} className="absolute top-2 right-2 p-1 cursor-pointer">
        <Star size={18} className={`${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-slate-300'}`} />
      </div>
      <div className="p-3 rounded-full bg-slate-50 text-[#0a6ed1] mb-3 group-hover:bg-[#0a6ed1] group-hover:text-white transition-all">
        <Icon size={24} />
      </div>
      <span className="text-xs font-medium text-slate-600 text-center line-clamp-2">{item.menuName}</span>
    </motion.button>
  );
};