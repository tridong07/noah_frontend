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
  size:'normal' | 'small';
  variant?: 'grid' | 'list';
}

export const AppTile = ({ item, context, isFavorite, onTileClick, onToggleFavorite, size, variant }: AppTileProps) => {
  const Icon = (LucideIcons as any)[item.iconName || "LayoutDashboard"] || LucideIcons.LayoutDashboard;

  if (variant === 'list') {
    return (
      <motion.button
        layout
        onClick={() => onTileClick(item)}
        className="flex items-center gap-3 p-2 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border-subtle)] shadow-sm hover:border-[var(--color-sap-blue)] transition-all text-left hover:bg-[var(--color-sap-blue)]/5"
      >
        <div className="p-2 rounded-lg bg-[var(--color-background)] text-[var(--color-sap-blue)]">
          <Icon size={16} />
        </div>
        <span className="text-xs font-medium text-[var(--color-foreground)] truncate">{item.menuName}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      key={`${context}-${item.menuNo}`}
      onClick={() => onTileClick(item)}
      className={`group relative flex flex-col items-center justify-center ${size === 'small' ? 'p-4' : 'p-6'} bg-[var(--color-card-bg)] rounded-xl border border-[var(--color-border-subtle)] shadow-sm hover:border-[var(--color-sap-blue)] transition-all cursor-pointer`}
    >
      <div onClick={(e) => onToggleFavorite(e, item.menuNo)} className="absolute top-2 right-2 p-1 cursor-pointer">
        <Star size={18} className={`${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-[var(--color-border-subtle)]'}`} />
      </div>
      
      <div className={`p-3 rounded-full bg-[var(--color-background)] text-[var(--color-sap-blue)] mb-2 group-hover:bg-[var(--color-sap-blue)] group-hover:text-white transition-all ${size === 'small' ? 'p-2' : 'p-3'}`}>
        <Icon size={size === 'small' ? 18 : 24} />
      </div>
      
      <span className="text-xs font-medium text-[var(--color-foreground)] text-center line-clamp-2">{item.menuName}</span>
    </motion.button>
  );
};