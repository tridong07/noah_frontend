"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, ArrowLeft, Star } from "lucide-react";
import { AppTile } from "./AppTile";
import { SearchBar } from "./SearchBar";
import { useLaunchpad } from "../hooks/useLaunchpad";

export const Launchpad = ({ menuData }: { menuData: any[] | undefined }) => {
  const [searchTerm, setSearchTerm] = useState("");
  // Lấy các giá trị mới từ hook
  const { 
    groups, displayItems, favItems, favorites, activeGroup, stack, popStack,
    handleTileClick, toggleFavorite 
  } = useLaunchpad(menuData, searchTerm);

  return (
    <div className="p-8">
      {/* HEADER: Thay đổi dựa trên việc đang ở cấp nào trong stack */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        {stack.length > 0 ? (
          <div className="mb-8">
            <button onClick={popStack}  className="flex items-center gap-2 text-[#0a6ed1] font-semibold hover:underline">
              <ArrowLeft size={20} /> Quay lại
            </button>
            <h2 className="text-2xl font-bold mt-4 text-slate-800">{activeGroup?.menuName}</h2>
          </div>
        ) : null}
        <div className="w-full md:max-w-md ml-auto">
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      {/* NỘI DUNG: Drill-down dựa trên stack */}
      <AnimatePresence mode="wait">
        {activeGroup ? (
          <motion.div 
            key={activeGroup ? "sub-level" : "root-level"}
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }} 
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayItems.map(c => (
                  <AppTile 
                    key={`group-${c.menuNo}`} 
                    item={c} 
                    context="group" 
                    isFavorite={favorites.includes(c.menuNo)} 
                    onTileClick={handleTileClick} 
                    onToggleFavorite={toggleFavorite} 
                    size="small"
                    variant="list"
                  />
                ))}
         </div>
            
          </motion.div>
        ) : (
          <motion.div 
            key="root-level"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {favItems.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" /> Favorites
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {favItems.map(i => (
                    <AppTile key={`fav-${i.menuNo}`} item={i} size="small" context="fav" isFavorite={true} onTileClick={handleTileClick} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              </div>
            )}
            
            {groups.filter(g => g.menuName.toLowerCase().includes(searchTerm.toLowerCase())).map(g => (
              <div key={g.menuNo} className="mb-10">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <LayoutGrid size={20} className="text-[#0a6ed1]" /> {g.menuName}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {g.children?.map(c => (
                    <AppTile key={`group-${c.menuNo}`} item={c} size="normal" context="group" isFavorite={favorites.includes(c.menuNo)} onTileClick={handleTileClick} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};